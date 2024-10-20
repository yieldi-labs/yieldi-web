import { cloneElement } from "react";
import { GradientCircles } from "../ui";
import { gradientCirclesConfig } from "@/utils";
import { SVGComponents } from "@shared/components";

const boxes = [
  {
    image: <SVGComponents.Staking />,
    header: "Staking",
    description:
      "Users deposit native assets (ETH/BTC) into the Liquid Staking Protocol (LSP).",
  },
  {
    image: <SVGComponents.Calculator />,
    header: "Yield Calculation",
    description:
      "The AVS computes the user's share of the yield and sends it via the Inter-Blockchain Communication (IBC) protocol to THORChain at regular intervals.",
  },
  {
    image: <SVGComponents.Distribution />,
    header: "Yield Distribution",
    description:
      "THORChain swaps the yield to native assets and holds it in a yield collector module assigned to the staker’s L1 address.",
  },
];

const HowDoesItWork = () => (
  <div className="relative flex flex-col justify-center items-center tablet:mb-[170px] mb-[60px] px-8 tablet:px-18 font-gt-america-ext gap-[34px] tablet:gap-[70px]">
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
            <h3 className="text-[32px] tablet:text-[36px] font-bold text-neutral max-w-[100px] leading-[46px]">
              {box.header}
            </h3>
          </div>
          <p className="font-gt-america font-medium text-neutral-800 text-[16px] tablet:text-[20px] mb-auto mt-[12px] desktop-sm:mt-[36px]">
            {box.description}
          </p>
        </div>
      ))}
    </div>
    <GradientCircles circles={gradientCirclesConfig.howDoesItWork} />
  </div>
);

export default HowDoesItWork;
