import Link from 'next/link'
import { ArrowRight, Bot, MessageSquare, Zap, Shield, Check, Sparkles, Layers, Radar } from 'lucide-react'

export default function Home() {
  return (
    <div
      className="min-h-screen bg-[#0b0f0d] text-[#e9f3ee] [--claw-ink:#0b0f0d] [--claw-mint:#7df3c6] [--claw-teal:#1fb6a6] [--claw-sand:#f2e9d8] [--claw-glow:rgba(125,243,198,0.28)] [--claw-ember:#ffb35a]"
      style={{ fontFamily: "'Space Grotesk', 'Sora', 'Poppins', sans-serif" }}
    >
      {/* Header */}
      <header className="container mx-auto px-6 pt-8">
        <nav className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-11 w-11 rounded-2xl bg-[var(--claw-mint)]/10 border border-[var(--claw-mint)]/30 flex items-center justify-center shadow-[0_0_30px_var(--claw-glow)]">
              <Bot className="h-6 w-6 text-[var(--claw-mint)]" />
            </div>
            <div>
              <span className="text-2xl font-semibold tracking-tight">ClawOS</span>
              <div className="text-xs uppercase tracking-[0.3em] text-[var(--claw-mint)]/70">OpenClaw Cloud</div>
            </div>
          </div>
          <div className="hidden md:flex items-center gap-6 text-sm">
            <Link href="/features" className="text-[#c7d6cf] hover:text-white transition">Features</Link>
            <Link href="/pricing" className="text-[#c7d6cf] hover:text-white transition">Pricing</Link>
            <Link href="/login" className="text-[#c7d6cf] hover:text-white transition">Login</Link>
            <Link
              href="/register"
              className="bg-[var(--claw-mint)] text-[#0b0f0d] px-5 py-2 rounded-full font-semibold hover:brightness-110 transition shadow-[0_10px_40px_rgba(125,243,198,0.2)]"
            >
              Get Started
            </Link>
          </div>
        </nav>
      </header>

      {/* Hero Section */}
      <main className="container mx-auto px-6 py-16">
        <div className="relative overflow-hidden rounded-[32px] border border-white/10 bg-gradient-to-br from-[#0f1713] via-[#0b0f0d] to-[#0b0f0d] p-8 md:p-14 shadow-[0_40px_120px_rgba(0,0,0,0.45)]">
          <div className="absolute -top-28 -right-20 h-64 w-64 rounded-full bg-[var(--claw-mint)]/15 blur-3xl" />
          <div className="absolute -bottom-32 -left-24 h-72 w-72 rounded-full bg-[var(--claw-ember)]/15 blur-3xl" />

          <div className="relative grid lg:grid-cols-[1.1fr_0.9fr] gap-12 items-center">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full border border-[var(--claw-mint)]/30 bg-[var(--claw-mint)]/10 px-4 py-1 text-xs uppercase tracking-[0.3em] text-[var(--claw-mint)]">
                <Sparkles className="h-3 w-3" /> premium agents
              </div>
              <h1 className="mt-6 text-5xl md:text-6xl font-semibold leading-tight">
                The premium way to deploy
                <span className="text-[var(--claw-mint)]"> OpenClaw</span> agents
              </h1>
              <p className="mt-5 text-lg text-[#c7d6cf]">
                ClawOS spins up your private AI in minutes, wires it to the channels you already use,
                and keeps it secure, isolated, and effortless to manage.
              </p>
              <div className="mt-8 flex flex-wrap items-center gap-4">
                <Link
                  href="/register"
                  className="bg-[var(--claw-mint)] text-[#0b0f0d] px-7 py-3 rounded-full text-base font-semibold hover:brightness-110 transition inline-flex items-center gap-2"
                >
                  Launch ClawOS <ArrowRight className="h-4 w-4" />
                </Link>
                <Link
                  href="/pricing"
                  className="border border-white/20 text-[#e9f3ee] px-7 py-3 rounded-full text-base font-semibold hover:border-[var(--claw-mint)]/60 transition"
                >
                  See plans
                </Link>
              </div>
              <div className="mt-10 grid grid-cols-3 gap-4 text-center">
                {[
                  { label: 'Deploy time', value: '< 5 min' },
                  { label: 'Channels', value: '8+' },
                  { label: 'Uptime', value: '99.9%' }
                ].map((stat) => (
                  <div key={stat.label} className="rounded-2xl border border-white/10 bg-white/5 p-4">
                    <div className="text-xl font-semibold text-[var(--claw-mint)]">{stat.value}</div>
                    <div className="text-xs uppercase tracking-[0.2em] text-[#98a9a1]">{stat.label}</div>
                  </div>
                ))}
              </div>
            </div>

            <div className="relative">
              <div className="rounded-[28px] border border-white/10 bg-[#0f1613] p-6 shadow-[0_30px_80px_rgba(0,0,0,0.35)]">
                <div className="flex items-center justify-between">
                  <span className="text-sm uppercase tracking-[0.2em] text-[#8fb3a6]">ClawOS Console</span>
                  <div className="h-2 w-2 rounded-full bg-[var(--claw-mint)] shadow-[0_0_12px_var(--claw-glow)]" />
                </div>
                <div className="mt-6 space-y-4 text-sm text-[#c7d6cf]">
                  {[
                    { icon: Layers, title: 'Deploy Instance', detail: 'Isolated container + private token' },
                    { icon: Radar, title: 'Pair Channels', detail: 'Telegram, WhatsApp, Discord, Slack' },
                    { icon: Shield, title: 'Secure Keys', detail: 'Secrets never leave your scope' }
                  ].map((item) => (
                    <div key={item.title} className="flex items-start gap-3 rounded-2xl border border-white/10 bg-white/5 p-4">
                      <item.icon className="h-5 w-5 text-[var(--claw-mint)]" />
                      <div>
                        <div className="font-semibold">{item.title}</div>
                        <div className="text-xs text-[#95a6a0]">{item.detail}</div>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="mt-6 rounded-2xl border border-white/10 bg-white/5 p-4">
                  <div className="text-xs uppercase tracking-[0.2em] text-[#8fb3a6]">Live Status</div>
                  <div className="mt-2 flex items-center gap-3 text-sm">
                    <div className="h-2 w-2 rounded-full bg-[var(--claw-mint)]" />
                    Gateway online • pairing ready
                  </div>
                </div>
              </div>
              <div className="absolute -bottom-6 -right-6 hidden md:block rounded-2xl border border-white/10 bg-[#111a16] px-4 py-3 text-xs text-[#98a9a1]">
                “Most polished OpenClaw launch yet.”
              </div>
            </div>
          </div>
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-3 gap-6 mt-16">
          {[
            {
              icon: Zap,
              title: 'One‑click deploy',
              copy: 'Launch a private OpenClaw instance with a single step. No terminals, no confusion.'
            },
            {
              icon: MessageSquare,
              title: 'Channel‑ready',
              copy: 'WhatsApp, Telegram, Discord, Slack and more—wire them once and move on.'
            },
            {
              icon: Shield,
              title: 'Secure by design',
              copy: 'Tokens stay encrypted. Each instance runs isolated with its own gateway.'
            }
          ].map((item) => (
            <div key={item.title} className="rounded-[24px] border border-white/10 bg-white/5 p-6">
              <item.icon className="h-8 w-8 text-[var(--claw-mint)]" />
              <h3 className="mt-4 text-xl font-semibold">{item.title}</h3>
              <p className="mt-2 text-sm text-[#a5b7b0]">{item.copy}</p>
            </div>
          ))}
        </div>

        {/* Channels Section */}
        <div className="mt-16 rounded-[28px] border border-white/10 bg-gradient-to-br from-[#121c18] to-[#0b0f0d] p-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
            <div>
              <h2 className="text-3xl font-semibold">Channels, organized</h2>
              <p className="mt-2 text-[#a5b7b0]">
                Pair once, manage centrally, and keep every surface consistent.
              </p>
            </div>
            <Link
              href="/pricing"
              className="inline-flex items-center gap-2 rounded-full border border-white/15 px-6 py-2 text-sm text-[#cfe3db] hover:border-[var(--claw-mint)]/60"
            >
              View coverage <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
          <div className="mt-8 grid grid-cols-2 md:grid-cols-4 gap-4">
            {['WhatsApp', 'Telegram', 'Discord', 'Slack', 'Signal', 'Google Chat', 'Matrix', 'MS Teams'].map((platform) => (
              <div key={platform} className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-[#cfe3db]">
                {platform}
              </div>
            ))}
          </div>
        </div>

        {/* Pricing Preview */}
        <div className="mt-16 grid md:grid-cols-3 gap-6">
          {[
            { name: 'Monthly', price: '$29', note: '/mo' },
            { name: '3 Months', price: '$75', note: '/3mo', badge: 'Save 13%' },
            { name: 'Yearly', price: '$299', note: '/yr', badge: 'Save 14%' }
          ].map((plan) => (
            <div key={plan.name} className="rounded-[26px] border border-white/10 bg-white/5 p-6">
              {plan.badge && (
                <div className="text-xs uppercase tracking-[0.2em] text-[var(--claw-mint)]">{plan.badge}</div>
              )}
              <div className="mt-2 text-xl font-semibold">{plan.name}</div>
              <div className="mt-4 text-4xl font-semibold">
                {plan.price}
                <span className="text-base text-[#a5b7b0]">{plan.note}</span>
              </div>
              <Link
                href="/pricing"
                className="mt-6 inline-flex w-full items-center justify-center rounded-full bg-[var(--claw-mint)] px-5 py-2 text-sm font-semibold text-[#0b0f0d] hover:brightness-110"
              >
                Get Started
              </Link>
            </div>
          ))}
        </div>

        {/* CTA Section */}
        <div className="mt-16 rounded-[32px] border border-[var(--claw-mint)]/30 bg-[linear-gradient(120deg,rgba(125,243,198,0.15),rgba(255,179,90,0.15))] p-10 text-[#0b0f0d]">
          <h2 className="text-3xl font-semibold">Ready to launch ClawOS?</h2>
          <p className="mt-2 text-[#1a2a22]">Deploy your agent, pair your channels, and go live today.</p>
          <Link
            href="/register"
            className="mt-6 inline-flex items-center gap-2 rounded-full bg-[#0b0f0d] px-6 py-3 text-sm font-semibold text-[var(--claw-mint)]"
          >
            Create Your Agent <ArrowRight className="h-4 w-4" />
          </Link>
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
