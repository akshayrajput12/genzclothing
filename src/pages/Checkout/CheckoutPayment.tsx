import { CreditCard } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Shield, Clock } from 'lucide-react';
import { validatePaymentMethod } from '@/utils/validation';
import { toNumber } from '@/utils/settingsHelpers';

interface CheckoutPaymentProps {
  paymentMethod: string;
  setPaymentMethod: (method: string) => void;
  settings: any;
  total: number;
  onNext: () => void;
  onPrev: () => void;
}

const CheckoutPayment = ({
  paymentMethod,
  setPaymentMethod,
  settings,
  total,
  onNext,
  onPrev
}: CheckoutPaymentProps) => {
  const handleNext = () => {
    const paymentValidation = validatePaymentMethod(paymentMethod, total, settings);
    if (!paymentValidation.isValid) {
      // Show error message
      return;
    }
    onNext();
  };

  return (
    <div className="bg-white/50 dark:bg-white/5 backdrop-blur-md border border-[#F97316]/20 rounded-xl p-8 shadow-sm font-display relative overflow-hidden">
      {/* Decor */}
      <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none">
        <CreditCard className="w-32 h-32 text-[#F97316]" />
      </div>

      <div className="flex items-center gap-3 mb-8 relative z-10">
        <div className="w-1.5 h-8 bg-[#F97316] rounded-full"></div>
        <h2 className="text-3xl font-bebas text-[#0B0B0F] dark:text-white italic tracking-wide">
          TRANSACTION METHOD
        </h2>
      </div>

      <div className="space-y-6 relative z-10">
        <RadioGroup value={paymentMethod} onValueChange={setPaymentMethod} className="space-y-4">
          {/* Pay Online Option - Holo Card */}
          {settings.razorpay_enabled && (
            <div
              className={`relative border rounded-xl transition-all duration-300 overflow-hidden group/card ${paymentMethod === 'online'
                ? 'border-[#F97316] bg-[#F97316]/5 shadow-[0_0_20px_rgba(249,115,22,0.1)]'
                : 'border-gray-200 dark:border-white/10 bg-white/50 dark:bg-black/20 hover:border-[#F97316]/30'
                }`}
            >
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent skew-x-12 translate-x-[-200%] group-hover/card:translate-x-[200%] transition-transform duration-1000"></div>

              <div className="flex items-start p-6 cursor-pointer" onClick={() => setPaymentMethod('online')}>
                <div className="mt-1">
                  <RadioGroupItem value="online" id="online" className="border-[#F97316] text-[#F97316]" />
                </div>
                <div className="ml-4 flex-1">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="online" className="cursor-pointer font-bebas text-xl text-[#0B0B0F] dark:text-white tracking-wide">
                      DIGITAL TRANSFER (SECURE)
                    </Label>
                    <div className="flex space-x-2 grayscale opacity-70 group-hover/card:grayscale-0 group-hover/card:opacity-100 transition-all">
                      <div className="h-6 w-10 bg-gray-200 dark:bg-white/10 rounded flex items-center justify-center text-[8px] font-bold">VISA</div>
                      <div className="h-6 w-10 bg-gray-200 dark:bg-white/10 rounded flex items-center justify-center text-[8px] font-bold">UPI</div>
                    </div>
                  </div>
                  <p className="text-xs text-gray-500 mt-2 font-mono leading-relaxed">
                    Initiate secure encrypted transfer using Credit/Debit Grid, Net Banking, or UPI Link.
                    <span className="block text-[#F97316] mt-1 text-[10px] uppercase font-bold tracking-widest flex items-center gap-1">
                      <Shield className="w-3 h-3" /> Encrypted Channel Active
                    </span>
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Cash on Delivery Option - Physical Token */}
          {settings.cod_enabled && total <= Number(settings.cod_threshold) && (
            <div
              className={`relative border rounded-xl transition-all duration-300 overflow-hidden group/card ${paymentMethod === 'cod'
                ? 'border-[#F97316] bg-[#F97316]/5 shadow-[0_0_20px_rgba(249,115,22,0.1)]'
                : 'border-gray-200 dark:border-white/10 bg-white/50 dark:bg-black/20 hover:border-[#F97316]/30'
                }`}
            >
              <div className="flex items-start p-6 cursor-pointer" onClick={() => setPaymentMethod('cod')}>
                <div className="mt-1">
                  <RadioGroupItem value="cod" id="cod" className="border-[#F97316] text-[#F97316]" />
                </div>
                <div className="ml-4 flex-1">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="cod" className="cursor-pointer font-bebas text-xl text-[#0B0B0F] dark:text-white tracking-wide">
                      PHYSICAL HANDOVER (COD)
                    </Label>
                    {Number(settings.cod_charge) > 0 && (
                      <span className="text-[10px] font-bold text-[#F97316] bg-[#F97316]/10 px-2 py-1 rounded uppercase tracking-wide">
                        + {settings.currency_symbol}{Number(settings.cod_charge).toFixed(2)} Fee
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-gray-500 mt-2 font-mono leading-relaxed">
                    Exchange currency upon artifact delivery. Exact change recommended for smooth operation.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* COD Not Available Message */}
          {settings.cod_enabled && total > Number(settings.cod_threshold) && (
            <div className="p-4 border border-dashed border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-white/5 rounded-lg text-center">
              <p className="text-xs font-mono text-gray-500 uppercase tracking-wide">
                Physical Handover Unavailable for High-Value Transactions above {settings.currency_symbol}{Number(settings.cod_threshold).toFixed(2)}
              </p>
            </div>
          )}
        </RadioGroup>

        <div className="flex justify-between items-center pt-6 border-t border-dashed border-[#F97316]/20 mt-8">
          <Button
            variant="ghost"
            onClick={onPrev}
            className="text-gray-400 hover:text-[#F97316] hover:bg-transparent px-0 font-bold text-xs tracking-widest uppercase hover:underline"
          >
            ← Retreat
          </Button>
          <Button
            onClick={handleNext}
            className="group relative overflow-hidden bg-[#0B0B0F] dark:bg-white text-white dark:text-black font-bebas text-xl tracking-wider px-10 py-6 hover:scale-105 transition-all duration-300 rounded-lg shadow-xl shadow-[#F97316]/10"
          >
            <span className="relative z-10 flex items-center gap-2">
              REVIEW MISSION DATA <span className="material-symbols-outlined text-sm group-hover:translate-x-1 transition-transform">arrow_forward_ios</span>
            </span>
            <div className="absolute inset-0 bg-[#F97316] transform skew-x-12 translate-x-full group-hover:translate-x-0 transition-transform duration-300"></div>
          </Button>
        </div>
      </div>
    </div>
  );
};

export default CheckoutPayment;