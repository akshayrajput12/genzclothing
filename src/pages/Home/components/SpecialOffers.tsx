import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, ChevronRight, Tag, Copy, Clock, ArrowRight } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import heroEthnic from '@/assets/hero_ethnic.png';

const SpecialOffers = () => {
  const navigate = useNavigate();
  const [coupons, setCoupons] = useState([]);
  const [currentCouponIndex, setCurrentCouponIndex] = useState(0);

  useEffect(() => {
    fetchCoupons();
  }, []);

  // Auto-rotate coupons every 4 seconds
  useEffect(() => {
    if (coupons.length > 1) {
      const interval = setInterval(() => {
        setCurrentCouponIndex(prev => (prev + 1) % coupons.length);
      }, 4000);
      return () => clearInterval(interval);
    }
  }, [coupons.length]);

  const fetchCoupons = async () => {
    try {
      const { data, error } = await supabase
        .from('coupons')
        .select('*')
        .eq('is_active', true)
        .gte('valid_until', new Date().toISOString())
        .order('created_at', { ascending: false })
        .limit(5);

      if (error) throw error;
      setCoupons(data || []);
    } catch (error) {
      console.error('Error fetching coupons:', error);
    }
  };

  const copyToClipboard = (code: string) => {
    navigator.clipboard.writeText(code);
    // You could add a toast notification here
  };

  const nextCoupon = () => {
    setCurrentCouponIndex(prev => (prev + 1) % coupons.length);
  };

  const prevCoupon = () => {
    setCurrentCouponIndex(prev => (prev - 1 + coupons.length) % coupons.length);
  };

  return (
    <section className="py-12">
      {/* Added max-width container with proper padding and margins */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        {/* Improved responsive font sizing */}
        <motion.div
          className="text-center mb-10"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          {/* Improved responsive font sizing */}
          <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900 mb-4 font-raleway">
            Exclusive{' '}
            <span className="text-destructive">Fashion Deals</span>
          </h2>

          {/* Improved responsive font sizing */}
          <p className="text-base sm:text-lg text-gray-600 max-w-2xl mx-auto leading-relaxed font-raleway">
            Don't miss out on these amazing deals! Save big on our premium clothing collection.
          </p>
        </motion.div>

        {/* Dynamic Promotional Banner with Coupon Carousel */}
        <motion.div
          className="relative rounded-2xl p-6 md:p-8 text-center shadow-xl overflow-hidden"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.3 }}
          whileHover={{
            scale: 1.02,
            transition: { duration: 0.3 }
          }}
        >
          {/* Background Image - using the hero image from assets */}
          <div className="absolute inset-0 z-0">
            <div className="absolute inset-0 bg-black/40 z-10"></div>
            <img
              src={heroEthnic}
              alt="Sweet Deals Background"
              className="w-full h-full object-cover"
            />
          </div>

          <div className="relative z-20">
            {/* Dynamic Coupon Carousel */}
            {coupons.length > 0 ? (
              <div className="mb-8">
                <div className="flex items-center justify-center gap-4 mb-6">
                  {coupons.length > 1 && (
                    <motion.button
                      onClick={prevCoupon}
                      className="p-2 bg-white/80 hover:bg-white text-gray-800 rounded-full transition-colors shadow-md"
                      whileHover={{
                        scale: 1.1,
                        rotate: -10,
                        borderRadius: "12px",
                        transition: { duration: 0.3 }
                      }}
                      whileTap={{ scale: 0.9 }}
                    >
                      <ChevronLeft className="w-5 h-5" />
                    </motion.button>
                  )}

                  <motion.div
                    key={currentCouponIndex}
                    className="bg-white/90 backdrop-blur-sm px-6 py-4 rounded-xl min-w-72 font-raleway shadow-lg"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.3 }}
                    whileHover={{
                      scale: 1.03,
                      borderRadius: "16px",
                      boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.2), 0 10px 10px -5px rgba(0, 0, 0, 0.1)",
                      transition: { duration: 0.3 }
                    }}
                  >
                    <div className="flex items-center justify-center space-x-3 mb-2">
                      <Tag className="w-5 h-5 text-destructive" />
                      {/* Improved responsive font sizing */}
                      <span className="font-bold text-xl sm:text-2xl text-gray-900 font-raleway">{coupons[currentCouponIndex]?.code}</span>
                      <motion.button
                        onClick={() => copyToClipboard(coupons[currentCouponIndex]?.code)}
                        className="p-1 hover:bg-gray-100 rounded transition-colors"
                        title="Copy code"
                        whileHover={{
                          scale: 1.1,
                          rotate: 5,
                          transition: { duration: 0.2 }
                        }}
                        whileTap={{ scale: 0.9 }}
                      >
                        <Copy className="w-4 h-4 text-gray-600" />
                      </motion.button>
                    </div>
                    {/* Improved responsive font sizing */}
                    <p className="text-base sm:text-lg text-gray-700 mb-2 font-raleway">{coupons[currentCouponIndex]?.description}</p>
                    <div className="flex items-center justify-center space-x-2 text-sm text-gray-500 font-raleway">
                      <Clock className="w-3 h-3" />
                      <span>Valid until {new Date(coupons[currentCouponIndex]?.valid_until).toLocaleDateString()}</span>
                    </div>
                  </motion.div>

                  {coupons.length > 1 && (
                    <motion.button
                      onClick={nextCoupon}
                      className="p-2 bg-white/80 hover:bg-white text-gray-800 rounded-full transition-colors shadow-md"
                      whileHover={{
                        scale: 1.1,
                        rotate: 10,
                        borderRadius: "12px",
                        transition: { duration: 0.3 }
                      }}
                      whileTap={{ scale: 0.9 }}
                    >
                      <ChevronRight className="w-5 h-5" />
                    </motion.button>
                  )}
                </div>

                {/* Coupon Indicators */}
                {coupons.length > 1 && (
                  <div className="flex justify-center space-x-2 mb-6">
                    {coupons.map((_, index) => (
                      <motion.button
                        key={index}
                        onClick={() => setCurrentCouponIndex(index)}
                        className={`w-2 h-2 sm:w-3 sm:h-3 rounded-full transition-all ${index === currentCouponIndex ? 'bg-destructive scale-125' : 'bg-gray-300'
                          }`}
                        whileHover={{
                          scale: 1.5,
                          borderRadius: "50%",
                          transition: { duration: 0.2 }
                        }}
                        whileTap={{ scale: 0.8 }}
                      />
                    ))}
                  </div>
                )}
              </div>
            ) : (
              <div className="mb-6">
                {/* Improved responsive font sizing */}
                <h3 className="text-xl sm:text-2xl md:text-3xl font-bold mb-3 text-white font-raleway">
                  Amazing Fashion Deals Coming Soon!
                </h3>
                {/* Improved responsive font sizing */}
                <p className="text-base sm:text-lg text-white/90 font-raleway">
                  Stay tuned for exclusive offers on our latest collection.
                </p>
              </div>
            )}

            <motion.button
              onClick={() => navigate('/products')}
              className="bg-white text-primary hover:bg-gray-100 px-8 py-3 rounded-xl font-semibold text-base transition-colors shadow-lg font-raleway"
              whileHover={{
                scale: 1.05,
                borderRadius: "12px",
                boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.2), 0 4px 6px -2px rgba(0, 0, 0, 0.1)",
                transition: { duration: 0.3 }
              }}
              whileTap={{ scale: 0.95 }}
            >
              <div className="flex items-center justify-center">
                Shop Now & Save
                <ArrowRight className="w-4 h-4 ml-2" />
              </div>
            </motion.button>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default SpecialOffers;