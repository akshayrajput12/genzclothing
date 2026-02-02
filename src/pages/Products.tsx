import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Filter, Search, Shirt, X, ChevronDown, SlidersHorizontal } from 'lucide-react';
import { useStore } from '../store/useStore';
import ProductCard from '../components/ProductCard';
import ProductFiltersComponent, { ProductFilters } from '../components/ProductFilters';
import QuickViewModal from '../components/QuickViewModal';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { scrollToTopInstant } from '@/utils/scrollToTop';
import { Button } from '@/components/ui/button';

const Products = () => {
  const { selectedCategory, setSelectedCategory } = useStore();
  const [sortBy, setSortBy] = useState('name');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [searchTerm, setSearchTerm] = useState('');
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState(['All']);
  const [loading, setLoading] = useState(true);
  const [totalProducts, setTotalProducts] = useState(0);
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState<ProductFilters>({
    categories: [],
    priceRange: [0, 50000],
    features: [],
    rating: 0,
    inStock: false,
    isBestseller: false,
    sortBy: 'name',
  });

  // Quick View State
  const [selectedQuickViewProduct, setSelectedQuickViewProduct] = useState<any>(null);
  const [isQuickViewOpen, setIsQuickViewOpen] = useState(false);

  // Pagination states
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const observer = useRef<IntersectionObserver | null>(null);
  const lastProductRef = useRef<HTMLDivElement>(null);

  const navigate = useNavigate();
  const location = useLocation();

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

      if (filters.categories.length > 0) {
        const { data: categoryData, error: categoryError } = await supabase
          .from('categories')
          .select('id')
          .eq('name', filters.categories[0])
          .single();

        if (!categoryError && categoryData) {
          countQuery = countQuery.eq('category_id', categoryData.id);
        }
      }

      if (filters.priceRange[0] > 0) countQuery = countQuery.gte('price', filters.priceRange[0]);
      if (filters.priceRange[1] < 50000) countQuery = countQuery.lte('price', filters.priceRange[1]);
      if (filters.inStock) countQuery = countQuery.gt('stock_quantity', 0);
      if (filters.isBestseller) countQuery = countQuery.eq('is_bestseller', true);

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
      if (filters.categories.length > 0) {
        const { data: categoryData, error: categoryError } = await supabase
          .from('categories')
          .select('id')
          .eq('name', filters.categories[0])
          .single();
        if (!categoryError && categoryData) query = query.eq('category_id', categoryData.id);
      }

      if (filters.priceRange[0] > 0) query = query.gte('price', filters.priceRange[0]);
      if (filters.priceRange[1] < 50000) query = query.lte('price', filters.priceRange[1]);
      if (filters.inStock) query = query.gt('stock_quantity', 0);
      if (filters.isBestseller) query = query.eq('is_bestseller', true);

      const sortOption = filters.sortBy || sortBy;
      switch (sortOption) {
        case 'name-desc': query = query.order('name', { ascending: false }); break;
        case 'price-low': query = query.order('price', { ascending: true }); break;
        case 'price-high': query = query.order('price', { ascending: false }); break;
        case 'rating': query = query.order('rating', { ascending: false }); break;
        case 'newest': query = query.order('created_at', { ascending: false }); break;
        case 'bestseller': query = query.order('is_bestseller', { ascending: false }); break;
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
      const { data, error } = await supabase
        .from('categories')
        .select('name')
        .eq('is_active', true);
      if (error) throw error;
      const categoryNames = data?.map(cat => cat.name) || [];
      setCategories(['All', ...categoryNames]);
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  const sortedProducts = products;

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

  // Quick View Handlers
  const handleQuickView = (product: any) => {
    setSelectedQuickViewProduct(product);
    setIsQuickViewOpen(true);
  };

  const closeQuickView = () => {
    setIsQuickViewOpen(false);
    setSelectedQuickViewProduct(null);
  };

  return (
    <div className="min-h-screen bg-[var(--color-bg)] text-[var(--color-dark)] relative font-Tenor">

      {/* Quick View Modal */}
      <QuickViewModal
        isOpen={isQuickViewOpen}
        onClose={closeQuickView}
        product={selectedQuickViewProduct}
      />

      {/* Mobile Filter Overlay */}
      <AnimatePresence>
        {showFilters && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/60 z-40 backdrop-blur-sm"
              onClick={() => setShowFilters(false)}
            />
            <motion.div
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed top-0 left-0 h-full w-80 bg-[var(--color-light)] shadow-2xl z-50 overflow-hidden flex flex-col"
            >
              <div className="p-6 border-b border-[var(--color-secondary)]/10 flex justify-between items-center bg-white/50">
                <h3 className="text-xl font-serif text-[var(--color-primary)]">Filters</h3>
                <button onClick={() => setShowFilters(false)} className="text-[var(--color-accent)] hover:text-[var(--color-primary)] transition-colors">
                  <X className="w-6 h-6" />
                </button>
              </div>
              <div className="flex-1 overflow-y-auto p-6">
                <ProductFiltersComponent onFiltersChange={setFilters} categories={categories} />
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Main Content */}
      <div className="container mx-auto px-4 lg:px-8 pt-8 pb-20">

        {/* Header Breadcrumb & Title */}
        <div className="flex flex-col items-center text-center mb-12 space-y-4">
          <div className="flex items-center space-x-2 text-xs uppercase tracking-widest text-[var(--color-accent)]/80">
            <Link to="/" className="hover:text-[var(--color-primary)] transition-colors">Home</Link>
            <span>/</span>
            <span className="text-[var(--color-dark)] font-medium">Collection</span>
          </div>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-serif text-[var(--color-dark)] tracking-tight">
            {selectedCategory === 'All' ? 'The Collection' : selectedCategory}
          </h1>
          <p className="max-w-xl text-[var(--color-accent)] text-sm md:text-base leading-relaxed">
            Discover our curated selection of premium ethnic wear, where tradition meets contemporary elegance.
          </p>
        </div>

        {/* Categories Toolbar */}
        <div className="sticky top-0 z-30 bg-[var(--color-bg)]/95 backdrop-blur-md py-4 border-b border-[var(--color-secondary)]/10 mb-8 transition-all duration-300">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">

            {/* Horizontal Categories Scroll */}
            <div className="w-full md:w-auto overflow-x-auto scrollbar-hide">
              <div className="flex space-x-8 px-2 min-w-max">
                {categories.map((category) => (
                  <button
                    key={category}
                    onClick={() => setSelectedCategory(category)}
                    className={`relative pb-1 text-sm uppercase tracking-widest transition-all duration-300 ${selectedCategory === category
                      ? 'text-[var(--color-primary)] font-semibold'
                      : 'text-[var(--color-accent)] hover:text-[var(--color-dark)]'
                      }`}
                  >
                    {category}
                    {selectedCategory === category && (
                      <motion.div
                        layoutId="activeCategory"
                        className="absolute bottom-0 left-0 right-0 h-[2px] bg-[var(--color-primary)]"
                        initial={false}
                        transition={{ type: "spring", stiffness: 500, damping: 30 }}
                      />
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* Controls Right */}
            <div className="flex items-center gap-3 w-full md:w-auto justify-end">
              {/* Search Input */}
              <div className="relative group hidden sm:block">
                <input
                  type="text"
                  placeholder="Search..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="bg-transparent border-b border-[var(--color-secondary)]/30 pl-8 pr-4 py-1 text-sm focus:outline-none focus:border-[var(--color-primary)] transition-colors w-40 focus:w-60"
                />
                <Search className="absolute left-0 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--color-accent)] group-focus-within:text-[var(--color-primary)] transition-colors" />
              </div>

              {/* Filter Button */}
              <button
                onClick={() => setShowFilters(true)}
                className="flex items-center gap-2 px-4 py-2 border border-[var(--color-secondary)]/30 hover:border-[var(--color-primary)] text-[var(--color-dark)] hover:text-[var(--color-primary)] transition-all uppercase tracking-wider text-xs font-medium rounded-sm"
              >
                <SlidersHorizontal className="w-4 h-4" />
                <span className="hidden sm:inline">Filters</span>
              </button>
            </div>
          </div>

          {/* Mobile Search - Visible only on mobile */}
          <div className="relative group mt-4 sm:hidden w-full">
            <input
              type="text"
              placeholder="Search collection..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-transparent border-b border-[var(--color-secondary)]/30 pl-8 pr-4 py-2 text-sm focus:outline-none focus:border-[var(--color-primary)] transition-colors"
            />
            <Search className="absolute left-0 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--color-accent)]" />
          </div>
        </div>

        {/* Results Count & Sort */}
        <div className="flex justify-between items-center mb-6 text-xs text-[var(--color-accent)] uppercase tracking-widest px-2">
          <span>Showing {sortedProducts.length} items</span>
          {/* Sort Dropdown could go here if needed, keeping it clean for now */}
        </div>

        {/* Products Grid */}
        <div className={`grid gap-x-6 gap-y-10 ${viewMode === 'grid' ? 'grid-cols-2 md:grid-cols-3 lg:grid-cols-4' : 'grid-cols-1'}`}>
          {loading ? (
            Array.from({ length: 8 }).map((_, index) => (
              <div key={index} className="animate-pulse flex flex-col space-y-4">
                <div className="bg-[var(--color-secondary)]/10 aspect-[4/5] w-full rounded-sm"></div>
                <div className="h-4 bg-[var(--color-secondary)]/10 w-3/4 mx-auto"></div>
                <div className="h-4 bg-[var(--color-secondary)]/10 w-1/2 mx-auto"></div>
              </div>
            ))
          ) : sortedProducts.length > 0 ? (
            <>
              {sortedProducts.map((product: any, index) => (
                <motion.div
                  key={product.id}
                  ref={index === sortedProducts.length - 1 ? lastProductElementRef : null}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.05 }}
                >
                  <ProductCard
                    product={{
                      ...product,
                      image: product.images?.[0] || '/placeholder.svg',
                      slug: product.sku || product.id,
                      category: product.categories?.name || product.category?.name || 'Couture',
                      originalPrice: product.original_price,
                      isBestSeller: product.is_bestseller
                    }}
                    onViewDetail={() => navigate(`/product/${product.sku || product.id}`)}
                    onQuickView={() => handleQuickView({
                      ...product,
                      image: product.images?.[0] || '/placeholder.svg',
                      slug: product.sku || product.id,
                      category: product.categories?.name || product.category?.name || 'Couture',
                      originalPrice: product.original_price
                    })}
                  />
                </motion.div>
              ))}
            </>
          ) : (
            <div className="col-span-full py-20 text-center">
              <div className="inline-flex items-center justify-center p-6 rounded-full bg-[var(--color-secondary)]/5 mb-6">
                <Shirt className="w-10 h-10 text-[var(--color-primary)]" />
              </div>
              <h3 className="text-2xl font-serif text-[var(--color-dark)] mb-3">No pieces found</h3>
              <p className="text-[var(--color-accent)] mb-8 max-w-md mx-auto">
                We couldn't find any items matching your criteria. Try adjusting your filters or browsing our full collection.
              </p>
              <Button
                onClick={() => {
                  setSelectedCategory('All');
                  setSearchTerm('');
                  setFilters({ ...filters, categories: [] });
                }}
                className="bg-[var(--color-primary)] text-white hover:bg-[var(--color-secondary)] px-8 py-3 rounded-none uppercase tracking-widest text-xs"
              >
                View All Items
              </Button>
            </div>
          )}
        </div>

        {/* Loading More Spinner */}
        {isLoadingMore && (
          <div className="flex justify-center py-12">
            <div className="w-8 h-8 border-2 border-[var(--color-primary)] border-t-transparent rounded-full animate-spin"></div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Products;