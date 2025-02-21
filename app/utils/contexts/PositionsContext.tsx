"use client";
import React, { createContext, ReactNode, useContext } from "react";
import { usePositionStats } from "@/hooks/usePositionStats";
import {
  Positions,
  PositionStatus,
  PositionType,
} from "@/utils/lp-monitor/parsePositions";
import { useAppState } from "./context";
import { getChainsConnected } from "../chain";
import { generateEmptyAddressObject } from "../wallet/utils";
import { CHAINS } from "../wallet/constants";

interface LiquidityPositionsContextType {
  positions: Positions | undefined;
  markPositionAsPending: (
    pooldId: string,
    type: PositionType,
    status: PositionStatus,
  ) => void;
  cleanPositions: () => void;
  isPending: boolean;
  isRefetching: boolean;
  positionsError: Error | null;
  fetchPositions: () => void;
  refetch: () => void;
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

  const addressesByChain = generateEmptyAddressObject();
  for (const key in walletsState) {
    const chainInfo = CHAINS.find((chain) => chain.name === key)
    if (!chainInfo) {
      throw Error(`Chain not found for chain: ${key}`);
    }
    if (walletsState?.hasOwnProperty(key)) {
      const address = walletsState[key]?.address;
      addressesByChain[chainInfo.thorchainIdentifier] = address;
    }
    // TODO: Restore checksum logic
    // if (walletsState?.hasOwnProperty(key)) {
    //   const address = wchainInfoalletsState[key]?.address;
    //   if (ethers.utils.isAddress(address)) {
    //     const checksummedAddress = ethers.utils.getAddress(address);
    //     addresses.add(checksummedAddress);
    //   } else {
    //     addresses.add(address);
    //   }
    // }
  }

  const {
    positions,
    markPositionAsPending,
    isPending,
    isRefetching,
    error,
    resetPositions,
    fetchPositions,
    refetch,
  } = usePositionStats({
    mimirParameters,
    poolsData,
    addressesByChain,
    filterByChains: getChainsConnected(walletsState),
    ensureBothAddressConnectedOnDlp: true,
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
        fetchPositions,
        refetch,
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
      "useLiquidityPositions must be used within a LiquidityPositionsProvider",
    );
  }
  return context;
};
