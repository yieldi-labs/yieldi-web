import React from "react";
import { CircleInfo } from "../svg";
import clsx from "clsx";

export const enum WarnType {
  WARNING = "WARNING",
  ERROR = "ERROR",
  INFO = "INFO",
}

export interface WarnProps {
  text: string;
  link?: string; // Nueva prop opcional para el enlace
  type?: WarnType
}

const colorByType = {
  [WarnType.WARNING]: "warn",
  [WarnType.ERROR]: "red",
  [WarnType.INFO]: "blue",
};

const textByType = {
  [WarnType.WARNING]: "text-warn-dark",
  [WarnType.ERROR]: "text-red-dark",
  [WarnType.INFO]: "text-blue-dark",
}

const bgByType = {
  [WarnType.WARNING]: "bg-warn-light",
  [WarnType.ERROR]: "bg-red-light",
  [WarnType.INFO]: "bg-blue-light",
}

const Warn = ({ text, link, type = WarnType.WARNING }: WarnProps) => {
  return (
    <div className={clsx("flex items-start p-4 border rounded-lg text-gray-900", bgByType[type], `border-${colorByType[type]}`)}>
      {/* <Image
        src="/circle-warning.svg"
        alt="warning"
        className="mr-1 stroke-current text-red"
        width={24}
        height={24}
      /> */}
      <CircleInfo 
        width={24}
        height={24}
        className={clsx("mr-1 min-w-[24px] stroke-current", textByType[type])}
      />
      <p className="text-sm ml-2">
        {text}{" "}
        {link && (
          <a
            href={link}
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-600 underline hover:text-blue-800"
          >
            Learn more
          </a>
        )}
      </p>
    </div>
  );
};

export default Warn;
