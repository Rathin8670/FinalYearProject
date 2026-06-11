"use client"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ArrowUpRight, ChevronDown, Menu } from "lucide-react"
import { motion, useScroll, useMotionValueEvent } from "framer-motion"
import { useAuth } from "@/contexts/AuthContext"

export function Header() {
  const { scrollY } = useScroll()
  const { isAuthenticated } = useAuth()
  const [hidden, setHidden] = useState(false)

  useMotionValueEvent(scrollY, "change", (latest) => {
    const previous = scrollY.getPrevious() ?? 0
    if (latest > previous && latest > 150) {
      setHidden(true)
    } else {
      setHidden(false)
    }
  })

  return (
    <motion.header
      initial={{ y: -100, opacity: 0 }}
      animate={{ y: hidden ? "-100%" : 0, opacity: 1 }}
      transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
      className="fixed top-0 left-0 right-0 z-50 px-6 py-6 bg-white/80 backdrop-blur-md"
    >
      <div className="flex items-center justify-between max-w-[1800px] mx-auto">
        <Link href="/" className="text-5xl font-bold tracking-tighter interactive text-black font-display">
          carepulse
        </Link>

        <nav className="hidden lg:flex items-center gap-10">
          <Link href="#services" className="flex items-center gap-1 text-base font-medium text-slate-800 hover:text-primary transition-colors interactive">
            Roadmap <div className="bg-black text-white rounded-full w-4 h-4 flex items-center justify-center text-[10px]"><ArrowUpRight className="w-2.5 h-2.5" /></div>
          </Link>
          <Link href="#work" className="text-base font-medium text-slate-800 hover:text-primary text-2xl transition-colors interactive relative">
            Features
          </Link>
          <Link href="#impact" className="text-base font-medium text-slate-800 hover:text-primary transition-colors interactive">
            Impact
          </Link>
          <Link href="#process" className="text-base font-medium text-slate-800 hover:text-primary transition-colors interactive">
            Process
          </Link>
          <Link href="#faq" className="text-base font-medium text-slate-800 hover:text-primary transition-colors interactive">
            FAQ
          </Link>
        </nav>

        <div className="flex items-center gap-4">
          {isAuthenticated ? (
            <Link href="/dashboard">
              <Button variant="primary" size="lg" className="hidden md:inline-flex rounded-full px-8 h-12 text-base font-medium">
                Dashboard <ArrowUpRight className="ml-2 w-4 h-4" />
              </Button>
            </Link>
          ) : (
            <Link href="/signin">
              <Button variant="primary" size="lg" className="hidden md:inline-flex rounded-full px-8 h-12 text-base font-medium">
                Sign In <ArrowUpRight className="ml-2 w-4 h-4" />
              </Button>
            </Link>
          )}
          <button className="lg:hidden text-black interactive">
            <Menu className="w-8 h-8" />
          </button>
        </div>
      </div>
    </motion.header>
  )
}
