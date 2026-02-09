'use client'

import Link from 'next/link'
import { useState } from 'react'
import { Check, Bot, Sparkles, Shield, ArrowRight, Menu, X } from 'lucide-react'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

export default function PricingPage() {
  const [mobileOpen, setMobileOpen] = useState(false)

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
    <div
      className="min-h-screen bg-[#0b0f0d] text-[#e9f3ee] [--claw-ink:#0b0f0d] [--claw-mint:#7df3c6] [--claw-ember:#ffb35a] [--claw-glow:rgba(125,243,198,0.28)]"
      style={{ fontFamily: "'Space Grotesk', 'Sora', 'Poppins', sans-serif" }}
    >
      {/* Header */}
      <header className="container mx-auto px-6 pt-8">
        <nav className="flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3">
            <div className="h-11 w-11 rounded-2xl bg-[var(--claw-mint)]/10 border border-[var(--claw-mint)]/30 flex items-center justify-center shadow-[0_0_30px_var(--claw-glow)]">
              <Bot className="h-6 w-6 text-[var(--claw-mint)]" />
            </div>
            <div>
              <span className="text-2xl font-semibold tracking-tight">ClawOS</span>
              <div className="text-xs uppercase tracking-[0.3em] text-[var(--claw-mint)]/70">OpenClaw Cloud</div>
            </div>
          </Link>
          <div className="hidden md:flex items-center gap-6 text-sm">
         {/*   <Link href="/features" className="text-[#c7d6cf] hover:text-white transition">Features</Link>*/}
            <Link href="/login" className="text-[#c7d6cf] hover:text-white transition">Login</Link>
            <Link
              href="/register"
              className="bg-[var(--claw-mint)] text-[#0b0f0d] px-5 py-2 rounded-full font-semibold hover:brightness-110 transition shadow-[0_10px_40px_rgba(125,243,198,0.2)]"
            >
              Get Started
            </Link>
          </div>
          <button
            type="button"
            className="md:hidden inline-flex items-center justify-center h-10 w-10 rounded-full border border-white/10 bg-white/5 text-[var(--claw-mint)]"
            aria-label="Toggle navigation"
            onClick={() => setMobileOpen((prev) => !prev)}
          >
            {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </nav>
        {mobileOpen && (
          <div className="mt-4 rounded-2xl border border-white/10 bg-[#0f1713] p-4 md:hidden">
            <div className="flex flex-col gap-3 text-sm">
             { /*<Link href="/features" className="text-[#c7d6cf] hover:text-white transition" onClick={() => setMobileOpen(false)}>Features</Link>*/}
              <Link href="/pricing" className="text-[#c7d6cf] hover:text-white transition" onClick={() => setMobileOpen(false)}>Pricing</Link>
              <Link href="/login" className="text-[#c7d6cf] hover:text-white transition" onClick={() => setMobileOpen(false)}>Login</Link>
              <Link
                href="/register"
                className="mt-2 inline-flex items-center justify-center rounded-full bg-[var(--claw-mint)] px-5 py-2 font-semibold text-[#0b0f0d] hover:brightness-110 transition"
                onClick={() => setMobileOpen(false)}
              >
                Get Started
              </Link>
            </div>
          </div>
        )}
      </header>

      <main className="container mx-auto px-6 py-16">
        <div className="relative overflow-hidden rounded-[32px] border border-white/10 bg-gradient-to-br from-[#0f1713] via-[#0b0f0d] to-[#0b0f0d] p-10 md:p-14 shadow-[0_40px_120px_rgba(0,0,0,0.45)]">
          <div className="absolute -top-24 -right-16 h-56 w-56 rounded-full bg-[var(--claw-mint)]/15 blur-3xl" />
          <div className="absolute -bottom-20 -left-20 h-64 w-64 rounded-full bg-[var(--claw-ember)]/15 blur-3xl" />
          <div className="relative grid lg:grid-cols-[1.2fr_0.8fr] gap-10 items-center">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full border border-[var(--claw-mint)]/30 bg-[var(--claw-mint)]/10 px-4 py-1 text-xs uppercase tracking-[0.3em] text-[var(--claw-mint)]">
                <Sparkles className="h-3 w-3" /> pricing
              </div>
              <h1 className="mt-6 text-4xl md:text-5xl font-semibold">Simple, premium plans for ClawOS</h1>
              <p className="mt-4 text-[#c7d6cf]">
                All plans include full OpenClaw functionality, private instances, and multi‑channel support.
              </p>
              <div className="mt-6 flex flex-wrap items-center gap-4 text-sm text-[#a5b7b0]">
                <div className="flex items-center gap-2"><Shield className="h-4 w-4 text-[var(--claw-mint)]" /> Private containers</div>
                <div className="flex items-center gap-2"><Check className="h-4 w-4 text-[var(--claw-mint)]" /> Unlimited messages</div>
                <div className="flex items-center gap-2"><Check className="h-4 w-4 text-[var(--claw-mint)]" /> All channels</div>
              </div>
            </div>
            <div className="rounded-[26px] border border-white/10 bg-white/5 p-6 text-sm text-[#cfe3db]">
              <div className="text-xs uppercase tracking-[0.2em] text-[#8fb3a6]">Included</div>
              <ul className="mt-4 space-y-2">
                {['OpenClaw gateway', 'Channel pairing', 'Skills & extensions', 'Web search & browser', 'Secure keys'].map(item => (
                  <li key={item} className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-[var(--claw-mint)]" /> {item}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-6 mt-14">
          {plans.map((plan) => (
            <Card
              key={plan.name}
              className={`relative rounded-[26px] border border-white/10 bg-white/5 p-6 text-[#e9f3ee] ${
                plan.popular ? 'ring-1 ring-[var(--claw-mint)]/60 shadow-[0_20px_60px_rgba(0,0,0,0.35)]' : ''
              }`}
            >
              {plan.badge && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                  <Badge className="bg-[var(--claw-mint)] text-[#0b0f0d] px-4 py-1">
                    {plan.badge}
                  </Badge>
                </div>
              )}

              <div className="mb-6">
                <h3 className="text-xl font-semibold">{plan.name}</h3>
                <p className="mt-1 text-sm text-[#a5b7b0]">{plan.description}</p>
                <div className="mt-4 flex items-end gap-2">
                  <span className="text-4xl font-semibold">${plan.price}</span>
                  <span className="text-sm text-[#a5b7b0]">{plan.period}</span>
                </div>
                {plan.pricePerMonth && (
                  <p className="text-xs text-[#8fa29a] mt-2">${plan.pricePerMonth}/month effective</p>
                )}
              </div>

              <ul className="space-y-3 mb-6">
                {plan.features.map((feature, index) => (
                  <li key={index} className="flex items-start text-sm text-[#cfe3db]">
                    <Check className="h-4 w-4 text-[var(--claw-mint)] mr-2 mt-0.5" />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>

              <Link
                href="/register"
                className={`block w-full text-center py-2 rounded-full text-sm font-semibold transition ${
                  plan.popular
                    ? 'bg-[var(--claw-mint)] text-[#0b0f0d] hover:brightness-110'
                    : 'border border-white/15 text-[#e9f3ee] hover:border-[var(--claw-mint)]/60'
                }`}
              >
                Get Started <ArrowRight className="inline h-4 w-4 ml-1" />
              </Link>
            </Card>
          ))}
        </div>

        {/* FAQ */}
        <div className="mt-16 max-w-3xl mx-auto">
          <h2 className="text-3xl font-semibold text-center">Frequently asked</h2>
          <div className="mt-10 space-y-6 text-[#c7d6cf]">
            <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
              <h3 className="font-semibold text-white">Can I change plans later?</h3>
              <p className="mt-2 text-sm">Yes. Upgrade or downgrade any time from your dashboard.</p>
            </div>
            <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
              <h3 className="font-semibold text-white">Do you offer refunds?</h3>
              <p className="mt-2 text-sm">We offer a 7‑day money‑back guarantee.</p>
            </div>
            <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
              <h3 className="font-semibold text-white">What payment methods do you accept?</h3>
              <p className="mt-2 text-sm">All major cards via Stripe.</p>
            </div>
            <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
              <h3 className="font-semibold text-white">Any hidden fees?</h3>
              <p className="mt-2 text-sm">No. AI provider API costs are billed directly by them.</p>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="mt-16 border-t border-white/10 py-10">
        <div className="container mx-auto px-6 text-center text-xs text-[#8fa29a]">
          <p>&copy; 2026 ClawOS. Built on OpenClaw. All rights reserved.</p>
        </div>
      </footer>
    </div>
  )
}
