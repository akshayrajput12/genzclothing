import { useState, useEffect } from 'react';
import { Filter, X, ChevronDown, Star } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Slider } from '@/components/ui/slider';
import { Badge } from '@/components/ui/badge';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { supabase } from '@/integrations/supabase/client';

export interface ProductFilters {
  categories: string[];
  priceRange: [number, number];
  features: string[];
  rating: number;
  inStock: boolean;
  isBestseller: boolean;
  sortBy: string;
}

interface ProductFiltersProps {
  onFiltersChange: (filters: ProductFilters) => void;
  categories: string[];
  className?: string;
}

const ProductFiltersComponent = ({ onFiltersChange, categories, className = "" }: ProductFiltersProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [filters, setFilters] = useState<ProductFilters>({
    categories: [],
    priceRange: [0, 50000],
    features: [],
    rating: 0,
    inStock: false,
    isBestseller: false,
    sortBy: 'name',
  });

  const [availableFeatures, setAvailableFeatures] = useState<string[]>([]);
  const [loadingFeatures, setLoadingFeatures] = useState(true);

  useEffect(() => {
    fetchAvailableFeatures();
  }, []);

  const fetchAvailableFeatures = async () => {
    try {
      const { data, error } = await supabase
        .from('product_features')
        .select('name')
        .eq('is_active', true)
        .order('name');

      if (error) throw error;
      setAvailableFeatures(data?.map(f => f.name) || []);
    } catch (error) {
      console.error('Error fetching features:', error);
      // Fallback to clothing-specific default features
      setAvailableFeatures([
        'Pure Cotton',
        'Silk Blend',
        'Hand Woven',
        'Zari Work',
        'Embroidered',
        'Digital Print',
        'Festive Wear',
        'Casual Chic',
        'Bridal Collection',
        'Sustainable Fabric',
        'Ready to Wear',
        'Custom Tailored',
        'Designer',
        'Limited Edition',
        'Hand Block Print',
        'Banarasi'
      ]);
    } finally {
      setLoadingFeatures(false);
    }
  };

  const updateFilters = (newFilters: Partial<ProductFilters>) => {
    const updatedFilters = { ...filters, ...newFilters };
    setFilters(updatedFilters);
    onFiltersChange(updatedFilters);
  };

  const toggleCategory = (category: string) => {
    const newCategories = filters.categories.includes(category)
      ? filters.categories.filter(c => c !== category)
      : [...filters.categories, category];
    updateFilters({ categories: newCategories });
  };

  const toggleFeature = (feature: string) => {
    const newFeatures = filters.features.includes(feature)
      ? filters.features.filter(f => f !== feature)
      : [...filters.features, feature];
    updateFilters({ features: newFeatures });
  };

  const clearAllFilters = () => {
    const clearedFilters: ProductFilters = {
      categories: [],
      priceRange: [0, 50000],
      features: [],
      rating: 0,
      inStock: false,
      isBestseller: false,
      sortBy: 'name',
    };
    setFilters(clearedFilters);
    onFiltersChange(clearedFilters);
  };

  const getActiveFiltersCount = () => {
    let count = 0;
    if (filters.categories.length > 0) count++;
    if (filters.priceRange[0] > 0 || filters.priceRange[1] < 50000) count++;
    if (filters.features.length > 0) count++;
    if (filters.rating > 0) count++;
    if (filters.inStock) count++;
    if (filters.isBestseller) count++;
    return count;
  };

  const activeFiltersCount = getActiveFiltersCount();

  return (
    <div className={className}>
      {/* Mobile Filter Toggle */}
      <div className="lg:hidden mb-4">
        <Button
          variant="outline"
          onClick={() => setIsOpen(!isOpen)}
          className="w-full justify-between font-serif text-[var(--color-dark)]"
        >
          <div className="flex items-center space-x-2">
            <Filter className="w-4 h-4" />
            <span>Refine Selection</span>
            {activeFiltersCount > 0 && (
              <Badge variant="secondary" className="bg-[var(--color-primary)] text-white">{activeFiltersCount}</Badge>
            )}
          </div>
          <ChevronDown className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
        </Button>
      </div>

      {/* Filter Content */}
      <div className={`${isOpen ? 'block' : 'hidden'} lg:block`}>
        <div className="space-y-8">
          <div className="flex items-center justify-between border-b border-[var(--color-secondary)]/20 pb-4">
            <h3 className="font-serif text-lg text-[var(--color-dark)]">Refine By</h3>
            {activeFiltersCount > 0 && (
              <button
                onClick={clearAllFilters}
                className="text-xs uppercase tracking-widest text-[var(--color-destructive)] hover:text-[var(--color-dark)] transition-colors underline"
              >
                Clear All
              </button>
            )}
          </div>

          {/* Categories */}
          <div className="space-y-3">
            <h4 className="font-medium text-sm uppercase tracking-wider text-[var(--color-secondary)]">Categories</h4>
            <div className="space-y-2 max-h-48 overflow-y-auto scrollbar-thin scrollbar-thumb-[var(--color-secondary)]/20 pr-2">
              {categories.filter(c => c !== 'All').map((category) => (
                <div key={category} className="flex items-center space-x-3 group">
                  <Checkbox
                    id={`category-${category}`}
                    checked={filters.categories.includes(category)}
                    onCheckedChange={() => toggleCategory(category)}
                    className="border-[var(--color-secondary)]/40 data-[state=checked]:bg-[var(--color-primary)] data-[state=checked]:border-[var(--color-primary)]"
                  />
                  <label
                    htmlFor={`category-${category}`}
                    className="text-sm cursor-pointer text-[var(--color-accent)] group-hover:text-[var(--color-primary)] transition-colors font-light"
                  >
                    {category}
                  </label>
                </div>
              ))}
            </div>
          </div>

          {/* Price Range */}
          <div className="space-y-4">
            <h4 className="font-medium text-sm uppercase tracking-wider text-[var(--color-secondary)]">Price Range</h4>
            <div className="px-2">
              <Slider
                min={0}
                max={50000}
                step={500}
                value={filters.priceRange}
                onValueChange={(value) => updateFilters({ priceRange: value as [number, number] })}
                className="w-full my-4"
              />
            </div>
            <div className="flex justify-between text-sm font-medium text-[var(--color-dark)] px-1">
              <span>₹{filters.priceRange[0].toLocaleString()}</span>
              <span>₹{filters.priceRange[1].toLocaleString()}</span>
            </div>
            {/* Quick price filters */}
            <div className="flex flex-wrap gap-2">
              {[
                { label: 'Under ₹2k', range: [0, 2000] },
                { label: '₹2k - ₹5k', range: [2000, 5000] },
                { label: '₹5k - ₹10k', range: [5000, 10000] },
                { label: 'Above ₹10k', range: [10000, 50000] }
              ].map((pf, i) => (
                <button
                  key={i}
                  onClick={() => updateFilters({ priceRange: pf.range as [number, number] })}
                  className="bg-[var(--color-bg)] hover:bg-[var(--color-secondary)]/10 text-[var(--color-accent)] text-xs py-1 px-3 rounded-full border border-[var(--color-secondary)]/20 transition-all"
                >
                  {pf.label}
                </button>
              ))}
            </div>
          </div>

          {/* Features */}
          <div className="space-y-3">
            <h4 className="font-medium text-sm uppercase tracking-wider text-[var(--color-secondary)]">Collection</h4>
            <div className="space-y-2 max-h-48 overflow-y-auto scrollbar-thin scrollbar-thumb-[var(--color-secondary)]/20 pr-2">
              {loadingFeatures ? (
                <div className="space-y-2">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="flex items-center space-x-2">
                      <div className="w-4 h-4 bg-gray-100 rounded animate-pulse" />
                      <div className="h-4 bg-gray-100 rounded w-24 animate-pulse" />
                    </div>
                  ))}
                </div>
              ) : (
                availableFeatures.map((feature) => (
                  <div key={feature} className="flex items-center space-x-3 group">
                    <Checkbox
                      id={`feature-${feature}`}
                      checked={filters.features.includes(feature)}
                      onCheckedChange={() => toggleFeature(feature)}
                      className="border-[var(--color-secondary)]/40 data-[state=checked]:bg-[var(--color-primary)] data-[state=checked]:border-[var(--color-primary)]"
                    />
                    <label
                      htmlFor={`feature-${feature}`}
                      className="text-sm cursor-pointer text-[var(--color-accent)] group-hover:text-[var(--color-primary)] transition-colors font-light"
                    >
                      {feature}
                    </label>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Additional Filters */}
          <div className="space-y-3 pt-2 border-t border-[var(--color-secondary)]/10">
            <div className="flex items-center space-x-3 group">
              <Checkbox
                id="in-stock"
                checked={filters.inStock}
                onCheckedChange={(checked) => updateFilters({ inStock: !!checked })}
                className="border-[var(--color-secondary)]/40 data-[state=checked]:bg-[var(--color-primary)] data-[state=checked]:border-[var(--color-primary)]"
              />
              <label htmlFor="in-stock" className="text-sm cursor-pointer text-[var(--color-accent)] font-light">
                In Stock Only
              </label>
            </div>
            <div className="flex items-center space-x-3 group">
              <Checkbox
                id="bestseller"
                checked={filters.isBestseller}
                onCheckedChange={(checked) => updateFilters({ isBestseller: !!checked })}
                className="border-[var(--color-secondary)]/40 data-[state=checked]:bg-[var(--color-primary)] data-[state=checked]:border-[var(--color-primary)]"
              />
              <label htmlFor="bestseller" className="text-sm cursor-pointer text-[var(--color-accent)] font-light">
                Bestsellers Only
              </label>
            </div>
          </div>

          {/* Sort Options - Often handled outside but good to have here too */}
          <div className="space-y-3 pt-2 border-t border-[var(--color-secondary)]/10">
            <h4 className="font-medium text-sm uppercase tracking-wider text-[var(--color-secondary)]">Sort By</h4>
            <div className="space-y-2">
              {[
                { value: 'name', label: 'Name (A-Z)' },
                { value: 'price-low', label: 'Price: Low to High' },
                { value: 'price-high', label: 'Price: High to Low' },
                { value: 'newest', label: 'Newest Arrivals' }
              ].map((option) => (
                <div key={option.value} className="flex items-center space-x-3">
                  <Checkbox
                    id={`sort-${option.value}`}
                    checked={filters.sortBy === option.value}
                    onCheckedChange={(checked) =>
                      updateFilters({ sortBy: checked ? option.value : 'name' })
                    }
                    className="rounded-full border-[var(--color-secondary)]/40 data-[state=checked]:bg-[var(--color-primary)] data-[state=checked]:border-[var(--color-primary)]"
                  />
                  <label
                    htmlFor={`sort-${option.value}`}
                    className="text-sm cursor-pointer text-[var(--color-accent)] font-light"
                  >
                    {option.label}
                  </label>
                </div>
              ))}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default ProductFiltersComponent;