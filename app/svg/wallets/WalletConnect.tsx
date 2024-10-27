"use client";
import * as React from "react";
import { SVGProps } from "react";

const defaultWidth = 400;
const defaultHeight = 400;

interface WalletConnectProps extends SVGProps<SVGSVGElement> {
  className?: string;
}

const WalletConnect = ({ className = "", ...props }: WalletConnectProps) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox={`0 0 ${defaultWidth} ${defaultHeight}`}
    fill="none"
    className={className}
    {...props}
  >
    <clipPath id="a">
      <path d="M0 0h400v400H0z" />
    </clipPath>
    <g clipPath="url(#a)">
      <circle cx={200} cy={200} r={199.5} fill="#3396ff" stroke="#66b1ff" />
      <path
        fill="#fff"
        d="M122.519 148.965c42.791-41.729 112.171-41.729 154.962 0l5.15 5.022a5.248 5.248 0 0 1 0 7.555l-17.617 17.18a2.79 2.79 0 0 1-3.874 0l-7.087-6.911c-29.853-29.111-78.253-29.111-108.106 0l-7.59 7.401a2.79 2.79 0 0 1-3.874 0l-17.617-17.18a5.248 5.248 0 0 1 0-7.555zm191.397 35.529 15.679 15.29a5.248 5.248 0 0 1 0 7.555l-70.7 68.944c-2.139 2.087-5.608 2.087-7.748 0l-50.178-48.931a1.394 1.394 0 0 0-1.937 0l-50.178 48.931c-2.139 2.087-5.608 2.087-7.748 0l-70.701-68.945a5.249 5.249 0 0 1 0-7.555l15.679-15.29c2.14-2.086 5.609-2.086 7.748 0l50.179 48.932a1.394 1.394 0 0 0 1.937 0l50.177-48.932c2.139-2.087 5.608-2.087 7.748 0l50.179 48.932a1.394 1.394 0 0 0 1.937 0l50.179-48.931c2.139-2.087 5.608-2.087 7.748 0z"
      />
    </g>
  </svg>
);
export default WalletConnect;
