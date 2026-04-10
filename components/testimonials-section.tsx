"use client"

import { useScrollAnimation } from "@/hooks/use-scroll-animation"
import { Star, Quote } from "lucide-react"
import { useState } from "react"

const testimonials = [
  {
    name: "Deart Simon",
    role: "Business Owner",
    location: "Belgium",
    text: "Mike Web's web development services are simply amazing. They created a website for my business that exceeded my expectations. Their team is professional, creative, and responsive. I would definitely recommend them to anyone looking for high-quality web development services.",
    rating: 4,
  },
  {
    name: "Enkeled Trifoni",
    role: "NFT DeFi",
    location: "",
    text: "I was blown away by the social media growth services offered by Mike Web. Their team helped me increase my social media presence in a short period of time. I received more followers and likes on my pages than I ever thought possible. Highly recommended!",
    rating: 4,
  },
  {
    name: "Martin Hunt",
    role: "CEO, Alameda Beats",
    location: "",
    text: "Mike Web's web design services are top-notch. They created a beautiful and functional website for my business that perfectly reflects my brand. The design process was collaborative and their team was always willing to listen to my feedback.",
    rating: 4,
  },
  {
    name: "Buck Daniel",
    role: "Crypto Investor",
    location: "",
    text: "Mike Web's video editing services are fantastic. They helped me create a corporate video for my business that really captured the essence of what we do. Their team is skilled and creative, and they worked closely with me to ensure the final product met my exact specifications.",
    rating: 4,
  },
  {
    name: "Adam Koel",
    role: "Business Owner",
    location: "California",
    text: "Mike Web's UI/UX design services are exceptional. They helped me create a user-friendly and visually stunning interface for my app. Their team is knowledgeable and attentive, and they really took the time to understand my business and my audience.",
    rating: 4,
  },
  {
    name: "James Kinnear",
    role: "Restaurant Manager",
    location: "Italy",
    text: "Mike Web exceeded my expectations with their exceptional web development and UI/UX design services. Their team of experts listened to my needs and delivered a stunning website that perfectly captured the essence of my brand.",
    rating: 4,
  },
]

export function TestimonialsSection() {
  const { ref, isVisible } = useScrollAnimation()
  const [activeIndex, setActiveIndex] = useState(0)

  return (
    <section id="testimonials" className="relative py-24 lg:py-32">
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-1/2 h-px bg-gradient-to-r from-transparent via-border to-transparent" />

      <div ref={ref} className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-16">
          {/* Left side */}
          <div
            className={`transition-all duration-1000 ${
              isVisible ? "opacity-100 translate-x-0" : "opacity-0 -translate-x-12"
            }`}
          >
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-primary/20 bg-primary/5 mb-6">
              <span className="text-xs text-primary uppercase tracking-widest font-medium">
                Testimonials
              </span>
            </div>

            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mb-6 leading-tight text-balance">
              What Our Clients Say About Our{" "}
              <span className="text-primary">Work</span>
            </h2>

            <p className="text-muted-foreground leading-relaxed mb-10">
              Don{"'"}t just take our word for it. Here{"'"}s what our clients have to
              say about working with Mike Web.
            </p>

            {/* Avatar selector */}
            <div className="flex flex-wrap gap-3">
              {testimonials.map((t, i) => (
                <button
                  key={t.name}
                  onClick={() => setActiveIndex(i)}
                  className={`w-12 h-12 rounded-full flex items-center justify-center text-sm font-bold transition-all ${
                    i === activeIndex
                      ? "bg-primary text-primary-foreground ring-2 ring-primary ring-offset-2 ring-offset-background"
                      : "bg-secondary text-muted-foreground hover:bg-primary/10"
                  }`}
                  aria-label={`View testimonial from ${t.name}`}
                >
                  {t.name
                    .split(" ")
                    .map((n) => n[0])
                    .join("")}
                </button>
              ))}
            </div>
          </div>

          {/* Right side - Active testimonial */}
          <div
            className={`transition-all duration-1000 delay-200 ${
              isVisible ? "opacity-100 translate-x-0" : "opacity-0 translate-x-12"
            }`}
          >
            <div className="relative p-8 lg:p-10 rounded-2xl bg-card border border-border">
              <Quote className="w-10 h-10 text-primary/20 mb-6" />

              <p className="text-foreground text-lg leading-relaxed mb-8">
                {testimonials[activeIndex].text}
              </p>

              <div className="flex items-center gap-1 mb-4">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star
                    key={i}
                    className={`w-4 h-4 ${
                      i < testimonials[activeIndex].rating
                        ? "text-primary fill-primary"
                        : "text-border"
                    }`}
                  />
                ))}
              </div>

              <div>
                <p className="text-foreground font-bold">
                  {testimonials[activeIndex].name}
                </p>
                <p className="text-muted-foreground text-sm">
                  {testimonials[activeIndex].role}
                  {testimonials[activeIndex].location &&
                    ` - ${testimonials[activeIndex].location}`}
                </p>
              </div>

              {/* Decorative line */}
              <div className="absolute top-0 left-10 right-10 h-px bg-gradient-to-r from-transparent via-primary/30 to-transparent" />
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
