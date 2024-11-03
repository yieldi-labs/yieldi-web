import * as React from "react";
import { SVGProps } from "react";

const EthereumSVG = (props: SVGProps<SVGSVGElement>) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width={28}
    height={28}
    fill="none"
    {...props}
  >
    <path
      fill="#627EEA"
      d="M26.949 17.217c-1.78 7.139-9.01 11.498-16.161 9.717C3.649 25.15-.702 17.92 1.076 10.781c1.78-7.138 9.005-11.497 16.14-9.717 7.155 1.758 11.508 9.01 9.733 16.153Z"
    />
    <path
      fill="#C0CBF7"
      d="M14.167 17.233c-.052.018-.081-.027-.116-.048-1.727-1.019-3.452-2.039-5.175-3.06a.37.37 0 0 0-.052-.02v-.023l.03-.018c.044-.011.087-.025.129-.041l4.069-1.852c.362-.165.725-.328 1.088-.491h.026v.147c0 1.802.002 3.604.001 5.406Z"
    />
    <path
      fill="#C0CBF7"
      d="M14.17 11.68h-.026c0-.051.005-.103.005-.157V5.449a.433.433 0 0 1 .01-.155h.011c.213.314.399.646.594.97l4.652 7.719c.015.025.027.052.04.08a.903.903 0 0 1-.129-.038l-.852-.39-1.324-.605-2.128-.964c-.284-.13-.568-.258-.853-.385Z"
    />
    <path
      fill="#fff"
      d="M14.161 5.29a.433.433 0 0 0-.01.156v6.074c0 .052-.003.104-.005.158-.363.164-.726.326-1.088.492l-4.07 1.851c-.041.016-.084.03-.127.042.117-.245.27-.467.41-.7 1.614-2.684 3.23-5.368 4.846-8.05a.452.452 0 0 1 .035-.043l.009.021Z"
    />
    <path
      fill="#8198EE"
      d="M14.17 11.68c.285.128.57.255.854.384l2.128.964c.442.2.884.402 1.325.605l.851.39a.907.907 0 0 0 .13.038c.051.064-.026.067-.049.081-.442.264-.886.525-1.329.787l-3.812 2.256c-.032.018-.067.032-.1.048v-5.405l.002-.147Z"
    />
    <path
      fill="#C0CBF7"
      d="m14.149 18.257 3.328-1.962 1.905-1.126.058-.032c.006.052-.03.08-.052.11l-4.351 6.132c-.275.387-.549.777-.826 1.161-.014.02-.037.115-.081.015.035-.03.02-.07.02-.104l-.001-4.194Z"
    />
    <path
      fill="#fff"
      d="M14.149 18.257v4.192c0 .036.015.076-.02.103-.074-.044-.106-.124-.155-.19-1.682-2.369-3.363-4.738-5.043-7.108-.022-.03-.041-.062-.063-.095.043-.026.067.009.092.024l5.102 3.015.087.059Z"
    />
    <path
      fill="#393939"
      d="m14.161 5.29-.012-.018c.023-.015.02.006.023.017l-.01.002Z"
    />
  </svg>
);

export default EthereumSVG;
