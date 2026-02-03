import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Search, ChevronRight, ScanLine, Radar, Database } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { formatPrice } from '@/utils/currency';
import { useStore } from '@/store/useStore';
import { cn } from '@/lib/utils';

interface SearchSidebarProps {
    isOpen: boolean;
    onClose: () => void;
}

const SearchSidebar: React.FC<SearchSidebarProps> = ({ isOpen, onClose }) => {
    const navigate = useNavigate();
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const [debouncedQuery, setDebouncedQuery] = useState('');
    const [suggestedProducts, setSuggestedProducts] = useState<any[]>([]);

    // Fetch suggested products when sidebar opens
    useEffect(() => {
        if (isOpen && suggestedProducts.length === 0) {
            fetchSuggestedProducts();
        }
    }, [isOpen]);

    const fetchSuggestedProducts = async () => {
        try {
            const { data, error } = await supabase
                .from('products')
                .select(`
                   id, name, price, images, category_id, sku,
                   categories (name)
                `)
                .eq('is_active', true)
                .limit(5)
                .order('created_at', { ascending: false });

            if (error) throw error;
            setSuggestedProducts(data || []);
        } catch (err) {
            console.error('Error fetching suggestions:', err);
        }
    };

    // Debounce search input
    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedQuery(searchQuery);
        }, 400);
        return () => clearTimeout(timer);
    }, [searchQuery]);

    // Perform Search
    useEffect(() => {
        if (debouncedQuery.trim().length > 1) {
            performSearch(debouncedQuery);
        } else {
            setSearchResults([]);
        }
    }, [debouncedQuery]);

    const performSearch = async (query: string) => {
        setLoading(true);
        try {
            const { data, error } = await supabase
                .from('products')
                .select(`
           id, name, price, images, category_id, sku,
           categories (name)
        `)
                .ilike('name', `%${query}%`)
                .eq('is_active', true)
                .limit(10);

            if (error) throw error;
            setSearchResults(data || []);
        } catch (err) {
            console.error('Search error:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleProductClick = (product: any) => {
        navigate(`/product/${product.sku || product.id}`);
        onClose();
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    {/* Backdrop */}
                    <motion.div
                        className="fixed inset-0 bg-black/60 z-[90] backdrop-blur-sm"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                    />

                    {/* Right-Side Drawer (Changed to Right for better UX often, or keep Left if preferred. User didn't specify, but sidebar usually implies right or left. Code had left. I'll stick to left to match previous behavior but upgrade visuals.) */}
                    {/* Actually, most "Cart" is right, "Menu" is left. Search often top or full. Let's stick to Left as per original code but make it look like a high-tech panel. */}
                    <motion.div
                        className="fixed left-0 top-0 h-full w-full md:w-[450px] bg-[#F8FAFC] dark:bg-[#0B0B0F] shadow-2xl z-[100] flex flex-col border-r border-[#0B0B0F]/10 dark:border-white/10"
                        initial={{ x: '-100%' }}
                        animate={{ x: 0 }}
                        exit={{ x: '-100%' }}
                        transition={{ type: "spring", damping: 30, stiffness: 300 }}
                    >
                        {/* Decorative background elements */}
                        <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl pointer-events-none -translate-y-1/2 translate-x-1/2"></div>
                        <div className="absolute bottom-0 left-0 w-64 h-64 bg-orange-500/5 rounded-full blur-3xl pointer-events-none translate-y-1/2 -translate-x-1/2"></div>

                        {/* Header */}
                        <div className="relative p-6 md:p-8 flex items-center justify-between border-b border-[#0B0B0F]/5 dark:border-white/5 bg-white/50 dark:bg-black/50 backdrop-blur-sm z-10">
                            <div>
                                <h2 className="font-bebas text-3xl tracking-tighter italic text-[#0B0B0F] dark:text-white leading-none">
                                    MISSION <span className="text-primary">SEARCH</span>
                                </h2>
                                <p className="text-[10px] font-bold tracking-[0.2em] text-gray-400 uppercase">
                                    Scan Database // Level 4 Access
                                </p>
                            </div>
                            <button
                                onClick={onClose}
                                className="w-10 h-10 flex items-center justify-center rounded-full bg-gray-100 dark:bg-white/10 text-[#0B0B0F] dark:text-white hover:bg-primary hover:text-white transition-all duration-300 group"
                            >
                                <X className="w-5 h-5 group-hover:rotate-90 transition-transform" />
                            </button>
                        </div>

                        {/* Content */}
                        <div className="flex-col flex-1 overflow-hidden flex p-6 md:p-8 relative z-10">

                            {/* Search Input */}
                            <div className="relative mb-8 group">
                                <div className="absolute -inset-0.5 bg-gradient-to-r from-primary to-orange-600 rounded-xl opacity-20 group-hover:opacity-100 transition duration-500 blur group-focus-within:opacity-100"></div>
                                <div className="relative flex items-center bg-white dark:bg-[#1A1A1A] rounded-xl overflow-hidden border border-[#0B0B0F]/10 dark:border-white/10">
                                    <div className="pl-4 text-gray-400">
                                        <ScanLine className="w-5 h-5 animate-pulse" />
                                    </div>
                                    <input
                                        type="text"
                                        placeholder="Enter keywords to track..."
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        autoFocus
                                        className="w-full pl-3 pr-4 py-4 bg-transparent border-none text-[#0B0B0F] dark:text-white placeholder:text-gray-400 focus:ring-0 font-bold tracking-wide text-sm"
                                    />
                                    {loading && (
                                        <div className="pr-4">
                                            <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Results Area */}
                            <div className="flex-1 overflow-y-auto custom-scrollbar -mr-4 pr-4">
                                {loading ? (
                                    <div className="flex flex-col items-center justify-center py-20 space-y-4">
                                        <Radar className="w-12 h-12 text-primary animate-spin-slow opacity-50" />
                                        <p className="text-xs font-bold tracking-widest text-gray-400 animate-pulse">SCANNING ARCHIVES...</p>
                                    </div>
                                ) : searchResults.length > 0 ? (
                                    <div className="space-y-4">
                                        <div className="flex items-center gap-2 mb-2">
                                            <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></div>
                                            <span className="text-[10px] font-bold uppercase tracking-widest text-gray-500">
                                                {searchResults.length} Matches Found
                                            </span>
                                        </div>
                                        {searchResults.map((product, index) => (
                                            <motion.div
                                                initial={{ opacity: 0, x: -20 }}
                                                animate={{ opacity: 1, x: 0 }}
                                                transition={{ delay: index * 0.05 }}
                                                key={product.id}
                                                onClick={() => handleProductClick(product)}
                                                className="flex gap-4 p-3 rounded-2xl hover:bg-white dark:hover:bg-white/5 border border-transparent hover:border-[#0B0B0F]/5 dark:hover:border-white/5 cursor-pointer group transition-all"
                                            >
                                                <div className="w-16 h-20 bg-gray-100 dark:bg-gray-800 rounded-lg overflow-hidden flex-shrink-0 relative">
                                                    <img
                                                        src={product.images?.[0] || '/placeholder.svg'}
                                                        alt={product.name}
                                                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                                                    />
                                                    <div className="absolute inset-0 bg-primary/0 group-hover:bg-primary/10 transition-colors"></div>
                                                </div>
                                                <div className="flex-1">
                                                    <h4 className="font-bebas text-lg tracking-wide text-[#0B0B0F] dark:text-white group-hover:text-primary transition-colors line-clamp-1">
                                                        {product.name}
                                                    </h4>
                                                    <div className="flex items-center justify-between mt-1">
                                                        <div>
                                                            {product.categories?.name && (
                                                                <span className="text-[9px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-sm bg-gray-100 dark:bg-white/10 text-gray-500">
                                                                    {product.categories.name}
                                                                </span>
                                                            )}
                                                        </div>
                                                        <p className="text-sm font-black text-[#0B0B0F] dark:text-white">
                                                            {formatPrice(product.price)}
                                                        </p>
                                                    </div>
                                                </div>
                                                <div className="flex items-center justify-center w-8 text-gray-300 group-hover:text-primary transition-colors">
                                                    <ChevronRight className="w-5 h-5" />
                                                </div>
                                            </motion.div>
                                        ))}
                                    </div>
                                ) : searchQuery.length > 1 ? (
                                    <div className="flex flex-col items-center justify-center py-20 text-center">
                                        <Database className="w-12 h-12 text-gray-300 dark:text-gray-700 mb-4" />
                                        <p className="text-sm font-bold text-[#0B0B0F] dark:text-white mb-1">DATA MARKER NOT FOUND</p>
                                        <p className="text-xs text-gray-500">Try adjusting your search parameters.</p>
                                    </div>
                                ) : (
                                    <div className="space-y-6">
                                        <div className="flex items-center justify-between border-b border-dashed border-gray-200 dark:border-gray-800 pb-2">
                                            <h3 className="text-xs font-bold uppercase tracking-[0.2em] text-[#0B0B0F] dark:text-white flex items-center gap-2">
                                                <span className="w-1.5 h-1.5 rounded-full bg-primary"></span>
                                                Recommended Intel
                                            </h3>
                                        </div>
                                        <div className="space-y-4">
                                            {suggestedProducts.map((product, index) => (
                                                <motion.div
                                                    initial={{ opacity: 0, y: 10 }}
                                                    animate={{ opacity: 1, y: 0 }}
                                                    transition={{ delay: index * 0.1 }}
                                                    key={product.id}
                                                    onClick={() => handleProductClick(product)}
                                                    className="flex gap-4 p-3 rounded-2xl hover:bg-white dark:hover:bg-white/5 border border-transparent hover:border-[#0B0B0F]/5 dark:hover:border-white/5 cursor-pointer group transition-all"
                                                >
                                                    <div className="w-16 h-20 bg-gray-100 dark:bg-gray-800 rounded-lg overflow-hidden flex-shrink-0 relative">
                                                        <span className="absolute top-0 left-0 bg-primary text-white text-[8px] font-bold px-1.5 py-0.5 uppercase z-10">HOT</span>
                                                        <img
                                                            src={product.images?.[0] || '/placeholder.svg'}
                                                            alt={product.name}
                                                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                                                        />
                                                    </div>
                                                    <div className="flex-1">
                                                        <h4 className="font-bebas text-lg tracking-wide text-[#0B0B0F] dark:text-white group-hover:text-primary transition-colors line-clamp-1">
                                                            {product.name}
                                                        </h4>
                                                        <p className="text-[10px] text-gray-400 font-medium uppercase mt-0.5 line-clamp-1">
                                                            {product.categories?.name || 'Classified Gear'}
                                                        </p>
                                                        <p className="text-sm font-black text-[#0B0B0F] dark:text-white mt-1">
                                                            {formatPrice(product.price)}
                                                        </p>
                                                    </div>
                                                </motion.div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>

                        </div>

                        {/* Footer */}
                        <div className="p-6 md:p-8 border-t border-[#0B0B0F]/5 dark:border-white/5 bg-gray-50/50 dark:bg-white/5 backdrop-blur-sm relative z-10">
                            <button
                                onClick={() => { navigate('/products'); onClose(); }}
                                className="w-full py-4 bg-[#0B0B0F] dark:bg-white text-white dark:text-[#0B0B0F] rounded-xl text-xs font-bold uppercase tracking-[0.2em] hover:bg-primary hover:text-white dark:hover:bg-primary dark:hover:text-white transition-all duration-300 flex items-center justify-center gap-2 group shadow-lg shadow-black/5"
                            >
                                Access Full Database
                                <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                            </button>
                        </div>

                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
};

export default SearchSidebar;
