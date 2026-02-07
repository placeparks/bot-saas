import Link from 'next/link'
import { ArrowRight, Bot, MessageSquare, Zap, Shield, Check } from 'lucide-react'

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-50 to-white dark:from-gray-900 dark:to-gray-800">
      {/* Header */}
      <header className="container mx-auto px-4 py-6">
        <nav className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Bot className="h-8 w-8 text-purple-600" />
            <span className="text-2xl font-bold">Mirac</span>
          </div>
          <div className="flex items-center space-x-6">
            <Link href="/features" className="text-gray-600 hover:text-gray-900">
              Features
            </Link>
            <Link href="/pricing" className="text-gray-600 hover:text-gray-900">
              Pricing
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

      {/* Hero Section */}
      <main className="container mx-auto px-4 py-20">
        <div className="text-center max-w-4xl mx-auto">
          <h1 className="text-6xl font-bold mb-6 bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
            Your AI Assistant,
            <br />
            Deployed in One Click
          </h1>
          <p className="text-xl text-gray-600 mb-10">
            Get your personal OpenClaw AI assistant running on WhatsApp, Telegram, Discord, and more.
            No technical skills required.
          </p>
          <div className="flex items-center justify-center space-x-4">
            <Link
              href="/register"
              className="bg-purple-600 text-white px-8 py-4 rounded-lg text-lg font-semibold hover:bg-purple-700 transition flex items-center space-x-2"
            >
              <span>Start Free Trial</span>
              <ArrowRight className="h-5 w-5" />
            </Link>
            <Link
              href="/pricing"
              className="border-2 border-purple-600 text-purple-600 px-8 py-4 rounded-lg text-lg font-semibold hover:bg-purple-50 transition"
            >
              View Pricing
            </Link>
          </div>
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-3 gap-8 mt-24">
          <div className="bg-white dark:bg-gray-800 p-8 rounded-xl shadow-lg">
            <Zap className="h-12 w-12 text-purple-600 mb-4" />
            <h3 className="text-2xl font-semibold mb-3">One-Click Deploy</h3>
            <p className="text-gray-600">
              Configure your AI assistant through our beautiful UI and deploy instantly. No command line needed.
            </p>
          </div>

          <div className="bg-white dark:bg-gray-800 p-8 rounded-xl shadow-lg">
            <MessageSquare className="h-12 w-12 text-purple-600 mb-4" />
            <h3 className="text-2xl font-semibold mb-3">Multi-Channel</h3>
            <p className="text-gray-600">
              Connect to WhatsApp, Telegram, Discord, Slack, Signal, and more. All from one dashboard.
            </p>
          </div>

          <div className="bg-white dark:bg-gray-800 p-8 rounded-xl shadow-lg">
            <Shield className="h-12 w-12 text-purple-600 mb-4" />
            <h3 className="text-2xl font-semibold mb-3">Secure & Private</h3>
            <p className="text-gray-600">
              Your data stays yours. Each instance is isolated and secure. We never see your API keys.
            </p>
          </div>
        </div>

        {/* Channels Section */}
        <div className="mt-24 text-center">
          <h2 className="text-4xl font-bold mb-6">Connect to Your Favorite Platforms</h2>
          <p className="text-xl text-gray-600 mb-12">
            One AI assistant, accessible everywhere you chat
          </p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-4xl mx-auto">
            {['WhatsApp', 'Telegram', 'Discord', 'Slack', 'Signal', 'Google Chat', 'Matrix', 'MS Teams'].map((platform) => (
              <div key={platform} className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow hover:shadow-lg transition">
                <p className="font-semibold">{platform}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Pricing Preview */}
        <div className="mt-24 text-center">
          <h2 className="text-4xl font-bold mb-6">Simple, Transparent Pricing</h2>
          <p className="text-xl text-gray-600 mb-12">
            Choose the plan that works for you. All plans include full features.
          </p>
          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            <div className="bg-white dark:bg-gray-800 p-8 rounded-xl shadow-lg">
              <h3 className="text-2xl font-bold mb-2">Monthly</h3>
              <div className="text-4xl font-bold mb-4">$29<span className="text-lg text-gray-600">/mo</span></div>
              <Link href="/pricing" className="block w-full bg-purple-600 text-white py-3 rounded-lg hover:bg-purple-700 transition">
                Get Started
              </Link>
            </div>

            <div className="bg-purple-600 text-white p-8 rounded-xl shadow-xl transform scale-105">
              <div className="text-sm font-semibold mb-2">SAVE 13%</div>
              <h3 className="text-2xl font-bold mb-2">3 Months</h3>
              <div className="text-4xl font-bold mb-4">$75<span className="text-lg">/3mo</span></div>
              <Link href="/pricing" className="block w-full bg-white text-purple-600 py-3 rounded-lg hover:bg-gray-100 transition font-semibold">
                Get Started
              </Link>
            </div>

            <div className="bg-white dark:bg-gray-800 p-8 rounded-xl shadow-lg">
              <div className="text-sm font-semibold text-purple-600 mb-2">SAVE 14%</div>
              <h3 className="text-2xl font-bold mb-2">Yearly</h3>
              <div className="text-4xl font-bold mb-4">$299<span className="text-lg text-gray-600">/yr</span></div>
              <Link href="/pricing" className="block w-full bg-purple-600 text-white py-3 rounded-lg hover:bg-purple-700 transition">
                Get Started
              </Link>
            </div>
          </div>
        </div>

        {/* CTA Section */}
        <div className="mt-24 bg-gradient-to-r from-purple-600 to-blue-600 rounded-2xl p-12 text-center text-white">
          <h2 className="text-4xl font-bold mb-4">Ready to Get Started?</h2>
          <p className="text-xl mb-8">
            Deploy your AI assistant in less than 5 minutes
          </p>
          <Link
            href="/register"
            className="inline-flex items-center space-x-2 bg-white text-purple-600 px-8 py-4 rounded-lg text-lg font-semibold hover:bg-gray-100 transition"
          >
            <span>Create Your Bot Now</span>
            <ArrowRight className="h-5 w-5" />
          </Link>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t mt-24 py-12">
        <div className="container mx-auto px-4 text-center text-gray-600">
          <p>&copy; 2026 Mirac. Built on top of OpenClaw. All rights reserved.</p>
        </div>
      </footer>
    </div>
  )
}
