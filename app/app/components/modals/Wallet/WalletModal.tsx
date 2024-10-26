"use client";
import { useState, useEffect, cloneElement } from "react";
import {
  detectWallets,
  filterWalletsByChain,
} from "@/utils/wallet/detectedWallets";
import {
  chainConfig,
  ChainConfig,
  WalletOption,
} from "@/utils/wallet/chainConfig";
import Modal from "@/app/modal";
import { useAppState } from "@/utils/context";
import { UIComponents } from "@shared/components";

export default function WalletModal() {
  const { toggleWalletModal, isWalletModalOpen, setWalletState } =
    useAppState();
  const [selectedChain, setSelectedChain] = useState<string | null>(null);
  const [detectedWallets, setDetectedWallets] = useState<WalletOption[]>([]);
  const [filteredWallets, setFilteredWallets] = useState<WalletOption[]>([]);
  const [selectedWallet, setSelectedWallet] = useState<WalletOption | null>(
    null
  );

  useEffect(() => {
    const wallets = detectWallets();
    setDetectedWallets(wallets);
  }, []);

  useEffect(() => {
    if (selectedChain) {
      const filtered = filterWalletsByChain(detectedWallets, selectedChain);
      setFilteredWallets(filtered);
    } else {
      setFilteredWallets([]);
    }
  }, [selectedChain, detectedWallets]);

  const handleConnect = async () => {
    if (!selectedWallet || !selectedWallet.connect) {
      console.error("No connection method available for this wallet.");
      return;
    }

    try {
      const connectedWallet = await selectedWallet.connect();
      setWalletState({
        provider: connectedWallet.provider,
        address: connectedWallet.address,
        network: selectedChain,
      });
    } catch (error) {
      console.error(`Error connecting to ${selectedWallet.name}:`, error);
    }
  };

  const isWalletSupported = (wallet: WalletOption) => {
    return !selectedChain || filteredWallets.some((w) => w.id === wallet.id);
  };

  return (
    <>
      {isWalletModalOpen && (
        <Modal onClose={toggleWalletModal} title="Connect Wallet">
          <div className="flex flex-col gap-4">
            <div className="flex flex-col gap-4">
              <h3 className="text-base text-neutral-900 font-medium font-gt-america">
                Select Chain
              </h3>
              <div className="flex gap-4">
                {chainConfig.map((chain) => (
                  <button
                    className={`border-[2px] rounded-2xl p-[0.5px] transition-all duration-75 ${
                      selectedChain === chain.id
                        ? "border-primary"
                        : "border-transparent"
                    }`}
                    key={chain.id}
                    onClick={() => setSelectedChain(chain.id)}
                  >
                    {cloneElement(chain.icon)}
                  </button>
                ))}
              </div>
            </div>
            <div className="flex flex-col gap-4">
              <h3 className="text-base text-neutral-900 font-medium font-gt-america">
                Select Wallet
              </h3>
              {detectedWallets.length > 0 && (
                <div>
                  <p className="font-gt-america font-medium text-[12px] text-neutral-600 mb-2">
                    Detected Wallets
                  </p>
                  <div className="flex flex-wrap gap-4">
                    {detectedWallets.map((detectedWallet) => {
                      const walletConfig = chainConfig
                        .flatMap((chain) => chain.wallets)
                        .find((w) => w.id === detectedWallet.id);

                      console.log(walletConfig);

                      if (!walletConfig) return null;

                      const wallet = {
                        ...detectedWallet,
                        icon: walletConfig.icon,
                      };

                      return (
                        <Wallet
                          key={wallet.id}
                          selectedWallet={selectedWallet}
                          wallet={wallet}
                          isSupported={isWalletSupported(wallet)}
                          setter={setSelectedWallet}
                        />
                      );
                    })}
                  </div>
                </div>
              )}
              <div>
                <p className="font-gt-america font-medium text-[12px] text-neutral-600 mb-2">
                  Other Wallets
                </p>
                <div className="flex flex-wrap gap-4">
                  {chainConfig
                    .flatMap((chain) => chain.wallets)
                    .filter(
                      (wallet, index, self) =>
                        index === self.findIndex((t) => t.id === wallet.id) &&
                        !detectedWallets.some((w) => w.id === wallet.id)
                    )
                    .map((wallet) => (
                      <Wallet
                        key={wallet.id}
                        selectedWallet={selectedWallet}
                        wallet={wallet}
                        isSupported={isWalletSupported(wallet)}
                        setter={setSelectedWallet}
                      />
                    ))}
                </div>
              </div>
            </div>
            {selectedWallet && (
              <div className="connect-btn-container mt-6">
                <UIComponents.Button
                  label={`Connect ${selectedWallet.name}`}
                  onClick={handleConnect}
                  className="w-full"
                  disabled={!isWalletSupported(selectedWallet)}
                />
              </div>
            )}
          </div>
        </Modal>
      )}
    </>
  );
}

const Wallet = ({
  selectedWallet,
  wallet,
  isSupported,
  setter,
}: {
  selectedWallet: WalletOption | null;
  wallet: WalletOption;
  isSupported: boolean;
  setter: (wallet: WalletOption) => void;
}) => (
  <button
    className={`bg-white p-[12px] flex gap-4 items-center border-[2px] rounded-2xl transition-all duration-75 ${
      selectedWallet?.id === wallet.id ? "border-primary" : "border-transparent"
    } ${isSupported ? "opacity-100" : "opacity-50"}`}
    onClick={() => setter(wallet)}
    disabled={!isSupported}
  >
    {cloneElement(wallet.icon, {
      className: "w-[40px] ",
    })}
    <span className="text-neutral-900 font-gt-america font-medium text-[14px]">
      {wallet.name}
    </span>
  </button>
);
