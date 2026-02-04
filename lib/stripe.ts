import Stripe from 'stripe'

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2023-10-16',
  typescript: true,
})

export const PLANS = {
  MONTHLY: {
    name: 'Monthly',
    price: 29,
    priceId: process.env.STRIPE_PRICE_MONTHLY!,
    interval: 'month' as const,
  },
  THREE_MONTH: {
    name: '3 Months',
    price: 75,
    pricePerMonth: 25,
    savings: 12,
    discount: 13,
    priceId: process.env.STRIPE_PRICE_THREE_MONTH!,
    interval: '3 months' as const,
  },
  YEARLY: {
    name: 'Yearly',
    price: 299,
    pricePerMonth: 24.92,
    savings: 49,
    discount: 14,
    priceId: process.env.STRIPE_PRICE_YEARLY!,
    interval: 'year' as const,
  },
}
