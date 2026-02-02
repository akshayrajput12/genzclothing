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
    <div className="bg-[#F9F9F7] border border-gray-200 p-8 shadow-sm">
      <div className="flex items-center mb-8">
        <h2 className="text-2xl font-serif text-[#1a1a1a]">Payment Method</h2>
      </div>

      <div className="space-y-6">
        <RadioGroup value={paymentMethod} onValueChange={setPaymentMethod} className="space-y-4">
          {/* Pay Online Option */}
          {settings.razorpay_enabled && (
            <div
              className={`relative border transition-all duration-300 ${paymentMethod === 'online'
                  ? 'border-[#1a1a1a] bg-white ring-1 ring-[#1a1a1a] ring-offset-2'
                  : 'border-gray-200 bg-white hover:border-gray-400'
                }`}
            >
              <div className="flex items-start p-6 cursor-pointer" onClick={() => setPaymentMethod('online')}>
                <RadioGroupItem value="online" id="online" className="mt-1 border-gray-300 text-[#1a1a1a]" />
                <div className="ml-4 flex-1">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="online" className="cursor-pointer font-serif text-lg text-[#1a1a1a]">
                      Secure Online Payment
                    </Label>
                    <div className="flex space-x-2 opacity-60 grayscale hover:grayscale-0 transition-all">
                      <span className="text-[10px] uppercase border border-gray-300 px-1 rounded-sm">Visa</span>
                      <span className="text-[10px] uppercase border border-gray-300 px-1 rounded-sm">Mastercard</span>
                      <span className="text-[10px] uppercase border border-gray-300 px-1 rounded-sm">UPI</span>
                    </div>
                  </div>
                  <p className="text-sm text-gray-500 font-light mt-2 max-w-sm">
                    Pay securely using Credit/Debit Card, Net Banking, or UPI.
                    Your transaction is encrypted and secure.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Cash on Delivery Option */}
          {settings.cod_enabled && total <= Number(settings.cod_threshold) && (
            <div
              className={`relative border transition-all duration-300 ${paymentMethod === 'cod'
                  ? 'border-[#1a1a1a] bg-white ring-1 ring-[#1a1a1a] ring-offset-2'
                  : 'border-gray-200 bg-white hover:border-gray-400'
                }`}
            >
              <div className="flex items-start p-6 cursor-pointer" onClick={() => setPaymentMethod('cod')}>
                <RadioGroupItem value="cod" id="cod" className="mt-1 border-gray-300 text-[#1a1a1a]" />
                <div className="ml-4 flex-1">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="cod" className="cursor-pointer font-serif text-lg text-[#1a1a1a]">
                      Cash on Delivery
                    </Label>
                    {Number(settings.cod_charge) > 0 && (
                      <span className="text-xs text-gray-500 uppercase tracking-wider">
                        + {settings.currency_symbol}{Number(settings.cod_charge).toFixed(2)} Fee
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-gray-500 font-light mt-2">
                    Pay with cash upon delivery. Please ensure you have exact change.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* COD Not Available Message */}
          {settings.cod_enabled && total > Number(settings.cod_threshold) && (
            <div className="p-4 border border-gray-200 bg-gray-50 text-gray-500 text-sm font-light text-center">
              Cash on Delivery not available for orders above {settings.currency_symbol}{Number(settings.cod_threshold).toFixed(2)}
            </div>
          )}
        </RadioGroup>

        <div className="flex justify-between items-center pt-8 border-t border-gray-100 mt-8">
          <Button
            variant="ghost"
            onClick={onPrev}
            className="text-gray-400 hover:text-[#1a1a1a] hover:bg-transparent px-0 font-light"
          >
            ← Back
          </Button>
          <Button
            onClick={handleNext}
            className="rounded-none bg-[#1a1a1a] text-white hover:bg-black uppercase tracking-[0.2em] px-10 h-14 text-xs font-bold transition-all duration-300"
          >
            Review Order
          </Button>
        </div>
      </div>
    </div>
  );
};

export default CheckoutPayment;