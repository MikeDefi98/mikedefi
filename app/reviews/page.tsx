import type { Metadata } from "next"
import { SeoPageLayout } from "@/components/seo-page-layout"
import { Star, Quote, CheckCircle, Users, Award, TrendingUp } from "lucide-react"

export const metadata: Metadata = {
  title: "Mike Web Reviews | Client Testimonials & Ratings – mike3web.com",
  description:
    "Read verified client reviews of Mike Web (mike3web.com). Real testimonials from businesses and developers who worked with Mike Web on web development, app development, and crypto automation projects.",
  keywords:
    "Mike Web review, mike3web.com review, Mike Web review, Mike Web testimonials, is Mike Web legit, Mike Web clients",
  openGraph: {
    title: "Mike Web Reviews | Client Testimonials & Ratings – mike3web.com",
    description:
      "Verified client reviews for Mike Web (mike3web.com). Trusted web development studio since 2015.",
    url: "https://mike3web.com/reviews",
    siteName: "Mike Web",
  },
}

const reviews = [
  {
    name: "Deart Simon",
    role: "Business Owner",
    location: "Belgium",
    rating: 5,
    date: "March 2024",
    project: "Business Website",
    text: "Mike Web's web development services are simply amazing. They created a website for my business that exceeded my expectations. Their team is professional, creative, and responsive. I would definitely recommend them to anyone looking for high-quality web development services.",
  },
  {
    name: "Enkeled Trifoni",
    role: "NFT & DeFi Operator",
    location: "Europe",
    rating: 5,
    date: "January 2024",
    project: "DeFi Platform UI",
    text: "I was blown away by the social media growth services offered by Mike Web. Their team helped me increase my social media presence in a short period of time. I received more followers and likes on my pages than I ever thought possible. Highly recommended!",
  },
  {
    name: "Martin Hunt",
    role: "CEO, Alameda Beats",
    location: "United States",
    rating: 5,
    date: "November 2023",
    project: "Brand Website",
    text: "Mike Web's web design services are top-notch. They created a beautiful and functional website for my business that perfectly reflects my brand. The design process was collaborative and their team was always willing to listen to my feedback.",
  },
  {
    name: "Buck Daniel",
    role: "Crypto Investor",
    location: "United States",
    rating: 5,
    date: "September 2023",
    project: "Corporate Video",
    text: "Mike Web's video editing services are fantastic. They helped me create a corporate video for my business that really captured the essence of what we do. Their team is skilled and creative, and they worked closely with me to ensure the final product met my exact specifications.",
  },
  {
    name: "Adam Koel",
    role: "Business Owner",
    location: "California, US",
    rating: 5,
    date: "July 2023",
    project: "App UI/UX Design",
    text: "Mike Web's UI/UX design services are exceptional. They helped me create a user-friendly and visually stunning interface for my app. Their team is knowledgeable and attentive, and they really took the time to understand my business and my audience.",
  },
  {
    name: "James Kinnear",
    role: "Restaurant Manager",
    location: "Italy",
    rating: 5,
    date: "May 2023",
    project: "Restaurant Website",
    text: "Mike Web exceeded my expectations with their exceptional web development and UI/UX design services. Their team of experts listened to my needs and delivered a stunning website that perfectly captured the essence of my brand.",
  },
]

const stats = [
  { icon: Users, label: "Happy Clients", value: "150+" },
  { icon: Award, label: "Projects Delivered", value: "200+" },
  { icon: TrendingUp, label: "Years Active", value: "10+" },
  { icon: Star, label: "Average Rating", value: "5.0" },
]

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "LocalBusiness",
  name: "Mike Web",
  alternateName: ["mike3web.com", "Mike Web", "Mike Web Dev Studio"],
  url: "https://mike3web.com",
  telephone: "+12086375529",
  email: "admin@mike3web.com",
  address: {
    "@type": "PostalAddress",
    streetAddress: "5615 24th Ave NW",
    addressLocality: "Seattle",
    addressRegion: "Washington",
    addressCountry: "US",
  },
  aggregateRating: {
    "@type": "AggregateRating",
    ratingValue: "5",
    reviewCount: "6",
    bestRating: "5",
    worstRating: "1",
  },
  review: reviews.map((r) => ({
    "@type": "Review",
    author: { "@type": "Person", name: r.name },
    datePublished: r.date,
    reviewRating: {
      "@type": "Rating",
      ratingValue: r.rating,
      bestRating: 5,
    },
    reviewBody: r.text,
  })),
}

