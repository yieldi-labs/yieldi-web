export default function Button({
  className,
  title,
  disabled,
  onClick,
  children,
}: {
  className?: string;
  title?: string;
  disabled?: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  if (!className || !className.includes("bg-")) {
    className = (className || "") + " bg-primary";
  }
  return (
    <button
      title={title}
      onClick={onClick}
      disabled={disabled}
      className={`py-2 px-2 font-semibold text-sm border ${disabled ? "opacity-75 " : ""}${className || ""}`}
    >
      {children}
    </button>
  );
}
