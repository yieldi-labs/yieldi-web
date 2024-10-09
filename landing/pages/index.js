import Head from "next/head";
import NavLink from "@components/ui/NavLink";
import Image from "next/image";
import xIcon from "@public/logos/x.svg";
import telegramIcon from "@public/logos/telegram.svg";
import discordIcon from "@public/logos/discord.svg";
import staking from "@public/icons/staking.svg";
import calculation from "@public/icons/calculation.svg";
import distribution from "@public/icons/distribution.svg";

const Hero = () => (
  <section className="text-gray-600 flex flex-col lg:h-screen w-full lg:sticky lg:top-0">
    <div className="text-center pt-32 flex-col flex lg:flex-1 w-full h-full">
      <h1 className="text-primary text-center font-bold text-hero-mobile lg:text-hero leading-none max-w-hero mx-auto font-gt-america-ext">
        The yield layer for shared{" "}
        <span className="relative z-[-1] bg-highlight lg:before:absolute lg:before:content-[''] lg:before:w-full lg:before:h-[68%] lg:before:inset-y-4 lg:before:z-[-2] lg:before:bg-highlight lg:bg-transparent">
          security.
        </span>
      </h1>
      <div className="flex z-0 pt-20 w-full flex-1 flex-col lg:flex-row lg:items-stretch items-center mb-16 lg:mb-0">
        <Image
          src="/construction.svg"
          width="470"
          height="478"
          alt="construction"
          className="lg:self-end self-start"
        />
        <div className="mt-8 lg:ml-7 lg:mt-0 flex flex-col lg:mt-10 sm:px-2 flex-1 px-4 lg:px-0 justify-between h-auto">
          <span />
          <div className="text-2xl lg:text-3xl text-primary text-left font-medium font-gt-america-ext max-w-content lg:pl-12 leading-[44px]">
            Launch liquidity for shared security protocols. <br /> Native
            yield-streaming for the lowest cost of security.
          </div>
          <div className="mt-10 flex flex-col">
            <SocialLinks />
          </div>
        </div>
      </div>
    </div>
  </section>
);

const WhatIsYieldi = () => {
  return (
    <section className="lg:sticky lg:top-0 relative w-full bg-dark rounded-3xl lg:rounded-[60px] relative py-8 lg:py-16 px-12 lg:px-24 text-accent-dark flex-col lg:flex-row">
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
        delegate their Liquid Staking Tokens (LSTs) to an Actively Validated Set
        (AVS). The AVS can then stream yield back to the staker natively using
        Yieldi.
      </div>
    </section>
  );
};

const components = [
  {
    subtitle: "AVS",
    text: "Supports yield streaming via an Axelar-like General Message Parsing Gateway Contract.",
  },
  {
    subtitle: "IBC Channel",
    text: "Maintains connectivity to THORChain.",
  },
  {
    subtitle: "Liquidity Auction",
    text: "Conducts auctions with incentives to correctly price and build liquidity.",
  },
  {
    subtitle: "Yieldi Pools",
    text: "Deploys AVS pools and processes inbound yield swaps to native ETH.",
  },
  {
    subtitle: "THORChain",
    text: "Supports Yield Accounts, allowing users to query balances, claim, and set auto-stream.",
  },
];

