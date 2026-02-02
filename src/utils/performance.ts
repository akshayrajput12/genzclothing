/**
 * Performance monitoring utilities for supersweets
 * Helps track page load times and user interactions
 */

// Performance metrics interface
interface PerformanceMetric {
  name: string;
  value: number;
  timestamp: number;
}

class PerformanceMonitor {
  private metrics: PerformanceMetric[] = [];
  private isProduction = import.meta.env.PROD;

  // Track page load performance
  trackPageLoad(pageName: string) {
    if (!this.isProduction) return;

    const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
    if (navigation) {
      this.addMetric(`${pageName}_load_time`, navigation.loadEventEnd - navigation.fetchStart);
      this.addMetric(`${pageName}_dom_ready`, navigation.domContentLoadedEventEnd - navigation.fetchStart);
    }
  }

  // Track user interactions
  trackInteraction(action: string, duration?: number) {
    if (!this.isProduction) return;

    this.addMetric(`interaction_${action}`, duration || performance.now());
  }

  // Track API call performance
  trackApiCall(endpoint: string, duration: number, success: boolean) {
    if (!this.isProduction) return;

    this.addMetric(`api_${endpoint}_duration`, duration);
    this.addMetric(`api_${endpoint}_${success ? 'success' : 'error'}`, 1);
  }

  // Add metric to collection
  private addMetric(name: string, value: number) {
    this.metrics.push({
      name,
      value,
      timestamp: Date.now(),
    });

    // Keep only last 100 metrics to prevent memory leaks
    if (this.metrics.length > 100) {
      this.metrics = this.metrics.slice(-100);
    }
  }

  // Get performance summary
  getMetrics() {
    return this.metrics;
  }

  // Clear metrics
  clearMetrics() {
    this.metrics = [];
  }
}

// Create singleton instance
export const performanceMonitor = new PerformanceMonitor();

// Utility function to measure async operations
export async function measureAsync<T>(
  name: string,
  operation: () => Promise<T>
): Promise<T> {
  const start = performance.now();
  try {
    const result = await operation();
    const duration = performance.now() - start;
    performanceMonitor.trackApiCall(name, duration, true);
    return result;
  } catch (error) {
    const duration = performance.now() - start;
    performanceMonitor.trackApiCall(name, duration, false);
    throw error;
  }
}

// Utility function to measure synchronous operations
export function measureSync<T>(name: string, operation: () => T): T {
  const start = performance.now();
  try {
    const result = operation();
    const duration = performance.now() - start;
    performanceMonitor.trackInteraction(name, duration);
    return result;
  } catch (error) {
    const duration = performance.now() - start;
    performanceMonitor.trackInteraction(`${name}_error`, duration);
    throw error;
  }
}

// Web Vitals tracking (Core Web Vitals)
export function trackWebVitals() {
  if (typeof window === 'undefined' || !import.meta.env.PROD) return;

  // Track Largest Contentful Paint (LCP)
  new PerformanceObserver((list) => {
    const entries = list.getEntries();
    const lastEntry = entries[entries.length - 1];
    performanceMonitor.trackInteraction('lcp', lastEntry.startTime);
  }).observe({ entryTypes: ['largest-contentful-paint'] });

  // Track First Input Delay (FID)
  new PerformanceObserver((list) => {
    const entries = list.getEntries();
    entries.forEach((entry: any) => {
      performanceMonitor.trackInteraction('fid', entry.processingStart - entry.startTime);
    });
  }).observe({ entryTypes: ['first-input'] });

  // Track Cumulative Layout Shift (CLS)
  let clsValue = 0;
  new PerformanceObserver((list) => {
    const entries = list.getEntries();
    entries.forEach((entry: any) => {
      if (!entry.hadRecentInput) {
        clsValue += entry.value;
      }
    });
    performanceMonitor.trackInteraction('cls', clsValue);
  }).observe({ entryTypes: ['layout-shift'] });
}