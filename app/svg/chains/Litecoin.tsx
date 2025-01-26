import * as React from "react";
import { SVGProps } from "react";

const Litecoin = (props: SVGProps<SVGSVGElement>) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width={28}
    height={28}
    fill="none"
    viewBox="0 0 28 28"
    {...props}
  >
    <path
      fill="#345D9D"
      d="M26.949 17.217c-1.78 7.139-9.01 11.498-16.161 9.717C3.649 25.15-.702 17.92 1.076 10.781c1.78-7.138 9.005-11.497 16.14-9.717 7.155 1.758 11.508 9.01 9.733 16.153Z"
    />
    <path
      fill="#fff"
      d="m12.691 19.401 1.327-4.475 2.068-.587.432-1.48-2.037.616 2.16-7.345v-.117a.358.358 0 0 0-.37-.346h-2.747a.466.466 0 0 0-.462.34L10.5 14.71l-2.037.617L8 16.747l2.037-.617-1.821 6.203H19.08a.46.46 0 0 0 .463-.34l.617-2.129v-.117a.356.356 0 0 0-.37-.346H12.69Z"
    />
  </svg>
);
export default Litecoin;
