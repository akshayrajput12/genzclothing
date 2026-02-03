import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { formatPrice } from '@/utils/currency';
import { toNumber, formatCurrency } from '@/utils/settingsHelpers';

interface ContactInfo {
  name: string;
  email: string;
  phone: string;
}

interface AddressDetails {
  plotNumber: string;
  buildingName: string;
  street: string;
  landmark: string;
  city: string;
  state: string;
  pincode: string;
  addressType: 'home' | 'work' | 'other';
  saveAs: string;
}

interface CheckoutSummaryProps {
  customerInfo: ContactInfo;
  addressDetails: AddressDetails;
  paymentMethod: string;
  cartItems: any[];
  subtotal: number;
  tax: number;
  deliveryFee: number;
  codFee: number;
  discount: number;
  total: number;
  settings: any;
  isMinOrderMet: boolean;
  minOrderShortfall: number;
  isProcessingPayment: boolean;
  estimatedDeliveryFee: number | null;
  estimatedDeliveryTime: string | null;
  couponCode: string;
  setCouponCode: (code: string) => void;
  appliedCoupon: any;
  setAppliedCoupon: (coupon: any) => void;
  availableCoupons: any[];
  onPlaceOrder: () => void;
  onPrev: () => void;
  onApplyCoupon: () => void;
  onRemoveCoupon: () => void;
  isPincodeServiceable: boolean; // Add this prop
}

