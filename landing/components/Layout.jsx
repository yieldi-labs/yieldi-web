import Head from "next/head";
import Navbar from "@components/ui/Navbar";

const Layout = ({ children }) => {
  return (
    <>
      <Head>
        <title>Yieldi</title>
        <meta name="description" content="Yieldi" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <Navbar />
      {children}
    </>
  );
};

export default Layout;
