import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

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

    if (!user.instance.containerName) {
      return NextResponse.json({ error: 'Instance has no service name' }, { status: 400 })
    }

    const url = `http://${user.instance.containerName}.railway.internal:18800/whatsapp/qr`
    const response = await fetch(url, {
      method: 'POST',
      signal: AbortSignal.timeout(25000)
    })

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
