import { CommonComponents } from "@shared/components";
import { landingGradientCircles } from "@shared/utils";

const Hero = () => (
  <div className="relative px-18 bg-hero-pattern bg-cover desktop:bg-contain bg-no-repeat bg-center h-m mobile-lg:h-l flex items-center justify-center mt-[96px]">
    <h1 className="text-[48px] tablet:text-[94px] text-neutral-900 font-medium font-gt-america-ext max-w-[990px] text-center z-100">
      The yield layer for crosschain.
    </h1>
    <CommonComponents.GradientCircles circles={landingGradientCircles.hero} />
  </div>
);

export default Hero;
