import { useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useStore } from '../store/useStore';
import { useNavigate } from 'react-router-dom';
import { useSettings } from '../hooks/useSettings';
import { toNumber, formatCurrency, calculatePercentage } from '../utils/settingsHelpers';

interface CartSidebarProps {
  isAdminRoute?: boolean;
}

const CartSidebar: React.FC<CartSidebarProps> = ({ isAdminRoute = false }) => {
  const sidebarRef = useRef<HTMLDivElement>(null);

  const {
    cartItems,
    isCartOpen,
    toggleCart,
    updateQuantity,
    removeFromCart
  } = useStore();

  const navigate = useNavigate();
  const { settings, loading: settingsLoading } = useSettings();

  // Close sidebar on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (isCartOpen && sidebarRef.current && !sidebarRef.current.contains(event.target as Node)) {
        toggleCart();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isCartOpen, toggleCart]);

  // Don't render cart sidebar content for admin routes
  if (isAdminRoute) {
    return null;
  }

  if (settingsLoading) {
    return null;
  }

  // Calculations
  const subtotal = cartItems.reduce((total, item) => {
    const price = toNumber(item.price);
    const quantity = toNumber(item.quantity);
    return total + (price * quantity);
  }, 0);

  const tax = calculatePercentage(subtotal, settings.tax_rate);
  const freeDeliveryThreshold = toNumber(settings.free_delivery_threshold);
  const deliveryFee = (freeDeliveryThreshold > 0 && subtotal >= freeDeliveryThreshold)
    ? 0
    : toNumber(settings.delivery_charge);

  const total = subtotal + tax + deliveryFee;

  // Progress Bar Logic
  const progress = freeDeliveryThreshold > 0
    ? Math.min((subtotal / freeDeliveryThreshold) * 100, 100)
    : 100;

  const amountToFreeShipping = Math.max(freeDeliveryThreshold - subtotal, 0);

  const handleCheckout = () => {
    toggleCart();
    navigate('/cart');
  };

  return (
    <AnimatePresence>
      {isCartOpen && (
        <div className="fixed inset-0 z-50 flex justify-end">
          {/* Backdrop */}
          <motion.div
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={toggleCart}
          />

          {/* Sidebar */}
          <motion.div
            ref={sidebarRef}
            className="relative flex h-full w-full max-w-[480px] flex-col bg-[#F8FAFC] dark:bg-[#0B0B0F] border-l-4 border-primary shadow-2xl overflow-hidden grain-texture"
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
          >
            {/* Header */}
            <header className="flex items-center justify-between px-8 pt-10 pb-6">
              <div className="flex flex-col gap-1">
                <h2 className="text-[#0B0B0F] dark:text-white text-3xl font-display font-bold tracking-tighter uppercase leading-none">YOUR ARCHIVE</h2>
                <span className="text-primary text-xs font-bold tracking-[0.2em] uppercase">OBITO / SHINOBI GEAR</span>
              </div>
              <button
                onClick={toggleCart}
                className="size-10 flex items-center justify-center rounded-full bg-[#E7E5E4] hover:bg-[#D6D3D1] transition-colors"
              >
                <span className="material-symbols-outlined text-[#0B0B0F]">close</span>
              </button>
            </header>

            {/* Progress Bar Section (Chakra Levels) */}
            {freeDeliveryThreshold > 0 && (
              <div className="px-8 py-4">
                <div className="flex flex-col gap-3 p-5 rounded-2xl bg-white/50 border border-stone-100 chakra-glow">
                  <div className="flex gap-6 justify-between items-end">
                    <p className="text-[#0B0B0F] dark:text-white text-sm font-bold uppercase tracking-wide">Chakra Levels</p>
                    <p className="text-primary text-lg font-bold leading-none">{Math.round(progress)}%</p>
                  </div>
                  <div className="relative h-2 rounded-full bg-stone-200 overflow-hidden">
                    <div className="absolute inset-y-0 left-0 rounded-full bg-primary" style={{ width: `${progress}%` }}>
                      {/* Subtle chakra pulse simulation */}
                      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent w-1/2 -translate-x-full animate-[pulse_2s_infinite]"></div>
                    </div>
                  </div>
                  {progress < 100 ? (
                    <p className="text-stone-500 text-xs font-medium">
                      Add <span className="text-[#0B0B0F] dark:text-white font-bold">{formatCurrency(amountToFreeShipping, settings.currency_symbol)}</span> more for <span className="text-green-600 font-bold uppercase">Free Instant Transmission</span>
                    </p>
                  ) : (
                    <p className="text-green-600 text-xs font-bold uppercase">Mission Requirement Met: Free Delivery</p>
                  )}
                </div>
              </div>
            )}

            {/* Cart Items Scroll Area */}
            <div className="flex-1 overflow-y-auto px-8 py-4 space-y-6">
              {cartItems.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center opacity-60">
                  <span className="material-symbols-outlined text-6xl mb-4 text-[#0B0B0F]/20 dark:text-white/20">shopping_bag</span>
                  <p className="text-lg font-bold font-display text-[#0B0B0F] dark:text-white">Your archive is empty.</p>
                  <p className="text-sm font-medium text-stone-500 uppercase tracking-widest mt-2">Acquire new equipment</p>
                </div>
              ) : (
                cartItems.map((item) => (
                  <div key={`${item.id}-${item.selectedSize}`} className="flex items-center gap-5 group">
                    <div className="relative shrink-0">
                      <div
                        className="bg-center bg-no-repeat aspect-square bg-cover rounded-xl size-24 border border-stone-100 chakra-glow bg-gray-100 dark:bg-gray-800"
                        style={{ backgroundImage: item.image ? `url("${item.image}")` : 'none' }}
                      >
                        {!item.image && <div className="w-full h-full flex items-center justify-center text-xs font-bold text-gray-400">NO IMG</div>}
                      </div>
                      <div className="absolute -top-1 -right-1 size-6 bg-white rounded-full flex items-center justify-center border border-primary/20 shadow-sm">
                        <span className="material-symbols-outlined text-[14px] text-primary fill-1">adjust</span>
                      </div>
                    </div>

                    <div className="flex flex-col flex-1 justify-center gap-1">
                      <div className="flex justify-between items-start">
                        <p className="text-[#0B0B0F] dark:text-white text-lg font-bold leading-tight font-display line-clamp-1">{item.name}</p>
                        <span className="text-[#0B0B0F] dark:text-white font-bold">{formatCurrency(item.price * item.quantity, settings.currency_symbol)}</span>
                      </div>
                      <p className="text-stone-500 text-xs font-medium uppercase tracking-wider">
                        Size: {item.selectedSize || 'Std'} | Unit: {formatCurrency(item.price, settings.currency_symbol)}
                      </p>

                      <div className="flex items-center justify-between mt-2">
                        <div className="flex items-center gap-3">
                          <button
                            onClick={() => updateQuantity(item.id, item.quantity - 1, item.selectedSize)}
                            disabled={item.quantity <= 1}
                            className="size-7 flex items-center justify-center rounded-full bg-[#0B0B0F] text-white hover:bg-primary transition-colors disabled:opacity-50"
                          >
                            <span className="material-symbols-outlined text-sm">remove</span>
                          </button>
                          <span className="text-[#0B0B0F] dark:text-white font-bold text-sm w-4 text-center">{item.quantity}</span>
                          <button
                            onClick={() => updateQuantity(item.id, item.quantity + 1, item.selectedSize)}
                            className="size-7 flex items-center justify-center rounded-full bg-[#0B0B0F] text-white hover:bg-primary transition-colors"
                          >
                            <span className="material-symbols-outlined text-sm">add</span>
                          </button>
                        </div>
                        <button
                          onClick={() => removeFromCart(item.id, item.selectedSize)}
                          className="text-stone-400 hover:text-red-500 transition-colors"
                        >
                          <span className="material-symbols-outlined text-xl">delete</span>
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Sidebar Footer */}
            {cartItems.length > 0 && (
              <footer className="bg-white dark:bg-[#0B0B0F] p-8 border-t border-stone-100 dark:border-white/10">
                <div className="space-y-3 mb-8">
                  <div className="flex justify-between text-stone-500 text-sm font-medium uppercase tracking-widest">
                    <span>Subtotal</span>
                    <span className="text-[#0B0B0F] dark:text-white font-bold">{formatCurrency(subtotal, settings.currency_symbol)}</span>
                  </div>
                  <div className="flex justify-between text-stone-500 text-sm font-medium uppercase tracking-widest">
                    <span>Shipping</span>
                    <span className={`font-bold ${deliveryFee === 0 ? 'text-green-600' : 'text-[#0B0B0F] dark:text-white'}`}>
                      {deliveryFee === 0 ? 'Free Instant Transmission' : formatCurrency(deliveryFee, settings.currency_symbol)}
                    </span>
                  </div>
                  <div className="pt-4 flex justify-between items-center border-t border-stone-100 dark:border-white/10">
                    <span className="text-[#0B0B0F] dark:text-white text-xl font-bold uppercase font-display">Total ARCHIVE</span>
                    <span className="text-primary text-2xl font-bold tracking-tighter">{formatCurrency(total, settings.currency_symbol)}</span>
                  </div>
                </div>

                <button
                  onClick={handleCheckout}
                  className="w-full bg-primary hover:bg-primary/90 text-white rounded-full py-6 px-8 flex items-center justify-between group transition-all transform active:scale-[0.98] btn-summon relative overflow-hidden"
                >
                  <div className="summon-particles"></div>
                  {/* Summoning Circle SVG */}
                  <svg className="circle-svg absolute inset-0 w-full h-full text-white/20" viewBox="0 0 100 100">
                    <circle cx="50" cy="50" r="45" fill="none" stroke="currentColor" strokeWidth="1" strokeDasharray="5,5" />
                    <circle cx="50" cy="50" r="35" fill="none" stroke="currentColor" strokeWidth="0.5" />
                    <path d="M50 5 L95 95 L5 95 Z" fill="none" stroke="currentColor" strokeWidth="0.5" transform="rotate(180 50 50)" />
                    <path d="M50 5 L95 95 L5 95 Z" fill="none" stroke="currentColor" strokeWidth="0.5" />
                  </svg>

                  <span className="text-xl font-bold uppercase tracking-tighter font-display relative z-10">Proceed to Checkout</span>
                  <div className="flex items-center gap-2 relative z-10">
                    <span className="h-[1px] w-8 bg-white/40 group-hover:w-12 transition-all"></span>
                    <span className="material-symbols-outlined">arrow_forward</span>
                  </div>
                </button>
                <p className="text-center text-[10px] text-stone-400 mt-6 uppercase tracking-[0.3em]">
                  SECURE NINJA ENCRYPTION ENABLED
                </p>
              </footer>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default CartSidebar;