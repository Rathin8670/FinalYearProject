"use client"

import Image from "next/image"
import { motion } from "framer-motion"
import { ArrowUpRight } from "lucide-react"
import { Button } from "@/components/ui/button"

const projects = [
  {
    title: "Remote Doctor Consultation",
    description:
      "Connect with a doctor from anywhere through a secure video call. No travel, no waiting rooms—just quick, comfortable medical help whenever you need it.",
    services: [
      "One-on-one video consultation",
      "Instant medical guidance",
      "Follow-up consultations from home",
      "Reduced waiting times",
      "Accessible healthcare for all"
    ],
    buttonText: "Start Consultation",
    image:
      "/remote doc consultation.png",
    backgroundColor: "#ffffff",
    textColor: "#000000",
    buttonColor: "bg-black text-white hover:bg-black/90"
  },

  {
    title: "AI Medical Assistant",
    description:
      "Your personal AI assistant that explains prescriptions and test results in simple language. No confusion—just clear, easy-to-understand medical summaries.",
    services: [
      "Prescription summary",
      "Test report explanation",
      "Medicine usage guidance",
      "Easy-to-understand health insights",
      "Supports patient decision-making"
    ],
    buttonText: "Try AI Assistant",
    image:
      "/ai medical assistant.png",
    backgroundColor: "#F5F7FF",
    textColor: "#000000",
    buttonColor: "bg-black text-white hover:bg-black/90",
    imageClassName: "h-[500px] object-cover object-top"
  },

  {
    title: "WhatsApp Appointment Bot",
    description:
      "Book doctor appointments instantly through WhatsApp—no apps, no forms. Patients receive reminders and never miss a consultation again.",
    services: [
      "Instant appointment booking",
      "No app downloads needed",
      "WhatsApp reminders",
      "Easy rescheduling",
      "Improved patient convenience"
    ],
    buttonText: "Book on WhatsApp",
    image:
      "/whatsapp bot.png",
    backgroundColor: "#E8FFE2",
    textColor: "#000000",
    buttonColor: "bg-black text-white hover:bg-black/90"
  }
];

export function Work() {
  return (
    <section id="work" className="bg-white">
      <div className="flex flex-col">
        {projects.map((project, index) => (
          <div 
            key={index} 
            className="sticky top-0 py-20 md:py-32 px-6"
            style={{ backgroundColor: project.backgroundColor, color: project.textColor }}
          >
            <div className="container mx-auto max-w-[1800px]">
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
                
                {/* Left Content: Title, Button, Desc */}
                <div className="lg:col-span-5 flex flex-col gap-10 pl-10 mt-6">
                  <h2 className="text-5xl md:text-7xl font-bold tracking-tight">
                    {project.title}
                  </h2>
                  
                  <div className="flex flex-col gap-8 items-start">
                    <Button 
                      className={`${project.buttonColor} rounded-full px-10 py-7 text-xl font-medium group transition-transform hover:scale-105`}
                    >
                      {project.buttonText} <ArrowUpRight className="ml-2 w-6 h-6 transition-transform group-hover:translate-x-1 group-hover:-translate-y-1" />
                    </Button>
                    
                    <p className="text-base md:text-lg leading-relaxed opacity-90 font-medium max-w-md">
                      {project.description}
                    </p>
                  </div>
                </div>

                {/* Middle Content: Services */}
                <div className="lg:col-span-3 flex justify-start lg:justify-center pt-4 lg:pt-24">
                   <div className="flex flex-col gap-3">
                     {project.services.map((service, i) => (
                       <span key={i} className="text-lg md:text-xl font-medium opacity-90 whitespace-nowrap">
                         {service}
                       </span>
                     ))}
                   </div>
                </div>

                {/* Right Content: Image */}
                <motion.div 
                   initial={{ opacity: 0, scale: 0.95 }}
                   whileInView={{ opacity: 1, scale: 1 }}
                   viewport={{ once: true }}
                   transition={{ duration: 0.5 }}
                   className="lg:col-span-4 relative rounded-3xl overflow-hidden shadow-2xl mt-8 lg:mt-0"
                >
                  <Image
                    src={project.image}
                    alt={project.title}
                    width={800}
                    height={800}
                    className={`w-full ${"imageClassName" in project ? project.imageClassName : "h-auto object-cover"}`}
                  />
                </motion.div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}
