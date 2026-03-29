import HeroSection from "@/components/home/HeroSection";
import FeaturesOverview from "@/components/home/FeaturesOverview";
import HowItWorks from "@/components/home/HowItWorks";
import StatsSection from "@/components/home/StatsSection";
import CTASection from "@/components/home/CTASection";

export default function Home() {
  return (
    <main>
      <HeroSection />
      <FeaturesOverview />
      <HowItWorks />
      <StatsSection />
      <CTASection />
    </main>
  );
}
