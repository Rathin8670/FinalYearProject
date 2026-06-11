"use client"

import { useEffect, useRef } from "react"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { ArrowDownRight } from "lucide-react"
import gsap from "gsap"
import { ScrollTrigger } from "gsap/ScrollTrigger"

gsap.registerPlugin(ScrollTrigger)

export function Hero() {
  const containerRef = useRef<HTMLDivElement>(null)
  const textRef = useRef<HTMLHeadingElement>(null)
  const videoRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const ctx = gsap.context(() => {
      const tl = gsap.timeline()

      tl.from(".hero-line", {
        y: 100,
        opacity: 0,
        duration: 1,
        stagger: 0.15,
        ease: "power4.out",
        delay: 0.5,
      })
      .from(".hero-video", {
        scale: 0.8,
        opacity: 0,
        duration: 1.5,
        ease: "power4.out",
      }, "-=0.5")

      gsap.to(".hero-video", {
        scrollTrigger: {
          trigger: containerRef.current,
          start: "top top",
          end: "bottom top",
          scrub: true,
        },
        y: 200,
        scale: 1.1,
      })
    }, containerRef)

    return () => ctx.revert()
  }, [])

  return (
    <section ref={containerRef} className="relative min-h-screen flex flex-col justify-center pt-32 pb-20 px-6 overflow-hidden bg-white">
      {/* Background Gradient */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary/5 rounded-full blur-[128px]" />
        <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-accent/10 rounded-full blur-[128px]" />
      </div>

      <div className="container mx-auto max-w-[1800px]">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-16 items-end">
          {/* Left Column: Content */}
          <div className="lg:col-span-8">
            <div className="flex items-center gap-2 mb-8 hero-line">
              <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
              <span className="text-sm font-medium text-slate-900 bg-slate-100 px-3 py-1 rounded-full">Available for 24/7 Remote Doctor Consultations</span>
            </div>
            
            <h1 ref={textRef} className="text-[10vw] md:text-[6vw] leading-[0.95] font-bold tracking-tighter mb-10 text-black">
              <div className="overflow-hidden"><span className="hero-line block">AI-powered Telemedicine Platform</span></div>
              <div className="overflow-hidden"><span className="hero-line block"></span></div>
              <div className="overflow-hidden">
                <span className="hero-line block">
                  for <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-purple-600">Remote Doctor Consultations.</span>
                </span>
              </div>
            </h1>

            <div className="flex flex-wrap gap-6 hero-line">
              <Button variant="default" size="lg" className="h-14 px-8 rounded-full text-lg">
                Book a call
              </Button>
              <Button variant="outline" size="lg" className="h-14 px-8 rounded-full text-lg border-slate-200 hover:bg-slate-50">
                View Doctors list
              </Button>
            </div>
          </div>

          {/* Right Column: Description & Reviews */}
          <div className="lg:col-span-4 lg:pb-2 hero-line">
            <p className="text-xl text-slate-600 leading-relaxed mb-8">
              A complete telemedicine web application that allows patients to consult doctors remotely through secure video calls, real-time chat, and AI-powered assistance
            </p>
            
            <div className="flex items-center gap-4">
               <div className="flex -space-x-4">
                  {["/customer 1.jpg", "/customer 2.jpg", "/customer 3.jpg"].map((src, i) => (
                    <div key={i} className="w-12 h-12 rounded-full border-4 border-white overflow-hidden relative">
                       <Image
                         src={src}
                         alt={`Customer ${i + 1}`}
                         fill
                         className="object-cover"
                       />
                    </div>
                  ))}
               </div>
               <div className="text-left">
                 <div className="flex text-red-500 text-lg">★★★★★</div>
                 <p className="text-xs text-slate-500 font-bold uppercase tracking-wide">13 Reviews</p>
               </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
