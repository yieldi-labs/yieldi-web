import Modal from "@/app/modal";
import { getLogoPath } from "@/app/utils";
import { MemberPool, PoolDetail } from "@/midgard";
import {
  PositionStats,
  PositionStatus,
  PositionType,
} from "@/utils/lp-monitor/parsePositions";
import { assetFromString } from "@xchainjs/xchain-util";
import React from "react";
import Image from "next/image";

const positionExample: PositionStats = {
  assetId: "BTC.BTC",
  status: PositionStatus.LP_POSITION_COMPLETE,
  type: PositionType.SYM,
  deposit: {
    usd: 0,
    totalInAsset: 0,
    assetAdded: 0,
    runeAdded: 0,
  },
  gain: {
    usd: 0,
    asset: 0,
    percentage: "0",
  },
  pendingActions: [],
  liquidityLockUpRemainingInSeconds: 0,
  pool: {} as PoolDetail,
  memberDetails: {} as MemberPool,
};

export default function StatusModal({
  position = positionExample,
  nextStep
}: {
  position?: PositionStats;
  isOpen: boolean;
  onClose: () => void;
  nextStep: () => void;
}) {

  const asset = assetFromString(position.assetId);

  if (!asset) {
    throw Error("Invalid asset");
  }

  const logoAsset = getLogoPath(position.assetId);
  const logoRune = getLogoPath("THOR.RUNE");

  return (
    <>
      <div className="max-w-[520px]">
        <div className="px-6">
          <div className="flex justify-between items-center mb-6">
            <span className="text-gray-600 font-medium">Deposit</span>
            <span className="text-gray-900 font-semibold text-lg">$20,000</span>
          </div>

          <div className="flex items-center justify-between mb-6">
            <span className="block text-gray-600 font-medium mb-3">Tokens</span>
            <div className="flex items-center gap-6">
              <div>
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8">
                    <Image
                      src={logoAsset}
                      alt={`${asset.symbol} logo`}
                      width={32}
                      height={32}
                      className="rounded-full"
                    />
                  </div>
                  <div>
                    <span className="block font-medium text-gray-900">{asset.symbol.toUpperCase()}</span>
                  </div>
                </div>
                <span className="text-sm text-gray-500">1.2345 ($10,000)</span>
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8">
                    <Image
                      src={logoRune}
                      alt={`${asset.symbol} logo`}
                      width={32}
                      height={32}
                      className="rounded-full"
                    />
                  </div>
                  <div>
                    <span className="block font-medium text-gray-900">
                      RUNE
                    </span>
                  </div>
                </div>
                <span className="text-sm text-gray-500">1.2345 ($10,000)</span>
              </div>
            </div>
          </div>

          <div className="space-y-4 mb-6">
            {[
              "Please Approve BTC",
              "Please Sign BTC Transaction",
              "Please Approve RUNE",
              "Please Sign RUNE Transaction",
            ].map((status, index) => (
              <div key={index} className="flex items-center gap-4">
                <div className="w-[40px] h-[40px] bg-gray-200 rounded-full"></div>
                <span className="text-gray-700 text-sm">{status}</span>
              </div>
            ))}
          </div>
        </div>
        
        {/* Temp button  */}
        <button onClick={nextStep} className="btn btn-primary">
          Continue
        </button>

        <div className="text-sm text-gray-500 text-center">
          You will be prompted to confirm a BTC transaction on your BTC wallet.
          Ensure your wallet is connected and has sufficient funds for this
          transaction.
        </div>
      </div>
    </>
  );
}
