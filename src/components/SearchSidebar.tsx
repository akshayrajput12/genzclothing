import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Search, ChevronRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { formatPrice } from '@/utils/currency';
import { useStore } from '@/store/useStore';

interface SearchSidebarProps {
    isOpen: boolean;
    onClose: () => void;
}

const SearchSidebar: React.FC<SearchSidebarProps> = ({ isOpen, onClose }) => {
    const navigate = useNavigate();
    const { addToCart } = useStore();
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
        navigate(`/products/${product.sku || product.id}`);
        onClose();
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    {/* Backdrop */}
                    <motion.div
                        className="fixed inset-0 bg-black/35 z-50 backdrop-blur-[2px]"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                    />

                    {/* Left-Side Drawer */}
                    <motion.div
                        className="fixed left-0 top-0 h-full w-full md:w-[380px] bg-[var(--color-light)] shadow-2xl z-50 flex flex-col border-r border-[var(--color-secondary)]/10"
                        initial={{ x: '-100%' }}
                        animate={{ x: 0 }}
                        exit={{ x: '-100%' }}
                        transition={{ type: "tween", duration: 0.35, ease: [0.32, 0.72, 0, 1] }}
                    >
                        {/* Header */}
                        <div className="p-6 flex items-center justify-between border-b border-[var(--color-secondary)]/10">
                            <h2 className="font-serif text-xl font-bold tracking-widest text-[var(--color-dark)]">SEARCH</h2>
                            <button
                                onClick={onClose}
                                className="p-2 text-[var(--color-accent)] hover:text-[var(--color-primary)] transition-colors rounded-full hover:bg-[var(--color-soft-bg)]/20"
                            >
                                <X className="w-6 h-6 stroke-[1.5px]" />
                            </button>
                        </div>

                        {/* Content */}
                        <div className="flex-col flex-1 overflow-hidden flex p-6">

                            {/* Search Input */}
                            <div className="relative mb-6">
                                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--color-accent)]">
                                    <Search className="w-5 h-5 stroke-[1.5px]" />
                                </div>
                                <input
                                    type="text"
                                    placeholder="Search for products..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    autoFocus
                                    className="w-full pl-12 pr-4 py-4 bg-white border border-[var(--color-soft-bg)] 
                              rounded-[10px] text-[var(--color-dark)] placeholder:text-[var(--color-accent)]/50
                              focus:outline-none focus:border-[var(--color-primary)] focus:ring-1 focus:ring-[var(--color-primary)]/20
                              transition-all font-medium"
                                />
                            </div>

                            {/* Results Area */}
                            <div className="flex-1 overflow-y-auto custom-scrollbar -mr-4 pr-4">
                                {loading ? (
                                    <div className="flex justify-center py-12">
                                        <div className="w-6 h-6 border-2 border-[var(--color-primary)] border-t-transparent rounded-full animate-spin"></div>
                                    </div>
                                ) : searchResults.length > 0 ? (
                                    <div className="space-y-4">
                                        {searchResults.map((product) => (
                                            <div
                                                key={product.id}
                                                onClick={() => handleProductClick(product)}
                                                className="flex gap-4 p-3 rounded-lg hover:bg-white border border-transparent hover:border-[var(--color-secondary)]/10 cursor-pointer group transition-all"
                                            >
                                                <div className="w-16 h-20 bg-[var(--color-bg)] rounded overflow-hidden flex-shrink-0">
                                                    <img
                                                        src={product.images?.[0] || '/placeholder.svg'}
                                                        alt={product.name}
                                                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                                                    />
                                                </div>
                                                <div className="flex-1">
                                                    <h4 className="font-serif text-[var(--color-dark)] text-sm group-hover:text-[var(--color-primary)] transition-colors line-clamp-2">
                                                        {product.name}
                                                    </h4>
                                                    {product.categories?.name && (
                                                        <p className="text-[10px] uppercase tracking-wider text-[var(--color-accent)] mt-1">{product.categories.name}</p>
                                                    )}
                                                    <p className="text-sm font-semibold text-[var(--color-secondary)] mt-1">
                                                        {formatPrice(product.price)}
                                                    </p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ) : searchQuery.length > 1 ? (
                                    <div className="text-center py-12">
                                        <p className="text-[var(--color-accent)] text-sm">No products found matching "{searchQuery}"</p>
                                    </div>
                                ) : (
                                    <div className="space-y-6">
                                        <div className="flex items-center justify-between">
                                            <h3 className="text-xs font-bold uppercase tracking-widest text-[var(--color-dark)]">New Arrivals</h3>
                                        </div>
                                        <div className="space-y-4">
                                            {suggestedProducts.map((product) => (
                                                <div
                                                    key={product.id}
                                                    onClick={() => handleProductClick(product)}
                                                    className="flex gap-4 p-3 rounded-lg hover:bg-white border border-transparent hover:border-[var(--color-secondary)]/10 cursor-pointer group transition-all"
                                                >
                                                    <div className="w-16 h-20 bg-[var(--color-bg)] rounded overflow-hidden flex-shrink-0">
                                                        <img
                                                            src={product.images?.[0] || '/placeholder.svg'}
                                                            alt={product.name}
                                                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                                                        />
                                                    </div>
                                                    <div className="flex-1">
                                                        <h4 className="font-serif text-[var(--color-dark)] text-sm group-hover:text-[var(--color-primary)] transition-colors line-clamp-2">
                                                            {product.name}
                                                        </h4>
                                                        {product.categories?.name && (
                                                            <p className="text-[10px] uppercase tracking-wider text-[var(--color-accent)] mt-1">{product.categories.name}</p>
                                                        )}
                                                        <p className="text-sm font-semibold text-[var(--color-secondary)] mt-1">
                                                            {formatPrice(product.price)}
                                                        </p>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>

                        </div>

                        {/* Footer (Optional) */}
                        <div className="p-6 border-t border-[var(--color-secondary)]/10 bg-[var(--color-soft-bg)]/10">
                            <button
                                onClick={() => { navigate('/products'); onClose(); }}
                                className="w-full py-3 text-xs font-bold uppercase tracking-widest text-[var(--color-dark)] hover:text-[var(--color-primary)] transition-colors flex items-center justify-center gap-2 group"
                            >
                                View All Products
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
