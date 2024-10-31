import * as React from "react";
import { SVGProps } from "react";

const UpArrow = (props: SVGProps<SVGSVGElement>) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width={24}
    height={24}
    fill="none"
    {...props}
  >
    <path d="M17 14L12 9" stroke="#242628" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
    <path d="M12 9L7 14" stroke="#242628" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
  </svg>
);

export default UpArrow;
