import { useParams, useNavigate, Link } from 'react-router-dom';
import { useState, useEffect } from 'react';
import {
  Heart,
  Tag,
  Minus,
  Plus,
  Truck,
  ShieldCheck,
  Globe,
  Ruler,
  ChevronDown
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useStore } from '@/store/useStore';
import { formatPrice, calculateDiscount } from '@/utils/currency';
import ProductCard from '@/components/ProductCard';
import { supabase } from '@/integrations/supabase/client';
import { scrollToTopInstant } from '@/utils/scrollToTop';

const ProductDetail = () => {
  const { slug } = useParams();
  const navigate = useNavigate();
  const [quantity, setQuantity] = useState(1);
  const [isFavorite, setIsFavorite] = useState(false);
  const [product, setProduct] = useState<any>(null);
  const [relatedProducts, setRelatedProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  // Use first 3 images for the new layout (1 large, 2 small)
  const [selectedSize, setSelectedSize] = useState<string | null>(null);
  const [isTailored, setIsTailored] = useState(false);
  const [availableCoupons, setAvailableCoupons] = useState<any[]>([]);

  const { addToCart } = useStore();
  const { toast } = useToast();

  useEffect(() => {
    scrollToTopInstant();
    if (slug) {
      fetchProduct();
    }
  }, [slug]);

  const fetchProduct = async () => {
    try {
      let { data, error } = await supabase
        .from('products')
        .select(`*, categories(name)`)
        .eq('sku', slug)
        .eq('is_active', true)
        .single();

      if (error && error.code === 'PGRST116') {
        ({ data, error } = await supabase
          .from('products')
          .select(`*, categories(name)`)
          .eq('id', slug)
          .eq('is_active', true)
          .single());
      }

      if (error) throw error;
      setProduct(data);

      if (data?.category_id) {
        fetchRelatedProducts(data.category_id, data.id);
      }
      fetchProductCoupons(data.id);
    } catch (error) {
      console.error('Error fetching product:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchRelatedProducts = async (categoryId: string, productId: string) => {
    try {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('category_id', categoryId)
        .neq('id', productId)
        .eq('is_active', true)
        .limit(4); // Match the 4-column grid in HTML

      if (error) throw error;
      setRelatedProducts(data || []);
    } catch (error) {
      console.error('Error fetching related products:', error);
    }
  };

  const fetchProductCoupons = async (productId: string) => {
    try {
      const { data: productCoupons, error } = await supabase
        .from('product_coupons')
        .select(`
          coupon_id,
          coupons (
            id,
            code,
            description,
            discount_type,
            discount_value,
            min_order_amount,
            is_active,
            valid_until
          )
        `)
        .eq('product_id', productId);

      if (error) throw error;

      const coupons = productCoupons
        ?.map((pc: any) => pc.coupons)
        .filter((c: any) => c && c.is_active && new Date(c.valid_until) > new Date()) || [];

      setAvailableCoupons(coupons);
    } catch (error) {
      console.error('Error fetching coupons:', error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background-light dark:bg-background-dark flex items-center justify-center">
        <div className="w-12 h-12 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-background-light dark:bg-background-dark flex flex-col items-center justify-center text-primary dark:text-white">
        <h1 className="text-3xl font-display font-medium mb-4">Product not found</h1>
        <button
          onClick={() => navigate('/products')}
          className="bg-primary text-white hover:bg-black/90 px-8 py-3 rounded-full uppercase tracking-widest font-bold text-xs"
        >
          Return to Shop
        </button>
      </div>
    );
  }

  const handleAddToCart = () => {
    if (!selectedSize && !isTailored) {
      toast({
        title: "Please select a size",
        description: "You must select a size or choose custom fit to proceed.",
        variant: "destructive",
      });
      return;
    }

    const productToAdd = {
      ...product,
      image: product.images?.[0] || '/placeholder.svg',
      slug: product.sku || product.id,
      category: product.categories?.name || 'Unknown',
      inStock: product.stock_quantity > 0,
    };

    const sizeToAdd = isTailored ? 'Custom Fit' : (selectedSize || 'Standard');

    for (let i = 0; i < quantity; i++) {
      addToCart(productToAdd, sizeToAdd);
    }

    toast({
      title: "Added to cart",
      description: `${product.name} (${sizeToAdd}) has been added to your cart.`,
    });
  };

  const discountPercentage = product.original_price
    ? calculateDiscount(product.original_price, product.price)
    : 0;

  const sizes = product?.available_sizes?.length > 0
    ? product.available_sizes
    : ['XS', 'S', 'M', 'L', 'XL', 'XXL'];

  // Images logic
  const mainImage = product.images?.[0] || '/placeholder.svg';
  const smallImage1 = product.images?.[1] || product.images?.[0];
  const smallImage2 = product.images?.[2] || product.images?.[0]; // Fallbacks if not enough images

  // Calculate savings
  const savings = product.original_price ? product.original_price - product.price : 0;

  return (
    <div className="font-sans bg-background-light dark:bg-background-dark text-primary dark:text-white transition-colors duration-300">
      <main className="pt-24 pb-20 px-4 md:px-12 max-w-7xl mx-auto">
        <div className="flex flex-col lg:flex-row gap-12 relative">

          {/* Left Column: Images */}
          <div className="w-full lg:w-3/5 space-y-4">
            <div className="relative overflow-hidden rounded-2xl aspect-[3/4] group">
              <img
                alt={product.name}
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                src={mainImage}
              />
              <div className="absolute top-6 left-6 flex flex-col gap-2">
                {product.is_bestseller && (
                  <span className="bg-primary text-white text-[10px] uppercase tracking-widest px-3 py-1 rounded-full font-bold">Bestseller</span>
                )}
                {discountPercentage > 0 && (
                  <span className="bg-accent text-primary text-[10px] uppercase tracking-widest px-3 py-1 rounded-full font-bold">-{discountPercentage}% Off</span>
                )}
              </div>
            </div>

            {/* Secondary Images Grid */}
            {product.images?.length > 1 && (
              <div className="grid grid-cols-2 gap-4">
                <img
                  alt="Detail view 1"
                  className="rounded-xl aspect-square object-cover"
                  src={smallImage1}
                />
                <img
                  alt="Detail view 2"
                  className="rounded-xl aspect-square object-cover"
                  src={smallImage2}
                />
              </div>
            )}
          </div>

          {/* Right Column: Info - Sticky */}
          <div className="w-full lg:w-2/5 lg:sticky lg:top-32 h-fit">
            <div className="glass p-8 rounded-2xl border border-black/5 dark:border-white/10 shadow-xl shadow-black/5">

              <div className="flex justify-between items-start mb-2">
                <span className="text-xs uppercase tracking-widest font-bold opacity-60">
                  {product.categories?.name || 'Collection'} • {product.sku?.slice(0, 8)}
                </span>
                <button
                  onClick={() => setIsFavorite(!isFavorite)}
                  className="rounded-full hover:bg-black/5 dark:hover:bg-white/5 transition-colors p-1"
                >
                  <Heart className={`w-6 h-6 transition-colors ${isFavorite ? "fill-red-500 text-red-500" : "hover:text-red-500"}`} />
                </button>
              </div>

              <h1 className="text-4xl md:text-5xl font-display font-medium mb-4 leading-tight">
                {product.name}
              </h1>

              <div className="flex items-center gap-4 mb-8">
                <span className="text-3xl font-bold">{formatPrice(product.price)}</span>
                {product.original_price > product.price && (
                  <span className="text-xl line-through opacity-40 font-light">{formatPrice(product.original_price)}</span>
                )}
                {savings > 0 && (
                  <span className="bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider">
                    Save {formatPrice(savings)}
                  </span>
                )}
              </div>

              {/* Sizes */}
              <div className="mb-8">
                <div className="flex justify-between items-center mb-4">
                  <label className="text-xs uppercase tracking-widest font-bold">Select Size</label>
                  <button className="text-xs flex items-center gap-1 opacity-60 hover:opacity-100 transition-opacity">
                    <Ruler className="w-4 h-4" /> Size Guide
                  </button>
                </div>
                <div className="flex flex-wrap gap-3">
                  {sizes.map((size: string) => (
                    <button
                      key={size}
                      onClick={() => { setSelectedSize(size); setIsTailored(false); }}
                      className={`w-12 h-12 rounded-full border-2 flex items-center justify-center text-sm font-bold transition-all ${selectedSize === size
                          ? 'border-primary dark:border-white bg-primary text-white dark:bg-white dark:text-primary'
                          : 'border-black/10 dark:border-white/20 hover:border-primary dark:hover:border-white'
                        }`}
                    >
                      {size}
                    </button>
                  ))}
                  <button
                    onClick={() => { setIsTailored(true); setSelectedSize(null); }}
                    className={`px-6 h-12 rounded-full bg-gradient-to-r from-accent via-indigo-100 to-blue-100 dark:from-indigo-900/40 dark:to-purple-900/40 border-2 flex items-center justify-center text-[10px] uppercase font-bold tracking-widest transition-all ${isTailored
                        ? 'border-primary dark:border-white ring-2 ring-offset-2 ring-primary'
                        : 'border-transparent hover:border-primary dark:hover:border-white'
                      }`}
                  >
                    Custom Fit
                  </button>
                </div>
              </div>

              {/* Coupons/Offers */}
              {availableCoupons.length > 0 && (
                <div className="bg-accent/30 dark:bg-accent/10 p-4 rounded-xl mb-8 flex items-start gap-3">
                  <Tag className="text-purple-600 dark:text-purple-400 w-5 h-5 mt-0.5" />
                  <div className="flex-1">
                    <p className="text-xs font-bold uppercase tracking-wide mb-1">Available Offer</p>
                    {availableCoupons.map(coupon => (
                      <p key={coupon.id} className="text-sm opacity-80">
                        Use <span className="font-mono font-bold decoration-dotted underline">{coupon.code}</span> to get {coupon.discount_type === 'percentage' ? `${coupon.discount_value}%` : `₹${coupon.discount_value}`} off.
                      </p>
                    ))}
                  </div>
                </div>
              )}

              {/* Add to Cart Actions */}
              <div className="flex gap-4 mb-10">
                <div className="flex items-center border-2 border-black/10 dark:border-white/20 rounded-full px-4">
                  <button
                    className="text-xl font-bold p-2 hover:opacity-70"
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    disabled={quantity <= 1}
                  >
                    -
                  </button>
                  <input
                    className="w-8 text-center bg-transparent border-none focus:ring-0 font-bold p-0"
                    readOnly
                    type="text"
                    value={quantity}
                  />
                  <button
                    className="text-xl font-bold p-2 hover:opacity-70"
                    onClick={() => setQuantity(quantity + 1)}
                    disabled={product.stock_quantity <= quantity}
                  >
                    +
                  </button>
                  <span className="sr-only">Quantity</span>
                </div>

                {product.stock_quantity > 0 ? (
                  <button
                    onClick={handleAddToCart}
                    className="flex-1 bg-primary text-white dark:bg-white dark:text-primary py-4 rounded-full font-bold uppercase tracking-[0.2em] text-sm hover-glow transition-all transform active:scale-[0.98]"
                  >
                    Add to Cart
                  </button>
                ) : (
                  <button disabled className="flex-1 bg-gray-200 text-gray-500 py-4 rounded-full font-bold uppercase tracking-[0.2em] text-sm cursor-not-allowed">
                    Out of Stock
                  </button>
                )}
              </div>

              {/* Accordions */}
              <div className="space-y-4 border-t border-black/5 dark:border-white/10 pt-6">

                <details className="group" open>
                  <summary className="flex justify-between items-center cursor-pointer list-none outline-none">
                    <span className="text-xs uppercase tracking-widest font-bold">Description</span>
                    <ChevronDown className="w-5 h-5 transition-transform group-open:rotate-180" />
                  </summary>
                  <div className="pt-4 text-sm leading-relaxed opacity-70">
                    {product.description}
                  </div>
                </details>

                <details className="group border-t border-black/5 dark:border-white/10 pt-4">
                  <summary className="flex justify-between items-center cursor-pointer list-none outline-none">
                    <span className="text-xs uppercase tracking-widest font-bold">Details & Composition</span>
                    <ChevronDown className="w-5 h-5 transition-transform group-open:rotate-180" />
                  </summary>
                  <div className="pt-4 text-sm space-y-2 opacity-70">
                    {product.product_specs?.fabric && <p>• Fabric: {product.product_specs.fabric}</p>}
                    <p>• SKU: {product.sku}</p>
                    <p>• Care: Dry clean only</p>
                  </div>
                </details>

                <details className="group border-t border-black/5 dark:border-white/10 pt-4">
                  <summary className="flex justify-between items-center cursor-pointer list-none outline-none">
                    <span className="text-xs uppercase tracking-widest font-bold">Shipping & Returns</span>
                    <ChevronDown className="w-5 h-5 transition-transform group-open:rotate-180" />
                  </summary>
                  <div className="pt-4 text-sm opacity-70">
                    Ships globally in 7-10 business days. Returns accepted within 15 days of delivery for standard sizes.
                  </div>
                </details>

              </div>

              {/* Trust Badges */}
              <div className="mt-8 flex justify-center gap-8 opacity-40 text-[10px] font-bold uppercase tracking-widest">
                <div className="flex items-center gap-2">
                  <Globe className="w-4 h-4" /> Global Shipping
                </div>
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4" /> Authentic Quality
                </div>
              </div>

            </div>
          </div>
        </div>

        {/* RELATED PRODUCTS */}
        {relatedProducts.length > 0 && (
          <section className="mt-32">
            <h2 className="text-3xl font-display mb-10 text-center">Complete The Look</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {relatedProducts.map((related: any) => (
                <ProductCard key={related.id} product={related} />
              ))}
            </div>
          </section>
        )}
      </main>

      {/* Mobile Sticky Add to Cart (Optional - keep existing if needed, but the new UI usually handles it inline. 
          For better UX on mobile with this long page, we might adding it back if requested.
          I'll leave it out to strictly follow the "copy same ui" instruction unless forced.
          The user said "responsive way", so sticky bottom bar is good practice. I'll add a simplified version matching the new theme if mobile.
      */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-white/90 dark:bg-black/90 backdrop-blur-md p-4 z-40 border-t border-black/5 flex items-center justify-between">
        <div>
          <p className="text-[10px] uppercase tracking-widest opacity-60">Total</p>
          <p className="font-bold">{formatPrice(product.price * quantity)}</p>
        </div>
        <button onClick={handleAddToCart} className="bg-primary text-white dark:bg-white dark:text-primary px-6 py-3 rounded-full uppercase tracking-widest font-bold text-xs">
          Add To Cart
        </button>
      </div>

    </div>
  );
};

export default ProductDetail;