import {
  CTA,
  Hero,
  Info,
  Solution,
  HowDoesItWork,
  KeyComponents,
} from "@/components/common";
import Head from "next/head";

const Home = () => (
  <>
    <Head>
      <title>Yieldi</title>

      <meta property="url" content="https://www.yieldi.xyz" />
      <meta
        property="description"
        content="The only DeFi venue to stake and earn native Bitcoin yield with 15+ supported L1 assets."
      />

      {/* Open Graph metatags */}
      <meta
        property="og:title"
        content="Yieldi - The Yield Layer for Cross-Chain"
      />
      <meta
        property="og:description"
        content="The only DeFi venue to stake and earn native Bitcoin yield with 15+ supported L1 assets."
      />
      <meta property="og:image" content="/images/og-image.png" />
      <meta property="og:url" content="https://www.yieldi.xyz" />
      <meta property="og:type" content="website" />

      {/* Twitter metatags */}
      <meta
        name="twitter:title"
        content="Yieldi - The Yield Layer for Cross-Chain"
      />
      <meta name="twitter:card" content="summary_large_image" />
      <meta
        name="twitter:description"
        content="The only DeFi venue to stake and earn native Bitcoin yield with 15+ supported L1 assets."
      />

      {/* Misc */}
      <meta httpEquiv="X-UA-Compatible" content="IE=edge" />
      <meta charSet="UTF-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      <link rel="canonical" />
    </Head>
    <div className="overflow-x-hidden">
      <Hero />
      <Info />
      <HowDoesItWork />
      <Solution />
      <KeyComponents />
      <CTA />
    </div>
  </>
);

export default Home;
