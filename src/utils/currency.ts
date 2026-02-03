export const formatCurrency = (price: number, symbol: string = '₹'): string => {
  if (symbol && symbol !== '₹') {
    // If a custom symbol is passed that isn't the default rupee, use it.
    // However, user specifically asked for "use indian pricing only".
    // But strictly following `formatCurrency` signature often implies flexibility.
    // To be safe and fix the error while respecting user request:
    return `₹${price.toLocaleString('en-IN')}`;
  }
  return `₹${price.toLocaleString('en-IN')}`;
};

export const formatPrice = formatCurrency;

export const calculateDiscount = (originalPrice: number, currentPrice: number): number => {
  return Math.round(((originalPrice - currentPrice) / originalPrice) * 100);
};