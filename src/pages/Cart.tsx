import { Link } from 'react-router-dom';
import { ArrowRight, Lock, CreditCard, ShieldCheck, Truck, Banknote } from 'lucide-react';
import { useStore } from '@/store/useStore';
import { formatPrice } from '@/utils/currency';
import { useSettings } from '@/hooks/useSettings';
import { toNumber, formatCurrency, calculatePercentage, meetsThreshold } from '@/utils/settingsHelpers';

const Cart = () => {
  const { cartItems, updateQuantity, removeFromCart } = useStore();
  const { settings, loading: settingsLoading } = useSettings();

  if (settingsLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F9F9F7] dark:bg-[#0F0F0F]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#1A1A1A] dark:border-white"></div>
      </div>
    );
  }

  // Calculations
  const subtotal = cartItems.reduce((sum, item) => sum + (toNumber(item.price) * toNumber(item.quantity)), 0);
  const tax = calculatePercentage(subtotal, settings.tax_rate);
  const freeDeliveryThreshold = toNumber(settings.free_delivery_threshold);

  // Logic: If threshold > 0 and subtotal >= threshold, fee is 0. Else use standard fee.
  const deliveryFee = (freeDeliveryThreshold > 0 && subtotal >= freeDeliveryThreshold)
    ? 0
    : toNumber(settings.delivery_charge);

  const total = subtotal + tax + deliveryFee;

  // Free Shipping Progress Logic
  const progress = freeDeliveryThreshold > 0
    ? Math.min((subtotal / freeDeliveryThreshold) * 100, 100)
    : 100;

  const amountToFreeShipping = Math.max(freeDeliveryThreshold - subtotal, 0);

  // Minimum Order Logic check
  const minOrderAmount = toNumber(settings.min_order_amount);
  const isMinOrderMet = subtotal >= minOrderAmount;

  if (cartItems.length === 0) {
    return (
      <div className="min-h-screen bg-[#F8F8F8] dark:bg-[#0F0F0F] flex flex-col items-center justify-center p-6 text-center">
        <span className="material-symbols-outlined text-6xl text-gray-300 mb-4">shopping_bag</span>
        <h1 className="font-display text-4xl mb-4 text-[#1A1A1A] dark:text-white">Your Bag is Empty</h1>
        <p className="text-gray-500 font-light mb-8">It seems you haven't discovered our latest collection yet.</p>
        <Link to="/products" className="px-8 py-4 bg-[#1A1A1A] text-white rounded-xl uppercase tracking-widest text-xs font-bold hover:shadow-lg transition-all">
          Start Shopping
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8F8F8] dark:bg-[#0F0F0F] text-gray-900 dark:text-gray-100 font-sans selection:bg-[#C5A059]/30">
      {/* Header */}
      <header className="w-full py-24 px-6 md:px-12 flex justify-between items-end border-b border-gray-200 dark:border-gray-800">
        <div>
          <h1 className="font-display text-5xl md:text-6xl tracking-tight text-[#1A1A1A] dark:text-white">Shopping Bag</h1>
          <p className="text-sm uppercase tracking-[0.2em] mt-3 text-gray-500 dark:text-gray-400 font-medium">
            {cartItems.reduce((acc, item) => acc + item.quantity, 0).toString().padStart(2, '0')} Items Selected
          </p>
        </div>
        <Link
          to="/products"
          className="hidden md:flex items-center gap-2 group text-sm uppercase tracking-widest font-semibold pb-1 border-b border-transparent hover:border-[#1A1A1A] dark:hover:border-white transition-all text-[#1A1A1A] dark:text-white"
        >
          Continue Shopping
          <span className="material-symbols-outlined text-sm group-hover:translate-x-1 transition-transform">east</span>
        </Link>
      </header>

      <main className="max-w-[1400px] mx-auto p-6 md:p-12 lg:flex gap-16">
        {/* Cart Items Section */}
        <div className="lg:w-2/3 space-y-12">
          {cartItems.map((item) => (
            <div key={`${item.id}-${item.selectedSize}`} className="flex flex-col md:flex-row gap-8 pb-12 border-b border-gray-100 dark:border-gray-800 group">
              <div className="w-full md:w-72 aspect-[3/4] overflow-hidden rounded-xl bg-gray-100 dark:bg-gray-900 relative">
                <img
                  src={item.image}
                  alt={item.name}
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                />
                <div className="absolute top-4 left-4 bg-white/90 dark:bg-black/80 px-3 py-1 text-[10px] uppercase tracking-widest font-bold backdrop-blur-sm shadow-sm text-[#1A1A1A] dark:text-white border border-gray-100 dark:border-gray-800">
                  In Stock
                </div>
              </div>

              <div className="flex-1 flex flex-col justify-between py-2 space-y-6">
                <div className="flex justify-between items-start gap-4">
                  <div>
                    <h2 className="font-display text-2xl md:text-3xl mb-2 text-[#1A1A1A] dark:text-white leading-tight">{item.name}</h2>
                    <div className="flex flex-wrap items-center gap-4 text-gray-500 dark:text-gray-400 text-sm">
                      {item.selectedSize && (
                        <span className="flex items-center gap-1">
                          <span className="font-semibold uppercase text-xs tracking-tighter text-gray-400">Size</span>
                          <span className="font-medium text-gray-900 dark:text-white">{item.selectedSize}</span>
                        </span>
                      )}
                      {item.selectedSize && <span className="w-1 h-1 rounded-full bg-gray-300"></span>}
                      <span className="flex items-center gap-1">
                        <span className="font-semibold uppercase text-xs tracking-tighter text-gray-400">Weight</span>
                        <span className="font-medium text-gray-900 dark:text-white">{item.weight}</span>
                      </span>
                    </div>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <span className="font-mono text-xl md:text-2xl font-light block text-[#1A1A1A] dark:text-white">
                      {formatCurrency(item.price * item.quantity, settings.currency_symbol)}
                    </span>
                    <p className="text-[10px] text-gray-400 dark:text-gray-500 uppercase tracking-widest mt-1">
                      {formatCurrency(item.price, settings.currency_symbol)} / unit
                    </p>
                  </div>
                </div>

                <div className="flex items-end justify-between mt-auto">
                  <div className="flex items-center bg-white dark:bg-white/5 border border-gray-200 dark:border-gray-800 rounded-full p-1 shadow-sm">
                    <button
                      onClick={() => updateQuantity(item.id, item.quantity - 1, item.selectedSize)}
                      className="w-10 h-10 flex items-center justify-center hover:bg-gray-100 dark:hover:bg-white/10 rounded-full transition-colors text-gray-600 dark:text-gray-300"
                    >
                      <span className="material-symbols-outlined text-lg">remove</span>
                    </button>
                    <span className="w-12 text-center font-mono font-medium text-[#1A1A1A] dark:text-white">{item.quantity}</span>
                    <button
                      onClick={() => updateQuantity(item.id, item.quantity + 1, item.selectedSize)}
                      className="w-10 h-10 flex items-center justify-center hover:bg-gray-100 dark:hover:bg-white/10 rounded-full transition-colors text-gray-600 dark:text-gray-300"
                    >
                      <span className="material-symbols-outlined text-lg">add</span>
                    </button>
                  </div>
                  <button
                    onClick={() => removeFromCart(item.id, item.selectedSize)}
                    className="flex items-center gap-2 text-xs uppercase tracking-widest text-red-400 hover:text-red-500 font-bold transition-colors group/remove"
                  >
                    <span className="material-symbols-outlined text-sm transition-transform group-hover/remove:rotate-90">close</span>
                    Remove
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Sidebar Summary */}
        <aside className="lg:w-1/3 mt-16 lg:mt-0">
          <div className="bg-white/70 dark:bg-[#1E1E1E]/60 backdrop-blur-xl border border-white/30 dark:border-white/10 rounded-2xl p-8 sticky top-24 shadow-sm">
            <h3 className="font-display text-2xl mb-8 text-[#1A1A1A] dark:text-white">Order Summary</h3>

            {/* Free Shipping Progress */}
            {freeDeliveryThreshold > 0 && (
              <div className="mb-10 p-5 bg-[#C5A059]/5 dark:bg-[#C5A059]/10 rounded-xl border border-[#C5A059]/20">
                <div className="flex justify-between items-center mb-3">
                  <span className="text-xs font-bold uppercase tracking-widest text-[#C5A059]">
                    {progress === 100 ? 'Free Shipping Unlocked' : 'Free Shipping'}
                  </span>
                  {amountToFreeShipping > 0 && (
                    <span className="text-[10px] font-mono text-[#C5A059]">{formatCurrency(amountToFreeShipping, settings.currency_symbol)} to go</span>
                  )}
                </div>
                <div className="h-1.5 w-full bg-gray-200 dark:bg-gray-800 rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-1000 bg-gradient-to-r from-[#C5A059] to-[#E2D1B3]"
                    style={{ width: `${progress}%` }}
                  ></div>
                </div>
                <p className="text-[11px] mt-3 text-gray-500 dark:text-gray-400 italic">
                  {amountToFreeShipping > 0
                    ? `Add more items for complimentary shipping`
                    : 'You are eligible for complimentary shipping'
                  }
                </p>
              </div>
            )}

            <div className="space-y-4 mb-8">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600 dark:text-gray-400 uppercase tracking-widest">Subtotal</span>
                <span className="font-mono text-[#1A1A1A] dark:text-white">{formatCurrency(subtotal, settings.currency_symbol)}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600 dark:text-gray-400 uppercase tracking-widest">Taxes</span>
                <span className="font-mono text-[#1A1A1A] dark:text-white">{formatCurrency(tax, settings.currency_symbol)}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600 dark:text-gray-400 uppercase tracking-widest">Shipping</span>
                <span className={`text-xs font-bold uppercase tracking-widest ${deliveryFee === 0 ? 'text-green-600 dark:text-green-400' : 'text-[#1A1A1A] dark:text-white'}`}>
                  {deliveryFee === 0 ? 'Complimentary' : formatCurrency(deliveryFee, settings.currency_symbol)}
                </span>
              </div>
              {!isMinOrderMet && (
                <div className="text-xs text-red-500 mt-2 p-2 bg-red-50 dark:bg-red-900/10 border border-red-100 dark:border-red-900/30 rounded text-center">
                  Minimum order: {formatCurrency(minOrderAmount, settings.currency_symbol)} required
                </div>
              )}
            </div>

            <div className="pt-8 border-t border-gray-200 dark:border-gray-700 flex justify-between items-end mb-10">
              <div>
                <span className="block text-xs uppercase tracking-widest font-bold text-gray-400">Total Due</span>
                <span className="text-4xl font-display mt-1 text-[#1A1A1A] dark:text-white">{formatCurrency(total, settings.currency_symbol)}</span>
              </div>
              {/* <span className="text-[10px] text-gray-400 uppercase tracking-tighter">Calculated at checkout</span> */}
            </div>

            <div className="space-y-4">
              <button
                disabled={!isMinOrderMet}
                onClick={() => window.location.href = '/checkout'}
                className="w-full bg-[#1A1A1A] hover:bg-black dark:bg-white dark:text-[#1A1A1A] dark:hover:bg-gray-200 text-white py-6 rounded-xl font-bold uppercase tracking-widest text-sm shadow-[0_0_20px_rgba(0,0,0,0.1)] hover:shadow-[0_0_30px_rgba(197,160,89,0.3)] hover:-translate-y-[1px] transition-all flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isMinOrderMet ? 'Proceed to Checkout' : 'Add More Items'}
                <span className="material-symbols-outlined text-sm">lock</span>
              </button>
            </div>

            <div className="mt-8 flex justify-center gap-6 opacity-40 grayscale contrast-125 dark:invert">
              <span className="material-symbols-outlined text-2xl" title="Secure Payment"><ShieldCheck className="w-6 h-6" /></span>
              <span className="material-symbols-outlined text-2xl" title="Fast Shipping"><Truck className="w-6 h-6" /></span>
              <span className="material-symbols-outlined text-2xl" title="Currency"><Banknote className="w-6 h-6" /></span>
            </div>
          </div>

          <div className="mt-6 px-4">
            <button className="w-full flex justify-between items-center py-4 border-b border-gray-100 dark:border-gray-800 group text-[#1A1A1A] dark:text-white">
              <span className="text-xs uppercase tracking-widest font-semibold group-hover:text-[#C5A059] transition-colors">Add a Promotion Code</span>
              <span className="material-symbols-outlined text-sm group-hover:translate-x-1 transition-transform">chevron_right</span>
            </button>
          </div>
        </aside>
      </main>

      <footer className="mt-24 pb-12 text-center text-[10px] uppercase tracking-[0.3em] text-gray-400 dark:text-gray-600">
        © 2024 Paridhan Haat • All Rights Reserved
      </footer>
    </div>
  );
};

export default Cart;