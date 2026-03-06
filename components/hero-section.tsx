"use client"

import { useEffect, useState, lazy, Suspense } from "react"
import { ArrowRight, ChevronDown } from "lucide-react"

const OrbCanvas = lazy(() =>
  import("@/components/orb-canvas").then((mod) => ({ default: mod.OrbCanvas }))
)

const roles = [
  "Web Development",
  "Crypto Trading Bots",
  "App Development",
  "UI/UX Design",
  "DeFi Solutions",
  "Digital Marketing",
]

export function HeroSection() {
  const [currentRole, setCurrentRole] = useState(0)
  const [displayText, setDisplayText] = useState("")
  const [isDeleting, setIsDeleting] = useState(false)

  useEffect(() => {
    const role = roles[currentRole]
    const timeout = setTimeout(
      () => {
        if (!isDeleting) {
          setDisplayText(role.slice(0, displayText.length + 1))
          if (displayText.length === role.length) {
            setTimeout(() => setIsDeleting(true), 2000)
          }
        } else {
          setDisplayText(role.slice(0, displayText.length - 1))
          if (displayText.length === 0) {
            setIsDeleting(false)
            setCurrentRole((prev) => (prev + 1) % roles.length)
          }
        }
      },
      isDeleting ? 40 : 80
    )
    return () => clearTimeout(timeout)
  }, [displayText, isDeleting, currentRole])

  return (
    <section
      id="home"
      className="relative min-h-screen flex flex-col lg:flex-row lg:items-center overflow-hidden pt-20"
    >
      {/* Gradient orbs */}
      <div className="absolute top-1/4 -left-32 w-96 h-96 bg-primary/10 rounded-full blur-[128px] animate-float" />
      <div
        className="absolute bottom-1/4 -right-32 w-96 h-96 bg-accent/10 rounded-full blur-[128px]"
        style={{ animationDelay: "3s", animation: "float 8s ease-in-out infinite" }}
      />

      {/* 3D Orb - absolute full-section background on all screen sizes
           Particles flow through navbar and content areas seamlessly */}
      <div className="absolute inset-0 z-[1] pointer-events-none lg:pointer-events-none">
        <Suspense
          fallback={
            <div className="w-full h-full flex items-center justify-center">
              <div className="w-48 h-48 rounded-full bg-primary/5 animate-pulse" />
            </div>
          }
        >
          <OrbCanvas />
        </Suspense>
      </div>

      {/* Mobile spacer - pushes text below the orb center on small screens */}
      <div className="lg:hidden w-full h-[50vh] min-h-[300px] flex-shrink-0" aria-hidden="true" />

      <div className="relative z-10 mx-auto max-w-7xl w-full px-6 lg:px-8">
        {/* Two-column layout: text left, content right */}
        <div className="flex flex-col lg:flex-row items-center gap-8 lg:gap-12">
          {/* Left column - Text content */}
          <div className="flex-1 text-center lg:text-left relative z-10">
            {/* Status badge */}
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-border bg-secondary/50 backdrop-blur-sm mb-6 lg:mb-8 animate-fade-in-up">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-primary" />
              </span>
              <span className="text-xs text-muted-foreground uppercase tracking-widest font-medium">
                Accepting New Projects
              </span>
            </div>

            {/* Main heading */}
            <h1
              className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight leading-none mb-6 animate-fade-in-up text-balance"
              style={{ animationDelay: "0.2s" }}
            >
              <span className="text-foreground">We Build</span>
              <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary via-primary/80 to-accent animate-gradient-shift">
                Digital Futures
              </span>
            </h1>

            {/* Typewriter */}
            <div
              className="h-10 flex items-center justify-center lg:justify-start mb-8 animate-fade-in-up"
              style={{ animationDelay: "0.4s" }}
            >
              <span className="font-mono text-lg md:text-xl text-muted-foreground">
                {"// "}
              </span>
              <span className="font-mono text-lg md:text-xl text-primary">
                {displayText}
              </span>
              <span className="font-mono text-lg md:text-xl text-primary animate-pulse">
                |
              </span>
            </div>

            {/* Description */}
            <p
              className="max-w-xl mx-auto lg:mx-0 text-muted-foreground text-lg leading-relaxed mb-10 animate-fade-in-up text-pretty"
              style={{ animationDelay: "0.6s" }}
            >
              Transforming businesses through cutting-edge web development, innovative DeFi
              solutions, and complex auto-trading bots for the crypto industry. From concept
              to deployment, we engineer the impossible.
            </p>

            {/* CTA buttons */}
            <div
              className="flex flex-col sm:flex-row items-center lg:items-start justify-center lg:justify-start gap-4 mb-12 lg:mb-0 animate-fade-in-up"
              style={{ animationDelay: "0.8s" }}
            >
              <a
                href="#contact"
                className="group px-8 py-4 bg-primary text-primary-foreground font-semibold rounded-lg transition-all hover:shadow-[0_0_30px_rgba(0,229,255,0.4)] flex items-center gap-2"
              >
                Start Your Project
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </a>
              <a
                href="#work"
                className="px-8 py-4 border border-border text-foreground font-semibold rounded-lg hover:border-primary/50 hover:bg-primary/5 transition-all"
              >
                View Our Work
              </a>
            </div>
          </div>

          {/* Right column - spacer for desktop layout balance (orb is now background) */}
          <div className="flex-1 hidden lg:block" aria-hidden="true" />
        </div>

        {/* Stats - full width below */}
        <div
          className="relative z-10 grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-12 max-w-3xl mx-auto lg:mx-0 lg:max-w-none mt-12 lg:mt-16 animate-fade-in-up"
          style={{ animationDelay: "1s" }}
        >
          {[
            { value: "10+", label: "Years Experience" },
            { value: "200+", label: "Projects Delivered" },
            { value: "50+", label: "Trading Bots Built" },
            { value: "99%", label: "Client Satisfaction" },
          ].map((stat) => (
            <div key={stat.label} className="text-center">
              <div className="text-3xl md:text-4xl font-bold text-primary font-mono">
                {stat.value}
              </div>
              <div className="text-xs text-muted-foreground mt-1 uppercase tracking-wider">
                {stat.label}
              </div>
            </div>
          ))}
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce">
          <ChevronDown className="w-6 h-6 text-muted-foreground" />
        </div>
      </div>
    </section>
  )
}
