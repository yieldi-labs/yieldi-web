import { useEffect, useRef, useState } from 'react';

interface UseMeasureHeightProps {
  isMobile: boolean;
  marginBottom?: number;
}

export const useMeasureHeight = ({ isMobile, marginBottom = 0 }: UseMeasureHeightProps) => {
  const [height, setHeight] = useState(0);
  const measureRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isMobile && measureRef.current) {
      const measuredHeight = measureRef.current.offsetHeight;
      setHeight(measuredHeight + marginBottom);
      measureRef.current.style.display = 'none';
    }
  }, [isMobile, marginBottom]);

  return { height, measureRef };
};