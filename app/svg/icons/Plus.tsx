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
      d="M12 20.4852V12M12 12V3.51465M12 12H20.4853M12 12H3.51469"
      stroke={strokeColor}
      stroke-width={strokeWidth}
      stroke-linecap="round"
      stroke-linejoin="round"
    />
  </svg>
);

export default Component;
