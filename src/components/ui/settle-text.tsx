"use client"

import { motion, type Variants } from "framer-motion"

interface SettleTextProps {
  text: string
  highlightWords?: string[]
  className?: string
}

const container: Variants = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.045, delayChildren: 0.1 },
  },
}

const wordVariant: Variants = {
  hidden: { opacity: 0, y: 18, filter: "blur(6px)" },
  visible: {
    opacity: 1,
    y: 0,
    filter: "blur(0px)",
    transition: { duration: 0.5, ease: [0.21, 0.47, 0.32, 0.98] },
  },
}

const norm = (w: string) => w.replace(/[^a-z]/gi, "").toLowerCase()

/**
 * Words fade/rise/deblur into their proper reading positions with a stagger —
 * settling into a fully readable sentence in ~1.3s. Each word lifts on hover,
 * so it stays interactive without the unreadable physics pile-up.
 */
export function SettleText({ text, highlightWords = [], className }: SettleTextProps) {
  const highlightSet = new Set(highlightWords.map(norm))
  const words = text.split(" ")

  return (
    <motion.p
      variants={container}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-60px" }}
      className={className}
    >
      {words.map((word, i) => {
        const isHighlighted = highlightSet.has(norm(word))
        return (
          <motion.span
            key={`${word}-${i}`}
            variants={wordVariant}
            className={`inline-block cursor-default px-[0.12em] transition-all duration-200 hover:-translate-y-1 ${
              isHighlighted
                ? "text-gradient-hero font-bold"
                : "text-foreground/90 hover:text-foreground"
            }`}
          >
            {word}
          </motion.span>
        )
      })}
    </motion.p>
  )
}

export default SettleText
