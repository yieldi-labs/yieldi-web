import { metadata } from "@/utils";
import { Providers } from "./providers";
import WalletButton from "./WalletButton";
import { lpGradientCircles } from "@shared/utils";
import { UIComponents, CommonComponents } from "@shared/components";
import { AppStateProvider } from "@/utils/contexts/context";
import WalletModal from "./components/modals/Wallet/WalletModal";

import "./styles/globals.css";
import { LiquidityPositionsProvider } from "@/utils/contexts/PositionsContext";
import WalletDrawer from "./components/wallet-drawer";

import { ToastContainer } from "react-toastify";

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
              <WalletDrawer />
              <div className="p-4 mt-[100px] md:mt-[130px]">{children}</div>
              <WalletModal />
            </LiquidityPositionsProvider>
          </AppStateProvider>
        </Providers>
        <CommonComponents.GradientCircles circles={lpGradientCircles} fixed />
        <ToastContainer />
        <div id="modal-root" />
      </body>
    </html>
  );
}

export { metadata };

export const generateViewport = () => {
  return "width=device-width, initial-scale=1";
};
