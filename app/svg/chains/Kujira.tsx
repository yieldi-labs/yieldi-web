import * as React from "react";
import { SVGProps } from "react";

const Kujira = (props: SVGProps<SVGSVGElement>) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width={28}
    height={28}
    {...props}
    viewBox="0 0 80 80"
  >
    <g fill="#E53935" fillRule="evenodd">
      <path
        fillRule="nonzero"
        d="M40 0c22.091 0 40 17.909 40 40S62.091 80 40 80 0 62.091 0 40 17.909 0 40 0Zm0 4C20.118 4 4 20.118 4 40s16.118 36 36 36 36-16.118 36-36S59.882 4 40 4Z"
      />
      <path d="M16.969 29.09h22v4h-22zM42.969 29.09h20v4h-20zM42.969 22.09h20v4h-20zM20.969 22.09h13v4h-13z" />
      <path d="m49.505 15.797 6.364 6.364-2.829 2.828-6.364-6.364zM33.97 26.085l-4.59 6.553-3.276-2.294 4.589-6.554zM27.322 17.114 15.277 34.316 12 32.022l12.045-17.203zM48.398 50.781l-3.804 8.157-3.625-1.69 3.803-8.157zM56.969 50.781l5.494 11.782 3.625-1.69-5.494-11.782zM42.969 42.09h20v4h-20zM45.969 60.09h9v4h-9zM17.969 46.09h20v4h-20zM18.969 38.09h18v3h-18z" />
      <path d="M16.969 32.09h4v18h-4zM25.969 32.09h4v18h-4zM42.969 32.09h4v11h-4zM50.969 44.09h4v20h-4zM16.969 53.09h4v9h-4zM22.969 53.09h4v9h-4zM28.969 53.09h4v9h-4zM34.969 53.09h4v4h-4zM58.969 32.09h4v11h-4zM34.969 32.09h4v18h-4z" />
    </g>
  </svg>
);
export default Kujira;
