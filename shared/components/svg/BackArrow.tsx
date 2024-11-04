import * as React from "react";
import { SVGProps } from "react";

const BackArrow = (props: SVGProps<SVGSVGElement>) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width={24}
    height={24}
    fill="none"
    {...props}
  >
    <path d="M14 7L9 12" stroke="#242628" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M9 12L14 17" stroke="#242628" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

export default BackArrow;
