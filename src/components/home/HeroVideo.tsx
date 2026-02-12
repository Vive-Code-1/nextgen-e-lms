import heroVideo from "@/assets/hero-video.webm";

const HeroVideo = () => {
  return (
    <section className="py-12">
      <div className="max-w-[80vw] mx-auto px-4">
        <video
          src={heroVideo}
          autoPlay
          loop
          muted
          playsInline
          className="w-full rounded-2xl"
        />
      </div>
    </section>
  );
};

export default HeroVideo;
