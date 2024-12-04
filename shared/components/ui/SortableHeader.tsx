import React from 'react';
import { ArrowUp, ArrowDown } from "../svg";
import { SortDirection } from './types';

interface SortableHeaderProps<T extends string> {
  label: string;
  sortKey: T;
  currentSortKey: T;
  sortDirection: SortDirection;
  onSort: (key: T) => void;
}

function SortableHeader<T extends string>({
  label,
  sortKey,
  currentSortKey,
  sortDirection,
  onSort,
}: SortableHeaderProps<T>) {
  const isActive = currentSortKey === sortKey;

  return (
    <div
      className="md:px-3 py-3 flex items-center cursor-pointer group min-w-0"
      onClick={() => onSort(sortKey)}
    >
      <div className="flex items-center min-w-0 justify-between">
        <div className="truncate md:mr-2">
          <span className={`${isActive ? "font-bold" : "font-normal"}`}>
            {label}
          </span>
        </div>
        <div className="hidden md:flex flex-shrink-0 w-4 items-center justify-center">
          {isActive ? (
            sortDirection === SortDirection.ASC ? (
              <ArrowUp className="w-4 h-4" />
            ) : (
              <ArrowDown className="w-4 h-4" />
            )
          ) : (
            <div className="opacity-0 group-hover:opacity-100">
              <ArrowDown className="w-4 h-4" />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default SortableHeader;