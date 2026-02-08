'use client'

import { Check } from 'lucide-react'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

const plans = [
  {
    id: 'MONTHLY',
    name: 'Monthly',
    price: 29,
    period: '/month',
    description: 'Perfect for trying out',
    features: ['All features included', 'Unlimited messages', 'All channels', '24/7 support']
  },
  {
    id: 'THREE_MONTH',
    name: '3 Months',
    price: 75,
    pricePerMonth: 25,
    period: '/3 months',
    discount: 13,
    badge: 'Save 13%',
    description: 'Best for short-term projects',
    features: ['All features included', 'Unlimited messages', 'All channels', '24/7 support', 'Save $12']
  },
  {
    id: 'YEARLY',
    name: 'Yearly',
    price: 299,
    pricePerMonth: 24.92,
    period: '/year',
    discount: 14,
    badge: 'Best Value',
    popular: true,
    description: 'Best value for long-term use',
    features: ['All features included', 'Unlimited messages', 'All channels', 'Priority support', 'Save $49']
  }
]

interface PlanSelectionProps {
  selectedPlan: string
  onSelect: (plan: string) => void
}

export default function PlanSelection({ selectedPlan, onSelect }: PlanSelectionProps) {
  return (
    <div className="grid md:grid-cols-3 gap-6">
      {plans.map(plan => (
        <Card
          key={plan.id}
          className={`relative cursor-pointer border border-white/10 bg-white/5 transition-all ${
            selectedPlan === plan.id
              ? 'ring-2 ring-[var(--claw-mint)] shadow-[0_20px_60px_rgba(0,0,0,0.35)]'
              : 'hover:border-[var(--claw-mint)]/30'
          } ${plan.popular ? 'border-[var(--claw-mint)]/40' : ''}`}
          onClick={() => onSelect(plan.id)}
        >
          {plan.badge && (
            <div className="absolute -top-3 left-1/2 -translate-x-1/2">
              <Badge className="bg-[var(--claw-mint)] text-[#0b0f0d]">{plan.badge}</Badge>
            </div>
          )}

          <div className="p-6">
            <h3 className="text-xl font-bold mb-2">{plan.name}</h3>
            <div className="mb-4">
              <span className="text-4xl font-bold">${plan.price}</span>
              <span className="text-[#a5b7b0]">{plan.period}</span>
              {plan.pricePerMonth && (
                <p className="text-sm text-[#8fa29a] mt-1">
                  ${plan.pricePerMonth}/month
                </p>
              )}
            </div>
            <p className="text-[#c7d6cf] text-sm mb-6">{plan.description}</p>

            <ul className="space-y-3">
              {plan.features.map((feature, index) => (
                <li key={index} className="flex items-start">
                  <Check className="h-5 w-5 text-[var(--claw-mint)] mr-2 flex-shrink-0" />
                  <span className="text-sm">{feature}</span>
                </li>
              ))}
            </ul>

            {selectedPlan === plan.id && (
              <div className="mt-6 p-3 bg-[var(--claw-mint)]/10 rounded-lg text-center">
                <span className="text-[var(--claw-mint)] font-semibold">Selected</span>
              </div>
            )}
          </div>
        </Card>
      ))}
    </div>
  )
}
