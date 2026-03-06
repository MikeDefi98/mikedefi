"use client"

import Link from "next/link"
import { ChevronRight } from "lucide-react"

interface Breadcrumb {
  label: string
  href?: string
}

interface SeoPageLayoutProps {
  badge: string
  title: string
  subtitle: string
  description: string
  breadcrumbs: Breadcrumb[]
  children: React.ReactNode
}

export function SeoPageLayout({
  badge,
  title,
  subtitle,
  description,
  breadcrumbs,
  children,
}: SeoPageLayoutProps) {
  return (
    <div className="relative min-h-screen bg-background">
      {/* Subtle grid background */}
      <div
        className="fixed inset-0 pointer-events-none opacity-[0.03]"
        style={{
          backgroundImage: `linear-gradient(var(--border) 1px, transparent 1px), linear-gradient(90deg, var(--border) 1px, transparent 1px)`,
          backgroundSize: "60px 60px",
        }}
      />

      {/* Top glow */}
      <div className="fixed top-0 left-1/2 -translate-x-1/2 w-[600px] h-px bg-gradient-to-r from-transparent via-primary/30 to-transparent pointer-events-none" />

      {/* Navbar-style top bar */}
      <header className="sticky top-0 z-50 bg-background/80 backdrop-blur-xl border-b border-border">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <nav className="flex items-center justify-between h-16" aria-label="Site navigation">
            <Link href="/" className="flex items-center gap-2 group">
              <div className="relative h-9 w-9 rounded-lg bg-primary/10 flex items-center justify-center border border-primary/30 group-hover:border-primary/60 transition-colors">
                <span className="text-primary font-mono font-bold text-base">M</span>
              </div>
              <div className="flex flex-col">
                <span className="text-foreground font-bold text-sm leading-none tracking-tight">
                  Mike Web
                </span>
                <span className="text-muted-foreground text-[9px] uppercase tracking-[0.2em]">
                  Dev Studio
                </span>
              </div>
            </Link>

            <div className="hidden sm:flex items-center gap-4 text-sm">
              <Link href="/reviews" className="text-muted-foreground hover:text-primary transition-colors">
                Reviews
              </Link>
              <Link href="/security" className="text-muted-foreground hover:text-primary transition-colors">
                Security
              </Link>
              <Link href="/transparency" className="text-muted-foreground hover:text-primary transition-colors">
                Transparency
              </Link>
              <Link href="/is-mikedefi-legit" className="text-muted-foreground hover:text-primary transition-colors">
                Legit?
              </Link>
              <Link
                href="/#contact"
                className="px-4 py-2 bg-primary text-primary-foreground font-medium text-xs rounded-lg hover:bg-primary/90 transition-all"
              >
                Get a Quote
              </Link>
            </div>
          </nav>
        </div>
      </header>

      <main>
        {/* Hero / header section */}
        <section className="relative py-20 lg:py-28 border-b border-border">
          <div className="absolute inset-0 pointer-events-none overflow-hidden">
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[400px] bg-primary/3 rounded-full blur-3xl" />
          </div>

          <div className="relative mx-auto max-w-4xl px-6 lg:px-8">
            {/* Breadcrumbs */}
            <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 mb-8 flex-wrap">
              {breadcrumbs.map((crumb, i) => (
                <span key={crumb.label} className="flex items-center gap-1.5">
                  {i > 0 && <ChevronRight className="w-3 h-3 text-muted-foreground" />}
                  {crumb.href ? (
                    <Link
                      href={crumb.href}
                      className="text-muted-foreground text-xs hover:text-primary transition-colors"
                    >
                      {crumb.label}
                    </Link>
                  ) : (
                    <span className="text-primary text-xs">{crumb.label}</span>
                  )}
                </span>
              ))}
            </nav>

            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-primary/20 bg-primary/5 mb-6">
              <span className="text-xs text-primary uppercase tracking-widest font-medium">
                {badge}
              </span>
            </div>

            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-foreground mb-4 leading-tight text-balance">
              {title}
            </h1>
            <p className="text-lg text-primary font-semibold mb-4 text-balance">{subtitle}</p>
            <p className="text-muted-foreground leading-relaxed text-lg max-w-2xl text-balance">
              {description}
            </p>

            {/* Quick links to other SEO pages */}
            <div className="flex flex-wrap gap-2 mt-8">
              {[
                { label: "Reviews", href: "/reviews" },
                { label: "Security", href: "/security" },
                { label: "Transparency", href: "/transparency" },
                { label: "Is Mike Web Legit?", href: "/is-mikedefi-legit" },
              ].map(({ label, href }) => (
                <Link
                  key={href}
                  href={href}
                  className="px-3 py-1 text-xs rounded-lg bg-secondary border border-border text-muted-foreground hover:text-primary hover:border-primary/30 transition-colors"
                >
                  {label}
                </Link>
              ))}
            </div>
          </div>
        </section>

        {/* Page content */}
        <section className="py-16 lg:py-24">
          <div className="mx-auto max-w-5xl px-6 lg:px-8">{children}</div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-border bg-card/30 py-10">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <Link href="/" className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center border border-primary/30">
                <span className="text-primary font-mono font-bold text-sm">M</span>
              </div>
              <span className="text-foreground font-bold text-sm">Mike Web</span>
            </Link>

            <div className="flex flex-wrap items-center gap-4 text-xs text-muted-foreground">
              <Link href="/" className="hover:text-primary transition-colors">Home</Link>
              <Link href="/reviews" className="hover:text-primary transition-colors">Reviews</Link>
              <Link href="/security" className="hover:text-primary transition-colors">Security</Link>
              <Link href="/transparency" className="hover:text-primary transition-colors">Transparency</Link>
              <Link href="/is-mikedefi-legit" className="hover:text-primary transition-colors">Is Mike Web Legit?</Link>
            </div>

            <p className="text-muted-foreground text-xs">
              &copy; {new Date().getFullYear()} Mike Web. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}
