import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

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

    // Get the instance's pairing API URL
    // Assuming the service exposes port 18800 for our pairing API
    const pairingApiUrl = user.instance.serviceUrl
      ? `${user.instance.serviceUrl.replace('18789', '18800')}/pairing/approve`
      : null

    if (!pairingApiUrl) {
      return NextResponse.json(
        { error: 'Instance URL not configured' },
        { status: 400 }
      )
    }

    try {
      // Call the pairing API directly
      const response = await fetch(pairingApiUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ channel, code })
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'Pairing failed')
      }

      return NextResponse.json({
        success: true,
        message: result.message || 'Pairing approved successfully',
        output: result.output
      })
    } catch (error: any) {
      const cliCommand = `openclaw pairing approve ${channel} ${code}`
      return NextResponse.json(
        {
          error: error.message || 'Failed to connect to OpenClaw instance',
          cliCommand,
          fallbackMessage: 'Automated approval failed. Use the CLI command as fallback.'
        },
        { status: 500 }
      )
    }

  } catch (error: any) {
    console.error('Pairing approve error:', error)
    return NextResponse.json(
      { error: error.message || 'Pairing failed' },
      { status: 500 }
    )
  }
}
