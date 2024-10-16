"use client";
export const scrollToElement = (
  event: React.MouseEvent<HTMLAnchorElement, MouseEvent>,
) => {
  const target = event.currentTarget as HTMLAnchorElement;

  if (target.href.includes("#")) {
    event.preventDefault();
    const elementId = target.getAttribute("href")?.slice(1);
    const element = document.getElementById(elementId!);

    if (element) {
      element.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }
  }
};
