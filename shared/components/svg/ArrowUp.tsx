import * as React from "react";
import { SVGProps } from "react";

const ArrowUp = (props: SVGProps<SVGSVGElement>) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width={24}
    height={24}
    viewBox="0 0 24 24"
    fill="none"
    {...props}
  >
    <path d="M12 5L12 19" stroke="#242628" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
    <path d="M19 12L12 5L5 12" stroke="#242628" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
  </svg>
);

export default ArrowUp;
