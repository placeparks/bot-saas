import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

const CHANNELS = new Set(['telegram'])

export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { searchParams } = new URL(req.url)
    const channel = (searchParams.get('channel') || 'telegram').toLowerCase()

    if (!CHANNELS.has(channel)) {
      return NextResponse.json(
        { error: 'Unsupported channel' },
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

    const cliCommand = `openclaw pairing list ${channel}`

    // Just return the CLI command - user will run it manually
    return NextResponse.json({
      success: true,
      cliCommand,
      channel,
      requests: [],
      message: 'Run this command in your Railway service terminal to see pending requests',
      instructions: [
        '1. Go to Railway Dashboard',
        '2. Open your OpenClaw service',
        '3. Go to Deployments → Active deployment → Terminal',
        '4. Run: openclaw pairing list telegram'
      ]
    })

  } catch (error: any) {
    console.error('Pairing list error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to list pairing requests' },
      { status: 500 }
    )
  }
}
