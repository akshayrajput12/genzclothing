import { useEffect, useState } from "react";
import { fetchTestimonials, Testimonial } from "@/data/testimonials";

const Testimonials = () => {
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadTestimonials = async () => {
      try {
        const data = await fetchTestimonials();
        setTestimonials(data);
      } catch (error) {
        console.error("Error loading testimonials:", error);
      } finally {
        setLoading(false);
      }
    };

    loadTestimonials();
  }, []);

  if (loading) {
    return (
      <section className="bg-[#F8FAFC] min-h-[600px] flex items-center justify-center manga-lines">
        <div className="animate-pulse flex flex-col items-center">
          <div className="w-16 h-16 bg-chakra-red/20 rounded-full mb-4"></div>
          <div className="h-4 w-32 bg-gray-200 rounded"></div>
        </div>
      </section>
    );
  }

  if (testimonials.length === 0) {
    return null;
  }

  return (
    <section className="bg-[#F8FAFC] text-shadow-black relative manga-lines py-10 md:py-20 overflow-hidden font-display">
      {/* Decorative Side Elements (Fixed positions relative to relative container might need adjustment if parent changes, but snippet used fixed. 
          The snippet used fixed for headers/sidebars. Since this is a component, I will convert fixed to absolute relative to this section 
          OR keep them if they are meant to be global. The prompt says "update ui of ... cards ... connections same". 
          I will assume this component IS the section. I will treat fixed elements as decorative absolute elements scoped to this section 
          to avoid breaking the whole page layout if this is just one block. 
          Actually, the snippet had a sidebar "CLIENT CHRONICLES". I'll make it absolute left-0. 
      */}

      <div className="absolute left-0 top-0 h-full w-24 flex items-center justify-center pointer-events-none z-10 hidden lg:flex">
        <h1 className="vertical-text text-shadow-black/5 text-8xl font-black tracking-tighter select-none">
          CLIENT CHRONICLES
        </h1>
      </div>

      {/* Aesthetic Corner Gradients */}
      <div className="absolute top-0 right-0 w-[300px] h-[300px] md:w-[800px] md:h-[800px] bg-[radial-gradient(circle_at_top_right,rgba(249,115,22,0.08),transparent_70%)] pointer-events-none z-0"></div>
      <div className="absolute bottom-0 left-0 w-[300px] h-[300px] md:w-[800px] md:h-[600px] bg-[radial-gradient(circle_at_bottom_left,rgba(220,38,38,0.05),transparent_70%)] pointer-events-none z-0"></div>

      <div className="relative z-10">
        <div className="flex flex-col items-center mb-10 md:mb-20">
          <div className="w-24 h-24 md:w-32 md:h-32 mb-6 bg-white/50 backdrop-blur-sm rounded-full flex items-center justify-center overflow-hidden border border-smoke-grey/20 shadow-2xl">
            <img
              alt="Pixel art character animation"
              className="w-16 h-16 md:w-24 md:h-24 object-contain"
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuBhUdrd-3ovaFEtNTHXrmx6q5eSocfL-CHGk0Eb0JfweOlHz1WWaYJTwCelItluEH-BT281GoVyhrSF-MJZRI8LdGVEYnVQrMQ_EZpuEyGCjXid3PeEOhGqohQZqpsOOCv1QJ-_tnTDDfBsIYDQMzyoQbUwrwYnBhykzyUupf_lc-EkmiHxbQ0DZO3yS4uZis8RrmaiW9R0tZSzskBnNzFIAUVfGu7zxO_ABwIyHIMer0O5q2_n-pj3Y--8Wi-56uLSD43cGUFttI7O"
            />
          </div>
          <div className="text-center">
            <p className="text-[10px] uppercase tracking-[0.8em] text-chakra-red font-bold mb-2">Automated Data Stream</p>
            <div className="h-12 w-[1px] bg-gradient-to-b from-chakra-red to-transparent mx-auto"></div>
          </div>
        </div>

        <div className="relative w-full py-10">
          <div className="carousel-track animate-carousel">
            {/* Original Set */}
            <div className="flex gap-12 px-6">
              {testimonials.map((testimonial, index) => (
                <TestimonialCard key={testimonial.id} testimonial={testimonial} index={index} />
              ))}
            </div>
            {/* Duplicate Set for Infinite Scroll */}
            <div className="flex gap-12 px-6">
              {testimonials.map((testimonial, index) => (
                <TestimonialCard key={`${testimonial.id}-clone`} testimonial={testimonial} index={index} />
              ))}
            </div>
          </div>
        </div>


      </div>
    </section>
  );
};

const TestimonialCard = ({ testimonial, index }: { testimonial: Testimonial, index: number }) => {
  // Cycle through 3 clip styles
  const clipStyle = `shattered-clip-${(index % 3) + 1}`;

  return (
    <div className={`${clipStyle} obito-glass-panel border border-chakra-red/20 w-[300px] sm:w-[350px] md:w-[450px] p-6 md:p-10 relative flex flex-col justify-between shrink-0 group hover:border-chakra-red/60 transition-colors duration-500`}>
      <span className="absolute top-4 right-8 text-5xl md:text-7xl text-chakra-red font-serif opacity-20 pointer-events-none">“</span>

      <div className="flex gap-4 md:gap-6 items-start">
        <div className="w-14 h-14 md:w-20 md:h-20 shrink-0 border border-chakra-red/30 p-1">
          <img
            alt={testimonial.name}
            className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all"
            src={testimonial.image}
          />
        </div>
        <div>
          <h3 className="text-lg md:text-xl font-bold uppercase tracking-tight text-shadow-black">{testimonial.name}</h3>
          <p className="text-[9px] md:text-[10px] uppercase tracking-widest text-smoke-grey mb-2 md:mb-4 pr-4">{testimonial.role} {testimonial.company ? `/ ${testimonial.company}` : ''}</p>
        </div>
      </div>

      <p className="text-sm md:text-base leading-relaxed text-shadow-black/90 italic mt-4 md:mt-6">
        "{testimonial.text}"
      </p>

      <div className="mt-6 md:mt-8 flex items-center gap-4">
        <div className="h-[1px] w-8 md:w-12 bg-chakra-red"></div>
        <span className="text-[9px] md:text-[10px] font-bold uppercase tracking-tighter opacity-40">LOG_{String(index * 92 + 15).padStart(3, '0')}_VOID</span>
      </div>
    </div>
  );
}

export default Testimonials;