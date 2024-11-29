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
      d="M3 12C3 7.02944 7.02944 3 12 3C14.8273 3 17.35 4.30367 19 6.34267"
      stroke={strokeColor}
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M19.5 3L19.5 7L15.5 7"
      stroke={strokeColor}
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M21 12C21 16.9706 16.9706 21 12 21C9.17273 21 6.64996 19.6963 5 17.6573"
      stroke={strokeColor}
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M4.5 21L4.5 17L8.5 17"
      stroke={strokeColor}
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

export default Component;
