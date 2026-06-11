"use client"

import { motion } from "framer-motion"
import { ArrowUpRight } from "lucide-react"
import { FloatingPaths } from "@/components/ui/background-paths"

const achievements = [
  {
    number: "01",
    title: "AI-Powered Diagnosis Model",
    description: "Build a virtual general physician that can offer preliminary assessments, recommend tests, and guide patients before meeting a doctor."
  },
  {
    number: "02",
    title: "Advanced Cloud Deployment",
    description: "Deploy the platform using AWS, Kubernetes, Docker, and CI/CD pipelines for high availability, automated scaling, and production-ready reliability."
  },
  {
    number: "03",
    title: "100+ Concurrent Video Consultations",
    description: "The system currently supports ~20 simultaneous doctor–patient calls. Future scaling will increase capacity to over 100 parallel consultations using optimized WebRTC routing and distributed signaling."
  },
  {
    number: "04",
    title: "Scalable Nationwide Telemedicine Network",
    description: "Expand the platform to support clinics, hospitals, NGOs, and government health programs—enabling remote care delivery across urban and rural regions."
  }
]

export function Services() {
  return (
    <section id="services" className="relative py-32 px-6 overflow-hidden bg-[#9D7BFF]">
       {/* Floating Paths Background */}
       <div className="absolute inset-0 z-0 opacity-60 mix-blend-overlay pointer-events-none">
          <FloatingPaths position={1} />
          <FloatingPaths position={-1} />
       </div>
       
       {/* Background Elements to mimic 3D look with CSS */}
       <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
          <div className="absolute -top-[20%] -left-[10%] w-[50vw] h-[50vw] bg-purple-400 rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-blob"></div>
          <div className="absolute top-[20%] right-[10%] w-[40vw] h-[40vw] bg-purple-300 rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-blob animation-delay-2000"></div>
          <div className="absolute -bottom-[10%] left-[20%] w-[40vw] h-[40vw] bg-pink-300 rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-blob animation-delay-4000"></div>
          
          {/* Using a radial gradient overlay for depth */}
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(255,255,255,0.1),transparent_70%)]"></div>
       </div>

      <div className="container mx-auto max-w-[1800px] relative z-10">
        <div className="mb-32 text-center md:text-left">
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="flex flex-col items-center md:items-start"
          >
            <span className="text-[12vw] md:text-[8vw] font-bold text-white tracking-tighter leading-[0.85]">
              Future Potential & 
            </span>
            <span className="text-[14vw] md:text-[11vw] font-bold text-white tracking-tighter leading-[0.85] md:ml-[10%]">
              What Comes Next
            </span>
          </motion.h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {achievements.map((item, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              viewport={{ once: true }}
              className="bg-white p-8 min-h-[320px] flex flex-col justify-between group hover:scale-[1.02] transition-transform duration-300"
            >
               <div className="flex justify-between items-start">
                   <span className="text-slate-400 text-sm font-medium tracking-wide">
                     {item.number}
                   </span>
                   <div className="w-8 h-8 rounded-full bg-black/5 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                        <ArrowUpRight className="w-4 h-4 text-black" />
                   </div>
               </div>
               
               <div className="flex flex-col gap-4">
                   <h3 className="text-xl md:text-2xl font-bold leading-tight text-black tracking-tight" dangerouslySetInnerHTML={{ __html: item.title.replace(/\n/g, "<br/>") }} />
                   
                   {"description" in item && (
                     <p className="text-slate-600 font-medium text-sm md:text-base leading-relaxed">
                       {item.description}
                     </p>
                   )}
               </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
