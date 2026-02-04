'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Check } from 'lucide-react'
import PlanSelection from '@/components/forms/plan-selection'
import ProviderConfig from '@/components/forms/provider-config'
import ChannelSelector from '@/components/forms/channel-selector'
import SkillsConfig from '@/components/forms/skills-config'
import { loadStripe } from '@stripe/stripe-js'

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!)

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

      const { sessionId } = data
      const stripe = await stripePromise

      if (stripe && sessionId) {
        await stripe.redirectToCheckout({ sessionId })
      } else {
        alert('Failed to initialize checkout')
      }
    } catch (error) {
      console.error('Checkout error:', error)
      alert('Checkout failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-50 to-white py-12">
      <div className="container mx-auto px-4 max-w-4xl">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-2">Deploy Your AI Assistant</h1>
          <p className="text-gray-600">Configure your bot in 4 simple steps</p>
        </div>

        {/* Progress Steps */}
        <div className="mb-12">
          <div className="flex justify-between items-center">
            {steps.map((step, index) => (
              <div key={step.id} className="flex items-center flex-1">
                <div className="flex flex-col items-center flex-1">
                  <div
                    className={`w-12 h-12 rounded-full flex items-center justify-center font-semibold transition-colors ${
                      currentStep > step.id
                        ? 'bg-green-500 text-white'
                        : currentStep === step.id
                        ? 'bg-purple-600 text-white'
                        : 'bg-gray-200 text-gray-600'
                    }`}
                  >
                    {currentStep > step.id ? <Check className="h-6 w-6" /> : step.id}
                  </div>
                  <div className="mt-2 text-center">
                    <p className="font-semibold text-sm">{step.name}</p>
                    <p className="text-xs text-gray-500">{step.description}</p>
                  </div>
                </div>
                {index < steps.length - 1 && (
                  <div
                    className={`h-1 flex-1 mx-2 transition-colors ${
                      currentStep > step.id ? 'bg-green-500' : 'bg-gray-200'
                    }`}
                  />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Step Content */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>{steps[currentStep - 1].name}</CardTitle>
            <CardDescription>{steps[currentStep - 1].description}</CardDescription>
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

        {/* Navigation */}
        <div className="flex justify-between">
          <Button
            variant="outline"
            onClick={prevStep}
            disabled={currentStep === 1}
          >
            Back
          </Button>
          <Button
            onClick={nextStep}
            disabled={loading}
          >
            {loading ? 'Processing...' : currentStep === steps.length ? 'Proceed to Payment' : 'Next Step'}
          </Button>
        </div>
      </div>
    </div>
  )
}
