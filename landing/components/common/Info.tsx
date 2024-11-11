const paragraphs = [
  "Yieldi makes yield farming easy. Find top yield opportunities across chains, stake your assets, and stream your earnings directly to your wallet in the L1 asset of your choice.",
  "Yieldi handles all the cross-chain complexities to make it dead simple to earn real Bitcoin plus 15+ L1 assets.",
];

const Info = () => (
  <div className="relative w-100 max-w-7xl mx-auto flex justify-center z-50 font-gt-america-ext pt-[100px] 2xl:pt-[50px] pb-[80px] tablet:pb-[200px] tablet:px-0 px-[32px]">
    <div className="max-w-[680px] flex flex-col text-center gap-[30px]">
      <h2 className="text-3xl tablet:text-[32px] font-bold text-neutral-900">
        The only DeFi venue for native Bitcoin and L1 yield
      </h2>
      {paragraphs.map((paragraph, index) => (
        <p
          key={index}
          className="text-base tablet:text-xl text-neutral-800 font-medium"
        >
          {paragraph}
        </p>
      ))}
    </div>
    <div id="about" className="absolute top-[-200px]"></div>
  </div>
);

export default Info;
