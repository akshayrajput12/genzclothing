import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { cn } from '@/lib/utils';
import QuickViewModal from '../../../components/QuickViewModal';

const Hero = () => {
    const navigate = useNavigate();
    const [bestSellers, setBestSellers] = useState<any[]>([]);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [loading, setLoading] = useState(true);
    const [isQuickViewOpen, setIsQuickViewOpen] = useState(false);
    const [quickViewProduct, setQuickViewProduct] = useState<any | null>(null);

    useEffect(() => {
        fetchBestSellers();
    }, []);

    const fetchBestSellers = async () => {
        try {
            const { data, error } = await supabase
                .from('products')
                .select('*')
                .eq('is_bestseller', true)
                .eq('is_active', true)
                .limit(5);

            if (error) throw error;
            if (data && data.length > 0) {
                setBestSellers(data);
            } else {
                setBestSellers([]);
            }
        } catch (error) {
            console.error('Error fetching bestsellers:', error);
        } finally {
            setLoading(false);
        }
    };

    // Auto-rotate slides
    useEffect(() => {
        if (bestSellers.length > 1) {
            const interval = setInterval(() => {
                if (!isQuickViewOpen) { // Pause rotation when modal is open
                    setCurrentIndex((prev) => (prev + 1) % bestSellers.length);
                }
            }, 6000);
            return () => clearInterval(interval);
        }
    }, [bestSellers, isQuickViewOpen]);

    // Derived state for current product
    const currentProduct = bestSellers.length > 0 ? bestSellers[currentIndex] : null;

    // Helper to format price
    const formatPrice = (price: number) => {
        return new Intl.NumberFormat('en-IN', {
            style: 'currency',
            currency: 'INR',
            maximumFractionDigits: 0,
        }).format(price);
    };

    const handleQuickView = (product: any) => {
        setQuickViewProduct(product);
        setIsQuickViewOpen(true);
    };

    const closeQuickView = () => {
        setIsQuickViewOpen(false);
        setQuickViewProduct(null);
    };

    if (loading) {
        return <div className="min-h-[900px] flex items-center justify-center bg-background-light dark:bg-background-dark">
            <div className="animate-pulse flex flex-col items-center">
                <div className="h-12 w-12 border-4 border-primary border-t-transparent rounded-full animate-spin mb-4"></div>
                <div className="text-xl font-display font-bold">Loading Collection...</div>
            </div>
        </div>;
    }

    if (!currentProduct) {
        return <div className="min-h-[600px] flex items-center justify-center">No products found.</div>;
    }

    return (
        <div className="relative bg-[#f8f7f5] dark:bg-[#1a1a1a] font-display text-gray-900 dark:text-gray-100 overflow-hidden min-h-screen flex flex-col transition-colors duration-300">
            {/* Background Texture/Grid */}
            <div className="absolute inset-0 z-0 pointer-events-none opacity-40 bg-[size:40px_40px] bg-grid-pattern dark:bg-grid-pattern-dark"></div>

            {/* Geometric Accents - Changed to absolute so they stay in Hero */}
            <div className="absolute top-[-10%] left-[-10%] w-[50vw] h-[50vw] bg-leaf-green/20 rounded-full blur-[100px] pointer-events-none mix-blend-multiply dark:mix-blend-screen z-0"></div>
            <div className="absolute bottom-[-10%] right-[-10%] w-[40vw] h-[40vw] bg-primary/20 rounded-full blur-[80px] pointer-events-none mix-blend-multiply dark:mix-blend-screen z-0"></div>

            {/* Floating Navigation Removed - Displaying Global Header Only */}

            {/* Main Hero Content */}
            <main className="relative z-10 flex-grow flex flex-col justify-center min-h-[900px] pb-20 pt-0 px-4 md:px-10 lg:px-20">
                <div className="max-w-[1400px] mx-auto w-full h-full grid grid-cols-1 lg:grid-cols-12 gap-8 items-center relative">

                    {/* Left Column: Vertical Brand */}
                    <div className="hidden lg:flex lg:col-span-1 h-[600px] items-center justify-center border-r border-gray-200 dark:border-gray-800">
                        <h1 className="vertical-text text-[100px] leading-none font-black tracking-tighter text-gray-900 dark:text-white glitch-text opacity-90 select-none scale-y-110" data-text="OBITO">
                            OBITO
                        </h1>
                    </div>

                    {/* Center Column: The Collage */}
                    <div className="col-span-1 lg:col-span-7 relative flex justify-center items-center perspective-1000">
                        {/* Background Decorative Layer */}
                        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                            <div className="w-[80%] h-[90%] border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-3xl transform -rotate-3"></div>
                        </div>

                        {/* Floating Abstract Shapes */}
                        <div className="absolute top-10 left-10 md:left-20 z-20 animate-pulse">
                            <span className="material-symbols-outlined text-6xl text-leaf-green opacity-80" style={{ fontVariationSettings: "'FILL' 1" }}>shutter_speed</span>
                        </div>
                        <div className="absolute bottom-20 right-10 md:right-20 z-20 cursor-pointer hover:scale-110 transition-transform" onClick={() => handleQuickView(currentProduct)}>
                            <div className="bg-black text-white dark:bg-white dark:text-black p-2 rounded-lg transform rotate-12 shadow-xl">
                                <span className="material-symbols-outlined text-4xl">visibility</span>
                            </div>
                        </div>
                        <div className="absolute top-1/4 right-0 md:-right-10 z-0 opacity-50">
                            <span className="material-symbols-outlined text-[150px] text-gray-200 dark:text-gray-800 rotate-45">bolt</span>
                        </div>

                        {/* Main Image Card */}
                        <div key={currentProduct.id} className="relative w-full max-w-md md:max-w-lg aspect-[3/4] bg-gray-100 dark:bg-gray-800 rounded-2xl shadow-2xl overflow-hidden transform rotate-2 hover:rotate-0 transition-transform duration-500 ease-out group border-4 border-white dark:border-gray-700">
                            {/* Main Product Image */}
                            <div
                                className="w-full h-full bg-cover bg-center transition-all duration-700 hover:scale-110"
                                style={{ backgroundImage: `url('${currentProduct.image || currentProduct.images?.[0] || 'https://via.placeholder.com/600'}')` }}
                            >
                                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent"></div>
                            </div>

                            {/* Overlay Tagline */}
                            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full text-center pointer-events-none z-10 mix-blend-overlay">
                                <h2 className="font-handwritten text-4xl md:text-6xl text-white/90 drop-shadow-lg transform -rotate-6 leading-snug">
                                    born distinct.<br />
                                    <span className="text-primary opacity-90">worn proud.</span>
                                </h2>
                            </div>

                            {/* Price Badge Sticker */}
                            <div className="absolute bottom-6 right-6 z-20 transform rotate-12 hover:scale-110 transition-transform cursor-pointer" onClick={() => navigate(`/product/${currentProduct.slug || currentProduct.id}`)}>
                                <div className="size-24 md:size-28 bg-primary rounded-full flex flex-col items-center justify-center text-white shadow-xl border-4 border-white dark:border-gray-900 border-dashed">
                                    <span className="text-xs font-bold uppercase tracking-widest mb-1">Only</span>
                                    <span className="text-xl md:text-2xl font-black font-display">{formatPrice(currentProduct.price)}</span>
                                </div>
                            </div>

                            {/* Brand Tag Sticker */}
                            <div className="absolute top-6 left-6 z-20 transform -rotate-6">
                                <div className="bg-leaf-green text-white px-3 py-1 text-xs font-bold uppercase tracking-wider rounded-sm shadow-md">
                                    Best Seller
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Right Column: Context & CTA */}
                    <div className="col-span-1 lg:col-span-4 flex flex-col items-start justify-center gap-6 z-20 pt-10 lg:pt-0">
                        {/* Collection Label */}
                        <div className="flex items-center gap-2">
                            <span className="size-2 rounded-full bg-leaf-green animate-pulse"></span>
                            <p className="text-gray-500 dark:text-gray-400 font-mono text-xs tracking-[0.2em] uppercase">
                                {currentProduct.category || 'Exclusive Drop'} // Vol. {currentIndex + 1}
                            </p>
                        </div>

                        {/* Headline */}
                        <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold leading-[0.9] tracking-tight text-gray-900 dark:text-white line-clamp-3">
                            {currentProduct.name}
                        </h2>

                        {/* Description */}
                        <p className="text-gray-600 dark:text-gray-300 text-lg max-w-sm leading-relaxed border-l-4 border-primary pl-4 line-clamp-3">
                            {currentProduct.description || "Experience the fusion of tradition and modern aesthetics. Crafted for those who dare to stand out."}
                        </p>

                        {/* CTA Stack */}
                        <div className="flex flex-col sm:flex-row items-center gap-4 w-full pt-4">
                            <button onClick={() => navigate(`/product/${currentProduct.slug || currentProduct.id}`)} className="flex-1 w-full sm:w-auto h-14 bg-primary text-white rounded-full font-black uppercase tracking-widest hover:bg-orange-600 transition-all hover:scale-105 shadow-xl shadow-orange-500/20 flex items-center justify-center gap-3 group">
                                <span>Shop Now</span>
                                <span className="material-symbols-outlined group-hover:translate-x-1 transition-transform">arrow_forward</span>
                            </button>
                            <button className="size-14 rounded-full border-2 border-gray-200 dark:border-gray-700 flex items-center justify-center hover:border-gray-900 dark:hover:border-white transition-colors group bg-white dark:bg-transparent">
                                <span className="material-symbols-outlined text-gray-500 group-hover:text-red-500 transition-colors" style={{ fontVariationSettings: "'FILL' 1" }}>favorite</span>
                            </button>
                        </div>

                        {/* Stock Ticker */}
                        <div className="mt-8 bg-gray-100 dark:bg-white/5 p-3 rounded-lg w-full flex items-center justify-between">
                            <div className="flex items-center gap-2 text-xs font-bold uppercase text-gray-500 dark:text-gray-400">
                                <span className="material-symbols-outlined text-base">inventory_2</span>
                                Stock Status
                            </div>
                            <div className="flex gap-1">
                                <div className="w-8 h-2 bg-primary rounded-full"></div>
                                <div className="w-8 h-2 bg-primary rounded-full"></div>
                                <div className="w-8 h-2 bg-primary opacity-30 rounded-full"></div>
                                <div className="w-8 h-2 bg-gray-300 dark:bg-gray-700 rounded-full"></div>
                            </div>
                            <span className="text-xs font-mono font-bold text-primary">SELLING FAST</span>
                        </div>
                    </div>
                </div>

                {isQuickViewOpen && quickViewProduct && (
                    <QuickViewModal
                        product={quickViewProduct}
                        isOpen={isQuickViewOpen}
                        onClose={closeQuickView}
                    />
                )}
            </main>
        </div>
    );
};

export default Hero;
