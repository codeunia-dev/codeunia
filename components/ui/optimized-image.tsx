'use client'

import Image from 'next/image'
import { useState, useEffect } from 'react'
import { cn } from '@/lib/utils'

interface OptimizedImageProps {
  src: string
  alt: string
  width: number
  height: number
  className?: string
  priority?: boolean
  quality?: number
  sizes?: string
  placeholder?: 'blur' | 'empty'
  blurDataURL?: string
  onLoad?: () => void
  onError?: () => void
}

export function OptimizedImage({
  src,
  alt,
  width,
  height,
  className,
  priority = false,
  quality = 85,
  sizes = '(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw',
  placeholder = 'empty',
  blurDataURL,
  onLoad,
  onError,
}: OptimizedImageProps) {
  const [isLoading, setIsLoading] = useState(true)
  const [hasError, setHasError] = useState(false)

  // Optimize image URL for better performance
  const optimizedSrc = src.includes('?') 
    ? `${src}&w=${width}&q=${quality}&f=webp`
    : `${src}?w=${width}&q=${quality}&f=webp`

  const handleLoad = () => {
    setIsLoading(false)
    onLoad?.()
  }

  const handleError = () => {
    setIsLoading(false)
    setHasError(true)
    onError?.()
  }

  if (hasError) {
    return (
      <div 
        className={cn(
          'bg-gray-100 flex items-center justify-center',
          className
        )}
        style={{ width, height }}
      >
        <span className="text-gray-500 text-sm">Failed to load image</span>
      </div>
    )
  }

  return (
    <div className={cn('relative overflow-hidden', className)}>
      <Image
        src={optimizedSrc}
        alt={alt}
        width={width}
        height={height}
        className={cn(
          'transition-opacity duration-300',
          isLoading ? 'opacity-0' : 'opacity-100'
        )}
        priority={priority}
        sizes={sizes}
        placeholder={placeholder}
        blurDataURL={blurDataURL}
        onLoad={handleLoad}
        onError={handleError}
        quality={quality}
        // Performance optimizations
        loading={priority ? 'eager' : 'lazy'}
        decoding="async"
      />
      
      {/* Loading skeleton */}
      {isLoading && (
        <div 
          className="absolute inset-0 bg-gradient-to-br from-gray-200 to-gray-300 animate-pulse"
          style={{ width, height }}
        />
      )}
    </div>
  )
}

// Lazy loaded image component
export function LazyImage({
  src,
  alt,
  width,
  height,
  className,
  threshold = 0.1,
  ...props
}: OptimizedImageProps & { threshold?: number }) {
  const [isInView, setIsInView] = useState(false)
  const [imageRef, setImageRef] = useState<HTMLDivElement | null>(null)

  useEffect(() => {
    if (!imageRef) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsInView(true)
          observer.unobserve(imageRef)
        }
      },
      { threshold }
    )

    observer.observe(imageRef)
    return () => observer.disconnect()
  }, [imageRef, threshold])

  return (
    <div ref={setImageRef} className={cn('relative', className)}>
      {isInView ? (
        <OptimizedImage
          src={src}
          alt={alt}
          width={width}
          height={height}
          {...props}
        />
      ) : (
        <div 
          className="bg-gradient-to-br from-gray-200 to-gray-300 animate-pulse"
          style={{ width, height }}
        />
      )}
    </div>
  )
}

// Responsive image component
export function ResponsiveImage({
  src,
  alt,
  className,
  ...props
}: Omit<OptimizedImageProps, 'width' | 'height'> & {
  aspectRatio?: number
}) {
  const { aspectRatio = 16 / 9, ...restProps } = props

  return (
    <div className={cn('relative w-full', className)}>
      <div style={{ paddingBottom: `${(1 / aspectRatio) * 100}%` }}>
        <Image
          src={src}
          alt={alt}
          fill
          className="object-cover"
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          {...restProps}
        />
      </div>
    </div>
  )
} 