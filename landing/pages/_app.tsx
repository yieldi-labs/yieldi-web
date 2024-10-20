import "../styles/globals.css";
import { AppProps } from "next/app";
import { DefaultSeo } from "next-seo";
import SEO from "@/next-seo.config";
import { Layout } from "@/components/ui";

const MyApp = ({ Component, pageProps }: AppProps) => (
  <Layout>
    <DefaultSeo {...SEO} />
    <Component {...pageProps} />
  </Layout>
);

export default MyApp;
