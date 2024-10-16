// import Image from "next/image";
import React from "react";

const Hero = () => {
  return (
    <div className="relative px-18 bg-hero-pattern bg-cover desktop:bg-contain bg-no-repeat bg-center h-m mobile-lg:h-l flex items-center justify-center">
      {/* GradientCircle */}
      <h1 className="text-[48px] tablet:text-[94px] text-neutral font-medium font-gt-america-ext max-w-[990px] text-center">
        The yield layer for crosschain.
      </h1>
    </div>
  );
};

export default Hero;
