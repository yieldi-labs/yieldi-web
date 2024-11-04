import * as React from "react";
import { SVGProps } from "react";

const ArrowDown = (props: SVGProps<SVGSVGElement>) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width={24}
    height={24}
    viewBox="0 0 24 24"
    fill="none"
    {...props}
  >
    <path d="M12 19L12 5" stroke="#242628" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M5 12L12 19L19 12" stroke="#242628" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

export default ArrowDown;
