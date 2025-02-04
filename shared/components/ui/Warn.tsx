import React from "react";
import Image from "next/image";

interface WarnProps {
  text: string;
  link?: string; // Nueva prop opcional para el enlace
}

const Warn = ({ text, link }: WarnProps) => {
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
