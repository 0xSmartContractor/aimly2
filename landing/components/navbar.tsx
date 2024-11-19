import Link from 'next/link'
import { UserButton, SignedIn, SignedOut } from '@clerk/nextjs'
import { ThemeToggle } from './theme-toggle'

export function Navbar() {
  return (
    <header className="absolute inset-x-0 top-0 z-50">
      <nav className="flex items-center justify-between p-6 lg:px-8" aria-label="Global">
        <div className="flex lg:flex-1">
          <Link href="/" className="-m-1.5 p-1.5">
            <span className="text-2xl font-bold text-foreground">Aimly</span>
          </Link>
        </div>
        <div className="flex lg:hidden">
          <button
            type="button"
            className="-m-2.5 inline-flex items-center justify-center rounded-md p-2.5 text-muted-foreground"
          >
            <span className="sr-only">Open main menu</span>
            {/* Add menu icon */}
          </button>
        </div>
        <div className="hidden lg:flex lg:gap-x-12">
          <a href="#features" className="text-sm font-semibold leading-6 text-foreground">
            Features
          </a>
          <a href="#pricing" className="text-sm font-semibold leading-6 text-foreground">
            Pricing
          </a>
          <a href="#about" className="text-sm font-semibold leading-6 text-foreground">
            About
          </a>
        </div>
        <div className="hidden lg:flex lg:flex-1 lg:justify-end lg:gap-x-4">
          <ThemeToggle />
          <SignedIn>
            <UserButton afterSignOutUrl="/" />
          </SignedIn>
          <SignedOut>
            <Link
              href="/sign-in"
              className="text-sm font-semibold leading-6 text-foreground"
            >
              Log in
            </Link>
          </SignedOut>
        </div>
      </nav>
    </header>
  )
}