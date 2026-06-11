"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { ArrowUpRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import Image from "next/image"

const faqs = [
  {
    question: "What is this Telemedicine platform?",
    answer: "This platform enables patients to consult with doctors remotely through secure video calls, book appointments digitally, and access medical guidance using AI-powered assistance. It improves healthcare accessibility and reduces the need for physical hospital visits."
  },
  {
    question: "How do I book an appointment?",
    answer: "Appointments can be booked either directly through the web dashboard or through WhatsApp automated booking, where users can schedule consultations by chatting with the appointment bot."
  },
  {
    question: "Do I need to install any additional application?",
    answer: "No. You can access consultations directly from the website and also book appointments via WhatsApp without installing separate apps."
  },
  {
    question: "Is video consultation supported?",
    answer: "Yes, our platform supports real-time one-on-one video consultations using WebRTC for smooth and secure audio-video communication."
  },
  {
    question: "How secure is my medical data?",
    answer: "Your data is encrypted and protected with modern security standards, including JWT-based secure authentication and protected role-based access for doctors and patients."
  },
  {
    question: "Can doctors manage appointments and patient data through the system?",
    answer: "Yes. Doctors have a dedicated dashboard where they can manage appointments, view patient history, conduct consultations, and generate prescriptions."
  },
  {
    question: "What features does the AI chatbot offer?",
    answer: "The AI chatbot provides basic medical assistance, summaries of prescriptions, and helps interpret medical reports. In future releases, it will integrate with advanced LLM-based AI doctor models for preliminary diagnosis support."
  },
  {
    question: "Can I use social login to sign up?",
    answer: "Yes. We support secure sign-in via email/password, Google, and other social login options for faster access."
  },
  {
    question: "How do reminders and notifications work?",
    answer: "The system sends automated notifications and reminders through WhatsApp and email to ensure patients never miss their appointments."
  },
  {
    question: "Does the platform support online payments?",
    answer: "Payment gateway integration is part of the next phase of development. Our architecture already supports adding secure online payments soon."
  },
  {
    question: "Is this platform suitable for clinics and hospitals?",
    answer: "Yes. It is designed as a scalable SaaS solution, meaning it can serve independent doctors, clinics, or multi-branch hospitals."
  },
  {
    question: "What devices are supported?",
    answer: "The platform works on mobile phones, tablets, and desktops with a stable internet connection."
  },
  {
    question: "What makes this system different from existing telemedicine apps?",
    answer: "Unlike typical telemedicine solutions, our platform includes WhatsApp automation, AI assistance, real-time dashboards, and future AI doctor model integration, offering a more intelligent and seamless healthcare experience."
  },
  {
    question: "Can I access consultation history and prescriptions later?",
    answer: "Yes, all previous consultation records and digital prescriptions are stored in your secure dashboard."
  },
  {
    question: "Is the platform available 24/7?",
    answer: "Yes, appointment booking and chat support are available 24/7. Video consultations depend on doctor availability."
  }
]

export function FAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(0)

  return (
    <section id="faq" className="py-24 bg-white">
      <div className="container mx-auto max-w-[1800px] px-6">
        <h2 className="text-4xl md:text-6xl font-bold mb-16 tracking-tight">
          Frequently asked <br /> questions
        </h2>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-24 items-start">
          {/* Left Column: Accordion */}
          <div className="lg:col-span-8">
            <div className="flex flex-col">
              {faqs.map((faq, index) => (
                <div key={index} className="border-b border-gray-200 last:border-0">
                  <button
                    onClick={() => setOpenIndex(openIndex === index ? null : index)}
                    className="w-full py-8 flex items-start justify-between text-left group"
                  >
                    <span className="text-xl md:text-2xl font-medium text-black group-hover:text-slate-600 transition-colors pr-8">
                      {faq.question}
                    </span>
                    <span className="shrink-0 mt-1 text-slate-400">
                      {openIndex === index ? (
                        <ArrowUpRight className="w-6 h-6 rotate-45" /> 
                      ) : (
                        <ArrowUpRight className="w-6 h-6" />
                      )}
                    </span>
                  </button>
                  <AnimatePresence>
                    {openIndex === index && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.3, ease: "easeInOut" }}
                        className="overflow-hidden"
                      >
                        <div className="pb-8 text-lg">
                          {faq.answer}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              ))}
            </div>
          </div>

          {/* Right Column: Contact Card */}
          <div className="lg:col-span-4 sticky top-10">
            <div className="bg-[#111] text-white p-8 md:p-12 rounded-3xl flex flex-col items-start gap-6">
              <div className="w-20 h-20 rounded-xl overflow-hidden relative border-2 border-white/10">
                {/* Placeholder for Shahid's image */}
                <Image
                   src="/icon.png"
                   alt="Carepulse Team"
                   fill
                   className="object-cover"
                />
              </div>
              
              <p className="text-lg md:text-xl font-medium leading-relaxed">
                Hi, This is Carepulse Team,please dont hesitate to ask us any questions, we are here to answer all your questions!
              </p>

              <Button 
                className="bg-[#D1F848] hover:bg-[#bce336] text-black text-lg px-8 py-6 rounded-full font-bold w-full md:w-auto mt-4 transition-transform hover:scale-105"
              >
                Ask Questions <span className="ml-2">💬</span> {/* WhatsApp icon placeholder */}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
