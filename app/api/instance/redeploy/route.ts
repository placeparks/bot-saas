import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { RailwayClient } from '@/lib/railway/client'
import { PAIRING_SCRIPT_B64 } from '@/lib/railway/deploy'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function POST(req: Request) {
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

    if (!user.instance.containerId) {
      return NextResponse.json({ error: 'Instance has no Railway service ID' }, { status: 400 })
    }

    const railway = new RailwayClient()
    const serviceId = user.instance.containerId

    // Update pairing server env var
    console.log('[Redeploy] Updating pairing server script...')
    console.log('[Redeploy] Script size (base64):', PAIRING_SCRIPT_B64.length, 'chars')

    await railway.setVariables(serviceId, {
      _PAIRING_SCRIPT_B64: PAIRING_SCRIPT_B64
    })

    // Trigger a fresh deployment
    console.log('[Redeploy] Triggering fresh deployment for service:', serviceId)
    await railway.redeployService(serviceId)

    return NextResponse.json({
      success: true,
      message: 'Fresh deployment triggered with updated start command. Please wait ~30-45 seconds for the instance to rebuild and restart.'
    })
  } catch (error: any) {
    console.error('Redeploy error:', error)
    return NextResponse.json(
      { error: error.message || 'Redeploy failed' },
      { status: 500 }
    )
  }
}
