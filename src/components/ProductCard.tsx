import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useStore } from '../store/useStore';
import { formatPrice } from '../utils/currency';

interface Product {
  id: string;
  name: string;
  price: number;
  originalPrice?: number;
  image?: string;
  images?: string[];
  category?: any;
  weight?: string;
  pieces?: string;
  rating?: number;
  stock_quantity?: number;
  isBestSeller?: boolean;
  features?: string[];
  sku?: string;
  [key: string]: any;
}

interface ProductCardProps {
  product: Product;
  onViewDetail?: () => void;
  onQuickView?: (product?: Product) => void;
  icon?: string; // For the background abstract shape
  index?: number; // To determine HOT/NEW badge if standard logic isn't used
  variant?: 'standard' | 'dark'; // 'standard' = light/glasmorphism, 'dark' = minimal dark theme
  aspectRatio?: 'portrait' | 'square';
}

const ProductCard: React.FC<ProductCardProps> = ({
  product,
  onViewDetail,
  onQuickView,
  icon = 'bolt',
  index = 0,
  variant = 'standard',
  aspectRatio = 'portrait'
}) => {
  const addToCart = useStore((state) => state.addToCart);

  // Always use the first image as the primary image
  const primaryImage = product.images?.[0] || product.image || '/placeholder.svg';

  const handleAddToCart = (e: React.MouseEvent) => {
    e.stopPropagation();

    // Normalize category to string for the store
    const categoryString = typeof product.category === 'object' && product.category?.name
      ? product.category.name
      : (typeof product.category === 'string' ? product.category : 'STREETWEAR');

    const defaultSize = product.available_sizes?.[0] || 'Standard';

    addToCart({
      ...product,
      category: categoryString,
      image: primaryImage,
      id: product.id,
      name: product.name,
      price: product.price
    } as any, defaultSize);
  };

  const handleQuickView = (e: React.MouseEvent) => {
    e.stopPropagation();
    onQuickView?.(product);
  };

  const isOutOfStock = product.stock_quantity !== undefined && product.stock_quantity <= 0;

  // Determine badge text
  let badgeText = 'NEW';
  let badgeColorClass = 'bg-white/80 text-[#0B0B0F]';

  if (variant === 'dark') {
    badgeColorClass = 'bg-[#FF4500] text-white'; // Ninja Orange for dark mode
  }

  if (product.stock_quantity && product.stock_quantity < 5) badgeText = 'LIMITED';
  if (product.isBestSeller || index < 2) badgeText = 'BEST';


  // Variant Styles
  const isDark = variant === 'dark';

  const containerClasses = isDark
    ? "bg-[#18181B] border-none shadow-none rounded-xl" // Dark Theme
    : "bg-[#F1F5F9] border border-white/60 shadow-[inset_0_0_60px_rgba(249,116,21,0.05)] rounded-3xl"; // Standard Theme

  const textPrimaryClass = isDark ? "text-white" : "text-[#0B0B0F]";
  const textSecondaryClass = isDark ? "text-zinc-400" : "text-primary";
  const hoverTranslateClass = isDark ? "group-hover:-translate-y-2" : "";

  const aspectRatioClass = aspectRatio === 'square' ? 'aspect-square' : 'aspect-[4/5]';

  return (
    <div className={`group relative flex flex-col gap-4 cursor-pointer w-full font-display transition-transform duration-300 ${hoverTranslateClass}`} onClick={onViewDetail}>
      {/* Image Container */}
      <div className={`relative w-full ${aspectRatioClass} overflow-hidden isolate ${containerClasses}`}>

        {/* Background Motif (Standard Only) */}
        {!isDark && (
          <>
            <div className="absolute inset-0 flex items-center justify-center opacity-[0.03] group-hover:opacity-[0.06] transition-opacity duration-700 pointer-events-none z-0">
              <span className="material-symbols-outlined text-[300px] select-none scale-[1.5] text-black" style={{ fontVariationSettings: "'FILL' 0, 'wght' 200" }}>{icon}</span>
            </div>
            <div className="absolute inset-0 rounded-3xl shadow-[inset_0_0_40px_rgba(249,115,22,0.1)] z-10 pointer-events-none mix-blend-soft-light"></div>
            <div className="absolute inset-0 opacity-30 mix-blend-overlay z-20 pointer-events-none" style={{ backgroundImage: `url("https://grainy-gradients.vercel.app/noise.svg")` }}></div>
          </>
        )}

        {/* Product Image */}
        {/* Product Image */}
        <div className="relative w-full h-full z-10 transition-transform duration-700 ease-out group-hover:scale-110">
          {/* Primary Image */}
          <div
            className="absolute inset-0 bg-cover bg-center bg-no-repeat transition-opacity duration-300"
            style={{ backgroundImage: `url('${primaryImage}')` }}
          ></div>

          {/* Secondary Image Overlay for Hover Effect */}
          {product.images && product.images.length > 1 && (
            <div
              className="absolute inset-0 w-full h-full bg-cover bg-center bg-no-repeat opacity-0 group-hover:opacity-100 transition-opacity duration-300 ease-in-out z-20"
              style={{ backgroundImage: `url('${product.images[1]}')` }}
            ></div>
          )}
        </div>

        {/* Quick Add Actions */}
        {!isOutOfStock ? (
          <div className={`absolute bottom-0 left-0 right-0 flex justify-center items-center gap-2 z-30 p-4 transition-all duration-300 
            ${isDark
              ? 'translate-y-0 opacity-100 md:translate-y-full md:opacity-0 md:group-hover:translate-y-0 md:group-hover:opacity-100 bg-black/60 backdrop-blur-md'
              : 'translate-y-0 opacity-100 md:translate-y-12 md:opacity-0 md:group-hover:translate-y-0 md:group-hover:opacity-100'
            }`}>

            {isDark ? (
              <button
                onClick={handleAddToCart}
                className="w-full py-3 bg-[#FF4500] text-black font-bold text-sm tracking-widest uppercase hover:bg-white transition-colors rounded-sm"
              >
                ADD TO CART
              </button>
            ) : (
              <>
                <button
                  onClick={handleQuickView}
                  aria-label="Quick View"
                  className="size-11 flex items-center justify-center bg-white/90 backdrop-blur text-black rounded-full shadow-lg hover:bg-white hover:scale-110 transition-all duration-300 md:flex"
                >
                  <span className="material-symbols-outlined text-[20px]">visibility</span>
                </button>
                <button
                  onClick={handleAddToCart}
                  className="h-11 px-3 md:px-6 flex items-center justify-center bg-primary text-white rounded-full shadow-lg shadow-primary/25 hover:shadow-primary/40 hover:scale-105 transition-all duration-300 gap-2 font-bold text-xs md:text-sm tracking-wide flex-1 md:flex-none md:w-auto btn-summon relative overflow-hidden"
                >
                  <div className="summon-particles"></div>
                  {/* Summoning Circle SVG */}
                  <svg className="circle-svg absolute inset-0 w-full h-full text-white/20" viewBox="0 0 100 100">
                    <circle cx="50" cy="50" r="45" fill="none" stroke="currentColor" strokeWidth="1" strokeDasharray="5,5" />
                    <circle cx="50" cy="50" r="35" fill="none" stroke="currentColor" strokeWidth="0.5" />
                    <path d="M50 5 L95 95 L5 95 Z" fill="none" stroke="currentColor" strokeWidth="0.5" transform="rotate(180 50 50)" />
                    <path d="M50 5 L95 95 L5 95 Z" fill="none" stroke="currentColor" strokeWidth="0.5" />
                  </svg>
                  <span className="relative z-10">ADD TO CART</span>
                </button>
              </>
            )}
          </div>
        ) : (
          <div className="absolute inset-0 z-30 flex items-center justify-center bg-black/40 backdrop-blur-[2px]">
            <span className="bg-black text-white px-4 py-2 rounded-full text-xs font-bold tracking-widest uppercase">Sold Out</span>
          </div>
        )}

        {/* Badge */}
        <div className="absolute top-3 left-3 z-30">
          <span className={`px-2 py-1 text-[10px] font-bold tracking-widest shadow-sm ${badgeColorClass} ${isDark ? 'rounded-none' : 'rounded-full border border-white/50'}`}>
            {badgeText}
          </span>
        </div>
      </div>

      {/* Product Details */}
      <div className={`flex flex-col gap-1 ${isDark ? 'px-0' : 'px-1'}`}>
        {!isDark && (
          <div className="flex justify-between items-start">
            <span className="text-leaf-green font-mono text-xs font-bold tracking-widest uppercase mb-1">
              {typeof product.category === 'object' ? product.category?.name : (product.category || 'STREETWEAR')}
            </span>
          </div>
        )}

        <div className="flex justify-between items-start">
          <h3 className={`font-sans font-bold text-base md:text-lg leading-tight tracking-wide group-hover:text-[#FF4500] transition-colors line-clamp-1 ${textPrimaryClass}`}>
            {product.name}
          </h3>
        </div>

        <div className="flex items-center gap-3">
          <span className={`font-bold text-base ${isDark ? 'text-[#FF4500]' : 'text-primary'}`}>{formatPrice(product.price)}</span>
          {product.originalPrice && product.originalPrice > product.price && (
            <span className="text-zinc-500 text-xs font-medium line-through">
              {formatPrice(product.originalPrice)}
            </span>
          )}
        </div>
      </div>
    </div>
  );
};
export default ProductCard;