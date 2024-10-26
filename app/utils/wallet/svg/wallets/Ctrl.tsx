"use client";
import * as React from "react";
import { SVGProps } from "react";

const defaultWidth = 130;
const defaultHeight = 130;

interface CtrlSVG extends SVGProps<SVGSVGElement> {
  className?: string;
}

const CtrlSVG = ({ className = "", ...props }: CtrlSVG) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox={`0 0 ${defaultWidth} ${defaultHeight}`}
    fill="none"
    className={className}
    {...props}
  >
    <g fill="#001405" clipPath="url(#a)">
      <path d="M41.333 90.326v26.011a7.661 7.661 0 0 0 7.662 7.664h26.009a7.661 7.661 0 0 0 7.662-7.664v-13.006c0-5.713 2.31-10.88 6.054-14.615a20.598 20.598 0 0 1 14.613-6.054h13.004A7.661 7.661 0 0 0 124 75V48.997a7.66 7.66 0 0 0-7.663-7.663H90.339a7.66 7.66 0 0 0-7.662 7.663v13.635c0 11.067-8.972 20.03-20.028 20.03H49.016a7.66 7.66 0 0 0-7.662 7.663h-.021ZM0 48.996v26.008a7.66 7.66 0 0 0 7.662 7.663h26.009a7.66 7.66 0 0 0 7.662-7.663V62c0-5.713 2.31-10.88 6.054-14.613A20.6 20.6 0 0 1 62 41.333h13.004a7.66 7.66 0 0 0 7.663-7.662V7.662A7.66 7.66 0 0 0 75.004 0H49.006a7.66 7.66 0 0 0-7.662 7.662v13.634c0 11.065-8.972 20.027-20.028 20.027H7.662A7.66 7.66 0 0 0 0 48.985v.01Z" />
    </g>
    <defs>
      <clipPath id="a">
        <path fill="#fff" d="M0 0h124v124H0z" />
      </clipPath>
    </defs>
  </svg>
);

export default CtrlSVG;
