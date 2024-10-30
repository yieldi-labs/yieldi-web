import { metadata } from "@/utils";
import { Providers } from "./providers";
import WalletButton from "./WalletButton";
import { lpGradientCircles } from "@shared/utils";
import { UIComponents, CommonComponents } from "@shared/components";
import { AppStateProvider } from "@/utils/context";
import WalletModal from "./components/modals/Wallet/WalletModal";

import "./styles/globals.css";

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body className="relative">
        <Providers>
          <AppStateProvider>
            <UIComponents.Navbar
              links={[
                { label: "explore", href: "/explore" },
                { label: "points", href: "/points" },
              ]}
              buttons={[{ component: <WalletButton /> }]}
            />
            <div className="max-w-5xl mx-auto p-4 mt-[130px]">{children}</div>
            <WalletModal />
          </AppStateProvider>
        </Providers>
        <CommonComponents.GradientCircles circles={lpGradientCircles} fixed />
      </body>
    </html>
  );
}

export { metadata };

export const generateViewport = () => {
  return "width=device-width, initial-scale=1";
};
