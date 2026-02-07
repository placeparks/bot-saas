import { RailwayClient } from './client'
import { prisma } from '@/lib/prisma'
import { allocatePort } from '@/lib/utils/port-allocator'
import {
  generateOpenClawConfig,
  buildEnvironmentVariables,
  UserConfiguration,
} from '@/lib/openclaw/config-builder'
import { InstanceStatus } from '@prisma/client'

const OPENCLAW_IMAGE = process.env.OPENCLAW_IMAGE || 'ghcr.io/openclaw/openclaw:latest'

// Minimal Node HTTP server that wraps `openclaw pairing` CLI commands.
// Runs on port 18800 inside the container alongside OpenClaw (port 18789).
const PAIRING_SERVER_JS = `
const http = require('http');
const { spawnSync } = require('child_process');

function send(res, code, data) {
  const payload = JSON.stringify(data);
  res.writeHead(code, { 'Content-Type': 'application/json' });
  res.end(payload);
}

function readBody(req, cb) {
  let buf = '';
  req.on('data', (c) => { buf += c; });
  req.on('end', () => {
    try { cb(null, buf ? JSON.parse(buf) : {}); }
    catch (e) { cb(e); }
  });
}

const server = http.createServer((req, res) => {
  console.log('[pairing-server]', req.method, req.url);

  if (req.method === 'GET' && req.url === '/health') {
    return send(res, 200, { status: 'ok' });
  }

  if (req.method === 'GET' && req.url && req.url.startsWith('/pairing/list/')) {
    const ch = req.url.split('/').pop();
    const r = spawnSync('openclaw', ['pairing', 'list', ch], { encoding: 'utf8', timeout: 10000 });
    return send(res, 200, { success: r.status === 0, raw: r.stdout || '', requests: [] });
  }

  if (req.method === 'POST' && req.url === '/pairing/approve') {
    return readBody(req, (err, body) => {
      if (err) return send(res, 400, { success: false, message: 'Invalid JSON' });
      const ch = body.channel || '';
      const code = body.code || '';
      if (!ch || !code) return send(res, 400, { success: false, message: 'Missing channel or code' });
      console.log('[pairing-server] approving', ch, code);
      const r = spawnSync('openclaw', ['pairing', 'approve', ch, code], { encoding: 'utf8', timeout: 15000 });
      const ok = r.status === 0;
      console.log('[pairing-server] result:', ok ? 'success' : 'failed', r.stdout, r.stderr);
      return send(res, ok ? 200 : 500, {
        success: ok,
        output: r.stdout || '',
        message: ok ? 'Pairing approved successfully' : (r.stderr || 'Pairing failed')
      });
    });
  }

  res.writeHead(404);
  res.end();
});

// Listen on both IPv4 and IPv6 (Railway internal networking uses IPv6)
server.listen(18800, () => {
  console.log('[pairing-server] listening on port 18800 (dual-stack)');
});
`.trim()

/** Base64-encoded pairing server script for embedding in container env vars. */
export const PAIRING_SCRIPT_B64 = Buffer.from(PAIRING_SERVER_JS).toString('base64')

/** Build the start command that runs both the pairing server and OpenClaw. */
export function buildStartCommand(): string {
  const openclawCmd = process.env.OPENCLAW_CMD || 'openclaw'
  const configDir = '/tmp/.openclaw'
  return [
    `mkdir -p ${configDir}`,
    `printf '%s' "$OPENCLAW_CONFIG" > ${configDir}/openclaw.json`,
    // Decode and save pairing server
    `printf '%s' "$_PAIRING_SCRIPT_B64" | base64 -d > /tmp/pairing-server.js`,
    // Start pairing server in background (logs to stdout, will appear in Railway logs)
    `node /tmp/pairing-server.js &`,
    // Give it a moment to bind to port
    `sleep 1`,
    // Start OpenClaw
    `exec ${openclawCmd} --config ${configDir}/openclaw.json`,
  ].join(' && ')
}

const POLL_INTERVAL_MS = 3000
const DEPLOY_TIMEOUT_MS = 120_000 // 2 minutes
const RAILWAY_COOLDOWN_MAX_MS = 180_000 // 3 minutes
const RAILWAY_COOLDOWN_BASE_DELAY_MS = 5000

