'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Activity, Clock, Server, Wifi } from 'lucide-react'
import { InstanceStatus as InstanceStatusEnum } from '@prisma/client'

interface Instance {
  id: string
  status: InstanceStatusEnum
  port: number
  accessUrl: string | null
  lastHealthCheck: Date | null
  isHealthy?: boolean
}

interface InstanceStatusProps {
  instance: Instance
  onAction: (action: 'start' | 'stop' | 'restart') => void
  actionLoading: boolean
}

export default function InstanceStatus({ instance, onAction, actionLoading }: InstanceStatusProps) {
  const statusColors: Record<InstanceStatusEnum, string> = {
    RUNNING: 'bg-[var(--claw-mint)] text-[#0b0f0d]',
    STOPPED: 'bg-white/10 text-[#cfe3db]',
    DEPLOYING: 'bg-[var(--claw-ember)] text-[#0b0f0d]',
    ERROR: 'bg-red-500 text-[#0b0f0d]',
    RESTARTING: 'bg-blue-500 text-[#0b0f0d]'
  }

  return (
    <Card className="border border-white/10 bg-white/5 text-[#e9f3ee]">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Instance Status</CardTitle>
            <CardDescription className="text-[#a5b7b0]">Monitor your AI assistant's health</CardDescription>
          </div>
          <Badge className={statusColors[instance.status]}>
            {instance.status}
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="flex items-center space-x-3">
            <div className={`p-3 rounded-lg border border-white/10 ${instance.isHealthy ? 'bg-[var(--claw-mint)]/10' : 'bg-red-500/10'}`}>
              <Activity className={`h-5 w-5 ${instance.isHealthy ? 'text-[var(--claw-mint)]' : 'text-red-400'}`} />
            </div>
            <div>
              <p className="text-sm text-[#a5b7b0]">Health</p>
              <p className="font-semibold">{instance.isHealthy ? 'Healthy' : 'Down'}</p>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <div className="p-3 rounded-lg border border-white/10 bg-white/5">
              <Server className="h-5 w-5 text-[var(--claw-mint)]" />
            </div>
            <div>
              <p className="text-sm text-[#a5b7b0]">Port</p>
              <p className="font-semibold">{instance.port}</p>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <div className="p-3 rounded-lg border border-white/10 bg-white/5">
              <Wifi className="h-5 w-5 text-[var(--claw-mint)]" />
            </div>
            <div>
              <p className="text-sm text-[#a5b7b0]">Access</p>
              {instance.accessUrl ? (
                <a
                  href={instance.accessUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-semibold text-[var(--claw-mint)] hover:underline text-sm"
                >
                  Open
                </a>
              ) : (
                <span className="font-semibold text-[#8fa29a] text-sm">Unavailable</span>
              )}
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <div className="p-3 rounded-lg border border-white/10 bg-white/5">
              <Clock className="h-5 w-5 text-[var(--claw-ember)]" />
            </div>
            <div>
              <p className="text-sm text-[#a5b7b0]">Last Check</p>
              <p className="font-semibold text-sm">
                {instance.lastHealthCheck
                  ? new Date(instance.lastHealthCheck).toLocaleTimeString()
                  : 'Never'}
              </p>
            </div>
          </div>
        </div>

        <div className="mt-6 pt-6 border-t border-white/10">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="font-semibold mb-1">Container ID</p>
              <p className="text-sm text-[#a5b7b0] font-mono">{instance.id}</p>
            </div>
            <Button
              variant="outline"
              size="sm"
              className="border-[var(--claw-mint)]/40 text-[#216e47] hover:border-[var(--claw-mint)]/80 hover:text-[#082918]"
              onClick={() => {
                navigator.clipboard.writeText(instance.id)
                alert('Container ID copied!')
              }}
            >
              Copy ID
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
