"use client"

import { useEffect, useState } from "react"
import { Github, Instagram, Facebook, Linkedin } from "lucide-react"
import { Navbar } from "@/components/navbar"

const frontEndSkills = [
  { img: 'html.png' },
  { img: "css.png" },
  { img: "js.png" },
  { img: "bootstrap.png" },
  { img: "react.png"},
  { img: "redux.png"},
  { img: "sass.png"},
  { img: "tailwind.png" },
  {img: 'nextjs.png'},
  {img: 'typescript.png'}
]

const backEndSkills = [
  { img: "node.png"},
  { img: "expressjs.png" },
  { img: "mongo.png" },
  { img: "socket.png" },
]

const otherSkills = [
  { img: 'aws.png'},
  { img: "stripe.png" },
  { img: "cloudinary.png" },
]

const socialLinks = [
  { icon: Github, href: "#", label: "GitHub" },
  { icon: Instagram, href: "#", label: "Instagram" },
  { icon: Facebook, href: "#", label: "Facebook" },
  { icon: Linkedin, href: "#", label: "LinkedIn" },
]

function SkillIcon({ skill }: { skill: { name: string; color: string; label: string } }) {
  return (
    <div 
      className="glass-card rounded-2xl p-4 md:p-6 flex items-center justify-center aspect-square transition-all duration-300 hover:scale-105 hover:shadow-lg group cursor-pointer"
      title={skill.name}
    >
      <div 
        className="text-2xl md:text-3xl font-bold transition-transform duration-300 group-hover:scale-110"
        style={{ color: skill.color }}
      >
        {skill.label}
      </div>
    </div>
  )
}

export default function CredentialsPage() {
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    setIsVisible(true)
  }, [])

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-background p-4 md:p-8 lg:p-12">
        <div className="mx-auto max-w-7xl">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8">
            {/* Left side: Profile Card */}
            <div
              className={`glass-card rounded-3xl p-6 flex flex-col items-center transition-all duration-700 ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"}`}
            >
              {/* Profile Photo */}
              <div className="w-full aspect-[4/5] rounded-2xl overflow-hidden mb-6">
                <img
                  src="me.jpg"
                  alt="Shukhrat Mamadaliev"
                  className="w-full h-full object-cover"
                />
              </div>

              {/* Name & Username */}
              <h2 className="text-xl font-bold text-foreground mb-1">Shukhrat Mamadaliev</h2>
              <p className="text-muted-foreground text-sm mb-6">@shukhratmamadaliev</p>

              {/* Social Icons */}
              <div className="flex items-center gap-3 mb-6">
                {socialLinks.map((social) => (
                  <a
                    key={social.label}
                    href={social.href}
                    className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center transition-all duration-300 hover:bg-primary/20 hover:scale-110"
                    aria-label={social.label}
                  >
                    <social.icon className="w-5 h-5 text-muted-foreground hover:text-foreground transition-colors" />
                  </a>
                ))}
              </div>

              {/* Contact Button */}
              <button
                type="button"
                className="w-full py-3 rounded-xl bg-secondary text-foreground font-medium transition-all duration-300 hover:bg-primary hover:text-primary-foreground"
              >
                Contact Me
              </button>
            </div>

            {/* Right side: Skills */}
            <div className="lg:col-span-2 flex flex-col gap-6">
              {/* Skills Header */}
              <h1
                className={`text-4xl md:text-5xl font-black tracking-wider transition-all duration-700 ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-10"}`}
                style={{ fontFamily: "Impact, sans-serif", letterSpacing: "0.1em" }}
              >
                <span className="text-foreground">SKILLS</span>
              </h1>

              {/* Front-End Technologies */}
              <div
                className={`transition-all duration-700 delay-100 ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"}`}
              >
                <h3 className="text-lg font-semibold text-foreground mb-4">Front-End Technologies</h3>
                <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-3">
                  {frontEndSkills.map((skill) => (
                   <div className={`p-10 transition-all duration-500 hover:shadow-2xl hover:shadow-primary/10 cursor-pointer hover:-translate-y-1 glass-card rounded-3xl overflow-hidden transition-all duration-700 delay-100 ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"}`}>
                          <img className="h-20 w-20 object-cover" src={`${skill.img}`} alt="" />
                    </div>
                  ))} 
                </div>
              </div>

              {/* Back-End Technologies */}
              <div
                className={`transition-all duration-700 delay-200 ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"}`}
              >
                <h3 className="text-lg font-semibold text-foreground mb-4">Back-End Technologies</h3>
                <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-3">
                  {backEndSkills.map((skill) => (
                    <div className={`p-10 transition-all duration-500 hover:shadow-2xl hover:shadow-primary/10 cursor-pointer hover:-translate-y-1 glass-card rounded-3xl overflow-hidden transition-all duration-700 delay-100 ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"}`}>
                          <img className="h-20 w-20 object-cover" src={`${skill.img}`} alt="" />
                    </div>
                  ))}
                </div>
              </div>

              {/* Others */}
              <div
                className={`transition-all duration-700 delay-300 ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"}`}
              >
                <h3 className="text-lg font-semibold text-foreground mb-4">Others</h3>
                <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-3">
                  {otherSkills.map((skill) => (
                    <div className={`p-10 transition-all duration-500 hover:shadow-2xl hover:shadow-primary/10 cursor-pointer hover:-translate-y-1 glass-card rounded-3xl overflow-hidden transition-all duration-700 delay-100 ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"}`}>
                          <img className="h-20 w-20 object-cover" src={`${skill.img}`} alt="" />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </>
  )
}
