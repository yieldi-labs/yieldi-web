import { TokenData } from "@/utils/interfaces";
import React from "react";
import Image from "next/image";
import { formatNumber, getAssetSymbol, getLogoPath } from "@/app/utils";
import Loader from "../Loader";
import { assetFromString } from "@xchainjs/xchain-util";

interface BalanceRowProps {
  token: TokenData;
  isLoading: boolean;
  isHidden: boolean;
}

export default function BalanceRow({
  token,
  isLoading,
  isHidden,
}: BalanceRowProps) {
  const asset = assetFromString(token.asset);
  return (
    <div className="px-2 py-4">
      <div className="flex gap-2 items-center">
        <Image
          src={getLogoPath(token.asset)}
          alt={`${getAssetSymbol(token.asset)} logo`}
          width={26}
          height={26}
          className="rounded-full"
        />
        <div className="flex flex-1 flex-col">
          <span className="font-bold leading-5">{asset?.ticker}</span>
          <span className="leading-4 text-gray-500">{asset?.chain}</span>
        </div>
        {isLoading ? (
          <Loader sizeInPixels={4} />
        ) : isHidden ? (
          <span className="font-bold">***</span>
        ) : (
          <span className="font-bold">
            {token.balance > 0
              ? formatNumber(token.balance, 6)
              : formatNumber(token.formattedBalance!, 6)}
          </span>
        )}
      </div>
    </div>
  );
}