const CheckoutSummary = ({
  customerInfo,
  addressDetails,
  paymentMethod,
  cartItems,
  subtotal,
  tax,
  deliveryFee,
  codFee,
  discount,
  total,
  settings,
  isMinOrderMet,
  minOrderShortfall,
  isProcessingPayment,
  estimatedDeliveryFee,
  estimatedDeliveryTime,
  couponCode,
  setCouponCode,
  appliedCoupon,
  setAppliedCoupon,
  availableCoupons,
  onPlaceOrder,
  onPrev,
  onApplyCoupon,
  onRemoveCoupon,
  isPincodeServiceable // Add this prop
}: CheckoutSummaryProps) => {
  return (
    <div className="space-y-6 font-display animate-in fade-in duration-700">
      {/* Order Summary Header */}
      <h2 className="sr-only">Order Summary</h2>

      <div className="space-y-8">
        {/* Order Items - Manifest */}
        <div className="bg-white/50 dark:bg-white/5 backdrop-blur-md border border-[#F97316]/20 rounded-xl p-8 shadow-sm relative overflow-hidden">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-1.5 h-6 bg-[#F97316] rounded-full"></div>
            <h2 className="text-2xl font-bebas text-[#0B0B0F] dark:text-white italic tracking-wide">
              GEAR MANIFEST ({cartItems.reduce((sum, item) => sum + item.quantity, 0)})
            </h2>
          </div>

          <div className="divide-y divide-gray-200 dark:divide-white/10">
            {cartItems.map((item) => (
              <div key={`${item.id}-${item.selectedSize}`} className="py-6 flex items-start gap-6 group">
                <div className="w-20 h-24 bg-gray-100 dark:bg-black/40 rounded-lg overflow-hidden shrink-0 border border-transparent group-hover:border-[#F97316]/50 transition-colors">
                  <img
                    src={item.image}
                    alt={item.name}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-bebas text-[#0B0B0F] dark:text-white text-xl tracking-wide truncate group-hover:text-[#F97316] transition-colors">{item.name}</h3>
                  <div className="flex flex-wrap gap-2 mt-2">
                    <span className="text-[10px] uppercase font-bold tracking-widest bg-gray-100 dark:bg-white/10 px-2 py-1 rounded text-gray-500 dark:text-gray-400">
                      SIZE: {item.selectedSize || 'STD'}
                    </span>
                    <span className="text-[10px] uppercase font-bold tracking-widest bg-gray-100 dark:bg-white/10 px-2 py-1 rounded text-gray-500 dark:text-gray-400">
                      QTY: {item.quantity}
                    </span>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-bebas text-lg text-[#0B0B0F] dark:text-white">{formatPrice(item.price * item.quantity)}</p>
                  <p className="text-[10px] font-mono text-gray-400 mt-1">
                    {formatPrice(item.price)} / UNIT
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Customer Details Summary - Intel Card */}
          <div className="bg-white/50 dark:bg-white/5 backdrop-blur-md border border-[#F97316]/20 rounded-xl p-8 shadow-sm h-fit relative">
            <h3 className="font-bebas text-xl text-[#0B0B0F] dark:text-white tracking-wide mb-6 flex items-center gap-2">
              <span className="material-symbols-outlined text-[#F97316] text-lg">local_shipping</span>
              MISSION LOGISTICS
            </h3>

            <div className="space-y-6 text-sm">
              <div className="relative pl-4 border-l-2 border-[#F97316]/30">
                <p className="text-[10px] font-bold uppercase tracking-widest text-[#F97316] mb-1">OPERATIVE</p>
                <p className="font-bebas text-lg text-[#0B0B0F] dark:text-white tracking-wide">{customerInfo.name}</p>
                <div className="text-gray-500 dark:text-gray-400 font-mono text-xs mt-1 space-y-1">
                  <p>{customerInfo.email}</p>
                  <p>{customerInfo.phone}</p>
                </div>
              </div>

              <div className="relative pl-4 border-l-2 border-[#F97316]/30">
                <p className="text-[10px] font-bold uppercase tracking-widest text-[#F97316] mb-1">DROP ZONE</p>
                <p className="text-[#0B0B0F] dark:text-white text-xs font-bold uppercase leading-relaxed">
                  {addressDetails.plotNumber}
                  {addressDetails.buildingName && `, ${addressDetails.buildingName}`}
                </p>
                <p className="text-gray-500 dark:text-gray-400 text-xs mt-1 uppercase">
                  {addressDetails.street}
                  {addressDetails.landmark && `, Near ${addressDetails.landmark}`}<br />
                  {addressDetails.city}, {addressDetails.state} - {addressDetails.pincode}
                </p>
              </div>

              <div className="relative pl-4 border-l-2 border-[#F97316]/30">
                <p className="text-[10px] font-bold uppercase tracking-widest text-[#F97316] mb-1">PAYMENT PROTOCOL</p>
                <p className="font-bebas text-lg text-[#0B0B0F] dark:text-white tracking-wide">
                  {paymentMethod === 'cod' ? 'PHYSICAL HANDOVER (COD)' : 'DIGITAL TRANSFER'}
                </p>
              </div>
            </div>
          </div>

          {/* Order Totals & Coupon - Black Box */}
          <div className="bg-[#0B0B0F] text-white p-8 rounded-xl shadow-2xl h-fit border border-gray-800 relative overflow-hidden">
            {/* Background Mesh */}
            <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-10 mix-blend-overlay"></div>

            <h3 className="font-bebas text-2xl text-white mb-8 tracking-wide relative z-10 flex items-center justify-between">
              <span>BOUNTY BREAKDOWN</span>
              <span className="text-[#F97316] text-sm font-mono tracking-widest animate-pulse">LIVE CALC</span>
            </h3>

            <div className="space-y-4 text-sm font-mono relative z-10">
              <div className="flex justify-between items-center text-gray-400">
                <span className="uppercase tracking-wide text-xs">Subtotal</span>
                <span className="text-white font-bold">{formatPrice(subtotal)}</span>
              </div>
              <div className="flex justify-between items-center text-gray-400">
                <span className="uppercase tracking-wide text-xs">Transport</span>
                <span className="text-white font-bold">{deliveryFee === 0 ? 'FREE' : formatPrice(deliveryFee)}</span>
              </div>
              <div className="flex justify-between items-center text-gray-400">
                <span className="uppercase tracking-wide text-xs">Taxes</span>
                <span className="text-white font-bold">{formatPrice(tax)}</span>
              </div>
              {paymentMethod === 'cod' && Number(settings.cod_charge) > 0 && (
                <div className="flex justify-between items-center text-gray-400">
                  <span className="uppercase tracking-wide text-xs">COD Fee</span>
                  <span className="text-white font-bold">{formatPrice(codFee)}</span>
                </div>
              )}
              {discount > 0 && (
                <div className="flex justify-between items-center text-green-400 bg-green-900/10 p-2 rounded -mx-2">
                  <span className="uppercase tracking-wide text-xs flex items-center gap-1">
                    <span className="material-symbols-outlined text-xs">local_offer</span> Discount
                  </span>
                  <span className="font-bold">-{formatPrice(discount)}</span>
                </div>
              )}

              <div className="pt-6 border-t border-dashed border-gray-700 my-4">
                <div className="flex justify-between items-end">
                  <span className="font-bebas text-xl text-gray-300">TOTAL BOUNTY</span>
                  <div className="text-right">
                    <span className="block text-3xl font-bebas text-[#F97316] drop-shadow-[0_0_10px_rgba(249,115,22,0.5)]">
                      {formatPrice(total)}
                    </span>
                    <span className="text-[10px] text-gray-500 mt-1 uppercase tracking-widest">Global Taxes Included</span>
                  </div>
                </div>
              </div>

              {/* Sub-total warning */}
              {subtotal < toNumber(settings.min_order_amount) && (
                <div className="bg-red-900/20 border border-red-900/30 p-3 mt-4 text-center rounded">
                  <p className="text-red-400 text-[10px] tracking-wide uppercase font-bold">
                    ⚠️ LOW BOUNTY: Min {formatCurrency(settings.min_order_amount, settings.currency_symbol)} Required
                  </p>
                </div>
              )}

              {/* Coupon Section */}
              <div className="pt-6 mt-4">
                {appliedCoupon ? (
                  <div className="flex items-center justify-between p-3 bg-gray-800/50 border border-green-500/30 rounded-lg">
                    <div>
                      <span className="text-sm font-bold text-white block tracking-widest uppercase">
                        {appliedCoupon.code}
                      </span>
                      <span className="text-[10px] text-green-400 block mt-0.5 uppercase tracking-wide">Code Active</span>
                    </div>
                    <button onClick={onRemoveCoupon} className="text-gray-400 hover:text-red-400 text-[10px] uppercase font-bold tracking-widest transition-colors">
                      [EJECT]
                    </button>
                  </div>
                ) : (
                  <div className="flex gap-2">
                    <Input
                      placeholder="ENTER SECRET CODE"
                      value={couponCode}
                      onChange={(e) => setCouponCode(e.target.value)}
                      className="bg-black/30 border-gray-700 text-white placeholder:text-gray-600 rounded-lg focus:border-[#F97316] h-10 text-xs uppercase tracking-wide font-mono"
                    />
                    <Button
                      onClick={onApplyCoupon}
                      className="bg-white text-black hover:bg-[#F97316] hover:text-white transition-colors rounded-lg text-[10px] uppercase font-bold px-6 h-10 tracking-widest"
                    >
                      UNLOCK
                    </Button>
                  </div>
                )}
              </div>
            </div>

            <Button
              onClick={onPlaceOrder}
              size="lg"
              className="w-full mt-8 group relative overflow-hidden bg-[#F97316] text-white hover:bg-[#EA580C] uppercase tracking-[0.2em] h-14 text-sm font-bebas transition-all duration-300 rounded-lg shadow-[0_0_30px_rgba(249,115,22,0.3)] hover:shadow-[0_0_50px_rgba(249,115,22,0.5)] disabled:grayscale disabled:opacity-50"
              disabled={isProcessingPayment || !isMinOrderMet || !isPincodeServiceable}
            >
              <div className="absolute inset-0 bg-white/20 transform skew-x-12 translate-x-[-200%] group-hover:translate-x-[200%] transition-transform duration-700"></div>
              {isProcessingPayment ? (
                <div className="flex items-center justify-center space-x-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  <span>TRANSMITTING...</span>
                </div>
              ) : !isMinOrderMet ? (
                <span>NEED {formatCurrency(minOrderShortfall, settings.currency_symbol)} MORE</span>
              ) : !isPincodeServiceable ? (
                <span>SECTOR LOCKED (No Service)</span>
              ) : (
                <span className="relative z-10 flex items-center justify-center gap-2">
                  EXECUTE ORDER <span className="material-symbols-outlined text-sm">rocket_launch</span>
                </span>
              )}
            </Button>

            {!isPincodeServiceable && (
              <p className="text-red-400 text-[10px] text-center mt-4 uppercase tracking-wide font-mono animate-pulse">
                Order Delivery Unavailable to Sector {addressDetails.pincode}
              </p>
            )}

            <p className="text-gray-500 text-[10px] text-center mt-4 uppercase tracking-widest font-mono">
              By executing, you agree to mission protocols.
            </p>
          </div>
        </div>

        <div className="text-center pt-8">
          <Button
            variant="ghost"
            onClick={onPrev}
            className="text-gray-400 hover:text-[#F97316] hover:bg-transparent px-0 font-bold text-xs tracking-widest uppercase hover:underline"
          >
            ← Re-verify Mission Data
          </Button>
        </div>
      </div>
    </div>
  );
};

export default CheckoutSummary;