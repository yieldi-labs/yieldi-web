"use client";
import React from "react";

interface ButtonProps {
  label: string;
  className?: string;
  onClick: () => void;
}

const Button = ({ label, className = "", onClick }: ButtonProps) => (
  <button
    onClick={onClick}
    className={`bg-primary hover:bg-primary/50 rounded-full px-9 py-3 font-semibold text-gray-900 transition duration-300 ease-in-out ${className}`}
  >
    {label}
  </button>
);

export default Button;
