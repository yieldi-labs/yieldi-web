import { useState } from "react";
import Eth from "@ledgerhq/hw-app-eth";
import Btc from "@ledgerhq/hw-app-btc";
import TransportWebUSB from "@ledgerhq/hw-transport-webusb";
import { IconSvg, WalletSvg } from "@/svg";
import { useAppState } from "@/utils/context";

interface HardwareWalletsProps {
  onBack: () => void;
  onWalletSelect: (wallet: any) => void;
  selectedChain: string | null;
  isDisabled: boolean;
}

export default function HardwareWallets({
  onBack,
  onWalletSelect,
  selectedChain,
  isDisabled,
}: HardwareWalletsProps) {
  const [isConnecting, setIsConnecting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { toggleWalletModal } = useAppState();

  const connectLedger = async () => {
    try {
      setIsConnecting(true);
      setError(null);

      const transport = await TransportWebUSB.create();

      let address: string;
      if (selectedChain === "ethereum") {
        const eth = new Eth(transport);
        const result = await eth.getAddress("44'/60'/0'/0/0");
        address = result.address;
      } else {
        const btc = new Btc({ transport });
        const { bitcoinAddress } =
          await btc.getWalletPublicKey("44'/0'/0'/0/0");
        address = bitcoinAddress;
      }

      if (!address) {
        throw new Error(`No address received from Ledger for ${selectedChain}`);
      }

      onWalletSelect({
        provider: transport,
        address,
      });

      await transport.close();
      toggleWalletModal();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to connect Ledger");
    } finally {
      setIsConnecting(false);
    }
  };

  return (
    <div className="flex flex-col gap-4">
      <button
        onClick={onBack}
        className="flex items-center gap-2 text-neutral-900 font-medium"
      >
        <IconSvg.ChevronLeft />
        Hardware Wallets
      </button>

      <div className="grid grid-cols-2 gap-4">
        <button
          onClick={connectLedger}
          disabled={isConnecting}
          className={`
            bg-white p-[12px] flex gap-4 border-[2px] rounded-2xl 
            transition-all duration-75 min-h-[58px]
            border-transparent hover:border-primary
            disabled:opacity-50 disabled:cursor-not-allowed
            ${isDisabled ? "opacity-50 cursor-not-allowed" : ""}
          `}
        >
          <WalletSvg.Ledger className="w-[30px]" />
          <span>{isConnecting ? "Connecting..." : `Ledger`}</span>
        </button>
      </div>

      {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
    </div>
  );
}
