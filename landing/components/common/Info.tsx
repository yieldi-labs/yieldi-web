const paragraphs = [
  "Yieldi is a cutting-edge, gas-efficient yield-streaming solutioninitially deployed on Thorchain, leveraging its native ETH/BTC liquidity",
  "By integrating with Eigenlayer and Babylon, Yieldi allows users to delegate their Liquid Staking Tokens (LSTs) to an Actively Validated Set (AVS). The AVS can then stream yield back to the stakes natively using Yieldi.",
];

const Info = () => (
  <div className="relative w-100 flex justify-center z-50 font-gt-america-ext pt-[50px] tablet:pt-[30px] pb-[80px] tablet:pb-[110px] tablet:px-0 px-[32px]">
    <div className="max-w-[680px] flex flex-col text-center gap-[30px]">
      <h2 className="text-[24px] tablet:text-[32px] font-bold text-neutral-900">
        Launch liquidity for shared security protocols.
      </h2>
      {paragraphs.map((paragraph, index) => (
        <p
          key={index}
          className="text-[14px] tablet:text-base text-neutral-800 font-medium"
        >
          {paragraph}
        </p>
      ))}
    </div>
    <div id="about" className="absolute top-[-200px]"></div>
  </div>
);

export default Info;
