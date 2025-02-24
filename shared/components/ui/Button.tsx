"use client";
import Link from "next/link";
import React from "react";
import { twMerge } from "tailwind-merge";

interface ButtonProps {
  className?: string;
  onClick?: () => void;
  link?: string;
  disabled?: boolean
  children: React.ReactNode;
  size?: 'sm' | 'md' | 'lg';
  type?: 'primary' | 'secondary' | 'primary-action' | 'secondary-action' | 'neutral-action' | 'danger';
}

const Button = ({ children, className = "", onClick, link, disabled = false, type = 'primary', size = 'lg' }: ButtonProps) => {
  const baseClass = twMerge(
    `rounded-full px-9 py-3 font-semibold text-gray-900 transition duration-300 ease-in-out whitespace-nowrap disabled:cursor-not-allowed`,
    className,
    size === 'sm' && 'px-6 py-1 text-sm',
    size === 'md' && 'px-6 py-2',
    size === 'lg' && 'px-9 py-3',
    type === 'primary' && `bg-primary hover:bg-primary/50 disabled:bg-primary/50`,
    type === 'secondary' && `shadow-md bg-neutral-100 hover:bg-neutral-200 disabled:bg-neutral-300 disabled:opacity-60`,
    type === 'danger' && `text-white shadow-md bg-red hover:bg-red-light disabled:bg-red/50 disabled:opacity-60`,
    type === 'primary-action' && 'text-white bg-blue hover:bg-blue/50 disabled:bg-neutral-900 disabled:opacity-50',
    type === 'secondary-action' && 'border-red border-2 text-red hover:text-opacity-50 hover:border-opacity-50 transition-all disabled:border-neutral-900 disabled:text-neutral-900 disabled:opacity-50',
    type === 'neutral-action' && 'font-medium transition-colors bg-white text-blue'  
  );

  return link ? (
    <Link
      href={link}
      className={baseClass}
      rel="noopener noreferrer"
      target="_blank"
    >
      {children}
    </Link>
  ) : (
    <button disabled={disabled} onClick={onClick} className={baseClass}>
      {children}
    </button>
  );
};

export default Button;
