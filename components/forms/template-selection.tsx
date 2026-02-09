'use client'

import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Headset, User, Hash, Briefcase, Sparkles } from 'lucide-react'

const templates = [
  {
    id: 'support',
    name: 'Customer Support Bot',
    description: 'A helpful support agent that answers questions, resolves issues, and escalates when needed.',
    badge: 'Popular',
    icon: Headset,
    chips: ['WHATSAPP', 'TELEGRAM', 'Memory'],
    preset: {
      provider: 'ANTHROPIC',
      channels: [
        { type: 'WHATSAPP', config: { dmPolicy: 'pairing' } },
        { type: 'TELEGRAM', config: {} }
      ],
      memoryEnabled: true
    }
  },
  {
    id: 'assistant',
    name: 'Personal Assistant',
    description: 'Your all‑purpose AI companion with web search, scheduling, and memory.',
    badge: 'Popular',
    icon: User,
    chips: ['WHATSAPP', 'TELEGRAM', 'DISCORD', 'Web Search', 'Memory', 'Scheduling'],
    preset: {
      provider: 'OPENAI',
      channels: [
        { type: 'WHATSAPP', config: { dmPolicy: 'pairing' } },
        { type: 'TELEGRAM', config: {} },
        { type: 'DISCORD', config: {} }
      ],
      webSearchEnabled: true,
      memoryEnabled: true,
      cronEnabled: true
    }
  },
  {
    id: 'discord-community',
    name: 'Discord Community Bot',
    description: 'Engage your Discord community with an AI that answers questions and moderates.',
    icon: Hash,
    chips: ['DISCORD', 'Web Search', 'Memory'],
    preset: {
      provider: 'OPENAI',
      channels: [
        { type: 'DISCORD', config: {} }
      ],
      webSearchEnabled: true,
      memoryEnabled: true
    }
  },
  {
    id: 'team-collab',
    name: 'Team Collaboration Bot',
    description: 'Boost team productivity with an AI that searches the web and helps with daily tasks.',
    icon: Briefcase,
    chips: ['SLACK', 'Web Search', 'Memory', 'Scheduling'],
    preset: {
      provider: 'ANTHROPIC',
      channels: [
        { type: 'SLACK', config: {} }
      ],
      webSearchEnabled: true,
      memoryEnabled: true,
      cronEnabled: true
    }
  },
  {
    id: 'scratch',
    name: 'Start from Scratch',
    description: 'Full control over every setting. Choose your own channels, model, skills, and system prompt.',
    icon: Sparkles,
    chips: [],
    preset: {
      channels: []
    }
  }
]

interface TemplateSelectionProps {
  selectedTemplate: string
  onSelect: (templateId: string, preset: Record<string, any>) => void
}

export default function TemplateSelection({ selectedTemplate, onSelect }: TemplateSelectionProps) {
  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold mb-2 text-[#e9f3ee]">Template</h3>
        <p className="text-sm text-[#a5b7b0] mb-4">
          Pick a template to pre‑configure your bot, or start from scratch for full control.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {templates.map((template) => {
          const Icon = template.icon
          const isSelected = selectedTemplate === template.id

          return (
            <Card
              key={template.id}
              className={`p-4 border border-white/10 bg-white/5 transition-all cursor-pointer ${
                isSelected ? 'ring-2 ring-[var(--claw-mint)] shadow-[0_18px_50px_rgba(0,0,0,0.35)]' : 'hover:border-[var(--claw-mint)]/30'
              }`}
              onClick={() => onSelect(template.id, template.preset)}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-start gap-3">
                  <div className="h-10 w-10 rounded-xl border border-white/10 bg-white/5 flex items-center justify-center">
                    <Icon className="h-5 w-5 text-[var(--claw-mint)]" />
                  </div>
                  <div>
                    <p className="font-semibold text-[#e9f3ee]">{template.name}</p>
                    <p className="text-sm text-[#a5b7b0] mt-1">{template.description}</p>
                  </div>
                </div>
                {template.badge && (
                  <Badge className="text-xs bg-[var(--claw-mint)] text-[#0b0f0d]">
                    {template.badge}
                  </Badge>
                )}
              </div>

              {template.chips.length > 0 && (
                <div className="mt-4 flex flex-wrap gap-2">
                  {template.chips.map((chip) => (
                    <span
                      key={chip}
                      className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-[#cfe3db]"
                    >
                      {chip}
                    </span>
                  ))}
                </div>
              )}

              <div className="mt-4">
                <Button
                  type="button"
                  variant="outline"
                  className={`border-white/15 ${
                    isSelected
                      ? 'text-[var(--claw-mint)] border-[var(--claw-mint)]/50'
                      : 'text-[#e9f3ee] hover:border-[var(--claw-mint)]/60'
                  }`}
                >
                  {isSelected ? 'Selected' : 'Choose Template'}
                </Button>
              </div>
            </Card>
          )
        })}
      </div>
    </div>
  )
}
