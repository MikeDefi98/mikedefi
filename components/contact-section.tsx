"use client"

import { useScrollAnimation } from "@/hooks/use-scroll-animation"
import { Mail, Send, CheckCircle, AlertCircle, Loader2 } from "lucide-react"
import { useState } from "react"

export function ContactSection() {
  const { ref, isVisible } = useScrollAnimation()
  const [status, setStatus] = useState<"idle" | "sending" | "success" | "error">("idle")
  const [errorMessage, setErrorMessage] = useState("")
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    description: "",
  })

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setStatus("sending")
    setErrorMessage("")

    try {
      const res = await fetch("/api/send-quote", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error || "Something went wrong.")
      }

      setStatus("success")
      setFormData({ name: "", email: "", description: "" })
    } catch (err) {
      setStatus("error")
      setErrorMessage(err instanceof Error ? err.message : "Failed to send. Please try again.")
    }
  }

  return (
    <section id="contact" className="relative py-24 lg:py-32">
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-1/2 h-px bg-gradient-to-r from-transparent via-border to-transparent" />

      <div ref={ref} className="mx-auto max-w-3xl px-6 lg:px-8">
        <div
          className={`relative rounded-2xl border border-border bg-card p-8 lg:p-12 transition-all duration-1000 ${
            isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
          }`}
        >
          {/* Top glow */}
          <div className="absolute -top-px left-1/4 right-1/4 h-px bg-gradient-to-r from-transparent via-primary to-transparent" />

          <div className="text-center mb-10">
            <div className="inline-flex items-center justify-center w-14 h-14 rounded-xl bg-primary/10 mb-6">
              <Mail className="w-6 h-6 text-primary" />
            </div>

            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4 text-balance">
              Request a Quote
            </h2>

            <p className="text-muted-foreground max-w-lg mx-auto leading-relaxed">
              Tell us about your project and we{"'"}ll get back to you with a
              detailed proposal. No commitment, just clarity.
            </p>
          </div>

          {status === "success" ? (
            <div className="text-center py-8">
              <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="w-8 h-8 text-primary" />
              </div>
              <p className="text-foreground font-bold text-lg">Message Sent!</p>
              <p className="text-muted-foreground mt-2 leading-relaxed">
                Thank you for reaching out. We{"'"}ll review your request and
                get back to you within 24 hours.
              </p>
              <button
                onClick={() => setStatus("idle")}
                className="mt-6 px-6 py-2.5 text-sm font-medium text-primary border border-primary/30 rounded-lg hover:bg-primary/10 transition-colors"
              >
                Send Another Request
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="flex flex-col gap-5">
              {/* Name field */}
              <div className="flex flex-col gap-2">
                <label
                  htmlFor="quote-name"
                  className="text-sm font-medium text-foreground"
                >
                  Full Name
                </label>
                <input
                  id="quote-name"
                  type="text"
                  placeholder="John Doe"
                  required
                  value={formData.name}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, name: e.target.value }))
                  }
                  className="px-4 py-3 rounded-lg bg-secondary border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/20 transition-all text-sm"
                />
              </div>

              {/* Email field */}
              <div className="flex flex-col gap-2">
                <label
                  htmlFor="quote-email"
                  className="text-sm font-medium text-foreground"
                >
                  Email Address
                </label>
                <input
                  id="quote-email"
                  type="email"
                  placeholder="john@example.com"
                  required
                  value={formData.email}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, email: e.target.value }))
                  }
                  className="px-4 py-3 rounded-lg bg-secondary border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/20 transition-all text-sm"
                />
              </div>

              {/* Description field */}
              <div className="flex flex-col gap-2">
                <label
                  htmlFor="quote-description"
                  className="text-sm font-medium text-foreground"
                >
                  Project Description
                </label>
                <textarea
                  id="quote-description"
                  placeholder="Tell us about your project, goals, timeline, and any specific requirements..."
                  required
                  rows={5}
                  value={formData.description}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      description: e.target.value,
                    }))
                  }
                  className="px-4 py-3 rounded-lg bg-secondary border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/20 transition-all text-sm resize-none leading-relaxed"
                />
              </div>

              {/* Error message */}
              {status === "error" && (
                <div className="flex items-center gap-2 p-3 rounded-lg bg-accent/10 border border-accent/20">
                  <AlertCircle className="w-4 h-4 text-accent shrink-0" />
                  <p className="text-accent text-sm">{errorMessage}</p>
                </div>
              )}

              {/* Submit button */}
              <button
                type="submit"
                disabled={status === "sending"}
                className="flex items-center justify-center gap-2 px-6 py-3.5 bg-primary text-primary-foreground font-semibold text-sm rounded-lg hover:bg-primary/90 transition-all hover:shadow-[0_0_20px_rgba(0,229,255,0.3)] disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:shadow-none mt-1"
              >
                {status === "sending" ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Sending...
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    Send Request
                  </>
                )}
              </button>
            </form>
          )}
        </div>
      </div>
    </section>
  )
}
