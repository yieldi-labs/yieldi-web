import * as React from "react";
import { SVGProps } from "react";

const ChevronLeft = (props: SVGProps<SVGSVGElement>) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width={24}
    height={24}
    fill="none"
    {...props}
  >
    <path
      stroke="#242628"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="m14 7-5 5M9 12l5 5"
    />
  </svg>
);
export default ChevronLeft;
