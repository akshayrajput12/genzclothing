import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, ChevronRight, Sparkles, ArrowRight, Shirt } from 'lucide-react';
import ProductCard from '../../../components/ProductCard';
import QuickViewModal from '../../../components/QuickViewModal';
import { supabase } from '@/integrations/supabase/client';

interface Product {
  id: string;
  name: string;
  price: number;
  originalPrice?: number;
  image?: string;
  images?: string[];
  category: string;
  weight?: string;
  pieces?: string;
  description?: string;
  stock_quantity?: number;
  slug: string;
  inStock: boolean;
  isBestSeller: boolean;
  [key: string]: any;
}

const NewArrivals = () => {
  const navigate = useNavigate();
  const [newArrivals, setNewArrivals] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [itemsPerView, setItemsPerView] = useState(4);
  const [quickViewProduct, setQuickViewProduct] = useState<Product | null>(null);
  const [isQuickViewOpen, setIsQuickViewOpen] = useState(false);

  useEffect(() => {
    fetchNewArrivals();
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Auto-scroll carousel with manual override
  const [autoScroll, setAutoScroll] = useState(true);
  const [lastManualAction, setLastManualAction] = useState(0);

  useEffect(() => {
    if (newArrivals.length > itemsPerView && autoScroll) {
      const interval = setInterval(() => {
        // Pause auto-scroll for 10 seconds after manual action
        if (Date.now() - lastManualAction < 10000) return;

        setCurrentIndex(prev => {
          const maxIndex = newArrivals.length - itemsPerView;
          return prev >= maxIndex ? 0 : prev + 1;
        });
      }, 4500);

      return () => clearInterval(interval);
    }
  }, [newArrivals, itemsPerView, autoScroll, lastManualAction]);

  const handleResize = () => {
    if (window.innerWidth < 640) {
      setItemsPerView(1);
    } else if (window.innerWidth < 1024) {
      setItemsPerView(2);
    } else {
      setItemsPerView(4);
    }
  };


  const fetchNewArrivals = async () => {
    try {
      // First, get all products and then filter for new arrivals on the client side
      // This avoids the type issue with the missing new_arrival field in generated types
      const result = await supabase
        .from('products')
        .select('*')
        .eq('is_active', true)
        .order('created_at', { ascending: false })
        .limit(20); // Get more products to filter from

      if (result.error) throw result.error;

      // Filter for new arrivals on the client side and transform to Product interface
      const filteredProducts = (result.data || [])
        .filter((product: any) => product.new_arrival === true) // Filter for new arrivals
        .slice(0, 12) // Limit to 12 new arrivals
        .map((product: any) => ({
          id: product.id,
          name: product.name,
          price: product.price,
          originalPrice: product.original_price,
          image: product.images?.[0] || '/placeholder.svg',
          images: product.images,
          category: 'New Arrival',
          weight: product.weight,
          pieces: product.pieces,
          description: product.description,
          stock_quantity: product.stock_quantity,
          slug: product.id, // Use id as slug since sku might not exist
          inStock: product.stock_quantity !== undefined ? product.stock_quantity > 0 : true,
          isBestSeller: product.is_bestseller || false
        } as Product));

      setNewArrivals(filteredProducts);
    } catch (error) {
      console.error('Error fetching new arrivals:', error);
    } finally {
      setLoading(false);
    }
  };

  const nextSlide = () => {
    if (currentIndex < newArrivals.length - itemsPerView) {
      setCurrentIndex(currentIndex + 1);
      setLastManualAction(Date.now());
    }
  };

  const prevSlide = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
      setLastManualAction(Date.now());
    }
  };

  // Touch/swipe support for mobile
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

    if (isLeftSwipe && canGoNext) {
      nextSlide();
    }
    if (isRightSwipe && canGoPrev) {
      prevSlide();
    }
  };

  const canGoNext = currentIndex < newArrivals.length - itemsPerView;
  const canGoPrev = currentIndex > 0;

  const handleQuickView = (product: any) => {
    setQuickViewProduct({
      ...product,
      image: product.images?.[0] || '/placeholder.svg',
      slug: product.id
    });
    setIsQuickViewOpen(true);
  };

  const closeQuickView = () => {
    setIsQuickViewOpen(false);
    setQuickViewProduct(null);
  };

  // Function to handle navigation to product detail page
  const handleViewDetail = (product: any) => {
    const slug = product.sku || product.id;
    navigate(`/product/${slug}`);
  };

  if (newArrivals.length === 0 && !loading) {
    return null; // Don't show section if no new arrivals
  }

  return (
    <section className="py-12 md:py-16 bg-[#F8FAFC] relative overflow-hidden">
      {/* Grain Texture for Section Background */}
      <div className="absolute inset-0 opacity-[0.03] pointer-events-none" style={{ backgroundImage: `url("https://grainy-gradients.vercel.app/noise.svg")` }}></div>

      {/* Geometric Accents - Matching Hero Section */}
      <div className="absolute top-[-10%] left-[-10%] w-[30vw] h-[30vw] bg-orange-400/10 rounded-full blur-[90px] pointer-events-none mix-blend-multiply z-0"></div>
      <div className="absolute top-[-10%] right-[-10%] w-[40vw] h-[40vw] bg-leaf-green/10 rounded-full blur-[100px] pointer-events-none mix-blend-multiply z-0"></div>
      <div className="absolute bottom-[-10%] left-[-10%] w-[30vw] h-[30vw] bg-primary/10 rounded-full blur-[80px] pointer-events-none mix-blend-multiply z-0"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[30vw] h-[30vw] bg-orange-500/10 rounded-full blur-[90px] pointer-events-none mix-blend-multiply z-0"></div>

      <div className="max-w-[1600px] mx-auto px-6 lg:px-12 relative z-10">
        {/* Section Header with Controls */}
        <div className="mb-16 flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-gray-200 pb-8">
          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-2 mb-1">
              <span className="size-2 rounded-full bg-leaf-green animate-pulse"></span>
              <span className="text-xs font-mono font-bold tracking-widest text-leaf-green uppercase">Fresh Drop</span>
            </div>
            <h1 className="text-5xl md:text-7xl font-black tracking-tighter leading-[0.9] text-[#0B0B0F]">
              JUST <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#0B0B0F] to-gray-400/50">ARRIVED</span>
            </h1>
          </div>

          <div className="flex items-center gap-4">
            {/* Text View All */}
            <div className="hidden md:block text-right mr-4">
              <p className="text-gray-500 text-sm font-normal leading-relaxed text-right mb-2">
                Straight from the atelier. Be the first to cop.
              </p>
              <button
                onClick={() => navigate('/products?sort=newest')}
                className="text-xs font-bold uppercase tracking-widest hover:text-primary transition-colors border-b-2 border-transparent hover:border-primary pb-1"
              >
                See All Drops
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

        {/* Product Carousel */}
        <div
          className="relative overflow-visible"
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
        >
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {Array.from({ length: 4 }).map((_, index) => (
                <div key={index} className="aspect-[4/5] bg-gray-100 rounded-3xl animate-pulse">
                </div>
              ))}
            </div>
          ) : newArrivals.length > 0 ? (
            <div className="overflow-hidden -mx-4 px-4 py-8">
              <div
                className="flex transition-transform duration-700 ease-out"
                style={{
                  transform: `translateX(-${currentIndex * (100 / itemsPerView)}%)`,
                }}
              >
                {newArrivals.map((product, index) => (
                  <div
                    key={product.id}
                    className="flex-shrink-0 px-4"
                    style={{ width: `${100 / itemsPerView}%` }}
                  >
                    <ProductCard
                      product={{
                        ...product,
                        image: product.images?.[0] || '/placeholder.svg',
                        slug: product.id
                      }}
                      index={index}
                      icon="sparkles" // Different icon for New Arrivals
                      onQuickView={() => handleQuickView(product)}
                      onViewDetail={() => handleViewDetail(product)}
                    />
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="text-center py-20 border border-dashed border-gray-200 rounded-3xl">
              <Sparkles className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-gray-500 mb-2">No new drops yet</h3>
              <p className="text-gray-400">The artisans are crafting the next wave.</p>
            </div>
          )}
        </div>

        <div className="md:hidden mt-8 text-center">
          <button
            onClick={() => navigate('/products?sort=newest')}
            className="px-8 py-3 bg-black text-white rounded-full text-xs font-bold uppercase tracking-widest shadow-lg"
          >
            View All Drops
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

export default NewArrivals;