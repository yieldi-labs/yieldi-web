import { DownArrow } from "@shared/components/svg";
import { useState, useRef, useEffect } from "react";
import { twMerge } from "tailwind-merge";

interface Column {
  key: string;
  label: string;
}

export enum SortKey {
  TVL = "tvl",
  APR = "apr",
}

enum SortDirection {
  ASC = "asc",
  DESC = "desc",
}

interface SortConfig {
  key: SortKey;
  direction: SortDirection;
}

interface SortHeaderProps {
  columns: Column[];
  sortConfig: SortConfig;
  onSort: (key: SortKey) => void;
}

const SortHeader: React.FC<SortHeaderProps> = ({
  columns,
  sortConfig,
  onSort,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const sortableColumns = columns;

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const getOptionClasses = (columnKey: string) => {
    return twMerge(
      "w-full text-left px-4 py-2 text-sm hover:bg-gray-50 whitespace-nowrap text-neutral-700",
      sortConfig.key === columnKey && "text-neutral-900 font-medium",
    );
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center text-sm font-medium text-neutral-800 hover:text-neutral-900"
      >
        Sort
        <DownArrow className="w-4 h-4 inline-block ml-1" />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-1 py-1 bg-white rounded-lg shadow-lg border z-10">
          {sortableColumns.map((col) => (
            <button
              key={col.key}
              onClick={() => {
                onSort(col.key as SortKey);
                setIsOpen(false);
              }}
              className={getOptionClasses(col.key)}
            >
              {col.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default SortHeader;
