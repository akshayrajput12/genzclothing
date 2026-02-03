import { useState } from 'react';
import { User, Phone, Mail, Shield } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { validateContactInfo } from '@/utils/validation';

interface ContactInfo {
  name: string;
  email: string;
  phone: string;
}

interface CheckoutContactInfoProps {
  customerInfo: ContactInfo;
  setCustomerInfo: (info: ContactInfo) => void;
  onNext: () => void;
  errors?: string[];
}

const CheckoutContactInfo = ({ customerInfo, setCustomerInfo, onNext, errors }: CheckoutContactInfoProps) => {
  const [contactErrors, setContactErrors] = useState<string[]>([]);

  const handleNext = () => {
    const validation = validateContactInfo(customerInfo);
    if (!validation.isValid) {
      setContactErrors(validation.errors);
      return;
    }
    setContactErrors([]);
    onNext();
  };

  return (
    <div className="bg-white/50 dark:bg-white/5 backdrop-blur-md border border-[#F97316]/20 rounded-xl p-8 relative overflow-hidden group">
      {/* Anime decorative elements */}
      <div className="absolute top-0 right-0 p-4 opacity-10 pointer-events-none">
        <User className="w-24 h-24 text-[#F97316]" />
      </div>

      <div className="flex items-center gap-3 mb-8 relative z-10">
        <div className="w-1.5 h-8 bg-[#F97316] rounded-full"></div>
        <h2 className="text-3xl font-bebas text-[#0B0B0F] dark:text-white italic tracking-wide">
          OPERATIVE DATA
        </h2>
      </div>

      <div className="space-y-8 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="space-y-3">
            <Label htmlFor="name" className="text-[10px] font-bold uppercase tracking-widest text-gray-500 dark:text-gray-400">
              Identify Yourself (Full Name) *
            </Label>
            <div className="relative group/input">
              <Input
                id="name"
                type="text"
                placeholder="Ex. UZUMAKI NARUTO"
                value={customerInfo.name}
                onChange={(e) => {
                  setCustomerInfo({ ...customerInfo, name: e.target.value });
                  if (contactErrors.length > 0) setContactErrors([]);
                }}
                className={`h-12 bg-white dark:bg-black/20 border-gray-200 dark:border-white/10 rounded-lg focus:border-[#F97316] focus:ring-1 focus:ring-[#F97316]/50 transition-all font-mono text-sm placeholder:text-gray-300 dark:placeholder:text-gray-600 ${contactErrors.some(e => e.includes('name') || e.includes('Name')) ? 'border-red-500 animate-pulse' : ''}`}
                required
              />
              <div className="absolute right-3 top-3 text-gray-300 dark:text-gray-600 group-focus-within/input:text-[#F97316] transition-colors">
                <Shield className="w-5 h-5" />
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <Label htmlFor="phone" className="text-[10px] font-bold uppercase tracking-widest text-gray-500 dark:text-gray-400">
              Comms Link (Phone) *
            </Label>
            <div className="relative group/input">
              <Input
                id="phone"
                type="tel"
                placeholder="+91 XXXXX XXXXX"
                value={customerInfo.phone}
                onChange={(e) => {
                  setCustomerInfo({ ...customerInfo, phone: e.target.value });
                  if (contactErrors.length > 0) setContactErrors([]);
                }}
                className={`h-12 bg-white dark:bg-black/20 border-gray-200 dark:border-white/10 rounded-lg focus:border-[#F97316] focus:ring-1 focus:ring-[#F97316]/50 transition-all font-mono text-sm placeholder:text-gray-300 dark:placeholder:text-gray-600 ${contactErrors.some(e => e.includes('phone') || e.includes('Phone')) ? 'border-red-500 animate-pulse' : ''}`}
                required
              />
              <div className="absolute right-3 top-3 text-gray-300 dark:text-gray-600 group-focus-within/input:text-[#F97316] transition-colors">
                <Phone className="w-5 h-5" />
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-3">
          <Label htmlFor="email" className="text-[10px] font-bold uppercase tracking-widest text-gray-500 dark:text-gray-400">
            Digital Drop (Email) *
          </Label>
          <div className="relative group/input">
            <Input
              id="email"
              type="email"
              placeholder="ninja@konoha.com"
              value={customerInfo.email}
              onChange={(e) => {
                setCustomerInfo({ ...customerInfo, email: e.target.value });
                if (contactErrors.length > 0) setContactErrors([]);
              }}
              className={`h-12 bg-white dark:bg-black/20 border-gray-200 dark:border-white/10 rounded-lg focus:border-[#F97316] focus:ring-1 focus:ring-[#F97316]/50 transition-all font-mono text-sm placeholder:text-gray-300 dark:placeholder:text-gray-600 ${contactErrors.some(e => e.includes('email') || e.includes('Email')) ? 'border-red-500 animate-pulse' : ''}`}
              required
            />
            <div className="absolute right-3 top-3 text-gray-300 dark:text-gray-600 group-focus-within/input:text-[#F97316] transition-colors">
              <Mail className="w-5 h-5" />
            </div>
          </div>
        </div>

        {/* Validation Errors */}
        {(contactErrors.length > 0 || (errors && errors.length > 0)) && (
          <div className="bg-red-500/10 border border-red-500/20 p-4 rounded-lg backdrop-blur-sm">
            <div className="flex items-start space-x-3">
              <div className="h-5 w-5 text-red-500 mt-0.5 animate-pulse">⚠️</div>
              <div>
                <h4 className="font-bebas text-red-500 text-lg mb-1 tracking-wide">
                  DATA CORRUPTION DETECTED
                </h4>
                <ul className="text-red-400 text-[10px] font-mono tracking-wide space-y-1 uppercase">
                  {[...contactErrors, ...(errors || [])].map((error, index) => (
                    <li key={index}>• {error}</li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        )}

        <div className="flex justify-end pt-6 border-t border-dashed border-[#F97316]/20">
          <Button
            onClick={handleNext}
            size="lg"
            className="group relative overflow-hidden bg-[#0B0B0F] dark:bg-white text-white dark:text-black font-bebas text-xl tracking-wider px-10 py-6 hover:scale-105 transition-all duration-300 rounded-lg shadow-xl shadow-[#F97316]/10"
          >
            <span className="relative z-10 flex items-center gap-2">
              PROCEED TO TARGET LOCATION <span className="material-symbols-outlined text-sm group-hover:translate-x-1 transition-transform">arrow_forward_ios</span>
            </span>
            <div className="absolute inset-0 bg-[#F97316] transform skew-x-12 translate-x-full group-hover:translate-x-0 transition-transform duration-300"></div>
          </Button>
        </div>
      </div>
    </div>
  );
};

export default CheckoutContactInfo;