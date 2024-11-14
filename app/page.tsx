import { Suspense } from 'react'
import Header from "@/components/shipfast-components/Header";
import Hero from "@/components/shipfast-components/Hero";
import Problem from "@/components/shipfast-components/Problem";
import FeaturesAccordion from "@/components/shipfast-components/FeaturesAccordion";
import Pricing from "@/components/shipfast-components/Pricing";
import FAQ from "@/components/shipfast-components/FAQ";
import CTA from "@/components/shipfast-components/CTA";
import Footer from "@/components/shipfast-components/Footer";

export default function Home() {
  return (
    <>
      <Suspense>
        <Header />
      </Suspense>
      <main>
        <Hero />
        <Problem />
        {/* <FeaturesAccordion /> */}
        {/* <Pricing /> */}
        <FAQ />
        <CTA />
      </main>
      <Footer />
    </>
  );
}