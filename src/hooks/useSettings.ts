import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface AppSettings {
  // Business Settings
  tax_rate: number;
  delivery_charge: number;
  free_delivery_threshold: number;
  cod_charge: number;
  cod_threshold: number;
  min_order_amount: number;
  max_order_amount: number;
  bulk_discount_threshold: number;
  bulk_discount_percentage: number;

  // Display Settings
  currency_symbol: string;

  // Feature Flags
  cod_enabled: boolean;
  razorpay_enabled: boolean;
  upi_enabled: boolean;
  card_enabled: boolean;
  netbanking_enabled: boolean;

  // Store Info
  store_name: string;
  store_phone: string;
  store_email: string;
  store_address: string;
  store_pincode: string;
  business_hours_start: string;
  business_hours_end: string;
}

// Only minimal defaults for type safety - real values come from database
const defaultSettings: AppSettings = {
  tax_rate: 0,
  delivery_charge: 0,
  free_delivery_threshold: 0,
  cod_charge: 0,
  cod_threshold: 0,
  min_order_amount: 0,
  max_order_amount: 0,
  bulk_discount_threshold: 0,
  bulk_discount_percentage: 0,
  currency_symbol: '₹',
  cod_enabled: false,
  razorpay_enabled: false,
  upi_enabled: false,
  card_enabled: false,
  netbanking_enabled: false,
  store_name: '',
  store_phone: '',
  store_email: '',
  store_address: '',
  store_pincode: '201016',
  business_hours_start: '09:00',
  business_hours_end: '20:00'
};

export const useSettings = () => {
  const [settings, setSettings] = useState<AppSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchSettings = async () => {
    try {
      setLoading(true);
      setError(null);

      // Use the settings function to fetch data (fallback to direct query if function doesn't exist)
      let data, fetchError;
      try {
        const result = await supabase.rpc('get_app_settings' as any);
        data = result.data;
        fetchError = result.error;
      } catch (rpcError) {
        console.log('RPC function not available, using direct query');
        // Fallback to direct query
        const result = await supabase
          .from('settings' as any)
          .select('key, value')
          .in('key', [
            'tax_rate',
            'delivery_charge',
            'free_delivery_threshold',
            'cod_charge',
            'cod_threshold',
            'min_order_amount',
            'currency_symbol',
            'cod_enabled',
            'razorpay_enabled',
            'store_name',
            'store_phone',
            'store_email',
            'store_address',
            'business_hours_start',
            'business_hours_end'
          ]);
        data = result.data;
        fetchError = result.error;
      }

      if (fetchError) {
        throw fetchError;
      }

      if (data && data.length > 0) {
        const settingsMap: Partial<AppSettings> = {};

        data.forEach((setting: any) => {
          const key = setting.key as keyof AppSettings;
          let value = setting.value;

          console.log(`Raw setting ${key}:`, value, typeof value);

          try {
            // Parse database values - they are stored as JSONB
            if (typeof value === 'string') {
              // Handle JSON-encoded strings
              if (value.startsWith('"') && value.endsWith('"')) {
                // String values stored as JSON strings - remove quotes
                value = value.slice(1, -1);
              } else if (value === 'true') {
                value = true;
              } else if (value === 'false') {
                value = false;
              } else if (!isNaN(Number(value)) && value.trim() !== '') {
                // Numeric strings
                value = Number(value);
              }
            }
            // If it's already a number or boolean, keep it as is

            console.log(`Parsed setting ${key}:`, value, typeof value);
            (settingsMap as any)[key] = value;
          } catch (error) {
            console.error(`Failed to parse setting ${key}:`, value, error);
            // Keep the raw value if parsing fails
            (settingsMap as any)[key] = value;
          }
        });

        // Only fill missing keys with defaults, prioritize database values
        const finalSettings = { ...defaultSettings, ...settingsMap } as AppSettings;
        console.log('Final settings from database:', finalSettings);
        setSettings(finalSettings);
      } else {
        console.error('No settings found in database!');
        setError('No settings configured in database');
        setSettings(defaultSettings);
      }
    } catch (err) {
      console.error('Error fetching settings:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch settings');
      // Don't use defaults on error - let user know there's an issue
      setSettings(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  const refreshSettings = () => {
    fetchSettings();
  };

  return {
    settings: settings || defaultSettings, // Fallback to defaults only for UI safety
    loading,
    error,
    refreshSettings
  };
};

export default useSettings;