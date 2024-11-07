import { cloneElement } from "react";
import { landingGradientCircles } from "@shared/utils";
import { SVGComponents, CommonComponents } from "@shared/components";

const boxes = [
  {
    image: <SVGComponents.Staking />,
    header: "Explore and Stake",
    description:
      "Discover yield farms across any chain. Stake your assets and set your earnings to stream in the asset of your choice.",
  },
  {
    image: <SVGComponents.Calculator />,
    header: "Single Hop Routing",
    description:
      "Yieldi automatically routes your assets to high-yield DeFi farms without the need for manual cross-chain bridging.",
  },
  {
    image: <SVGComponents.Distribution />,
    header: "Yield Streaming",
    description:
      "Your yield is collected through THORChain’s Yield Collection Module, swapped to your choosen yield asset, and streamed to your wallet.",
  },
];

const HowDoesItWork = () => (
  <div className="relative max-w-7xl mx-auto flex flex-col justify-center items-center tablet:mb-[170px] mb-[60px] px-8 tablet:px-18 font-gt-america-ext gap-[34px] tablet:gap-[70px]">
    <h2 className="uppercase text-neutral-900 text-[18px] tablet:text-[24px] font-bold text-center">
      How Does Yieldi Work<span className="font-sans">?</span>
    </h2>
    <div className="flex flex-col desktop-sm:flex-row gap-[14px] tablet:gap-[40px]">
      {boxes.map((box, index) => (
        <div
          key={index}
          className="bg-transparent-radial flex flex-col items-start p-[20px] border-4 border-white rounded-[20px] w-full"
        >
          {cloneElement(box.image, {
            header: box.header,
            description: box.description,
            key: index,
            className:
              "h-[60px] w-[60px] desktop-sm:h-[94px] desktop-sm:w-[94px] mb-[22px] desktop-sm:mb-[30px]",
          })}

          <div className="desktop-sm:h-[92px] flex flex-col justify-center">
            <h3 className="text-[32px] tablet:text-[36px] font-bold text-neutral leading-[46px]">
              {box.header}
            </h3>
          </div>
          <p className="font-gt-america font-medium text-neutral-800 text-base tablet:text-[20px] mb-auto mt-[12px] desktop-sm:mt-[36px] leading-normal">
            {box.description}
          </p>
        </div>
      ))}
    </div>
    <CommonComponents.GradientCircles
      circles={landingGradientCircles.howDoesItWork}
    />
  </div>
);

export default HowDoesItWork;
