"use client"

import Link from "next/link"
import Image from "next/image"
import { ArrowDown, ArrowUpRight } from "lucide-react"
import { Button } from "@/components/ui/button"

export function Footer() {
  return (
    <footer className="bg-black text-white pt-24 pb-0 overflow-hidden">

       <div className="container mx-auto max-w-[1800px] px-6">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 mb-20">
                <div className="lg:col-span-3 flex flex-col items-start pr-8">
                    <h2 className="text-3xl font-bold mb-6">CarePulse</h2>
                    <p className="text-slate-400 text-lg leading-relaxed mb-8">
                    CarePulse is a telemedicine web application that connects patients and doctors through secure video consultations, AI-powered medical summaries, and WhatsApp-based appointment booking. Built as a full-stack final year project, it focuses on fast, accessible, and easy-to-understand remote care.
                    </p>
                    <Button className="bg-[#D1F848] hover:bg-[#bce336] text-black rounded-full px-6 py-6 font-bold flex items-center gap-3">
                    View Project Deck <span className="bg-black/10 p-1 rounded-full"><ArrowDown className="w-4 h-4" /></span>
                    </Button>
                </div>

                {/* Features Col 1 */}
                <div className="lg:col-span-2">
                    <h4 className="font-bold text-lg mb-6">Features</h4>
                    <ul className="space-y-4 text-slate-400">
                        <li><span className="hover:text-white transition-colors cursor-default">Remote Doctor Consultation</span></li>
                        <li><span className="hover:text-white transition-colors cursor-default">AI Medical Assistant</span></li>
                        <li><span className="hover:text-white transition-colors cursor-default">WhatsApp Appointment Bot</span></li>
                        <li><span className="hover:text-white transition-colors cursor-default">Patient Dashboard</span></li>
                        <li><span className="hover:text-white transition-colors cursor-default">Doctor Dashboard</span></li>
                        <li><span className="hover:text-white transition-colors cursor-default">Appointment & Reminder System</span></li>
                        <li><span className="hover:text-white transition-colors cursor-default">Basic Electronic Health Records</span></li>
                    </ul>
                </div>

                 {/* Tech Stack Col 2 */}
                 <div className="lg:col-span-3">
                    <div className="hidden lg:block h-[3.25rem]"></div>
                     <h4 className="font-bold text-lg mb-6 lg:hidden">Tech Stack</h4>
                    <ul className="space-y-4 text-slate-400">
                        <li><span className="hover:text-white transition-colors cursor-default">Next.js Frontend</span></li>
                        <li><span className="hover:text-white transition-colors cursor-default">Express.js Backend</span></li>
                        <li><span className="hover:text-white transition-colors cursor-default">WebRTC Video Calls</span></li>
                        <li><span className="hover:text-white transition-colors cursor-default">Socket.io Real-time Signaling</span></li>
                        <li><span className="hover:text-white transition-colors cursor-default">JWT & Social Login</span></li>
                         <li><span className="hover:text-white transition-colors cursor-default">AWS EC2 + Docker</span></li>
                          <li><span className="hover:text-white transition-colors cursor-default">CI/CD Pipeline Integration</span></li>
                    </ul>
                </div>

                {/* Key User Flows */}
                <div className="lg:col-span-2">
                    <h4 className="font-bold text-lg mb-6">Key User Flows</h4>
                    <ul className="space-y-4 text-slate-400">
                        <li><span className="hover:text-white transition-colors cursor-default">Book Appointment on WhatsApp</span></li>
                        <li><span className="hover:text-white transition-colors cursor-default">Join a Video Consultation</span></li>
                        <li><span className="hover:text-white transition-colors cursor-default">Get AI Prescription Summary</span></li>
                        <li><span className="hover:text-white transition-colors cursor-default">View Lab Report Explanation</span></li>
                        <li><Link href="#" className="hover:text-white transition-colors underline decoration-slate-600 underline-offset-4">See All Flows</Link></li>
                    </ul>
                </div>

                {/* Contact */}
                <div className="lg:col-span-2">
                    <h4 className="font-bold text-lg mb-6">Contact</h4>
                    <ul className="space-y-4 text-slate-400">
                        <li><Link href="mailto:carepulse.team@gmail.com" className="hover:text-white transition-colors">carepulse.team@gmail.com</Link></li>
                        <li><Link href="#" className="hover:text-white transition-colors">GitHub Repository</Link></li>
                        <li><Link href="#" className="hover:text-white transition-colors">LinkedIn Profile</Link></li>
                        <li><Link href="#" className="hover:text-white transition-colors">College Department</Link></li>
                    </ul>
                </div>
            </div>

            {/* Middle Section: Socials & Call CTA */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-20 gap-10">
                <div className="flex gap-6 text-slate-400 text-lg">
                    {/* Social links removed or updated if needed, keeping placeholder for now as layout requests */}
                </div>

                <div className="flex flex-col items-end text-right">
                     <p className="text-white font-medium mb-2">See CarePulse in action</p>
                     <div className="flex items-center gap-4">
                         <span className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-white to-slate-400 bg-clip-text text-transparent">Try CarePulse</span>
                         <Button size="icon" className="rounded-full w-12 h-12 bg-[#D1F848] text-black hover:bg-[#bce336]">
                            <ArrowUpRight className="w-6 h-6" />
                         </Button>
                     </div>
                </div>
            </div>

            {/* Bottom Section: Copyright & Flags */}
            <div className="flex flex-col md:flex-row justify-between items-end border-t border-white/10 pt-8 pb-32 text-slate-500 text-sm">
                <p>CarePulse © 2025</p>
                <div className="flex flex-col items-end gap-4 mt-6 md:mt-0">
                    <p>Designed & Developed for Final Year Project 2025</p>
                    {/* Team Avatars */}
                    <div className="flex -space-x-3">
                         {["/boy 1.png", "/boy 2.png", "/boy 3.png", "/boy4.png", "/boy 5.png"].map((src, i) => (
                             <div key={i} className="w-8 h-8 rounded-full border-2 border-black overflow-hidden relative">
                                <Image
                                  src={src}
                                  alt={`Team member ${i + 1}`}
                                  fill
                                  className="object-cover"
                                />
                             </div>
                         ))}
                    </div>
                </div>
            </div>
       </div>

       {/* Giant Text */}
       <div className="-mt-40 w-full overflow-hidden leading-none select-none pointer-events-none">
           <h1 className="text-[25vw] font-bold text-center text-white tracking-tighter opacity-100 translate-y-[20%]">
             CarePulse
           </h1>
       </div>
    </footer>
  )
}
