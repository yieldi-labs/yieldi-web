import { Html, Head, Main, NextScript } from "next/document";

export default function Document() {
  return (
    <Html className="scroll-smooth" lang="en">
      <Head />
      <body className='lg:overflow-visible bg-[url("/background.jpg")] body font-gt-america'>
        <Main />
        <NextScript />
      </body>
    </Html>
  );
}
