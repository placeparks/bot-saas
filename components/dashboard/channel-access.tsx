'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { MessageSquare, Send, Hash, Zap, Phone, Mail, Grid, Users, Copy, ExternalLink, QrCode } from 'lucide-react'
import { useState } from 'react'

const channelIcons: Record<string, any> = {
  WHATSAPP: MessageSquare,
  TELEGRAM: Send,
  DISCORD: Hash,
  SLACK: Zap,
  SIGNAL: Phone,
  GOOGLE_CHAT: Mail,
  MATRIX: Grid,
  MSTEAMS: Users
}

interface ChannelAccessProps {
  channels: any[]
}

export default function ChannelAccess({ channels }: ChannelAccessProps) {
  const [showingQR, setShowingQR] = useState<string | null>(null)
  const [pairingChannel, setPairingChannel] = useState<string | null>(null)
  const [pairingCode, setPairingCode] = useState('')
  const [pairingError, setPairingError] = useState<string | null>(null)
  const [pairingSuccess, setPairingSuccess] = useState<string | null>(null)
  const [pairingLoading, setPairingLoading] = useState(false)
  const telegramChannel = channels?.find((c) => c.type === 'TELEGRAM')
  const telegramUsername = telegramChannel?.botUsername?.replace('@', '')
  const telegramPairLink =
    telegramUsername && pairingCode
      ? `https://t.me/${telegramUsername}?start=${encodeURIComponent(pairingCode)}`
      : '#'

  const getAccessInfo = (channel: any) => {
    switch (channel.type) {
      case 'WHATSAPP':
        return {
          label: 'QR Code',
          value: 'Click to view',
          action: 'qr'
        }
      case 'TELEGRAM':
        return {
          label: 'Bot Username',
          value: channel.botUsername || '@yourbot',
          link: channel.botUsername
            ? `https://t.me/${channel.botUsername.replace('@', '')}`
            : undefined
        }
      case 'DISCORD':
        return {
          label: 'Invite Link',
          value: channel.inviteLink || 'Generate in Discord',
          link: channel.inviteLink
        }
      default:
        return {
          label: 'Status',
          value: channel.enabled ? 'Connected' : 'Disconnected'
        }
    }
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    alert('Copied to clipboard!')
  }

  const approvePairing = async () => {
    if (!pairingCode) return

    setPairingError(null)
    setPairingSuccess(null)
    setPairingLoading(true)

    try {
      const response = await fetch('/api/instance/pair', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          channel: 'telegram',
          code: pairingCode.trim()
        })
      })

      const result = await response.json()
      if (!response.ok) {
        throw new Error(result?.error || 'Pairing failed')
      }

      setPairingSuccess(result?.message || 'Pairing approved successfully')
    } catch (error: any) {
      setPairingError(error.message || 'Pairing failed')
    } finally {
      setPairingLoading(false)
    }
  }

  if (!channels || channels.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Channel Access</CardTitle>
          <CardDescription>No channels configured</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <p className="text-sm text-gray-600">
              Configure channels in your instance settings to start chatting with your bot.
            </p>
            <Button
              variant="outline"
              onClick={() => {
                setPairingChannel('TELEGRAM')
                setPairingCode('')
                setPairingError(null)
                setPairingSuccess(null)
              }}
            >
              Pair Telegram
            </Button>
            <p className="text-xs text-gray-500">
              Pairing works without channel config, but Telegram deep links need a bot username.
            </p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Channel Access</CardTitle>
        <CardDescription>Connect to your bot on these platforms</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {channels.map((channel, index) => {
            const Icon = channelIcons[channel.type] || MessageSquare
            const accessInfo = getAccessInfo(channel)

            return (
              <div
                key={index}
                className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition"
              >
                <div className="flex items-center space-x-4 flex-1">
                  <div className="p-3 rounded-lg bg-purple-100">
                    <Icon className="h-5 w-5 text-purple-600" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-1">
                      <p className="font-semibold">
                        {channel.type.replace('_', ' ')}
                      </p>
                      <Badge variant={channel.enabled ? 'default' : 'secondary'} className="text-xs">
                        {channel.enabled ? 'Active' : 'Inactive'}
                      </Badge>
                    </div>
                    <p className="text-sm text-gray-600">
                      <span className="font-medium">{accessInfo.label}:</span>{' '}
                      {accessInfo.value}
                    </p>
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  {accessInfo.action === 'qr' && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setShowingQR(channel.type)}
                    >
                      <QrCode className="h-4 w-4 mr-2" />
                      View QR
                    </Button>
                  )}
                  {accessInfo.link && (
                    <Button
                      variant="outline"
                      size="sm"
                      asChild
                    >
                      <a href={accessInfo.link} target="_blank" rel="noopener noreferrer">
                        <ExternalLink className="h-4 w-4 mr-2" />
                        Open
                      </a>
                    </Button>
                  )}
                  {channel.type === 'TELEGRAM' && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setPairingChannel(channel.type)
                        setPairingCode('')
                        setPairingError(null)
                        setPairingSuccess(null)
                      }}
                    >
                      Pair
                    </Button>
                  )}
                  {accessInfo.value && accessInfo.value.startsWith('@') && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => copyToClipboard(accessInfo.value)}
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </div>
            )
          })}
        </div>

        {showingQR && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <Card className="max-w-md">
              <CardHeader>
                <CardTitle>WhatsApp QR Code</CardTitle>
                <CardDescription>Scan with WhatsApp to connect</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="bg-white p-8 rounded-lg">
                  <div className="w-64 h-64 bg-gray-200 rounded-lg flex items-center justify-center">
                    <p className="text-gray-500 text-center">
                      QR Code will be generated
                      <br />
                      when instance is running
                    </p>
                  </div>
                </div>
                <Button
                  className="w-full mt-4"
                  onClick={() => setShowingQR(null)}
                >
                  Close
                </Button>
              </CardContent>
            </Card>
          </div>
        )}

        {pairingChannel && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <Card className="max-w-md">
              <CardHeader>
                <CardTitle>Pair Telegram</CardTitle>
                <CardDescription>
                  Enter the pairing code you received, then open Telegram to connect.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <p className="text-sm text-gray-600 mb-2">
                    If you do not have access to the bot, share this code with the bot owner.
                  </p>
                  <input
                    className="w-full border rounded-md px-3 py-2 text-sm"
                    placeholder="Enter pairing code"
                    value={pairingCode}
                    onChange={(e) => setPairingCode(e.target.value)}
                  />
                </div>
                {pairingError && (
                  <p className="text-sm text-red-600">{pairingError}</p>
                )}
                {pairingSuccess && (
                  <p className="text-sm text-green-600">{pairingSuccess}</p>
                )}
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    className="flex-1"
                    onClick={() => copyToClipboard(pairingCode ? `/pair ${pairingCode}` : '/pair')}
                  >
                    <Copy className="h-4 w-4 mr-2" />
                    Copy Command
                  </Button>
                  <Button
                    variant="outline"
                    className="flex-1"
                    onClick={approvePairing}
                    disabled={!pairingCode || pairingLoading}
                  >
                    {pairingLoading ? 'Pairing...' : 'Pair Now'}
                  </Button>
                </div>
                <Button
                  className="w-full"
                  asChild
                  disabled={!pairingCode || !telegramUsername}
                >
                  <a
                    href={telegramPairLink}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <ExternalLink className="h-4 w-4 mr-2" />
                    Open Telegram
                  </a>
                </Button>
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => setPairingChannel(null)}
                >
                  Close
                </Button>
              </CardContent>
            </Card>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