const ToolKit = () => {
  const features = [
    {
      icon: staking,
      title: "Staking",
      desc: "Users deposit native assets (ETH/BTC) into the Liquid Staking Protocol (LSP).",
    },
    {
      icon: calculation,
      title: "Yield Calculation",
      desc: "The AVS computes the user's share of the yield and sends it via the Inter-Blockchain Communication (IBC) protocol to THORChain at regular intervals.",
    },
    {
      icon: distribution,
      title: "Yield Distribution",
      desc: "THORChain swaps the yield to native assets and holds it in a yield collector module assigned to the staker's L1 address.",
    },
  ];

  return (
    <section id="solution" className="lg:sticky lg:top-0 bg-[#F5F1EB] pt-20">
      <div className="mx-auto max-w-screen-xl px-4">
        <h2 className="text-xl font-medium uppercase text-left">
          How does yieldi work?
        </h2>
        <div className="mt-4 flex flex-col">
          <ul className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {features.map((item, idx) => (
              <FeatureCard key={idx} {...item} />
            ))}
          </ul>
          <h3 className="text-3xl lg:text-title-desktop font-bold lg:mt-32 mt-8 pt-2 text-start font-gt-america-ext">
            What Problem Does Yieldi Solve?
          </h3>
          <div className="flex lg:flex-row flex-col justify-between items-center lg:mt-28 mt-9 pb-12">
            <div className="lg:mr-20 mr-0 max-w-2xl">
              <p className="text-2xl font-bold font-gt-america-ext mb-6">
                Yieldi addresses critical issues in the AVS ecosystem, enhancing
                price discovery and liquidity for AVS tokens.
              </p>
              <p className="text-primary-light text-2xl font-normal">
                By providing real yield in native assets (ETH/BTC), Yieldi
                incentivizes users to delegate their LSTs to AVS operators.
                <br />
                <br />
                Because the yield is lower risk, and in an asset delivered to
                the user, removing friction, the cost of yield will be much
                lower. Thus AVS's will naturally prefer yield-streaming because
                it will require less inflation and they can transition to the
                fee regime faster, avoiding security gaps.
              </p>
            </div>
            <Image
              width={0}
              height={0}
              src="/diagram.svg"
              alt="diagram"
              className="mt-6 lg:mt-0 w-auto"
            />
          </div>
        </div>
      </div>

      <section className="lg:sticky lg:top-0" id="components">
        <div className="flex flex-col justify-center mb-20">
          <div className="w-full bg-accent rounded-3xl lg:rounded-[60px] lg:py-16 py-8 lg:px-24 px-8 flex-1 mx-auto">
            <h2 className="text-dark lg:text-title text-title-mobile lg:text-start text-center font-bold uppercase flex-1 mb-16">
              key components
            </h2>
            <ul>
              {components.map((component, index) => (
                <li
                  key={index}
                  className={`border-t border-dark p-2.5 text-dark text-xl font-medium ${index === components.length - 1 ? "border-b" : ""}`}
                >
                  <strong>{component.subtitle}:</strong> {component.text}
                </li>
              ))}
            </ul>
          </div>
          <div className="lg:w-[1280px] mx-auto text-center text-primary text-lg lg:text-[40px] font-bold lg:pt-20 lg:px-24 pt-10 px-5 font-gt-america-ext lg:leading-[48px]">
            Join the future of yield streaming with Yieldi and experience
            efficient, secure, and innovative financial growth.
          </div>
        </div>
        <div className="flex max-w-screen-2xl mx-auto pb-20 px-4">
          <div className="flex flex-col items-center flex-1 p-[60px] gap-[45px] rounded-3xl lg:rounded-[40px] border border-border">
            <h1 className="text-2xl text-primary text-center font-bold lg:text-subtitle lg:leading-[48px] self-stretch font-gt-america-ext">
              The Yield Venue for Shared{" "}
              <span className="relative z-[0] bg-highlight">Security</span>
            </h1>
            <div className="flex justify-center gap-4">
              <SocialLink
                href="https://x.com/yieldi_xyz"
                icon={xIcon}
                alt="x"
              />
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
          </div>
        </div>
      </section>
    </section>
  );
};

const Testimonials = () => {};

const SocialLink = ({ href, icon, alt }) => (
  <NavLink href={href} target="_blank" className="duration-150 hover:scale-110">
    <Image src={icon} alt={alt} />
  </NavLink>
);

const FeatureCard = ({ icon, title, desc }) => (
  <li className="flex flex-col gap-[30px] p-5 rounded-large border border-border-light items-center lg:items-start">
    <div className="flex-none flex items-center justify-center">
      <Image src={icon} alt={title} />
    </div>
    <div className="flex flex-col sm:items-center lg:items-start">
      <h4 className="text-[36px] font-bold text-primary h-[90px] lg:w-[70px] leading-[40px] lg:text-start text-center font-gt-america-ext">
        {title}
      </h4>
      <p className="mt-5 text-xl font-medium text-border">{desc}</p>
    </div>
  </li>
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

export default function Home() {
  return (
    <>
      <Head>
        <meta name="robots" content="index" />
      </Head>
      <Hero />
      <WhatIsYieldi />
      <ToolKit />
      <Testimonials />
    </>
  );
}
