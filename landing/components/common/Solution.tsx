import { landingGradientCircles } from "@shared/utils";
import { SVGComponents, CommonComponents } from "@shared/components";

const text = [
  {
    type: "subheading",
    text: "Yieldi addresses critical issues in the AVS ecosystem, enhancing price discovery and liquidity for AVS tokens. ",
  },
  {
    type: "paragraph",
    text: "By providing real yield in native assets (ETH/BTC), Yieldi incentivizes users to delegate their LSTs to AVS operators.",
  },
  {
    type: "paragraph",
    text: "Because the yield is lower risk, and in an asset delivered to the user, removing friction, the cost of yield will be much lower. Thus AVS's will naturally prefer yield-streaming because it will require less inflation and they can transition to the fee regime faster, avoiding security gaps.",
  },
];

const Solution = () => (
  <div className="relative flex flex-col gap-[36px] tablet:gap-[110px] font-gt-america-ext text-neutral-900 w-full mb-[53px] tablet:mb-[150px] px-8 tablet:px-18">
    <h2 className="text-[32px] tablet:text-[64px] text-left desktop-sm:text-center font-bold leading-[40px] tablet:leading-[68px] max-w-[300px] tablet:max-w-full">
      What Problem Does Yieldi Solve<span className="font-sans">?</span>
    </h2>
    <div className="flex flex-col-reverse desktop-sm:flex-row gap-[40px] tablet:gap-[90px] justify-center items-center">
      <div className="flex flex-col gap-[12px] tablet:gap-[30px] w-full desktop-sm:w-[70%]">
        {text.map((item, index) => (
          <p
            key={index}
            className={`text-[16px] tablet:text-[24px] ${
              item.type === "subheading"
                ? "font-bold text-neutral-900"
                : "text-neutral-800 font-medium font-gt-america"
            }`}
          >
            {item.text}
          </p>
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
