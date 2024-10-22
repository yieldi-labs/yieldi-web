import { landingGradientCircles } from "@shared/utils";
import { SVGComponents, CommonComponents } from "@shared/components";

const text = [
  {
    subheading: "Native Yield on L1 Assets",
    text: "Real native yield on assets like Bitcoin do not exist in the market. Yieldi is the only place where you can stake and earn real Bitcoin.",
  },
  {
    subheading: "Simplifying Cross-Chain Yield",
    text: "Navigating multiple chains to find yield opportunities can be time-consuming and confusing. Yieldi abstracts all the complexity, automatically routing your assets to the highest-yield farms across chains. This means no manual bridging or management—just continuous yield to your wallet.",
  },
  {
    subheading: "Unified DeFi Experience",
    text: "With yield farms spread across different chains, earning yield in DeFi is a cumbersome and fragmented experience. Yieldi simplifies this by showing you real yields in the market, so you can get in and out safely and securely with a few clicks.",
  },
  {
    subheading: "Efficient Yield Streaming",
    text: "Getting in and out of yield farms can be costly and slow, especially across chains. Yieldi’s infrastructure enables efficient routing and yield streaming, meaning you can accrue your earnings directly in your wallet in the most gas efficient way possible.",
  },
];

const Solution = () => (
  <div className="relative flex flex-col gap-[36px] tablet:gap-[110px] font-gt-america-ext text-neutral-900 w-full mb-[53px] tablet:mb-[150px] px-8 tablet:px-18">
    <h2 className="text-[32px] tablet:text-[64px] text-left desktop-sm:text-center font-bold leading-[40px] tablet:leading-[68px] max-w-[300px] tablet:max-w-full">
      What Problem Does Yieldi Solve<span className="font-sans">?</span>
    </h2>
    <div className="flex flex-col-reverse desktop-sm:flex-row gap-[40px] tablet:gap-[90px] justify-center items-center">
      <div className="flex flex-col gap-4 tablet:gap-[30px] w-full desktop-sm:w-[70%]">
        {text.map((item, index) => (
          <div key={index} className="flex flex-col gap-1.5">
            <p className="text-base leading-tight tablet:text-[24px] font-bold text-neutral-900">
              {item.subheading}
            </p>
            <p
              key={index}
              className="text-base leading-normal tablet:text-[24px] text-neutral-800 font-gt-america"
            >
              {item.text}
            </p>
          </div>
        ))}
      </div>
      <SVGComponents.SolutionSVG className="w-[300px] tablet:w-[532px] h-[300px] tablet:h-[532px]" />
    </div>
    <div id="solution" className="absolute top-[-200px]"></div>
    <CommonComponents.GradientCircles
      circles={landingGradientCircles.solution}
    />
  </div>
);

export default Solution;
