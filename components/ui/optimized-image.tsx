"use client"

import React, { useState, useRef, useEffect } from 'react'
import Image from 'next/image'
import { cn } from '@/lib/utils'
import { useImageLoader, useIntersectionObserver } from '@/hooks/use-performance'
import { SkeletonCard } from './loading'

interface OptimizedImageProps {
  src: string
  alt: string
  width?: number
  height?: number
  className?: string
  priority?: boolean
  placeholder?: 'blur' | 'empty'
  blurDataURL?: string
  sizes?: string
  quality?: number
  onLoad?: () => void
  onError?: () => void
  fallbackSrc?: string
}

export function OptimizedImage({
  src,
  alt,
  width,
  height,
  className,
  priority = false,
  placeholder = 'empty',
  blurDataURL,
  sizes,
  quality = 75,
  onLoad,
  onError,
  fallbackSrc,
  ...props
}: OptimizedImageProps) {
  const [imageSrc, setImageSrc] = useState(src)
  const [isLoading, setIsLoading] = useState(true)
  const [hasError, setHasError] = useState(false)
  const imgRef = useRef<HTMLImageElement>(null)
  const { isLoaded, hasError: loaderError } = useImageLoader(imageSrc)

  useEffect(() => {
    setImageSrc(src)
    setIsLoading(true)
    setHasError(false)
  }, [src])

  useEffect(() => {
    if (loaderError && fallbackSrc && imageSrc !== fallbackSrc) {
      setImageSrc(fallbackSrc)
    }
  }, [loaderError, fallbackSrc, imageSrc])

  const handleLoad = () => {
    setIsLoading(false)
    setHasError(false)
    onLoad?.()
  }

  const handleError = () => {
    setIsLoading(false)
    setHasError(true)
    onError?.()
  }

  if (hasError && fallbackSrc) {
    return (
      <OptimizedImage
        src={fallbackSrc}
        alt={alt}
        width={width}
        height={height}
        className={className}
        priority={priority}
        placeholder={placeholder}
        blurDataURL={blurDataURL}
        sizes={sizes}
        quality={quality}
        onLoad={onLoad}
        onError={onError}
        {...props}
      />
    )
  }

  return (
    <div className={cn("relative overflow-hidden", className)}>
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
          <SkeletonCard />
        </div>
      )}
      
      <Image
        ref={imgRef}
        src={imageSrc}
        alt={alt}
        width={width}
        height={height}
        className={cn(
          "transition-opacity duration-300",
          isLoading ? "opacity-0" : "opacity-100"
        )}
        priority={priority}
        placeholder={placeholder}
        blurDataURL={blurDataURL}
        sizes={sizes}
        quality={quality}
        onLoad={handleLoad}
        onError={handleError}
        {...props}
      />
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
  const [shouldLoad, setShouldLoad] = useState(false)
  const [ref, isIntersecting] = useIntersectionObserver({
    threshold,
    rootMargin: '50px',
  })

  useEffect(() => {
    if (isIntersecting && !shouldLoad) {
      setShouldLoad(true)
    }
  }, [isIntersecting, shouldLoad])

  if (!shouldLoad) {
    return (
      <div
        ref={ref}
        className={cn("bg-gray-200 animate-pulse", className)}
        style={{ width, height }}
      />
    )
  }

  return (
    <OptimizedImage
      src={src}
      alt={alt}
      width={width}
      height={height}
      className={className}
      {...props}
    />
  )
}

// Avatar component with fallback
export function OptimizedAvatar({
  src,
  alt,
  size = 40,
  className,
  fallback,
}: {
  src?: string
  alt: string
  size?: number
  className?: string
  fallback?: string
}) {
  const [imageSrc, setImageSrc] = useState(src)
  const [hasError, setHasError] = useState(false)

  useEffect(() => {
    setImageSrc(src)
    setHasError(false)
  }, [src])

  const handleError = () => {
    setHasError(true)
  }

  if (!imageSrc || hasError) {
    return (
      <div
        className={cn(
          "flex items-center justify-center bg-gray-200 rounded-full text-gray-600 font-medium",
          className
        )}
        style={{ width: size, height: size }}
      >
        {fallback || alt.charAt(0).toUpperCase()}
      </div>
    )
  }

  return (
    <OptimizedImage
      src={imageSrc}
      alt={alt}
      width={size}
      height={size}
      className={cn("rounded-full object-cover", className)}
      onError={handleError}
    />
  )
}

// Background image component
export function BackgroundImage({
  src,
  alt,
  className,
  children,
  ...props
}: {
  src: string
  alt: string
  className?: string
  children?: React.ReactNode
} & Omit<OptimizedImageProps, 'src' | 'alt'>) {
  return (
    <div className={cn("relative", className)}>
      <OptimizedImage
        src={src}
        alt={alt}
        className="absolute inset-0 object-cover w-full h-full"
        {...props}
      />
      <div className="relative z-10">{children}</div>
    </div>
  )
} 