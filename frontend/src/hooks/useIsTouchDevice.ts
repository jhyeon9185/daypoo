import { useState, useEffect } from 'react';

export function useIsTouchDevice() {
  const [isTouch, setIsTouch] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const mediaQuery = window.matchMedia("(hover: none)");
      setIsTouch(mediaQuery.matches);

      const handler = (e: MediaQueryListEvent | MediaQueryList) => {
        if ('matches' in e) setIsTouch(e.matches);
      };

      if (mediaQuery.addEventListener) {
        mediaQuery.addEventListener('change', handler as EventListener);
      } else {
        mediaQuery.addListener(handler);
      }

      return () => {
        if (mediaQuery.removeEventListener) {
          mediaQuery.removeEventListener('change', handler as EventListener);
        } else {
          mediaQuery.removeListener(handler);
        }
      };
    }
  }, []);

  return isTouch;
}
