export default function Title({ children }: { children: React.ReactNode }) {
  return (
    <h1 className="text-2xl tracking-wider font-bold uppercase">{children}</h1>
  );
}
