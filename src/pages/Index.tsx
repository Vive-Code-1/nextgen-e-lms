import Navbar from "@/components/Navbar";
import HeroSection from "@/components/home/HeroSection";
import StatsSection from "@/components/home/StatsSection";
import PopularCourses from "@/components/home/PopularCourses";
import WhyChooseUs from "@/components/home/WhyChooseUs";
import Footer from "@/components/Footer";

const Index = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1">
        <HeroSection />
        <StatsSection />
        <PopularCourses />
        <WhyChooseUs />
      </main>
      <Footer />
    </div>
  );
};

export default Index;
