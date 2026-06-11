"use client"
import { motion } from "framer-motion"

export function Showreel() {
  return (
    <section className="py-12 md:py-24 px-6 bg-white">
      <div className="container mx-auto max-w-[1800px]">
        {/* Video Thumbnail / Loop */}
        <motion.div 
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="relative w-full aspect-video rounded-2xl md:rounded-[2rem] overflow-hidden shadow-2xl shadow-slate-200"
        >
           <video 
             src="https://wavespaceagency.s3.us-east-2.amazonaws.com/Wavespace+No+sound+video.mp4"
             autoPlay
             loop
             muted
             playsInline
             className="w-full h-full object-cover"
           />
        </motion.div>
      </div>
    </section>
  )
}