interface DeploymentResult {
  instanceId: string
  containerId: string   // Railway service ID
  containerName: string
  port: number          // Unique DB value; not an actual network port
  accessUrl: string     // Railway-assigned public URL
  status: string
}

export async function deployInstance(
  userId: string,
  config: UserConfiguration
): Promise<DeploymentResult> {
  const railway = new RailwayClient()
  const serviceName = `openclaw-${userId}`

  // --- Clean up any pre-existing instance ---
  const existing = await prisma.instance.findUnique({ where: { userId } })
  if (existing) {
    console.log(`⚠️  Cleaning up existing DB instance for user ${userId}...`)
    try {
      if (existing.containerId) {
        await railway.deleteService(existing.containerId)
      }
      await prisma.instance.delete({ where: { id: existing.id } })
      console.log('✅ DB instance cleaned up')
    } catch (err) {
      console.warn('⚠️  DB cleanup error (continuing):', err)
    }
  }

  // --- Also clean up orphaned Railway service by name (in case previous deploy failed mid-way) ---
  try {
    const orphanedServiceId = await railway.findServiceByName(serviceName)
    if (orphanedServiceId) {
      console.log(`⚠️  Found orphaned Railway service ${serviceName}, deleting...`)
      await railway.deleteService(orphanedServiceId)
      console.log('✅ Orphaned service deleted')
    }
  } catch (err) {
    console.warn('⚠️  Orphan cleanup error (continuing):', err)
  }

  // --- Create placeholder DB record ---
  const port = await allocatePort()
  const instance = await prisma.instance.create({
    data: {
      userId,
      containerId: null,  // filled in after Railway service is created
      containerName: serviceName,
      port,
      status: InstanceStatus.DEPLOYING,
    },
  })

  await logDeployment(instance.id, 'DEPLOY', 'IN_PROGRESS', 'Creating Railway service...')

  try {
  // --- Build env vars for the OpenClaw container ---
  const envVars = buildEnvironmentVariables(config)
  const openclawConfig = generateOpenClawConfig(config)
  // Serialized config; the start command writes it to the expected file path
  envVars.OPENCLAW_CONFIG = JSON.stringify(openclawConfig)
  // Gateway token required by OpenClaw (generate a random one per instance)
  envVars.OPENCLAW_GATEWAY_TOKEN = crypto.randomUUID()
  // Pairing server script — decoded + launched by the start command
  envVars._PAIRING_SCRIPT_B64 = PAIRING_SCRIPT_B64
  validateOpenClawEnv(config, envVars)

    // --- Create Railway service (image + env vars, auto-deploys) ---
    const { id: serviceId } = await railway.createService(
      serviceName,
      OPENCLAW_IMAGE,
      envVars
    )

    // Persist the Railway service ID immediately
    try {
      await prisma.instance.update({
        where: { id: instance.id },
        data: { containerId: serviceId },
      })
    } catch (err) {
      console.warn('⚠️  Failed to persist containerId (will retry later):', err)
    }

    // --- Override start command so the config JSON is written before OpenClaw starts ---
    // Also starts a lightweight pairing HTTP server on port 18800 (Python3).
    // NOTE: Railway runs containers as non-root, so we use /tmp instead of /root
    const startCmd = buildStartCommand()

    try {
      await retryRailwayCooldown(
        () => railway.updateServiceInstance(serviceId, { startCommand: startCmd }),
        'updateServiceInstance'
      )
    } catch (error: any) {
      console.warn('[Railway] Failed to update start command:', error.message)
      console.warn('[Railway] Continuing with default command (may cause issues)')
    }

    // Do not force a redeploy or wait for it here; Railway will deploy in its own time.
    // Railway private networking uses plain HTTP (no TLS)
    const serviceUrl = `http://${serviceName}.railway.internal:18789`

    await prisma.instance.update({
      where: { id: instance.id },
      data: {
        status: InstanceStatus.DEPLOYING,
        accessUrl: null,
        serviceUrl,
        containerId: serviceId
      },
    })

    await logDeployment(instance.id, 'DEPLOY', 'QUEUED', 'Deployment queued (Railway-managed)')

    return {
      instanceId: instance.id,
      containerId: serviceId,
      containerName: serviceName,
      port,
      accessUrl: '',
      status: 'DEPLOYING',
    }
  } catch (error: any) {
    await prisma.instance.update({
      where: { id: instance.id },
      data: { status: InstanceStatus.ERROR },
    })

    await logDeployment(instance.id, 'DEPLOY', 'FAILED', 'Deployment failed', error.message)
    throw new Error(`Deployment failed: ${error.message}`)
  }
}

