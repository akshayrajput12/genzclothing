import { Link } from 'react-router-dom';
import { Facebook, Twitter, Instagram, Youtube, Mail, Phone, MapPin } from 'lucide-react';
import logoImage from '../assets/logo.png';
import { useSettings } from '@/hooks/useSettings';
import QRCodeComponent from './QRCode';
import { MarqueeAnimation } from '@/components/ui/marquee-effect';

interface FooterProps {
  isAdminRoute?: boolean;
}

const Footer: React.FC<FooterProps> = ({ isAdminRoute = false }) => {


  const { settings, loading } = useSettings();

  // Show loading state or fallback values
  const contactInfo = {
    phone: settings?.store_phone || '+91 9996616153',
    email: settings?.store_email || 'contact@supersweets.fit',
    address: settings?.store_address || 'Shop number 5, Patel Nagar,\nHansi road, Patiala chowk,\nJIND (Haryana) 126102',
    storeName: settings?.store_name || 'Paridhan Haat'
  };

  if (isAdminRoute) {
    return null;
  }

  return (
    <footer className="w-full relative pt-20 pb-10 overflow-hidden bg-background-light dark:bg-background-dark font-display text-[#1a0e0e] dark:text-white transition-colors duration-300">

      {/* Background Character Silhouette Overlay */}
      <div className="absolute bottom-0 right-0 w-1/3 h-full pointer-events-none opacity-10 dark:opacity-20 flex items-end justify-end translate-x-12 translate-y-12 z-0">
        <div className="relative w-[300px] h-[300px] md:w-[500px] md:h-[500px]">
          {/* Character Base */}
          <div
            className="absolute bottom-0 right-0 w-full h-full bg-contain bg-no-repeat bg-bottom"
            style={{ backgroundImage: "url('https://lh3.googleusercontent.com/aida-public/AB6AXuDNCfEWhMrKQwQ7gZdXHsUVAM5_EH5kfZcHM_9GU8QxEoqGgG3lRldZ6kqTLNzxWF_FFWgbvpC83g_RWRFu7KD3LW5qOcXRzt5CdD8Fp_cBDVYrD91Je-FbCF1xkOmgv762E0AODAUmf28xgLHVylGKD-Nj-5o-kDamwr39-9FMg3FZ2p5Oid_hWdjG0JaJwQXWQaVdGGHn2LyrOTSBqjBDq8kVPTo2SflADS_6G4G15TofTRehu2ZZXFJ8b9iHQE8XgiGCVpk77CqJ')" }}
          ></div>
          {/* Red Chakra Glow */}
          <div className="absolute bottom-1/3 right-1/4 w-32 h-32 bg-primary/40 blur-[80px] rounded-full"></div>
        </div>
      </div>



      {/* Marquee Divider */}
      <div className="w-full border-t border-b border-primary/10 py-4 mb-16 overflow-hidden whitespace-nowrap bg-white/30 dark:bg-black/20 relative z-10">
        <MarqueeAnimation
          direction="left"
          baseVelocity={-0.5}
          className="font-bebas text-4xl mx-8 tracking-widest text-primary opacity-80"
        >
          OBITO ARCHIVES • UCHIHA CLAN • STREETWEAR REDEFINED • NINJA TECH • CALM AFTER ACTION • OBITO ARCHIVES • UCHIHA CLAN • STREETWEAR REDEFINED • NINJA TECH • CALM AFTER ACTION
        </MarqueeAnimation>
      </div>

      {/* Main Footer Grid */}
      <div className="max-w-7xl mx-auto px-6 md:px-12 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-12">

          {/* Brand Section */}
          <div className="md:col-span-4 flex flex-col gap-6">
            <h3 className="font-bebas text-5xl tracking-tight text-primary">OBITO</h3>
            <p className="font-serif text-lg leading-relaxed text-[#5a4242] dark:text-gray-400 italic">
              “No one cared who I was until I put on the mask.” We curate the cinematic essence of the shinobi world into high-end streetwear.
            </p>
            <div className="flex gap-4 mt-2">
              <a href="#" className="text-[#945151] hover:text-ninja-orange hover:-translate-y-1 transition-all duration-300">
                <span className="material-symbols-outlined text-[28px]">brand_awareness</span>
              </a>
              <a href="#" className="text-[#945151] hover:text-ninja-orange hover:-translate-y-1 transition-all duration-300">
                <span className="material-symbols-outlined text-[28px]">public</span>
              </a>
              <a href="#" className="text-[#945151] hover:text-ninja-orange hover:-translate-y-1 transition-all duration-300">
                <span className="material-symbols-outlined text-[28px]">podcasts</span>
              </a>
            </div>
          </div>

          {/* Navigation Columns */}
          <div className="md:col-span-5 grid grid-cols-2 md:grid-cols-3 gap-8">
            <div className="flex flex-col gap-4">
              <h4 className="text-xs font-bold uppercase tracking-[0.2em] text-[#945151]">The Collection</h4>
              <ul className="flex flex-col gap-2 text-sm">
                <li><Link to="/products?sort=newest" className="hover:text-primary hover:pl-1 transition-all">New Arrivals</Link></li>
                <li><Link to="/products?tag=limited" className="hover:text-primary hover:pl-1 transition-all">Limited Drop</Link></li>
                <li><Link to="/products?collection=uchiha" className="hover:text-primary hover:pl-1 transition-all">Uchiha Heritage</Link></li>
                <li><Link to="/products?category=accessories" className="hover:text-primary hover:pl-1 transition-all">Accessories</Link></li>
              </ul>
            </div>
            <div className="flex flex-col gap-4">
              <h4 className="text-xs font-bold uppercase tracking-[0.2em] text-[#945151]">Shinobi Archives</h4>
              <ul className="flex flex-col gap-2 text-sm">
                <li><Link to="/about" className="hover:text-primary hover:pl-1 transition-all">Legacy Records</Link></li>
                <li><Link to="/lookbook" className="hover:text-primary hover:pl-1 transition-all">Cinematic Clips</Link></li>
                <li><Link to="/about" className="hover:text-primary hover:pl-1 transition-all">Behind the Mask</Link></li>
                <li><Link to="/contact" className="hover:text-primary hover:pl-1 transition-all">The Lab</Link></li>
              </ul>
            </div>
            <div className="flex flex-col gap-4">
              <h4 className="text-xs font-bold uppercase tracking-[0.2em] text-[#945151]">Support</h4>
              <ul className="flex flex-col gap-2 text-sm">
                <li><Link to="/contact" className="hover:text-primary hover:pl-1 transition-all">Mission Control</Link></li>
                <li><Link to="/shipping" className="hover:text-primary hover:pl-1 transition-all">Shipping</Link></li>
                <li><Link to="/privacy" className="hover:text-primary hover:pl-1 transition-all">Privacy & Terms</Link></li>
                <li><Link to="/returns" className="hover:text-primary hover:pl-1 transition-all">Returns</Link></li>
              </ul>
            </div>
          </div>

          {/* QR Card Section */}
          <div className="md:col-span-3">
            <div className="glass bg-white/40 dark:bg-black/40 backdrop-blur-xl border border-ninja-orange/20 p-6 rounded-xl flex flex-col items-center text-center gap-4 relative group">
              <div className="absolute inset-0 border-2 border-ninja-orange/0 group-hover:border-ninja-orange/40 transition-all duration-500 rounded-xl pointer-events-none"></div>
              <div className="w-32 h-32 bg-white p-2 rounded-lg shadow-inner">
                <QRCodeComponent />
              </div>
              <div>
                <h5 className="font-bold text-sm">JOIN THE UCHIHA CLAN</h5>
                <p className="text-xs text-[#945151] mt-1">Scan to unlock early drops &amp; mobile archives.</p>
              </div>
            </div>
          </div>

        </div>

        {/* Bottom Bar */}
        <div className="mt-20 pt-8 border-t border-primary/10 relative">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-1/3 h-[2px] bg-gradient-to-r from-transparent via-primary to-transparent"></div>
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-sm text-[#945151] font-medium uppercase tracking-widest">© 2025 OBITO STUDIOS. ALL RIGHTS RESERVED.</p>
            <div className="flex gap-8 text-[10px] font-bold uppercase tracking-widest text-[#945151]">
              <Link to="/privacy" className="hover:text-primary transition-colors">Privacy Policy</Link>
              <Link to="/terms" className="hover:text-primary transition-colors">Terms of Service</Link>
              <Link to="/cookies" className="hover:text-primary transition-colors">Cookies</Link>
            </div>
          </div>
        </div>

      </div>
    </footer>
  );
};

export default Footer;