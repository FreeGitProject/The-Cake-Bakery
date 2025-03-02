// Place this file at /hooks/use-media-query.ts
import { useState, useEffect } from 'react';

export function useMediaQuery(query: string): boolean {
  // Initialize with null for SSR (won't throw hydration errors)
  const [matches, setMatches] = useState<boolean>(false);
  
  useEffect(() => {
    // Browser environment check
    if (typeof window !== 'undefined') {
      const media = window.matchMedia(query);
      
      // Set initial value
      setMatches(media.matches);
      
      // Setup listener for changes
      const listener = (event: MediaQueryListEvent) => {
        setMatches(event.matches);
      };
      
      // Modern browsers
      media.addEventListener('change', listener);
      
      // Cleanup
      return () => {
        media.removeEventListener('change', listener);
      };
    }
  }, [query]);
  
  return matches;
}