"use client"

import { useScrollAnimation } from "@/hooks/use-scroll-animation"
import { Monitor, Users, Zap, Shield } from "lucide-react"

const highlights = [
  {
    icon: Monitor,
    title: "Precision & Detail",
    description:
      "We obsess over every pixel, every line of code. Your digital presence is the first impact with prospective cliens  and we guarantee utmost care and creativity.",
  },
  {
    icon: Users,
    title: "Dedicated Expert Team",
    description:
      "A team of seasoned professionals passionate about web development, DeFi innovation, and digital marketing, delivering cutting-edge solutions that drive real results.",
  },
  {
    icon: Zap,
    title: "Cutting-Edge Technology",
    description:
      "From blockchain-powered trading bots to next-gen web applications, we leverage the latest technologies to build solutions that keep you ahead of the curve.",
  },
  {
    icon: Shield,
    title: "Proven Track Record",
    description:
      "Since 2015, we've delivered hundreds of projects for businesses and firms worldwide, earning trust through consistent, high-quality results.",
  },
]

export function AboutSection() {
  const { ref, isVisible } = useScrollAnimation()

  return (
    <section id="about" className="relative py-24 lg:py-32">
      {/* Section divider glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-1/2 h-px bg-gradient-to-r from-transparent via-primary/30 to-transparent" />

      <div ref={ref} className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-16 lg:gap-24 items-center">
          {/* Left - Text */}
          <div
            className={`transition-all duration-1000 ${
              isVisible ? "opacity-100 translate-x-0" : "opacity-0 -translate-x-12"
            }`}
          >
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-primary/20 bg-primary/5 mb-6">
              <span className="text-xs text-primary uppercase tracking-widest font-medium">
                About Us
              </span>
            </div>

            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mb-6 leading-tight text-balance">
              Pioneering Digital
              <br />
              <span className="text-primary">Since 2015</span>
            </h2>

            <p className="text-muted-foreground text-lg leading-relaxed mb-6">
              Mike Web was established by experienced industry professionals and has
              rapidly grown to become one of the leading website design, development,
              and blockchain technology companies.
            </p>

            <p className="text-muted-foreground leading-relaxed mb-8">
              We specialize in building complex auto-trading bots for businesses and
              firms in the crypto industry, alongside our comprehensive suite of web
              development, UI/UX design, and digital marketing services. Our mission is
              to transform innovative ideas into powerful digital realities.
            </p>

            {/* Tech stack bar */}
            <div className="flex flex-wrap gap-3">
              {["React", "Next.js", "Solidity", "Python", "Node.js", "Web3"].map(
                (tech) => (
                  <span
                    key={tech}
                    className="px-3 py-1.5 text-xs font-mono text-primary bg-primary/5 border border-primary/20 rounded-md"
                  >
                    {tech}
                  </span>
                )
              )}
            </div>
          </div>

          {/* Right - Feature cards */}
          <div
            className={`grid grid-cols-1 sm:grid-cols-2 gap-4 transition-all duration-1000 delay-300 ${
              isVisible ? "opacity-100 translate-x-0" : "opacity-0 translate-x-12"
            }`}
          >
            {highlights.map((item, index) => (
              <div
                key={item.title}
                className="group relative p-6 rounded-xl bg-card border border-border hover:border-primary/30 transition-all duration-500 hover:shadow-[0_0_30px_rgba(0,229,255,0.05)]"
                style={{ animationDelay: `${index * 0.15}s` }}
              >
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
                  <item.icon className="w-5 h-5 text-primary" />
                </div>
                <h3 className="text-foreground font-semibold mb-2">{item.title}</h3>
                <p className="text-muted-foreground text-sm leading-relaxed">
                  {item.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
