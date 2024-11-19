import { render, screen } from '@testing-library/react'
import { Pricing } from '@/components/pricing'

describe('Pricing component', () => {
  it('renders pricing tiers', () => {
    render(<Pricing />)
    expect(screen.getByText(/Monthly/i)).toBeInTheDocument()
    expect(screen.getByText(/Annual/i)).toBeInTheDocument()
  })

  it('displays correct monthly price', () => {
    render(<Pricing />)
    expect(screen.getByText(/\$9\.99/)).toBeInTheDocument()
  })

  it('displays correct annual price', () => {
    render(<Pricing />)
    expect(screen.getByText(/\$7\.99/)).toBeInTheDocument()
  })

  it('shows feature lists', () => {
    render(<Pricing />)
    expect(screen.getByText(/AI Shot Analysis/i)).toBeInTheDocument()
    expect(screen.getByText(/Tournament Management/i)).toBeInTheDocument()
  })
})