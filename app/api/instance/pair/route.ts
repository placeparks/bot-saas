import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { RailwayClient } from '@/lib/railway/client'
import { PAIRING_SCRIPT_B64, buildStartCommand } from '@/lib/railway/deploy'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

const CODE_PATTERN = /^[A-Za-z0-9_-]{2,32}$/
const CHANNELS = new Set(['telegram'])

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const body = await req.json().catch(() => ({}))
    const channel = String(body?.channel || '').toLowerCase()
    const code = String(body?.code || '').trim()
    const isRetry = Boolean(body?.retry)

    if (!CHANNELS.has(channel)) {
      return NextResponse.json(
        { error: 'Unsupported channel' },
        { status: 400 }
      )
    }

    if (!CODE_PATTERN.test(code)) {
      return NextResponse.json(
        { error: 'Invalid pairing code' },
        { status: 400 }
      )
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      include: { instance: true }
    })

    if (!user?.instance) {
      return NextResponse.json(
        { error: 'No instance found' },
        { status: 404 }
      )
    }

    if (!user.instance.containerId) {
      return NextResponse.json(
        { error: 'Instance has no Railway service ID' },
        { status: 400 }
      )
    }

    const cliCommand = `openclaw pairing approve ${channel} ${code}`

    // --- Method 1: Try the pairing HTTP server on port 18800 ---
    const pairingApiUrl = user.instance.serviceUrl
      ? `${user.instance.serviceUrl.replace('18789', '18800')}/pairing/approve`
      : null

    if (pairingApiUrl) {
      try {
        const response = await fetch(pairingApiUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ channel, code }),
          signal: AbortSignal.timeout(8000)
        })

        const result = await response.json()

        if (response.ok && result.success) {
          return NextResponse.json({
            success: true,
            message: result.message || 'Pairing approved successfully',
            output: result.output,
            cliCommand
          })
        }
      } catch (error: any) {
        console.log('[Pairing] HTTP to port 18800 failed:', error.message)
      }
    }

    // --- Method 2: Auto-upgrade instance with embedded pairing server ---
    // If this is NOT a retry, inject the pairing server into the start command
    // and redeploy so it's available on the next attempt.
    if (!isRetry) {
      try {
        console.log('[Pairing] Auto-upgrading instance to include pairing server...')
        const railway = new RailwayClient()
        const serviceId = user.instance.containerId

        // Add pairing script env var + update start command
        await railway.setVariables(serviceId, {
          _PAIRING_SCRIPT_B64: PAIRING_SCRIPT_B64
        })
        await railway.updateServiceInstance(serviceId, {
          startCommand: buildStartCommand()
        })
        console.log('[Pairing] Instance upgraded; Railway will redeploy in its own time.')

        return NextResponse.json({
          success: true,
          upgrading: true,
          cliCommand,
          message: 'Upgrading your instance for one-click pairing. Your bot will restart and be ready in ~45 seconds.'
        })
      } catch (error: any) {
        console.log('[Pairing] Auto-upgrade failed:', error.message)
      }
    }

    // --- Fallback: CLI instructions ---
    return NextResponse.json({
      success: true,
      cliCommand,
      message: 'Automatic pairing failed - use manual approval',
      instructions: [
        '1. Go to Railway Dashboard',
        '2. Open your OpenClaw service → Deployments',
        '3. Click active deployment → Terminal',
        '4. Run the command shown above'
      ]
    })

  } catch (error: any) {
    console.error('Pairing approve error:', error)
    return NextResponse.json(
      { error: error.message || 'Pairing failed' },
      { status: 500 }
    )
  }
}
