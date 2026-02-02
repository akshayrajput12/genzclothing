import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useStore } from '../store/useStore';
import { formatPrice } from '../utils/currency';
import { useNavigate } from 'react-router-dom';
import { cn } from '@/lib/utils';

interface Product {
  id: string;
  name: string;
  price: number;
  originalPrice?: number;
  image?: string;
  images?: string[];
  weight?: string;
  pieces?: string;
  rating?: number;
  stock_quantity?: number;
  isBestSeller?: boolean;
  features?: string[];
  sku?: string;
  description?: string;
  category?: string;
  available_sizes?: string[];
  [key: string]: any;
}

interface QuickViewModalProps {
  product: Product | null;
  isOpen: boolean;
  onClose: () => void;
}

const QuickViewModal: React.FC<QuickViewModalProps> = ({ product, isOpen, onClose }) => {
  const addToCart = useStore((state) => state.addToCart);
  const navigate = useNavigate();
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [selectedSize, setSelectedSize] = useState<string>('M'); // Default size
  const [selectedColor, setSelectedColor] = useState<string>('black'); // Default mock color

  if (!product) return null;

  const images = product.images || [product.image];
  const currentImage = images[selectedImageIndex] || product.image || '';

  // Design needs 'weight', 'sku', 'stock'
  // Use product data or fallbacks
  const displaySku = product.sku || `OBI-${product.id.slice(0, 3).toUpperCase()}-001`;
  const displayWeight = product.weight || '450 GSM';
  const displayStock = product.stock_quantity || 0;
  const isLowStock = displayStock > 0 && displayStock < 10;

  const handleAddToCart = () => {
    for (let i = 0; i < quantity; i++) {
      addToCart({
        ...product,
        image: currentImage
      } as any, selectedSize);
    }
    // Optional: Show success feedback
    onClose();
  };

  const handleQuantityChange = (change: number) => {
    const newQuantity = quantity + change;
    if (newQuantity >= 1 && newQuantity <= (displayStock || 10)) {
      setQuantity(newQuantity);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 md:p-8 bg-white/20 backdrop-blur-md">
          {/* Backdrop Click to Close */}
          <motion.div
            className="absolute inset-0 bg-transparent"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />

          <motion.div
            className="relative w-full max-w-6xl h-auto md:h-[650px] bg-scroll-white rounded-[2rem] shadow-[0_20px_60px_-15px_rgba(0,0,0,0.1)] overflow-hidden flex flex-col md:flex-row ring-1 ring-black/5"
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ duration: 0.4, ease: "easeOut" }}
          >
            {/* Mobile Close Button */}
            <button
              onClick={onClose}
              className="absolute top-4 right-4 z-50 md:hidden flex items-center justify-center w-10 h-10 rounded-full bg-white/80 backdrop-blur-md border border-gray-200 text-shadow-black shadow-sm"
            >
              <span className="material-symbols-outlined">close</span>
            </button>

            {/* Left Side: Image */}
            <div className="w-full md:w-1/2 relative h-96 md:h-full bg-[#f1f5f9] overflow-hidden group">
              <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg viewBox=%220 0 200 200%22 xmlns=%22http://www.w3.org/2000/svg%22%3E%3Cfilter id=%22noiseFilter%22%3E%3CfeTurbulence type=%22fractalNoise%22 baseFrequency=%220.65%22 numOctaves=%223%22 stitchTiles=%22stitch%22/%3E%3C/filter%3E%3Crect width=%22100%25%22 height=%22100%25%22 filter=%22url(%23noiseFilter)%22 opacity=%220.08%22/%3E%3C/svg%3E')] opacity-40 mix-blend-multiply z-10 pointer-events-none"></div>
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-orange-400/20 via-transparent to-transparent z-0"></div>

              <div className="absolute inset-0 flex items-end justify-center pb-0 z-20">
                <img
                  src={currentImage}
                  alt={product.name}
                  className="h-full w-full object-cover object-center md:scale-110 md:translate-y-12 transition-transform duration-700 ease-out group-hover:scale-110 mix-blend-multiply"
                />
              </div>

              <div className="absolute top-6 left-6 z-30 flex gap-2">
                <span className="px-4 py-1.5 bg-primary text-white text-xs font-bold tracking-widest rounded-full uppercase shadow-md shadow-orange-200">
                  New Arrival
                </span>
                {isLowStock && (
                  <span className="px-4 py-1.5 bg-white/80 text-shadow-black text-xs font-bold tracking-widest rounded-full uppercase backdrop-blur-sm border border-gray-200">
                    Limited
                  </span>
                )}
              </div>
            </div>

            {/* Right Side: Content */}
            <div className="w-full md:w-1/2 flex flex-col h-full bg-scroll-white relative">
              {/* Desktop Close Button */}
              <button
                onClick={onClose}
                className="hidden md:flex absolute top-6 right-6 z-20 items-center justify-center w-12 h-12 rounded-full bg-gray-100 hover:bg-gray-200 border border-gray-200 text-shadow-black transition-all duration-300 hover:rotate-90 group/close shadow-sm"
              >
                <span className="material-symbols-outlined group-hover/close:text-primary transition-colors">close</span>
              </button>

              <div className="flex-1 overflow-y-auto custom-scrollbar p-6 md:p-10 lg:p-12">
                <div className="mb-6">
                  <h3 className="text-smoke-grey text-sm font-bold tracking-[0.2em] uppercase mb-2">
                    {product.category || 'Obito // Streetwear'}
                  </h3>
                  <h1 className="text-shadow-black text-3xl md:text-4xl lg:text-[40px] font-bold leading-none tracking-tight mb-4">
                    {product.name}
                  </h1>
                  <div className="flex items-center gap-4">
                    <span className="text-primary text-2xl md:text-3xl font-bold tracking-tight">
                      {formatPrice(product.price)}
                    </span>
                    {product.originalPrice && (
                      <span className="text-smoke-grey text-lg line-through decoration-current">
                        {formatPrice(product.originalPrice)}
                      </span>
                    )}
                    <div className="h-px w-12 bg-gray-200"></div>
                    {displayStock > 0 ? (
                      <span className="text-leaf-green text-sm font-medium flex items-center gap-1">
                        <span className="material-symbols-outlined text-[16px]">check_circle</span>
                        In Stock
                      </span>
                    ) : (
                      <span className="text-red-500 text-sm font-medium flex items-center gap-1">
                        <span className="material-symbols-outlined text-[16px]">cancel</span>
                        Out of Stock
                      </span>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4 py-4 border-y border-gray-100 mb-6">
                  <div className="flex flex-col">
                    <span className="text-smoke-grey text-[10px] uppercase tracking-wider mb-1">Weight</span>
                    <span className="text-shadow-black text-sm font-medium">{displayWeight}</span>
                  </div>
                  <div className="flex flex-col border-l border-gray-100 pl-4">
                    <span className="text-smoke-grey text-[10px] uppercase tracking-wider mb-1">SKU</span>
                    <span className="text-shadow-black text-sm font-medium truncate" title={displaySku}>{displaySku}</span>
                  </div>
                  <div className="flex flex-col border-l border-gray-100 pl-4">
                    <span className="text-smoke-grey text-[10px] uppercase tracking-wider mb-1">Stock</span>
                    <span className="text-shadow-black text-sm font-medium">
                      {displayStock > 0 ? `${displayStock} units` : 'Sold Out'}
                    </span>
                  </div>
                </div>

                <p className="text-gray-600 text-base leading-relaxed mb-8 font-normal line-clamp-3">
                  {product.description || "Crafted from heavy-weight cotton fleece. Features high-density puff print. Embrace the darkness with this premium cut."}
                </p>

                <div className="space-y-6 mb-8">
                  <div>
                    <span className="text-shadow-black text-sm font-bold uppercase tracking-widest block mb-3">Select Color</span>
                    <div className="flex gap-3">
                      {['black', 'orange', 'white'].map((color) => {
                        const styles: Record<string, string> = {
                          black: 'bg-neutral-900',
                          orange: 'bg-orange-600',
                          white: 'bg-slate-200'
                        };
                        return (
                          <button
                            key={color}
                            onClick={() => setSelectedColor(color)}
                            className={cn(
                              "w-10 h-10 rounded-full border transition-all shadow-sm",
                              styles[color],
                              selectedColor === color
                                ? "border-primary ring-2 ring-offset-2 ring-primary ring-offset-white"
                                : "border-transparent hover:border-gray-300"
                            )}
                          />
                        );
                      })}
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between items-center mb-3">
                      <span className="text-shadow-black text-sm font-bold uppercase tracking-widest">Select Size</span>
                      <button className="text-xs text-smoke-grey hover:text-shadow-black underline decoration-dashed underline-offset-4 transition-colors">Size Guide</button>
                    </div>
                    <div className="flex flex-wrap gap-3">
                      {['S', 'M', 'L', 'XL', 'XXL'].map((size) => {
                        const isAvailable = product.available_sizes ? product.available_sizes.includes(size) : true; // Assume true if not specified
                        const isSelected = selectedSize === size;

                        if (size === 'XXL' && !isAvailable) {
                          return (
                            <button key={size} disabled className="h-12 w-14 rounded-2xl border border-gray-100 text-gray-300 bg-gray-50 cursor-not-allowed text-sm font-medium flex items-center justify-center relative overflow-hidden">
                              {size}
                              <div className="absolute inset-0 flex items-center justify-center">
                                <div className="w-full h-px bg-gray-300 rotate-45"></div>
                              </div>
                            </button>
                          );
                        }

                        return (
                          <button
                            key={size}
                            onClick={() => setSelectedSize(size)}
                            className={cn(
                              "h-12 w-14 rounded-2xl border text-sm font-medium flex items-center justify-center transition-all shadow-sm",
                              isSelected
                                ? "bg-primary text-white border-primary shadow-lg shadow-orange-200 font-bold"
                                : "bg-white text-gray-500 border-gray-200 hover:border-primary hover:text-primary"
                            )}
                          >
                            {size}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </div>

              <div className="p-6 md:p-10 md:pt-4 bg-scroll-white z-10 mt-auto border-t border-gray-100 md:border-none">
                <div className="flex gap-4">
                  <button
                    onClick={handleAddToCart}
                    disabled={!displayStock}
                    className="flex-1 bg-primary hover:bg-orange-600 text-white h-14 md:h-16 rounded-full font-bold text-lg tracking-wide flex items-center justify-center gap-3 transition-all duration-300 shadow-lg shadow-orange-200 hover:shadow-xl hover:shadow-orange-300 group/btn disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <span className="material-symbols-outlined text-chakra-red group-hover/btn:animate-pulse font-bold">bolt</span>
                    {displayStock > 0 ? `ADD TO CART` : 'SOLD OUT'}
                  </button>
                  <button className="h-14 md:h-16 w-14 md:w-16 rounded-full bg-gray-100 border border-gray-200 text-shadow-black hover:bg-gray-200 flex items-center justify-center transition-all group/heart shadow-sm">
                    <span className="material-symbols-outlined group-hover/heart:text-chakra-red fill-current transition-colors">favorite</span>
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default QuickViewModal;
