import type { Metadata } from "next";
import "./globals.css";
import Navbar from "./navbar";
import BlurredCircle from "./blurredCircle";
import { Providers } from "./providers";
import '@rainbow-me/rainbowkit/styles.css';

export const metadata: Metadata = {
  title: "Yieldi",
  description: "Earn yield on native assets",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <head>
        <link rel="shortcut icon" href="/favicon.png" />
      </head>
      <body>
        <div className={`fixed bottom-0 right-0 translate-x-[20%] translate-y-[20%]`}>
          <BlurredCircle size={594} color="yellow" />
        </div>
        <div className={`fixed top-[10px] left-0 translate-x-[-20%] translate-y-[-20%]`}>
          <BlurredCircle size={594} color="#A799FE" />
        </div>
        <div className={`fixed bottom-[-297px] left-0 translate-x-[-20%] translate-y-[-20%]`}>
          <BlurredCircle size={594} color="#FF6656" />
        </div>
        <div className={`fixed top-[-20px] right-[50px] translate-x-[-20%] translate-y-[-20%]`}>
          <BlurredCircle size={594} color="#007D98" />
        </div>
        <div className={`fixed top-[-20px] right-0 translate-x-[40%] translate-y-[-20%]`}>
          <BlurredCircle size={594} color="#A1FD59" />
        </div>
        <Providers>
          <Navbar />
          <div className="max-w-5xl mx-auto py-4">{children}</div>
        </Providers>
      </body>
    </html>
  );
}