"use client";
import * as React from "react";
import { SVGProps } from "react";

const Burger = (props: SVGProps<SVGSVGElement>) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width={24}
    height={24}
    fill="none"
    {...props}
  >
    <g fill="#242628" clipPath="url(#a)">
      <path d="M23 12.98H1a1 1 0 0 1 0-2h22a1 1 0 0 1 0 2ZM23 5.313H1a1 1 0 0 1 0-2h22a1 1 0 0 1 0 2ZM23 20.646H1a1 1 0 0 1 0-2h22a1 1 0 0 1 0 2Z" />
    </g>
    <defs>
      <clipPath id="a">
        <path fill="#fff" d="M0 0h24v24H0z" />
      </clipPath>
    </defs>
  </svg>
);
export default Burger;
