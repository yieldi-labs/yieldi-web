import { FC } from "react";

interface ComponentProps {
  className?: string;
  size?: number;
  strokeColor?: string;
  strokeWidth?: number;
}

const Component: FC<ComponentProps> = ({
  size = 24,
  strokeColor = "white",
  strokeWidth = 2,
  ...props
}) => (
  <svg viewBox="0 0 24 24" fill="none" height={size} width={size} {...props}>
    <path
      d="M16 3H4V16"
      stroke={strokeColor}
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M8 7H20V19C20 20.1046 19.1046 21 18 21H10C8.89543 21 8 20.1046 8 19V7Z"
      stroke={strokeColor}
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

export default Component;
