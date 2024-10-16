"use client";

export const createScrollHandler = (
  setIsSticky: (isSticky: boolean) => void,
  threshold: number = 0,
) => {
  let lastScrollY = window.scrollY;
  let ticking = false;

  const handleScroll = () => {
    if (!ticking) {
      window.requestAnimationFrame(() => {
        if (lastScrollY > threshold) {
          setIsSticky(true);
        } else {
          setIsSticky(false);
        }
        ticking = false;
      });
      ticking = true;
    }
    lastScrollY = window.scrollY;
  };

  return handleScroll;
};
