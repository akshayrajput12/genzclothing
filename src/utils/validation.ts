/**
 * Form validation utilities for supersweets
 * Provides validation functions for checkout and other forms
 */

// Email validation
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

// Phone number validation (Indian format)
export function isValidPhone(phone: string): boolean {
  // Remove all non-digit characters
  const cleanPhone = phone.replace(/\D/g, '');
  
  // Check if it's a valid Indian mobile number
  // Should be 10 digits starting with 6, 7, 8, or 9
  // Or 11 digits starting with 0
  // Or 12 digits starting with 91
  if (cleanPhone.length === 10) {
    return /^[6-9]/.test(cleanPhone);
  } else if (cleanPhone.length === 11) {
    return /^0[6-9]/.test(cleanPhone);
  } else if (cleanPhone.length === 12) {
    return /^91[6-9]/.test(cleanPhone);
  }
  
  return false;
}

// Name validation
export function isValidName(name: string): boolean {
  // Should be at least 2 characters, only letters and spaces
  const nameRegex = /^[a-zA-Z\s]{2,50}$/;
  return nameRegex.test(name.trim());
}

// Pincode validation (Indian format)
export function isValidPincode(pincode: string): boolean {
  // Indian pincode should be 6 digits
  const pincodeRegex = /^[1-9][0-9]{5}$/;
  return pincodeRegex.test(pincode);
}

// Address validation
export function isValidAddress(address: string): boolean {
  // Should be at least 1 character for plot numbers, 5 for full addresses
  return address.trim().length >= 1;
}

// Plot number validation (more flexible)
export function isValidPlotNumber(plotNumber: string): boolean {
  // Should be at least 1 character, can contain numbers, letters, and common symbols
  const plotRegex = /^[a-zA-Z0-9\s\-\/\,\.]{1,50}$/;
  return plotRegex.test(plotNumber.trim());
}

// Coupon code validation
export function isValidCouponCode(code: string): boolean {
  // Should be 3-20 characters, alphanumeric and hyphens
  const couponRegex = /^[A-Z0-9-]{3,20}$/;
  return couponRegex.test(code.toUpperCase());
}

// Form validation for checkout steps
export interface ContactInfo {
  name: string;
  email: string;
  phone: string;
}

export interface AddressDetails {
  plotNumber: string;
  street: string;
  pincode: string;
  landmark?: string;
}

export interface ValidationResult {
  isValid: boolean;
  errors: string[];
}

// Validate contact information
export function validateContactInfo(info: ContactInfo): ValidationResult {
  const errors: string[] = [];

  if (!info.name.trim()) {
    errors.push('Name is required');
  } else if (!isValidName(info.name)) {
    errors.push('Please enter a valid name (2-50 characters, letters only)');
  }

  if (!info.email.trim()) {
    errors.push('Email is required');
  } else if (!isValidEmail(info.email)) {
    errors.push('Please enter a valid email address');
  }

  if (!info.phone.trim()) {
    errors.push('Phone number is required');
  } else if (!isValidPhone(info.phone)) {
    errors.push('Please enter a valid Indian mobile number');
  }

  return {
    isValid: errors.length === 0,
    errors
  };
}

// Validate address details
export function validateAddressDetails(address: AddressDetails): ValidationResult {
  const errors: string[] = [];

  if (!address.plotNumber.trim()) {
    errors.push('Plot/House number is required');
  } else if (!isValidPlotNumber(address.plotNumber)) {
    errors.push('Please enter a valid plot/house number (letters, numbers, and common symbols allowed)');
  }

  if (!address.street.trim()) {
    errors.push('Street address is required');
  } else if (!isValidAddress(address.street)) {
    errors.push('Please enter a valid street address');
  }

  if (!address.pincode.trim()) {
    errors.push('Pincode is required');
  } else if (!isValidPincode(address.pincode)) {
    errors.push('Please enter a valid 6-digit pincode');
  }

  return {
    isValid: errors.length === 0,
    errors
  };
}

// Format phone number for display
export function formatPhoneNumber(phone: string): string {
  const cleanPhone = phone.replace(/\D/g, '');
  
  if (cleanPhone.length === 10) {
    return `+91 ${cleanPhone.slice(0, 5)} ${cleanPhone.slice(5)}`;
  } else if (cleanPhone.length === 11 && cleanPhone.startsWith('0')) {
    return `+91 ${cleanPhone.slice(1, 6)} ${cleanPhone.slice(6)}`;
  } else if (cleanPhone.length === 12 && cleanPhone.startsWith('91')) {
    return `+${cleanPhone.slice(0, 2)} ${cleanPhone.slice(2, 7)} ${cleanPhone.slice(7)}`;
  }
  
  return phone;
}

// Format pincode for display
export function formatPincode(pincode: string): string {
  const cleanPincode = pincode.replace(/\D/g, '');
  return cleanPincode.slice(0, 6);
}

// Sanitize input to prevent XSS
export function sanitizeInput(input: string): string {
  return input
    .replace(/[<>]/g, '') // Remove angle brackets
    .replace(/javascript:/gi, '') // Remove javascript: protocol
    .replace(/on\w+=/gi, '') // Remove event handlers
    .trim();
}

// Validate order total
export function validateOrderTotal(total: number, minAmount: number = 0): ValidationResult {
  const errors: string[] = [];

  if (total <= 0) {
    errors.push('Order total must be greater than zero');
  }

  if (total < minAmount) {
    errors.push(`Minimum order amount is ₹${minAmount}`);
  }

  return {
    isValid: errors.length === 0,
    errors
  };
}

// Validate payment method selection
export function validatePaymentMethod(
  paymentMethod: string,
  total: number,
  settings: Record<string, any>
): ValidationResult {
  const errors: string[] = [];

  if (!paymentMethod) {
    errors.push('Please select a payment method');
  }

  if (paymentMethod === 'cod') {
    if (!settings.cod_enabled) {
      errors.push('Cash on Delivery is not available');
    } else if (total > settings.cod_threshold) {
      errors.push(`Cash on Delivery is not available for orders above ₹${settings.cod_threshold}`);
    }
  }

  if (paymentMethod === 'online' && !settings.razorpay_enabled) {
    errors.push('Online payment is not available');
  }

  return {
    isValid: errors.length === 0,
    errors
  };
}