"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { Github, Linkedin, X } from "lucide-react"
import { Navbar } from "@/components/navbar"

export default function AboutPage() {
  const [isVisible, setIsVisible] = useState(false)
  const [experienceModal, setExperienceModal] = useState(false)
  const [educationModal, setEducationModal] = useState(false)

  useEffect(() => {
    setIsVisible(true)
  }, [])

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-background p-4 md:p-8 lg:p-12">
        <div className="mx-auto max-w-7xl">
          <div className="flex flex-col gap-4 md:gap-6">
            {/* Row 1: Photo + Title + Bio side by side */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6">
              {/* Photo Card */}
              <div
                className={`glass-card rounded-3xl overflow-hidden transition-all duration-700 delay-100 ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"}`}
              >
                <img
                  src="me2.jpg"
                  alt="Shukhrat Mamadaliev"
                  className="w-full h-full object-cover min-h-[300px] lg:min-h-[350px]"
                />
              </div>

              {/* Right side: Title + Bio Card */}
              <div className="lg:col-span-2 flex flex-col gap-4 md:gap-6">
                {/* Header - SELF-SUMMARY */}
                <h1
                  className={`text-4xl md:text-5xl lg:text-6xl font-black tracking-wider transition-all duration-700 ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-10"}`}
                  style={{ fontFamily: "Impact, sans-serif", letterSpacing: "0.1em" }}
                >
                  <span className="text-foreground">SELF-</span>
                  <span className="text-primary">SUMMARY</span>
                </h1>

                {/* Bio Card */}
                <div
                  className={`glass-card rounded-3xl p-6 md:p-8 flex-1 transition-all duration-700 delay-200 ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"}`}
                >
                  {/* Unity-like logo */}
                  <div className="mb-4">
                    <svg
                      width="48"
                      height="48"
                      viewBox="0 0 48 48"
                      fill="none"
                      className="text-muted-foreground"
                    >
                      <path
                        d="M24 4L4 14v20l20 10 20-10V14L24 4zm0 4.5l14 7-14 7-14-7 14-7zM8 18.5l14 7v13l-14-7v-13zm32 0v13l-14 7v-13l14-7z"
                        fill="currentColor"
                        fillOpacity="0.5"
                      />
                    </svg>
                  </div>

                  <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-4">
                    Shukhrat Mamadaliev
                  </h2>

                  <p className="text-muted-foreground leading-relaxed text-sm md:text-base">
                    Web Developer with hands-on experience building responsive, clean, and user-friendly web pages. Enjoys working in collaborative teams, communicates clearly, and is always open to feedback. Naturally curious and consistently learning new tools, frameworks, and best practices to improve code quality, performance, and overall project outcomes. Passionate about turning ideas into smooth, functional, and visually appealing digital experiences. Always motivated to take on new challenges and contribute to meaningful projects.
                  </p>
                </div>
              </div>
            </div>

            {/* Row 2: Experience + Education */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
              {/* Experience Card - Clickable */}
              <button
                type="button"
                onClick={() => setExperienceModal(true)}
                className={`glass-card rounded-3xl p-6 md:p-8 text-left transition-all duration-700 delay-300 hover:shadow-xl hover:shadow-primary/5 hover:-translate-y-1 cursor-pointer ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"}`}
              >
                <h3 className="text-2xl font-bold text-foreground mb-6">Experience</h3>

                <div className="space-y-6">
                  <div>
                    <p className="text-sm text-primary mb-1">2019 - present</p>
                    <h4 className="text-lg font-semibold text-foreground">Freelancer</h4>
                    <p className="text-muted-foreground text-sm">Web Development and Design</p>
                  </div>

                  <div>
                    <p className="text-sm text-primary mb-1">9 Months Contract</p>
                    <h4 className="text-lg font-semibold text-foreground">Synkd</h4>
                    <p className="text-muted-foreground text-sm">Front-End Developer</p>
                  </div>

                  <div>
                    <p className="text-sm text-primary mb-1">2021 - 2022</p>
                    <h4 className="text-lg font-semibold text-foreground">Intern</h4>
                    <p className="text-muted-foreground text-sm">Ulster University</p>
                  </div>
                </div>

                <p className="text-primary text-sm mt-6 hover:underline">Show more</p>
              </button>

              {/* Education Card - Clickable */}
              <button
                type="button"
                onClick={() => setEducationModal(true)}
                className={`glass-card rounded-3xl p-6 md:p-8 text-left transition-all duration-700 delay-400 hover:shadow-xl hover:shadow-primary/5 hover:-translate-y-1 cursor-pointer ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"}`}
              >
                <h3 className="text-2xl font-bold text-foreground mb-6">Education</h3>

                <div className="space-y-6">
                  <div>
                    <p className="text-sm text-primary mb-1">2019 - 2023</p>
                    <h4 className="text-lg font-semibold text-foreground">Software Developer</h4>
                    <p className="text-muted-foreground text-sm">University of Ulster</p>
                  </div>

                  <div>
                    <p className="text-sm text-primary mb-1">2013 - 2016</p>
                    <h4 className="text-lg font-semibold text-foreground">Information Technology</h4>
                    <p className="text-muted-foreground text-sm">College</p>
                  </div>
                </div>

                <p className="text-primary text-sm mt-6 hover:underline">Show more</p>
              </button>
            </div>

            {/* Row 3: Profiles + Contact + Credentials */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 md:gap-6">
              {/* Profiles Card */}
              <div
                className={`glass-card rounded-3xl p-6 transition-all duration-700 delay-500 ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"}`}
              >
                <div className="flex flex-col h-full justify-between min-h-[180px]">
                  <div className="flex items-center justify-center gap-4 flex-1">
                    <a
                      href="https://www.linkedin.com/in/shukhrat-mamadaliev-b5423019a/"
                      target="_blank"
                      className="w-14 h-14 rounded-full bg-secondary flex items-center justify-center transition-all duration-300 hover:bg-primary/20 hover:scale-110"
                      aria-label="LinkedIn"
                    >
                      <Linkedin className="w-6 h-6 text-muted-foreground" />
                    </a>
                    <a
                      href="https://github.com/Shukhratmamadaliev9797"
                      target="_blank"
                      className="w-14 h-14 rounded-full bg-secondary flex items-center justify-center transition-all duration-300 hover:bg-primary/20 hover:scale-110"
                      aria-label="GitHub"
                    >
                      <Github className="w-6 h-6 text-muted-foreground" />
                    </a>
                  </div>

                  <div className="flex items-end justify-between">
                    <div>
                      <p className="text-xs uppercase tracking-wider text-muted-foreground mb-1">Stay With Me</p>
                      <h3 className="text-lg font-semibold text-foreground">Profiles</h3>
                    </div>
                    <span className="text-2xl font-bold text-primary/20 font-mono">SH</span>
                  </div>
                </div>
              </div>

              {/* Contact Card */}
              <Link
                href="/contact"
                className={`md:col-span-2 glass-card rounded-3xl p-6 md:p-8 relative overflow-hidden transition-all duration-700 delay-600 hover:shadow-xl hover:shadow-primary/5 hover:-translate-y-1 cursor-pointer group ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"}`}
              >
                {/* Background decoration */}
                <div className="absolute top-0 right-0 w-48 h-48 opacity-10 group-hover:opacity-20 transition-opacity">
                  <svg viewBox="0 0 100 100" className="w-full h-full text-primary">
                    <path
                      d="M50 10 L90 30 L90 70 L50 90 L10 70 L10 30 Z"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                    />
                    <path
                      d="M50 20 L80 35 L80 65 L50 80 L20 65 L20 35 Z"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1"
                    />
                  </svg>
                </div>

                <div className="relative z-10 flex flex-col h-full justify-end min-h-[150px]">
                  <h2 className="text-3xl md:text-4xl font-bold">
                    <span className="text-foreground">{"Let's"}</span>
                    <br />
                    <span className="text-foreground">work </span>
                    <span className="text-primary group-hover:underline">together</span>
                  </h2>
                </div>

                <span className="absolute bottom-6 right-6 text-2xl font-bold text-primary/20 font-mono">SH</span>
              </Link>

              {/* Credentials Card */}
              <Link 
              href='/credentials'>
              <div
                className={`glass-card rounded-3xl p-6 transition-all duration-700 delay-700 ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"}`}
              >
                <div className="flex flex-col h-full justify-between min-h-[180px]">
                  {/* Signature */}
                  <div className="flex-1 flex items-center justify-center">
                    <svg
                      viewBox="0 0 200 80"
                      className="w-32 h-16 text-muted-foreground"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M20 60 Q30 20 50 40 T80 30 Q90 25 100 35 T130 30 Q150 25 160 40 T180 35" />
                      <path d="M60 55 Q70 50 80 55" />
                    </svg>
                  </div>

                  <div className="flex items-end justify-between">
                    <div>
                      <p className="text-xs uppercase tracking-wider text-muted-foreground mb-1">More About Me</p>
                      <h3 className="text-lg font-semibold text-foreground">Credentials</h3>
                    </div>
                    <span className="text-2xl font-bold text-primary/20 font-mono">SH</span>
                  </div>
                </div>
              </div>
              </Link>
              
            </div>
          </div>
        </div>
      </main>

      {/* Experience Modal */}
      {experienceModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div 
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => setExperienceModal(false)}
            onKeyDown={(e) => e.key === 'Escape' && setExperienceModal(false)}
          />
          <div className="relative glass-card rounded-3xl p-6 md:p-8 max-w-2xl w-full max-h-[80vh] overflow-y-auto animate-fade-in-scale">
            <button
              type="button"
              onClick={() => setExperienceModal(false)}
              className="absolute top-4 right-4 w-10 h-10 rounded-full bg-secondary flex items-center justify-center hover:bg-primary/20 transition-colors"
              aria-label="Close modal"
            >
              <X className="w-5 h-5 text-muted-foreground" />
            </button>

            <h3 className="text-3xl font-bold text-foreground mb-8">Experience</h3>

            <div className="space-y-8">
              <div className="border-l-2 border-primary pl-6">
                <p className="text-sm text-primary mb-1">2019 - present</p>
                <h4 className="text-xl font-semibold text-foreground mb-2">Freelancer</h4>
                <p className="text-muted-foreground text-sm mb-3">Web Development and Design</p>
                <p className="text-muted-foreground text-sm leading-relaxed">
                  Working as an independent web developer, creating custom websites and web applications for clients worldwide. Specializing in responsive design, modern JavaScript frameworks, and user-centered development. Successfully delivered over 50 projects ranging from small business websites to complex web applications.
                </p>
              </div>

              <div className="border-l-2 border-primary pl-6">
                <p className="text-sm text-primary mb-1">6 Months Contract</p>
                <h4 className="text-xl font-semibold text-foreground mb-2">Synkd</h4>
                <p className="text-muted-foreground text-sm mb-3">Front-End Developer</p>
                <p className="text-muted-foreground text-sm leading-relaxed">
                  Worked on building and maintaining the company{"'"}s main web platform. Collaborated with designers and backend developers to implement new features. Improved application performance and user experience through code optimization and modern development practices.
                </p>
              </div>

              <div className="border-l-2 border-primary pl-6">
                <p className="text-sm text-muted-foreground mb-1">2017 - 2019</p>
                <h4 className="text-xl font-semibold text-foreground mb-2">INTERN</h4>
                <p className="text-muted-foreground text-sm mb-3">Ulster University</p>
                <p className="text-muted-foreground text-sm leading-relaxed">
                  Developed a full project in collaboration with a supervising lecturer, worked closely with senior developers on testing and code reviews, and assisted in designing and implementing new frontend features using modern web technologies.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Education Modal */}
      {educationModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div 
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => setEducationModal(false)}
            onKeyDown={(e) => e.key === 'Escape' && setEducationModal(false)}
          />
          <div className="relative glass-card rounded-3xl p-6 md:p-8 max-w-2xl w-full max-h-[80vh] overflow-y-auto animate-fade-in-scale">
            <button
              type="button"
              onClick={() => setEducationModal(false)}
              className="absolute top-4 right-4 w-10 h-10 rounded-full bg-secondary flex items-center justify-center hover:bg-primary/20 transition-colors"
              aria-label="Close modal"
            >
              <X className="w-5 h-5 text-muted-foreground" />
            </button>

            <h3 className="text-3xl font-bold text-foreground mb-8">Education</h3>

            <div className="space-y-8">
              <div className="border-l-2 border-primary pl-6">
                <p className="text-sm text-primary mb-1">2019 - 2023</p>
                <h4 className="text-xl font-semibold text-foreground mb-2">Software Developer</h4>
                <p className="text-muted-foreground text-sm mb-3">University of Ulster</p>
                <p className="text-muted-foreground text-sm leading-relaxed">
                  Completed a comprehensive degree in Software Development, covering advanced programming concepts, software engineering principles, database management, and web technologies. Graduated with honors and completed several industry-relevant projects.
                </p>
                <div className="mt-4">
                  <p className="text-sm font-medium text-foreground mb-2">Key Courses:</p>
                  <ul className="text-muted-foreground text-sm space-y-1 list-disc list-inside">
                    <li>Advanced Web Development</li>
                    <li>Database Systems</li>
                    <li>Software Engineering</li>
                    <li>Mobile Application Development</li>
                  </ul>
                </div>
              </div>

              <div className="border-l-2 border-secondary pl-6">
                <p className="text-sm text-primary mb-1">2013 - 2016</p>
                <h4 className="text-xl font-semibold text-foreground mb-2">Information Technology</h4>
                <p className="text-muted-foreground text-sm mb-3">College</p>
                <p className="text-muted-foreground text-sm leading-relaxed">
                  Studied foundational IT concepts including computer networks, hardware, operating systems, and basic programming. This education laid the groundwork for pursuing a career in software development.
                </p>
                <div className="mt-4">
                  <p className="text-sm font-medium text-foreground mb-2">Skills Acquired:</p>
                  <ul className="text-muted-foreground text-sm space-y-1 list-disc list-inside">
                    <li>Computer Fundamentals</li>
                    <li>Network Administration</li>
                    <li>Basic Programming</li>
                    <li>Technical Support</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
