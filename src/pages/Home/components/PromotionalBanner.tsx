import React, { useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, useScroll, useTransform } from 'framer-motion';

interface PromotionalBannerProps {
  image: string;
  subtitle: string;
  title: string;
  description?: string;
  ctaText: string;
  link: string;
  align?: 'left' | 'right' | 'center';
  darkOverlay?: boolean;
}

const PromotionalBanner: React.FC<PromotionalBannerProps> = ({
  image,
  subtitle,
  title,
  description,
  ctaText,
  link,
  align = 'left',
}) => {
  const navigate = useNavigate();
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start end", "end start"]
  });

  const y = useTransform(scrollYProgress, [0, 1], [100, -100]);

  return (
    <section ref={containerRef} className="relative w-full flex flex-col md:flex-row overflow-hidden min-h-[80vh] md:h-screen bg-background text-overlap-container group/banner">
      {/* Background Noise/Texture */}
      <div className="absolute inset-0 opacity-[0.03] pointer-events-none z-0" style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)' opacity='1'/%3E%3C/svg%3E")` }}></div>

      {/* Decorative Japanese Text - Absolute Background */}
      <div className="absolute top-0 right-0 h-full hidden lg:flex flex-col justify-center items-center pointer-events-none z-10 opacity-10">
        <span className="text-[15rem] leading-none font-black text-white [writing-mode:vertical-rl] select-none truncate">
          {align === 'left' ? 'ストリート' : 'ファッション'}
        </span>
      </div>

      {/* Left Text Section - Dynamic Diagonal Cut */}
      <div className={`w-full md:w-[45%] bg-zinc-900/90 backdrop-blur-sm dark:bg-black/90 min-h-[40vh] md:min-h-full relative flex flex-col justify-center px-8 md:px-16 py-16 md:py-0 z-20 transition-transform duration-700 order-2 md:order-none ${align === 'right' ? 'md:order-1 md:[clip-path:polygon(0_0,100%_0,85%_100%,0%_100%)]' : 'md:order-2 md:[clip-path:polygon(15%_0,100%_0,100%_100%,0%_100%)]'}`}>

        {/* Border Accent */}
        <div className={`absolute top-0 bottom-0 w-1 bg-primary/20 ${align === 'right' ? 'right-0' : 'left-0'}`}></div>

        <div className="hidden md:block absolute bottom-12 left-12 space-y-4">
          <p className="text-xs uppercase tracking-[0.3em] text-zinc-500 font-mono">Series: 2024-V2</p>
        </div>

        <div className="relative z-20 max-w-lg">
          <div className="flex items-center gap-3 mb-4">
            <span className="h-[1px] w-8 bg-primary"></span>
            <p className="text-primary font-bold tracking-[0.2em] text-xs uppercase">{subtitle}</p>
          </div>
          <h2 className="text-5xl md:text-7xl font-display font-black italic text-white leading-[0.9] mb-6 tracking-tighter uppercase relative">
            <span className="relative z-10">{title}</span>
            <span className="absolute top-1 left-1 text-stroke-1 opacity-30 -z-10">{title}</span>
          </h2>

          <p className="hidden md:block text-zinc-400 text-sm leading-relaxed mb-8 max-w-sm border-l-2 border-zinc-800 pl-4 font-mono">
            {description}
          </p>

          <button
            onClick={() => navigate(link)}
            className="group relative inline-flex items-center gap-4 bg-white text-black px-10 py-5 font-black tracking-widest text-xs uppercase hover:bg-primary hover:text-white transition-all duration-300 clip-path-slant"
          >
            <span className="relative z-10">{ctaText}</span>
            <span className="material-symbols-outlined text-sm transition-transform group-hover:translate-x-2 relative z-10">arrow_forward</span>
            <div className="absolute inset-0 bg-primary transform scale-x-0 origin-left group-hover:scale-x-100 transition-transform duration-300 ease-out z-0"></div>
          </button>
        </div>
      </div>

      {/* Right Image Section */}
      <div className={`w-full md:w-[65%] relative h-[45vh] md:h-full overflow-hidden group order-1 md:order-none ${align === 'right' ? 'md:order-2 md:-ml-[10%]' : 'md:order-1 md:-mr-[10%]'}`}>
        <motion.div style={{ y }} className="absolute inset-0 h-[120%] w-full top-[-10%]">
          <motion.img
            alt={title}
            className="w-full h-full object-cover object-center grayscale-[30%] group-hover:grayscale-0 transition-all duration-1000 ease-out scale-105 group-hover:scale-110"
            src={image}
          />
        </motion.div>

        {/* Gradient Overlay for Mobile Text Visibility */}
        <div className="md:hidden absolute inset-0 bg-gradient-to-t from-zinc-900 via-zinc-900/50 to-transparent pointer-events-none"></div>
        <div className="hidden md:block absolute inset-0 bg-black/10 transition-colors group-hover:bg-transparent pointer-events-none"></div>

        {/* Floating Tag */}
        <div className="absolute top-12 right-12 bg-black/80 backdrop-blur-md text-white/90 text-[10px] font-mono p-2 border border-white/10 hidden md:block">
          COORD: {Math.floor(Math.random() * 99)}.{Math.floor(Math.random() * 999)} // SECTOR 7
        </div>
      </div>
    </section>
  );
};

export default PromotionalBanner;