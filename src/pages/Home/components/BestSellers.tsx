
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useStore } from '../../../store/useStore';
import { supabase } from '@/integrations/supabase/client';
import QuickViewModal from '../../../components/QuickViewModal';
import ProductCard from '../../../components/ProductCard';
import { formatPrice } from '../../../utils/currency';

const BestSellers = () => {
  const navigate = useNavigate();
  const { addToCart } = useStore();
  const [bestSellers, setBestSellers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [quickViewProduct, setQuickViewProduct] = useState<any | null>(null);
  const [isQuickViewOpen, setIsQuickViewOpen] = useState(false);

  // Carousel State
  const [currentIndex, setCurrentIndex] = useState(0);
  const [itemsPerView, setItemsPerView] = useState(4);
  const [autoScroll, setAutoScroll] = useState(true);
  const [lastManualAction, setLastManualAction] = useState(0);

  useEffect(() => {
    fetchBestSellers();
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handleResize = () => {
    if (window.innerWidth < 640) {
      setItemsPerView(1);
    } else if (window.innerWidth < 1024) {
      setItemsPerView(2);
    } else if (window.innerWidth < 1280) {
      setItemsPerView(3);
    } else {
      setItemsPerView(4);
    }
  };

  const fetchBestSellers = async () => {
    try {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('is_bestseller', true)
        .eq('is_active', true)
        .limit(10); // increased limit to make carousel meaningful

      if (error) throw error;
      setBestSellers(data || []);
    } catch (error) {
      console.error('Error fetching bestsellers:', error);
    } finally {
      setLoading(false);
    }
  };

  // Carousel Logic
  useEffect(() => {
    if (bestSellers.length > itemsPerView && autoScroll) {
      const interval = setInterval(() => {
        // Pause auto-scroll for 10 seconds after manual action
        if (Date.now() - lastManualAction < 10000) return;

        setCurrentIndex(prev => {
          const maxIndex = bestSellers.length - itemsPerView;
          return prev >= maxIndex ? 0 : prev + 1;
        });
      }, 5000);

      return () => clearInterval(interval);
    }
  }, [bestSellers, itemsPerView, autoScroll, lastManualAction]);

  const nextSlide = () => {
    if (currentIndex < bestSellers.length - itemsPerView) {
      setCurrentIndex(currentIndex + 1);
      setLastManualAction(Date.now());
    } else {
      // Loop back to start
      setCurrentIndex(0);
      setLastManualAction(Date.now());
    }
  };

  const prevSlide = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
      setLastManualAction(Date.now());
    } else {
      // Loop to end
      setCurrentIndex(Math.max(0, bestSellers.length - itemsPerView));
      setLastManualAction(Date.now());
    }
  };

  // Touch/swipe support
  const [touchStart, setTouchStart] = useState(0);
  const [touchEnd, setTouchEnd] = useState(0);

  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStart(e.targetTouches[0].clientX);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const handleTouchEnd = () => {
    if (!touchStart || !touchEnd) return;

    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > 50;
    const isRightSwipe = distance < -50;

    if (isLeftSwipe) nextSlide();
    if (isRightSwipe) prevSlide();
  };


  const handleQuickView = (product: any) => {
    setQuickViewProduct(product);
    setIsQuickViewOpen(true);
  };

  const closeQuickView = () => {
    setIsQuickViewOpen(false);
    setQuickViewProduct(null);
  };

  const handleAddToCart = (e: React.MouseEvent, product: any) => {
    e.stopPropagation();
    const defaultSize = product.available_sizes?.[0] || 'Standard';
    addToCart({
      ...product,
      image: product.images?.[0] || product.image || '/placeholder.svg'
    } as any, defaultSize);
  };

  // Icons for the abstract background shapes
  const icons = ['cyclone', 'all_inclusive', 'cloud', 'token', 'bolt', 'shutter_speed', 'visibility', 'eco'];

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

        {/* Section Header with Controls */}
        <div className="mb-16 flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-gray-200 pb-8">
          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-2 mb-1">
              <span className="size-2 rounded-full bg-leaf-green animate-pulse"></span>
              <span className="text-xs font-mono font-bold tracking-widest text-leaf-green uppercase">Trending Now</span>
            </div>
            <h1 className="text-5xl md:text-7xl font-black tracking-tighter leading-[0.9] text-[#0B0B0F]">
              SHIPPUDEN<br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#0B0B0F] to-gray-400/50">COLLECTION</span>
            </h1>
          </div>

          <div className="flex items-center gap-4">
            {/* Text View All */}
            <div className="hidden md:block text-right mr-4">
              <p className="text-gray-500 text-sm font-normal leading-relaxed text-right mb-2">
                Premium anime streetwear designed for the modern shinobi.
              </p>
              <button
                onClick={() => navigate('/products')}
                className="text-xs font-bold uppercase tracking-widest hover:text-primary transition-colors border-b-2 border-transparent hover:border-primary pb-1"
              >
                View All Products
              </button>
            </div>

            {/* Arrows */}
            <div className="flex gap-2">
              <button
                onClick={prevSlide}
                className="w-12 h-12 flex items-center justify-center border border-gray-300 rounded-full hover:bg-black hover:text-white hover:border-black transition-all duration-300"
                aria-label="Previous Slide"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <button
                onClick={nextSlide}
                className="w-12 h-12 flex items-center justify-center border border-gray-300 rounded-full hover:bg-black hover:text-white hover:border-black transition-all duration-300"
                aria-label="Next Slide"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>

        {/* Product Carousel Container */}
        <div
          className="relative overflow-visible" // Allow shadows to overflow nicely
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
        >
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="aspect-[4/5] bg-gray-100 rounded-3xl animate-pulse"></div>
              ))}
            </div>
          ) : (
            <div className="overflow-hidden -mx-4 px-4 py-8"> {/* Negative margin to accommodate shadow/scale effects */}
              <div
                className="flex transition-transform duration-700 ease-out"
                style={{
                  transform: `translateX(-${currentIndex * (100 / itemsPerView)}%)`,
                }}
              >
                {bestSellers.map((product, index) => {
                  const icon = icons[index % icons.length];

                  return (
                    <div
                      key={product.id}
                      className="flex-shrink-0 px-4"
                      style={{ width: `${100 / itemsPerView}%` }}
                    >
                      <ProductCard
                        product={{
                          ...product,
                          image: product.images?.[0] || product.image || '/placeholder.svg',
                          slug: product.sku || product.id
                        }}
                        icon={icon}
                        index={index}
                        onQuickView={() => handleQuickView(product)}
                        onViewDetail={() => navigate(`/product/${product.sku || product.id}`)}
                      />
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Mobile View All Button (visible only on small screens below controls) */}
        <div className="md:hidden mt-8 text-center">
          <button
            onClick={() => navigate('/products')}
            className="px-8 py-3 bg-black text-white rounded-full text-xs font-bold uppercase tracking-widest shadow-lg"
          >
            View All Products
          </button>
        </div>
      </div>

      {/* Quick View Modal */}
      {isQuickViewOpen && quickViewProduct && (
        <QuickViewModal
          product={quickViewProduct}
          isOpen={isQuickViewOpen}
          onClose={closeQuickView}
        />
      )}
    </section>
  );
};

export default BestSellers;