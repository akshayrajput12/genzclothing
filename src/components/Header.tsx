import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { User, X, ChevronDown, ChevronRight, LogOut } from 'lucide-react';
import { useStore } from '../store/useStore';
import { useAuth } from '@/contexts/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  DropdownMenu as MobileDropdown,
  DropdownMenuContent as MobileDropdownContent,
  DropdownMenuItem as MobileDropdownItem,
  DropdownMenuTrigger as MobileDropdownTrigger,
} from '@/components/ui/dropdown-menu';
import SearchSidebar from './SearchSidebar';
import { supabase } from '@/integrations/supabase/client';

interface HeaderProps {
  isAdminRoute?: boolean;
}

const Header: React.FC<HeaderProps> = ({ isAdminRoute = false }) => {
  const navigate = useNavigate();
  const { cartItems, toggleCart } = useStore();
  const { user, signOut, isAdmin } = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isHeaderVisible, setIsHeaderVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;

      // Show header if scrolling up or at the very top, hide if scrolling down past 50px
      if (currentScrollY > lastScrollY && currentScrollY > 50) {
        setIsHeaderVisible(false);
      } else {
        setIsHeaderVisible(true);
      }

      setLastScrollY(currentScrollY);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [lastScrollY]);

  // Dynamic Data States
  const [categories, setCategories] = useState<any[]>([]);
  const [collections, setCollections] = useState<any[]>([]);

  useEffect(() => {
    fetchNavigationData();
  }, []);

  const fetchNavigationData = async () => {
    try {
      // 1. Fetch Categories
      const { data: catData } = await supabase
        .from('categories')
        .select('*')
        .eq('is_active', true)
        .order('name');
      if (catData) setCategories(catData);

      // 2. Mock Collections (Updated with logic from reference if needed, but keeping existing structure)
      const mockCollections = [
        { id: 'c1', name: "New Arrivals", slug: 'new-arrivals' },
        { id: 'c2', name: "Bestsellers", slug: 'bestsellers' },
        {
          id: 'c4',
          name: "Bridal",
          slug: 'bridal',
          subcategories: [
            { name: "Lehengas", slug: "bridal-lehengas" },
            { name: "Gowns", slug: "bridal-gowns" },
            { name: "Sarees", slug: "bridal-sarees" },
            { name: "Jewelry", slug: "bridal-jewelry" }
          ]
        }
      ];
      setCollections(mockCollections);
    } catch (error) {
      console.error("Error fetching nav data:", error);
    }
  };

  const cartItemsCount = cartItems.reduce((total, item) => total + item.quantity, 0);

  const MobileMenuItem = ({ label, path, onClick, subItems }: { label: string; path?: string; onClick?: () => void, subItems?: any[] }) => {
    const [isExpanded, setIsExpanded] = useState(false);
    return (
      <div className="border-b border-zinc-200 last:border-0 bg-white">
        <button
          onClick={() => {
            if (subItems && subItems.length > 0) setIsExpanded(!isExpanded);
            else {
              if (path) navigate(path);
              if (onClick) onClick();
              setIsMobileMenuOpen(false);
            }
          }}
          className="flex items-center justify-between w-full py-4 px-5 text-left group"
        >
          <span className={`text-sm font-sans tracking-widest uppercase transition-colors ${isExpanded ? 'text-primary font-bold' : 'text-zinc-600'}`}>
            {label}
          </span>
          {subItems && subItems.length > 0 ? (
            <ChevronDown className={`w-4 h-4 text-zinc-500 transition-transform duration-300 ${isExpanded ? 'rotate-180' : ''}`} />
          ) : (
            <ChevronRight className="w-4 h-4 text-zinc-500 opacity-60 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
          )}
        </button>
        <AnimatePresence>
          {isExpanded && subItems && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden bg-zinc-50"
            >
              {subItems.map((sub, idx) => (
                <button
                  key={idx}
                  onClick={() => {
                    navigate(`/products?category=${sub.slug || sub.name.toLowerCase()}`);
                    setIsMobileMenuOpen(false);
                  }}
                  className="block w-full text-left py-3 px-8 text-xs font-sans tracking-widest uppercase text-zinc-600 hover:text-primary transition-colors border-b border-zinc-100 last:border-0"
                >
                  {sub.name}
                </button>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    );
  };

  if (isAdminRoute) return null;

  return (
    <>
      <div className="bg-primary text-black py-2 overflow-hidden whitespace-nowrap border-b-2 border-black relative z-50">
        <div className="inline-block animate-marquee uppercase font-black text-xs tracking-[0.2em] px-4">
          NEW DROP: SHIPPUDEN CAPSULE OUT NOW • FREE HIDDEN LEAF BANDANA ON ORDERS OVER ₹2500 •
          NEW DROP: SHIPPUDEN CAPSULE OUT NOW • FREE HIDDEN LEAF BANDANA ON ORDERS OVER ₹2500 •
          NEW DROP: SHIPPUDEN CAPSULE OUT NOW • FREE HIDDEN LEAF BANDANA ON ORDERS OVER ₹2500
        </div>
      </div>
      <header
        className={`sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-zinc-200 transition-transform duration-300 ease-in-out ${isHeaderVisible ? 'translate-y-0' : '-translate-y-full'
          }`}
      >
        <div className="max-w-screen-2xl mx-auto px-4 lg:px-6 h-20 lg:h-28 flex items-center justify-between relative">

          {/* Left Section: Mobile Menu & Desktop Nav */}
          <div className="flex items-center gap-4">
            {/* Mobile Menu Button */}
            <button
              className="lg:hidden p-2 -ml-2 text-black hover:bg-zinc-100 rounded-full transition-colors focus:outline-none"
              onClick={() => setIsMobileMenuOpen(true)}
            >
              <span className="material-symbols-outlined text-2xl">menu</span>
            </button>

            {/* Desktop Navigation */}
            <nav className="hidden lg:flex items-center space-x-10">
              <div className="flex items-center group cursor-pointer" onClick={() => navigate('/products?collection=new-arrivals')}>
                <span className="text-xs font-manga text-primary mr-2 opacity-100 transition-opacity">壱</span>
                <span className="relative nav-link text-sm font-black tracking-wider text-black uppercase after:absolute after:bottom-[-4px] after:left-0 after:w-0 after:h-[2px] after:bg-primary after:transition-[width] after:duration-300 hover:after:w-full">New Drops</span>
              </div>
              <div className="flex items-center group cursor-pointer" onClick={() => navigate('/products?collection=bestsellers')}>
                <span className="text-xs font-manga text-primary mr-2 opacity-100 transition-opacity">弐</span>
                <span className="relative nav-link text-sm font-black tracking-wider text-black uppercase after:absolute after:bottom-[-4px] after:left-0 after:w-0 after:h-[2px] after:bg-primary after:transition-[width] after:duration-300 hover:after:w-full">Bestsellers</span>
              </div>

              <DropdownMenu>
                <DropdownMenuTrigger className="flex items-center group cursor-pointer focus:outline-none">
                  <span className="text-xs font-manga text-primary mr-2 opacity-100 transition-opacity">参</span>
                  <span className="relative nav-link text-sm font-black tracking-wider text-black uppercase flex items-center after:absolute after:bottom-[-4px] after:left-0 after:w-0 after:h-[2px] after:bg-primary after:transition-[width] after:duration-300 hover:after:w-full">
                    Shop by Arc
                    <span className="material-symbols-outlined text-[18px] ml-1">expand_more</span>
                  </span>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-48 bg-white border border-zinc-200 shadow-lg rounded-sm p-1 z-[60]">
                  {categories.map((item, idx) => (
                    <DropdownMenuItem
                      key={idx}
                      onClick={() => navigate(`/products?category=${item.slug || item.name.toLowerCase()}`)}
                      className="text-left px-4 py-2.5 text-xs font-sans tracking-widest text-zinc-900 hover:bg-zinc-100 transition-colors uppercase cursor-pointer"
                    >
                      {item.name}
                    </DropdownMenuItem>
                  ))}
                  {/* Keep standard collections just in case */}
                  <div className="h-[1px] bg-zinc-200 my-1"></div>
                  {collections.find(c => c.name === "Bridal")?.subcategories.map((sub: any, idx: number) => (
                    <DropdownMenuItem
                      key={`sub-${idx}`}
                      onClick={() => navigate(`/products?tag=${sub.slug}`)}
                      className="text-left px-4 py-2.5 text-xs font-sans tracking-widest text-zinc-600 hover:text-primary hover:bg-zinc-100 transition-colors uppercase cursor-pointer"
                    >
                      {sub.name}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            </nav>
          </div>

          {/* Center Section: Logo */}
          <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 lg:static lg:transform-none lg:flex lg:items-center lg:justify-center">
            <div className="relative flex items-center justify-center">
              <div className="hidden xl:block absolute -left-32 animate-[float_6s_ease-in-out_infinite] opacity-80 hover:opacity-100 transition-opacity">
                <div className="relative">
                  <div className="absolute inset-0 bg-primary blur-sm opacity-20 rounded-lg"></div>
                  <img alt="Gen-Z Anime Avatar Left" className="w-14 h-14 rounded-lg border border-zinc-700 bg-zinc-900 object-cover grayscale hover:grayscale-0 transition-all duration-300" src="https://lh3.googleusercontent.com/aida-public/AB6AXuDKvF2KrgmombzdIPUQu8fo1VTXoSm15-vgTZi7UhKO3Y6K8SCFfFeUYc-9TH1eLsJwzPKyFTEWD6X0EQaHKdWM9bvWaNeai-hU3k4GAlrK7qhhRE7Nad6WVyDxMsyIiqW9t6Tt6lA-mUXfRcrbm5AsnkPHjrxNxOjcvH82ev2HKlh6KxuvuT_jl5tUicA2l3pzZ6MUddC82wf93LgHhin7bnzdC9ZqDwKdh3IvpR8EbqOsPrMWw3VyXHZuELmEJVIxxmsEqa39cIaC" />
                  <div className="absolute -bottom-2 -right-2 bg-black text-white text-[8px] px-1 font-mono border border-zinc-800">LVL.99</div>
                </div>
              </div>

              <Link to="/" className="flex flex-col items-center z-10 group">
                <h1 className="font-display text-4xl md:text-5xl lg:text-6xl tracking-tighter md:tracking-tight text-black leading-none relative shadow-none select-none transition-transform duration-300 group-hover:scale-105">
                  OBITO
                  <div className="absolute -top-2 -right-4 md:-top-3 md:-right-6 rotate-12">
                    <span className="text-[8px] md:text-[10px] font-manga bg-accent text-white px-2 py-0.5 leading-none shadow-[2px_2px_0px_#000]">オビト</span>
                  </div>
                </h1>
                <p className="hidden md:block text-[10px] md:text-[11px] font-medium text-zinc-500 tracking-[0.35em] mt-1 lowercase font-sans border-t border-zinc-200 pt-1 w-full text-center group-hover:text-primary transition-colors">
                  born kind. broken once.
                </p>
              </Link>

              <div className="hidden xl:block absolute -right-32 animate-[float_6s_ease-in-out_infinite] opacity-80 hover:opacity-100 transition-opacity" style={{ animationDelay: '2s' }}>
                <div className="relative">
                  <div className="absolute inset-0 bg-accent blur-sm opacity-20 rounded-lg"></div>
                  <img alt="Gen-Z Anime Avatar Right" className="w-14 h-14 rounded-lg border border-zinc-700 bg-zinc-900 object-cover grayscale hover:grayscale-0 transition-all duration-300" src="https://lh3.googleusercontent.com/aida-public/AB6AXuDysrH1gCwWELvZdUcfPr5NfFHN3VEEwNRhZcqzUnKc7wwG-rY7RvHUz6w_-weyeoTgx5DiwaboPDRCm2zKGuXwlSpLL6un1EEqcz_eqml4akcyLqFPNGS_psMVsrsWEiF998Y9AkyxJ0SRUxN8eM4PgBTKhzhemBeMKTYt879tDJrFbY_9tOPrqMwhfF-VbPlOOEp6d6rGjp-bmzv_k3i5_14a7e4KFwaQY9wVrfTd4ijoVJvKMkOy0eLdUjHtDljx7A-uDCjAGF9B" />
                  <div className="absolute -top-2 -left-2 bg-primary text-black text-[8px] px-1 font-mono font-bold">NPC</div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Section: Icons */}
          <div className="flex items-center space-x-2 md:space-x-4">
            <div
              className="hidden md:flex items-center border-b-2 border-zinc-200 focus-within:border-primary transition-colors duration-300 px-2 py-1 cursor-text"
              onClick={() => setIsSearchOpen(true)}
            >
              <span className="material-symbols-outlined text-zinc-400 text-lg">search</span>
              <input
                className="bg-transparent border-none focus:ring-0 text-xs font-sans font-bold tracking-widest w-24 xl:w-32 text-black placeholder-zinc-400 focus:placeholder-zinc-600 cursor-pointer outline-none"
                placeholder="SEARCH JUTSU"
                type="text"
                readOnly
              />
            </div>

            <button
              className="md:hidden p-2 text-zinc-600 focus:outline-none hover:bg-zinc-100 rounded-full"
              onClick={() => setIsSearchOpen(true)}
            >
              <span className="material-symbols-outlined text-xl">search</span>
            </button>

            <button
              className="relative group p-2 text-zinc-600 focus:outline-none hover:bg-zinc-100 rounded-full hidden md:block"
              onClick={() => navigate('/products?tag=favorites')}
            >
              <span className="material-symbols-outlined group-hover:text-accent transition-colors text-xl">favorite</span>
            </button>

            {user ? (
              <MobileDropdown>
                <MobileDropdownTrigger className="group p-2 focus:outline-none hover:bg-zinc-100 rounded-full">
                  <span className="material-symbols-outlined text-zinc-600 group-hover:text-black transition-colors text-xl">person</span>
                </MobileDropdownTrigger>
                <MobileDropdownContent align="end" className="hidden md:block w-56 bg-white border border-zinc-200 shadow-xl rounded-sm p-1">
                  {isAdmin && (
                    <MobileDropdownItem className="focus:bg-zinc-100 cursor-pointer font-sans tracking-wide text-xs uppercase py-2 text-zinc-600" onClick={() => navigate('/admin')}>
                      Admin Dashboard
                    </MobileDropdownItem>
                  )}
                  <MobileDropdownItem className="focus:bg-zinc-100 cursor-pointer font-sans tracking-wide text-xs uppercase py-2 text-zinc-600" onClick={() => navigate('/profile')}>
                    Profile
                  </MobileDropdownItem>
                  <MobileDropdownItem className="focus:bg-zinc-100 cursor-pointer font-sans tracking-wide text-xs uppercase py-2 text-zinc-600" onClick={signOut}>
                    Sign Out
                  </MobileDropdownItem>
                </MobileDropdownContent>
              </MobileDropdown>
            ) : (
              <button className="group p-2 focus:outline-none hover:bg-zinc-100 rounded-full" onClick={() => navigate('/auth')}>
                <span className="material-symbols-outlined text-zinc-600 group-hover:text-black transition-colors text-xl">person</span>
              </button>
            )}

            <button
              className="relative group bg-black text-white p-2 md:p-2.5 rounded-lg hover:bg-primary hover:text-black transition-all duration-300 shadow-md hover:shadow-lg focus:outline-none active:scale-95"
              onClick={toggleCart}
            >
              <span className="material-symbols-outlined text-lg md:text-xl">shopping_bag</span>
              {cartItemsCount > 0 && (
                <span className="absolute -top-2 -right-2 bg-red-600 text-white text-[10px] font-bold min-w-[18px] h-[18px] flex items-center justify-center rounded-full border-[2px] border-white shadow-sm ring-1 ring-black/5 animate-in zoom-in duration-300">
                  {cartItemsCount}
                </span>
              )}
            </button>
          </div>
        </div>
        <div className="absolute inset-0 pointer-events-none opacity-[0.05]" style={{ backgroundImage: "linear-gradient(rgba(0, 0, 0, 0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(0, 0, 0, 0.1) 1px, transparent 1px)", backgroundSize: "40px 40px" }}></div>
      </header>

      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsMobileMenuOpen(false)}
              className="fixed inset-0 bg-black/50 backdrop-blur-[2px] z-50 lg:hidden"
            />
            <motion.div
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: "tween", duration: 0.4, ease: [0.32, 0.72, 0, 1] }}
              className="fixed top-0 left-0 bottom-0 w-[85%] max-w-[320px] bg-white z-50 shadow-2xl overflow-y-auto border-r border-zinc-200"
            >
              <div className="p-6 flex items-center justify-between border-b border-zinc-200">
                <div className="flex flex-col items-center">
                  <h2 className="text-xl font-display font-bold tracking-widest uppercase text-black">OBITO</h2>
                </div>
                <button onClick={() => setIsMobileMenuOpen(false)} className="p-2 text-zinc-400 hover:bg-zinc-100 rounded-full">
                  <X className="w-6 h-6" />
                </button>
              </div>

              <div className="py-2">
                <MobileMenuItem
                  label="New Drops"
                  path="/products?collection=new-arrivals"
                />
                <MobileMenuItem
                  label="Bestsellers"
                  path="/products?collection=bestsellers"
                />

                {collections.map(col => {
                  if (col.name === "New Arrivals" || col.name === "Bestsellers" || col.name === "Bridal") return null;
                  return (
                    <MobileMenuItem
                      key={col.id}
                      label={col.name}
                      path={`/products?collection=${col.slug}`}
                      subItems={col.subcategories}
                    />
                  );
                })}

                <MobileMenuItem
                  label="Shop by Arc"
                  subItems={categories.map(c => ({ name: c.name, slug: c.name.toLowerCase() }))}
                />

                {user ? (
                  <div className="mt-8 px-6 pt-6 border-t border-zinc-200">
                    <button onClick={() => { navigate('/profile'); setIsMobileMenuOpen(false); }} className="flex items-center space-x-3 w-full py-3 text-zinc-600 font-sans tracking-widest text-xs uppercase">
                      <User className="w-4 h-4" /> <span>Profile</span>
                    </button>
                    {isAdmin && (
                      <button onClick={() => { navigate('/admin'); setIsMobileMenuOpen(false); }} className="flex items-center space-x-3 w-full py-3 text-zinc-600 font-sans tracking-widest text-xs uppercase">
                        <User className="w-4 h-4" /> <span>Admin</span>
                      </button>
                    )}
                    <button onClick={() => { signOut(); setIsMobileMenuOpen(false); }} className="flex items-center space-x-3 w-full py-3 text-zinc-600 font-sans tracking-widest text-xs uppercase">
                      <LogOut className="w-4 h-4" /> <span>Log Out</span>
                    </button>
                  </div>
                ) : (
                  <div className="p-6 mt-4">
                    <button
                      onClick={() => { navigate('/auth'); setIsMobileMenuOpen(false); }}
                      className="w-full bg-primary text-black py-4 rounded-sm uppercase tracking-[0.2em] font-sans text-xs font-bold hover:bg-black hover:text-white transition-colors shadow-lg"
                    >
                      Login / Sign Up
                    </button>
                  </div>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <SearchSidebar isOpen={isSearchOpen} onClose={() => setIsSearchOpen(false)} />
    </>
  );
};

export default Header;
