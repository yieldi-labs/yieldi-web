import { useEffect } from 'react';

/**
 * Hook to manage body overflow style based on a condition
 * @param shouldHide - Boolean indicating whether overflow should be hidden
 * @param property - Optional overflow property to set (default: 'overflow')
 * @param hideValue - Optional value to use when hiding overflow (default: 'hidden')
 * @param showValue - Optional value to use when showing overflow (default: 'auto')
 */
export function useBodyOverflow(
  shouldHide: boolean,
  property: 'overflow' | 'overflowY' | 'overflowX' = 'overflow',
  hideValue: string = 'hidden',
  showValue: string = 'auto'
) {
  useEffect(() => {
    const originalValue = document.body.style[property];
    document.body.style[property] = shouldHide ? hideValue : showValue;
    return () => {
      document.body.style[property] = originalValue;
    };
  }, [shouldHide, property, hideValue, showValue]);
}