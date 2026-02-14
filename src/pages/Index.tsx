import Navbar from "@/components/Navbar";
import HeroSection from "@/components/home/HeroSection";
import CategorySection from "@/components/home/CategorySection";
import PopularCourses from "@/components/home/PopularCourses";
import MasterSkills from "@/components/home/MasterSkills";
import FeaturedInstructors from "@/components/home/FeaturedInstructors";
import TestimonialCarousel from "@/components/home/TestimonialCarousel";
import TrustedBy from "@/components/home/TrustedBy";
import WhyChooseUs from "@/components/home/WhyChooseUs";
import ShareKnowledge from "@/components/home/ShareKnowledge";
import Footer from "@/components/Footer";

const Index = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1">
        <HeroSection />
        <CategorySection />
        <PopularCourses />
        <MasterSkills />
        <FeaturedInstructors />
        <TestimonialCarousel />
        <WhyChooseUs />
        <TrustedBy />
        <ShareKnowledge />
      </main>
      <Footer />
    </div>
  );
};

export default Index;
