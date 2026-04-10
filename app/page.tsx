import { Navbar } from "@/components/navbar"
import { HeroSection } from "@/components/hero-section"
import { AboutSection } from "@/components/about-section"
import { ServicesSection } from "@/components/services-section"
import { PortfolioSection } from "@/components/portfolio-section"
import { TestimonialsSection } from "@/components/testimonials-section"
import { BlogSection } from "@/components/blog-section"
import { ContactSection } from "@/components/contact-section"
import { Footer } from "@/components/footer"
import { ParticleCanvas } from "@/components/particle-canvas"
import { GridBackground } from "@/components/grid-background"
import { ScrollToTop } from "@/components/scroll-to-top"

export default function Home() {
  return (
    <main className="relative min-h-screen bg-background">
      <GridBackground />
      <ParticleCanvas />
      <Navbar />
      <HeroSection />
      <AboutSection />
      <ServicesSection />
      <PortfolioSection />
      <TestimonialsSection />
      <BlogSection />
      <ContactSection />
      <Footer />
      <ScrollToTop />
    </main>
  )
}
