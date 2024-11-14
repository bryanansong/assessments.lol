import { Suspense } from 'react'
import Header from "@/shipfast-components/Header";
import Hero from "@/shipfast-components/Hero";
import Problem from "@/shipfast-components/Problem";
import FeaturesAccordion from "@/shipfast-components/FeaturesAccordion";
import Pricing from "@/shipfast-components/Pricing";
import FAQ from "@/shipfast-components/FAQ";
import CTA from "@/shipfast-components/CTA";
import Footer from "@/shipfast-components/Footer";

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