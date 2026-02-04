import Docker from 'dockerode'
import { prisma } from '@/lib/prisma'
import { allocatePort } from '@/lib/utils/port-allocator'
import { generateOpenClawConfig, buildEnvironmentVariables, UserConfiguration } from '@/lib/openclaw/config-builder'
import { InstanceStatus } from '@prisma/client'

// Configure Docker connection for Windows or Linux
// Dockerode handles npipe: URLs natively, no need to parse
const docker = new Docker()

interface DeploymentResult {
  instanceId: string
  containerId: string
  containerName: string
  port: number
  accessUrl: string
  status: string
}

export async function deployInstance(
  userId: string,
  config: UserConfiguration
): Promise<DeploymentResult> {
  try {
    // 1. Check if instance already exists and clean it up
    const existingInstance = await prisma.instance.findUnique({
      where: { userId },
      include: { config: true }
    })

    if (existingInstance) {
      console.log(`⚠️  Instance already exists for user ${userId}, cleaning up...`)

      try {
        // Stop and remove existing container
        const oldContainer = docker.getContainer(existingInstance.containerId)
        await oldContainer.stop().catch(() => {}) // Ignore if already stopped
        await oldContainer.remove().catch(() => {}) // Ignore if already removed

        // Delete from database (cascade will delete config and logs)
        await prisma.instance.delete({
          where: { id: existingInstance.id }
        })

        console.log(`✅ Cleaned up existing instance`)
      } catch (cleanupError) {
        console.warn('⚠️  Error during cleanup (continuing anyway):', cleanupError)
      }
    }

    // 2. Allocate port
    const port = await allocatePort()
    const containerName = `openclaw-${userId}`

    // 3. Generate OpenClaw configuration
    const openclawConfig = generateOpenClawConfig(config)
    const envVars = buildEnvironmentVariables(config)

    // 4. Create instance record
    const instance = await prisma.instance.create({
      data: {
        userId,
        containerId: '', // Will update after container creation
        containerName,
        port,
        status: InstanceStatus.DEPLOYING,
        accessUrl: `${process.env.INSTANCE_BASE_URL}:${port}`
      }
    })

    // Log deployment start
    await logDeployment(instance.id, 'DEPLOY', 'IN_PROGRESS', 'Starting deployment...')

    // 5. Pull OpenClaw image
    await pullImage('ghcr.io/openclaw/openclaw:latest')

    // 6. Create volume for data persistence
    const volumeName = `openclaw-${userId}-data`
    await createVolume(volumeName)

    // 7. Build environment variables array
    const envArray = Object.entries(envVars).map(([key, value]) => `${key}=${value}`)

    // 8. Create and start container
    const container = await docker.createContainer({
      Image: 'ghcr.io/openclaw/openclaw:latest',
      name: containerName,
      Env: envArray,
      ExposedPorts: {
        '18789/tcp': {}
      },
      HostConfig: {
        PortBindings: {
          '18789/tcp': [{ HostPort: port.toString() }]
        },
        Binds: [
          `${volumeName}:/root/.openclaw`
        ],
        RestartPolicy: {
          Name: 'unless-stopped'
        },
        NetworkMode: process.env.DOCKER_NETWORK || 'bridge'
      }
    })

    // 9. Write config file to container
    await writeConfigToContainer(container.id, openclawConfig)

    // 10. Start container
    await container.start()

    // 11. Update instance with container ID
    await prisma.instance.update({
      where: { id: instance.id },
      data: {
        containerId: container.id,
        status: InstanceStatus.RUNNING
      }
    })

    // 12. Wait for container to be healthy
    await waitForHealthy(container.id, 60000)

    // Log deployment success
    await logDeployment(instance.id, 'DEPLOY', 'SUCCESS', 'Deployment completed successfully')

    return {
      instanceId: instance.id,
      containerId: container.id,
      containerName,
      port,
      accessUrl: `${process.env.INSTANCE_BASE_URL}:${port}`,
      status: 'RUNNING'
    }

  } catch (error: any) {
    console.error('Deployment error:', error)

    // Log deployment failure
    if (error.instanceId) {
      await logDeployment(error.instanceId, 'DEPLOY', 'FAILED', 'Deployment failed', error.message)
    }

    throw new Error(`Deployment failed: ${error.message}`)
  }
}

