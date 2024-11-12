"use client";

import { useState, useEffect, useRef } from 'react';

const Slider = ({ value, max, onChange }: { value: number; max: number; onChange: (value: number) => void }) => {
  const [isDragging, setIsDragging] = useState(false);
  const sliderRef = useRef<HTMLDivElement | null>(null);

  const updateValue = (clientX: number) => {
    const slider = sliderRef.current;
    if (!slider) return;

    const rect = slider.getBoundingClientRect();
    const position = clientX - rect.left;
    const width = rect.width;
    let percentage = (position / width) * 100;
    percentage = Math.max(0, Math.min(100, percentage));
    
    const newValue = (percentage / 100) * max;
    onChange(Number(newValue.toFixed(4)));
  };

  const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    setIsDragging(true);
    updateValue(e.clientX);
  };

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (isDragging) {
        updateValue(e.clientX);
      }
    };

    const handleMouseUp = () => {
      setIsDragging(false);
    };

    if (isDragging) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
    }

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging, max, onChange]);

  const percentage = (value / max) * 100;

  return (
    <div 
      ref={sliderRef}
      className="relative h-2 w-full rounded-full cursor-pointer"
      style={{ backgroundColor: '#CED2D3' }}
      onMouseDown={handleMouseDown}
    >
      <div 
        className="absolute h-full rounded-full"
        style={{ 
          backgroundColor: '#627EEA',
          width: `${percentage}%`
        }}
      />
      <div 
        className="absolute w-5 h-5 rounded-full top-1/2 -mt-2.5 -ml-2.5"
        style={{ 
          backgroundColor: '#627EEA',
          left: `${percentage}%`,
          cursor: isDragging ? 'grabbing' : 'grab'
        }}
      />
    </div>
  );
};

export default Slider;