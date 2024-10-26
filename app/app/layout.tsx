import type { Metadata } from "next";
import WalletButton from "./WalletButton";
import { Providers } from "./providers";
import { UIComponents, CommonComponents } from "@shared/components";
import "./globals.css";
import "@rainbow-me/rainbowkit/styles.css";

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
        <div
          className={`fixed bottom-0 right-0 translate-x-[20%] translate-y-[20%]`}
        >
          <CommonComponents.BlurredCircle size={594} color="yellow" />
        </div>
        <div
          className={`fixed top-[10px] left-0 translate-x-[-20%] translate-y-[-20%]`}
        >
          <CommonComponents.BlurredCircle size={594} color="#A799FE" />
        </div>
        <div
          className={`fixed bottom-[-297px] left-0 translate-x-[-20%] translate-y-[-20%]`}
        >
          <CommonComponents.BlurredCircle size={594} color="#FF6656" />
        </div>
        <div
          className={`fixed top-[-20px] right-[50px] translate-x-[-20%] translate-y-[-20%]`}
        >
          <CommonComponents.BlurredCircle size={594} color="#007D98" />
        </div>
        <div
          className={`fixed top-[-20px] right-0 translate-x-[40%] translate-y-[-20%]`}
        >
          <CommonComponents.BlurredCircle size={594} color="#A1FD59" />
        </div>
        <Providers>
          <UIComponents.Navbar
            links={[
              { label: "explore", href: "/explore" },
            ]}
            // buttons={[{ component: <WalletButton /> }]}
          />
          <div className="mx-auto p-4 mt-[130px]">{children}</div>
        </Providers>
      </body>
    </html>
  );
}
