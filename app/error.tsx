"use client";

export default function Error({
  children,
  className,
}: {
  children: React.ReactNode;
  className: string;
}) {
  return (
    <div className={`bg-red-500 text-white p-4 ${className || ""}`}>
      {children}
    </div>
  );
}
