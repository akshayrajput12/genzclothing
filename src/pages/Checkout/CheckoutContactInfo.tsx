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
    <div className="bg-[#F9F9F7] border border-gray-200 p-8 shadow-sm">
      <div className="flex items-center mb-8">
        <h2 className="text-2xl font-serif text-[#1a1a1a]">Contact Information</h2>
      </div>

      <div className="space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="space-y-3">
            <Label htmlFor="name" className="text-xs uppercase tracking-widest text-[#1a1a1a]">
              Full Name *
            </Label>
            <div className="relative group">
              <Input
                id="name"
                type="text"
                placeholder="YOUR FULL NAME"
                value={customerInfo.name}
                onChange={(e) => {
                  setCustomerInfo({ ...customerInfo, name: e.target.value });
                  if (contactErrors.length > 0) setContactErrors([]);
                }}
                className={`h-14 bg-white border-gray-200 focus:border-black rounded-none transition-all placeholder:text-gray-300 ${contactErrors.some(e => e.includes('name') || e.includes('Name')) ? 'border-red-500' : ''}`}
                required
              />
            </div>
          </div>

          <div className="space-y-3">
            <Label htmlFor="phone" className="text-xs uppercase tracking-widest text-[#1a1a1a]">
              Phone Number *
            </Label>
            <div className="relative">
              <Input
                id="phone"
                type="tel"
                placeholder="YOUR PHONE NUMBER"
                value={customerInfo.phone}
                onChange={(e) => {
                  setCustomerInfo({ ...customerInfo, phone: e.target.value });
                  if (contactErrors.length > 0) setContactErrors([]);
                }}
                className={`h-14 bg-white border-gray-200 focus:border-black rounded-none transition-all placeholder:text-gray-300 ${contactErrors.some(e => e.includes('phone') || e.includes('Phone')) ? 'border-red-500' : ''}`}
                required
              />
            </div>
          </div>
        </div>

        <div className="space-y-3">
          <Label htmlFor="email" className="text-xs uppercase tracking-widest text-[#1a1a1a]">
            Email Address *
          </Label>
          <div className="relative">
            <Input
              id="email"
              type="email"
              placeholder="YOUR EMAIL ADDRESS"
              value={customerInfo.email}
              onChange={(e) => {
                setCustomerInfo({ ...customerInfo, email: e.target.value });
                if (contactErrors.length > 0) setContactErrors([]);
              }}
              className={`h-14 bg-white border-gray-200 focus:border-black rounded-none transition-all placeholder:text-gray-300 ${contactErrors.some(e => e.includes('email') || e.includes('Email')) ? 'border-red-500' : ''}`}
              required
            />
          </div>
        </div>

        {/* Validation Errors */}
        {/* Validation Errors */}
        {(contactErrors.length > 0 || (errors && errors.length > 0)) && (
          <div className="bg-red-50 border border-red-100 p-4">
            <div className="flex items-start space-x-3">
              <div className="h-5 w-5 text-red-600 mt-0.5">⚠️</div>
              <div>
                <h4 className="font-serif text-red-900 text-sm mb-1">
                  Please fix the following errors:
                </h4>
                <ul className="text-red-700 text-xs tracking-wide space-y-1">
                  {[...contactErrors, ...(errors || [])].map((error, index) => (
                    <li key={index}>• {error}</li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        )}

        <div className="flex justify-end pt-6">
          <Button
            onClick={handleNext}
            size="lg"
            className="rounded-none bg-[#1a1a1a] text-white hover:bg-black uppercase tracking-[0.2em] px-10 h-14 text-xs font-bold transition-all duration-300"
          >
            Continue to Address
          </Button>
        </div>
      </div>
    </div>
  );
};

export default CheckoutContactInfo;