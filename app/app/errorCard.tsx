export default function ErrorCard({
  className,
  children,
}: {
  className: undefined | string;
  children: React.ReactNode;
}) {
  return (
    <div className={`bg-red-500 text-white p-4 ${className || ""}`}>
      {children}
    </div>
  );
}