async function pullImage(imageName: string): Promise<void> {
  return new Promise((resolve, reject) => {
    docker.pull(imageName, (err: any, stream: any) => {
      if (err) return reject(err)

      docker.modem.followProgress(stream, (err: any) => {
        if (err) return reject(err)
        resolve()
      })
    })
  })
}

async function createVolume(volumeName: string): Promise<void> {
  try {
    await docker.createVolume({ Name: volumeName })
  } catch (error: any) {
    // Volume might already exist
    if (!error.message.includes('already exists')) {
      throw error
    }
  }
}

async function writeConfigToContainer(containerId: string, config: any): Promise<void> {
  const container = docker.getContainer(containerId)

  // Create config directory
  await container.exec({
    Cmd: ['mkdir', '-p', '/root/.openclaw'],
    AttachStdout: true,
    AttachStderr: true
  })

  // Write config file
  const configJson = JSON.stringify(config, null, 2)
  await container.exec({
    Cmd: ['sh', '-c', `echo '${configJson}' > /root/.openclaw/openclaw.json`],
    AttachStdout: true,
    AttachStderr: true
  })
}

async function waitForHealthy(containerId: string, timeout: number = 60000): Promise<void> {
  const startTime = Date.now()
  const container = docker.getContainer(containerId)

  while (Date.now() - startTime < timeout) {
    try {
      const info = await container.inspect()
      if (info.State.Running && info.State.Health?.Status === 'healthy') {
        return
      }
    } catch (error) {
      // Container might not be ready yet
    }

    await new Promise(resolve => setTimeout(resolve, 2000))
  }

  throw new Error('Container health check timeout')
}

export async function stopInstance(instanceId: string): Promise<void> {
  const instance = await prisma.instance.findUnique({
    where: { id: instanceId }
  })

  if (!instance) {
    throw new Error('Instance not found')
  }

  const container = docker.getContainer(instance.containerId)
  await container.stop()

  await prisma.instance.update({
    where: { id: instanceId },
    data: { status: InstanceStatus.STOPPED }
  })

  await logDeployment(instanceId, 'STOP', 'SUCCESS', 'Instance stopped')
}

export async function startInstance(instanceId: string): Promise<void> {
  const instance = await prisma.instance.findUnique({
    where: { id: instanceId }
  })

  if (!instance) {
    throw new Error('Instance not found')
  }

  const container = docker.getContainer(instance.containerId)
  await container.start()

  await prisma.instance.update({
    where: { id: instanceId },
    data: { status: InstanceStatus.RUNNING }
  })

  await logDeployment(instanceId, 'START', 'SUCCESS', 'Instance started')
}

export async function restartInstance(instanceId: string): Promise<void> {
  const instance = await prisma.instance.findUnique({
    where: { id: instanceId }
  })

  if (!instance) {
    throw new Error('Instance not found')
  }

  await prisma.instance.update({
    where: { id: instanceId },
    data: { status: InstanceStatus.RESTARTING }
  })

  const container = docker.getContainer(instance.containerId)
  await container.restart()

  await prisma.instance.update({
    where: { id: instanceId },
    data: { status: InstanceStatus.RUNNING }
  })

  await logDeployment(instanceId, 'RESTART', 'SUCCESS', 'Instance restarted')
}

export async function getInstanceLogs(instanceId: string, tail: number = 100): Promise<string> {
  const instance = await prisma.instance.findUnique({
    where: { id: instanceId }
  })

  if (!instance) {
    throw new Error('Instance not found')
  }

  const container = docker.getContainer(instance.containerId)
  const logs = await container.logs({
    stdout: true,
    stderr: true,
    tail
  })

  return logs.toString()
}

export async function checkInstanceHealth(instanceId: string): Promise<boolean> {
  try {
    const instance = await prisma.instance.findUnique({
      where: { id: instanceId }
    })

    if (!instance) return false

    const container = docker.getContainer(instance.containerId)
    const info = await container.inspect()

    const isHealthy = info.State.Running

    await prisma.instance.update({
      where: { id: instanceId },
      data: {
        lastHealthCheck: new Date(),
        status: isHealthy ? InstanceStatus.RUNNING : InstanceStatus.ERROR
      }
    })

    return isHealthy
  } catch (error) {
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
    data: {
      instanceId,
      action,
      status,
      message,
      error
    }
  })
}
