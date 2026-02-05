import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { exec as execCallback } from 'node:child_process'
import { promisify } from 'node:util'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

const exec = promisify(execCallback)

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

    const listCommand = `openclaw pairing list ${channel}`
    const cliCommand = listCommand

    // Try automated approach if configured
    const template = process.env.OPENCLAW_PAIRING_EXEC_COMMAND
    if (template && template.includes('{command}')) {
      try {
        const execCommand = template
          .replaceAll('{serviceId}', user.instance.containerId)
          .replaceAll('{serviceName}', user.instance.containerName || '')
          .replaceAll('{projectId}', process.env.RAILWAY_PROJECT_ID || '')
          .replaceAll('{environmentId}', process.env.RAILWAY_ENVIRONMENT_ID || '')
          .replaceAll('{token}', process.env.RAILWAY_TOKEN || '')
          .replaceAll('{command}', listCommand)

        console.log('[Pairing List] Executing:', execCommand.replace(process.env.RAILWAY_TOKEN || '', '***TOKEN***'))

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
          console.warn('Pairing list stderr:', stderr)
        }

        // Parse the output
        const lines = stdout.trim().split('\n').filter(line => line.trim())
        const requests = lines.map(line => {
          const match = line.match(/^(\S+)\s+-\s+user_id:(\d+)\s+-\s+expires:\s+(.+)$/)
          if (match) {
            return {
              code: match[1],
              userId: match[2],
              expires: match[3]
            }
          }
          return { raw: line }
        })

        return NextResponse.json({
          success: true,
          channel,
          requests,
          raw: stdout,
          cliCommand
        })
      } catch (error: any) {
        console.error('Automated list failed:', error)
        return NextResponse.json(
          {
            error: error.message || 'Failed to list pairing requests',
            output: error.stdout || error.stderr || '',
            cliCommand,
            fallbackMessage: 'Run this command in your Railway service terminal to list pending requests.'
          },
          { status: 500 }
        )
      }
    }

    // No automation configured
    return NextResponse.json(
      {
        error: 'Automated listing not configured',
        cliCommand,
        fallbackMessage: 'Run this command in your Railway service terminal to list pending requests.',
        requests: []
      },
      { status: 501 }
    )

  } catch (error: any) {
    console.error('Pairing list error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to list pairing requests' },
      { status: 500 }
    )
  }
}
