'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { MessageSquare, TrendingUp, Zap, Clock } from 'lucide-react'

interface UsageStatsProps {
  instance: any
}

export default function UsageStats({ instance }: UsageStatsProps) {
  // Placeholder stats - in production, fetch from API
  const stats = {
    messagesProcessed: 1247,
    uptime: '99.8%',
    avgResponseTime: '1.2s',
    tokensUsed: '2.4M'
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Usage Statistics</CardTitle>
        <CardDescription>Your bot's activity in the last 30 days</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          <div className="text-center">
            <div className="p-4 bg-purple-100 rounded-lg inline-block mb-3">
              <MessageSquare className="h-6 w-6 text-purple-600" />
            </div>
            <p className="text-2xl font-bold">{stats.messagesProcessed.toLocaleString()}</p>
            <p className="text-sm text-gray-600">Messages</p>
          </div>

          <div className="text-center">
            <div className="p-4 bg-green-100 rounded-lg inline-block mb-3">
              <TrendingUp className="h-6 w-6 text-green-600" />
            </div>
            <p className="text-2xl font-bold">{stats.uptime}</p>
            <p className="text-sm text-gray-600">Uptime</p>
          </div>

          <div className="text-center">
            <div className="p-4 bg-blue-100 rounded-lg inline-block mb-3">
              <Clock className="h-6 w-6 text-blue-600" />
            </div>
            <p className="text-2xl font-bold">{stats.avgResponseTime}</p>
            <p className="text-sm text-gray-600">Avg Response</p>
          </div>

          <div className="text-center">
            <div className="p-4 bg-orange-100 rounded-lg inline-block mb-3">
              <Zap className="h-6 w-6 text-orange-600" />
            </div>
            <p className="text-2xl font-bold">{stats.tokensUsed}</p>
            <p className="text-sm text-gray-600">Tokens Used</p>
          </div>
        </div>

        <div className="mt-6 pt-6 border-t">
          <div className="flex items-center justify-between">
            <p className="text-sm text-gray-600">
              Detailed analytics coming soon
            </p>
            <button className="text-sm text-purple-600 hover:underline">
              View Full Report →
            </button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
