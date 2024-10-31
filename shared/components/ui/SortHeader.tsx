"use client";

import { useState, useRef, useEffect } from "react";
import { twMerge } from "tailwind-merge";
import DownArrow from "../svg/DownArrow";
import UpArrow from "../svg/UpArrow";

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
  onSort: (key: SortKey, direction: SortDirection) => void;
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

  const optionClassName = "flex items-center self-stretch px-1.5 py-1 rounded-md hover:bg-neutral-100 text-neutral text-right font-gt-america text-xs font-medium leading-4";
  const getOptionClassName = (key: string, direction: SortDirection) => {
    const isActive = sortConfig.key === key;
    return twMerge(
      optionClassName,
      isActive && direction === sortConfig.direction ? "bg-neutral-100" : "hover:bg-neutral-100"
    );
  }

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center text-sm text-neutral-800 hover:text-neutral-900"
      >
        Sort: {columns.find((col) => col.key === sortConfig.key)?.label}{" "}
      </button>

      {isOpen && (
        <div className="absolute right-0 z-10 flex flex-col items-start p-2 gap-1.5 rounded-xl border-4 border-white bg-white shadow-dropdown min-w-28">
          {sortableColumns.map((col) => (
            <>
            
            <button
              key={col.key}
              onClick={() => {
                onSort(col.key as SortKey, SortDirection.DESC);
                setIsOpen(false);
              }}
              className={getOptionClassName(col.key, SortDirection.DESC)}
            >
              {col.label} <DownArrow className="inline-block mb-1"/>
            </button>
            <button
              key={col.key}
              onClick={() => {
                onSort(col.key as SortKey, SortDirection.ASC);
                setIsOpen(false);
              }}
              className={getOptionClassName(col.key, SortDirection.ASC)}
            >
              {col.label} <UpArrow className="inline-block"/>
            </button>
            </>
          ))}
        </div>
      )}
    </div>
  );
};

export default SortHeader;
