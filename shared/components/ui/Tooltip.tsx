const Tooltip = ({
  children,
  text,
}: {
  children: React.ReactNode;
  text: string;
}) => (
  <div className="group relative inline-block">
    {children}
    <span className="invisible absolute bottom-full left-1/2 mb-2 -translate-x-1/2 rounded bg-gray-800 px-2 py-1 text-sm text-white opacity-0 transition-all group-hover:visible group-hover:opacity-100">
      {text}
    </span>
  </div>
);

export default Tooltip;
