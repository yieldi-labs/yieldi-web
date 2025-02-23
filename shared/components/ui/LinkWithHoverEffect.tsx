"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { scrollToElement } from "../../utils/scrollToElement";
import { twMerge } from "tailwind-merge";

interface LinkWithHoverEffectProps {
  links: { label: string; href: string }[];
  column?: boolean;
  toggleMenu?: () => void;
}

const LinkWithHoverEffect = ({
  links,
  column,
  toggleMenu,
}: LinkWithHoverEffectProps) => {
  const pathname = usePathname();

  return (
    <ul
      className={twMerge(
        "desktop:gap-20 flex items-center gap-14 font-medium uppercase",
        column && "flex-col",
      )}
    >
      {links.map(({ label, href }, index) => {
        const isActive = pathname === href || pathname === `${href}/` || pathname.startsWith(href);

        return (
          <li key={index} className="group relative cursor-pointer">
            {href.startsWith("#") ? (
              <a
                href={href}
                className="relative"
                onClick={(e) => {
                  scrollToElement(e);
                  toggleMenu && toggleMenu();
                }}
              >
                {label}
              </a>
            ) : (
              <Link href={href} className="relative">
                {label}
              </Link>
            )}
            {/* Background effect for hover and active states */}
            <div
              className={twMerge(
                "pointer-events-none absolute inset-0 h-full w-full transition-opacity duration-300 ease-in-out",
                isActive ? "opacity-100" : "opacity-0",
                "group-hover:opacity-100",
              )}
              style={{
                background: `radial-gradient(circle at center, rgba(98, 126, 234, 0.26) 35%, rgba(98, 126, 234, 0) 100%)`,
                borderRadius: "50%",
                transform: "scale(1.5)",
                filter: "blur(12px)",
                zIndex: 0,
              }}
            />
          </li>
        );
      })}
    </ul>
  );
};

export default LinkWithHoverEffect;
