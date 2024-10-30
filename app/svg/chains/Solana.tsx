import * as React from "react";
import { SVGProps } from "react";

const Solana = (props: SVGProps<SVGSVGElement>) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width={28}
    height={28}
    viewBox="0 0 28 28"
    fill="none"
    {...props}
  >
    <path
      fill="#000008"
      d="M26.949 17.217c-1.78 7.139-9.01 11.498-16.161 9.717C3.649 25.15-.702 17.92 1.076 10.781c1.78-7.138 9.005-11.497 16.14-9.717 7.155 1.758 11.508 9.01 9.733 16.153Z"
    />
    <path
      fill="url(#c)"
      d="m22.247 18.116-2.75 2.874a.637.637 0 0 1-.468.198H5.986a.325.325 0 0 1-.293-.187.304.304 0 0 1 .06-.336l2.753-2.875a.638.638 0 0 1 .466-.198h13.042c.062 0 .123.018.175.051.052.034.093.081.118.137a.305.305 0 0 1-.06.336Zm-2.75-5.789a.638.638 0 0 0-.468-.197H5.986a.326.326 0 0 0-.175.05.304.304 0 0 0-.058.473l2.753 2.875a.638.638 0 0 0 .466.197h13.042a.325.325 0 0 0 .175-.05.305.305 0 0 0 .058-.473l-2.75-2.875ZM5.985 10.262h13.043a.653.653 0 0 0 .467-.197l2.752-2.875a.309.309 0 0 0 .059-.336.315.315 0 0 0-.118-.136.326.326 0 0 0-.175-.051H8.972a.653.653 0 0 0-.466.198L5.753 9.739a.308.308 0 0 0-.06.336.313.313 0 0 0 .118.136.325.325 0 0 0 .175.051Z"
    />
    <defs>
      <linearGradient
        id="a"
        x1={7.073}
        x2={20.352}
        y1={21.534}
        y2={6.169}
        gradientUnits="userSpaceOnUse"
      >
        <stop offset={0.08} stopColor="#9945FF" />
        <stop offset={0.3} stopColor="#8752F3" />
        <stop offset={0.5} stopColor="#5497D5" />
        <stop offset={0.6} stopColor="#43B4CA" />
        <stop offset={0.72} stopColor="#28E0B9" />
        <stop offset={0.97} stopColor="#19FB9B" />
      </linearGradient>
    </defs>
  </svg>
);
export default Solana;
