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
    <path d="M4.66663 6.66667L7.99996 10" stroke="#585E62" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
    <path d="M8 10L11.3333 6.66667" stroke="#242628" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
  </svg>
);

export default DownArrow;
