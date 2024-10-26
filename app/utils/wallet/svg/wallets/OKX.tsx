"use client";
import * as React from "react";
import { SVGProps } from "react";

const defaultWidth = 160;
const defaultHeight = 60;

interface OKXProps extends SVGProps<SVGSVGElement> {
  className?: string;
}

const OKX = ({ className = "", ...props }: OKXProps) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox={`0 0 ${defaultWidth} ${defaultHeight}`}
    fill="none"
    className={className}
    {...props}
  >
    <g
      style={{
        fill: "#000",
      }}
    >
      <path
        d="M115.822 0H2.942C2.247 0 1.58.297 1.087.826A2.93 2.93 0 0 0 .318 2.82v121.259c0 .748.276 1.466.768 1.995.493.528 1.16.825 1.857.825h112.879a2.54 2.54 0 0 0 1.857-.825 2.934 2.934 0 0 0 .769-1.995V2.82c0-.748-.277-1.465-.769-1.994A2.538 2.538 0 0 0 115.822 0ZM79.071 81.78a2.93 2.93 0 0 1-.769 1.994 2.537 2.537 0 0 1-1.856.826H42.319a2.537 2.537 0 0 1-1.856-.826 2.93 2.93 0 0 1-.769-1.994V45.12c0-.748.277-1.465.77-1.994a2.536 2.536 0 0 1 1.855-.826h34.127c.696 0 1.364.297 1.856.826a2.93 2.93 0 0 1 .769 1.994zM352.131 42.305h-34.127c-1.449 0-2.625 1.262-2.625 2.82v36.66c0 1.557 1.176 2.82 2.625 2.82h34.127c1.45 0 2.625-1.263 2.625-2.82v-36.66c0-1.558-1.175-2.82-2.625-2.82zM312.763.002h-34.126c-1.45 0-2.625 1.263-2.625 2.82v36.66c0 1.557 1.175 2.82 2.625 2.82h34.126c1.45 0 2.626-1.263 2.626-2.82V2.822c0-1.557-1.176-2.82-2.626-2.82zM391.529.002h-34.127c-1.449 0-2.625 1.263-2.625 2.82v36.66c0 1.557 1.176 2.82 2.625 2.82h34.127c1.45 0 2.625-1.263 2.625-2.82V2.822c0-1.557-1.175-2.82-2.625-2.82zM312.763 84.604h-34.126c-1.45 0-2.625 1.262-2.625 2.82v36.66c0 1.557 1.175 2.82 2.625 2.82h34.126c1.45 0 2.626-1.263 2.626-2.82v-36.66c0-1.558-1.176-2.82-2.626-2.82zM391.529 84.604h-34.127c-1.449 0-2.625 1.262-2.625 2.82v36.66c0 1.557 1.176 2.82 2.625 2.82h34.127c1.45 0 2.625-1.263 2.625-2.82v-36.66c0-1.558-1.175-2.82-2.625-2.82zM253.651.002h-34.126c-1.45 0-2.626 1.263-2.626 2.82v36.66c0 1.557 1.176 2.82 2.626 2.82h34.126c1.45 0 2.625-1.263 2.625-2.82V2.822c0-1.557-1.175-2.82-2.625-2.82zM253.651 84.604h-34.126c-1.45 0-2.626 1.262-2.626 2.82v36.66c0 1.557 1.176 2.82 2.626 2.82h34.126c1.45 0 2.625-1.263 2.625-2.82v-36.66c0-1.558-1.175-2.82-2.625-2.82zM216.888 45.088c0-.748-.277-1.465-.769-1.994a2.536 2.536 0 0 0-1.856-.826h-36.752V2.82c0-.748-.277-1.465-.769-1.994A2.536 2.536 0 0 0 174.886 0H140.76c-.697 0-1.364.297-1.857.826a2.931 2.931 0 0 0-.769 1.994v121.196c0 .748.277 1.465.769 1.994.493.529 1.16.826 1.857.826h34.126c.696 0 1.364-.297 1.856-.826a2.931 2.931 0 0 0 .769-1.994V84.568h36.752c.696 0 1.364-.297 1.856-.826a2.932 2.932 0 0 0 .769-1.994z"
        style={{
          fill: "#000",
        }}
        transform="matrix(.39973 0 0 .34818 -.127 0)"
      />
    </g>
  </svg>
);

export default OKX;