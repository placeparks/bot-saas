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
    const interval = setInterval(fetchStatus, 30000) // Refresh every 30s
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
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Activity className="h-12 w-12 animate-spin mx-auto mb-4 text-purple-600" />
          <p className="text-gray-600">Loading your dashboard...</p>
        </div>
      </div>
    )
  }

  if (!data?.hasInstance) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-purple-50 to-white">
        <Card className="max-w-md">
          <CardHeader>
            <CardTitle>No Instance Found</CardTitle>
            <CardDescription>
              You haven't deployed your AI assistant yet.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button
              onClick={() => router.push('/onboard')}
              className="w-full"
            >
              <Bot className="mr-2 h-4 w-4" />
              Deploy Your Bot
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  const { instance, subscription } = data

  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-50 to-white">
      {/* Header */}
      <header className="bg-white border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Bot className="h-8 w-8 text-purple-600" />
              <div>
                <h1 className="text-2xl font-bold">Your AI Assistant</h1>
                <p className="text-sm text-gray-600">
                  {subscription?.plan.replace('_', ' ')} Plan
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <Badge
                variant={instance.status === 'RUNNING' ? 'default' : 'secondary'}
                className={instance.status === 'RUNNING' ? 'bg-green-500' : ''}
              >
                {instance.isHealthy ? '● Online' : '○ Offline'}
              </Badge>
              <Button variant="outline" onClick={() => router.push('/settings')}>
                Settings
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Main Column */}
          <div className="lg:col-span-2 space-y-6">
            {/* Instance Status */}
            <InstanceStatus
              instance={instance}
              onAction={handleAction}
              actionLoading={actionLoading}
            />

            {/* Channel Access */}
            <ChannelAccess channels={instance.channels} />

            {/* Usage Stats */}
            <UsageStats instance={instance} />
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button
                  variant="outline"
                  className="w-full justify-start"
                  onClick={() => handleAction('start')}
                  disabled={instance.status === 'RUNNING' || actionLoading}
                >
                  <Play className="mr-2 h-4 w-4" />
                  Start Instance
                </Button>
                <Button
                  variant="outline"
                  className="w-full justify-start"
                  onClick={() => handleAction('stop')}
                  disabled={instance.status === 'STOPPED' || actionLoading}
                >
                  <Square className="mr-2 h-4 w-4" />
                  Stop Instance
                </Button>
                <Button
                  variant="outline"
                  className="w-full justify-start"
                  onClick={() => handleAction('restart')}
                  disabled={actionLoading}
                >
                  <RotateCw className="mr-2 h-4 w-4" />
                  Restart Instance
                </Button>
              </CardContent>
            </Card>

            {/* Subscription Info */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Subscription</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div>
                    <p className="text-sm text-gray-600">Plan</p>
                    <p className="font-semibold">
                      {subscription?.plan.replace('_', ' ')}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Status</p>
                    <Badge variant={subscription?.status === 'ACTIVE' ? 'default' : 'secondary'}>
                      {subscription?.status}
                    </Badge>
                  </div>
                  <Button variant="outline" className="w-full mt-4">
                    Manage Subscription
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Help & Support */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Help & Support</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <a
                  href="https://docs.yourdomain.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center text-sm text-purple-600 hover:underline"
                >
                  <ExternalLink className="mr-2 h-4 w-4" />
                  Documentation
                </a>
                <a
                  href="mailto:support@yourdomain.com"
                  className="flex items-center text-sm text-purple-600 hover:underline"
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
