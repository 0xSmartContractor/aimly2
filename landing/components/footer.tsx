export function Footer() {
  return (
    <footer className="bg-card">
      <div className="mx-auto max-w-7xl overflow-hidden px-6 py-20 sm:py-24 lg:px-8">
        <nav className="-mb-6 columns-2 sm:flex sm:justify-center sm:space-x-12" aria-label="Footer">
          <div className="pb-6">
            <a href="#" className="text-sm leading-6 text-muted-foreground hover:text-foreground">
              About
            </a>
          </div>
          <div className="pb-6">
            <a href="#" className="text-sm leading-6 text-muted-foreground hover:text-foreground">
              Blog
            </a>
          </div>
          <div className="pb-6">
            <a href="#" className="text-sm leading-6 text-muted-foreground hover:text-foreground">
              Jobs
            </a>
          </div>
          <div className="pb-6">
            <a href="#" className="text-sm leading-6 text-muted-foreground hover:text-foreground">
              Press
            </a>
          </div>
          <div className="pb-6">
            <a href="#" className="text-sm leading-6 text-muted-foreground hover:text-foreground">
              Privacy
            </a>
          </div>
          <div className="pb-6">
            <a href="#" className="text-sm leading-6 text-muted-foreground hover:text-foreground">
              Terms
            </a>
          </div>
        </nav>
        <p className="mt-10 text-center text-xs leading-5 text-muted-foreground">
          &copy; 2024 Aimly. All rights reserved.
        </p>
      </div>
    </footer>
  )
}