import { GradientCircles } from "../ui";
import { gradientCirclesConfig } from "@/utils";

const Hero = () => (
  <div className="relative px-18 bg-hero-pattern bg-cover desktop:bg-contain bg-no-repeat bg-center h-m mobile-lg:h-l flex items-center justify-center mt-[96px]">
    <h1 className="text-[48px] tablet:text-[94px] text-neutral-900 font-medium font-gt-america-ext max-w-[990px] text-center z-100">
      The yield layer for crosschain.
    </h1>
    <GradientCircles circles={gradientCirclesConfig.hero} />
  </div>
);

export default Hero;
