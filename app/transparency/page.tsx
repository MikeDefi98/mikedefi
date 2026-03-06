import type { Metadata } from "next"
import { SeoPageLayout } from "@/components/seo-page-layout"
import {
  BookOpen,
  Briefcase,
  DollarSign,
  FileText,
  Globe,
  MapPin,
  Mail,
  Phone,
  Calendar,
  CheckCircle,
} from "lucide-react"

export const metadata: Metadata = {
  title: "Mike Web Transparency | Business Information & Company Background – mikedefi.com",
  description:
    "Full transparency about Mike Web (mikedefi.com). Business history since 2015, service pricing model, team background, how projects are scoped, and contact verification details.",
  keywords:
    "Mike Web transparency, mikedefi.com about, Mike Defi background, Mike Web company info, Mike Web legitimate, Mike Web business details",
  openGraph: {
    title: "Mike Web Transparency | Business Information – mikedefi.com",
    description:
      "Open company information for Mike Web (mikedefi.com). Registered address, history, team, and pricing model.",
    url: "https://mikedefi.com/transparency",
    siteName: "Mike Web",
  },
}

const timeline = [
  {
    year: "2015",
    title: "Founded",
    description:
      "Mike Web started as a freelance web development operation focused on small business websites and landing pages.",
  },
  {
    year: "2017",
    title: "Studio Expansion",
    description:
      "Grew into a full development studio adding UI/UX design, app development, and digital marketing services.",
  },
  {
    year: "2019",
    title: "DeFi & Crypto Specialization",
    description:
      "Added crypto trading bot development and DeFi platform UI to the service roster, serving early DeFi operators.",
  },
  {
    year: "2021",
    title: "150+ Clients Served",
    description:
      "Crossed the 150 satisfied client milestone across Europe, North America, and Asia-Pacific regions.",
  },
  {
    year: "2023",
    title: "200+ Projects Delivered",
    description:
      "Surpassed 200 completed projects ranging from restaurant websites to enterprise crypto automation tools.",
  },
  {
    year: "2025",
    title: "Active & Growing",
    description:
      "Continuing to deliver high-quality development work globally with a focus on transparency and long-term client partnerships.",
  },
]

const pricingModel = [
  {
    title: "Milestone-Based Payments",
    description:
      "Projects are split into phases. Payment is released per milestone — you only pay for completed, approved work.",
  },
  {
    title: "Written Contracts",
    description:
      "Every engagement begins with a signed contract defining scope, deliverables, timeline, and payment terms. No verbal-only agreements.",
  },
  {
    title: "Transparent Quoting",
    description:
      "Quotes are itemized and explained. You know exactly what you are paying for and why.",
  },
  {
    title: "Revision Policy",
    description:
      "Every project includes a defined revision round. Extra revisions are quoted separately and never added without your approval.",
  },
]

const services = [
  { name: "Web Development", detail: "Custom websites, landing pages, e-commerce, CMS" },
  { name: "App Development", detail: "iOS, Android, cross-platform with React Native / Flutter" },
  { name: "UI/UX Design", detail: "Wireframes, prototypes, design systems, user research" },
  { name: "Crypto Trading Bots", detail: "Automated bots for CEX/DEX platforms, backtested strategies" },
  { name: "Digital Marketing", detail: "SEO, social media growth, content strategy, paid ads" },
  { name: "Video Editing", detail: "Corporate videos, product demos, social content" },
]

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: "Mike Web",
  alternateName: ["mikedefi.com", "Mike Defi"],
  url: "https://mikedefi.com",
  foundingDate: "2015",
  telephone: "+12086375529",
  email: "admin@mikedefi.com",
  address: {
    "@type": "PostalAddress",
    streetAddress: "5615 24th Ave NW",
    addressLocality: "Seattle",
    addressRegion: "Washington",
    addressCountry: "US",
  },
  sameAs: [
    "https://instagram.com/mike_dev_defi",
    "https://discord.com/users/1368705276672475267/",
  ],
  description:
    "Mike Web is a web and app development studio founded in 2015. Serving 150+ clients globally with web development, crypto automation, UI/UX design, and digital marketing.",
}

