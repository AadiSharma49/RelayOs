"use client"

import { motion } from "framer-motion"
import {
  Navbar,
  Hero,
  Features,
  ArchitectureSection,
  UseCasesSection,
  CTA,
  FAQSection,
  Footer,
} from "@/components/landing"

export default function Home() {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.4 }}
    >
      <Navbar />
      <main>
        <Hero />
        <Features />
        <ArchitectureSection />
        <UseCasesSection />
        <FAQSection />
        <CTA />
      </main>
      <Footer />
    </motion.div>
  )
}
