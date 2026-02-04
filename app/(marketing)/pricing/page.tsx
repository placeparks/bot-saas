import Link from 'next/link'
import { Check, Bot } from 'lucide-react'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

export default function PricingPage() {
  const plans = [
    {
      name: 'Monthly',
      price: 29,
      period: '/month',
      description: 'Perfect for trying out',
      features: [
        'All features included',
        'Unlimited messages',
        'All channels (WhatsApp, Telegram, Discord, etc.)',
        'Skills & extensions',
        'Web search & browser',
        '24/7 support'
      ]
    },
    {
      name: '3 Months',
      price: 75,
      pricePerMonth: 25,
      period: '/3 months',
      discount: 13,
      badge: 'Save $12',
      popular: true,
      description: 'Best for short-term projects',
      features: [
        'All features included',
        'Unlimited messages',
        'All channels (WhatsApp, Telegram, Discord, etc.)',
        'Skills & extensions',
        'Web search & browser',
        'Priority support',
        'Save $12'
      ]
    },
    {
      name: 'Yearly',
      price: 299,
      pricePerMonth: 24.92,
      period: '/year',
      discount: 14,
      badge: 'Best Value',
      description: 'Best value for long-term use',
      features: [
        'All features included',
        'Unlimited messages',
        'All channels (WhatsApp, Telegram, Discord, etc.)',
        'Skills & extensions',
        'Web search & browser',
        'Priority support',
        'Save $49 annually'
      ]
    }
  ]

  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-50 to-white">
      {/* Header */}
      <header className="container mx-auto px-4 py-6">
        <nav className="flex items-center justify-between">
          <Link href="/" className="flex items-center space-x-2">
            <Bot className="h-8 w-8 text-purple-600" />
            <span className="text-2xl font-bold">Kainat</span>
          </Link>
          <div className="flex items-center space-x-6">
            <Link href="/features" className="text-gray-600 hover:text-gray-900">
              Features
            </Link>
            <Link href="/login" className="text-gray-600 hover:text-gray-900">
              Login
            </Link>
            <Link
              href="/register"
              className="bg-purple-600 text-white px-6 py-2 rounded-lg hover:bg-purple-700 transition"
            >
              Get Started
            </Link>
          </div>
        </nav>
      </header>

      <main className="container mx-auto px-4 py-20">
        <div className="text-center mb-16">
          <h1 className="text-5xl font-bold mb-4">Simple, Transparent Pricing</h1>
          <p className="text-xl text-gray-600">
            Choose the plan that works for you. All plans include full features.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {plans.map((plan) => (
            <Card
              key={plan.name}
              className={`relative p-8 ${
                plan.popular ? 'ring-2 ring-purple-600 shadow-2xl transform scale-105' : 'shadow-lg'
              }`}
            >
              {plan.badge && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                  <Badge className="bg-purple-600 text-white px-4 py-1">
                    {plan.badge}
                  </Badge>
                </div>
              )}

              <div className="text-center mb-8">
                <h3 className="text-2xl font-bold mb-2">{plan.name}</h3>
                <div className="mb-4">
                  <span className="text-5xl font-bold">${plan.price}</span>
                  <span className="text-gray-600">{plan.period}</span>
                  {plan.pricePerMonth && (
                    <p className="text-sm text-gray-500 mt-2">
                      ${plan.pricePerMonth}/month
                    </p>
                  )}
                </div>
                <p className="text-gray-600">{plan.description}</p>
              </div>

              <ul className="space-y-4 mb-8">
                {plan.features.map((feature, index) => (
                  <li key={index} className="flex items-start">
                    <Check className="h-5 w-5 text-green-500 mr-3 flex-shrink-0 mt-0.5" />
                    <span className="text-sm">{feature}</span>
                  </li>
                ))}
              </ul>

              <Link
                href="/register"
                className={`block w-full text-center py-3 rounded-lg font-semibold transition ${
                  plan.popular
                    ? 'bg-purple-600 text-white hover:bg-purple-700'
                    : 'bg-gray-100 text-gray-900 hover:bg-gray-200'
                }`}
              >
                Get Started
              </Link>
            </Card>
          ))}
        </div>

        {/* FAQ */}
        <div className="mt-24 max-w-3xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12">Frequently Asked Questions</h2>
          <div className="space-y-6">
            <div>
              <h3 className="font-semibold text-lg mb-2">Can I change plans later?</h3>
              <p className="text-gray-600">
                Yes! You can upgrade or downgrade your plan at any time from your dashboard.
              </p>
            </div>
            <div>
              <h3 className="font-semibold text-lg mb-2">Do you offer refunds?</h3>
              <p className="text-gray-600">
                Yes, we offer a 7-day money-back guarantee if you're not satisfied.
              </p>
            </div>
            <div>
              <h3 className="font-semibold text-lg mb-2">What payment methods do you accept?</h3>
              <p className="text-gray-600">
                We accept all major credit cards through Stripe, our secure payment processor.
              </p>
            </div>
            <div>
              <h3 className="font-semibold text-lg mb-2">Are there any hidden fees?</h3>
              <p className="text-gray-600">
                No hidden fees! The price you see is what you pay. API costs for AI providers (Anthropic/OpenAI) are separate and billed directly by them.
              </p>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t mt-24 py-12">
        <div className="container mx-auto px-4 text-center text-gray-600">
          <p>&copy; 2026 Kainat. Built on top of OpenClaw. All rights reserved.</p>
        </div>
      </footer>
    </div>
  )
}
