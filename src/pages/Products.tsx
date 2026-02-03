import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { SlidersHorizontal, X } from 'lucide-react';
import { useStore } from '../store/useStore';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import ProductFiltersComponent from '../components/ProductFilters';
import { supabase } from '@/integrations/supabase/client';
import { scrollToTopInstant } from '@/utils/scrollToTop';
import { formatCurrency } from '@/utils/currency';
import { useSettings } from '@/hooks/useSettings';
import ProductCard from '../components/ProductCard';
import QuickViewModal from '../components/QuickViewModal';

interface ProductFilters {
  categories: string[];
  priceRange: number[];
  inStock: boolean;
  isBestseller: boolean;
  sortBy: string;
}

const Products = () => {
  const { selectedCategory, setSelectedCategory } = useStore();
  const [sortBy, setSortBy] = useState('name');
  const [searchTerm, setSearchTerm] = useState('');
  const [products, setProducts] = useState<any[]>([]);
  const [categories, setCategories] = useState(['All']);
  const [loading, setLoading] = useState(true);
  const [totalProducts, setTotalProducts] = useState(0);
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState<ProductFilters>({
    categories: [],
    priceRange: [0, 50000],
    inStock: false,
    isBestseller: false,
    sortBy: 'name',
  });

  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const observer = useRef<IntersectionObserver | null>(null);

  const { settings } = useSettings();
  const navigate = useNavigate();
  const location = useLocation();

  const [quickViewProduct, setQuickViewProduct] = useState<any>(null);
  const [isQuickViewOpen, setIsQuickViewOpen] = useState(false);

  const handleQuickView = (product: any) => {
    setQuickViewProduct({
      ...product,
      image: product.images?.[0] || product.image || '/placeholder.svg',
      slug: product.id
    });
    setIsQuickViewOpen(true);
  };

  const handleViewDetail = (product: any) => {
    const slug = product.sku || product.id;
    navigate(`/product/${slug}`);
  };

  const closeQuickView = () => {
    setIsQuickViewOpen(false);
    setQuickViewProduct(null);
  };

  useEffect(() => {
    scrollToTopInstant();
    const queryParams = new URLSearchParams(location.search);
    const categoryParam = queryParams.get('category');
    if (categoryParam && categories.includes(categoryParam)) {
      setSelectedCategory(categoryParam);
    }
    fetchProducts();
    fetchCategories();
  }, []);

  useEffect(() => {
    setPage(1);
    setHasMore(true);
    setProducts([]);
    fetchProducts(1);
  }, [selectedCategory, searchTerm, filters]);

  const fetchProducts = async (pageNum = 1) => {
    if (pageNum === 1) {
      setLoading(true);
    } else {
      setIsLoadingMore(true);
    }

    try {
      let countQuery = supabase
        .from('products')
        .select('*', { count: 'exact', head: true })
        .eq('is_active', true);

      if (selectedCategory !== 'All') {
        const { data: categoryData, error: categoryError } = await supabase
          .from('categories')
          .select('id')
          .eq('name', selectedCategory)
          .single();

        if (!categoryError && categoryData) {
          countQuery = countQuery.eq('category_id', categoryData.id);
        }
      }

      if (searchTerm) {
        countQuery = countQuery.ilike('name', `%${searchTerm}%`);
      }

      if (filters.priceRange[0] > 0) countQuery = countQuery.gte('price', filters.priceRange[0]);
      if (filters.priceRange[1] < 50000) countQuery = countQuery.lte('price', filters.priceRange[1]);

      const { count, error: countError } = await countQuery;
      if (!countError) setTotalProducts(count || 0);

      let query = supabase
        .from('products')
        .select(`*, categories(id, name)`)
        .eq('is_active', true)
        .range((pageNum - 1) * 10, pageNum * 10 - 1);

      if (selectedCategory !== 'All') {
        const { data: categoryData, error: categoryError } = await supabase
          .from('categories')
          .select('id')
          .eq('name', selectedCategory)
          .single();

        if (!categoryError && categoryData) {
          query = query.eq('category_id', categoryData.id);
        }
      }

      if (searchTerm) query = query.ilike('name', `%${searchTerm}%`);
      if (filters.priceRange[0] > 0) query = query.gte('price', filters.priceRange[0]);
      if (filters.priceRange[1] < 50000) query = query.lte('price', filters.priceRange[1]);

      const sortOption = filters.sortBy || sortBy;
      switch (sortOption) {
        case 'name-desc': query = query.order('name', { ascending: false }); break;
        case 'price-low': query = query.order('price', { ascending: true }); break;
        case 'price-high': query = query.order('price', { ascending: false }); break;
        case 'newest': query = query.order('created_at', { ascending: false }); break;
        default: query = query.order('name', { ascending: true });
      }

      const { data, error } = await query;
      if (error) throw error;

      if (pageNum === 1) {
        setProducts(data || []);
      } else {
        setProducts(prev => [...prev, ...(data || [])]);
      }
      setHasMore(data?.length === 10);

    } catch (error) {
      console.error('Error fetching products:', error);
    } finally {
      setLoading(false);
      setIsLoadingMore(false);
    }
  };

  const fetchCategories = async () => {
    try {
      // Fetch categories logic
      const { data, error } = await supabase.from('categories').select('name').eq('is_active', true);
      if (error) throw error;
      const categoryNames = data?.map(cat => cat.name) || [];
      setCategories(['All', ...categoryNames]);
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  const loadMore = useCallback(() => {
    if (hasMore && !isLoadingMore) {
      const nextPage = page + 1;
      setPage(nextPage);
      fetchProducts(nextPage);
    }
  }, [page, hasMore, isLoadingMore]);

  const lastProductElementRef = useCallback((node: HTMLDivElement) => {
    if (loading || isLoadingMore) return;
    if (observer.current) observer.current.disconnect();
    observer.current = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting && hasMore) {
        loadMore();
      }
    });
    if (node) observer.current.observe(node);
  }, [loading, isLoadingMore, hasMore, loadMore]);

  return (
    <div className="font-display manga-speed-lines min-h-screen selection:bg-[#F97316] selection:text-white bg-[#F8FAFC] dark:bg-[#0B0B0F] text-[#0B0B0F] dark:text-[#F8FAFC]">
      <div className="film-grain"></div>
      <div className="relative flex flex-col w-full group/design-root">

        {/* Filter Sidebar Drawer */}
        <AnimatePresence>
          {showFilters && (
            <>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 bg-black/60 z-[60] backdrop-blur-sm"
                onClick={() => setShowFilters(false)}
              />
              <motion.div
                initial={{ x: '-100%' }}
                animate={{ x: 0 }}
                exit={{ x: '-100%' }}
                transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                className="fixed top-0 left-0 h-full w-80 bg-[#F8FAFC] dark:bg-[#0B0B0F] shadow-2xl z-[70] overflow-hidden flex flex-col border-r border-[#0B0B0F]/5 dark:border-white/5"
              >
                <div className="p-6 border-b border-[#0B0B0F]/10 dark:border-white/10 flex justify-between items-center bg-white/50 dark:bg-black/50">
                  <h3 className="font-bebas text-2xl tracking-tighter italic text-[#0B0B0F] dark:text-white">FILTERS</h3>
                  <button onClick={() => setShowFilters(false)} className="text-[#9CA3AF] hover:text-[#F97316] transition-colors">
                    <X className="w-6 h-6" />
                  </button>
                </div>
                <div className="flex-1 overflow-y-auto p-6">
                  <ProductFiltersComponent
                    onFiltersChange={setFilters}
                    categories={categories}
                    className="w-full"
                  />
                </div>
              </motion.div>
            </>
          )}
        </AnimatePresence>

        {/* Mobile Filter Tags */}
        <div className="md:hidden sticky top-[69px] z-40 bg-white/90 dark:bg-[#0B0B0F]/90 backdrop-blur-md border-b border-[#0B0B0F]/5 dark:border-white/5 px-4 overflow-x-auto no-scrollbar flex items-center gap-6 py-3">
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`text-[10px] font-bold tracking-widest whitespace-nowrap ${selectedCategory === cat ? 'text-[#F97316]' : 'text-gray-400'}`}
            >
              {cat === 'All' ? 'ALL GEAR' : cat.toUpperCase()}
            </button>
          ))}
        </div>

        <main className="max-w-[1440px] mx-auto w-full px-4 md:px-10 lg:px-20 py-8 md:py-12 relative z-10">
          {/* Hero Banner */}
          <div className="mb-12 md:mb-16">
            <div className="relative overflow-hidden rounded-2xl bg-[#0B0B0F] min-h-[240px] md:min-h-[360px] flex flex-col justify-center p-6 md:p-12">
              <div className="absolute inset-0 opacity-50 mix-blend-overlay bg-cover bg-center" style={{ backgroundImage: 'url("https://lh3.googleusercontent.com/aida-public/AB6AXuCWV6EhYI8zk9WGWl3NeYawyNu4d2TqTBYySRtY7H3ReinlPA7gFUucF-ffXQ4YbRruEWcvrFIYDpbBuyVMKlGHXiWnc4SvKL4uxF6iMTHZAbWz-XKCL4jITBAwmbvLV7UHoaOgVYYuX7lCx7aT4Ax20YBp2lO8e3zX1XTa5KuKgxWkVy9Qth7WSG6NP3gH29A51aMTuFtCuPJDpvOl2SC0WLyB4o4qDPfm9Y_pv6N4BGUAjSHkKQT0yxDMy_E95A-zn1Zho1tLrrvS")' }}></div>
              <div className="relative z-10">
                <p className="text-[#F97316] font-bold tracking-[0.3em] mb-2 md:mb-4 text-[10px] md:text-xs">BORN KIND. BROKEN ONCE.</p>
                <h1 className="text-white text-5xl md:text-8xl font-bebas italic leading-none tracking-tighter">THE COLLECTION <br /> ARCHIVE</h1>
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-10 relative">

            {/* Product Grid Area - Full Width */}
            <div className="flex-1 w-full">
              {/* Top Bar */}
              <div className="hidden md:flex flex-row justify-between items-center border-b border-[#0B0B0F]/10 dark:border-white/10 mb-8 sticky top-[88px] bg-[#F8FAFC]/95 dark:bg-[#0B0B0F]/95 backdrop-blur-sm z-30 py-4 transition-colors">
                <div className="flex gap-8 overflow-x-auto no-scrollbar">
                  <button onClick={() => setSelectedCategory('All')} className={`pb-2 border-b-2 font-bold text-xs tracking-widest whitespace-nowrap ${selectedCategory === 'All' ? 'border-[#F97316] text-[#0B0B0F] dark:text-white' : 'border-transparent text-gray-400'}`}>ALL GEAR</button>
                  {/* Horizontal Categories */}
                  {categories.slice(1).map(cat => (
                    <button key={cat} onClick={() => setSelectedCategory(cat)} className={`pb-2 border-b-2 font-bold text-xs tracking-widest whitespace-nowrap ${selectedCategory === cat ? 'border-[#F97316] text-[#0B0B0F] dark:text-white' : 'border-transparent text-gray-400 hover:text-[#F97316]'} transition-all`}>
                      {cat.toUpperCase()}
                    </button>
                  ))}
                </div>
                <div className="flex gap-4">
                  {/* Filter Button */}
                  <button
                    onClick={() => setShowFilters(true)}
                    className="flex items-center gap-2 px-5 py-2.5 bg-white dark:bg-white/5 border border-[#0B0B0F]/5 dark:border-white/5 rounded-full text-[10px] font-bold hover:border-[#F97316] transition-all"
                  >
                    <SlidersHorizontal className="w-3 h-3" /> FILTER
                  </button>

                  <div className="relative group">
                    <button className="flex items-center gap-2 px-5 py-2.5 bg-white dark:bg-white/5 border border-[#0B0B0F]/5 dark:border-white/5 rounded-full text-[10px] font-bold hover:border-[#F97316] transition-all">
                      <span className="material-symbols-outlined text-sm">sort</span> SORT BY
                    </button>
                    {/* Sort Dropdown */}
                    <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-[#1A1A1A] rounded-xl shadow-xl border border-[#0B0B0F]/5 dark:border-white/5 overflow-hidden hidden group-hover:block z-50">
                      {['name', 'price-low', 'price-high', 'newest'].map(opt => (
                        <button
                          key={opt}
                          onClick={() => setFilters({ ...filters, sortBy: opt })}
                          className="block w-full text-left px-4 py-3 text-xs font-bold uppercase tracking-wider hover:bg-[#F97316] hover:text-white transition-colors"
                        >
                          {opt.replace('-', ' ').toUpperCase()}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Mobile Sort/Filter Bar */}
              <div className="md:hidden flex justify-between items-center mb-6">
                <p className="text-[10px] font-bold tracking-widest text-gray-400 uppercase">{totalProducts} SCROLLS FOUND</p>
                <div className="flex gap-2">
                  <button className="flex items-center gap-2 px-5 py-2.5 bg-[#0B0B0F] text-white rounded-full text-[10px] font-bold" onClick={() => setShowFilters(true)}>
                    <span className="material-symbols-outlined text-sm">tune</span> FILTER
                  </button>
                </div>
              </div>

              {/* Grid */}
              <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-x-4 gap-y-8 md:gap-y-12">
                {loading ? (
                  Array.from({ length: 9 }).map((_, i) => (
                    <div key={i} className="animate-pulse">
                      <div className="bg-gray-200 dark:bg-gray-800 aspect-[3/4] rounded-xl mb-4"></div>
                      <div className="h-4 bg-gray-200 dark:bg-gray-800 w-3/4 mb-2"></div>
                      <div className="h-3 bg-gray-200 dark:bg-gray-800 w-1/2"></div>
                    </div>
                  ))
                ) : products.map((product: any, index) => (
                  <motion.div
                    key={product.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    ref={index === products.length - 1 ? lastProductElementRef : null}
                  >
                    <ProductCard
                      product={{
                        ...product,
                        image: product.images?.[0] || product.image || '/placeholder.svg',
                        slug: product.sku || product.id
                      }}
                      index={index}
                      icon="bolt"
                      onQuickView={() => handleQuickView(product)}
                      onViewDetail={() => handleViewDetail(product)}
                    />
                  </motion.div>
                ))}
              </div>

              {isLoadingMore && (
                <div className="flex justify-center py-12">
                  <div className="w-8 h-8 border-2 border-[#F97316] border-t-transparent rounded-full animate-spin"></div>
                </div>
              )}
            </div>
          </div>

          {/* Summoning Footer Animation Block */}
          <div className="mt-24 mb-16 relative flex flex-col items-center justify-center py-20 overflow-hidden">
            <div className="absolute inset-0 pointer-events-none">
              <div className="absolute top-1/4 left-1/3 w-1 h-1 bg-[#0B0B0F] dark:bg-white rounded-full animate-float-particle opacity-0" style={{ animationDelay: '0.2s' }}></div>
              <div className="absolute top-1/2 left-1/4 w-1.5 h-1.5 bg-[#9CA3AF] rounded-full animate-float-particle opacity-0" style={{ animationDelay: '1.1s' }}></div>
              <div className="absolute bottom-1/4 right-1/3 w-2 h-2 bg-[#0B0B0F] dark:bg-white rounded-sm rotate-45 animate-float-particle opacity-0" style={{ animationDelay: '0.7s' }}></div>
              <div className="absolute top-2/3 right-1/4 w-1 h-1 bg-[#9CA3AF] rounded-full animate-float-particle opacity-0" style={{ animationDelay: '2.3s' }}></div>
              <div className="absolute top-1/2 right-1/2 w-1.5 h-1.5 bg-[#F97316]/40 rounded-full animate-float-particle opacity-0" style={{ animationDelay: '1.5s' }}></div>
            </div>

            <div className="relative w-48 h-48 md:w-64 md:h-64 flex items-center justify-center animate-seal-pulse">
              <svg className="w-full h-full text-[#F97316] animate-seal-spin" fill="none" viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
                <circle cx="100" cy="100" r="95" stroke="currentColor" strokeDasharray="10 5" strokeWidth="1.5"></circle>
                <circle cx="100" cy="100" r="85" stroke="currentColor" strokeWidth="1"></circle>
                <circle cx="100" cy="100" r="82" stroke="currentColor" strokeWidth="0.5"></circle>
                <path d="M100 15L173.6 157.5H26.4L100 15Z" stroke="currentColor" strokeWidth="1.5"></path>
                <path d="M100 185L26.4 42.5H173.6L100 185Z" stroke="currentColor" strokeWidth="1.5"></path>
                <circle cx="100" cy="100" r="30" stroke="currentColor" strokeWidth="2"></circle>
                <path d="M100 70V130M70 100H130" stroke="currentColor" strokeWidth="1"></path>
                <rect fill="currentColor" height="2" width="10" x="95" y="10"></rect>
                <rect fill="currentColor" height="2" width="10" x="95" y="188"></rect>
              </svg>
              <div className="absolute inset-0 rounded-full bg-[#F97316]/5 blur-3xl animate-pulse"></div>
            </div>

            <div className="mt-8 z-10 flex flex-col items-center">
              <span className="text-[10px] font-bold tracking-[0.8em] text-[#F97316] uppercase mb-1">Kuchiyose no Jutsu</span>
              <p className="text-[9px] font-bold tracking-[0.3em] text-[#9CA3AF] uppercase">Summoning gear from the void...</p>
            </div>
          </div>
        </main>

        {/* Mobile Filter Drawer */}
        <div className={`fixed inset-0 z-[60] lg:hidden ${showFilters ? 'pointer-events-auto' : 'pointer-events-none'}`}>
          <div
            className={`absolute inset-0 bg-[#0B0B0F]/60 backdrop-blur-sm transition-opacity duration-300 ${showFilters ? 'opacity-100' : 'opacity-0'}`}
            onClick={() => setShowFilters(false)}
          ></div>

          <div className={`absolute bottom-0 left-0 right-0 bg-white dark:bg-[#1A1A1A] rounded-t-[2.5rem] p-8 shadow-2xl transition-transform duration-500 flex flex-col max-h-[85vh] ${showFilters ? 'translate-y-0' : 'translate-y-full'}`}>
            <div className="w-12 h-1 bg-gray-200 dark:bg-gray-700 rounded-full mx-auto mb-8"></div>
            <div className="flex justify-between items-center mb-8">
              <h3 className="font-bebas text-3xl tracking-tighter italic text-[#0B0B0F] dark:text-white">FILTERS</h3>
              <button onClick={() => setShowFilters(false)} className="material-symbols-outlined text-gray-400">close</button>
            </div>

            <div className="flex flex-col gap-6 overflow-y-auto no-scrollbar pb-10">
              <span className="text-sm font-bold uppercase tracking-widest text-gray-500">Categories</span>
              {categories.map(cat => (
                <div key={cat} className="flex items-center" onClick={() => setSelectedCategory(cat)}>
                  <div className="flex items-center justify-between w-full cursor-pointer py-2">
                    <span className={`font-bebas text-2xl tracking-wide uppercase ${selectedCategory === cat ? 'text-[#F97316]' : 'text-[#0B0B0F] dark:text-white'}`}>{cat}</span>
                    {selectedCategory === cat && <div className="w-3 h-3 rounded-full bg-[#F97316]"></div>}
                  </div>
                </div>
              ))}

              <button className="mt-8 w-full bg-[#F97316] text-white py-5 rounded-full font-bold tracking-[0.2em] uppercase text-sm" onClick={() => setShowFilters(false)}>
                Apply Filter
              </button>
            </div>
          </div>
        </div>

        {/* Quick View Modal */}
        {isQuickViewOpen && quickViewProduct && (
          <QuickViewModal
            product={quickViewProduct}
            isOpen={isQuickViewOpen}
            onClose={closeQuickView}
          />
        )}
      </div>
    </div>
  );
};

export default Products;