import React from 'react';
import { Loader2 } from 'lucide-react';

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  text?: string;
  className?: string;
  fullScreen?: boolean;
}

const sizeClasses = {
  sm: 'h-4 w-4',
  md: 'h-6 w-6',
  lg: 'h-8 w-8',
  xl: 'h-12 w-12',
};

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  size = 'md',
  text,
  className = '',
  fullScreen = false,
}) => {
  const spinner = (
    <div className={`flex flex-col items-center justify-center gap-2 ${className}`}>
      <Loader2 className={`animate-spin text-primary ${sizeClasses[size]}`} />
      {text && (
        <p className="text-sm text-muted-foreground animate-pulse">{text}</p>
      )}
    </div>
  );

  if (fullScreen) {
    return (
      <div className="fixed inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center z-50">
        {spinner}
      </div>
    );
  }

  return spinner;
};

// Specialized loading components
export const PageLoader: React.FC<{ text?: string }> = ({ text = 'Supersweets' }) => (
  <div className="min-h-screen flex items-center justify-center">
    <LoadingSpinner size="lg" text={text} />
  </div>
);

export const ComponentLoader: React.FC<{ text?: string; className?: string }> = ({ 
  text = 'Supersweets', 
  className = 'py-8' 
}) => (
  <div className={`flex items-center justify-center ${className}`}>
    <LoadingSpinner size="md" text={text} />
  </div>
);

export const ButtonLoader: React.FC<{ text?: string }> = ({ text = 'Supersweets' }) => (
  <div className="flex items-center gap-2">
    <Loader2 className="h-4 w-4 animate-spin" />
    <span>{text}</span>
  </div>
);

// Skeleton loading components
export const ProductCardSkeleton: React.FC = () => (
  <div className="bg-white rounded-lg shadow-sm border animate-pulse">
    <div className="aspect-square bg-gray-200 rounded-t-lg"></div>
    <div className="p-4 space-y-3">
      <div className="h-4 bg-gray-200 rounded w-3/4"></div>
      <div className="h-3 bg-gray-200 rounded w-1/2"></div>
      <div className="h-6 bg-gray-200 rounded w-1/3"></div>
    </div>
  </div>
);

export const OrderCardSkeleton: React.FC = () => (
  <div className="bg-white rounded-lg shadow-sm border p-4 animate-pulse">
    <div className="flex justify-between items-start mb-3">
      <div className="space-y-2">
        <div className="h-4 bg-gray-200 rounded w-32"></div>
        <div className="h-3 bg-gray-200 rounded w-24"></div>
      </div>
      <div className="h-6 bg-gray-200 rounded w-20"></div>
    </div>
    <div className="space-y-2">
      <div className="h-3 bg-gray-200 rounded w-full"></div>
      <div className="h-3 bg-gray-200 rounded w-2/3"></div>
    </div>
  </div>
);

export const TableSkeleton: React.FC<{ rows?: number; cols?: number }> = ({ 
  rows = 5, 
  cols = 4 
}) => (
  <div className="space-y-3">
    {Array.from({ length: rows }).map((_, rowIndex) => (
      <div key={rowIndex} className="flex gap-4 animate-pulse">
        {Array.from({ length: cols }).map((_, colIndex) => (
          <div 
            key={colIndex} 
            className="h-4 bg-gray-200 rounded flex-1"
          ></div>
        ))}
      </div>
    ))}
  </div>
);

// Loading overlay for forms
export const FormLoadingOverlay: React.FC<{ isLoading: boolean; text?: string }> = ({ 
  isLoading, 
  text = 'Saving...' 
}) => {
  if (!isLoading) return null;

  return (
    <div className="absolute inset-0 bg-white/80 backdrop-blur-sm flex items-center justify-center z-10 rounded-lg">
      <LoadingSpinner size="md" text={text} />
    </div>
  );
};