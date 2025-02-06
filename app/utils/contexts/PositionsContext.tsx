"use client";
import React, { createContext, ReactNode, useContext } from "react";
import { usePositionStats } from "@/hooks/usePositionStats";
import {
  Positions,
  PositionStatus,
  PositionType,
} from "@/utils/lp-monitor/parsePositions";
import { useAppState } from "./context";

interface LiquidityPositionsContextType {
  positions: Positions | undefined;
  markPositionAsPending: (
    pooldId: string,
    type: PositionType,
    status: PositionStatus,
  ) => void;
  cleanPositions: () => void;
  isPending: boolean;
  positionsError: Error | null;
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

  const { positions, markPositionAsPending, isPending, error, cleanPositions } =
    usePositionStats({
      walletsState,
      mimirParameters,
      poolsData,
    });

  return (
    <LiquidityPositionsContext.Provider
      value={{
        positions,
        markPositionAsPending,
        cleanPositions,
        isPending,
        positionsError: error,
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
