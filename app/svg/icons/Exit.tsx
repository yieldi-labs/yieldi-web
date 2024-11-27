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
      d="M15 4H5V18C5 19.1046 5.89543 20 7 20H15"
      stroke={strokeColor}
      stroke-width={strokeWidth}
      stroke-linecap="round"
      stroke-linejoin="round"
    />
    <path
      d="M16 15L19 12M19 12L16 9M19 12H9"
      stroke={strokeColor}
      stroke-width={strokeWidth}
      stroke-linecap="round"
      stroke-linejoin="round"
    />
  </svg>
);

export default Component;