export default function ReviewsPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <SeoPageLayout
        badge="Client Reviews"
        title="Verified Client Reviews"
        subtitle="Mike Web (mike3web.com)"
        description="Real reviews from real clients. Every project we deliver is built on trust, transparency, and results. Here is what our clients say about working with Mike Web."
        breadcrumbs={[
          { label: "Home", href: "/" },
          { label: "Reviews" },
        ]}
      >
        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-16">
          {stats.map(({ icon: Icon, label, value }) => (
            <div
              key={label}
              className="flex flex-col items-center gap-3 p-6 rounded-xl bg-card border border-border text-center"
            >
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center border border-primary/20">
                <Icon className="w-5 h-5 text-primary" />
              </div>
              <p className="text-2xl font-bold text-foreground font-mono">{value}</p>
              <p className="text-muted-foreground text-xs uppercase tracking-widest">{label}</p>
            </div>
          ))}
        </div>

        {/* Overall rating callout */}
        <div className="flex flex-col sm:flex-row items-center gap-6 p-8 rounded-2xl bg-primary/5 border border-primary/20 mb-16">
          <div className="flex flex-col items-center shrink-0">
            <p className="text-6xl font-bold text-primary font-mono">5.0</p>
            <div className="flex gap-1 mt-2">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star key={i} className="w-5 h-5 text-primary fill-primary" />
              ))}
            </div>
            <p className="text-muted-foreground text-sm mt-1">Based on 6+ reviews</p>
          </div>
          <div className="h-px w-full sm:h-16 sm:w-px bg-border" />
          <div>
            <p className="text-foreground font-bold text-lg mb-2">
              Consistently 5-star rated since 2015
            </p>
            <p className="text-muted-foreground leading-relaxed text-sm">
              Mike Web has maintained a perfect client satisfaction record across web development,
              app development, UI/UX design, and digital marketing engagements. Every review
              on this page is from a real client who worked directly with our team.
            </p>
          </div>
        </div>

        {/* Review cards */}
        <div className="grid md:grid-cols-2 gap-6 mb-16">
          {reviews.map((review) => (
            <article
              key={review.name}
              className="relative p-8 rounded-2xl bg-card border border-border hover:border-primary/30 transition-colors"
            >
              <div className="absolute top-0 left-8 right-8 h-px bg-gradient-to-r from-transparent via-primary/20 to-transparent" />

              <Quote className="w-8 h-8 text-primary/20 mb-4" />

              <p className="text-foreground leading-relaxed mb-6 text-sm">{review.text}</p>

              <div className="flex gap-0.5 mb-4">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star
                    key={i}
                    className={`w-4 h-4 ${
                      i < review.rating ? "text-primary fill-primary" : "text-border"
                    }`}
                  />
                ))}
              </div>

              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-foreground font-bold text-sm">{review.name}</p>
                  <p className="text-muted-foreground text-xs">
                    {review.role} &bull; {review.location}
                  </p>
                </div>
                <div className="text-right">
                  <span className="inline-block px-2 py-0.5 rounded-full bg-secondary text-muted-foreground text-xs">
                    {review.project}
                  </span>
                  <p className="text-muted-foreground text-xs mt-1">{review.date}</p>
                </div>
              </div>
            </article>
          ))}
        </div>

        {/* Verification note */}
        <div className="flex flex-col sm:flex-row items-start gap-4 p-6 rounded-xl bg-secondary border border-border">
          <CheckCircle className="w-5 h-5 text-primary shrink-0 mt-0.5" />
          <div>
            <p className="text-foreground font-semibold text-sm mb-1">About These Reviews</p>
            <p className="text-muted-foreground text-sm leading-relaxed">
              All reviews displayed on this page were submitted directly by clients who completed
              projects with Mike Web (mike3web.com). We do not solicit, incentivize, or fabricate
              reviews. Client identity details are shared with permission. For questions about any
              review, contact us at{" "}
              <a href="mailto:admin@mike3web.com" className="text-primary hover:underline">
                admin@mike3web.com
              </a>
              .
            </p>
          </div>
        </div>

        {/* FAQ */}
        <section className="mt-16">
          <h2 className="text-2xl font-bold text-foreground mb-8">Frequently Asked Questions</h2>
          <div className="flex flex-col gap-4">
            {[
              {
                q: "Are Mike Web reviews real?",
                a: "Yes. Every review on this page comes from a verified client who engaged Mike Web (mike3web.com) for a real project. We have never purchased or fabricated reviews.",
              },
              {
                q: "How do I verify a Mike Web testimonial?",
                a: "You can reach out to us directly at admin@mike3web.com and request reference contact details for any past client (with their consent). We are happy to facilitate direct reference calls.",
              },
              {
                q: "What projects has Mike Web completed?",
                a: "Mike Web has delivered 200+ projects including business websites, e-commerce platforms, DeFi UI dashboards, crypto trading bots, mobile apps, and digital marketing campaigns.",
              },
              {
                q: "How long has Mike Web been in business?",
                a: "Mike Web has been actively delivering digital projects since 2015 — over 10 years of verifiable work history in web development, app development, and digital marketing.",
              },
            ].map(({ q, a }) => (
              <div key={q} className="p-6 rounded-xl bg-card border border-border">
                <p className="text-foreground font-semibold mb-2 text-sm">{q}</p>
                <p className="text-muted-foreground text-sm leading-relaxed">{a}</p>
              </div>
            ))}
          </div>
        </section>
      </SeoPageLayout>
    </>
  )
}
