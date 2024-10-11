export default function Card({
  className,
  children,
}: {
  className: undefined | string;
  children: React.ReactNode;
}) {
  return (
    <div className={`${className || ""} bg-white border p-4`}>{children}</div>
  );
}
