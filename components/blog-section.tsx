"use client"

import { useScrollAnimation } from "@/hooks/use-scroll-animation"
import { ArrowUpRight, Clock, Tag } from "lucide-react"
import Image from "next/image"

const posts = [
  {
    title: "Everything You Need To Know About Node.js",
    tag: "Node.js",
    date: "Sep 23, 2020",
    url: "https://nodejs.org/en/about",
    image: "/images/blog-node.jpg",
  },
  {
    title: "Exploring the Key Features of Laravel 7 Framework",
    tag: "Laravel",
    date: "Sep 24, 2020",
    url: "https://laravel.com/docs/7.x/releases",
    image: "/images/blog-laravel.jpg",
  },
  {
    title: "Best Technology for Mobile Application Development",
    tag: "Mobile",
    date: "Sep 25, 2020",
    url: "https://www.fingent.com/blog/top-technologies-used-to-develop-mobile-app/",
    image: "/images/blog-mobile.jpg",
  },
]

export function BlogSection() {
  const { ref, isVisible } = useScrollAnimation()

  return (
    <section id="blog" className="relative py-24 lg:py-32">
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
              Insights
            </span>
          </div>

          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mb-6 text-balance">
            Latest <span className="text-primary">Blog</span> Posts
          </h2>

          <p className="text-muted-foreground text-lg leading-relaxed">
            Stay up-to-date on the latest technologies and trends in web development,
            blockchain, and design.
          </p>
        </div>

        {/* Blog grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {posts.map((post, index) => (
            <a
              key={post.title}
              href={post.url}
              target="_blank"
              rel="noopener noreferrer"
              className={`group relative flex flex-col rounded-xl bg-card border border-border hover:border-primary/20 overflow-hidden transition-all duration-700 hover:shadow-[0_0_30px_rgba(0,229,255,0.05)] ${
                isVisible
                  ? "opacity-100 translate-y-0"
                  : "opacity-0 translate-y-8"
              }`}
              style={{ transitionDelay: `${index * 150}ms` }}
            >
              {/* Image */}
              <div className="relative aspect-[16/10] overflow-hidden">
                <Image
                  src={post.image}
                  alt={post.title}
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-700"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-card to-transparent" />

                {/* Tags overlay */}
                <div className="absolute bottom-4 left-4 flex items-center gap-3">
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 text-[11px] font-mono text-primary bg-background/80 backdrop-blur-sm border border-primary/20 rounded-md">
                    <Tag className="w-3 h-3" />
                    {post.tag}
                  </span>
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 text-[11px] text-muted-foreground bg-background/80 backdrop-blur-sm rounded-md">
                    <Clock className="w-3 h-3" />
                    {post.date}
                  </span>
                </div>
              </div>

              {/* Content */}
              <div className="p-6 flex-1 flex flex-col">
                <h3 className="text-foreground font-bold text-lg mb-4 group-hover:text-primary transition-colors text-balance">
                  {post.title}
                </h3>

                <div className="mt-auto flex items-center gap-2 text-sm text-primary font-medium">
                  Read More
                  <ArrowUpRight className="w-4 h-4 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                </div>
              </div>
            </a>
          ))}
        </div>
      </div>
    </section>
  )
}
