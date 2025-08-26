"use client"

import type React from "react"
import { motion, useScroll, useTransform } from "framer-motion"
import { useRef } from "react"

interface ScrollRevealProps {
  children: React.ReactNode
  className?: string
  direction?: "up" | "down" | "left" | "right"
  delay?: number
  duration?: number
}

export function ScrollReveal({ 
  children, 
  className = "", 
  direction = "up", 
  delay = 0, 
  duration = 0.8 
}: ScrollRevealProps) {
  const ref = useRef<HTMLDivElement>(null)
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["0 1", "1.2 1"]
  })

  const getInitialTransform = () => {
    switch (direction) {
      case "up": return { y: 40, opacity: 0 }
      case "down": return { y: -40, opacity: 0 }
      case "left": return { x: 40, opacity: 0 }
      case "right": return { x: -40, opacity: 0 }
      default: return { y: 40, opacity: 0 }
    }
  }

  const getFinalTransform = () => {
    switch (direction) {
      case "up":
      case "down": return { y: 0, opacity: 1 }
      case "left":
      case "right": return { x: 0, opacity: 1 }
      default: return { y: 0, opacity: 1 }
    }
  }

  const opacity = useTransform(scrollYProgress, [0, 1], [0, 1])
  const y = useTransform(scrollYProgress, [0, 1], direction === "up" ? [40, 0] : direction === "down" ? [-40, 0] : [0, 0])
  const x = useTransform(scrollYProgress, [0, 1], direction === "left" ? [40, 0] : direction === "right" ? [-40, 0] : [0, 0])

  return (
    <motion.div
      ref={ref}
      className={className}
      style={{ opacity, y, x }}
      initial={getInitialTransform()}
      whileInView={getFinalTransform()}
      viewport={{ once: true, amount: 0.3 }}
      transition={{ 
        delay, 
        duration, 
        ease: [0.25, 0.1, 0.25, 1] 
      }}
    >
      {children}
    </motion.div>
  )
}

interface ParallaxProps {
  children: React.ReactNode
  className?: string
  speed?: number
}

export function Parallax({ children, className = "", speed = 0.5 }: ParallaxProps) {
  const ref = useRef<HTMLDivElement>(null)
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"]
  })

  const y = useTransform(scrollYProgress, [0, 1], [0, speed * 100])

  return (
    <motion.div ref={ref} className={className} style={{ y }}>
      {children}
    </motion.div>
  )
}