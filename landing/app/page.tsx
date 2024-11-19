import { Hero } from '@/components/hero'
import { Features } from '@/components/features'
import { Pricing } from '@/components/pricing'
import { Footer } from '@/components/footer'
import { Navbar } from '@/components/navbar'

export default function Home() {
  return (
    <main className="min-h-screen bg-background">
      <Navbar />
      <Hero />
      <Features />
      <Pricing />
      <Footer />
    </main>
  )
}