function validateOpenClawEnv(
  config: UserConfiguration,
  envVars: Record<string, string>
) {
  const errors: string[] = []

  if (!envVars.OPENCLAW_CONFIG || envVars.OPENCLAW_CONFIG.length < 10) {
    errors.push('OPENCLAW_CONFIG is missing or too small')
  }

  if (config.provider === 'OPENAI' && !envVars.OPENAI_API_KEY) {
    errors.push('OPENAI_API_KEY is missing')
  }

  if (config.provider === 'ANTHROPIC' && !envVars.ANTHROPIC_API_KEY) {
    errors.push('ANTHROPIC_API_KEY is missing')
  }

  const hasTelegram = config.channels.some(c => c.type === 'TELEGRAM')
  if (hasTelegram && !envVars.TELEGRAM_BOT_TOKEN) {
    errors.push('TELEGRAM_BOT_TOKEN is missing')
  }

  if (errors.length) {
    throw new Error(`[Deploy] Invalid config/env: ${errors.join('; ')}`)
  }
}

async function retryRailwayCooldown<T>(
  fn: () => Promise<T>,
  label: string
): Promise<T> {
  const startedAt = Date.now()
  let attempt = 0

  while (true) {
    try {
      return await fn()
    } catch (error: any) {
      const message = String(error?.message || '').toLowerCase()
      const isCooldown =
        message.includes('too recently updated') ||
        message.includes('rate limit') ||
        message.includes('rate limited')

      const is400Error =
        message.includes('http 400') ||
        message.includes('problem processing request')

      // If it's a 400 error, retry a few times with delays
      if (is400Error && attempt < 3) {
        attempt += 1
        const delay = 2000 * attempt
        console.warn(
          `[Railway] ${label} got 400 error; retry ${attempt}/3 in ${delay}ms`
        )
        await sleep(delay)
        continue
      }

      if (!isCooldown && !is400Error) throw error

      const elapsed = Date.now() - startedAt
      if (elapsed >= RAILWAY_COOLDOWN_MAX_MS) {
        throw new Error(`[Railway] ${label} blocked by cooldown/errors for >3 minutes`)
      }

      attempt += 1
      const delay = Math.min(
        RAILWAY_COOLDOWN_BASE_DELAY_MS * attempt,
        20_000
      )
      console.warn(
        `[Railway] ${label} blocked by cooldown; retry ${attempt} in ${delay}ms`
      )
      await sleep(delay)
    }
  }
}

/**
 * Poll Railway until the latest deployment reaches a terminal state.
 * Returns the public URL on SUCCESS.
 */
async function waitForDeployment(
  railway: RailwayClient,
  serviceId: string
): Promise<string> {
  const deadline = Date.now() + DEPLOY_TIMEOUT_MS

  while (Date.now() < deadline) {
    const deployment = await railway.getLatestDeployment(serviceId)

    if (!deployment) {
      await sleep(POLL_INTERVAL_MS)
      continue
    }

    console.log(`  [Railway] deployment ${deployment.id} → ${deployment.status}`)

    switch (deployment.status) {
      case 'SUCCESS':
        return deployment.url || ''

      case 'FAILED':
      case 'CRASHED': {
        let logSnippet = ''
        try {
          const logs = await railway.getLogs(deployment.id, 30)
          logSnippet = logs.map(l => `[${l.severity}] ${l.message}`).join('\n')
        } catch { /* best-effort */ }
        throw new Error(`Railway deployment ${deployment.status}.\n${logSnippet}`)
      }
    }

    // BUILDING / DEPLOYING / other transient states — keep polling
    await sleep(POLL_INTERVAL_MS)
  }

  throw new Error('Deployment timed out (2 min)')
}

