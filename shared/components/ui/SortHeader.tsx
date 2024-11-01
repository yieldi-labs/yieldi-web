"use client";

import { twMerge } from "tailwind-merge";
import { ChevronDown, ArrowUp, ArrowDown } from "../svg";
import { useState, useRef, useEffect } from "react";

export enum SortKey {
  TVL = "tvl",
  APR = "apr",
}

enum SortDirection {
  ASC = "asc",
  DESC = "desc",
}

interface SortHeaderProps {
  sortConfig: {
    key: SortKey;
    direction: SortDirection;
  };
  onSort: (key: SortKey, direction: SortDirection) => void;
}

const SortHeader: React.FC<SortHeaderProps> = ({ sortConfig, onSort }) => {
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

  const handleOptionClick = (key: SortKey) => {
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

  const options = [
    { key: SortKey.TVL, label: "TVL" },
    { key: SortKey.APR, label: "APR" }
  ];

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center text-sm font-medium text-gray-700 hover:text-gray-900"
      >
        Sort: {options.find(opt => opt.key === sortConfig.key)?.label}
        <ChevronDown />
      </button>

      {isOpen && (
        <div className="absolute right-0 z-10 mt-2 w-32 rounded-xl gap-1 p-1 border-4 border-white bg-white shadow-lg">
          {options.map((option) => (
            <button
              key={option.key}
              onClick={() => handleOptionClick(option.key)}
              className={twMerge("flex items-center justify-between w-full px-3 py-1 text-sm rounded-xl", option.key === sortConfig.key ? "bg-neutral-100" : "")}
            >
              <span className={option.key === sortConfig.key ? "font-bold" : "font-medium"}>
                {option.label}
              </span>
              {option.key === sortConfig.key && (
                sortConfig.direction === SortDirection.ASC ? <ArrowUp className="w-5 h-5"/> : <ArrowDown className="w-5 h-5"/>
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default SortHeader;