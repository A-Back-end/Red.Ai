import React from 'react';
import { useCursor } from '@/utils/useCursor';

interface CursorTrackerProps {
  className?: string;
  showLabel?: boolean;
}

/**
 * Example component demonstrating the useCursor hook
 * 
 * @param className - Optional CSS classes
 * @param showLabel - Whether to show the "Mouse Position:" label
 * 
 * @example
 * <CursorTracker showLabel />
 * <CursorTracker className="text-sm text-gray-500" />
 */
export const CursorTracker: React.FC<CursorTrackerProps> = ({ 
  className = '', 
  showLabel = false 
}) => {
  const cursor = useCursor();

  return (
    <div className={`font-mono ${className}`}>
      {showLabel && <span>Mouse Position: </span>}
      <span className="text-blue-600">
        {cursor.x}, {cursor.y}
      </span>
    </div>
  );
};

export default CursorTracker; 