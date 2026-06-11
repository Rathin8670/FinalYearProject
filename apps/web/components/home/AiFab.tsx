"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Sparkles, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { AiChatModal } from "@carepulse/ai-chat-widget"

export function AiFab() {
  const [isVisible, setIsVisible] = useState(true)
  const [isHovered, setIsHovered] = useState(false)
  const [showTooltip, setShowTooltip] = useState(false)
  const [isOpen, setIsOpen] = useState(false)

  // Auto-show tooltip briefly on load to catch attention
  useEffect(() => {
    const timer = setTimeout(() => {
      setShowTooltip(true)
      setTimeout(() => setShowTooltip(false), 4000)
    }, 2000)
    return () => clearTimeout(timer)
  }, [])

  const shouldShowTooltip = isHovered || showTooltip

  if (!isVisible) return null

  return (
    <>
      <div className="fixed bottom-8 right-8 z-50 flex flex-col items-end gap-2 pointer-events-none">
        <AnimatePresence>
          {shouldShowTooltip && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 10, x: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0, x: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 10 }}
              className="bg-white border border-gray-200 shadow-xl rounded-2xl px-5 py-3 mb-2 flex items-center gap-3 origin-bottom-right pointer-events-auto"
            >
              <div className="relative">
                 <Sparkles className="w-5 h-5 text-purple-600 fill-purple-100 animate-pulse" />
              </div>
              <div className="flex flex-col">
                <span className="text-sm font-semibold text-gray-800">CarePulse AI</span>
                <span className="text-[10px] text-gray-500 font-medium">How can I help you?</span>
              </div>
              <div className="h-6 w-[1px] bg-gray-200 mx-1"></div>
              <span className="text-xs font-mono text-gray-500 bg-gray-50 px-2 py-1 rounded-md border border-gray-200 shadow-sm">Ctrl+J</span>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="relative pointer-events-auto">
          {/* Red Ripple Effect */}
          <span className="absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75 animate-ping duration-1000 -z-10"></span>

          <motion.button
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            onClick={() => {
              console.log("FAB Clicked")
              setIsOpen(true)
            }}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            animate={{ 
              scale: [1, 1.08, 1, 1.08, 1],
              boxShadow: [
                "0px 4px 12px rgba(0,0,0,0.1)",
                "0px 8px 16px rgba(0,0,0,0.15)",
                "0px 4px 12px rgba(0,0,0,0.1)",
                "0px 8px 16px rgba(0,0,0,0.15)",
                "0px 4px 12px rgba(0,0,0,0.1)"
              ]
            }}
            transition={{ 
              duration: 2,
              repeat: Infinity,
              repeatDelay: 1,
              ease: "easeInOut",
              times: [0, 0.2, 0.4, 0.6, 1]
            }}
            className="w-16 h-16 bg-white rounded-full shadow-2xl border-2 border-white flex items-center justify-center group transition-colors relative z-10"
          >
            <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-blue-50 to-purple-50 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            
            <div className="relative">
              <Sparkles className="w-7 h-7 text-gray-800 transition-transform duration-500 group-hover:rotate-12 group-hover:scale-110" />
              <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full border-2 border-white shadow-sm" />
            </div>
          </motion.button>
        </div>
      </div>

      <AiChatModal
        open={isOpen}
        onClose={() => setIsOpen(false)}
        apiEndpoint="/api/ai/chat"
      />
    </>
  )
}