async function ensureContainerId(
  railway: RailwayClient,
  instance: { id: string; containerId: string | null; containerName: string | null }
): Promise<string> {
  if (instance.containerId) return instance.containerId
  if (!instance.containerName) throw new Error('Instance has no container name')

  const found = await railway.findServiceByName(instance.containerName)
  if (!found) throw new Error('Railway service not found for instance')

  await prisma.instance.update({
    where: { id: instance.id },
    data: { containerId: found },
  })

  return found
}

export async function stopInstance(instanceId: string): Promise<void> {
  const instance = await prisma.instance.findUnique({ where: { id: instanceId } })
  if (!instance) throw new Error('Instance not found')

  const railway = new RailwayClient()
  const containerId = await ensureContainerId(railway, instance)
  const deployment = await railway.getLatestDeployment(containerId)
  if (!deployment) throw new Error('No active deployment found')

  await railway.removeDeployment(deployment.id)

  await prisma.instance.update({
    where: { id: instanceId },
    data: { status: InstanceStatus.STOPPED },
  })

  await logDeployment(instanceId, 'STOP', 'SUCCESS', 'Instance stopped')
}

export async function startInstance(instanceId: string): Promise<void> {
  const instance = await prisma.instance.findUnique({ where: { id: instanceId } })
  if (!instance) throw new Error('Instance not found')

  const railway = new RailwayClient()
  const containerId = await ensureContainerId(railway, instance)
  await railway.redeployService(containerId)

  await prisma.instance.update({
    where: { id: instanceId },
    data: { status: InstanceStatus.RUNNING },
  })

  await logDeployment(instanceId, 'START', 'SUCCESS', 'Instance started')
}

export async function restartInstance(instanceId: string): Promise<void> {
  const instance = await prisma.instance.findUnique({ where: { id: instanceId } })
  if (!instance) throw new Error('Instance not found')

  await prisma.instance.update({
    where: { id: instanceId },
    data: { status: InstanceStatus.RESTARTING },
  })

  const railway = new RailwayClient()
  const containerId = await ensureContainerId(railway, instance)
  const deployment = await railway.getLatestDeployment(containerId)

  if (deployment && deployment.status === 'SUCCESS') {
    await railway.restartDeployment(deployment.id)
  } else {
    await railway.redeployService(containerId)
  }

  await prisma.instance.update({
    where: { id: instanceId },
    data: { status: InstanceStatus.RUNNING },
  })

  await logDeployment(instanceId, 'RESTART', 'SUCCESS', 'Instance restarted')
}

export async function getInstanceLogs(instanceId: string, tail = 100): Promise<string> {
  const instance = await prisma.instance.findUnique({ where: { id: instanceId } })
  if (!instance) throw new Error('Instance not found')

  const railway = new RailwayClient()
  const containerId = await ensureContainerId(railway, instance)
  const deployment = await railway.getLatestDeployment(containerId)
  if (!deployment) return 'No deployments found.'

  const logs = await railway.getLogs(deployment.id, tail)
  return logs.map(l => `[${l.timestamp}] [${l.severity}] ${l.message}`).join('\n')
}

export async function checkInstanceHealth(instanceId: string): Promise<boolean> {
  try {
    const instance = await prisma.instance.findUnique({ where: { id: instanceId } })
    if (!instance) return false

    const railway = new RailwayClient()
    const containerId = await ensureContainerId(railway, instance)
    const deployment = await railway.getLatestDeployment(containerId)
    const isHealthy = deployment?.status === 'SUCCESS'

    await prisma.instance.update({
      where: { id: instanceId },
      data: {
        lastHealthCheck: new Date(),
        status: isHealthy ? InstanceStatus.RUNNING : InstanceStatus.ERROR,
      },
    })

    return isHealthy
  } catch {
    return false
  }
}

async function logDeployment(
  instanceId: string,
  action: string,
  status: string,
  message: string,
  error?: string
): Promise<void> {
  await prisma.deploymentLog.create({
    data: { instanceId, action, status, message, error },
  })
}

function sleep(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms))
}
