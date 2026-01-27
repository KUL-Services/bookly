'use client'

import { useEffect, useRef, useState } from 'react'

interface ScrollRevealProps {
  children: React.ReactNode
  className?: string
  animation?: 'fade-up' | 'fade-in' | 'slide-in-right' | 'slide-in-left'
  delay?: number
  duration?: number
}

export function ScrollReveal({
  children,
  className = '',
  animation = 'fade-up',
  delay = 0,
  duration = 700
}: ScrollRevealProps) {
  const [isVisible, setIsVisible] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true)
          observer.unobserve(entry.target)
        }
      },
      {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
      }
    )

    if (ref.current) {
      observer.observe(ref.current)
    }

    return () => {
      if (ref.current) {
        observer.unobserve(ref.current)
      }
    }
  }, [])

  const getAnimationClass = () => {
    switch (animation) {
      case 'fade-up':
        return 'animate-in fade-in slide-in-from-bottom-8'
      case 'fade-in':
        return 'animate-in fade-in'
      case 'slide-in-right':
        return 'animate-in fade-in slide-in-from-right-8'
      case 'slide-in-left':
        return 'animate-in fade-in slide-in-from-left-8'
      default:
        return 'animate-in fade-in slide-in-from-bottom-8'
    }
  }

  return (
    <div
      ref={ref}
      className={`${className} transition-opacity duration-${duration} ${
        isVisible ? `${getAnimationClass()} opacity-100` : 'opacity-0'
      }`}
      style={{
        animationDelay: `${delay}ms`,
        animationFillMode: 'both',
        willChange: 'opacity, transform' // Hardware acceleration hint
      }}
    >
      {children}
    </div>
  )
}
