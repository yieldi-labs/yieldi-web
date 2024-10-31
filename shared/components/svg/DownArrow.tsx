import * as React from "react";
import { SVGProps } from "react";

const DownArrow = (props: SVGProps<SVGSVGElement>) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width={24}
    height={24}
    fill="none"
    {...props}
  >
    <path d="M7 10L12 15" stroke="#242628" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
    <path d="M12 15L17 10" stroke="#242628" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
  </svg>
);

export default DownArrow;
