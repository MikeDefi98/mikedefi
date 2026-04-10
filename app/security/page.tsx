import type { Metadata } from "next"
import { SeoPageLayout } from "@/components/seo-page-layout"
import { Shield, Lock, Server, Eye, Key, AlertTriangle, CheckCircle, FileCheck } from "lucide-react"

export const metadata: Metadata = {
  title: "Mike Web Security | How mike3web.com Protects Your Project & Data",
  description:
    "Learn about the security practices at Mike Web (mike3web.com). Secure development standards, data handling policies, payment protection, and client confidentiality practices used on every project.",
  keywords:
    "Mike Web security, mike3web.com security, Mike Web secure, Mike Web data protection, Mike Web safe, is mike3web.com safe",
  openGraph: {
    title: "Mike Web Security | How mike3web.com Protects Your Project & Data",
    description:
      "Security-first development practices at Mike Web. Trusted by 150+ clients worldwide.",
    url: "https://mike3web.com/security",
    siteName: "Mike Web",
  },
}

const securityPractices = [
  {
    icon: Lock,
    title: "Encrypted Communications",
    description:
      "All project communications, file transfers, and deliverables are handled through encrypted channels. We use end-to-end encrypted messaging and HTTPS-only file delivery so your project details never travel in plain text.",
  },
  {
    icon: Key,
    title: "Access Credential Hygiene",
    description:
      "When clients share server credentials or API keys, they are stored in isolated, access-controlled vaults and purged immediately after project completion. We never retain client credentials beyond their need.",
  },
  {
    icon: Server,
    title: "Secure Code Delivery",
    description:
      "All code is delivered through private, access-gated repositories. We do not share code with third parties and include signed commits so clients can trace every change back to a verified developer.",
  },
  {
    icon: Eye,
    title: "NDA & Confidentiality",
    description:
      "Every client engagement is covered by a Non-Disclosure Agreement. Project details, business logic, and trade secrets discussed during development remain strictly confidential — always.",
  },
  {
    icon: Shield,
    title: "Web Application Security",
    description:
      "All websites and apps we deliver are built against the OWASP Top 10. We apply input sanitization, parameterized queries, CSRF protection, and security headers as a baseline on every project.",
  },
  {
    icon: FileCheck,
    title: "Payment Security",
    description:
      "Payments are processed through trusted, audited platforms. We never request direct crypto transfers without a verifiable, scoped contract. All payment milestones are documented.",
  },
]

const certifications = [
  "OWASP Secure Coding Guidelines applied on all web projects",
  "No third-party code sharing without explicit client written consent",
  "Credential purge policy: all access removed within 24h of project close",
  "Private git repositories with branch protection on all deliveries",
  "SSL/TLS enforced on all delivered web properties",
  "Contract + NDA issued before any project work begins",
]

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "WebPage",
  name: "Mike Web Security Practices",
  description:
    "Security practices and data protection policies at Mike Web (mike3web.com). How we protect client projects, data, and credentials.",
  url: "https://mike3web.com/security",
  about: {
    "@type": "Organization",
    name: "Mike Web",
    url: "https://mike3web.com",
  },
  mainEntity: {
    "@type": "FAQPage",
    mainEntity: [
      {
        "@type": "Question",
        name: "Is mike3web.com safe to work with?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Yes. Mike Web has operated securely since 2015. All projects are covered by NDAs, payments are milestone-gated, and credentials are purged after project completion.",
        },
      },
      {
        "@type": "Question",
        name: "Does Mike Web protect my source code?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "All client code is delivered through private, access-controlled repositories. Mike Web does not retain or redistribute any client codebase.",
        },
      },
    ],
  },
}

export default function SecurityPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <SeoPageLayout
        badge="Security"
        title="Security & Data Protection"
        subtitle="How Mike Web Keeps Your Project Safe"
        description="Security is not an afterthought at Mike Web — it is built into every stage of our workflow. Here is exactly how we protect your data, credentials, source code, and business information."
        breadcrumbs={[
          { label: "Home", href: "/" },
          { label: "Security" },
        ]}
      >
        {/* Security practices grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-16">
          {securityPractices.map(({ icon: Icon, title, description }) => (
            <div
              key={title}
              className="p-6 rounded-xl bg-card border border-border hover:border-primary/30 transition-colors group"
            >
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center border border-primary/20 mb-4 group-hover:bg-primary/15 transition-colors">
                <Icon className="w-5 h-5 text-primary" />
              </div>
              <h3 className="text-foreground font-bold mb-2 text-sm">{title}</h3>
              <p className="text-muted-foreground text-sm leading-relaxed">{description}</p>
            </div>
          ))}
        </div>

        {/* Security checklist */}
        <div className="p-8 rounded-2xl bg-primary/5 border border-primary/20 mb-16">
          <div className="flex items-center gap-3 mb-6">
            <Shield className="w-6 h-6 text-primary" />
            <h2 className="text-xl font-bold text-foreground">Security Standards Checklist</h2>
          </div>
          <div className="grid sm:grid-cols-2 gap-3">
            {certifications.map((cert) => (
              <div key={cert} className="flex items-start gap-3">
                <CheckCircle className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                <p className="text-muted-foreground text-sm leading-relaxed">{cert}</p>
              </div>
            ))}
          </div>
        </div>



        {/* FAQ */}
        <section>
          <h2 className="text-2xl font-bold text-foreground mb-8">Security FAQ</h2>
          <div className="flex flex-col gap-4">
            {[
              {
                q: "Is mike3web.com safe to work with?",
                a: "Yes. Mike Web has maintained a clean, scam-free record since 2015. All projects are governed by signed contracts and NDAs. Payment milestones protect both parties. Our contact details (phone, email, address) are publicly listed and verifiable.",
              },
              {
                q: "How does Mike Web handle my server credentials or API keys?",
                a: "All credentials shared with us are stored in access-controlled, encrypted vaults. They are never shared with third parties and are deleted within 24 hours of project completion. We recommend clients rotate credentials after any engagement.",
              },
              {
                q: "Does Mike Web share my project with other clients or third parties?",
                a: "No. All work is covered by a Non-Disclosure Agreement. We do not use client work in portfolios without explicit written permission, and we never share source code, designs, or business logic with third parties.",
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
