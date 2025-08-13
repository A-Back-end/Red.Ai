import { useState, useEffect } from 'react';

interface CursorPosition {
  x: number;
  y: number;
}

/**
 * Custom hook to track mouse cursor position safely
 * 
 * Features:
 * - SSR safe (no errors during server-side rendering)
 * - Proper cleanup on unmount
 * - Initializes with { x: 0, y: 0 }
 * - Handles window object safely
 * - Prevents memory leaks
 * 
 * @returns {CursorPosition} Object with x and y coordinates
 * 
 * @example
 * const cursor = useCursor();
 * return <div>Mouse position: {cursor.x}, {cursor.y}</div>;
 */
export const useCursor = (): CursorPosition => {
  // Initialize with safe defaults
  const [cursor, setCursor] = useState<CursorPosition>({ x: 0, y: 0 });

  useEffect(() => {
    // Check if we're in a browser environment
    if (typeof window === 'undefined') {
      return;
    }

    // Mouse move handler
    const handleMouseMove = (event: MouseEvent) => {
      setCursor({
        x: event.clientX,
        y: event.clientY,
      });
    };

    // Add event listener with error handling
    try {
      window.addEventListener('mousemove', handleMouseMove, { passive: true });
    } catch (error) {
      console.warn('Failed to add mousemove listener:', error);
      return;
    }

    // Cleanup function
    return () => {
      try {
        window.removeEventListener('mousemove', handleMouseMove);
      } catch (error) {
        console.warn('Failed to remove mousemove listener:', error);
      }
    };
  }, []); // Empty dependency array - only run once on mount

  return cursor;
};

export default useCursor; 