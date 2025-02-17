"use client";
import React, { createContext, ReactNode, useContext } from "react";
import { usePositionStats } from "@/hooks/usePositionStats";
import {
  Positions,
  PositionStatus,
  PositionType,
} from "@/utils/lp-monitor/parsePositions";
import { useAppState } from "./context";
import { ethers } from "ethers";
import { getChainsConnected } from "../chain";

interface LiquidityPositionsContextType {
  positions: Positions | undefined;
  markPositionAsPending: (
    pooldId: string,
    type: PositionType,
    status: PositionStatus
  ) => void;
  cleanPositions: () => void;
  isPending: boolean;
  isRefetching: boolean;
  positionsError: Error | null;
  refresh: () => void;
}

const LiquidityPositionsContext = createContext<
  LiquidityPositionsContextType | undefined
>(undefined);

export const LiquidityPositionsProvider = ({
  children,
}: {
  children: ReactNode;
}) => {
  const { walletsState, mimirParameters, poolsData } = useAppState();

  const addresses = new Set<string>();

  for (const key in walletsState) {
    if (walletsState?.hasOwnProperty(key)) {
      const address = walletsState[key]?.address;
      if (ethers.utils.isAddress(address)) {
        const checksummedAddress = ethers.utils.getAddress(address);
        addresses.add(checksummedAddress);
      } else {
        addresses.add(address);
      }
    }
  }

  console.log('addresses', addresses)

  const {
    positions,
    markPositionAsPending,
    isPending,
    isRefetching,
    error,
    resetPositions,
    fetchPositions: refresh
  } = usePositionStats({
    mimirParameters,
    poolsData,
    addresses: Array.from(addresses),
    filterByChains: getChainsConnected(walletsState),
    ensureBothAddressConnectedOnDlp: true
  });


  return (
    <LiquidityPositionsContext.Provider
      value={{
        positions,
        markPositionAsPending,
        cleanPositions: resetPositions,
        isPending,
        isRefetching,
        positionsError: error,
        refresh
      }}
    >
      {children}
    </LiquidityPositionsContext.Provider>
  );
};

export const useLiquidityPositions = () => {
  const context = useContext(LiquidityPositionsContext);
  if (!context) {
    throw new Error(
      "useLiquidityPositions must be used within a LiquidityPositionsProvider"
    );
  }
  return context;
};
