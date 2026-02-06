import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { approvePairing } from '@/lib/railway/graphql'

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

    // Check if custom image with pairing API is deployed
    const pairingApiUrl = user.instance.serviceUrl
      ? `${user.instance.serviceUrl.replace('18789', '18800')}/pairing/approve`
      : null

    // Try automated approval if pairing API is available
    if (pairingApiUrl) {
      try {
        const response = await fetch(pairingApiUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ channel, code }),
          signal: AbortSignal.timeout(5000) // 5 second timeout
        })

        const result = await response.json()

        if (response.ok) {
          return NextResponse.json({
            success: true,
            message: result.message || 'Pairing approved successfully',
            output: result.output,
            cliCommand
          })
        }
      } catch (error: any) {
        console.log('[Pairing] Automated approval failed, showing CLI fallback:', error.message)
        // Fall through to CLI fallback
      }
    }

    // Try Railway GraphQL exec as second method
    const railwayToken = process.env.RAILWAY_TOKEN
    if (railwayToken && user.instance.containerId) {
      try {
        const execResult = await approvePairing({
          serviceId: user.instance.containerId,
          channel,
          code,
          railwayToken
        })

        if (execResult.success) {
          return NextResponse.json({
            success: true,
            message: 'Pairing approved successfully',
            output: execResult.output,
            cliCommand
          })
        }

        console.log('[Pairing] Railway GraphQL exec failed:', execResult.error)
      } catch (error: any) {
        console.log('[Pairing] Railway GraphQL exec error:', error.message)
      }
    }

    // Return CLI command for manual approval (last resort)
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
