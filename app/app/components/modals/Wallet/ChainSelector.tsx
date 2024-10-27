import { cloneElement } from "react";

interface ChainSelectorProps {
  chains: ChainConfig[];
  selectedChain: string | null;
  onChainSelect: (chainId: string) => void;
}

export function ChainSelector({
  chains,
  selectedChain,
  onChainSelect,
}: ChainSelectorProps) {
  return (
    <div className="flex flex-col gap-4">
      <h3 className="text-base text-neutral-900 font-medium font-gt-america">
        Select Chain
      </h3>
      <div className="flex gap-4">
        {chains.map((chain) => (
          <button
            className={`border-[2px] rounded-2xl p-[0.5px] transition-all duration-75 ${
              selectedChain === chain.id
                ? "border-primary"
                : "border-transparent"
            }`}
            key={chain.id}
            onClick={() => onChainSelect(chain.id)}
          >
            {cloneElement(chain.icon)}
          </button>
        ))}
      </div>
    </div>
  );
}
