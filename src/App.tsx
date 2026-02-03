import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import ShinobiToast from '@/components/ShinobiToast';

// ... (existing imports, but typically handle import at the top in replace_file_content by using multiple chunks if possible, or assume user context handles top imports if using `replace_file_content` with small chunks)
// Wait, for replace_file_content I need to be precise. 
// I will just look for where imports end and insert the import, and where the render ends and insert the component.
// But `replace_file_content` doesn't support multiple chunks in the same call (wait, `multi_replace_file_content` exists!). 
// I'll stick to `replace_file_content` since I haven't seen the `multi` tool used much by me yet/I prefer simple edits.
// I will do two edits: one for import, one for component.
// Actually, `default_api:replace_file_content` docs say:
// "Use this tool ONLY when you are making a SINGLE CONTIGUOUS block of edits"
// So I will use `multi_replace_file_content` or two calls. 
// Let's use two `replace_file_content` calls sequence? 
// The system says "Do NOT make multiple parallel calls to this tool".
// I'll use `multi_replace_file_content`.

// Wait, I see `multi_replace_file_content` in the tool definition. Let's use that.
// First, view App.tsx again to get exact lines? I have the file content from Step 119.

// Import at top:
// Line 14: import Preloader...
// I'll add ShinobiToast there.

// Component at bottom:
// Line 155: ... <FloatingWhatsApp />
// I'll add <ShinobiToast /> there.

// I will use `replace_file_content` for the Component first, then Import. Or just one edit if possible? No, they are far apart.
// I'll use `multi_replace_file_content`.

import { useAuth } from '@/contexts/AuthContext';
import ScrollToTop from '@/components/ScrollToTop';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import CartSidebar from '@/components/CartSidebar';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import { PageLoader } from '@/components/LoadingSpinner';
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import FloatingWhatsApp from '@/components/FloatingWhatsApp';
import FloatingProductCard from '@/components/FloatingProductCard';
import Preloader from '@/components/Preloader';
import Index from '@/pages/Index';
import Products from '@/pages/Products';
import ProductDetail from '@/pages/ProductDetail';
import Cart from '@/pages/Cart';
import Checkout from '@/pages/Checkout';
import Auth from '@/pages/Auth';
import Profile from '@/pages/Profile';
import Contact from '@/pages/Contact';
import About from '@/pages/About';
import NotFound from '@/pages/NotFound';
import UserOrderDetail from '@/pages/OrderDetail';
import AdminLayout from '@/pages/admin/AdminLayout';
import Dashboard from '@/pages/admin/Dashboard';
import AdminProducts from '@/pages/admin/Products';
import ProductForm from '@/pages/admin/ProductForm';
import Categories from '@/pages/admin/Categories';
import CategoryForm from '@/pages/admin/CategoryForm';
import Orders from '@/pages/admin/Orders';
import OrderDetail from '@/pages/admin/OrderDetail';
import Customers from '@/pages/admin/Customers';
import Coupons from '@/pages/admin/Coupons';
import CouponForm from '@/pages/admin/CouponForm';
import CouponAssignment from '@/pages/admin/CouponAssignment';
import BestSellers from '@/pages/admin/BestSellers';
import Analytics from '@/pages/admin/Analytics';
import Settings from '@/pages/admin/Settings';
import InstagramPosts from '@/pages/admin/InstagramPosts';
import Testimonials from '@/pages/admin/Testimonials';
import HeroSlides from '@/pages/admin/HeroSlides';
import HeroSlideForm from '@/pages/admin/HeroSlideForm';

// Protected Route Component
function ProtectedRoute({ children, requireAdmin = false }: { children: React.ReactNode; requireAdmin?: boolean }) {
  const { user, isAdmin, loading } = useAuth();

  if (loading) {
    return <PageLoader text="Authenticating..." />;
  }

  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  if (requireAdmin && !isAdmin) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
}

const AppContent = () => {
  const { user, loading } = useAuth();
  const location = useLocation();
  const isAdminRoute = location.pathname.startsWith('/admin');
  const isAuthPage = location.pathname === '/auth';
  const isProfilePage = location.pathname === '/profile';
  const isOrderDetailPage = location.pathname.startsWith('/order-detail/');



  return (
    <ErrorBoundary>
      <TooltipProvider>
        <div className="min-h-screen bg-background">
          <Preloader />
          <ScrollToTop />
          {!isAuthPage && !isProfilePage && !isOrderDetailPage && <Header isAdminRoute={isAdminRoute} />}
          <Routes>
            {/* Public routes */}
            <Route path="/" element={<Index />} />
            <Route path="/products" element={<Products />} />
            <Route path="/product/:slug" element={<ProductDetail />} />
            <Route path="/cart" element={<Cart />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/about" element={<About />} />

            {/* Auth routes */}
            <Route
              path="/auth"
              element={user ? <Navigate to="/" replace /> : <Auth />}
            />

            {/* Checkout route - accessible to both guests and authenticated users */}
            <Route path="/checkout" element={<Checkout />} />

            {/* Protected routes */}
            <Route
              path="/profile"
              element={
                <ProtectedRoute>
                  <Profile />
                </ProtectedRoute>
              }
            />
            <Route
              path="/order-detail/:id"
              element={
                <ProtectedRoute>
                  <UserOrderDetail />
                </ProtectedRoute>
              }
            />

            {/* Admin routes */}
            <Route
              path="/admin"
              element={
                <ProtectedRoute requireAdmin>
                  <AdminLayout />
                </ProtectedRoute>
              }
            >
              <Route index element={<Dashboard />} />
              <Route path="products" element={<AdminProducts />} />
              <Route path="products/add" element={<ProductForm />} />
              <Route path="products/edit/:id" element={<ProductForm isEdit={true} />} />
              <Route path="categories" element={<Categories />} />
              <Route path="categories/add" element={<CategoryForm />} />
              <Route path="categories/edit/:id" element={<CategoryForm isEdit={true} />} />
              <Route path="orders" element={<Orders />} />
              <Route path="orders/:id" element={<OrderDetail />} />
              <Route path="customers" element={<Customers />} />
              <Route path="coupons" element={<Coupons />} />
              <Route path="coupons/add" element={<CouponForm />} />
              <Route path="coupons/edit/:id" element={<CouponForm isEdit={true} />} />
              <Route path="coupons/assign" element={<CouponAssignment />} />
              <Route path="bestsellers" element={<BestSellers />} />
              <Route path="instagram-posts" element={<InstagramPosts />} />
              <Route path="testimonials" element={<Testimonials />} />
              <Route path="analytics" element={<Analytics />} />
              <Route path="settings" element={<Settings />} />
              <Route path="hero" element={<HeroSlides />} />
              <Route path="hero/add" element={<HeroSlideForm />} />
              <Route path="hero/edit/:id" element={<HeroSlideForm isEdit={true} />} />
            </Route>

            <Route path="*" element={<NotFound />} />
          </Routes>
          {!isAuthPage && !isProfilePage && !isOrderDetailPage && <Footer isAdminRoute={isAdminRoute} />}
          {!isAuthPage && !isProfilePage && !isOrderDetailPage && <CartSidebar isAdminRoute={isAdminRoute} />}
          {!isAuthPage && !isProfilePage && !isOrderDetailPage && <FloatingWhatsApp />}
          <ShinobiToast />
          <FloatingProductCard />
          <Toaster />
          <Sonner />
        </div>
      </TooltipProvider>
    </ErrorBoundary>
  );
};

export default function App() {
  return <AppContent />;
}