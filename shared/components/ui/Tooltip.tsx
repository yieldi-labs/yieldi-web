import React from "react";

const Tooltip = ({
  children,
  content,
}: {
  children: React.ReactNode;
  content: string | React.ReactNode;
}) => (
  <div className="group relative inline-block">
    {children}
    <div className="no-wrap invisible absolute bottom-full left-1/2 mb-2 -translate-x-1/2 rounded p-2 text-sm opacity-0 transition-all group-hover:visible group-hover:opacity-100 bg-transparent-radial backdrop-blur-[30px] shadow-md">
      {content}
    </div>
  </div>
);

export default Tooltip;
