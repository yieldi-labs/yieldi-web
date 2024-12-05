import { useState } from "react";
import Eth from "@ledgerhq/hw-app-eth";
import Btc from "@ledgerhq/hw-app-btc";
import Cosmos from "@ledgerhq/hw-app-cosmos";
import TransportWebUSB from "@ledgerhq/hw-transport-webusb";
import { IconSvg, WalletSvg } from "@/svg";
import { useAppState } from "@/utils/context";
import { ChainType } from "@/utils/interfaces";
import { ChainKey } from "@/utils/wallet/constants";

interface HardwareWalletsProps {
  onBack: () => void;
  onWalletSelect: (wallet: any) => void;
  selectedChains: ChainType[];
  isDisabled: boolean;
}

export default function HardwareWallets({
  onBack,
  onWalletSelect,
  selectedChains,
  isDisabled,
}: HardwareWalletsProps) {
  const [isConnecting, setIsConnecting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { toggleWalletModal } = useAppState();

  const connectLedger = async (chain: ChainKey) => {
    try {
      setIsConnecting(true);
      setError(null);

      const transport = await TransportWebUSB.create();
      let address: string;
      switch (chain) {
        case ChainKey.AVALANCHE:
        case ChainKey.ETHEREUM: {
          const eth = new Eth(transport);
          const result = await eth.getAddress("44'/60'/0'/0/0");
          address = result.address;
          break;
        }

        case ChainKey.BITCOIN: {
          const btc = new Btc({ transport });
          const { bitcoinAddress } =
            await btc.getWalletPublicKey("44'/0'/0'/0/0");
          address = bitcoinAddress;
          break;
        }

        case ChainKey.LITECOIN: {
          const ltc = new Btc({ transport });
          const { bitcoinAddress } =
            await ltc.getWalletPublicKey("44'/2'/0'/0/0");
          address = bitcoinAddress;
          break;
        }

        case ChainKey.THORCHAIN: {
          const cosmos = new Cosmos(transport);
          const { address: thorchainAddress } = await cosmos.getAddress(
            "44'/931'/0'/0/0",
            "thor",
          );
          address = thorchainAddress;
          break;
        }

        case ChainKey.BITCOINCASH: {
          const bch = new Btc({ transport });
          const { bitcoinAddress } =
            await bch.getWalletPublicKey("44'/145'/0'/0/0");
          address = bitcoinAddress;
          break;
        }

        case ChainKey.DOGECOIN: {
          const doge = new Btc({ transport });
          const { bitcoinAddress } =
            await doge.getWalletPublicKey("44'/3'/0'/0/0");
          address = bitcoinAddress;
          break;
        }

        default: {
          throw new Error(`Unsupported chain: ${chain}`);
        }
      }

      if (!address) {
        throw new Error(`No address received from Ledger for ${chain}`);
      }

      onWalletSelect({
        provider: transport,
        address,
        chain,
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
        {selectedChains.map((chain) => (
          <button
            key={chain.name}
            onClick={() => connectLedger(chain.name)}
            disabled={isConnecting || isDisabled}
            className={` 
              bg-white p-[12px] flex gap-4 border-[2px] rounded-2xl 
              transition-all duration-75 min-h-[58px]
              border-transparent hover:border-primary
              disabled:opacity-50 disabled:cursor-not-allowed
              ${isDisabled ? "opacity-50 cursor-not-allowed" : ""}
            `}
          >
            <WalletSvg.Ledger className="w-[30px]" />
            <span>
              {isConnecting ? "Connecting..." : `Ledger (${chain.name})`}
            </span>
          </button>
        ))}
      </div>

      {error && <p className="text-red text-sm mt-2">{error}</p>}
    </div>
  );
}
