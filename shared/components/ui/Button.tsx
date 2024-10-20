"use client";
import React from "react";

interface ButtonProps {
  label?: string;
  className?: string;
  onClick?: () => void;
  link?: string;
}

const Button = ({ label, className = "", onClick, link }: ButtonProps) => {
  const baseClass = `bg-primary hover:bg-primary/50 rounded-full px-9 py-3 font-semibold text-gray-900 transition duration-300 ease-in-out ${className}`;

  return link ? (
    <a href={link} className={baseClass} rel="noopener noreferrer">
      {label}
    </a>
  ) : (
    <button onClick={onClick} className={baseClass}>
      {label}
    </button>
  );
};

export default Button;
