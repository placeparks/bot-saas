'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { signIn } from 'next-auth/react'
import Link from 'next/link'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Bot, Shield, Sparkles, Check } from 'lucide-react'

export default function RegisterPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    const formData = new FormData(e.currentTarget)
    const name = formData.get('name') as string
    const email = formData.get('email') as string
    const password = formData.get('password') as string
    const confirmPassword = formData.get('confirmPassword') as string

    if (password !== confirmPassword) {
      setError('Passwords do not match')
      setLoading(false)
      return
    }

    if (password.length < 8) {
      setError('Password must be at least 8 characters')
      setLoading(false)
      return
    }

    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password })
      })

      const data = await response.json()

      if (!response.ok) {
        setError(data.error || 'Registration failed')
        return
      }

      // Auto sign-in after successful registration
      const result = await signIn('credentials', {
        email,
        password,
        redirect: false
      })

      if (result?.error) {
        router.push('/login')
        return
      }

      router.push('/onboard')
    } catch (err) {
      setError('An error occurred. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div
      className="min-h-screen bg-[#0b0f0d] text-[#e9f3ee] [--claw-ink:#0b0f0d] [--claw-mint:#7df3c6] [--claw-ember:#ffb35a] [--claw-glow:rgba(125,243,198,0.28)] flex items-center justify-center p-6"
      style={{ fontFamily: "'Space Grotesk', 'Sora', 'Poppins', sans-serif" }}
    >
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-24 -right-16 h-56 w-56 rounded-full bg-[var(--claw-mint)]/12 blur-3xl" />
        <div className="absolute -bottom-24 -left-20 h-72 w-72 rounded-full bg-[var(--claw-ember)]/12 blur-3xl" />
      </div>

      <Card className="relative w-full max-w-md border border-white/10 bg-white/5 text-[#e9f3ee] shadow-[0_40px_120px_rgba(0,0,0,0.45)]">
        <CardHeader className="text-center">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl border border-[var(--claw-mint)]/30 bg-[var(--claw-mint)]/10 shadow-[0_0_30px_var(--claw-glow)]">
            <Bot className="h-7 w-7 text-[var(--claw-mint)]" />
          </div>
          <CardTitle className="mt-5 text-2xl">Create your ClawOS account</CardTitle>
          <CardDescription className="text-[#a5b7b0]">
            Launch your private OpenClaw gateway in minutes.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="rounded-xl border border-red-500/30 bg-red-500/10 p-3">
                <p className="text-sm text-red-200">{error}</p>
              </div>
            )}

            <div>
              <Label htmlFor="name" className="text-sm text-[#cfe3db]">Name</Label>
              <Input
                id="name"
                name="name"
                type="text"
                placeholder="Your name"
                required
                className="mt-2 border-white/10 bg-white/5 text-[#e9f3ee] placeholder:text-[#6e827a]"
              />
            </div>

            <div>
              <Label htmlFor="email" className="text-sm text-[#cfe3db]">Email</Label>
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="you@example.com"
                required
                className="mt-2 border-white/10 bg-white/5 text-[#e9f3ee] placeholder:text-[#6e827a]"
              />
            </div>

            <div>
              <Label htmlFor="password" className="text-sm text-[#cfe3db]">Password</Label>
              <Input
                id="password"
                name="password"
                type="password"
                placeholder="••••••••"
                required
                className="mt-2 border-white/10 bg-white/5 text-[#e9f3ee] placeholder:text-[#6e827a]"
              />
              <p className="mt-2 text-xs text-[#8fa29a] flex items-center gap-2">
                <Check className="h-3 w-3 text-[var(--claw-mint)]" /> At least 8 characters
              </p>
            </div>

            <div>
              <Label htmlFor="confirmPassword" className="text-sm text-[#cfe3db]">Confirm Password</Label>
              <Input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                placeholder="••••••••"
                required
                className="mt-2 border-white/10 bg-white/5 text-[#e9f3ee] placeholder:text-[#6e827a]"
              />
            </div>

            <Button
              type="submit"
              className="w-full rounded-full bg-[var(--claw-mint)] text-[#0b0f0d] font-semibold hover:brightness-110"
              disabled={loading}
            >
              {loading ? 'Creating account...' : 'Create Account'}
            </Button>

            <div className="grid gap-3 rounded-2xl border border-white/10 bg-white/5 p-4 text-xs text-[#a5b7b0]">
              <div className="flex items-center gap-2">
                <Shield className="h-4 w-4 text-[var(--claw-mint)]" />
                Your keys stay private and encrypted.
              </div>
              <div className="flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-[var(--claw-mint)]" />
                Pair channels after the first deploy.
              </div>
            </div>

            <div className="text-center text-sm">
              <span className="text-[#a5b7b0]">Already have an account? </span>
              <Link href="/login" className="text-[var(--claw-mint)] hover:underline">
                Sign in
              </Link>
            </div>

            <div className="text-center text-sm">
              <Link href="/" className="text-[#8fa29a] hover:underline">
                ← Back to home
              </Link>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
