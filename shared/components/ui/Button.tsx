"use client";
import Link from "next/link";
import React from "react";
import { twMerge } from "tailwind-merge";

interface ButtonProps {
  label?: string;
  className?: string;
  onClick?: () => void;
  link?: string;
}

const Button = ({ label, className = "", onClick, link }: ButtonProps) => {
  const baseClass = twMerge(
    `bg-primary hover:bg-primary/50 rounded-full px-9 py-3 font-semibold text-gray-900 transition duration-300 ease-in-out`,
    className,
  );

  return link ? (
    <Link
      href={link}
      className={baseClass}
      rel="noopener noreferrer"
      target="_blank"
    >
      {label}
    </Link>
  ) : (
    <button onClick={onClick} className={baseClass}>
      {label}
    </button>
  );
};

export default Button;
