'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Play, Square, RotateCw, Activity, Bot, MessageSquare, ExternalLink } from 'lucide-react'
import InstanceStatus from '@/components/dashboard/instance-status'
import ChannelAccess from '@/components/dashboard/channel-access'
import UsageStats from '@/components/dashboard/usage-stats'

export default function DashboardPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [data, setData] = useState<any>(null)
  const [actionLoading, setActionLoading] = useState(false)

  useEffect(() => {
    fetchStatus()
    const interval = setInterval(fetchStatus, 30000)
    return () => clearInterval(interval)
  }, [])

  const fetchStatus = async () => {
    try {
      const response = await fetch('/api/instance/status')
      const result = await response.json()
      setData(result)
    } catch (error) {
      console.error('Failed to fetch status:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleAction = async (action: 'start' | 'stop' | 'restart') => {
    setActionLoading(true)
    try {
      await fetch(`/api/instance/${action}`, { method: 'POST' })
      await fetchStatus()
    } catch (error) {
      console.error(`${action} failed:`, error)
      alert(`Failed to ${action} instance. Please try again.`)
    } finally {
      setActionLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0b0f0d] text-[#e9f3ee]">
        <div className="text-center">
          <Activity className="h-12 w-12 animate-spin mx-auto mb-4 text-[var(--claw-mint)]" />
          <p className="text-[#a5b7b0]">Loading your dashboard...</p>
        </div>
      </div>
    )
  }

  if (!data?.hasInstance) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0b0f0d] text-[#e9f3ee]">
        <Card className="max-w-md border border-white/10 bg-white/5">
          <CardHeader>
            <CardTitle className="text-[#e9f3ee]">No Instance Found</CardTitle>
            <CardDescription className="text-[#a5b7b0]">
              You haven't deployed your AI assistant yet.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button
              onClick={() => router.push('/onboard')}
              className="w-full bg-[var(--claw-mint)] text-[#0b0f0d] hover:brightness-110"
            >
              <Bot className="mr-2 h-4 w-4 text-[#e9f3ee]" />
              Deploy Your Bot
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  const { instance, subscription } = data

  return (
    <div className="min-h-screen bg-[#0b0f0d] text-[#e9f3ee] [--claw-ink:#0b0f0d] [--claw-mint:#7df3c6] [--claw-ember:#ffb35a] [--claw-glow:rgba(125,243,198,0.28)]">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-24 -right-16 h-56 w-56 rounded-full bg-[var(--claw-mint)]/12 blur-3xl" />
        <div className="absolute -bottom-24 -left-20 h-72 w-72 rounded-full bg-[var(--claw-ember)]/12 blur-3xl" />
      </div>

      {/* Header */}
      <header className="relative border-b border-white/10 bg-white/5">
        <div className="container mx-auto px-4 py-5 sm:px-6 sm:py-6">
          <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
            <div className="flex items-center space-x-3">
              <div className="h-11 w-11 rounded-2xl border border-[var(--claw-mint)]/30 bg-[var(--claw-mint)]/10 flex items-center justify-center shadow-[0_0_30px_var(--claw-glow)]">
                <Bot className="h-6 w-6 text-[var(--claw-mint)]" />
              </div>
              <div>
                <h1 className="text-2xl font-semibold">Your AI Assistant</h1>
                <p className="text-sm text-[#a5b7b0]">
                  {subscription?.plan.replace('_', ' ')} Plan
                </p>
              </div>
            </div>
            <div className="flex w-full items-center gap-3 sm:w-auto">
              <Badge
                className={instance.isHealthy ? 'bg-[var(--claw-mint)] text-[#0b0f0d]' : 'bg-white/10 text-[#cfe3db]'}
              >
                {instance.isHealthy ? 'Online' : 'Offline'}
              </Badge>
      { /*       <Button
                variant="outline"
                onClick={() => router.push('/settings')}
                className="w-full border-[var(--claw-mint)]/40 text-[var(--claw-mint)] hover:border-[var(--claw-mint)]/80 hover:text-[var(--claw-mint)] sm:w-auto"
              >
                Settings
              </Button> */}
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 sm:px-6 sm:py-10 relative">
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Main Column */}
          <div className="lg:col-span-2 space-y-6">
            <InstanceStatus
              instance={instance}
              onAction={handleAction}
              actionLoading={actionLoading}
            />

            <ChannelAccess channels={instance.channels} />

            <UsageStats instance={instance} />
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            <Card className="border border-white/10 bg-white/5 text-[#e9f3ee]">
              <CardHeader>
                <CardTitle className="text-lg">Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button
                  variant="outline"
                  className="w-full justify-start border-white/15 bg-white/5 text-[#e9f3ee] hover:border-[var(--claw-mint)]/60 hover:bg-white/10 disabled:opacity-50 disabled:text-[#8fa29a]"
                  onClick={() => handleAction('start')}
                  disabled={instance.status === 'RUNNING' || actionLoading}
                >
                  <Play className="mr-2 h-4 w-4" />
                  Start Instance
                </Button>
                <Button
                  variant="outline"
                  className="w-full justify-start border-white/15 bg-white/5 text-[#e9f3ee] hover:border-[var(--claw-mint)]/60 hover:bg-white/10 disabled:opacity-50 disabled:text-[#8fa29a]"
                  onClick={() => handleAction('stop')}
                  disabled={instance.status === 'STOPPED' || actionLoading}
                >
                  <Square className="mr-2 h-4 w-4" />
                  Stop Instance
                </Button>
                <Button
                  variant="outline"
                  className="w-full justify-start border-white/15 bg-white/5 text-[#e9f3ee] hover:border-[var(--claw-mint)]/60 hover:bg-white/10 disabled:opacity-50 disabled:text-[#8fa29a]"
                  onClick={() => handleAction('restart')}
                  disabled={actionLoading}
                >
                  <RotateCw className="mr-2 h-4 w-4" />
                  Restart Instance
                </Button>
              </CardContent>
            </Card>

            <Card className="border border-white/10 bg-white/5 text-[#e9f3ee]">
              <CardHeader>
                <CardTitle className="text-lg">Subscription</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div>
                    <p className="text-sm text-[#a5b7b0]">Plan</p>
                    <p className="font-semibold">{subscription?.plan.replace('_', ' ')}</p>
                  </div>
                  <div>
                    <p className="text-sm text-[#a5b7b0]">Status</p>
                    <Badge className={subscription?.status === 'ACTIVE' ? 'bg-[var(--claw-mint)] text-[#0b0f0d]' : 'bg-white/10 text-[#cfe3db]'}>
                      {subscription?.status}
                    </Badge>
                  </div>
                  <Button
                    variant="outline"
                    className="w-full mt-4 border-[var(--claw-mint)]/40 bg-white/5 text-[var(--claw-mint)] hover:border-[var(--claw-mint)]/80 hover:text-[var(--claw-mint)] hover:bg-white/10"
                  >
                    Manage Subscription
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card className="border border-white/10 bg-white/5 text-[#e9f3ee]">
              <CardHeader>
                <CardTitle className="text-lg">Help & Support</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <a
                  href="https://docs.yourdomain.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center text-sm text-[var(--claw-mint)] hover:underline"
                >
                  <ExternalLink className="mr-2 h-4 w-4" />
                  Documentation
                </a>
                <a
                  href="mailto:support@yourdomain.com"
                  className="flex items-center text-sm text-[var(--claw-mint)] hover:underline"
                >
                  <MessageSquare className="mr-2 h-4 w-4" />
                  Contact Support
                </a>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  )
}
