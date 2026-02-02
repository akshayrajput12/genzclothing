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

  // State for active image in the new layout
  const [activeImage, setActiveImage] = useState<string>('');

  useEffect(() => {
    if (product?.images?.length) {
      setActiveImage(product.images[0]);
    }
  }, [product]);

  const handleThumbnailClick = (img: string) => {
    setActiveImage(img);
  };

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
      let { data, error } = await supabase
        .from('products')
        .select(`*, categories(name)`)
        .eq('category_id', categoryId)
        .neq('id', productId)
        .eq('is_active', true)
        .limit(4);

      if (error) throw error;

      // Fallback: If no related products, fetch random ones for "Complete Look"
      if (!data || data.length === 0) {
        const { data: randomData, error: randomError } = await supabase
          .from('products')
          .select(`*, categories(name)`)
          .neq('id', productId) // Exclude current product
          .eq('is_active', true)
          .limit(4);

        if (!randomError && randomData) {
          data = randomData;
        }
      }

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

  const handlePrevImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!product?.images?.length) return;
    const currentIndex = product.images.indexOf(activeImage || mainImage);
    const prevIndex = (currentIndex - 1 + product.images.length) % product.images.length;
    setActiveImage(product.images[prevIndex]);
  };

  const handleNextImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!product?.images?.length) return;
    const currentIndex = product.images.indexOf(activeImage || mainImage);
    const nextIndex = (currentIndex + 1) % product.images.length;
    setActiveImage(product.images[nextIndex]);
  };

  // UI Helper for Accordion
  const AccordionItem = ({ title, children, defaultOpen = false }: { title: string; children: React.ReactNode; defaultOpen?: boolean }) => (
    <details className="group border-t border-transparent pt-6 first:pt-6" open={defaultOpen}>
      <summary className="w-full flex items-center justify-between py-4 text-left cursor-pointer list-none outline-none">
        <span className="text-xs font-bold uppercase tracking-widest">{title}</span>
        <ChevronDown className="w-5 h-5 transition-transform group-open:rotate-180 text-primary" />
      </summary>
      <div className="text-sm text-gray-500 leading-relaxed overflow-hidden transition-all duration-500 group-open:max-h-96 max-h-0 pl-1">
        {children}
      </div>
      <div className="divider-glow mt-2"></div>
    </details>
  );

  return (
    <div className="bg-background-light dark:bg-background-dark font-display text-shadow-black overflow-x-hidden min-h-screen text-foreground">

      {/* HEADER IS HANDLED GLOBALLY IN APP.TSX, WE FOCUS ON MAIN CONTENT */}

      <main className="relative pt-32 pb-20 px-4 md:px-10 lg:px-20 manga-grid min-h-screen">
        {/* Abstract Sharingan Background */}
        <div className="fixed top-1/2 left-1/4 -translate-y-1/2 -translate-x-1/2 opacity-[0.03] pointer-events-none sharingan-bg z-0">
          <img
            alt="Subtle moving sharingan pattern"
            className="w-[600px] grayscale animate-spin-slow"
            src="https://lh3.googleusercontent.com/aida-public/AB6AXuBxU9EybQq7sRQCjaji27Omb92mM4Am0Aku4YYdkaHYrgGgHRe_EW3bYp0Dts3x1sfOD5MfENAY5mEIsTWTGIJxxcgSAZAj2pPdCTfOLn_XAYgBLXAIgLNnB1YcGxP09nSMPVh3y25Yd_44kWg9OduYJFxvmt0-PSyq5PU2heki-Lc_rmMQKscqEol0w4szbgQGLcSw1-5BpEWpXeJDueqJ6-mV_A4whdCw2g7niPYhXT_PIJiPn5GQDuL_lnlKOtWReSzevQlfiAhx"
            style={{ animationDuration: '60s' }}
          />
        </div>

        <div className="max-w-[1440px] mx-auto grid grid-cols-1 lg:grid-cols-12 gap-12 relative z-10">

          {/* Left Side: Product Gallery */}
          <div className="lg:col-span-7 flex flex-col md:flex-row gap-6">
            {/* Thumbnails */}
            <div className="order-2 md:order-1 flex md:flex-col gap-4 overflow-x-auto md:overflow-visible pb-2 md:pb-0 hide-scrollbar">
              {product.images?.map((img: string, idx: number) => (
                <button
                  key={idx}
                  onClick={() => handleThumbnailClick(img)}
                  className={`size-24 rounded-lg overflow-hidden film-grain cursor-pointer transition-all duration-300 flex-shrink-0 ${activeImage === img ? 'orange-glow border border-primary/50' : 'border border-gray-200/20 opacity-60 hover:opacity-100'
                    }`}
                >
                  <img src={img} alt={`View ${idx}`} className="w-full h-full object-cover" />
                </button>
              ))}
            </div>

            {/* Main Image */}
            <div className="order-1 md:order-2 flex-1 relative group">
              <div className="absolute top-6 left-6 z-10 flex flex-col gap-2">
                {(product.stock_quantity < 5 && product.stock_quantity > 0) && (
                  <span className="bg-chakra-red text-white text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-widest shadow-lg">
                    Low Stock
                  </span>
                )}
                {discountPercentage > 0 && (
                  <span className="bg-primary text-white text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-widest shadow-lg">
                    -{discountPercentage}% Off
                  </span>
                )}
              </div>

              <div className="rounded-xl overflow-hidden film-grain orange-glow border border-primary/10 aspect-[4/5] bg-white/5 relative group/image">
                <img
                  src={activeImage || mainImage}
                  alt={product.name}
                  className="w-full h-full object-cover transition-transform duration-700 hover:scale-105"
                />

                {/* Navigation Buttons */}
                {product.images?.length > 1 && (
                  <>
                    <button
                      onClick={handlePrevImage}
                      className="absolute left-4 top-1/2 -translate-y-1/2 size-10 bg-black/50 hover:bg-black/80 text-white rounded-full flex items-center justify-center backdrop-blur-sm opacity-0 group-hover/image:opacity-100 transition-opacity z-20"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6" /></svg>
                    </button>
                    <button
                      onClick={handleNextImage}
                      className="absolute right-4 top-1/2 -translate-y-1/2 size-10 bg-black/50 hover:bg-black/80 text-white rounded-full flex items-center justify-center backdrop-blur-sm opacity-0 group-hover/image:opacity-100 transition-opacity z-20"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m9 18 6-6-6-6" /></svg>
                    </button>
                  </>
                )}
              </div>

              {/* Favorite Button */}
              <button
                onClick={() => setIsFavorite(!isFavorite)}
                className="absolute bottom-6 right-6 size-12 rounded-full bg-white dark:bg-zinc-800 shadow-xl flex items-center justify-center text-chakra-red hover:scale-110 transition-transform border border-gray-100 dark:border-zinc-700"
              >
                <Heart className={`w-5 h-5 ${isFavorite ? "fill-current" : ""}`} />
              </button>
            </div>
          </div>

          {/* Right Side: Sticky Info Panel */}
          <div className="lg:col-span-5">
            <div className="sticky top-32 glass-panel p-6 md:p-10 rounded-xl shadow-2xl space-y-8 border border-white/20">

              {/* Title & Price */}
              <div className="space-y-4">
                <div className="flex items-center gap-2 text-primary font-bold text-xs tracking-widest uppercase">
                  <span className="text-lg">⚡</span>
                  {product.categories?.name || 'Exclusive Drop'}
                </div>

                <h2 className="text-2xl md:text-3xl lg:text-4xl font-black text-shadow-black uppercase tracking-tighter leading-tight text-foreground dark:text-white">
                  {product.name}
                </h2>

                <div className="flex items-center justify-between pt-4 border-b border-dashed border-gray-200 dark:border-white/10 pb-4">
                  <div className="flex flex-col gap-1">
                    <div className="flex items-baseline gap-3">
                      <p className="text-4xl font-black text-primary">{formatPrice(product.price)}</p>
                      {discountPercentage > 0 && (
                        <span className="text-xs font-bold text-green-600 dark:text-green-400 bg-green-100 dark:bg-green-900/30 px-2 py-1 rounded-md uppercase tracking-wide">
                          -{discountPercentage}%
                        </span>
                      )}
                    </div>
                    {product.original_price > product.price && (
                      <span className="text-lg line-through opacity-50 font-mono text-gray-500 dark:text-gray-400">{formatPrice(product.original_price)}</span>
                    )}
                  </div>
                  <div className="flex gap-1 text-primary">
                    {[1, 2, 3, 4, 5].map((s) => (
                      <span key={s} className="text-sm">★</span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Breadcrumbs */}
              <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-gray-400">
                <Link to="/" className="hover:text-primary transition-colors">Home</Link>
                <span className="text-gray-200">/</span>
                <Link to="/products" className="hover:text-primary transition-colors">Shop</Link>
                <span className="text-gray-200">/</span>
                <span className="text-primary">{slug}</span>
              </div>

              {/* Size Selector */}
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <label className="text-xs font-bold uppercase tracking-widest">Select Size</label>
                  <button className="text-[10px] font-bold uppercase tracking-widest text-primary border-b border-primary/30">Size Guide</button>
                </div>
                <div className="flex flex-wrap gap-3">
                  {sizes.map((size: string) => (
                    <button
                      key={size}
                      onClick={() => { setSelectedSize(size); setIsTailored(false); }}
                      className={`size-12 rounded-full border-2 flex items-center justify-center font-bold text-sm transition-all ${selectedSize === size
                        ? 'border-primary bg-primary/10 text-primary shadow-[0_0_15px_rgba(249,116,21,0.3)]'
                        : 'border-gray-200 dark:border-zinc-700 text-gray-400 hover:border-black dark:hover:border-white hover:text-black dark:hover:text-white'
                        }`}
                    >
                      {size}
                    </button>
                  ))}
                  <button
                    onClick={() => { setIsTailored(true); setSelectedSize(null); }}
                    className={` px-6 h-12 rounded-full border-2 flex items-center justify-center font-bold text-[10px] uppercase tracking-wider transition-all ${isTailored
                      ? 'border-primary bg-primary/10 text-primary shadow-[0_0_15px_rgba(249,116,21,0.3)]'
                      : 'border-gray-200 dark:border-zinc-700 text-gray-400 hover:border-black dark:hover:border-white hover:text-black dark:hover:text-white'
                      }`}
                  >
                    Custom Fit
                  </button>
                </div>
              </div>

              {/* Quantity */}
              <div className="flex items-center gap-4 py-2">
                <div className="flex items-center border border-gray-200 dark:border-white/10 rounded-full px-3 h-12">
                  <button onClick={() => setQuantity(Math.max(1, quantity - 1))} className="w-8 text-lg font-bold hover:text-primary">-</button>
                  <span className="w-8 text-center font-bold text-sm">{quantity}</span>
                  <button onClick={() => setQuantity(quantity + 1)} className="w-8 text-lg font-bold hover:text-primary">+</button>
                </div>
                <div className="text-[10px] font-bold uppercase tracking-widest text-gray-400">
                  {product.stock_quantity > 0 ? 'In Stock & Ready to Deploy' : 'Out of Stock'}
                </div>
              </div>

              {/* Add to Cart */}
              <div className="">
                <button
                  onClick={handleAddToCart}
                  disabled={product.stock_quantity <= 0}
                  className={`w-full py-6 rounded-full text-white font-display text-2xl tracking-widest shadow-[0_10px_40px_-10px_rgba(249,116,21,0.5)] hover:shadow-[0_20px_60px_-10px_rgba(249,116,21,0.6)] transition-all transform hover:-translate-y-1 active:scale-95 flex items-center justify-center gap-3 ${product.stock_quantity <= 0 ? 'bg-gray-400 cursor-not-allowed grayscale' : 'bg-primary'
                    }`}
                >
                  {product.stock_quantity <= 0 ? 'SOLD OUT' : 'ADD TO CART'}
                  <span className="text-2xl">→</span>
                </button>
              </div>

              {/* Accordions */}
              <div className="space-y-0">
                <AccordionItem title="Origin Story" defaultOpen>
                  {product.description || "Crafted in the shadows of the Hidden Leaf... No description available."}
                </AccordionItem>

                <AccordionItem title="Technical Specs">
                  <ul className="list-disc pl-4 space-y-1">
                    <li>Fabric: {product.product_specs?.fabric || "Premium Cotton Blend"}</li>
                    <li>Fit: {product.product_specs?.fit || "Streetwear Oversized"}</li>
                    <li>SKU: {product.sku}</li>
                    <li>Weight: Heavyweight durable weave</li>
                  </ul>
                </AccordionItem>

                <AccordionItem title="Shinobi Care">
                  Hand wash with mild chakra soap. Do not tumble dry during fire-style training. Iron on low heat.
                </AccordionItem>
              </div>

            </div>
          </div>
        </div>

        {/* RELATED ITEMS SECTION */}
        {relatedProducts.length > 0 && (
          <div className="mt-32 max-w-[1440px] mx-auto relative z-10">
            <h3 className="text-2xl font-black uppercase tracking-tighter mb-12 flex items-center gap-4">
              EQUIP YOUR ARSENAL
              <div className="h-px flex-1 bg-gradient-to-r from-gray-200 to-transparent dark:from-white/20"></div>
            </h3>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {relatedProducts.map((related: any) => (
                <div key={related.id} className="group cursor-pointer" onClick={() => navigate(`/product/${related.sku || related.id}`)}>
                  <div className="aspect-[3/4] rounded-lg overflow-hidden bg-white/5 border border-gray-100 dark:border-white/10 mb-4 film-grain relative">
                    <img
                      src={related.images?.[0] || '/placeholder.svg'}
                      alt={related.name}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                    />
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors"></div>
                  </div>
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{related.categories?.name || 'Gear'}</p>
                  <h4 className="font-bold uppercase text-sm group-hover:text-primary transition-colors line-clamp-1">{related.name}</h4>
                  <p className="text-sm font-bold mt-1 text-primary">{formatPrice(related.price)}</p>
                </div>
              ))}
            </div>
          </div>
        )}

      </main>
    </div>
  );
};

export default ProductDetail;