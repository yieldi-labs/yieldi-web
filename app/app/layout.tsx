import { metadata } from "@/utils";
import { Providers } from "./providers";
import WalletButton from "./WalletButton";
import { lpGradientCircles } from "@shared/utils";
import { UIComponents, CommonComponents } from "@shared/components";
import { AppStateProvider } from "@/utils/context";
import WalletModal from "./components/modals/Wallet/WalletModal";

import "./styles/globals.css";
import WalletDrawer from "./components/wallet-drawer";
import { LiquidityPositionsProvider } from "@/utils/PositionsContext";

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body className="relative">
        <Providers>
          <AppStateProvider>
            <LiquidityPositionsProvider>
              <UIComponents.Navbar
                links={[
                  { label: "explore", href: "/explore" },
                  { label: "dashboard", href: "/dashboard" },
                ]}
                buttons={[{ component: <WalletButton /> }]}
              />
              <div className="p-4 mt-[100px] md:mt-[130px]">{children}</div>
              <WalletModal />
              <WalletDrawer />
            </LiquidityPositionsProvider>
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
