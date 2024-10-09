import NavLink from "@components/ui/NavLink";
import Image from "next/image";
import xIcon from "@public/logos/x.svg";
import telegramIcon from "@public/logos/telegram.svg";
import discordIcon from "@public/logos/discord.svg";

const Hero = () => (
  <section className="text-gray-600 mt-28 flex flex-col lg:h-screen w-full">
    <div className="text-center flex-col flex lg:flex-1 lg:fixed w-full">
      <h1 className="text-primary text-center font-bold text-hero-mobile lg:text-hero leading-none max-w-hero mx-auto font-gt-america-ext">
        The yield layer for shared{" "}
        <span className="relative z-[-1] bg-highlight lg:before:absolute lg:before:content-[''] lg:before:w-full lg:before:h-[68%] lg:before:inset-y-4 lg:before:z-[-2] lg:before:bg-highlight lg:bg-transparent">
          security.
        </span>
      </h1>
      <div className="flex mt-10 lg:mt-20 z-0 w-full flex-1 flex-col lg:flex-row lg:items-stretch items-center">
        <Image
          src="/construction.svg"
          width="470"
          height="478"
          alt="construction"
        />
        <div className="lg:ml-7 flex flex-col lg:mt-10 sm:px-2 flex-1 px-4 lg:px-0 justify-between h-auto">
          <span />
          <div className="text-3xl text-primary text-left font-medium font-gt-america-ext max-w-content pl-12 leading-[44px]">
            Launch liquidity for shared security protocols. <br /> Native
            yield-streaming for the lowest cost of security.
          </div>
          <div className="mt-10 flex flex-col">
            <SocialLinks />
          </div>
        </div>
      </div>
    </div>
    <div className="text-center flex-col flex flex-1">
      <div className="w-full bg-dark rounded-3xl lg:rounded-[60px] z-10 relative py-8 lg:py-16 px-12 lg:px-24 text-accent-dark pb-16 lg:pb-32 flex-col lg:flex-row lg:top-[768px]">
        <span className="flex text-accent-dark text-xl font-medium uppercase">
          What is Yieldi?
        </span>
        <div className="lg:w-[962px] text-accent-dark text-2xl lg:text-5xl font-bold mt-6 lg:mt-12 text-left font-gt-america-ext">
          Yieldi is a cutting-edge, gas-efficient yield-streaming solution
          initially deployed on Thorchain, leveraging its native ETH/BTC
          liquidity.
        </div>
        <div className="lg:w-[626px] text-accent-dark text-lg lg:text-xl font-medium text-left ml-auto mt-10 lg:mt-20">
          By integrating with Eigenlayer and Babylon, Yieldi allows users to
          delegate their Liquid Staking Tokens (LSTs) to an Actively Validated
          Set (AVS). The AVS can then stream yield back to the staker natively
          using Yieldi.
        </div>
      </div>
    </div>
  </section>
);

const SocialLinks = () => (
  <div className="flex lg:justify-end justify-center right-0 lg:mr-7 lg:mb-[42px] mb-[24px]">
    <SocialLink href="https://x.com/yieldi_xyz" icon={xIcon} alt="x" />
    <SocialLink
      href="https://t.me/yieldi_labs"
      icon={telegramIcon}
      alt="telegram"
    />
    <SocialLink
      href="https://discord.gg/8aFPCXPwAd"
      icon={discordIcon}
      alt="discord"
    />
  </div>
);

const SocialLink = ({ href, icon, alt }) => (
  <NavLink href={href} target="_blank" className="duration-150 hover:scale-110">
    <Image src={icon} alt={alt} />
  </NavLink>
);

export default Hero;
