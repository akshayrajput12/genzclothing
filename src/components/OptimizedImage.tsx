import React, { useState, useRef, useEffect } from 'react';
import { 
  getOptimizedImageUrl, 
  generateSrcSet, 
  generateSizes, 
  initImageObserver, 
  generatePlaceholder,
  handleImageError 
} from '@/utils/imageOptimization';

interface OptimizedImageProps {
  src: string;
  alt: string;
  width?: number;
  height?: number;
  quality?: number;
  className?: string;
  lazy?: boolean;
  responsive?: boolean;
  placeholder?: boolean;
  fallback?: string;
  onLoad?: () => void;
  onError?: () => void;
}

export const OptimizedImage: React.FC<OptimizedImageProps> = ({
  src,
  alt,
  width,
  height,
  quality = 80,
  className = '',
  lazy = true,
  responsive = true,
  placeholder = true,
  fallback,
  onLoad,
  onError,
}) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);
  const imgRef = useRef<HTMLImageElement>(null);

  // Generate optimized URLs
  const optimizedSrc = getOptimizedImageUrl(src, width, height, quality);
  const srcSet = responsive ? generateSrcSet(src) : undefined;
  const sizes = responsive ? generateSizes() : undefined;
  const placeholderSrc = placeholder && width && height 
    ? generatePlaceholder(width, height) 
    : undefined;

  useEffect(() => {
    if (!lazy || !imgRef.current) return;

    const observer = initImageObserver();
    observer.observe(imgRef.current);

    return () => {
      if (imgRef.current) {
        observer.unobserve(imgRef.current);
      }
    };
  }, [lazy]);

  const handleLoad = () => {
    setIsLoaded(true);
    onLoad?.();
  };

  const handleImageError = (event: React.SyntheticEvent<HTMLImageElement>) => {
    setHasError(true);
    handleImageError(event);
    onError?.();
  };

  const imageClasses = `
    ${className}
    ${lazy ? 'lazy-loading' : ''}
    ${isLoaded ? 'lazy-loaded' : ''}
    ${hasError ? 'image-error' : ''}
    transition-opacity duration-300
    ${isLoaded ? 'opacity-100' : 'opacity-0'}
  `.trim();

  if (lazy) {
    return (
      <img
        ref={imgRef}
        data-src={optimizedSrc}
        data-srcset={srcSet}
        data-fallback={fallback}
        src={placeholderSrc}
        alt={alt}
        width={width}
        height={height}
        sizes={sizes}
        className={imageClasses}
        onLoad={handleLoad}
        onError={handleImageError}
        loading="lazy"
      />
    );
  }

  return (
    <img
      ref={imgRef}
      src={optimizedSrc}
      srcSet={srcSet}
      alt={alt}
      width={width}
      height={height}
      sizes={sizes}
      className={imageClasses}
      onLoad={handleLoad}
      onError={handleImageError}
      data-fallback={fallback}
    />
  );
};

// Specialized components for common use cases
export const ProductImage: React.FC<Omit<OptimizedImageProps, 'responsive' | 'lazy'> & {
  size?: 'small' | 'medium' | 'large';
}> = ({ size = 'medium', ...props }) => {
  const dimensions = {
    small: { width: 150, height: 150 },
    medium: { width: 300, height: 300 },
    large: { width: 600, height: 600 },
  };

  return (
    <OptimizedImage
      {...props}
      {...dimensions[size]}
      responsive={true}
      lazy={true}
      fallback="/api/placeholder/300/300"
    />
  );
};

export const HeroImage: React.FC<Omit<OptimizedImageProps, 'lazy' | 'responsive'>> = (props) => {
  return (
    <OptimizedImage
      {...props}
      lazy={false} // Hero images should load immediately
      responsive={true}
      quality={90} // Higher quality for hero images
    />
  );
};

export const ThumbnailImage: React.FC<Omit<OptimizedImageProps, 'width' | 'height'>> = (props) => {
  return (
    <OptimizedImage
      {...props}
      width={64}
      height={64}
      quality={70} // Lower quality for thumbnails
      responsive={false}
    />
  );
};