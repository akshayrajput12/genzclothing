import { Link, useNavigate } from 'react-router-dom';
import { useStore } from '@/store/useStore';
import { formatCurrency } from '@/utils/settingsHelpers';
import { useSettings } from '@/hooks/useSettings';
import { toNumber, calculatePercentage } from '@/utils/settingsHelpers';
import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import ProductCard from '@/components/ProductCard';

const Cart = () => {
  const { cartItems, updateQuantity, removeFromCart } = useStore();
  const { settings, loading: settingsLoading } = useSettings();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [recommendations, setRecommendations] = useState<any[]>([]);

  // Fetch random recommendations
  useEffect(() => {
    const fetchRecommendations = async () => {
      try {
        const { data } = await supabase
          .from('products')
          .select('*')
          .limit(4);

        // In a real app we might randomize this, but for now taking the first 4 is fine
        if (data) setRecommendations(data);
      } catch (error) {
        console.error('Error fetching recommendations:', error);
      }
    };
    fetchRecommendations();
  }, []);

  if (settingsLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F9F9F7] dark:bg-[#0B0B0F]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  // Calculations
  const subtotal = cartItems.reduce((sum, item) => sum + (toNumber(item.price) * toNumber(item.quantity)), 0);
  const tax = calculatePercentage(subtotal, settings.tax_rate);
  const freeDeliveryThreshold = toNumber(settings.free_delivery_threshold);

  const deliveryFee = (freeDeliveryThreshold > 0 && subtotal >= freeDeliveryThreshold)
    ? 0
    : toNumber(settings.delivery_charge);

  const total = subtotal + tax + deliveryFee;

  // Free Shipping Progress Logic
  const progress = freeDeliveryThreshold > 0
    ? Math.min((subtotal / freeDeliveryThreshold) * 100, 100)
    : 100;

  const minOrderAmount = toNumber(settings.min_order_amount);
  const isMinOrderMet = subtotal >= minOrderAmount;

  return (
    <div className="bg-[#F8FAFC] dark:bg-[#0B0B0F] font-spline selection:bg-primary/30 min-h-screen flex flex-col relative w-full overflow-x-hidden">
      {/* Background Texture */}
      <div className="fixed inset-0 manga-texture pointer-events-none z-0 opacity-10"></div>

      <div className="layout-container flex h-full grow flex-col relative z-10 max-w-[1440px] mx-auto w-full">

        {/* Header Removed as per request */}

        <main className="w-full px-6 py-12 flex flex-col gap-10">
          {/* Page Heading */}
          <div className="flex flex-col gap-2">
            <h1 className="text-[#0B0B0F] dark:text-[#F8FAFC] text-6xl md:text-9xl font-bebas italic tracking-tighter leading-none">
              SHOPPING BAG
            </h1>
            <div className="flex items-center gap-4">
              <div className="h-1 w-24 bg-primary rounded-full"></div>
              <p className="text-[#0B0B0F]/60 dark:text-[#F8FAFC]/60 text-lg font-medium">Ready to deploy your ninja gear?</p>
            </div>
          </div>

          {cartItems.length === 0 ? (
            <div className="min-h-[40vh] flex flex-col items-center justify-center text-center border-2 border-dashed border-[#0B0B0F]/10 dark:border-[#F8FAFC]/10 rounded-3xl bg-white/50 dark:bg-black/20 p-12">
              <span className="material-symbols-outlined text-6xl text-[#0B0B0F]/20 dark:text-[#F8FAFC]/20 mb-4">shopping_bag</span>
              <h2 className="font-bebas text-3xl text-[#0B0B0F] dark:text-[#F8FAFC] mb-2">EMPTY CART</h2>
              <p className="text-[#0B0B0F]/60 dark:text-[#F8FAFC]/60 mb-8 max-w-md">Your inventory is currently empty. Visit the armory to restock on supplies.</p>
              <Link to="/products" className="bg-primary hover:bg-[#0B0B0F] text-white px-8 py-4 font-bebas text-xl tracking-widest transition-colors shadow-lg shadow-primary/20">
                VISIT ARMORY
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
              {/* Main Section: Cart Items */}
              <div className="lg:col-span-8 flex flex-col gap-6">
                {cartItems.map((item) => (
                  <div key={`${item.id}-${item.selectedSize}`} className="flex flex-col md:flex-row gap-6 p-4 rounded-xl border border-[#0B0B0F]/5 dark:border-[#F8FAFC]/10 bg-white dark:bg-[#0B0B0F]/60 shadow-sm hover:shadow-md transition-shadow">
                    <div className="relative group">
                      <div
                        className="size-32 rounded-lg bg-center bg-cover border-2 border-primary/20 shadow-[0_0_15px_rgba(249,115,22,0.15)] flex items-center justify-center bg-gray-100 dark:bg-gray-800 font-bebas text-gray-400"
                        style={{ backgroundImage: item.image ? `url('${item.image}')` : 'none' }}
                      >
                        {!item.image && <span>NO IMG</span>}
                      </div>

                      {/* Sharingan Icon Overlay */}
                      <div className="absolute -top-2 -right-2 size-8 bg-white dark:bg-[#0B0B0F] rounded-full p-1 shadow-lg border border-primary/20">
                        <span className="material-symbols-outlined text-primary text-xl animate-spin-slow">blur_circular</span>
                      </div>
                    </div>

                    <div className="flex flex-1 flex-col justify-between">
                      <div className="flex justify-between items-start">
                        <div>
                          <span className="text-[10px] font-black tracking-widest text-[#2563EB] uppercase">
                            {item.category || 'Gear'}
                          </span>
                          <h3 className="text-xl font-bold text-[#0B0B0F] dark:text-[#F8FAFC] font-display">{item.name}</h3>
                          <p className="text-sm text-[#0B0B0F]/50 dark:text-[#F8FAFC]/50 mt-1">
                            {item.selectedSize && `Size: ${item.selectedSize}`} {item.selectedSize && '|'} Unit Price: {formatCurrency(item.price, settings.currency_symbol)}
                          </p>
                        </div>
                        <p className="text-xl font-bebas text-[#0B0B0F] dark:text-[#F8FAFC] tracking-wide">
                          {formatCurrency(item.price * item.quantity, settings.currency_symbol)}
                        </p>
                      </div>

                      <div className="flex justify-between items-center mt-4">
                        <div className="flex items-center bg-[#0B0B0F] dark:bg-[#F8FAFC] rounded-full p-1 text-white dark:text-[#0B0B0F]">
                          <button
                            onClick={() => updateQuantity(item.id, Math.max(0, item.quantity - 1), item.selectedSize)}
                            className="size-8 flex items-center justify-center hover:bg-white/10 dark:hover:bg-black/10 rounded-full transition-colors"
                          >
                            <span className="material-symbols-outlined text-xs">remove</span>
                          </button>
                          <span className="px-4 text-xs font-bold">{item.quantity.toString().padStart(2, '0')}</span>
                          <button
                            onClick={() => updateQuantity(item.id, item.quantity + 1, item.selectedSize)}
                            className="size-8 flex items-center justify-center hover:bg-white/10 dark:hover:bg-black/10 rounded-full transition-colors"
                          >
                            <span className="material-symbols-outlined text-xs">add</span>
                          </button>
                        </div>

                        <button
                          onClick={() => removeFromCart(item.id, item.selectedSize)}
                          className="text-[#0B0B0F]/40 dark:text-[#F8FAFC]/40 hover:text-red-500 dark:hover:text-red-500 transition-colors flex items-center gap-1 group/delete"
                        >
                          <span className="text-[10px] font-bold uppercase tracking-widest opacity-0 group-hover/delete:opacity-100 transition-opacity">Discard</span>
                          <span className="material-symbols-outlined">delete</span>
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Right Sidebar: Order Intel */}
              <aside className="lg:col-span-4 flex flex-col gap-6">
                <div className="p-8 rounded-xl border border-white/40 dark:border-white/10 bg-white/60 dark:bg-black/40 backdrop-blur-xl shadow-xl flex flex-col gap-6 sticky top-28">
                  <div>
                    <h2 className="text-2xl font-bebas tracking-wider text-[#0B0B0F] dark:text-[#F8FAFC]">ORDER INTEL</h2>
                    <p className="text-[#0B0B0F]/60 dark:text-[#F8FAFC]/60 text-sm mt-1">Summary of your shinobi mission assets.</p>
                  </div>

                  <div className="flex flex-col gap-4 py-6 border-y border-[#0B0B0F]/5 dark:border-[#F8FAFC]/5">
                    <div className="flex justify-between text-sm font-medium">
                      <span className="text-[#0B0B0F]/60 dark:text-[#F8FAFC]/60">Subtotal</span>
                      <span className="text-[#0B0B0F] dark:text-[#F8FAFC] font-sans">{formatCurrency(subtotal, settings.currency_symbol)}</span>
                    </div>
                    {tax > 0 && (
                      <div className="flex justify-between text-sm font-medium">
                        <span className="text-[#0B0B0F]/60 dark:text-[#F8FAFC]/60">Tax ({settings.tax_rate}%)</span>
                        <span className="text-[#0B0B0F] dark:text-[#F8FAFC] font-sans">{formatCurrency(tax, settings.currency_symbol)}</span>
                      </div>
                    )}
                    <div className="flex justify-between text-sm font-medium">
                      <span className="text-[#0B0B0F]/60 dark:text-[#F8FAFC]/60">Estimated Shipping</span>
                      <span className={`font-bold ${deliveryFee === 0 ? 'text-[#2563EB]' : 'text-[#0B0B0F] dark:text-[#F8FAFC]'}`}>
                        {deliveryFee === 0 ? 'COMPLIMENTARY' : formatCurrency(deliveryFee, settings.currency_symbol)}
                      </span>
                    </div>
                  </div>

                  {/* Free Shipping Progress */}
                  {freeDeliveryThreshold > 0 && (
                    <div className="flex flex-col gap-2">
                      <div className="flex justify-between items-end">
                        <p className="text-[#0B0B0F] dark:text-[#F8FAFC] text-xs font-black uppercase tracking-widest">Free Shipping Progress</p>
                        <p className="text-primary text-xs font-black font-sans">{formatCurrency(subtotal, settings.currency_symbol)} / {formatCurrency(freeDeliveryThreshold, settings.currency_symbol)}</p>
                      </div>
                      <div className="h-1.5 w-full bg-primary/10 rounded-full overflow-hidden">
                        <div className="h-full bg-primary transition-all duration-700 ease-out" style={{ width: `${progress}%` }}></div>
                      </div>
                      {progress >= 100 && (
                        <p className="text-[#2563EB] text-[10px] font-bold uppercase flex items-center gap-1 animate-pulse">
                          <span className="material-symbols-outlined text-xs">verified</span> Mission Requirement Met
                        </p>
                      )}
                    </div>
                  )}

                  {!isMinOrderMet && (
                    <div className="p-3 bg-red-50 dark:bg-red-900/10 border border-red-100 dark:border-red-900/30 rounded text-center">
                      <p className="text-xs text-red-600 font-bold uppercase tracking-wide">
                        Minimum Order Required: {formatCurrency(minOrderAmount, settings.currency_symbol)}
                      </p>
                    </div>
                  )}

                  <div className="flex justify-between items-center py-2">
                    <span className="text-[#0B0B0F] dark:text-[#F8FAFC] font-bebas text-2xl">TOTAL</span>
                    <span className="text-[#0B0B0F] dark:text-[#F8FAFC] font-bebas text-4xl">{formatCurrency(total, settings.currency_symbol)}</span>
                  </div>

                  {/* Proceed to Checkout Button */}
                  <button
                    disabled={!isMinOrderMet}
                    onClick={() => navigate('/checkout')}
                    className="w-full bg-primary hover:bg-primary/90 text-white rounded-full py-5 flex items-center justify-center gap-3 transition-transform active:scale-95 shadow-lg shadow-primary/25 group disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none"
                  >
                    <span className="font-bebas text-2xl tracking-widest leading-none pt-1">PROCEED TO CHECKOUT</span>
                    <span className="material-symbols-outlined group-hover:translate-x-1 transition-transform">lock</span>
                  </button>

                  <div className="flex flex-col gap-4 mt-2">
                    <p className="text-center text-[10px] font-bold text-[#0B0B0F]/30 dark:text-[#F8FAFC]/30 tracking-widest uppercase">
                      Secure Transmission Guaranteed
                    </p>
                    <div className="flex justify-center gap-4 text-[#0B0B0F]/20 dark:text-[#F8FAFC]/20">
                      <span className="material-symbols-outlined">payments</span>
                      <span className="material-symbols-outlined">credit_card</span>
                      <span className="material-symbols-outlined">account_balance_wallet</span>
                    </div>
                  </div>
                </div>

                {/* Additional Promo/Help */}
                <div className="p-6 rounded-xl border border-dashed border-[#0B0B0F]/20 dark:border-[#F8FAFC]/20 flex flex-col gap-2 bg-transparent">
                  <p className="text-[#0B0B0F] dark:text-[#F8FAFC] font-bold text-sm">Need Tactical Support?</p>
                  <p className="text-[#0B0B0F]/50 dark:text-[#F8FAFC]/50 text-xs">Contact the village elders for assistance with your deployment gear.</p>
                  <Link to="/contact" className="text-primary text-xs font-black uppercase tracking-widest mt-2 flex items-center gap-1 group">
                    Open Scroll Support <span className="material-symbols-outlined text-sm group-hover:translate-x-1 transition-transform">arrow_forward</span>
                  </Link>
                </div>
              </aside>
            </div>
          )}

          {/* Recently Viewed / Recommendations */}
          {recommendations.length > 0 && (
            <section className="mt-12 flex flex-col gap-8">
              <h2 className="text-3xl font-bebas tracking-wide text-[#0B0B0F] dark:text-[#F8FAFC]">ESSENTIAL ADD-ONS</h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                {recommendations.map((product) => (
                  <ProductCard
                    key={product.id}
                    product={product}
                    onViewDetail={() => navigate(`/product/${product.slug || product.id}`)}
                  />
                ))}
              </div>
            </section>
          )}

        </main>

        {/* Footer Removed as per request */}
      </div>
    </div>
  );
};

export default Cart;