import { twMerge } from "tailwind-merge";

interface ToggleButtonGroupProps<T> {
  options: { label: string; value: T }[];
  selectedValue: T;
  onChange: (value: T) => void;
}

export default function ToggleButtonGroup<T>({
  options,
  selectedValue,
  onChange,
}: ToggleButtonGroupProps<T>) {
  return (
    <div className="flex gap-4 mb-4">
      <div className="flex justify-between items-center flex-1 rounded-3xl border-2 border-neutral-50">
        {options.map((option) => (
          <button
            key={option.label}
            className={twMerge(
              "flex justify-center items-center gap-2 flex-1 py-2 rounded-3xl text-lg",
              selectedValue === option.value
                ? "bg-neutral-50 text-neutral-800 shadow-toggle"
                : "bg-transparent text-neutral-800 border border-transparent shadow-none",
            )}
            onClick={() => onChange(option.value)}
          >
            {option.label}
          </button>
        ))}
      </div>
    </div>
  );
}
