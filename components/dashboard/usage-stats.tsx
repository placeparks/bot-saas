'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { MessageSquare, TrendingUp, Zap, Clock } from 'lucide-react'

interface UsageStatsProps {
  instance: any
}

export default function UsageStats({ instance }: UsageStatsProps) {
  const stats = instance?.stats || null

  return (
    <Card className="border border-white/10 bg-white/5 text-[#e9f3ee]">
      <CardHeader>
        <CardTitle>Usage Statistics</CardTitle>
        <CardDescription className="text-[#a5b7b0]">
          {stats ? "Your bot's activity in the last 30 days" : 'Usage tracking not enabled yet'}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
          <div className="text-center">
            <div className="p-4 border border-white/10 bg-white/5 rounded-lg inline-block mb-3">
              <MessageSquare className="h-6 w-6 text-[var(--claw-mint)]" />
            </div>
            <p className="text-2xl font-bold">{stats?.messagesProcessed?.toLocaleString?.() ?? '—'}</p>
            <p className="text-sm text-[#a5b7b0]">Messages</p>
          </div>

          <div className="text-center">
            <div className="p-4 border border-white/10 bg-white/5 rounded-lg inline-block mb-3">
              <TrendingUp className="h-6 w-6 text-[var(--claw-mint)]" />
            </div>
            <p className="text-2xl font-bold">{stats?.uptime ?? '—'}</p>
            <p className="text-sm text-[#a5b7b0]">Uptime</p>
          </div>

          <div className="text-center">
            <div className="p-4 border border-white/10 bg-white/5 rounded-lg inline-block mb-3">
              <Clock className="h-6 w-6 text-[var(--claw-ember)]" />
            </div>
            <p className="text-2xl font-bold">{stats?.avgResponseTime ?? '—'}</p>
            <p className="text-sm text-[#a5b7b0]">Avg Response</p>
          </div>

          <div className="text-center">
            <div className="p-4 border border-white/10 bg-white/5 rounded-lg inline-block mb-3">
              <Zap className="h-6 w-6 text-[var(--claw-ember)]" />
            </div>
            <p className="text-2xl font-bold">{stats?.tokensUsed ?? '—'}</p>
            <p className="text-sm text-[#a5b7b0]">Tokens Used</p>
          </div>
        </div>

        <div className="mt-6 pt-6 border-t border-white/10">
          <div className="flex items-center justify-between">
            <p className="text-sm text-[#8fa29a]">
              {stats ? 'Detailed analytics coming soon' : 'Connect analytics to see real usage'}
            </p>
            <button className="text-sm text-[var(--claw-mint)] hover:underline">
              {stats ? 'View Full Report\u00a0\u2192' : 'Enable Tracking\u00a0\u2192'}
            </button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
