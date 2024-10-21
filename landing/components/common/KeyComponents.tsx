import { CommonComponents } from "@shared/components";
import { landingGradientCircles } from "@shared/utils";

const components = [
  {
    header: "AVS",
    description:
      "Supports yield streaming via an Axelar-like General Message Parsing Gateway Contract.",
    borderColor: "#627EEA",
  },
  {
    header: "IBC Channel",
    description: "Maintains connectivity to THORChain.",
    borderColor: "#F09242",
  },
  {
    header: "Liquidity Auction",
    description:
      "Conducts auctions with incentives to correctly price and build liquidity.",
    borderColor: "#A1FD59",
  },
  {
    header: "Yieldi Pools",
    description:
      "Deploys AVS pools and processes inbound yield swaps to native ETH.",
    borderColor: "#FFD737",
  },
  {
    header: "THORChain",
    description:
      "Supports Yield Accounts, allowing users to query balances, claim, and set auto-stream.",
    borderColor: "#A799FE",
  },
];

const KeyComponents = () => (
  <div className="relative flex flex-col gap-[28px] tablet:gap-[75px] tablet:mb-[150px] mb-[90px] px-8 tablet:px-18 font-gt-america-ext h-fit">
    <h2 className="text-[32px] tablet:text-[64px] font-bold text-neutral-900">
      Key Components
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
