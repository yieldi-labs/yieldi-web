"use client";
import React, { createContext, ReactNode, useContext } from "react";
import { usePositionStats } from "@/hooks/usePositionStats";
import {
  Positions,
  PositionStatus,
  PositionType,
} from "@/utils/lp-monitor/parsePositions";
import { PoolDetails } from "@/midgard";
interface LiquidityPositionsContextType {
  positions: Positions | undefined;
  pools: PoolDetails | undefined;
  markPositionAsPending: (
    pooldId: string,
    type: PositionType,
    status: PositionStatus,
  ) => void;
  cleanPositions: () => void;
  isPending: boolean;
  error: Error | null;
}

const LiquidityPositionsContext = createContext<
  LiquidityPositionsContextType | undefined
>(undefined);

export const LiquidityPositionsProvider = ({
  children,
}: {
  children: ReactNode;
}) => {
  const {
    positions,
    pools,
    markPositionAsPending,
    isPending,
    error,
    cleanPositions,
  } = usePositionStats({});

  return (
    <LiquidityPositionsContext.Provider
      value={{
        positions,
        pools,
        markPositionAsPending,
        cleanPositions,
        isPending,
        error,
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
