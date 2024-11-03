import * as React from "react";
import { SVGProps } from "react";

const Wallet = (props: SVGProps<SVGSVGElement>) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width={20}
    height={19}
    fill="none"
    {...props}
  >
    <rect
      width={16.667}
      height={13.333}
      x={1.667}
      y={4}
      stroke="#627EEA"
      strokeWidth={1.5}
      rx={5}
    />
    <path
      stroke="#627EEA"
      strokeWidth={1.5}
      d="M15.833 4.417a3.057 3.057 0 0 0-3.673-2.994L5.658 2.762a5 5 0 0 0-3.991 4.897v2.174"
    />
    <path
      stroke="#627EEA"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={1.5}
      d="M5 13.583h5"
    />
    <path
      stroke="#627EEA"
      strokeWidth={1.5}
      d="M12.5 10.667c0-1.15.933-2.083 2.083-2.083h3.75v4.166h-3.75a2.083 2.083 0 0 1-2.083-2.083Z"
    />
    <path
      stroke="#627EEA"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={1.5}
      d="M14.583 10.667h.167"
    />
  </svg>
);
export default Wallet;
