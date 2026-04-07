'use client';

import { useState, useEffect, useRef, useCallback } from 'react';

interface ScrollAnimationState {
  scrollY: number;
  scrollProgress: number;
  direction: 'up' | 'down';
  velocity: number;
  isScrolling: boolean;
}

export function useScrollAnimation() {
  const [state, setState] = useState<ScrollAnimationState>({
    scrollY: 0,
    scrollProgress: 0,
    direction: 'down',
    velocity: 0,
    isScrolling: false
  });

  const lastScrollYRef = useRef(0);
  const scrollTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const rafIdRef = useRef<number | null>(null);

  const updateScrollState = useCallback(() => {
    const currentScrollY = window.scrollY;
    const scrollHeight = document.documentElement.scrollHeight - window.innerHeight;
    const progress = Math.min(currentScrollY / scrollHeight, 1);
    const direction = currentScrollY > lastScrollYRef.current ? 'down' : 'up';
    const velocity = Math.abs(currentScrollY - lastScrollYRef.current);

    setState(prevState => {
      // Only update if values actually changed to prevent unnecessary re-renders
      if (
        prevState.scrollY !== currentScrollY ||
        prevState.scrollProgress !== progress ||
        prevState.direction !== direction ||
        Math.abs(prevState.velocity - velocity) > 0.1 ||
        prevState.isScrolling !== true
      ) {
        return {
          scrollY: currentScrollY,
          scrollProgress: progress,
          direction,
          velocity,
          isScrolling: true
        };
      }
      return prevState;
    });

    lastScrollYRef.current = currentScrollY;

    // Clear existing timeout
    if (scrollTimeoutRef.current) {
      clearTimeout(scrollTimeoutRef.current);
    }

    // Set new timeout to detect when scrolling stops
    scrollTimeoutRef.current = setTimeout(() => {
      setState(prev => ({ ...prev, isScrolling: false, velocity: 0 }));
    }, 150);
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      // Cancel any pending RAF
      if (rafIdRef.current) {
        cancelAnimationFrame(rafIdRef.current);
      }

      // Use RAF for smooth performance
      rafIdRef.current = requestAnimationFrame(updateScrollState);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    
    // Initial call
    updateScrollState();

    return () => {
      window.removeEventListener('scroll', handleScroll);
      if (rafIdRef.current) {
        cancelAnimationFrame(rafIdRef.current);
      }
      if (scrollTimeoutRef.current) {
        clearTimeout(scrollTimeoutRef.current);
      }
    };
  }, [updateScrollState]);

  return state;
}
