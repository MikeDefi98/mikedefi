"use client"

import { useScrollAnimation } from "@/hooks/use-scroll-animation"
import { ExternalLink } from "lucide-react"
import { AurusAnimation, SynthetixAnimation, TradingBotAnimation } from "@/components/project-animations"
import type { ComponentType } from "react"

const projects: {
  title: string
  category: string
  description: string
  url: string
  tags: string[]
  Animation: ComponentType
}[] = [
  {
    title: "Aurus - Web3 & DeFi Marketplace",
    category: "UI/UX, Development",
    description:
      "A web3 marketplace to buy, trade, and earn tokenized gold, silver, and platinum securely and efficiently, with a user-friendly interface.",
    url: "https://aurus.io",
    tags: ["Web3", "DeFi", "React"],
    Animation: AurusAnimation,
  },
  {
    title: "Synthetix Token Platform",
    category: "Web Development",
    description:
      "Financial primitive enabling creation of synthetic assets, offering unique derivatives and exposure to real-world assets on the blockchain.",
    url: "https://synthetix.io/",
    tags: ["Blockchain", "DeFi", "TypeScript"],
    Animation: SynthetixAnimation,
  },
  {
    title: "Auto-Trading Algorithmic Suite",
    category: "Web3, Algorithm",
    description:
      "Institutional-grade automated trading system processing millions in daily volume across multiple exchanges with sub-millisecond execution.",
    url: "#contact",
    tags: ["Python", "ML", "Trading"],
    Animation: TradingBotAnimation,
  },
]

export function PortfolioSection() {
  const { ref, isVisible } = useScrollAnimation()

  return (
    <section id="work" className="relative py-24 lg:py-32">
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-1/2 h-px bg-gradient-to-r from-transparent via-primary/30 to-transparent" />

      <div ref={ref} className="mx-auto max-w-7xl px-6 lg:px-8">
        {/* Header */}
        <div
          className={`max-w-2xl mx-auto text-center mb-16 transition-all duration-1000 ${
            isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
          }`}
        >
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-primary/20 bg-primary/5 mb-6">
            <span className="text-xs text-primary uppercase tracking-widest font-medium">
              Our Work
            </span>
          </div>

          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mb-6 text-balance">
            Latest <span className="text-primary">Projects</span>
          </h2>

          <p className="text-muted-foreground text-lg leading-relaxed">
            Pushing the boundaries of what{"'"}s possible with web design, blockchain
            technology, and algorithmic trading.
          </p>
        </div>

        {/* Projects */}
        <div className="flex flex-col gap-8">
          {projects.map((project, index) => (
            <div
              key={project.title}
              className={`group grid lg:grid-cols-2 gap-8 p-6 lg:p-8 rounded-2xl bg-card border border-border hover:border-primary/20 transition-all duration-700 ${
                isVisible
                  ? "opacity-100 translate-y-0"
                  : "opacity-0 translate-y-12"
              }`}
              style={{ transitionDelay: `${index * 200}ms` }}
            >
              {/* Animated preview */}
              <div
                className={`relative aspect-video rounded-xl overflow-hidden bg-[#050508] border border-primary/10 ${
                  index % 2 === 1 ? "lg:order-2" : ""
                }`}
              >
                <project.Animation />
                <div className="absolute inset-0 bg-gradient-to-t from-background/40 to-transparent pointer-events-none" />
              </div>

              {/* Info */}
              <div className="flex flex-col justify-center">
                <div className="flex flex-wrap gap-2 mb-4">
                  {project.tags.map((tag) => (
                    <span
                      key={tag}
                      className="px-2.5 py-1 text-[11px] font-mono text-primary bg-primary/5 border border-primary/20 rounded-md"
                    >
                      {tag}
                    </span>
                  ))}
                </div>

                <p className="text-xs text-muted-foreground uppercase tracking-widest mb-2">
                  {project.category}
                </p>

                <h3 className="text-2xl lg:text-3xl font-bold text-foreground mb-4 text-balance">
                  {project.title}
                </h3>

                <p className="text-muted-foreground leading-relaxed mb-6">
                  {project.description}
                </p>

                <a
                  href={project.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 text-primary hover:text-primary/80 font-medium transition-colors group/link"
                >
                  View Project
                  <ExternalLink className="w-4 h-4 group-hover/link:translate-x-0.5 group-hover/link:-translate-y-0.5 transition-transform" />
                </a>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
