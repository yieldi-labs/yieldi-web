import * as React from "react";
import { SVGProps } from "react";

const DoubleArrow = (props: SVGProps<SVGSVGElement>) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width={16}
    height={17}
    viewBox="0 0 16 17"
    fill="none"
    {...props}
  >
    <path
      d="M10.6667 10.5L8.00004 13.1667L5.33337 10.5M5.33337 6.50004L8.00004 3.83337L10.6667 6.50004"
      stroke="#585E62"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

export default DoubleArrow;