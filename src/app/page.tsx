"use client"

import { motion } from "framer-motion"
import {
  Navbar,
  Hero,
  LiveDemo,
  Features,
  HowItWorks,
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
      className="w-full overflow-x-hidden"
    >
      <Navbar />
      <main>
        <Hero />
        <LiveDemo />
        <Features />
        <HowItWorks />
        <ArchitectureSection />
        <UseCasesSection />
        <FAQSection />
        <CTA />
      </main>
      <Footer />
    </motion.div>
  )
}
