'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { MessageSquare, Send, Hash, Zap, Phone, Mail, Grid, Users, Copy, ExternalLink, QrCode, Terminal } from 'lucide-react'
import { useEffect, useState } from 'react'
import QRCode from 'qrcode'

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

interface PairingRequest {
  code?: string
  userId?: string
  expires?: string
  raw?: string
}

export default function ChannelAccess({ channels }: ChannelAccessProps) {
  const [showingQR, setShowingQR] = useState<string | null>(null)
  const [pairingChannel, setPairingChannel] = useState<string | null>(null)
  const [pairingCode, setPairingCode] = useState('')
  const [pairingError, setPairingError] = useState<string | null>(null)
  const [pairingSuccess, setPairingSuccess] = useState<string | null>(null)
  const [pairingLoading, setPairingLoading] = useState(false)
  const [pendingRequests, setPendingRequests] = useState<PairingRequest[]>([])
  const [showPendingRequests, setShowPendingRequests] = useState(false)
  const [loadingRequests, setLoadingRequests] = useState(false)
  const [showCliCommand, setShowCliCommand] = useState(false)
  const [cliCommand, setCliCommand] = useState('')
  const [apiOutput, setApiOutput] = useState('')
  const [qrLoading, setQrLoading] = useState(false)
  const [qrError, setQrError] = useState<string | null>(null)
  const [qrData, setQrData] = useState<string | null>(null)
  const [qrImage, setQrImage] = useState<string | null>(null)
  const [qrRaw, setQrRaw] = useState<string | null>(null)
  const [qrAsciiImage, setQrAsciiImage] = useState<string | null>(null)
  const [qrRefreshTick, setQrRefreshTick] = useState(0)
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

  const loadPendingRequests = async () => {
    setLoadingRequests(true)
    setPairingError(null)

    try {
      const response = await fetch('/api/instance/pair/list?channel=telegram')
      const result = await response.json()

      if (!response.ok) {
        throw new Error(result?.error || 'Failed to load pending requests')
      }

      setPendingRequests(result?.requests || [])
      setShowPendingRequests(true)
    } catch (error: any) {
      setPairingError(error.message || 'Failed to load pending requests')
    } finally {
      setLoadingRequests(false)
    }
  }

  const doApprovePairing = async () => {
    setPairingError(null)
    setPairingSuccess(null)
    setPairingLoading(true)
    setApiOutput('')
    setShowCliCommand(false)

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

      if (response.ok) {
        if (result?.output) {
          setApiOutput(result.output)
        }

        if (result?.instructions) {
          setCliCommand(result.cliCommand)
          setShowCliCommand(true)
          setPairingSuccess(result?.message || 'Use the command below to approve')
        } else {
          setShowCliCommand(false)
          setPairingSuccess(result?.message || 'Pairing approved successfully!')
        }
      } else {
        setPairingError(result?.error || 'Pairing failed')
      }
    } catch (error: any) {
      setPairingError('Network error - showing manual approval method')
      setCliCommand(`openclaw pairing approve telegram ${pairingCode.trim()}`)
      setShowCliCommand(true)
    } finally {
      setPairingLoading(false)
    }
  }

  const approvePairing = () => {
    if (!pairingCode) return
    doApprovePairing()
  }

  const openQr = async (channelType: string) => {
    setShowingQR(channelType)
    setQrLoading(true)
    setQrError(null)
    setQrData(null)
    setQrImage(null)
    setQrRaw(null)
    setQrAsciiImage(null)

    if (channelType !== 'WHATSAPP') {
      setQrLoading(false)
      return
    }

    try {
      const response = await fetch('/api/instance/whatsapp/qr', {
        method: 'POST',
        cache: 'no-store'
      })
      const result = await response.json()

      if (!response.ok || !result?.success) {
        throw new Error(result?.error || 'Failed to generate QR')
      }

      if (result?.qr) {
        setQrData(result.qr)
      } else if (result?.raw && result.raw.includes('▄▄') && result.raw.includes('█')) {
        setQrRaw(result.raw)
      } else {
        setQrRaw(result?.raw || '')
        throw new Error('QR data not returned. Check instance logs.')
      }
    } catch (error: any) {
      setQrError(error.message || 'Failed to generate QR')
    } finally {
      setQrLoading(false)
    }
  }

  useEffect(() => {
    let cancelled = false
    if (!qrData) return

    QRCode.toDataURL(qrData, { margin: 1, width: 360 })
      .then((url) => {
        if (!cancelled) setQrImage(url)
      })
      .catch(() => {
        if (!cancelled) setQrError('Failed to render QR')
      })

    return () => {
      cancelled = true
    }
  }, [qrData])

  useEffect(() => {
    if (!qrRaw) return

    const lines = qrRaw
      .split('\n')
      .map((l) => l.replace(/\r/g, ''))
      .filter((l) => /[█▀▄]/.test(l))

    if (lines.length === 0) return

    const width = Math.max(...lines.map((l) => l.length))
    const height = lines.length * 2

    const pixels: number[][] = Array.from({ length: height }, () => Array(width).fill(0))
    for (let y = 0; y < lines.length; y++) {
      const line = lines[y]
      for (let x = 0; x < width; x++) {
        const ch = line[x] || ' '
        const topRow = y * 2
        const bottomRow = y * 2 + 1
        if (ch === '█') {
          pixels[topRow][x] = 1
          pixels[bottomRow][x] = 1
        } else if (ch === '▀') {
          pixels[topRow][x] = 1
        } else if (ch === '▄') {
          pixels[bottomRow][x] = 1
        }
      }
    }

    const targetSize = 360
    const scale = Math.max(2, Math.floor(targetSize / width))
    const canvas = document.createElement('canvas')
    canvas.width = width * scale
    canvas.height = height * scale
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    ctx.fillStyle = '#f5fff8'
    ctx.fillRect(0, 0, canvas.width, canvas.height)
    ctx.fillStyle = '#0b0f0d'
    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        if (pixels[y][x]) {
          ctx.fillRect(x * scale, y * scale, scale, scale)
        }
      }
    }

    try {
      const dataUrl = canvas.toDataURL('image/png')
      setQrAsciiImage(dataUrl)
    } catch {
      // fallback to raw text
    }
  }, [qrRaw, qrRefreshTick])

  const refreshQr = () => {
    if (!showingQR) return
    setQrRefreshTick((t) => t + 1)
    openQr(showingQR)
  }

  if (!channels || channels.length === 0) {
    return (
      <Card className="border border-white/10 bg-white/5 text-[#e9f3ee]">
        <CardHeader>
          <CardTitle>Channel Access</CardTitle>
          <CardDescription className="text-[#a5b7b0]">No channels configured</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <p className="text-sm text-[#a5b7b0]">
              Configure channels in your instance settings to start chatting with your bot.
            </p>
            <div className="rounded-lg border border-white/10 bg-white/5 p-3 space-y-3">
              <p className="text-sm font-medium">Pair Telegram</p>
              <input
                className="w-full border border-white/10 rounded-md bg-white/5 px-3 py-2 text-sm text-[#e9f3ee] placeholder:text-[#6e827a]"
                placeholder="Enter pairing code"
                value={pairingCode}
                onChange={(e) => setPairingCode(e.target.value)}
              />
              {pairingError && (
                <p className="text-sm text-red-400">{pairingError}</p>
              )}
              {pairingSuccess && (
                <p className="text-sm text-[var(--claw-mint)]">{pairingSuccess}</p>
              )}
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  className="flex-1 border-white/15 text-[#e9f3ee] hover:border-[var(--claw-mint)]/60"
                  onClick={() => copyToClipboard(pairingCode ? `/pair ${pairingCode}` : '/pair')}
                >
                  <Copy className="h-4 w-4 mr-2" />
                  Copy Command
                </Button>
                <Button
                  variant="outline"
                  className="flex-1 border-white/15 text-[#e9f3ee] hover:border-[var(--claw-mint)]/60"
                  onClick={approvePairing}
                  disabled={!pairingCode || pairingLoading}
                >
                  {pairingLoading ? 'Pairing...' : 'Pair Now'}
                </Button>
              </div>
            </div>
            <p className="text-xs text-[#8fa29a]">
              Pairing works without channel config, but Telegram deep links need a bot username.
            </p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="border border-white/10 bg-white/5 text-[#e9f3ee]">
      <CardHeader>
        <CardTitle>Channel Access</CardTitle>
        <CardDescription className="text-[#a5b7b0]">Connect to your bot on these platforms</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {channels.map((channel, index) => {
            const Icon = channelIcons[channel.type] || MessageSquare
            const accessInfo = getAccessInfo(channel)

            return (
              <div
                key={index}
                className="flex items-center justify-between p-4 border border-white/10 rounded-lg bg-white/5 hover:border-[var(--claw-mint)]/30 transition"
              >
                <div className="flex items-center space-x-4 flex-1">
                  <div className="p-3 rounded-lg border border-white/10 bg-white/5">
                    <Icon className="h-5 w-5 text-[var(--claw-mint)]" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-1">
                      <p className="font-semibold">
                        {channel.type.replace('_', ' ')}
                      </p>
                      <Badge className={channel.enabled ? 'bg-[var(--claw-mint)] text-[#0b0f0d]' : 'bg-white/10 text-[#cfe3db]'}>
                        {channel.enabled ? 'Active' : 'Inactive'}
                      </Badge>
                    </div>
                    <p className="text-sm text-[#a5b7b0]">
                      <span className="font-medium text-[#cfe3db]">{accessInfo.label}:</span>{' '}
                      {accessInfo.value}
                    </p>
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  {accessInfo.action === 'qr' && (
                    <Button
                      variant="outline"
                      size="sm"
                      className="border-white/15 text-[#2f7351] hover:border-[var(--claw-mint)]/60"
                      onClick={() => openQr(channel.type)}
                    >
                      <QrCode className="h-4 w-4 mr-2" />
                      View QR
                    </Button>
                  )}
                  {accessInfo.link && (
                    <Button
                      variant="outline"
                      size="sm"
                      className="border-white/15 text-[#e9f3ee] hover:border-[var(--claw-mint)]/60"
                      asChild
                    >
                      <a href={accessInfo.link} target="_blank" rel="noopener noreferrer">
                        <ExternalLink className="h-4 w-4 mr-2" />
                        Open
                      </a>
                    </Button>
                  )}
                  {channel.type === 'TELEGRAM' && (
                    <>
                      <Button
                        variant="outline"
                        size="sm"
                        className="border-white/15 text-[#e9f3ee] hover:border-[var(--claw-mint)]/60"
                        onClick={loadPendingRequests}
                        disabled={loadingRequests}
                      >
                        {loadingRequests ? 'Loading...' : 'Pending'}
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="border-white/15 text-[#e9f3ee] hover:border-[var(--claw-mint)]/60"
                        onClick={() => {
                          setPairingChannel(channel.type)
                          setPairingCode('')
                          setPairingError(null)
                          setPairingSuccess(null)
                        }}
                      >
                        Pair
                      </Button>
                    </>
                  )}
                  {accessInfo.value && accessInfo.value.startsWith('@') && (
                    <Button
                      variant="outline"
                      size="sm"
                      className="border-white/15 text-[#e9f3ee] hover:border-[var(--claw-mint)]/60"
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
          <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
            <Card className="max-w-md border border-white/10 bg-[#0b0f0d] text-[#e9f3ee]">
              <CardHeader>
                <CardTitle>WhatsApp QR Code</CardTitle>
                <CardDescription className="text-[#a5b7b0]">Scan with WhatsApp to connect</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="bg-white/5 p-6 rounded-lg">
                  <div className="bg-white/5 rounded-lg border border-white/10 p-3 flex items-center justify-center">
                    {qrLoading && (
                      <p className="text-[#8fa29a] text-center">Generating QR...</p>
                    )}
                    {!qrLoading && qrImage && (
                      <img src={qrImage} alt="WhatsApp QR Code" className="w-80 h-80" />
                    )}
                    {!qrLoading && !qrImage && qrAsciiImage && (
                      <img src={qrAsciiImage} alt="WhatsApp QR Code" className="w-80 h-80" />
                    )}
                    {!qrLoading && !qrImage && !qrRaw && (
                      <p className="text-[#8fa29a] text-center">
                        QR Code not available yet.
                        <br />
                        Try again in a few seconds.
                      </p>
                    )}
                    {!qrLoading && !qrImage && !qrAsciiImage && qrRaw && (
                      <pre className="w-full text-[10px] leading-[10px] text-[#cfe3db] font-mono whitespace-pre">
                        {qrRaw}
                      </pre>
                    )}
                  </div>
                  {qrError && (
                    <p className="mt-3 text-xs text-red-400 text-center">
                      {qrError}
                    </p>
                  )}
                </div>
                <div className="mt-4 flex gap-2">
                  <Button
                    variant="outline"
                    className="flex-1 border-white/15 text-[#216e47] hover:border-[var(--claw-mint)]/60"
                    onClick={refreshQr}
                    disabled={qrLoading}
                  >
                    {qrLoading ? 'Refreshing...' : 'Refresh QR'}
                  </Button>
                  <Button
                    className="flex-1 bg-[var(--claw-mint)] text-[#0b0f0d] hover:brightness-110"
                    onClick={() => setShowingQR(null)}
                  >
                    Close
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {showPendingRequests && (
          <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
            <Card className="max-w-2xl w-full mx-4 border border-white/10 bg-[#0b0f0d] text-[#e9f3ee]">
              <CardHeader>
                <CardTitle>Pending Pairing Requests</CardTitle>
                <CardDescription className="text-[#a5b7b0]">
                  Approve users who have messaged your bot
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {pendingRequests.length === 0 ? (
                  <p className="text-sm text-[#8fa29a] text-center py-4">
                    No pending pairing requests
                  </p>
                ) : (
                  <div className="space-y-2">
                    {pendingRequests.map((req, idx) => (
                      <div
                        key={idx}
                        className="flex items-center justify-between p-3 border border-white/10 rounded-lg bg-white/5"
                      >
                        <div className="flex-1">
                          <p className="text-sm font-medium">
                            Code: <span className="font-mono">{req.code}</span>
                          </p>
                          {req.userId && (
                            <p className="text-xs text-[#8fa29a]">
                              User ID: {req.userId}
                            </p>
                          )}
                          {req.expires && (
                            <p className="text-xs text-[#8fa29a]">
                              Expires: {new Date(req.expires).toLocaleString()}
                            </p>
                          )}
                          {req.raw && !req.code && (
                            <p className="text-xs text-[#8fa29a] font-mono">
                              {req.raw}
                            </p>
                          )}
                        </div>
                        <Button
                          size="sm"
                          className="bg-[var(--claw-mint)] text-[#0b0f0d] hover:brightness-110"
                          onClick={() => {
                            setPairingCode(req.code || '')
                            setPairingChannel('TELEGRAM')
                            setShowPendingRequests(false)
                          }}
                          disabled={!req.code}
                        >
                          Approve
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
                {pairingError && (
                  <p className="text-sm text-red-400">{pairingError}</p>
                )}
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    className="flex-1 border-white/15 text-[#e9f3ee] hover:border-[var(--claw-mint)]/60"
                    onClick={loadPendingRequests}
                    disabled={loadingRequests}
                  >
                    {loadingRequests ? 'Refreshing...' : 'Refresh'}
                  </Button>
                  <Button
                    variant="outline"
                    className="flex-1 border-white/15 text-[#e9f3ee] hover:border-[var(--claw-mint)]/60"
                    onClick={() => setShowPendingRequests(false)}
                  >
                    Close
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {pairingChannel && (
          <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
            <Card className="max-w-md border border-white/10 bg-[#0b0f0d] text-[#e9f3ee]">
              <CardHeader>
                <CardTitle>Pair Telegram</CardTitle>
                <CardDescription className="text-[#a5b7b0]">
                  Enter the pairing code you received, then open Telegram to connect.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <p className="text-sm text-[#a5b7b0] mb-2">
                    If you do not have access to the bot, share this code with the bot owner.
                  </p>
                  <input
                    className="w-full border border-white/10 rounded-md bg-white/5 px-3 py-2 text-sm text-[#e9f3ee] placeholder:text-[#6e827a]"
                    placeholder="Enter pairing code"
                    value={pairingCode}
                    onChange={(e) => setPairingCode(e.target.value)}
                  />
                </div>
                {showCliCommand && cliCommand && (
                  <div className="rounded-lg border border-white/10 bg-white/5 p-4 space-y-3">
                    <div className="flex items-center gap-2">
                      <Terminal className="h-5 w-5 text-[var(--claw-mint)]" />
                      <p className="text-sm font-medium">
                        Run this command in Railway Terminal
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <code className="flex-1 text-sm bg-black/30 px-3 py-2 rounded border border-white/10 font-mono">
                        {cliCommand}
                      </code>
                      <Button
                        variant="outline"
                        size="sm"
                        className="border-white/15 text-[#e9f3ee] hover:border-[var(--claw-mint)]/60"
                        onClick={() => {
                          copyToClipboard(cliCommand)
                        }}
                      >
                        <Copy className="h-4 w-4" />
                      </Button>
                    </div>
                    <div className="text-xs text-[#a5b7b0] space-y-1">
                      <p className="font-medium">Steps:</p>
                      <ol className="list-decimal list-inside space-y-1">
                        <li>Open Railway Dashboard</li>
                        <li>Go to your OpenClaw service - Deployments</li>
                        <li>Click active deployment - Terminal</li>
                        <li>Paste and run the command above</li>
                      </ol>
                    </div>
                  </div>
                )}
                {pairingError && (
                  <p className="text-sm text-red-400">{pairingError}</p>
                )}
                {pairingSuccess && (
                  <p className="text-sm text-[var(--claw-mint)]">{pairingSuccess}</p>
                )}
                <Button
                  className="w-full bg-[var(--claw-mint)] text-[#0b0f0d] hover:brightness-110"
                  onClick={approvePairing}
                  disabled={!pairingCode || pairingLoading}
                >
                  <Terminal className="h-4 w-4 mr-2" />
                  {pairingLoading ? 'Pairing...' : showCliCommand ? 'Retry Pairing' : 'Pair Now'}
                </Button>
                <Button
                  className="w-full bg-white/10 text-[#e9f3ee] hover:bg-white/15"
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
                  className="w-full border-white/15 text-[#e9f3ee] hover:border-[var(--claw-mint)]/60"
                  onClick={() => {
                    setPairingChannel(null)
                    setShowCliCommand(false)
                    setCliCommand('')
                    setApiOutput('')
                  }}
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
