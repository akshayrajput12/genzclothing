import { useState, useEffect } from 'react';
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
      // Fallback defaults
      setAvailableFeatures([
        'Cotton', 'Silk', 'Zari', 'Embroidered', 'Festive',
        'Casual', 'Bridal', 'Sustainable', 'Designer', 'Limited'
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
    <div className={`${className} font-display`}>
      <div className="space-y-10">

        {/* Header Section */}
        <div className="flex items-center justify-between border-b-2 border-[#F97316]/20 pb-4 relative">
          <div className="absolute bottom-[-2px] left-0 w-1/3 h-[2px] bg-[#F97316]"></div>
          <h3 className="font-bebas text-2xl text-[#0B0B0F] dark:text-white tracking-wider flex items-center gap-2 italic">
            <span className="material-symbols-outlined text-[#F97316]">filter_alt</span>
            REFINE GEAR
          </h3>
          {activeFiltersCount > 0 && (
            <button
              onClick={clearAllFilters}
              className="text-[10px] font-bold uppercase tracking-widest text-[#EF4444] hover:text-[#F97316] transition-colors flex items-center gap-1 group"
            >
              <span className="material-symbols-outlined text-sm group-hover:rotate-180 transition-transform">restart_alt</span>
              RESET
            </button>
          )}
        </div>

        {/* Categories - GenZ Tag Style */}
        <div className="space-y-4">
          <h4 className="font-bebas text-lg text-gray-400 tracking-widest uppercase flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-[#F97316]"></span>
            CATEGORIES
          </h4>
          <div className="flex flex-wrap gap-2">
            {categories.filter(c => c !== 'All').map((category) => {
              const isActive = filters.categories.includes(category);
              return (
                <button
                  key={category}
                  onClick={() => toggleCategory(category)}
                  className={`px-3 py-1.5 text-xs font-bold uppercase tracking-wider skew-x-[-10deg] transition-all duration-300 border ${isActive
                      ? 'bg-[#F97316] text-white border-[#F97316] shadow-[4px_4px_0px_#000000] dark:shadow-[4px_4px_0px_#FFFFFF]'
                      : 'bg-transparent text-gray-500 border-gray-300 dark:border-gray-700 hover:border-[#F97316] hover:text-[#F97316]'
                    }`}
                >
                  <div className="skew-x-[10deg]">{category}</div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Price Range - Cyberpunk Slider */}
        <div className="space-y-6">
          <h4 className="font-bebas text-lg text-gray-400 tracking-widest uppercase flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-[#F97316]"></span>
            BOUNTY RANGE (₹)
          </h4>
          <div className="px-2">
            <input
              type="range"
              min="0"
              max="50000"
              step="1000"
              value={filters.priceRange[1]}
              onChange={(e) => updateFilters({ priceRange: [filters.priceRange[0], parseInt(e.target.value)] })}
              className="w-full h-1 bg-gray-200 dark:bg-gray-800 rounded-lg appearance-none cursor-pointer accent-[#F97316]"
            />
            <div className="flex justify-between mt-3 font-mono text-xs font-bold text-[#F97316]">
              <span>₹0</span>
              <span className="bg-[#F97316]/10 px-2 py-1 rounded border border-[#F97316]/20">
                UP TO ₹{filters.priceRange[1].toLocaleString()}
              </span>
              <span>₹50k+</span>
            </div>
          </div>

          {/* Quick Action Chips */}
          <div className="grid grid-cols-2 gap-2">
            {[
              { label: 'Under ₹2k', max: 2000 },
              { label: 'Under ₹5k', max: 5000 },
              { label: 'Under ₹10k', max: 10000 },
              { label: 'Premium', max: 50000 }
            ].map((pf, i) => (
              <button
                key={i}
                onClick={() => updateFilters({ priceRange: [0, pf.max] })}
                className="text-[10px] font-bold uppercase tracking-wide py-2 border border-dashed border-gray-300 dark:border-gray-700 hover:border-[#F97316] hover:text-[#F97316] transition-colors rounded-sm"
              >
                {pf.label}
              </button>
            ))}
          </div>
        </div>

        {/* Features - Custom Checkbox List */}
        <div className="space-y-4">
          <h4 className="font-bebas text-lg text-gray-400 tracking-widest uppercase flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-[#F97316]"></span>
            ATTRIBUTES
          </h4>
          <div className="space-y-2 max-h-48 overflow-y-auto pr-2 custom-scrollbar">
            {loadingFeatures ? (
              <div className="animate-pulse space-y-2">
                <div className="h-6 bg-gray-100 dark:bg-gray-800 rounded w-3/4"></div>
                <div className="h-6 bg-gray-100 dark:bg-gray-800 rounded w-1/2"></div>
              </div>
            ) : availableFeatures.map((feature) => {
              const isChecked = filters.features.includes(feature);
              return (
                <label key={feature} className="flex items-center gap-3 cursor-pointer group p-2 hover:bg-[#F97316]/5 transition-colors rounded">
                  <div className={`relative w-4 h-4 border-2 transition-colors duration-300 ${isChecked ? 'border-[#F97316] bg-[#F97316]' : 'border-gray-300 dark:border-gray-600 group-hover:border-[#F97316]'}`}>
                    {isChecked && (
                      <span className="absolute inset-0 flex items-center justify-center text-white text-[10px] material-symbols-outlined font-bold">check</span>
                    )}
                  </div>
                  <input
                    type="checkbox"
                    className="hidden"
                    checked={isChecked}
                    onChange={() => toggleFeature(feature)}
                  />
                  <span className={`text-xs font-bold uppercase tracking-wide transition-colors ${isChecked ? 'text-[#F97316]' : 'text-gray-500 dark:text-gray-400 group-hover:text-[#F97316]'}`}>
                    {feature}
                  </span>
                </label>
              );
            })}
          </div>
        </div>

        {/* Status Toggles - Switch Style */}
        <div className="space-y-3 pt-4 border-t border-dashed border-gray-200 dark:border-gray-800">
          {[
            { id: 'inStock', label: 'IN STOCK ONLY', checked: filters.inStock },
            { id: 'isBestseller', label: 'BESTSELLERS', checked: filters.isBestseller }
          ].map((toggle) => (
            <div key={toggle.id} className="flex items-center justify-between group cursor-pointer" onClick={() => updateFilters({ [toggle.id]: !toggle.checked })}>
              <span className={`text-xs font-bold uppercase tracking-widest group-hover:text-[#F97316] transition-colors ${toggle.checked ? 'text-[#0B0B0F] dark:text-white' : 'text-gray-400'}`}>
                {toggle.label}
              </span>
              <div className={`w-10 h-5 rounded-full relative transition-colors duration-300 ${toggle.checked ? 'bg-[#F97316]' : 'bg-gray-200 dark:bg-gray-700'}`}>
                <div className={`absolute top-1 w-3 h-3 bg-white rounded-full transition-all duration-300 ${toggle.checked ? 'left-6 shadow-sm' : 'left-1'}`}></div>
              </div>
            </div>
          ))}
        </div>

      </div>
    </div>
  );
};

export default ProductFiltersComponent;