"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { Code2, Palette, Smartphone, ImageIcon, CheckCircle2 } from "lucide-react"
import { Navbar } from "@/components/navbar"

const services = [
  {
    icon: Palette,
    title: "Web Design",
    description: "Creating visually stunning and user-friendly website designs that capture your brand's essence and engage your audience effectively.",
    features: [
      "Custom UI/UX Design",
      "Responsive Layouts",
      "Wireframing & Prototyping",
      "Brand Identity Integration",
      "User Research & Testing"
    ],
    color: "from-pink-500 to-rose-500"
  },
  {
    icon: Code2,
    title: "Web Development",
    description: "Building fast, scalable, and modern web applications using the latest technologies and best practices for optimal performance.",
    features: [
      "React & Next.js Development",
      "Full-Stack Applications",
      "API Development & Integration",
      "Database Design",
      "Performance Optimization"
    ],
    color: "from-cyan-500 to-blue-500"
  },
  {
    icon: Smartphone,
    title: "Mobile Development",
    badge: "Learning",
    description: "Developing cross-platform mobile applications that provide seamless experiences on both iOS and Android devices.",
    features: [
      "React Native Development",
      "Cross-Platform Apps",
      "Mobile UI/UX Design",
      "App Store Deployment",
      "Push Notifications"
    ],
    color: "from-green-500 to-emerald-500"
  },
  {
    icon: ImageIcon,
    title: "Photoshop",
    badge: "Learning",
    description: "Professional photo editing and graphic design services to enhance your visual content and create compelling imagery.",
    features: [
      "Photo Retouching",
      "Image Manipulation",
      "Banner & Ad Design",
      "Social Media Graphics",
      "Print Design"
    ],
    color: "from-violet-500 to-purple-500"
  }
]

export default function ServicesPage() {
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    setIsVisible(true)
  }, [])

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-background p-4 md:p-8 lg:p-12">
        <div className="mx-auto max-w-7xl">
          {/* Header */}
          <div className={`mb-12 transition-all duration-700 ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-10"}`}>
            <h1
              className="text-4xl md:text-5xl lg:text-6xl font-black tracking-wider mb-4"
              style={{ fontFamily: "Impact, sans-serif", letterSpacing: "0.1em" }}
            >
              <span className="text-primary">Services</span>
              <span className="text-foreground"> Offering</span>
            </h1>
            <p className="text-muted-foreground text-lg max-w-2xl">
              Comprehensive digital solutions to bring your ideas to life. From design to development, I offer a range of services to meet your needs.
            </p>
          </div>

          {/* Services Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {services.map((service, index) => (
              <div
                key={service.title}
                className={`group glass-card rounded-3xl p-6 md:p-8 transition-all duration-700 hover:shadow-xl hover:shadow-primary/10 hover:-translate-y-2 ${
                  isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"
                }`}
                style={{ transitionDelay: `${(index + 1) * 100}ms` }}
              >
                {/* Icon with gradient background */}
                <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${service.color} flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300`}>
                  <service.icon className="w-8 h-8 text-white" />
                </div>

                {/* Title with optional badge */}
                <div className="flex items-center gap-3 mb-4">
                  <h2 className="text-2xl font-bold text-foreground">{service.title}</h2>
                  {service.badge && (
                    <span className="px-3 py-1 text-xs font-medium bg-primary/20 text-primary rounded-full">
                      {service.badge}
                    </span>
                  )}
                </div>

                {/* Description */}
                <p className="text-muted-foreground mb-6 leading-relaxed">
                  {service.description}
                </p>

                {/* Features list */}
                <ul className="space-y-3">
                  {service.features.map((feature) => (
                    <li key={feature} className="flex items-center gap-3 text-sm">
                      <CheckCircle2 className="w-4 h-4 text-primary flex-shrink-0" />
                      <span className="text-muted-foreground">{feature}</span>
                    </li>
                  ))}
                </ul>

                {/* Hover decoration */}
                <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-primary/10 to-transparent rounded-bl-full opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              </div>
            ))}
          </div>

          {/* CTA Section */}
          <div className={`mt-12 glass-card rounded-3xl p-8 md:p-12 text-center transition-all duration-700 delay-500 ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"}`}>
            <h3 className="text-2xl md:text-3xl font-bold text-foreground mb-4">
              Have a project in mind?
            </h3>
            <p className="text-muted-foreground mb-8 max-w-xl mx-auto">
              Let's discuss how I can help bring your vision to life. I'm always excited to work on new and challenging projects.
            </p>
            <Link
              href="/"
              className="inline-flex items-center gap-2 px-8 py-4 bg-primary text-primary-foreground font-semibold rounded-full hover:bg-primary/90 transition-all duration-300 hover:scale-105"
            >
              Let's Work Together
            </Link>
          </div>
        </div>
      </main>
    </>
  )
}
