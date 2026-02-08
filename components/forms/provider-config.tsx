'use client'

import { useState } from 'react'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { ExternalLink, Eye, EyeOff } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface ProviderConfigProps {
  config: any
  onChange: (updates: any) => void
}

export default function ProviderConfig({ config, onChange }: ProviderConfigProps) {
  const [showApiKey, setShowApiKey] = useState(false)

  const providers = [
    {
      id: 'ANTHROPIC',
      name: 'Anthropic Claude',
      description: 'Best for reasoning, long context, and complex tasks',
      badge: 'Recommended',
      models: [
        { id: 'anthropic/claude-opus-4-5', name: 'Claude Opus 4.5 (Most Capable)' },
        { id: 'anthropic/claude-sonnet-4-5', name: 'Claude Sonnet 4.5 (Balanced)' }
      ],
      getKeyUrl: 'https://console.anthropic.com/settings/keys'
    },
    {
      id: 'OPENAI',
      name: 'OpenAI GPT',
      description: 'Great for general tasks and fast responses',
      models: [
        { id: 'openai/gpt-5.2', name: 'GPT-5.2 (Latest)' },
        { id: 'openai/gpt-5.2-mini', name: 'GPT-5.2 Mini (Faster)' }
      ],
      getKeyUrl: 'https://platform.openai.com/api-keys'
    }
  ]

  return (
    <div className="space-y-6">
      {/* Provider Selection */}
      <div>
        <Label className="text-lg mb-4 block text-[#e9f3ee]">Choose AI Provider</Label>
        <div className="grid md:grid-cols-2 gap-4">
          {providers.map(provider => (
            <Card
              key={provider.id}
              className={`p-4 cursor-pointer border border-white/10 bg-white/5 transition-all ${
                config.provider === provider.id
                  ? 'ring-2 ring-[var(--claw-mint)] shadow-[0_18px_50px_rgba(0,0,0,0.35)]'
                  : 'hover:border-[var(--claw-mint)]/30'
              }`}
              onClick={() => onChange({ provider: provider.id })}
            >
              <div className="flex items-start justify-between mb-2">
                <h4 className="font-semibold text-[#e9f3ee]">{provider.name}</h4>
                {provider.badge && (
                  <Badge className="bg-[var(--claw-mint)] text-[#0b0f0d] text-xs">
                    {provider.badge}
                  </Badge>
                )}
              </div>
              <p className="text-sm text-[#a5b7b0]">{provider.description}</p>
            </Card>
          ))}
        </div>
      </div>

      {/* API Key Input */}
      <div>
        <Label htmlFor="apiKey" className="text-lg mb-2 block text-[#e9f3ee]">
          API Key
        </Label>
        <p className="text-sm text-[#a5b7b0] mb-3">
          Your API key is encrypted and never shared. We use it only to run your bot.
        </p>
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Input
              id="apiKey"
              type={showApiKey ? 'text' : 'password'}
              placeholder={`Enter your ${providers.find(p => p.id === config.provider)?.name} API key`}
              value={config.apiKey}
              onChange={(e) => onChange({ apiKey: e.target.value })}
              className="pr-10 border-white/10 bg-white/5 text-[#e9f3ee] placeholder:text-[#6e827a]"
            />
            <button
              type="button"
              onClick={() => setShowApiKey(!showApiKey)}
              className="absolute right-3 top-1/2 -translate-y-1/2"
            >
              {showApiKey ? (
                <EyeOff className="h-4 w-4 text-[#8fa29a]" />
              ) : (
                <Eye className="h-4 w-4 text-[#8fa29a]" />
              )}
            </button>
          </div>
          <Button
            variant="outline"
            onClick={() => {
              const provider = providers.find(p => p.id === config.provider)
              if (provider) window.open(provider.getKeyUrl, '_blank')
            }}
            className="border-[var(--claw-mint)]/40 text-[var(--claw-mint)] hover:border-[var(--claw-mint)]/80 hover:text-[#e9f3ee]"
          >
            <ExternalLink className="h-4 w-4 mr-2" />
            Get Key
          </Button>
        </div>
      </div>

      {/* Model Selection (Optional) */}
      <div>
        <Label htmlFor="model" className="text-lg mb-2 block text-[#e9f3ee]">
          Model (Optional)
        </Label>
        <p className="text-sm text-[#a5b7b0] mb-3">
          We'll use the best model by default. Advanced users can override this.
        </p>
        <select
          id="model"
          className="w-full h-10 rounded-md border border-white/10 bg-white/5 px-3 py-2 text-sm text-[#e9f3ee]"
          value={config.model}
          onChange={(e) => onChange({ model: e.target.value })}
        >
          <option value="">Default (Recommended)</option>
          {providers
            .find(p => p.id === config.provider)
            ?.models.map(model => (
              <option key={model.id} value={model.id}>
                {model.name}
              </option>
            ))}
        </select>
      </div>
    </div>
  )
}
