import { motion } from 'framer-motion'
import { CheckIcon } from '@heroicons/react/20/solid'

const tiers = [
  {
    name: 'Monthly',
    id: 'tier-monthly',
    href: '#',
    priceMonthly: '$9.99',
    description: 'Perfect for individual players looking to improve their game.',
    features: [
      'AI Shot Analysis',
      'Tournament Management',
      'Challenge System',
      'Player Stats Tracking',
      'Pool Hall Finder',
      'Priority Support',
    ],
  },
  {
    name: 'Annual',
    id: 'tier-annual',
    href: '#',
    priceMonthly: '$7.99',
    description: 'Save 20% with annual billing for dedicated players.',
    features: [
      'All Monthly features',
      'Two months free',
      'Early access to new features',
      'Advanced analytics',
      'Custom tournament themes',
      'Premium support',
    ],
  },
]

export function Pricing() {
  return (
    <div className="py-24 sm:py-32">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="mx-auto max-w-4xl text-center">
          <h2 className="text-base font-semibold leading-7 text-primary">Pricing</h2>
          <p className="mt-2 text-4xl font-bold tracking-tight text-foreground sm:text-5xl">
            Simple, transparent pricing
          </p>
        </div>
        <p className="mx-auto mt-6 max-w-2xl text-center text-lg leading-8 text-muted-foreground">
          Choose the plan that works best for you. All plans include our core features.
        </p>
        <div className="isolate mx-auto mt-16 grid max-w-md grid-cols-1 gap-y-8 sm:mt-20 lg:mx-0 lg:max-w-none lg:grid-cols-2 lg:gap-x-8 xl:gap-x-12">
          {tiers.map((tier, index) => (
            <motion.div
              key={tier.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.2 }}
              className="rounded-3xl p-8 ring-1 ring-muted bg-card xl:p-10"
            >
              <div className="flex items-center justify-between gap-x-4">
                <h3 className="text-lg font-semibold leading-8 text-foreground">{tier.name}</h3>
              </div>
              <p className="mt-4 text-sm leading-6 text-muted-foreground">{tier.description}</p>
              <p className="mt-6 flex items-baseline gap-x-1">
                <span className="text-4xl font-bold tracking-tight text-foreground">{tier.priceMonthly}</span>
                <span className="text-sm font-semibold leading-6 text-muted-foreground">/month</span>
              </p>
              <a
                href={tier.href}
                className="mt-6 block rounded-md bg-primary px-3 py-2 text-center text-sm font-semibold leading-6 text-primary-foreground shadow-sm hover:bg-primary/90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
              >
                Subscribe
              </a>
              <ul role="list" className="mt-8 space-y-3 text-sm leading-6 text-muted-foreground">
                {tier.features.map((feature) => (
                  <li key={feature} className="flex gap-x-3">
                    <CheckIcon className="h-6 w-5 flex-none text-primary" aria-hidden="true" />
                    {feature}
                  </li>
                ))}
              </ul>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  )
}