import BlurredCircle from "./GradientBlurredCircle";

interface Circles {
  top?: number;
  right?: number;
  left?: number;
  bottom?: number;
  size: number;
  color: string;
}

interface GradientCirclesProps {
  circles: Circles[];
  fixed?: boolean;
}

const GradientCircles = ({ circles, fixed }: GradientCirclesProps) => (
  <>
    {circles.map((circle, index) => (
      <div
        key={index}
        className={`${fixed ? "fixed" : "absolute"}`}
        style={{
          top: `${circle.top}px`,
          right: `${circle?.right}px`,
          left: `${circle?.left}px`,
          bottom: `${circle?.bottom}px`,
          zIndex: -1,
        }}
      >
        <BlurredCircle size={circle.size} color={circle.color} />
      </div>
    ))}
  </>
);

export default GradientCircles;
