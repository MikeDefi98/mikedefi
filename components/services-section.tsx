"use client"

import { useScrollAnimation } from "@/hooks/use-scroll-animation"
import {
  Globe,
  Palette,
  Smartphone,
  TrendingUp,
  Megaphone,
  Video,
  Bot,
} from "lucide-react"

const services = [
  {
    icon: Globe,
    title: "Web Development",
    description:
      "Custom web solutions tailored to your business needs, ensuring seamless user experience and optimized performance with the latest frameworks.",
    tags: ["React", "Next.js", "Node.js"],
  },
  {
    icon: Bot,
    title: "Algorithmic Trading System",
    description:
      "Complex auto-trading algorithmic systems  engineered for businesses and firms in the web3 industry. Algorithmic strategies, real-time execution, and institutional-grade reliability.",
    tags: ["Python", "Solidity", "DeFi"],
    featured: true,
  },
  {
    icon: Palette,
    title: "UI/UX Design",
    description:
      "Intuitive and engaging digital experiences that are not only visually stunning but highly functional. We design interfaces that users love to interact with.",
    tags: ["Figma", "Prototyping", "Research"],
  },
  {
    icon: Smartphone,
    title: "App Development",
    description:
      "Native and cross-platform mobile applications tailored to your business needs, ensuring seamless experience on both iOS and Android.",
    tags: ["React Native", "Swift", "Kotlin"],
  },
  {
    icon: TrendingUp,
    title: "Social Media Growth",
    description:
      "Data-driven strategies that build your online presence and increase reach through targeted campaigns that deliver measurable results.",
    tags: ["Analytics", "Content", "Ads"],
  },
  {
    icon: Megaphone,
    title: "Online Branding",
    description:
      "Unique brand identities that set you apart from competitors. We establish a strong online presence that reflects your values, mission, and vision.",
    tags: ["Strategy", "Identity", "Content"],
  },
  {
    icon: Video,
    title: "Video Editing",
    description:
      "Compelling visual content that engages audiences and drives results. Professional-quality video production with cutting-edge technologies and techniques.",
    tags: ["Motion", "VFX", "Production"],
  },
]

export function ServicesSection() {
  const { ref, isVisible } = useScrollAnimation()

  return (
    <section id="services" className="relative py-24 lg:py-32">
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-1/2 h-px bg-gradient-to-r from-transparent via-border to-transparent" />

      <div ref={ref} className="mx-auto max-w-7xl px-6 lg:px-8">
        {/* Header */}
        <div
          className={`max-w-2xl mx-auto text-center mb-16 transition-all duration-1000 ${
            isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
          }`}
        >
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-primary/20 bg-primary/5 mb-6">
            <span className="text-xs text-primary uppercase tracking-widest font-medium">
              What We Do
            </span>
          </div>

          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mb-6 text-balance">
            Services That Drive{" "}
            <span className="text-primary">Results</span>
          </h2>

          <p className="text-muted-foreground text-lg leading-relaxed">
            From web development and DeFi solutions to automated trading systems, we
            deliver customized digital services designed to help businesses succeed.
          </p>
        </div>

        {/* Services grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-6">
          {services.map((service, index) => (
            <div
              key={service.title}
              className={`group relative p-6 lg:p-8 rounded-xl bg-card border transition-all duration-700 hover:shadow-[0_0_40px_rgba(0,229,255,0.07)] ${
                service.featured
                  ? "border-primary/30 bg-gradient-to-b from-primary/5 to-card md:col-span-2 lg:col-span-1 lg:row-span-1"
                  : "border-border hover:border-primary/20"
              } ${
                isVisible
                  ? "opacity-100 translate-y-0"
                  : "opacity-0 translate-y-8"
              }`}
              style={{ transitionDelay: `${index * 100}ms` }}
            >
              {service.featured && (
                <div className="absolute -top-px left-8 right-8 h-px bg-gradient-to-r from-transparent via-primary to-transparent" />
              )}

              <div
                className={`w-12 h-12 rounded-xl flex items-center justify-center mb-5 transition-colors ${
                  service.featured
                    ? "bg-primary/20 group-hover:bg-primary/30"
                    : "bg-secondary group-hover:bg-primary/10"
                }`}
              >
                <service.icon
                  className={`w-6 h-6 ${
                    service.featured ? "text-primary" : "text-muted-foreground group-hover:text-primary"
                  } transition-colors`}
                />
              </div>

              <h3 className="text-foreground font-bold text-lg mb-3">
                {service.title}
                {service.featured && (
                  <span className="ml-2 text-[10px] text-primary bg-primary/10 px-2 py-0.5 rounded-full uppercase tracking-wider font-medium align-middle">
                    Popular
                  </span>
                )}
              </h3>

              <p className="text-muted-foreground text-sm leading-relaxed mb-5">
                {service.description}
              </p>

              <div className="flex flex-wrap gap-2">
                {service.tags.map((tag) => (
                  <span
                    key={tag}
                    className="px-2.5 py-1 text-[11px] font-mono text-muted-foreground bg-secondary rounded-md border border-border"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* CTA */}
        <div
          className={`mt-16 text-center transition-all duration-1000 delay-700 ${
            isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
          }`}
        >
          <div className="inline-flex flex-col sm:flex-row items-center gap-4 px-8 py-6 rounded-2xl border border-border bg-card/50 backdrop-blur-sm">
            <p className="text-foreground font-medium">
              Want to{" "}
              <span className="text-primary">kick start</span>{" "}
              your project?
            </p>
            <a
              href="#contact"
              className="px-6 py-2.5 bg-primary text-primary-foreground font-medium text-sm rounded-lg hover:bg-primary/90 transition-all hover:shadow-[0_0_20px_rgba(0,229,255,0.3)]"
            >
              Request a Proposal
            </a>
          </div>
        </div>
      </div>
    </section>
  )
}
