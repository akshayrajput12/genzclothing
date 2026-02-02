import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { supabase } from '@/integrations/supabase/client';

interface InstagramPost {
  id: string;
  embed_html: string;
  caption: string;
}

const InstagramCarousel = () => {
  const [instagramPosts, setInstagramPosts] = useState<InstagramPost[]>([]);
  const [loading, setLoading] = useState(true);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchInstagramPosts();
  }, []);

  const fetchInstagramPosts = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('instagram_posts')
        .select('id, embed_html, caption')
        .eq('is_active', true)
        .order('sort_order', { ascending: true });

      if (error) throw error;
      setInstagramPosts(data || []);
    } catch (error) {
      console.error('Error fetching Instagram posts:', error);
    } finally {
      setLoading(false);
    }
  };

  // Load Instagram embed script
  useEffect(() => {
    const script = document.createElement('script');
    script.src = '//www.instagram.com/embed.js';
    script.async = true;
    script.onload = () => {
      // @ts-ignore
      if (window.instgrm) {
        // @ts-ignore
        window.instgrm.Embeds.process();
      }
    };
    document.body.appendChild(script);

    return () => {
      document.body.removeChild(script);
    };
  }, [instagramPosts]);

  const scrollPrev = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({ left: -340, behavior: 'smooth' });
    }
  };

  const scrollNext = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({ left: 340, behavior: 'smooth' });
    }
  };

  // Auto-scroll Logic
  useEffect(() => {
    let scrollInterval: NodeJS.Timeout;

    const startAutoScroll = () => {
      scrollInterval = setInterval(() => {
        if (scrollContainerRef.current) {
          const { scrollLeft, scrollWidth, clientWidth } = scrollContainerRef.current;
          // If we reached the end + some buffer, reset to 0
          if (scrollLeft + clientWidth >= scrollWidth - 10) {
            scrollContainerRef.current.scrollTo({ left: 0, behavior: 'smooth' });
          } else {
            scrollContainerRef.current.scrollBy({ left: 340, behavior: 'smooth' });
          }
        }
      }, 4000); // Scroll every 4 seconds
    };

    if (instagramPosts.length > 0) {
      startAutoScroll();
    }

    return () => clearInterval(scrollInterval);
  }, [instagramPosts]);

  if (loading) return null;

  if (instagramPosts.length === 0) return null;

  return (
    <section className="bg-scroll-white dark:bg-background-dark font-display text-shadow-black transition-colors duration-300 py-10 relative overflow-hidden">
      {/* Manga Speed Lines Background */}
      <div className="absolute inset-0 pointer-events-none opacity-20" style={{ backgroundImage: "repeating-linear-gradient(45deg, transparent, transparent 100px, rgba(0, 0, 0, 0.03) 101px, rgba(0, 0, 0, 0.03) 102px)" }}></div>

      <div className="max-w-[1440px] mx-auto px-4 md:px-8">

        {/* Title Section */}
        <div className="mt-8 mb-12 text-center px-4">
          <h1 className="text-[40px] md:text-[100px] font-heading italic leading-none text-shadow-black dark:text-white select-none">
            SOCIAL ARC
          </h1>
          <div className="max-w-[1000px] mx-auto mt-2">
            <div className="h-[1px] w-full bg-primary/20 rounded-full relative overflow-hidden">
              <div className="absolute inset-0 bg-primary w-1/4 shadow-[0_0_10px_#f97415] animate-subtle-glow"></div>
            </div>
          </div>
        </div>

        {/* Carousel / Grid */}
        <div className="relative">
          {/* Mobile Swipe Hint */}
          <div className="md:hidden absolute -top-8 right-0 text-xs text-muted-foreground animate-pulse pr-4">
            Swipe →
          </div>
          {/* Navigation Buttons */}
          <div className="absolute -left-4 top-[45%] -translate-y-1/2 z-20 hidden xl:block">
            <button onClick={scrollPrev} className="w-12 h-12 flex items-center justify-center rounded-full bg-white shadow-lg border border-gray-100 hover:scale-110 transition-transform">
              <span className="material-symbols-outlined">arrow_back</span>
            </button>
          </div>
          <div className="absolute -right-4 top-[45%] -translate-y-1/2 z-20 hidden xl:block">
            <button onClick={scrollNext} className="w-12 h-12 flex items-center justify-center rounded-full bg-white shadow-lg border border-gray-100 hover:scale-110 transition-transform">
              <span className="material-symbols-outlined">arrow_forward</span>
            </button>
          </div>

          {/* Posts Container */}
          <div
            ref={scrollContainerRef}
            className="flex gap-6 overflow-x-auto hide-scrollbar snap-x snap-mandatory px-4 pb-14 pt-4"
          >
            {instagramPosts.map((post, index) => (
              <div key={post.id} className="min-w-[260px] md:min-w-[340px] aspect-[9/16] snap-center group relative rounded-2xl overflow-hidden bg-white shadow-xl transition-all duration-500 hover:scale-[1.02] hover:shadow-2xl border border-white/20 dark:border-white/5">

                {/* Embed Content - Usually an iframe, needs to be handled carefully to not block overlays if interaction isn't needed, but typically users want to interact. 
                    However, the requested UI has specific overlays. 
                    If we want the *exact* UI, we usually place overlays *over* the image. 
                    Since `embed_html` is a block of HTML (likely blockquote or iframe), applying purely visual overlays on top might block clicks. 
                */}
                <div className="w-full h-full bg-gray-100 relative">
                  <div dangerouslySetInnerHTML={{ __html: post.embed_html }} className="w-full h-full [&_blockquote]:!m-0 [&_iframe]:!w-full [&_iframe]:!h-full [&_iframe]:!rounded-none" />

                  {/* Grainy Overlay (Visual Texture) */}
                  <div className="absolute inset-0 pointer-events-none opacity-15 mix-blend-overlay" style={{ backgroundImage: 'url(https://lh3.googleusercontent.com/aida-public/AB6AXuAx4W7ExAv0s6xQ8lUpB0moDiWtv-lrMd0QGJxoJtiRGRgDwcka7SQ_APH3NYWT0JIEjoqFQfnM9rKElyZrB2N8CDy5dEMlB5ZAgWmc6pgmh0qcWvWwZxBj_05cDzlIvrQtnmTa6BIqKgtlhkWa4W6TeZ3QXwzrJLY_vfybaW3eS2sd0J9zD1xpvi-6wmZIit-QlhwaF8KeZD2kTYYNt7bQHaD860RCNGBaAuUW2gF3xH_UtseFXLrITtTKum33xONB7qPKHDhJvFug)' }}></div>
                </div>

                {/* Gradient Gradient */}
                <div className="absolute inset-0 bg-gradient-to-t from-shadow-black/90 via-transparent to-transparent opacity-70 pointer-events-none"></div>

                {/* Sharingan Hover Effect */}
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <div className="w-20 h-20 border-4 border-primary rounded-full flex items-center justify-center animate-spin">
                    <div className="w-12 h-12 bg-primary rounded-full opacity-50 flex items-center justify-center">
                      <span className="material-symbols-outlined text-white text-2xl">emergency</span>
                    </div>
                  </div>
                </div>

                {/* Bottom Content */}
                <div className="absolute bottom-0 left-0 right-0 p-6 flex flex-col gap-3 z-10">
                  <div className="flex items-center gap-2">
                    <span className="text-white font-bold text-sm tracking-tight">@paridhanhaat</span>
                    <span className="material-symbols-outlined text-storm-blue text-[14px] fill-current">verified</span>
                  </div>
                  <button className="w-full py-2.5 bg-white/10 backdrop-blur-md border border-white/20 text-white rounded-full text-[10px] font-bold uppercase tracking-widest hover:bg-white hover:text-shadow-black transition-all">
                    View Post
                  </button>
                </div>

                {/* Link Overlay for full card clickability if needed, or just let button work */}
                <a href="https://www.instagram.com/paridhanhaat" target="_blank" rel="noopener noreferrer" className="absolute inset-0 z-0"></a>
              </div>
            ))}
          </div>

          <div className="pb-10 flex justify-center opacity-10 select-none mt-4">
            <span className="material-symbols-outlined text-6xl">cyclone</span>
          </div>
        </div>

        {/* Join The Clan Banner */}
        <div className="max-w-[1200px] mx-auto px-6 pb-16 mt-8">
          <div className="bg-white dark:bg-shadow-black/40 rounded-full p-4 md:px-10 md:py-6 shadow-xl border border-primary/10 flex flex-col md:flex-row items-center justify-between gap-6 group">
            <div className="flex flex-col text-center md:text-left">
              <h3 className="text-xl md:text-2xl font-heading tracking-tight italic uppercase">Join the Uchiha Clan</h3>
              <p className="text-xs opacity-60 font-medium">Stay updated with latest secret drops.</p>
            </div>
            <button className="relative group/btn flex min-w-[240px] cursor-pointer items-center justify-center overflow-hidden rounded-full h-12 px-8 bg-primary text-white text-sm font-bold transition-transform duration-300 hover:scale-105 active:scale-95 shadow-lg">
              <span className="flex items-center gap-3 relative z-10">
                <span className="material-symbols-outlined text-lg">add_circle</span>
                Follow @paridhanhaat
              </span>
              <div className="absolute inset-0 bg-white/20 translate-y-full group-hover/btn:translate-y-0 transition-transform duration-300"></div>
            </button>
          </div>
        </div>

      </div>
    </section>
  );
};

export default InstagramCarousel;