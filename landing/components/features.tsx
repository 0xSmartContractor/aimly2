import { motion } from 'framer-motion'
import {
  ChartBarIcon,
  CameraIcon,
  TrophyIcon,
  UserGroupIcon,
  MapPinIcon,
  BanknotesIcon,
} from '@heroicons/react/24/outline'

const features = [
  {
    name: 'Shot Analysis',
    description: 'AI-powered analysis of your stance, stroke, and follow-through with real-time feedback.',
    icon: CameraIcon,
  },
  {
    name: 'Tournament Management',
    description: 'Create and manage tournaments with advanced bracket systems and Calcutta auctions.',
    icon: TrophyIcon,
  },
  {
    name: 'Player Stats',
    description: 'Track your progress with detailed statistics and performance metrics.',
    icon: ChartBarIcon,
  },
  {
    name: 'Challenge System',
    description: 'Challenge other players, track matches, and manage money games securely.',
    icon: UserGroupIcon,
  },
  {
    name: 'Pool Hall Finder',
    description: 'Discover nearby pool halls and connect with the local billiards community.',
    icon: MapPinIcon,
  },
  {
    name: 'Money Management',
    description: 'Secure handling of tournament entries, Calcutta auctions, and challenge stakes.',
    icon: BanknotesIcon,
  },
]

export function Features() {
  return (
    <div id="features" className="py-24 sm:py-32">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="mx-auto max-w-2xl lg:text-center">
          <h2 className="text-base font-semibold leading-7 text-primary">Everything you need</h2>
          <p className="mt-2 text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            Advanced Features for Serious Players
          </p>
          <p className="mt-6 text-lg leading-8 text-muted-foreground">
            From AI-powered shot analysis to tournament management, Aimly provides all the tools you need to improve your game and manage competitions.
          </p>
        </div>
        <div className="mx-auto mt-16 max-w-2xl sm:mt-20 lg:mt-24 lg:max-w-none">
          <dl className="grid max-w-xl grid-cols-1 gap-x-8 gap-y-16 lg:max-w-none lg:grid-cols-3">
            {features.map((feature, index) => (
              <motion.div
                key={feature.name}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="flex flex-col"
              >
                <dt className="flex items-center gap-x-3 text-base font-semibold leading-7 text-foreground">
                  <feature.icon className="h-5 w-5 flex-none text-primary" aria-hidden="true" />
                  {feature.name}
                </dt>
                <dd className="mt-4 flex flex-auto flex-col text-base leading-7 text-muted-foreground">
                  <p className="flex-auto">{feature.description}</p>
                </dd>
              </motion.div>
            ))}
          </dl>
        </div>
      </div>
    </div>
  )
}