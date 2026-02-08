'use client'

export const dynamic = 'force-dynamic'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Check, Sparkles, Shield, ArrowRight, ArrowLeft } from 'lucide-react'
import PlanSelection from '@/components/forms/plan-selection'
import ProviderConfig from '@/components/forms/provider-config'
import ChannelSelector from '@/components/forms/channel-selector'
import SkillsConfig from '@/components/forms/skills-config'

const steps = [
  { id: 1, name: 'Choose Plan', description: 'Select your subscription' },
  { id: 2, name: 'AI Provider', description: 'Configure your AI model' },
  { id: 3, name: 'Channels', description: 'Select messaging platforms' },
  { id: 4, name: 'Skills', description: 'Enable features (optional)' },
]

export default function OnboardPage() {
  const router = useRouter()
  const { status } = useSession()
  const [currentStep, setCurrentStep] = useState(1)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.replace('/login')
    }
  }, [status, router])

  const [config, setConfig] = useState({
    plan: 'MONTHLY',
    provider: 'ANTHROPIC',
    apiKey: '',
    model: '',
    channels: [],
    webSearchEnabled: false,
    braveApiKey: '',
    browserEnabled: false,
    ttsEnabled: false,
    elevenlabsApiKey: '',
    canvasEnabled: false,
    cronEnabled: false,
    memoryEnabled: false,
  })

  const updateConfig = (updates: any) => {
    setConfig(prev => ({ ...prev, ...updates }))
  }

  const nextStep = () => {
    if (currentStep < steps.length) {
      setCurrentStep(currentStep + 1)
    } else {
      handleCheckout()
    }
  }

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1)
    }
  }

  const handleCheckout = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/stripe/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ plan: config.plan, config })
      })

      const data = await response.json()

      if (!response.ok) {
        console.error('API Error:', data)
        alert(`Checkout failed: ${data.error || 'Unknown error'}`)
        return
      }

      if (data.url) {
        window.location.href = data.url
        return
      }

      alert('Failed to initialize checkout')
    } catch (error) {
      console.error('Checkout error:', error)
      alert('Checkout failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div
      className="min-h-screen bg-[#0b0f0d] text-[#e9f3ee] [--claw-ink:#0b0f0d] [--claw-mint:#7df3c6] [--claw-ember:#ffb35a] [--claw-glow:rgba(125,243,198,0.28)] py-12"
      style={{ fontFamily: "'Space Grotesk', 'Sora', 'Poppins', sans-serif" }}
    >
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-24 -right-16 h-56 w-56 rounded-full bg-[var(--claw-mint)]/12 blur-3xl" />
        <div className="absolute -bottom-24 -left-20 h-72 w-72 rounded-full bg-[var(--claw-ember)]/12 blur-3xl" />
        <div className="absolute left-1/2 top-32 h-56 w-56 -translate-x-1/2 rounded-full bg-white/5 blur-3xl" />
      </div>

      <div className="container mx-auto px-6 max-w-6xl relative">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 rounded-full border border-[var(--claw-mint)]/30 bg-[var(--claw-mint)]/10 px-4 py-1 text-xs uppercase tracking-[0.3em] text-[var(--claw-mint)]">
            <Sparkles className="h-3 w-3" /> onboarding
          </div>
          <h1 className="mt-6 text-4xl md:text-5xl font-semibold">Build your ClawOS agent</h1>
          <p className="mt-3 text-[#c7d6cf]">
            Four steps. Clear choices. We handle the deploy.
          </p>
        </div>

        {/* Progress Steps */}
        <div className="mb-10">
          <div className="flex justify-between items-center gap-2">
            {steps.map((step, index) => (
              <div key={step.id} className="flex items-center flex-1">
                <div className="flex flex-col items-center flex-1">
                  <div
                    className={`w-12 h-12 rounded-full flex items-center justify-center font-semibold transition-colors ${
                      currentStep > step.id
                        ? 'bg-[var(--claw-mint)] text-[#0b0f0d]'
                        : currentStep === step.id
                        ? 'bg-white/10 text-[var(--claw-mint)] border border-[var(--claw-mint)]/50'
                        : 'bg-white/5 text-[#8fa29a] border border-white/10'
                    }`}
                  >
                    {currentStep > step.id ? <Check className="h-6 w-6" /> : step.id}
                  </div>
                  <div className="mt-2 text-center">
                    <p className="font-semibold text-sm">{step.name}</p>
                    <p className="text-xs text-[#8fa29a]">{step.description}</p>
                  </div>
                </div>
                {index < steps.length - 1 && (
                  <div
                    className={`h-1 flex-1 mx-2 rounded-full transition-colors ${
                      currentStep > step.id ? 'bg-[var(--claw-mint)]' : 'bg-white/10'
                    }`}
                  />
                )}
              </div>
            ))}
          </div>
        </div>

        <div className="grid gap-8 lg:grid-cols-[1.1fr_0.45fr] items-start">
          {/* Step Content */}
          <Card className="border border-white/10 bg-white/5 text-[#e9f3ee] shadow-[0_30px_90px_rgba(0,0,0,0.4)]">
            <CardHeader>
              <CardTitle>{steps[currentStep - 1].name}</CardTitle>
              <CardDescription className="text-[#a5b7b0]">{steps[currentStep - 1].description}</CardDescription>
            </CardHeader>
            <CardContent>
              {currentStep === 1 && (
                <PlanSelection
                  selectedPlan={config.plan}
                  onSelect={(plan) => updateConfig({ plan })}
                />
              )}
              {currentStep === 2 && (
                <ProviderConfig
                  config={config}
                  onChange={updateConfig}
                />
              )}
              {currentStep === 3 && (
                <ChannelSelector
                  channels={config.channels}
                  onChange={(channels) => updateConfig({ channels })}
                />
              )}
              {currentStep === 4 && (
                <SkillsConfig
                  config={config}
                  onChange={updateConfig}
                />
              )}
            </CardContent>
          </Card>

          {/* Summary */}
          <div className="space-y-6">
            <Card className="border border-white/10 bg-white/5 text-[#e9f3ee] shadow-[0_20px_60px_rgba(0,0,0,0.35)]">
              <CardHeader>
                <CardTitle className="text-lg">Setup summary</CardTitle>
                <CardDescription className="text-[#9fb1aa]">Quick glance before checkout.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4 text-sm text-[#cfe3db]">
                <div className="flex items-center justify-between">
                  <span className="text-[#8fa29a]">Plan</span>
                  <span className="font-semibold">{config.plan}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-[#8fa29a]">Provider</span>
                  <span className="font-semibold">
                    {currentStep >= 2 ? config.provider : 'Select in step 2'}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-[#8fa29a]">Channels</span>
                  <span className="font-semibold">
                    {currentStep >= 3 ? (config.channels.length || 0) : 'Select in step 3'}
                  </span>
                </div>
                <div className="rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-xs text-[#a5b7b0]">
                  Your deployment starts after payment and completes in a few minutes.
                </div>
              </CardContent>
            </Card>

            <div className="rounded-2xl border border-white/10 bg-white/5 p-4 text-xs text-[#a5b7b0]">
              <div className="flex items-center gap-2">
                <Shield className="h-4 w-4 text-[var(--claw-mint)]" />
                Your keys never leave your private instance.
              </div>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <div className="mt-10 flex flex-wrap items-center justify-between gap-4">
          <Button
            variant="outline"
            onClick={prevStep}
            disabled={currentStep === 1}
            className="border-[var(--claw-mint)]/40 text-[var(--claw-mint)] hover:border-[var(--claw-mint)]/80 hover:text-[var(--claw-mint)]"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          <div className="flex items-center gap-3 text-xs text-[#8fa29a]">
            <Shield className="h-4 w-4 text-[var(--claw-mint)]" />
            Secure checkout. Cancel any time.
          </div>
          <Button
            onClick={nextStep}
            disabled={loading}
            className="bg-[var(--claw-mint)] text-[#0b0f0d] hover:brightness-110"
          >
            {loading ? 'Processing...' : currentStep === steps.length ? 'Proceed to Payment' : 'Next Step'}
            {!loading && <ArrowRight className="h-4 w-4 ml-2" />}
          </Button>
        </div>
      </div>
    </div>
  )
}