export default function TransparencyPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <SeoPageLayout
        badge="Transparency"
        title="Company Transparency"
        subtitle="Everything You Need to Know About Mike Web"
        description="We believe clients deserve complete visibility into who they are working with. This page documents Mike Web's history, team background, service offerings, pricing model, and contact information."
        breadcrumbs={[
          { label: "Home", href: "/" },
          { label: "Transparency" },
        ]}
      >
        {/* Business info card */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-16">
          {[
            { icon: Globe, label: "Website", value: "mikedefi.com" },
            { icon: Calendar, label: "Founded", value: "2015" },
            { icon: MapPin, label: "Location", value: "Seattle, WA, USA" },
            { icon: Mail, label: "Email", value: "admin@mikedefi.com" },
          ].map(({ icon: Icon, label, value }) => (
            <div key={label} className="p-5 rounded-xl bg-card border border-border flex items-start gap-3">
              <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center border border-primary/20 shrink-0">
                <Icon className="w-4 h-4 text-primary" />
              </div>
              <div>
                <p className="text-muted-foreground text-xs uppercase tracking-widest mb-0.5">{label}</p>
                <p className="text-foreground font-semibold text-sm">{value}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Company timeline */}
        <section className="mb-16">
          <h2 className="text-2xl font-bold text-foreground mb-8 flex items-center gap-3">
            <Briefcase className="w-6 h-6 text-primary" />
            Company History
          </h2>
          <div className="relative">
            <div className="absolute left-[22px] top-0 bottom-0 w-px bg-border" />
            <div className="flex flex-col gap-8">
              {timeline.map(({ year, title, description }) => (
                <div key={year} className="flex gap-6 relative">
                  <div className="w-11 h-11 rounded-full bg-primary/10 border-2 border-primary/30 flex items-center justify-center shrink-0 z-10">
                    <span className="text-primary font-mono text-xs font-bold">{year.slice(2)}</span>
                  </div>
                  <div className="pt-1.5">
                    <div className="flex items-center gap-3 mb-1">
                      <span className="text-muted-foreground font-mono text-xs">{year}</span>
                      <span className="text-foreground font-bold text-sm">{title}</span>
                    </div>
                    <p className="text-muted-foreground text-sm leading-relaxed">{description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Services offered */}
        <section className="mb-16">
          <h2 className="text-2xl font-bold text-foreground mb-8 flex items-center gap-3">
            <BookOpen className="w-6 h-6 text-primary" />
            Services Offered
          </h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {services.map(({ name, detail }) => (
              <div key={name} className="p-5 rounded-xl bg-card border border-border">
                <p className="text-foreground font-semibold text-sm mb-1">{name}</p>
                <p className="text-muted-foreground text-xs leading-relaxed">{detail}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Pricing model */}
        <section className="mb-16">
          <h2 className="text-2xl font-bold text-foreground mb-8 flex items-center gap-3">
            <DollarSign className="w-6 h-6 text-primary" />
            How Pricing Works
          </h2>
          <div className="grid sm:grid-cols-2 gap-6">
            {pricingModel.map(({ title, description }) => (
              <div key={title} className="flex gap-4 p-6 rounded-xl bg-card border border-border">
                <CheckCircle className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                <div>
                  <p className="text-foreground font-bold text-sm mb-1">{title}</p>
                  <p className="text-muted-foreground text-sm leading-relaxed">{description}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Contract note */}
        <div className="flex items-start gap-4 p-8 rounded-2xl bg-primary/5 border border-primary/20 mb-16">
          <FileText className="w-6 h-6 text-primary shrink-0 mt-0.5" />
          <div>
            <h3 className="text-foreground font-bold mb-2">Contract-First Policy</h3>
            <p className="text-muted-foreground text-sm leading-relaxed">
              Mike Web does not begin work on any project without a signed contract and NDA. This
              protects both the client and our studio. Contracts define scope, deliverables,
              payment schedule, revision limits, and intellectual property ownership. We are happy
              to share a sample contract template before you commit to working with us.
            </p>
          </div>
        </div>


        {/* FAQ */}
        <section>
          <h2 className="text-2xl font-bold text-foreground mb-8">Transparency FAQ</h2>
          <div className="flex flex-col gap-4">
            {[
              {
                q: "Who founded Mike Web?",
                a: "Mike Web was founded in 2015 by an independent web developer who built the studio around honest, quality-first development work. The studio has grown to serve 150+ clients across North America, Europe, and Asia-Pacific.",
              },
              {
                q: "Where is Mike Web based?",
                a: "Mike Web is registered and operated out of Seattle, Washington, USA. Our address is 5615 24th Ave NW, Seattle, WA.",
              },
              {
                q: "Does Mike Web have a refund policy?",
                a: "Yes. Our contracts include a clear refund clause tied to milestone delivery. If a milestone is not delivered to the agreed spec, clients receive a revision or partial refund as defined in the contract.",
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
