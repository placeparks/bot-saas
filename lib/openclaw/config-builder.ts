import { AIProvider, ChannelType } from '@prisma/client'

export interface UserConfiguration {
  provider: AIProvider
  apiKey: string
  model?: string
  channels: {
    type: ChannelType
    config: Record<string, any>
  }[]
  webSearchEnabled?: boolean
  braveApiKey?: string
  browserEnabled?: boolean
  ttsEnabled?: boolean
  elevenlabsApiKey?: string
  canvasEnabled?: boolean
  cronEnabled?: boolean
  memoryEnabled?: boolean
  workspace?: string
  agentName?: string
  systemPrompt?: string
  thinkingMode?: string
  sessionMode?: string
  dmPolicy?: string
  gatewayToken?: string
}

export function generateOpenClawConfig(userConfig: UserConfiguration) {
  const normalizeAllowlist = (value: any): string[] => {
    if (!value) return []
    if (Array.isArray(value)) return value.filter(Boolean).map(String)
    if (typeof value === 'string') {
      return value
        .split(',')
        .map(v => v.trim())
        .filter(Boolean)
    }
    return []
  }

  const normalizeGuilds = (value: any): Record<string, any> | undefined => {
    if (!value) return undefined
    if (typeof value === 'object' && !Array.isArray(value)) return value
    const ids = Array.isArray(value)
      ? value
      : String(value)
          .split(',')
          .map(v => v.trim())
          .filter(Boolean)
    if (ids.length === 0) return undefined
    return Object.fromEntries(ids.map(id => [id, { enabled: true }]))
  }

  const config: any = {
    gateway: {
      bind: 'lan',
      port: 18789,
      mode: 'local',
      
      auth: {
        mode: 'token',
        token: userConfig.gatewayToken
      }
    },
    agents: {
      defaults: {
        workspace: userConfig.workspace || '~/.openclaw/workspace',
        model: {
          primary: userConfig.model || (
            userConfig.provider === 'ANTHROPIC'
              ? 'anthropic/claude-opus-4-5'
              : 'openai/gpt-5.2'
          )
        }
      }
    },
    channels: {},
    tools: {
      web: {
        search: {
          enabled: userConfig.webSearchEnabled || false,
          ...(userConfig.braveApiKey && { apiKey: userConfig.braveApiKey })
        }
      }
    }
  }

  // Add agent name/identity
  if (userConfig.agentName) {
    config.agents.defaults.identity = {
      name: userConfig.agentName
    }
  }

  // Add system prompt
  if (userConfig.systemPrompt) {
    config.agents.defaults.systemPrompt = userConfig.systemPrompt
  }

  // Add thinking mode
  if (userConfig.thinkingMode) {
    config.agents.defaults.thinking = userConfig.thinkingMode
  }

  // Add session settings
  if (userConfig.sessionMode) {
    config.session = {
      mode: userConfig.sessionMode
    }
  }

  // Configure channels
  userConfig.channels.forEach(channel => {
    const channelKey = channel.type.toLowerCase()

    switch (channel.type) {
      case 'WHATSAPP':
        config.channels.whatsapp = {
          allowFrom: normalizeAllowlist(channel.config.allowlist),
          dmPolicy: channel.config.dmPolicy || userConfig.dmPolicy || 'pairing',
          ...(channel.config.groups && { groups: channel.config.groups }),
          ...(channel.config.selfChatMode && { selfChatMode: true })
        }
        break

      case 'TELEGRAM':
        config.channels.telegram = {
          enabled: true,
          botToken: channel.config.botToken,
          allowFrom: normalizeAllowlist(channel.config.allowlist),
          dmPolicy: userConfig.dmPolicy || 'pairing'
        }
        break

      case 'DISCORD':
        config.channels.discord = {
          enabled: true,
          token: channel.config.token,
          dm: {
            policy: userConfig.dmPolicy || 'pairing',
            allowFrom: normalizeAllowlist(channel.config.allowlist)
          },
          ...(normalizeGuilds(channel.config.guilds) && { guilds: normalizeGuilds(channel.config.guilds) })
        }
        break

      case 'SLACK':
        config.channels.slack = {
          enabled: true,
          botToken: channel.config.botToken,
          appToken: channel.config.appToken,
          dm: {
            policy: userConfig.dmPolicy || 'pairing',
            allowFrom: normalizeAllowlist(channel.config.allowlist)
          }
        }
        break

      case 'SIGNAL':
        config.channels.signal = {
          enabled: true,
          phoneNumber: channel.config.phoneNumber,
          allowFrom: normalizeAllowlist(channel.config.allowlist)
        }
        break

      case 'GOOGLE_CHAT':
        config.channels.googlechat = {
          enabled: true,
          serviceAccount: channel.config.serviceAccount
        }
        break

      case 'MATRIX':
        config.channels.matrix = {
          enabled: true,
          homeserverUrl: channel.config.homeserverUrl,
          accessToken: channel.config.accessToken,
          userId: channel.config.userId
        }
        break
    }
  })

  // Add skills configuration
  config.skills = {
    entries: {}
  }

  if (userConfig.ttsEnabled && userConfig.elevenlabsApiKey) {
    config.tts = {
      enabled: true,
      provider: 'elevenlabs',
      elevenlabs: {
        apiKey: userConfig.elevenlabsApiKey
      }
    }
  }

  if (userConfig.browserEnabled) {
    config.browser = {
      enabled: true
    }
  }

  if (userConfig.canvasEnabled) {
    config.canvas = {
      enabled: true
    }
  }

  if (userConfig.cronEnabled) {
    config.cron = {
      enabled: true
    }
  }

  if (userConfig.memoryEnabled) {
    config.memory = {
      enabled: true
    }
  }

  return config
}

export function buildEnvironmentVariables(userConfig: UserConfiguration): Record<string, string> {
  const env: Record<string, string> = {}

  // Add AI provider API key
  if (userConfig.provider === 'ANTHROPIC') {
    env.ANTHROPIC_API_KEY = userConfig.apiKey
  } else if (userConfig.provider === 'OPENAI') {
    env.OPENAI_API_KEY = userConfig.apiKey
  }

  // Add channel-specific tokens
  userConfig.channels.forEach(channel => {
    switch (channel.type) {
      case 'TELEGRAM':
        env.TELEGRAM_BOT_TOKEN = channel.config.botToken
        break
      case 'DISCORD':
        env.DISCORD_TOKEN = channel.config.token
        env.DISCORD_APPLICATION_ID = channel.config.applicationId
        break
      case 'SLACK':
        env.SLACK_BOT_TOKEN = channel.config.botToken
        env.SLACK_APP_TOKEN = channel.config.appToken
        break
    }
  })

  // Add skill API keys
  if (userConfig.braveApiKey) {
    env.BRAVE_API_KEY = userConfig.braveApiKey
  }

  if (userConfig.elevenlabsApiKey) {
    env.ELEVENLABS_API_KEY = userConfig.elevenlabsApiKey
  }

  return env
}
