import * as React from "react";
import { SVGProps } from "react";

const Thorchain = (props: SVGProps<SVGSVGElement>) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width={26}
    height={26}
    fill="none"
    {...props}
  >
    <path
      fill="#0E1512"
      d="M25.5 13A12.5 12.5 0 1 1 1.009 9.473 12.5 12.5 0 0 1 25.5 13Z"
    />
    <path
      fill="#21EF8B"
      d="m6.886 20.011 9.79-4.122-3.1-3.143-6.69 7.265ZM19.113 5.989l-8.63 3.62 3.098 3.137 5.532-6.757Z"
    />
  </svg>
);
export default Thorchain;
