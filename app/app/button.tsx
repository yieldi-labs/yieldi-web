import Link from "next/link";
import { twMerge } from "tailwind-merge";

export default function Button({
  className,
  title,
  disabled,
  href,
  onClick,
  children,
}: {
  className?: string;
  title?: string;
  disabled?: boolean;
  href?: string;
  onClick?: () => void;
  children: React.ReactNode;
}) {
  if (!className || !className.includes("bg-")) {
    className = (className || "") + " bg-primary";
  }

  const linkClassName = twMerge(
    "py-2 px-2 font-semibold text-sm border",
    disabled ? "opacity-75" : "",
    className,
  );

  const buttonClassName = twMerge(
    "py-2 px-2 font-semibold text-sm border",
    disabled ? "opacity-75" : "",
  );

  if (href) {
    return (
      <Link title={title} href={href} className={linkClassName}>
        {children}
      </Link>
    );
  }

  return (
    <button
      title={title}
      onClick={onClick}
      disabled={disabled}
      className={buttonClassName}
    >
      {children}
    </button>
  );
}
