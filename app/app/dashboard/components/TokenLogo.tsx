import React from "react";
import Image from "next/image";
import { getAssetSymbol, getLogoPath, getNetworkLogoPath } from "@/app/utils";

interface TokenLogoProps {
  assetId: string;
}

export default function TokenLogo({ assetId }: TokenLogoProps) {
  return (
    <div className={`relative max-w-max w-[32px]`}>
      <Image
        src={getLogoPath(assetId.replace("/", "."))}
        alt={`${getAssetSymbol(assetId)} logo`}
        width={32}
        height={32}
        className="rounded-full"
      />
      {assetId.indexOf("-") !== -1 ? (
        <div className="absolute bottom-0 right-0">
          <Image
            src={getNetworkLogoPath(assetId.replace("/", "."))}
            alt={`${getAssetSymbol(assetId)} logo`}
            width={14}
            height={14}
          />
        </div>
      ) : (
        <></>
      )}
    </div>
  );
}
