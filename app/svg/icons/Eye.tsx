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
      d="M15 12C15 13.6569 13.6569 15 12 15C10.3431 15 9 13.6569 9 12C9 10.3431 10.3431 9 12 9C13.6569 9 15 10.3431 15 12Z"
      stroke={strokeColor}
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M2 12C3.60014 7.90264 7.33603 5 12 5C16.664 5 20.3999 7.90264 22 12C20.3999 16.0974 16.664 19 12 19C7.33603 19 3.60014 16.0974 2 12Z"
      stroke={strokeColor}
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

export default Component;
