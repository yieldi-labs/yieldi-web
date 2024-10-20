import { CommonComponents } from "@shared/components";

interface Circles {
  top: number;
  right?: number;
  left?: number;
  size: number;
  color: string;
}

const GradientCircles = ({ circles }: { circles: Circles[] }) => (
  <>
    {circles.map((circle, index) => (
      <div
        key={index}
        className="absolute"
        style={{
          top: `${circle.top}px`,
          right: `${circle?.right}px`,
          left: `${circle?.left}px`,
          zIndex: -1,
        }}
      >
        <CommonComponents.BlurredCircle
          size={circle.size}
          color={circle.color}
        />
      </div>
    ))}
  </>
);

export default GradientCircles;
