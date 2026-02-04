'use client'

import { useState } from 'react'
import { Card } from '@/components/ui/card'
import { Checkbox } from '@/components/ui/checkbox'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { MessageSquare, Send, Hash, Zap, Phone, Mail, Grid, Users } from 'lucide-react'

interface ChannelField {
  key: string
  label: string
  placeholder: string
  type: string
  required?: boolean
}

interface Channel {
  type: string
  name: string
  icon: any
  description: string
  badge?: string
  popular?: boolean
  fields?: ChannelField[]
  helpUrl?: string
}

const availableChannels: Channel[] = [
  {
    type: 'WHATSAPP',
    name: 'WhatsApp',
    icon: MessageSquare,
    description: 'Scan QR code after deployment',
    badge: 'No API needed',
    popular: true,
    fields: [
      { key: 'allowlist', label: 'Allowed Phone Numbers (optional)', placeholder: '+1234567890, +9876543210', type: 'text' }
    ]
  },
  {
    type: 'TELEGRAM',
    name: 'Telegram',
    icon: Send,
    description: 'Create bot with @BotFather',
    popular: true,
    fields: [
      { key: 'botToken', label: 'Bot Token', placeholder: '123456:ABC-DEF1234ghIkl-zyx57W2v1u123ew11', type: 'password', required: true },
      { key: 'allowlist', label: 'Allowed Usernames (optional)', placeholder: '@username1, @username2', type: 'text' }
    ],
    helpUrl: 'https://t.me/botfather'
  },
  {
    type: 'DISCORD',
    name: 'Discord',
    icon: Hash,
    description: 'Create bot in Discord Developer Portal',
    fields: [
      { key: 'token', label: 'Bot Token', placeholder: 'Your bot token', type: 'password', required: true },
      { key: 'applicationId', label: 'Application ID', placeholder: 'Your application ID', type: 'text', required: true },
      { key: 'guilds', label: 'Server IDs (optional)', placeholder: '123456789, 987654321', type: 'text' }
    ],
    helpUrl: 'https://discord.com/developers/applications'
  },
  {
    type: 'SLACK',
    name: 'Slack',
    icon: Zap,
    description: 'Create app in Slack API',
    fields: [
      { key: 'botToken', label: 'Bot Token', placeholder: 'xoxb-...', type: 'password', required: true },
      { key: 'appToken', label: 'App Token', placeholder: 'xapp-...', type: 'password', required: true }
    ],
    helpUrl: 'https://api.slack.com/apps'
  },
  {
    type: 'SIGNAL',
    name: 'Signal',
    icon: Phone,
    description: 'Phone number required',
    fields: [
      { key: 'phoneNumber', label: 'Phone Number', placeholder: '+1234567890', type: 'tel', required: true }
    ]
  },
  {
    type: 'GOOGLE_CHAT',
    name: 'Google Chat',
    icon: Mail,
    description: 'Service account from Google Cloud',
    fields: [
      { key: 'serviceAccount', label: 'Service Account JSON', placeholder: 'Paste JSON here', type: 'textarea', required: true }
    ],
    helpUrl: 'https://console.cloud.google.com'
  },
  {
    type: 'MATRIX',
    name: 'Matrix',
    icon: Grid,
    description: 'Homeserver and access token',
    fields: [
      { key: 'homeserverUrl', label: 'Homeserver URL', placeholder: 'https://matrix.org', type: 'url', required: true },
      { key: 'accessToken', label: 'Access Token', placeholder: 'Your access token', type: 'password', required: true },
      { key: 'userId', label: 'User ID', placeholder: '@bot:matrix.org', type: 'text', required: true }
    ]
  },
  {
    type: 'MSTEAMS',
    name: 'MS Teams',
    icon: Users,
    description: 'Microsoft Teams bot',
    fields: [
      { key: 'appId', label: 'App ID', placeholder: 'Your app ID', type: 'text', required: true },
      { key: 'appPassword', label: 'App Password', placeholder: 'Your app password', type: 'password', required: true }
    ]
  }
]

interface ChannelSelectorProps {
  channels: any[]
  onChange: (channels: any[]) => void
}

