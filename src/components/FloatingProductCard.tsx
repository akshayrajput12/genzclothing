import React, { useState, useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { motion, AnimatePresence, useDragControls } from 'framer-motion';
import { supabase } from '@/integrations/supabase/client';
import QuickViewModal from './QuickViewModal';
import { X, GripVertical } from 'lucide-react';

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
    new_arrival?: boolean;
}

const FloatingProductCard = () => {
    const location = useLocation();
    const [products, setProducts] = useState<Product[]>([]);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [isVisible, setIsVisible] = useState(true);
    const [progress, setProgress] = useState(0);
    const [isHovered, setIsHovered] = useState(false);
    const [quickViewProduct, setQuickViewProduct] = useState<Product | null>(null);
    const [isQuickViewOpen, setIsQuickViewOpen] = useState(false);

    // Configuration
    const VISIBLE_DURATION = 8000; // 8 seconds per product
    const UPDATE_INTERVAL = 100; // Update progress every 100ms

    // Show only on specific pages
    const shouldShow = () => {
        const path = location.pathname;
        return path === '/' || path === '/products' || path.startsWith('/product/');
    };

    useEffect(() => {
        if (shouldShow()) {
            fetchProducts();
        }
    }, [location.pathname]);

    const fetchProducts = async () => {
        try {
            const { data, error } = await supabase
                .from('products')
                .select('*')
                .or('is_bestseller.eq.true,new_arrival.eq.true')
                .eq('is_active', true)
                .limit(10);

            if (error) throw error;

            if (data) {
                const formattedProducts = data.map((product: any) => ({
                    id: product.id,
                    name: product.name,
                    price: product.price,
                    originalPrice: product.original_price,
                    image: product.images?.[0] || '/placeholder.svg',
                    images: product.images,
                    category: product.is_bestseller ? 'Best Seller' : 'New Arrival',
                    weight: product.weight,
                    pieces: product.pieces,
                    description: product.description,
                    stock_quantity: product.stock_quantity,
                    slug: product.id,
                    inStock: product.stock_quantity !== undefined ? product.stock_quantity > 0 : true,
                    isBestSeller: product.is_bestseller,
                    new_arrival: product.new_arrival
                }));
                setProducts(formattedProducts);
            }
        } catch (err) {
            console.error('Error fetching floating products:', err);
        }
    };

    useEffect(() => {
        if (!shouldShow() || products.length === 0 || isHovered || isQuickViewOpen) return;

        const interval = setInterval(() => {
            setProgress((prev) => {
                const increment = (UPDATE_INTERVAL / VISIBLE_DURATION) * 100;
                if (prev + increment >= 100) {
                    // Time to switch
                    setCurrentIndex((prevIndex) => (prevIndex + 1) % products.length);
                    return 0;
                }
                return prev + increment;
            });
        }, UPDATE_INTERVAL);

        return () => clearInterval(interval);
    }, [products.length, isHovered, isQuickViewOpen, location.pathname]);

    const currentProduct = products[currentIndex];

    if (!shouldShow() || !currentProduct || !isVisible) return null;

    return (
        <>
            <motion.div
                drag
                dragMomentum={false}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 20 }}
                className="fixed bottom-4 left-4 right-4 z-[50] flex items-end cursor-move sm:bottom-8 sm:left-8 sm:right-auto sm:w-auto"
                onMouseEnter={() => setIsHovered(true)}
                onMouseLeave={() => setIsHovered(false)}
            >
                {/* Close Button (Floating Glass) */}
                <button
                    onClick={(e) => { e.stopPropagation(); setIsVisible(false); }}
                    className="absolute -top-3 -right-3 z-10 size-8 flex items-center justify-center rounded-full bg-white/40 dark:bg-black/20 backdrop-blur-md border border-white/20 shadow-lg text-black dark:text-white hover:bg-white/60 transition-all"
                >
                    <X size={14} />
                </button>

                {/* Main Card Container */}
                <div
                    onClick={() => { setQuickViewProduct(currentProduct); setIsQuickViewOpen(true); }}
                    className="relative w-full sm:w-[380px] h-[90px] sm:h-[110px] bg-white dark:bg-[#0B0B0F]/95 border border-white/20 rounded-full flex items-center p-2 sm:p-3 shadow-2xl overflow-hidden backdrop-blur-md transition-transform hover:scale-[1.02]"
                >
                    {/* Left: Product Image */}
                    <div className="relative h-full aspect-square rounded-full overflow-hidden flex-shrink-0 group">
                        <img
                            src={currentProduct.image}
                            alt={currentProduct.name}
                            className="w-full h-full object-cover"
                        />
                        {/* Sharingan Overlay */}
                        <div className="absolute top-1 right-1 size-5 bg-black rounded-full flex items-center justify-center shadow-[0_0_10px_rgba(249,116,21,0.4)] border border-primary/50">
                            <span className="material-symbols-outlined text-[12px] text-primary animate-spin">cyclone</span>
                        </div>
                    </div>

                    {/* Right: Product Details */}
                    <div className="flex flex-col flex-grow pl-3 sm:pl-5 pr-4 sm:pr-8 justify-center gap-0.5 overflow-hidden">
                        <div className="flex items-center gap-2">
                            <span className="bg-primary text-white text-[8px] sm:text-[9px] font-black px-1.5 sm:px-2 py-0.5 rounded-full tracking-wider uppercase">
                                {currentProduct.isBestSeller ? 'BEST SELLER' : 'NEW DROP'}
                            </span>
                        </div>
                        <h3 className="text-black dark:text-white text-base sm:text-lg font-bold leading-none tracking-tight uppercase italic truncate font-['Space_Grotesk']">
                            {currentProduct.name}
                        </h3>
                        <p className="text-zinc-400 text-[10px] sm:text-[11px] font-medium italic truncate">born kind. broken once.</p>
                        <div className="flex items-center justify-between mt-0.5">
                            <span className="text-primary font-bold text-xs sm:text-sm">₹{currentProduct.price.toLocaleString()}</span>
                            <span className="text-[8px] sm:text-[10px] text-zinc-500 uppercase tracking-widest font-bold">Limited</span>
                        </div>
                    </div>

                    {/* Progress Bar Bottom */}
                    <div className="absolute bottom-0 left-0 w-full h-1 bg-gray-100 dark:bg-white/5">
                        <motion.div
                            className="h-full bg-primary"
                            initial={{ width: 0 }}
                            animate={{ width: `${progress}%` }}
                            transition={{ ease: "linear", duration: 0.1 }}
                        />
                    </div>
                </div>
            </motion.div>

            {/* Quick View Modal */}
            {isQuickViewOpen && quickViewProduct && (
                <QuickViewModal
                    product={quickViewProduct}
                    isOpen={isQuickViewOpen}
                    onClose={() => { setIsQuickViewOpen(false); setQuickViewProduct(null); }}
                />
            )}
        </>
    );
};


export default FloatingProductCard;
