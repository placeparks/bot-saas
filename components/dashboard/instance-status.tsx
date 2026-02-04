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
    RUNNING: 'bg-green-500',
    STOPPED: 'bg-gray-500',
    DEPLOYING: 'bg-yellow-500',
    ERROR: 'bg-red-500',
    RESTARTING: 'bg-blue-500'
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Instance Status</CardTitle>
            <CardDescription>Monitor your AI assistant's health</CardDescription>
          </div>
          <Badge
            className={statusColors[instance.status]}
          >
            {instance.status}
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="flex items-center space-x-3">
            <div className={`p-3 rounded-lg ${instance.isHealthy ? 'bg-green-100' : 'bg-red-100'}`}>
              <Activity className={`h-5 w-5 ${instance.isHealthy ? 'text-green-600' : 'text-red-600'}`} />
            </div>
            <div>
              <p className="text-sm text-gray-600">Health</p>
              <p className="font-semibold">{instance.isHealthy ? 'Healthy' : 'Down'}</p>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <div className="p-3 rounded-lg bg-purple-100">
              <Server className="h-5 w-5 text-purple-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Port</p>
              <p className="font-semibold">{instance.port}</p>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <div className="p-3 rounded-lg bg-blue-100">
              <Wifi className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Access</p>
              {instance.accessUrl ? (
                <a
                  href={instance.accessUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-semibold text-purple-600 hover:underline text-sm"
                >
                  Open
                </a>
              ) : (
                <span className="font-semibold text-gray-400 text-sm">Unavailable</span>
              )}
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <div className="p-3 rounded-lg bg-orange-100">
              <Clock className="h-5 w-5 text-orange-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Last Check</p>
              <p className="font-semibold text-sm">
                {instance.lastHealthCheck
                  ? new Date(instance.lastHealthCheck).toLocaleTimeString()
                  : 'Never'}
              </p>
            </div>
          </div>
        </div>

        <div className="mt-6 pt-6 border-t">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-semibold mb-1">Container ID</p>
              <p className="text-sm text-gray-600 font-mono">{instance.id}</p>
            </div>
            <Button
              variant="outline"
              size="sm"
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
