import {
  Navbar,
  Hero,
  LiveDemo,
  Features,
  HowItWorks,
  MCPSection,
  ArchitectureSection,
  UseCasesSection,
  CTA,
  FAQSection,
  Footer,
} from "@/components/landing"

export default function Home() {
  return (
    <div className="w-full overflow-x-hidden">
      <Navbar />
      <main>
        <Hero />
        <LiveDemo />
        <Features />
        <HowItWorks />
        <MCPSection />
        <ArchitectureSection />
        <UseCasesSection />
        <FAQSection />
        <CTA />
      </main>
      <Footer />
    </div>
  )
}
