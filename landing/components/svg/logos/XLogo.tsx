import * as React from 'react';
import { SVGProps } from 'react';

const XLogo = (props: SVGProps<SVGSVGElement>) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width={32}
    height={32}
    fill="none"
    {...props}
  >
    <path
      fill="#627EEA"
      d="M16 0C7.164 0 0 7.164 0 16s7.164 16 16 16 16-7.164 16-16S24.836 0 16 0Z"
    />
    <path
      fill="#fff"
      d="M17.75 14.552 24.6 6.59h-1.623l-5.947 6.913-4.75-6.913H6.8l7.184 10.454-7.183 8.35h1.623l6.28-7.301 5.017 7.3H25.2l-7.45-10.841ZM9.01 7.812h2.493l11.476 16.415h-2.493L9.009 7.812Z"
    />
  </svg>
);

export default XLogo;
