export default function Input({
  label,
  placeholder,
  value,
  onChange,
  className,
  right,
}: {
  label?: string;
  placeholder: string;
  value: string;
  onChange: (v: string) => void;
  className?: string;
  right?: React.ReactNode;
}) {
  return (
    <div className={`py-2 px-4 bg-white rounded-xl rounded-sm ${className || ""}`}>
      <div className="flex">
        <label className="uppercase text-xs opacity-75 leading-none flex-1">
          {label}
        </label>
        {right}
      </div>
      <input
        className="bg-transparent px-0 leading-relaxed text-xl outline-none w-full rounded-xl"
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
    </div>
  );
}
