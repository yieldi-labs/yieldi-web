import { gradientCirclesConfig } from "@/utils";
import { Button } from "@shared/components/ui";
import { GradientCircles } from "../ui";
import { Discord, Telegram, XLogo } from "../svg";

const socials = [
  {
    icon: <XLogo />,
    link: "https://x.com/yieldi_xyz",
  },
  {
    icon: <Telegram />,
    link: "https://t.me/yieldi_labs",
  },
  {
    icon: <Discord />,
    link: "https://discord.com/invite/8aFPCXPwAd",
  },
];

const CTA = () => {
  return (
    <div className="relative flex flex-col gap-[88px] font-gt-america-exp px-8 tablet:px-18 text-neutral-900 text-center font-bold pb-[35px] tablet:pb-[115px] overflow-hidden">
      <h2 className="text-[16px] tablet:text-[38px]">
        Join the future of yield streaming with Yieldi and experience efficient,
        secure, and innovative financial growth.
      </h2>
      <footer className="bg-transparent-radial border-4 border-white rounded-[20px] flex flex-col items-center gap-[45px] p-[40px] tablet:p-[60px]">
        <h3 className="text-[20px] tablet:text-[42px]">
          The Yield Venue for Shared Security
        </h3>
        <Button
          label="Restake Now"
          link="https://app.yieldi.xyz"
          className="w-full uppercase font-medium tablet:py-[42px] py-[14px] tablet:text-[20px] text-[16px] font-gt-america-ext"
        />
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
      <GradientCircles circles={gradientCirclesConfig.footer} />
    </div>
  );
};

export default CTA;
