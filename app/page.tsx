"use client"

import { useState } from "react"
import { HeroCard } from "@/components/hero-card"
import { CredentialsCard } from "@/components/credentials-card"
import { ProjectsCard } from "@/components/projects-card"
import { ResumeCard } from "@/components/resume-card"
import { ServicesCard } from "@/components/services-card"
import { ProfilesCard } from "@/components/profiles-card"
import { StatsCard } from "@/components/stats-card"
import { ContactCard } from "@/components/contact-card"
import { Marquee } from "@/components/marquee"
import { Preloader } from "@/components/preloader"

export default function Home() {
  const [contentReady, setContentReady] = useState(false)

  return (
    <>
      <Preloader onComplete={() => setContentReady(true)} />
      <main className="min-h-screen bg-background p-4 md:p-8 lg:p-12">
        <div className="mx-auto max-w-7xl flex flex-col gap-4 md:gap-6">
          {/* Row 1: Hero + (Marquee + Credentials + Projects) */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
            {/* Hero Section */}
            <div className="opacity-0 animate-fade-in-up">
              <HeroCard />
            </div>

            {/* Right side: Marquee on top, Credentials + Projects below */}
            <div className="flex flex-col gap-4 md:gap-6">
              {/* Marquee Section */}
              <div className="opacity-0 animate-fade-in-up animation-delay-100">
                <Marquee />
              </div>

              {/* Credentials and Projects row */}
              <div className="grid grid-cols-2 gap-4 md:gap-6 flex-1">
                {/* Credentials */}
                <div className="opacity-0 animate-fade-in-scale animation-delay-200">
                  <CredentialsCard />
                </div>

                {/* Projects */}
                <div className="opacity-0 animate-slide-in-right animation-delay-300">
                  <ProjectsCard />
                </div>
              </div>
            </div>
          </div>

          {/* Row 2: Resume + Services + Profiles */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 md:gap-6">
            {/* Resume Download */}
            <div className="opacity-0 animate-fade-in-up animation-delay-400">
              <ResumeCard />
            </div>

            {/* Services */}
            <div className="md:col-span-2 opacity-0 animate-fade-in-scale animation-delay-500">
              <ServicesCard />
            </div>

            {/* Profiles */}
            <div className="opacity-0 animate-slide-in-right animation-delay-600">
              <ProfilesCard />
            </div>
          </div>

          {/* Row 3: Stats + Contact */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
            {/* Stats */}
            <div className="opacity-0 animate-fade-in-up animation-delay-700">
              <StatsCard />
            </div>

            {/* Contact CTA */}
            <div className="opacity-0 animate-fade-in-scale animation-delay-800">
              <ContactCard />
            </div>
          </div>
        </div>
      </main>
    </>
  )
}
