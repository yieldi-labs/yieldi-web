import { cloneElement } from "react";
import { UIComponents } from "@shared/components";

interface ChainSelectorProps {
  chains: ChainConfig[];
  selectedChains: string[]; 
  onChainSelect: (chainIds: string[]) => void; 
}

export function ChainSelector({
  chains,
  selectedChains,
  onChainSelect,
}: ChainSelectorProps) {
  const handleSelect = (chainId: string) => {
    if (selectedChains.includes(chainId)) {
      onChainSelect(selectedChains.filter((id) => id !== chainId));
    } else {
      onChainSelect([...selectedChains, chainId]);
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
              selectedChains.includes(chain.id)
                ? "border-primary"
                : "border-transparent"
            }`}
            key={chain.id}
            onClick={() => handleSelect(chain.id)}
          >
            <UIComponents.Tooltip text={chain.name}>
              {cloneElement(chain.icon)}
            </UIComponents.Tooltip>
          </button>
        ))}
      </div>
    </div>
  );
}
