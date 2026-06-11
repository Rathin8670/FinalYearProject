"use client"
import { motion, useScroll, useTransform } from "framer-motion"
import { useRef } from "react"
import { ArrowUpRight } from "lucide-react"

export function Impact() {
  const containerRef = useRef(null)
  
 const brands = [
  "Secure Video Consultations",
  "Real-time Chat",
  "AI Prescription Summary",
  "AI Test Report Insights",
  "WhatsApp Appointment Bot",
  "Doctor Dashboard",
  "Patient Dashboard",
  "Teleconsultation",
  "E-Prescription",
  "Electronic Health Records (EHR)",
  "Symptom Analysis",
  "AI Diagnosis Support",
  "Secure Video Consultations",
  "Real-time Medical Chat",
  "AI Prescription Summary",
  "Lab Report Interpretation",
  "Digital Triage System",
  "Remote Patient Monitoring",
];

  
  // Duplicate for infinite loop
  const duplicatedBrands = [...brands, ...brands, ...brands, ...brands]

  return (
    <section id="impact" className="py-20 md:py-32 bg-white overflow-hidden">
      {/* Infinite Marquee */}
      <div className="w-full mb-32 overflow-hidden flex relative after:content-[''] after:dark:from-black after:bg-gradient-to-r after:from-white after:to-transparent after:absolute after:z-10 after:top-0 after:left-0 after:w-32 after:h-full relative before:content-[''] before:dark:from-black before:bg-gradient-to-l before:from-white before:to-transparent before:absolute before:z-10 before:top-0 before:right-0 before:w-32 before:h-full">
         <motion.div 
           className="flex gap-16 md:gap-24 items-center whitespace-nowrap"
           animate={{ x: "-50%" }}
           transition={{ 
             duration: 60,
             repeat: Infinity,
             ease: "linear",
             repeatType: "loop"
           }}
         >
           {duplicatedBrands.map((brand, i) => (
             <span key={i} className="text-xl md:text-2xl font-bold text-slate-300 hover:text-slate-900 transition-colors cursor-default">
               {brand}
             </span>
           ))}
         </motion.div>
      </div>

      <div className="container mx-auto max-w-[1800px] px-6">
        {/* Heading */}
        <div className="mb-32">
          <h2 className="text-4xl md:text-6xl font-bold leading-[1.1] tracking-tight text-black">
           End-to-end Telemedicine Platform for Remote Doctor Consultations. <span className="text-slate-400">we improve access to healthcare, not just build video calls.</span>
          </h2>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Card 1 */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="p-10 rounded-[2rem] bg-slate-50 hover:bg-slate-100 transition-colors group"
          >
            <div className="text-sm font-medium text-slate-500 mb-20 pointer-events-none">/01</div>
            <div>
              <h3 className="text-6xl md:text-7xl font-bold text-black mb-4 tracking-tighter">99%</h3>
              <p className="text-slate-600 font-medium">patient data handled securely<br/>under encrypted communication.</p>
            </div>
          </motion.div>

          {/* Card 2 */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="p-10 rounded-[2rem] bg-slate-50 hover:bg-slate-100 transition-colors group"
          >
            <div className="text-sm font-medium text-slate-500 mb-20 pointer-events-none">/02</div>
            <div>
              <h3 className="text-6xl md:text-7xl font-bold text-black mb-4 tracking-tighter">&lt; 200ms</h3>
              <p className="text-slate-600 font-medium">average latency in video & chat<br/>through WebRTC + Socket.io.</p>
            </div>
          </motion.div>

          {/* Card 3 */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="p-10 rounded-[2rem] bg-slate-50 hover:bg-slate-100 transition-colors group"
          >
            <div className="text-sm font-medium text-slate-500 mb-20 pointer-events-none">/03</div>
            <div>
              <h3 className="text-6xl md:text-7xl font-bold text-black mb-4 tracking-tighter">2025</h3>
              <p className="text-slate-600 font-medium">Developed as a full-stack<br/>Telemedicine platform for FYP.</p>
            </div>
          </motion.div>

          {/* Card 4 */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.3 }}
            className="p-10 rounded-[2rem] bg-slate-50 hover:bg-slate-100 transition-colors group"
          >
            <div className="text-sm font-medium text-slate-500 mb-20 pointer-events-none">/04</div>
            <div>
              <h3 className="text-6xl md:text-7xl font-bold text-black mb-4 tracking-tighter">10,000+</h3>
              <p className="text-slate-600 font-medium">simulated user sessions tested<br/>during stress & load testing.</p>
            </div>
          </motion.div>

          {/* Card 5 - Wide */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.4 }}
            className="md:col-span-2 p-10 rounded-[2rem] bg-slate-50 hover:bg-slate-100 transition-colors group relative overflow-hidden"
          >
             <div className="absolute top-0 right-0 p-10 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
               <ArrowUpRight className="w-10 h-10 text-slate-300" />
             </div>
            <div className="text-sm font-medium text-slate-500 mb-20 pointer-events-none">/05</div>
            <div>
              <h3 className="text-5xl md:text-6xl font-bold text-black mb-4 tracking-tighter">12+ integrated modules</h3>
              <p className="text-slate-600 font-medium text-lg max-w-lg">AI diagnosis, chatbot, EHR, teleconsultation, WhatsApp automation, appointment system, and more.</p>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  )
}
