import Link from "next/link";

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
  className = `py-2 px-2 font-semibold text-sm ${disabled ? "opacity-75 " : ""}${className || ""}`;
  if (href) {
    return (
      <Link title={title} href={href} className={className}>
        {children}
      </Link>
    );
  }
  return (
    <button
      title={title}
      onClick={onClick}
      disabled={disabled}
      className={`py-2 px-2 font-semibold text-sm ${disabled ? "opacity-75 " : ""}${className || ""}`}
    >
      {children}
    </button>
  );
}
