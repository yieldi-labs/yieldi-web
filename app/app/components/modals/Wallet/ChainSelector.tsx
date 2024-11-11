import { UIComponents } from "@shared/components";
import { cloneElement } from "react";

import { Button } from "../../../../../shared/components/ui";

interface ChainSelectorProps {
  chains: ChainConfig[];
  selectedChain: string[];
  onChainSelect: (chainId: string) => void;
  handleDeselect: () => void;
}

export function ChainSelector({
  chains,
  selectedChain,
  onChainSelect,
  handleDeselect,
}: ChainSelectorProps) {
  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h3 className="text-base text-neutral-900 font-medium font-gt-america">
          Select Chain
        </h3>
        <Button
          label={selectedChain.length !== 9 ? "select" : "deselect all"}
          className="text-xs py-1.5 px-3"
          onClick={handleDeselect}
        />
      </div>
      <div className="flex flex-wrap gap-4 w-full bg-white rounded-2xl p-3">
        {chains.map((chain) => (
          <button
            className={`flex items-center justify-center border-[3px] rounded-2xl p-[1px] transition-all duration-75 ${
              selectedChain.includes(chain.id)
                ? "border-primary"
                : "border-transparent"
            }`}
            key={chain.id}
            onClick={() => onChainSelect(chain.id)}
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
