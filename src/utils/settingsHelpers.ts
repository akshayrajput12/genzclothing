/**
 * Helper functions for handling settings values safely
 */

// Safely convert settings value to number
export const toNumber = (value: any, defaultValue: number = 0): number => {
  // Handle null, undefined, empty string
  if (value === null || value === undefined || value === '') {
    return defaultValue;
  }
  
  // If already a number
  if (typeof value === 'number') {
    return isNaN(value) ? defaultValue : value;
  }
  
  // If string, try to parse
  if (typeof value === 'string') {
    const trimmed = value.trim();
    if (trimmed === '') return defaultValue;
    
    const parsed = parseFloat(trimmed);
    return isNaN(parsed) ? defaultValue : parsed;
  }
  
  // Try to convert other types
  const converted = Number(value);
  return isNaN(converted) ? defaultValue : converted;
};

// Safely convert settings value to boolean
export const toBoolean = (value: any, defaultValue: boolean = false): boolean => {
  // Handle null, undefined
  if (value === null || value === undefined) {
    return defaultValue;
  }
  
  // If already boolean
  if (typeof value === 'boolean') return value;
  
  // If string
  if (typeof value === 'string') {
    const trimmed = value.trim().toLowerCase();
    if (trimmed === 'true' || trimmed === '1' || trimmed === 'yes') return true;
    if (trimmed === 'false' || trimmed === '0' || trimmed === 'no') return false;
    return defaultValue;
  }
  
  // If number
  if (typeof value === 'number') {
    return value !== 0;
  }
  
  return defaultValue;
};

// Safely convert settings value to string
export const toString = (value: any, defaultValue: string = ''): string => {
  // Handle null, undefined
  if (value === null || value === undefined) {
    return defaultValue;
  }
  
  // If already string
  if (typeof value === 'string') return value;
  
  // Convert other types to string
  try {
    return String(value);
  } catch {
    return defaultValue;
  }
};

// Format currency with proper number handling
export const formatCurrency = (amount: any, currencySymbol: string = '₹'): string => {
  const numAmount = toNumber(amount, 0);
  return `${currencySymbol}${numAmount.toFixed(2)}`;
};

// Calculate percentage safely
export const calculatePercentage = (amount: any, percentage: any): number => {
  const numAmount = toNumber(amount, 0);
  const numPercentage = toNumber(percentage, 0);
  return (numAmount * numPercentage) / 100;
};

// Check if value meets threshold
export const meetsThreshold = (value: any, threshold: any): boolean => {
  const numValue = toNumber(value, 0);
  const numThreshold = toNumber(threshold, 0);
  return numValue >= numThreshold;
};