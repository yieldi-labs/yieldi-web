import React from "react";
import Image from "next/image";
import { getAssetSymbol, getLogoPath } from "@/app/utils";
import { getChainFromAssetId } from "@/utils/chain";

interface TokenLogoProps {
  assetId: string;
}

export default function TokenLogo({ assetId }: TokenLogoProps) {
  const chain = getChainFromAssetId(assetId);
  return (
    <div className="relative max-w-max w-[32px]">
      <Image
        src={getLogoPath(assetId.replace("/", "."))}
        alt={`${getAssetSymbol(assetId)} logo`}
        width={32}
        height={32}
        className="rounded-full"
      />
      {assetId.indexOf("-") !== -1 || chain.nativeAsset === '-' ? (
        <div className="absolute bottom-0 right-0">
          <chain.icon width={16} height={16} />
        </div>
      ) : (
        <></>
      )}
    </div>
  );
}
