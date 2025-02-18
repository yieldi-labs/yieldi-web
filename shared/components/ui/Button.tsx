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
  type?: 'primary' | 'secondary';
}

const Button = ({ children, className = "", onClick, link, disabled = false, type = 'primary' }: ButtonProps) => {
  const baseClass = twMerge(
    `rounded-full px-9 py-3 font-semibold text-gray-900 transition duration-300 ease-in-out whitespace-nowrap disabled:cursor-not-allowed`,
    className,
    type === 'primary' && `bg-primary hover:bg-primary/50 disabled:bg-primary/50`,
    type === 'secondary' && `shadow-md bg-neutral-100 hover:bg-neutral-200 disabled:bg-neutral-300 disabled:opacity-60`
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
