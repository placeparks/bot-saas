import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { exec as execCallback } from 'node:child_process'
import { promisify } from 'node:util'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

const exec = promisify(execCallback)

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

    const template = process.env.OPENCLAW_PAIRING_EXEC_COMMAND
    if (!template || !template.includes('{command}')) {
      return NextResponse.json(
        { error: 'Pairing exec command not configured' },
        { status: 501 }
      )
    }

    const pairingCommand = `openclaw pairing approve ${channel} ${code}`
    const execCommand = template
      .replaceAll('{serviceId}', user.instance.containerId)
      .replaceAll('{serviceName}', user.instance.containerName || '')
      .replaceAll('{projectId}', process.env.RAILWAY_PROJECT_ID || '')
      .replaceAll('{environmentId}', process.env.RAILWAY_ENVIRONMENT_ID || '')
      .replaceAll('{token}', process.env.RAILWAY_TOKEN || '')
      .replaceAll('{command}', pairingCommand)

    console.log('[Pairing] Executing command:', execCommand.replace(process.env.RAILWAY_TOKEN || '', '***TOKEN***'))

    const { stdout, stderr } = await exec(execCommand, {
      timeout: 30_000,
      windowsHide: true,
      maxBuffer: 1024 * 1024,
      env: {
        ...process.env,
        RAILWAY_TOKEN: process.env.RAILWAY_TOKEN
      }
    })

    if (stderr && stderr.trim().length > 0) {
      console.warn('Pairing stderr:', stderr)
    }

    return NextResponse.json({
      success: true,
      message: 'Pairing approved'
    })

  } catch (error: any) {
    console.error('Pairing approve error:', error)
    return NextResponse.json(
      { error: error.message || 'Pairing failed' },
      { status: 500 }
    )
  }
}
