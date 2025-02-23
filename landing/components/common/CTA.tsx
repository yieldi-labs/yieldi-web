import { Discord, Telegram, XLogo } from "../svg";
import { landingGradientCircles } from "@shared/utils";
import { CommonComponents } from "@shared/components";

const socials = [
  {
    icon: <XLogo />,
    link: "https://x.com/yieldixyz",
  },
  {
    icon: <Telegram />,
    link: "https://t.me/yieldixyz",
  },
  {
    icon: <Discord />,
    link: "https://discord.com/invite/8aFPCXPwAd",
  },
];

const CTA = () => (
  <div className="relative max-w-7xl mx-auto flex flex-col gap-[88px] font-gt-america-exp px-8 tablet:px-18 text-neutral-900 text-center font-bold pb-[35px] tablet:pb-[115px] overflow-hidden">
    <h2 className="text-base tablet:text-[38px] leading-normal">
      Join the yield revolution and access the best DeFi yields across nine
      chains today.
    </h2>
    <footer className="bg-transparent-radial border-4 border-white rounded-[20px] flex flex-col items-center gap-[45px] p-[40px] tablet:p-[60px]">
      <h3 className="text-[20px] tablet:text-[42px]">
        Native Yield Streaming for Cross-Chain
      </h3>
      {/* 
      <UIComponents.Button
        label="Deposit Now"
        link="https://app.yieldi.xyz"
        className="w-full uppercase font-medium tablet:py-[42px] py-[14px] tablet:text-[20px] text-base font-gt-america-ext"
      />
      */}
      <div className="flex items-center gap-[20px] tablet:gap-[32px]">
        {socials.map((social, index) => (
          <a
            key={index}
            href={social.link}
            target="_blank"
            rel="noopener noreferrer"
          >
            {social.icon}
          </a>
        ))}
      </div>
    </footer>
    <CommonComponents.GradientCircles circles={landingGradientCircles.footer} />
  </div>
);

export default CTA;
