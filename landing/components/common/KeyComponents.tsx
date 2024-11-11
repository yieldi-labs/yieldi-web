import { CommonComponents } from "@shared/components";
import { landingGradientCircles } from "@shared/utils";

const components = [
  {
    header: "L1 Liquidity Pools",
    description:
      "Tap into liquidity pools directly from Layer 1 chains to provide liquidity and earn yield on your assets.",
    borderColor: "#627EEA",
  },
  {
    header: "L1 Savers Vaults",
    description: "Access secure savings vaults for low-risk native yield",
    borderColor: "#F09242",
  },
  {
    header: "Yield Streaming (coming soon)",
    description:
      "The yield asset of your choice, streamed straight to your wallet.",
    borderColor: "#A1FD59",
  },
  {
    header: "Cross-chain DeFi farms (coming soon)",
    description:
      "Yieldi will aggregate all the best cross-chain yield strategies and handle the complexity of managing them.",
    borderColor: "#FFD737",
  },
  {
    header: "Liquid Restaking AVS Yield (coming later)",
    description:
      "Contribute to shared security on liquid staking protocols and receive yield from AVS's in any native asset.",
    borderColor: "#A799FE",
  },
];

const KeyComponents = () => (
  <div className="relative max-w-7xl mx-auto flex flex-col gap-[28px] tablet:gap-[75px] tablet:mb-[150px] mb-[90px] px-8 tablet:px-18 font-gt-america-ext h-fit">
    <h2 className="text-[32px] tablet:text-[64px] font-bold text-neutral-900">
      Key Features
    </h2>
    <div className="flex flex-col gap-[28px] desktop-sm:grid desktop-sm:grid-cols-3 desktop-sm:grid-rows-2 desktop-sm:gap-x-[28px] desktop-sm:gap-y-[90px]">
      {components.map((component, index) => (
        <div
          key={index}
          className="flex w-full desktop-sm:max-h-auto min-h-[120px]"
        >
          <div
            className="w-[10px] h-auto  desktop-sm:h-full rounded-2xl mr-[40px] desktop-sm:mr-[20px]"
            style={{ backgroundColor: component.borderColor, opacity: 0.4 }}
          ></div>
          <div className="flex flex-col gap-[12px] tablet:gap-[16px]  w-fit h-full">
            <h3 className="font-gt-america-exp font-bold text-neutral-900 tablet:text-[24px] text-[20px]">
              {component.header}
            </h3>
            <p className="font-gt-america text-neutral-800 max-w-[410px] tablet:text-[24px] text-base leading-normal">
              {component.description}
            </p>
          </div>
        </div>
      ))}
    </div>
    <CommonComponents.GradientCircles
      circles={landingGradientCircles.keyComponents}
    />
    <div id="components" className="absolute top-[-150px]"></div>
  </div>
);

export default KeyComponents;
