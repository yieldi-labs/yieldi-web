// import Image from "next/image";
import React from "react";

const Hero = () => {
  return (
    <div className="relative px-18 bg-hero-pattern bg-cover desktop:bg-contain bg-no-repeat bg-center h-[512px] mobile-lg:h-[1024px] flex items-center justify-center">
      {/* <Image
        alt="purple"
        src="/images/circle-purple.png"
        width={510}
        height={510}
        className="absolute top-[-24px] left-0"
      /> */}
      <h1 className="text-[48px] tablet:text-[94px] text-neutral font-medium font-gt-america-ext max-w-[990px] text-center">
        The yield layer for crosschain.
      </h1>
    </div>
  );
};

export default Hero;
