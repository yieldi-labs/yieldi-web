"use client";

import { useState, useRef, useEffect } from "react";
import { twMerge } from "tailwind-merge";
import DownArrow from "../svg/DownArrow";

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
      "flex items-center gap-3 self-stretch px-1.5 py-1 rounded-md hover:bg-neutral-100 text-neutral-700 text-right font-gt-america text-xs font-medium leading-4",
      sortConfig.key === columnKey && "text-neutral-900 font-medium",
    );
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center text-sm text-neutral-800 hover:text-neutral-900"
      >
        Sort by {columns.find((col) => col.key === sortConfig.key)?.label}{" "}
        {sortConfig.direction === SortDirection.ASC
          ? "ascending"
          : "descending"}
        <DownArrow className="w-4 h-4 inline-block ml-1" />
      </button>

      {isOpen && (
        <div className="absolute right-0 z-10 flex flex-col items-start p-2 gap-1.5 rounded-xl border-4 border-white bg-white shadow-dropdown min-w-28">
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