export default function ChannelSelector({ channels, onChange }: ChannelSelectorProps) {
  const [selectedChannels, setSelectedChannels] = useState<string[]>(
    channels.map(c => c.type) || []
  )
  const [channelConfigs, setChannelConfigs] = useState<Record<string, any>>(
    channels.reduce((acc, c) => ({ ...acc, [c.type]: c.config }), {})
  )

  const toggleChannel = (channelType: string) => {
    const newSelected = selectedChannels.includes(channelType)
      ? selectedChannels.filter(c => c !== channelType)
      : [...selectedChannels, channelType]

    setSelectedChannels(newSelected)
    updateChannels(newSelected, channelConfigs)
  }

  const updateChannelConfig = (channelType: string, field: string, value: string) => {
    const newConfigs = {
      ...channelConfigs,
      [channelType]: {
        ...channelConfigs[channelType],
        [field]: value
      }
    }
    setChannelConfigs(newConfigs)
    updateChannels(selectedChannels, newConfigs)
  }

  const updateChannels = (selected: string[], configs: Record<string, any>) => {
    const newChannels = selected.map(type => ({
      type,
      config: configs[type] || {}
    }))
    onChange(newChannels)
  }

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold mb-2">Select Channels</h3>
        <p className="text-sm text-gray-600 mb-4">
          Choose which messaging platforms you want to connect your bot to.
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        {availableChannels.map(channel => {
          const Icon = channel.icon
          const isSelected = selectedChannels.includes(channel.type)

          return (
            <div key={channel.type}>
              <Card
                className={`p-4 cursor-pointer transition-all ${
                  isSelected ? 'ring-2 ring-purple-600' : 'hover:shadow-md'
                }`}
                onClick={() => toggleChannel(channel.type)}
              >
                <div className="flex items-start space-x-3">
                  <Checkbox
                    checked={isSelected}
                    onCheckedChange={() => toggleChannel(channel.type)}
                    onClick={(e) => e.stopPropagation()}
                  />
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-1">
                      <Icon className="h-5 w-5 text-purple-600" />
                      <span className="font-semibold">{channel.name}</span>
                      {channel.popular && (
                        <Badge variant="secondary" className="text-xs">Popular</Badge>
                      )}
                      {channel.badge && (
                        <Badge className="text-xs bg-green-500">{channel.badge}</Badge>
                      )}
                    </div>
                    <p className="text-sm text-gray-600">{channel.description}</p>
                    {channel.helpUrl && (
                      <a
                        href={channel.helpUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs text-purple-600 hover:underline mt-1 inline-block"
                        onClick={(e) => e.stopPropagation()}
                      >
                        Setup Guide →
                      </a>
                    )}
                  </div>
                </div>
              </Card>

              {/* Configuration Fields */}
              {isSelected && channel.fields && (
                <Card className="mt-2 p-4 bg-purple-50">
                  <div className="space-y-3">
                    {channel.fields.map(field => (
                      <div key={field.key}>
                        <Label htmlFor={`${channel.type}-${field.key}`} className="text-sm">
                          {field.label}
                          {field.required && <span className="text-red-500 ml-1">*</span>}
                        </Label>
                        {field.type === 'textarea' ? (
                          <textarea
                            id={`${channel.type}-${field.key}`}
                            placeholder={field.placeholder}
                            value={channelConfigs[channel.type]?.[field.key] || ''}
                            onChange={(e) => updateChannelConfig(channel.type, field.key, e.target.value)}
                            className="w-full min-h-[100px] rounded-md border border-input bg-white px-3 py-2 text-sm"
                            onClick={(e) => e.stopPropagation()}
                          />
                        ) : (
                          <Input
                            id={`${channel.type}-${field.key}`}
                            type={field.type}
                            placeholder={field.placeholder}
                            value={channelConfigs[channel.type]?.[field.key] || ''}
                            onChange={(e) => updateChannelConfig(channel.type, field.key, e.target.value)}
                            onClick={(e) => e.stopPropagation()}
                          />
                        )}
                      </div>
                    ))}
                  </div>
                </Card>
              )}
            </div>
          )
        })}
      </div>

      {selectedChannels.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          Select at least one channel to continue
        </div>
      )}
    </div>
  )
}
