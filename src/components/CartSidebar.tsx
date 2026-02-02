import { useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useStore } from '../store/useStore';
import { useNavigate } from 'react-router-dom';
import { useSettings } from '../hooks/useSettings';
import { toNumber, formatCurrency, calculatePercentage, meetsThreshold } from '../utils/settingsHelpers';

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
    return null; // Or a subtle loader, but keeping it clean as per reference style preferences
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
        <div className="fixed inset-0 z-50">
          {/* Backdrop */}
          <motion.div
            className="absolute inset-0 bg-black/20 dark:bg-black/40 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={toggleCart}
          />

          {/* Sidebar */}
          <motion.div
            ref={sidebarRef}
            className="fixed top-0 right-0 h-full w-full max-w-md glass border-l border-white/20 dark:border-white/5 shadow-2xl flex flex-col bg-white/80 dark:bg-[#0a0a0a]/80 backdrop-blur-xl"
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
          >
            {/* Header */}
            <div className="p-6 border-b border-gray-200/50 dark:border-white/10 flex items-center justify-between">
              <h2 className="text-2xl font-display font-medium text-gray-900 dark:text-white">Your Cart</h2>
              <button
                onClick={toggleCart}
                className="p-2 hover:bg-black/5 dark:hover:bg-white/5 rounded-full transition-colors"
              >
                <span className="material-symbols-outlined text-gray-600 dark:text-gray-400">close</span>
              </button>
            </div>

            {/* Free Shipping Progress */}
            {freeDeliveryThreshold > 0 && (
              <div className="px-6 py-4 bg-gray-50/50 dark:bg-white/5 border-b border-gray-200/50 dark:border-white/10">
                <div className="flex justify-between items-end mb-2">
                  {progress < 100 ? (
                    <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      You're <span className="text-[#059669] font-bold">{formatCurrency(amountToFreeShipping, settings.currency_symbol)}</span> away from free shipping
                    </p>
                  ) : (
                    <p className="text-sm font-medium text-[#059669]">
                      You've unlocked <span className="font-bold">FREE SHIPPING</span>
                    </p>
                  )}
                  <span className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-tighter">{Math.round(progress)}%</span>
                </div>
                <div className="h-1.5 w-full bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-[#059669] rounded-full transition-all duration-1000"
                    style={{ width: `${progress}%` }}
                  ></div>
                </div>
              </div>
            )}

            {/* Cart Items */}
            <div className="flex-1 overflow-y-auto custom-scrollbar">
              {cartItems.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center p-8 text-center opacity-60">
                  <span className="material-symbols-outlined text-6xl mb-4">shopping_bag</span>
                  <p className="text-lg font-medium">Your bag is empty</p>
                  <p className="text-sm">Time to start shopping!</p>
                </div>
              ) : (
                <div className="p-6 space-y-6">
                  {cartItems.map((item) => (
                    <div key={`${item.id}-${item.selectedSize}`} className="flex gap-4 group animate-in slide-in-from-right-4 duration-500">
                      <div className="w-24 h-32 flex-shrink-0 bg-gray-100 dark:bg-zinc-800 rounded-lg overflow-hidden relative">
                        <img
                          src={item.image}
                          alt={item.name}
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                        />
                      </div>
                      <div className="flex-1 flex flex-col justify-between py-1">
                        <div>
                          <div className="flex justify-between items-start gap-2">
                            <h3 className="font-display text-lg text-gray-900 dark:text-white leading-tight line-clamp-2">{item.name}</h3>
                            <button
                              onClick={() => removeFromCart(item.id, item.selectedSize)}
                              className="text-gray-400 hover:text-red-500 transition-colors flex-shrink-0"
                            >
                              <span className="material-symbols-outlined text-sm">close</span>
                            </button>
                          </div>
                          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                            Size: {item.selectedSize || 'Standard'} • {formatCurrency(item.price, settings.currency_symbol)}
                          </p>
                        </div>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center border border-gray-200 dark:border-white/10 rounded-full px-2 py-1">
                            <button
                              onClick={() => updateQuantity(item.id, item.quantity - 1, item.selectedSize)}
                              className="p-1 hover:text-[#059669] transition-colors flex items-center disabled:opacity-30"
                              disabled={item.quantity <= 1}
                            >
                              <span className="material-symbols-outlined text-sm">remove</span>
                            </button>
                            <span className="px-3 text-sm font-medium text-gray-900 dark:text-white min-w-[1.5rem] text-center">{item.quantity}</span>
                            <button
                              onClick={() => updateQuantity(item.id, item.quantity + 1, item.selectedSize)}
                              className="p-1 hover:text-[#059669] transition-colors flex items-center"
                            >
                              <span className="material-symbols-outlined text-sm">add</span>
                            </button>
                          </div>
                          <p className="font-semibold text-gray-900 dark:text-white">
                            {formatCurrency(item.price * item.quantity, settings.currency_symbol)}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Footer */}
            {cartItems.length > 0 && (
              <div className="p-6 border-t border-gray-200 dark:border-white/10 space-y-4 bg-white/50 dark:bg-black/20 backdrop-blur-md">
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500 dark:text-gray-400">Subtotal ({cartItems.reduce((acc, i) => acc + i.quantity, 0)} items)</span>
                    <span className="font-medium text-gray-900 dark:text-white">{formatCurrency(subtotal, settings.currency_symbol)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500 dark:text-gray-400">Tax</span>
                    <span className="font-medium text-gray-900 dark:text-white">{formatCurrency(tax, settings.currency_symbol)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500 dark:text-gray-400">Delivery Fee</span>
                    <span className={`font-medium ${deliveryFee === 0 ? 'text-[#059669]' : 'text-gray-900 dark:text-white'}`}>
                      {deliveryFee === 0 ? 'Free' : formatCurrency(deliveryFee, settings.currency_symbol)}
                    </span>
                  </div>
                </div>
                <div className="pt-4 border-t border-gray-100 dark:border-white/5 flex justify-between items-center mb-6">
                  <span className="text-lg font-display font-semibold text-gray-900 dark:text-white">Total</span>
                  <span className="text-xl font-bold text-gray-900 dark:text-white">{formatCurrency(total, settings.currency_symbol)}</span>
                </div>

                <button
                  onClick={handleCheckout}
                  className="w-full bg-[#1a1a1a] hover:bg-gray-800 dark:bg-white dark:text-black dark:hover:bg-gray-200 text-white py-4 rounded-xl font-semibold tracking-wider transition-all transform active:scale-[0.98] shadow-lg flex items-center justify-center gap-2 group"
                >
                  PROCEED TO CHECKOUT
                  <span className="material-symbols-outlined group-hover:translate-x-1 transition-transform">arrow_forward</span>
                </button>
                <p className="text-center text-[10px] uppercase tracking-widest text-gray-400 dark:text-gray-500">
                  Secure Checkout powered by SSL
                </p>
              </div>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default CartSidebar;