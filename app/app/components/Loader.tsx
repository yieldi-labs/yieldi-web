import React from "react";

interface LoaderProps {
  sizeInPixels?: number;
}

const Loader: React.FC<LoaderProps> = ({ sizeInPixels = 16 }) => {
  return (
    <div
      className={`animate-spin rounded-full h-${sizeInPixels} w-${sizeInPixels} border-b-4 border-primary`}
    ></div>
  );
};

export default Loader;
