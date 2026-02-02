import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowUpRight, Sparkles } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import Autoplay from "embla-carousel-autoplay";

interface Category {
  id: string;
  name: string;
  image_url: string;
  description: string;
}

const CategoriesCarousel = () => {
  const navigate = useNavigate();
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  // Fallback images matching the luxury aesthetic if no image provided
  const fallbacks = [
    'https://images.unsplash.com/photo-1551488852-d8048f577e77?auto=format&fit=crop&q=80', // Lehenga
    'https://images.unsplash.com/photo-1596489030885-41a46b69fa09?auto=format&fit=crop&q=80', // Saree
    'https://images.unsplash.com/photo-1598033129183-c4f50c736f10?auto=format&fit=crop&q=80', // Kurta
    'https://images.unsplash.com/photo-1594938298603-c8148c4dae35?auto=format&fit=crop&q=80', // Sherwani
    'https://images.unsplash.com/photo-1585728748176-455ac6efac91?auto=format&fit=crop&q=80', // Fusion
    'https://images.unsplash.com/photo-1583391733956-6c78276477e2?auto=format&fit=crop&q=80', // Bridal
  ];

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .eq('is_active', true)
        .order('name');

      if (error) throw error;
      setCategories(data || []);
    } catch (error) {
      console.error('Error fetching categories:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCategoryClick = (category: Category) => {
    navigate(`/products?category=${category.name.toLowerCase()}`);
  };

  if (loading) {
    return (
      <section className="py-20 bg-[#F8FAFC] min-h-[400px] flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
      </section>
    );
  }

  if (categories.length === 0) return null;

  return (
    <section className="py-12 md:py-16 bg-[#F8FAFC] relative overflow-hidden">
      {/* Grain Texture for Section Background */}
      <div className="absolute inset-0 opacity-[0.03] pointer-events-none" style={{ backgroundImage: `url("https://grainy-gradients.vercel.app/noise.svg")` }}></div>

      {/* Geometric Accents - Matching Hero Section */}
      <div className="absolute top-[-10%] left-[-10%] w-[40vw] h-[40vw] bg-leaf-green/10 rounded-full blur-[100px] pointer-events-none mix-blend-multiply z-0"></div>
      <div className="absolute top-[-10%] right-[-10%] w-[30vw] h-[30vw] bg-orange-400/10 rounded-full blur-[90px] pointer-events-none mix-blend-multiply z-0"></div>
      <div className="absolute bottom-[-10%] left-[-10%] w-[30vw] h-[30vw] bg-orange-500/10 rounded-full blur-[90px] pointer-events-none mix-blend-multiply z-0"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[30vw] h-[30vw] bg-primary/10 rounded-full blur-[80px] pointer-events-none mix-blend-multiply z-0"></div>

      <div className="max-w-[1600px] mx-auto px-6 lg:px-12 relative z-10">

        {/* Section Header */}
        <div className="mb-12 flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-gray-200/60 pb-8">
          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-2 mb-1">
              <Sparkles className="w-4 h-4 text-primary animate-pulse" />
              <span className="text-xs font-mono font-bold tracking-widest text-primary uppercase">Curated Arcs</span>
            </div>
            <h2 className="text-5xl md:text-7xl font-display font-bold tracking-tighter leading-[0.9] text-black">
              ARC <span className="text-transparent bg-clip-text bg-gradient-to-r from-black to-gray-400">SELECTION</span>
            </h2>
          </div>
          <div className="flex items-center gap-4">
            <p className="hidden md:block text-zinc-500 text-sm font-medium text-right max-w-xs leading-relaxed">
              Explore our signature collections inspired by the shinobi world.
            </p>
          </div>
        </div>

        {/* Carousel */}
        <div className="relative">
          <Carousel
            opts={{
              align: "start",
              loop: true,
            }}
            plugins={[
              Autoplay({
                delay: 2000,
              }) as any,
            ]}
            className="w-full"
          >
            <CarouselContent className="-ml-6">
              {categories.map((category, index) => (
                <CarouselItem key={category.id} className="pl-6 basis-[85%] sm:basis-[60%] md:basis-1/2 lg:basis-1/3">
                  <motion.div
                    whileHover="hover"
                    initial="rest"
                    className="relative group h-[550px] w-full cursor-pointer perspective-1000"
                    onClick={() => handleCategoryClick(category)}
                  >
                    {/* Animated Border Container with Notched Corners */}
                    {/* Using a pseudo-border by leveraging background size on a parent with padding */}
                    <div
                      className="absolute inset-0 bg-transparent transition-all duration-300 group-hover:drop-shadow-[0_0_15px_rgba(255,94,0,0.3)]"
                      style={{
                        clipPath: 'polygon(30px 0, 100% 0, 100% calc(100% - 30px), calc(100% - 30px) 100%, 0 100%, 0 30px)'
                      }}
                    >
                      {/* Border Layer (Visible on Hover via color change) */}
                      <div className="absolute inset-0 bg-zinc-800 group-hover:bg-primary transition-colors duration-500"></div>

                      {/* Inner Content Container (Slightly smaller to show border) */}
                      <div
                        className="absolute inset-[1px] bg-black overflow-hidden"
                        style={{
                          clipPath: 'polygon(30px 0, 100% 0, 100% calc(100% - 30px), calc(100% - 30px) 100%, 0 100%, 0 30px)'
                        }}
                      >
                        {/* Background Japanese Text Decoration */}
                        <div className="absolute top-4 right-4 z-10 opacity-20 group-hover:opacity-40 transition-opacity pointer-events-none select-none writing-vertical-rl text-6xl font-black text-transparent stroke-text-white group-hover:stroke-text-primary duration-500 font-manga">
                          アーク
                        </div>
                        <div className="absolute -bottom-10 -left-10 z-10 text-[12rem] font-black text-white/5 leading-none select-none font-display">
                          0{index + 1}
                        </div>

                        {/* Image */}
                        <motion.div
                          className="w-full h-full"
                          variants={{
                            rest: { scale: 1.1, filter: "grayscale(0%) brightness(0.9)" },
                            hover: { scale: 1.0, filter: "grayscale(0%) brightness(1.1)" }
                          }}
                          transition={{ duration: 0.6, ease: [0.33, 1, 0.68, 1] }}
                        >
                          <img
                            src={category.image_url || fallbacks[index % fallbacks.length]}
                            alt={category.name}
                            className="w-full h-full object-cover"
                          />
                        </motion.div>

                        {/* Tech Overlay (Grid/Scanlines) */}
                        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 mix-blend-overlay pointer-events-none"></div>
                        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent opacity-90"></div>

                        {/* Content */}
                        <div className="absolute inset-0 p-8 flex flex-col justify-end">
                          <div className="relative z-20">
                            {/* Animated Line */}
                            <motion.div
                              className="w-12 h-1 bg-primary mb-4"
                              variants={{ rest: { width: 48 }, hover: { width: 100 } }}
                              transition={{ duration: 0.4 }}
                            ></motion.div>

                            <h3 className="text-white font-display text-4xl font-bold uppercase mb-2 leading-[0.85] tracking-tight">
                              {category.name}
                            </h3>

                            <div className="overflow-hidden h-8 mt-2">
                              <motion.div
                                variants={{ rest: { y: 30 }, hover: { y: 0 } }}
                                transition={{ duration: 0.4, delay: 0.1 }}
                                className="flex items-center gap-3"
                              >
                                <span className="text-zinc-400 font-mono text-xs tracking-widest uppercase">
                                  Initialize Arc
                                </span>
                                <ArrowUpRight className="w-4 h-4 text-primary" />
                              </motion.div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                </CarouselItem>
              ))}
            </CarouselContent>

            {/* Nav Buttons */}
            <div className="hidden md:flex absolute -top-24 right-0 gap-3">
              <CarouselPrevious className="static translate-y-0 w-12 h-12 bg-transparent border border-zinc-300 rounded-full hover:bg-black hover:text-white hover:border-black transition-all" />
              <CarouselNext className="static translate-y-0 w-12 h-12 bg-transparent border border-zinc-300 rounded-full hover:bg-black hover:text-white hover:border-black transition-all" />
            </div>

          </Carousel>
        </div>
      </div>
    </section>
  );
};

export default CategoriesCarousel;
