import {
  CTA,
  Hero,
  Info,
  Solution,
  HowDoesItWork,
  KeyComponents,
} from "@/components/common";

const Home = () => (
  <div className="overflow-x-hidden">
    <Hero />
    <Info />
    <HowDoesItWork />
    <Solution />
    <KeyComponents />
    <CTA />
  </div>
);

export default Home;
