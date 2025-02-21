import * as React from "react";
import { SVGProps } from "react";

const CircleInfo = (props: SVGProps<SVGSVGElement>) => (
  <svg
    width="24"
    height="25"
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    {...props}
  >
    <path
      d="M12 8.9502V12.9502M12 21.5C7.02944 21.5 3 17.4706 3 12.5C3 7.52944 7.02944 3.5 12 3.5C16.9706 3.5 21 7.52944 21 12.5C21 17.4706 16.9706 21.5 12 21.5ZM12.0498 15.9502V16.0502L11.9502 16.0498V15.9502H12.0498Z"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);
export default CircleInfo;
