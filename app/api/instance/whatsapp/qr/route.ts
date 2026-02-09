import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { RailwayClient } from '@/lib/railway/client'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function POST() {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      include: { instance: true }
    })

    if (!user?.instance) {
      return NextResponse.json({ error: 'No instance found' }, { status: 404 })
    }

    const serviceName = user.instance.containerName
    const serviceUrl = user.instance.serviceUrl
    const serviceId = user.instance.containerId

    let host = ''
    if (serviceName) {
      host = `${serviceName}.railway.internal`
    } else if (serviceUrl) {
      try {
        const parsed = new URL(serviceUrl)
        host = parsed.hostname
      } catch {
        host = ''
      }
    }

    if (!host && serviceId) {
      try {
        const railway = new RailwayClient()
        const resolvedName = await railway.getServiceName(serviceId)
        if (resolvedName) host = `${resolvedName}.railway.internal`
      } catch {
        host = host
      }
    }

    if (!host) {
      return NextResponse.json({ error: 'Instance has no service host' }, { status: 400 })
    }

    const url = `http://${host}:18800/whatsapp/qr`
    let response: Response
    try {
      response = await fetch(url, {
        method: 'POST',
        signal: AbortSignal.timeout(25000)
      })
    } catch (error: any) {
      return NextResponse.json(
        { error: error.message || 'Failed to reach instance', url },
        { status: 502 }
      )
    }

    const text = await response.text()
    let result: any
    try {
      result = JSON.parse(text)
    } catch {
      result = { success: false, raw: text }
    }

    if (!response.ok || !result?.success) {
      return NextResponse.json(
        { error: result?.error || 'Failed to generate WhatsApp QR', raw: result?.raw || text },
        { status: 502 }
      )
    }

    return NextResponse.json({
      success: true,
      qr: result?.qr || null,
      raw: result?.raw || ''
    })
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to generate WhatsApp QR' },
      { status: 500 }
    )
  }
}
