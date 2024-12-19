import React from "react";

interface LoaderProps {
  sizeInPixels?: number;
  color?: "primary" | "blue";
}

const Loader: React.FC<LoaderProps> = ({
  sizeInPixels = 16,
  color = "primary",
}) => {
  const borderClass = color === "primary" ? "border-primary" : "border-blue";
  return (
    <div
      className={`animate-spin rounded-full h-${sizeInPixels} w-${sizeInPixels} border-b-2 ${borderClass}`}
    ></div>
  );
};

export default Loader;
