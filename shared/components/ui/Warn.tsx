import React from "react";
import Image from "next/image";

interface WarnProps {
    text: string
}

const Warn = ({ text }: WarnProps) => {
  return (
    <div className="flex items-center p-4 bg-warn-light border border-warn rounded-lg text-gray-900">
      <Image
        src="/circle-warning.svg"
        alt="warning"
        className="mr-1"
        width={24}
        height={24}
      />
      <p className="text-sm">
        {text}
      </p>
    </div>
  );
};

export default Warn;
