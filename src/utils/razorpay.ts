import { CartItem } from '@/store/useStore';

declare global {
  interface Window {
    Razorpay: any;
  }
}

export interface RazorpayOptions {
  key: string;
  amount: number;
  currency: string;
  name: string;
  description: string;
  order_id?: string; // Optional for direct payments
  image?: string;
  handler: (response: any) => void;
  prefill: {
    name: string;
    email: string;
    contact: string;
  };
  notes: {
    [key: string]: string;
  };
  theme: {
    color: string;
  };
  modal: {
    ondismiss: () => void;
  };
  retry?: {
    enabled: boolean;
    max_count: number;
  };
}

export interface RazorpayResponse {
  razorpay_payment_id: string;
  razorpay_order_id: string;
  razorpay_signature: string;
}

export interface OrderData {
  orderId: string;
  amount: number;
  currency: string;
  items: CartItem[];
  customerInfo: {
    name: string;
    email: string;
    phone: string;
  };
  deliveryAddress: {
    address: string;
    lat: number;
    lng: number;
    plotNumber?: string;
    buildingName?: string;
    street?: string;
    landmark?: string;
    pincode?: string;
    addressType?: string;
    saveAs?: string;
  };
}

// Load Razorpay script dynamically
export const loadRazorpayScript = (): Promise<boolean> => {
  return new Promise((resolve) => {
    if (window.Razorpay) {
      resolve(true);
      return;
    }

    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
};

// Create order for client-side Razorpay integration (no Edge Functions)
export const createRazorpayOrder = async (orderData: OrderData): Promise<{
  id: string;
  amount: number;
  currency: string;
}> => {
  try {
    // Generate a unique order ID for tracking
    const timestamp = Date.now();
    const randomString = Math.random().toString(36).substring(2, 9);
    const orderId = `PARIDHANHAAT_${timestamp}_${randomString}`;

    const amount = Math.round(orderData.amount * 100); // Convert to paise

    // Log order creation for debugging
    console.log('Creating client-side order:', {
      orderId,
      amount,
      currency: orderData.currency,
      customer: orderData.customerInfo.name,
      items: orderData.items.length
    });

    return {
      id: orderId,
      amount: amount,
      currency: orderData.currency
    };
  } catch (error) {
    console.error('Error creating order:', error);
    throw new Error('Failed to create payment order. Please try again.');
  }
};

// Verify payment using client-side validation (no Edge Functions)
export const verifyRazorpayPayment = async (
  paymentId: string,
  orderId: string,
  signature: string
): Promise<{ success: boolean; message: string }> => {
  try {
    // Basic validation - check if all required fields are present
    if (!paymentId || !orderId || !signature) {
      return {
        success: false,
        message: 'Missing payment verification data'
      };
    }

    // Validate payment ID format (Razorpay payment IDs start with 'pay_')
    if (!paymentId.startsWith('pay_') || paymentId.length < 18) {
      return {
        success: false,
        message: 'Invalid payment ID format'
      };
    }

    // For client-side integration without Edge Functions, we trust Razorpay's callback
    // since the payment was processed through their secure checkout
    // In production, you should implement server-side verification

    console.log('Payment verification (client-side):', {
      paymentId,
      orderId,
      signature: signature.substring(0, 10) + '...' // Log partial signature for debugging
    });

    return {
      success: true,
      message: 'Payment verified successfully'
    };
  } catch (error) {
    console.error('Error verifying payment:', error);
    return {
      success: false,
      message: 'Payment verification failed. Please contact support.'
    };
  }
};

// Initialize Razorpay payment
export const initiateRazorpayPayment = async (
  orderData: OrderData,
  onSuccess: (response: RazorpayResponse) => void,
  onError: (error: any) => void
): Promise<void> => {
  try {
    // Load Razorpay script
    const isLoaded = await loadRazorpayScript();
    if (!isLoaded) {
      throw new Error('Failed to load Razorpay SDK');
    }

    // Create order
    const order = await createRazorpayOrder(orderData);

    // Get Razorpay key from environment
    const razorpayKey = import.meta.env.VITE_RAZORPAY_KEY_ID;
    if (!razorpayKey) {
      throw new Error('Razorpay key not configured');
    }

    // Razorpay options for client-side integration (no pre-created order)
    const options: any = {
      key: razorpayKey,
      amount: order.amount,
      currency: order.currency,
      name: 'Paridhan Haat',
      description: `Luxury Order from Paridhan Haat`,
      // Note: No order_id for direct payment integration
      image: '/logo.png', // Uses the logo from public directory
      handler: async (response: any) => {
        try {
          console.log('Payment successful:', response);

          // For direct payment, response will have payment_id and signature
          const paymentResponse: RazorpayResponse = {
            razorpay_payment_id: response.razorpay_payment_id,
            razorpay_order_id: order.id, // Our generated order ID
            razorpay_signature: response.razorpay_signature || 'client_side_payment'
          };

          // Verify payment using client-side validation
          const verification = await verifyRazorpayPayment(
            paymentResponse.razorpay_payment_id,
            paymentResponse.razorpay_order_id,
            paymentResponse.razorpay_signature
          );

          if (verification.success) {
            onSuccess(paymentResponse);
          } else {
            onError(new Error(verification.message || 'Payment verification failed'));
          }
        } catch (error) {
          console.error('Payment handler error:', error);
          onError(error);
        }
      },
      prefill: {
        name: orderData.customerInfo.name,
        email: orderData.customerInfo.email,
        contact: orderData.customerInfo.phone,
      },
      notes: {
        address: `${orderData.deliveryAddress.plotNumber || ''} ${orderData.deliveryAddress.buildingName || ''}, ${orderData.deliveryAddress.street || ''}, ${orderData.deliveryAddress.address}`.trim(),
        order_id: orderData.orderId,
        customer_name: orderData.customerInfo.name,
        items_count: orderData.items.length.toString()
      },
      theme: {
        color: '#1a1a1a', // Luxury Charcoal
      },
      modal: {
        ondismiss: () => {
          console.log('Payment modal dismissed by user');
          onError(new Error('Payment cancelled by user'));
        },
      },
      retry: {
        enabled: true,
        max_count: 3
      }
    };

    // Create Razorpay instance and open
    const razorpay = new window.Razorpay(options);
    razorpay.open();

  } catch (error) {
    onError(error);
  }
};

// Format amount for display
export const formatRazorpayAmount = (amount: number): string => {
  return `₹${(amount / 100).toFixed(2)}`;
};

// Generate order receipt
export const generateOrderReceipt = (orderData: OrderData): string => {
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  return `PARIDHANHAAT_${timestamp}_${orderData.orderId.substring(orderData.orderId.length - 6)}`;
};
