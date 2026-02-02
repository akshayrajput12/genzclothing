import { useState, useEffect } from 'react';
import { MessageCircle } from 'lucide-react';
import { useSettings } from '@/hooks/useSettings';

const FloatingWhatsApp = () => {
  const { settings, loading } = useSettings();
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Show the button after a short delay for better UX
    const timer = setTimeout(() => {
      setIsVisible(true);
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  const handleWhatsAppClick = () => {
    if (!settings?.store_phone) return;

    // Format the phone number by removing any non-digit characters
    const phoneNumber = settings.store_phone.replace(/\D/g, '');

    // Handle different phone number formats
    let formattedNumber;
    if (phoneNumber.startsWith('91')) {
      // Already has country code
      formattedNumber = phoneNumber;
    } else if (phoneNumber.startsWith('0')) {
      // Starts with 0, remove it and add country code
      formattedNumber = `91${phoneNumber.substring(1)}`;
    } else if (phoneNumber.length === 10) {
      // 10 digit number, add country code
      formattedNumber = `91${phoneNumber}`;
    } else {
      // Use as is
      formattedNumber = phoneNumber;
    }

    // Open WhatsApp with pre-filled message
    const message = encodeURIComponent('Hello! I would like to know more about your products.');
    window.open(`https://wa.me/${formattedNumber}?text=${message}`, '_blank');
  };

  // Don't show the button if there's no phone number or if settings are loading
  if (loading || !settings?.store_phone) {
    return null;
  }

  return (
    <div
      className={`fixed bottom-6 right-6 z-50 transition-all duration-500 ease-in-out transform ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-20 opacity-0'
        }`}
    >
      <button
        onClick={handleWhatsAppClick}
        className="p-4 bg-[#059669] text-white rounded-full shadow-2xl hover:scale-110 transition-transform cursor-pointer flex items-center justify-center"
        aria-label="Chat with us on WhatsApp"
      >
        <span className="material-symbols-outlined text-2xl">chat_bubble</span>
      </button>
    </div>
  );
};

export default FloatingWhatsApp;