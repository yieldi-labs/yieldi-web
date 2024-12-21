import { cloneElement } from "react";
import { UIComponents } from "@shared/components";
import { ChainType } from "@/utils/interfaces";
import React from "react";
import { useAppState } from "@/utils/context";
import { isChainSupportedByWallet } from "@/utils/wallet/utils";

interface ChainSelectorProps {
  chains: ChainType[];
  selectedChains: ChainType[];
  onChainSelect: (chains: ChainType[]) => void;
  blockUnselect: boolean;
}

export function ChainSelector({
  chains,
  onChainSelect,
  blockUnselect = false,
}: ChainSelectorProps) {
  const { selectedChains, selectedWallet } = useAppState();
  const handleSelect = (chainKey: ChainType) => {
    if (selectedChains.includes(chainKey)) {
      onChainSelect(selectedChains.filter((chain) => chain !== chainKey));
    } else {
      onChainSelect([...selectedChains, chainKey]);
    }
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h3 className="text-base text-neutral-900 font-medium font-gt-america">
          Select Chains
        </h3>
      </div>
      <div className="flex flex-wrap gap-4 w-full bg-white rounded-2xl p-3">
        {chains.map((chain) => (
          <button
            className={`flex items-center justify-center border-[3px] rounded-2xl p-[1px] transition-all duration-75 ${
              selectedChains.includes(chain)
                ? "border-primary"
                : "border-transparent"
            }  ${
              isChainSupportedByWallet(chain, selectedWallet) && !blockUnselect
                ? "opacity-100 cursor-pointer"
                : "opacity-50 cursor-not-allowed "
            }`}
            key={chain.name}
            onClick={() =>
              isChainSupportedByWallet(chain, selectedWallet) &&
              !blockUnselect &&
              handleSelect(chain)
            }
            disabled={
              !isChainSupportedByWallet(chain, selectedWallet) && !blockUnselect
            }
          >
            <UIComponents.Tooltip text={chain.name}>
              {React.isValidElement(chain.icon)
                ? cloneElement(chain.icon)
                : null}
            </UIComponents.Tooltip>
          </button>
        ))}
      </div>
    </div>
  );
}
