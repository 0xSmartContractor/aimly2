import { render, screen } from '@testing-library/react'
import { Hero } from '@/components/hero'

describe('Hero component', () => {
  it('renders the main heading', () => {
    render(<Hero />)
    const heading = screen.getByText(/Elevate Your Pool Game with AI/i)
    expect(heading).toBeInTheDocument()
  })

  it('renders the CTA button', () => {
    render(<Hero />)
    const button = screen.getByText(/Get started/i)
    expect(button).toBeInTheDocument()
  })

  it('renders the learn more link', () => {
    render(<Hero />)
    const link = screen.getByText(/Learn more/i)
    expect(link).toBeInTheDocument()
  })
})