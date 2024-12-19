"use client";
import { twMerge } from "tailwind-merge";
import { ChevronDown, ArrowUp, ArrowDown } from "../svg";
import { useState, useRef, useEffect } from "react";
import { SortDirection } from "./types";

interface SortOption<T> {
  key: T;
  label: string;
}

interface SortHeaderProps<T> {
  sortConfig: {
    key: T;
    direction: SortDirection;
  };
  options: SortOption<T>[];
  onSort: (key: T, direction?: SortDirection) => void;
}

function MobileSortableHeader<T extends string>({ 
  sortConfig, 
  options,
  onSort 
}: SortHeaderProps<T>) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleOptionClick = (key: T) => {
    // If clicking the current sort key, toggle direction
    if (key === sortConfig.key) {
      const newDirection = sortConfig.direction === SortDirection.ASC
        ? SortDirection.DESC
        : SortDirection.ASC;
      onSort(key, newDirection);
    } else {
      // New key, default to DESC
      onSort(key, SortDirection.DESC);
    }
    setIsOpen(false);
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 text-sm font-medium text-gray-700 hover:text-gray-900"
      >
        <span>Sort: {options.find(opt => opt.key === sortConfig.key)?.label}</span>
        <ChevronDown />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-32 rounded-lg gap-1 p-1 border-4 border-white bg-white shadow-lg">
          {options.map((option) => (
            <button
              key={option.key}
              onClick={() => handleOptionClick(option.key)}
              className={twMerge(
                "flex items-center justify-between w-full px-3 py-1 text-sm rounded-sm",
                option.key === sortConfig.key ? "bg-neutral-100" : ""
              )}
            >
              <span className={option.key === sortConfig.key ? "font-bold" : "font-medium"}>
                {option.label}
              </span>
              {option.key === sortConfig.key && (
                sortConfig.direction === SortDirection.ASC 
                  ? <ArrowUp className="w-5 h-5" /> 
                  : <ArrowDown className="w-5 h-5" />
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export default MobileSortableHeader;