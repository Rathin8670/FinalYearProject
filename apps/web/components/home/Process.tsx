"use client"
import { motion } from "framer-motion"
import { ArrowUpRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import Image from "next/image"

export function Process() {
  const steps = [
    {
      number: "01",
      title: "Book on WhatsApp in under 1 minute",
      description: "Choose your doctor and time directly from a simple WhatsApp chat."
    },
    {
      number: "02",
      title: "Join your online consultation",
      description: "Tap the secure link and talk to your doctor over video from home."
    },
    {
      number: "03",
      title: "Get prescription & test summary instantly",
      description: "Receive a clear AI-generated summary of medicines and lab reports right after the call."
    }
  ]

  return (
    <section id="process" className="py-24 bg-black text-white px-6">
      <div className="container mx-auto max-w-[1800px]">
        {/* Main Heading */}
        <div className=" mb-20">
          <h2 className="text-5xl md:text-7xl font-bold tracking-tight leading-[1.1]">
            Get medical help in minutes <br />
            <span className="text-gray-600">— not days.</span>
          </h2>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-16 items-start">
          {/* Left Column: Process Steps */}
          <div className="lg:col-span-7 bg-[#111] rounded-3xl border border-white/10 overflow-hidden">
            <div className="flex flex-col">
              {steps.map((step, i) => (
                <motion.div 
                  key={i}
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.2 }}
                  className={`flex items-start gap-6 p-8 md:p-12 hover:bg-white/5 transition-colors ${
                    i !== steps.length - 1 ? 'border-b border-white/10' : ''
                  }`}
                >
                   <span className="text-slate-600 font-medium text-lg pt-1">{step.number}</span>
                   <div className="flex flex-col gap-2">
                     <span className="text-2xl md:text-3xl font-medium">{step.title}</span>
                     {"description" in step && (
                       <p className="text-slate-400 text-lg">{step.description}</p>
                     )}
                   </div>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Right Column: Testimonial & CTA */}
          <div className="lg:col-span-5 flex flex-col h-full py-4 pl-4 lg:pl-12">
             <div className="space-y-8">
               <p className="text-lg md:text-xl leading-relaxed font-medium text-slate-200">
                 "The platform makes online consultations feel as simple as chatting on WhatsApp. Booking, calling, and understanding prescriptions all happen in one place"
               </p>
               
               <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-slate-800 rounded-full overflow-hidden relative">
                    <div className="absolute inset-0 bg-gradient-to-br from-purple-500 to-blue-500" />
                  </div>
                  <div>
                    <div className="font-bold text-white">Final Year Project Team</div>
                    <div className="text-sm text-slate-500">Carepulse Development Group</div>
                  </div>
               </div>
             </div>

             <div className="mt-8">
               <Button 
                 className="bg-[#D1F848] hover:bg-[#bce336] text-black text-lg px-8 py-6 rounded-full font-medium w-full md:w-auto transition-transform hover:scale-105"
               >
                 Book a call <ArrowUpRight className="ml-2 w-5 h-5" />
               </Button>
             </div>
          </div>
        </div>

        {/* Bottom Heading */}
        <div className="mt-32 border-t border-white/10 pt-24">
          <h2 className="text-4xl md:text-6xl text-center md:text-left font-bold leading-tight">
            A seamless telemedicine experience built for patients, doctors, and faster care. <br className="hidden md:block"/>
             <span className="text-slate-400"> — faster, simpler, smarter healthcare.</span>
          </h2>
        </div>
      </div>
    </section>


  )
}
