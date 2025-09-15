import { useCallback, useRef, useEffect, useState } from 'react'

// Hook for debouncing values
export function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value)

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value)
    }, delay)

    return () => {
      clearTimeout(handler)
    }
  }, [value, delay])

  return debouncedValue
}

// Hook for throttling function calls
export function useThrottle<T extends (...args: any[]) => any>(
  callback: T,
  delay: number
): T {
  const lastCall = useRef(0)
  const lastCallTimer = useRef<NodeJS.Timeout | null>(null)

  return useCallback(
    (...args: Parameters<T>) => {
      const now = Date.now()

      if (now - lastCall.current >= delay) {
        lastCall.current = now
        callback(...args)
      } else {
        if (lastCallTimer.current) {
          clearTimeout(lastCallTimer.current)
        }
        lastCallTimer.current = setTimeout(() => {
          lastCall.current = Date.now()
          callback(...args)
        }, delay - (now - lastCall.current))
      }
    },
    [callback, delay]
  ) as T
}

// Hook for intersection observer (lazy loading)
export function useIntersectionObserver(
  options: IntersectionObserverInit = {}
) {
  const [isIntersecting, setIsIntersecting] = useState(false)
  const [ref, setRef] = useState<Element | null>(null)

  useEffect(() => {
    if (!ref) return

    const observer = new IntersectionObserver(([entry]) => {
      setIsIntersecting(entry.isIntersecting)
    }, options)

    observer.observe(ref)

    return () => {
      observer.disconnect()
    }
  }, [ref, options])

  return [setRef, isIntersecting] as const
}

// Hook for performance monitoring
export function usePerformanceMonitor(componentName: string) {
  const renderCount = useRef(0)
  const startTime = useRef(performance.now())

  useEffect(() => {
    renderCount.current += 1
    const endTime = performance.now()
    const renderTime = endTime - startTime.current

    if (process.env.NODE_ENV === 'development') {
      console.log(`${componentName} rendered ${renderCount.current} times in ${renderTime.toFixed(2)}ms`)
    }

    startTime.current = performance.now()
  })

  return {
    renderCount: renderCount.current,
    resetRenderCount: () => {
      renderCount.current = 0
    }
  }
}

// Hook for memory optimization
export function useMemoryOptimization() {
  const [isLowMemory, setIsLowMemory] = useState(false)

  useEffect(() => {
    if ('memory' in performance) {
      const checkMemory = () => {
        const memory = (performance as any).memory
        const usedMemory = memory.usedJSHeapSize
        const totalMemory = memory.totalJSHeapSize
        const memoryUsage = (usedMemory / totalMemory) * 100

        setIsLowMemory(memoryUsage > 80)
      }

      const interval = setInterval(checkMemory, 5000)
      return () => clearInterval(interval)
    }
  }, [])

  return { isLowMemory }
}

// Hook for network status
export function useNetworkStatus() {
  const [isOnline, setIsOnline] = useState(true)
  const [connectionType, setConnectionType] = useState<string>('')

  useEffect(() => {
    const updateNetworkStatus = () => {
      setIsOnline(navigator.onLine)
      
      if ('connection' in navigator) {
        const connection = (navigator as any).connection
        setConnectionType(connection?.effectiveType || 'unknown')
      }
    }

    window.addEventListener('online', updateNetworkStatus)
    window.addEventListener('offline', updateNetworkStatus)
    
    updateNetworkStatus()

    return () => {
      window.removeEventListener('online', updateNetworkStatus)
      window.removeEventListener('offline', updateNetworkStatus)
    }
  }, [])

  return { isOnline, connectionType }
}

// Hook for scroll performance
export function useScrollPerformance() {
  const [scrollY, setScrollY] = useState(0)
  const [isScrolling, setIsScrolling] = useState(false)
  const scrollTimeout = useRef<NodeJS.Timeout | null>(null)

  useEffect(() => {
    const handleScroll = () => {
      setScrollY(window.scrollY)
      setIsScrolling(true)

      if (scrollTimeout.current) {
        clearTimeout(scrollTimeout.current)
      }

      scrollTimeout.current = setTimeout(() => {
        setIsScrolling(false)
      }, 150)
    }

    window.addEventListener('scroll', handleScroll, { passive: true })
    
    return () => {
      window.removeEventListener('scroll', handleScroll)
      if (scrollTimeout.current) {
        clearTimeout(scrollTimeout.current)
      }
    }
  }, [])

  return { scrollY, isScrolling }
}

// Hook for image loading optimization
export function useImageLoader(src: string) {
  const [isLoaded, setIsLoaded] = useState(false)
  const [hasError, setHasError] = useState(false)

  useEffect(() => {
    if (!src) return

    const img = new Image()
    
    img.onload = () => {
      setIsLoaded(true)
      setHasError(false)
    }
    
    img.onerror = () => {
      setHasError(true)
      setIsLoaded(false)
    }
    
    img.src = src

    return () => {
      img.onload = null
      img.onerror = null
    }
  }, [src])

  return { isLoaded, hasError }
} 