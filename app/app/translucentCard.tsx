import { twMerge } from "tailwind-merge";

export default function TranslucentCard({
  className,
  children,
}: {
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <div className={twMerge("flex w-auto justify-between items-center flex-shrink-0 border-4 border-[#FFF] bg-[radial-gradient(152.17%_50%_at_50%_50%,rgba(255,255,255,0.20)_0%,rgba(255,255,255,0.80)_100%)]", className)}>
        {children}
    </div>
  );
}
