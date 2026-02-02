import React from 'react';
import Hero from './components/Hero'; // Updated Hero Component
import CategoriesCarousel from './components/CategoriesCarousel';
import BestSellers from './components/BestSellers';
import NewArrivals from './components/NewArrivals';
import InstagramCarousel from './components/InstagramCarousel';
import PromotionalBanner from './components/PromotionalBanner';
import Testimonials from '@/components/ui/testimonials';

// Import Assets for Banners
import animeImg1 from '@/assets/leaf_village.png'; // Please rename generated file to this or update path
import animeImg2 from '@/assets/akatsuki.png'; // Please rename generated file to this or update path

const Home = () => {
  return (
    <main className="min-h-screen bg-background relative">
      {/* Parallax Hero Wrapper - Sticky only on Desktop to prevent mobile scrolling issues */}
      <div className="sticky top-0 z-0 h-screen w-full">
        <Hero />
      </div>

      <div className="flex flex-col w-full space-y-0 relative z-10 bg-background">
        {/* Best Sellers Section - Priority 1 for Sales */}
        <BestSellers />



        {/* New Arrivals Section - Priority 2 for Freshness */}
        <NewArrivals />
        {/* Categories Section - Exploration */}
        <CategoriesCarousel />

        {/* Second Promotional Banner: Anime Theme - Secondary Hook */}
        <PromotionalBanner
          image={animeImg1}
          subtitle="Shinobi SZN"
          title="Hidden Leaf"
          description="Explore the latest drop inspired by the hidden villages. Techwear meets traditional ninja aesthetics. Believe it."
          ctaText="Enter Village"
          link="/products?category=anime"
          align="right"
        />


        <Testimonials />
        {/* First Promotional Banner: Akatsuki - Hook */}
        <PromotionalBanner
          image={animeImg2}
          subtitle="Rogue Collection"
          title="Akatsuki Rising"
          description="Dark, moody, and powerful. Embrace the dawn with our premium Akatsuki-themed streetwear line."
          ctaText="Join the Clouds"
          link="/products?category=akatsuki"
          align="left"
        />
        <InstagramCarousel />
      </div>
    </main>

  );
};

export default Home;