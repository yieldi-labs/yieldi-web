"use client";
import React, {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useState,
} from "react";
import { usePositionStats } from "@/hooks/usePositionStats";
import { Positions, PositionType } from "@/hooks/dataTransformers/positionsTransformer";
import { PoolDetails } from "@/midgard";
import { useWalletConnection } from "@/hooks";

interface LiquidityPositionsContextType {
  positions: Positions | undefined;
  pools: PoolDetails | undefined;
  markPositionAsPending: (pooldId: string, type: PositionType) => void;
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
  const [addresses, setAddresses] = useState<string[]>([]);
  const { getAllNetworkAddressesFromLocalStorage } = useWalletConnection();

  useEffect(() => {
    setAddresses(getAllNetworkAddressesFromLocalStorage());
  }, [getAllNetworkAddressesFromLocalStorage]);

  const { positions, pools, markPositionAsPending, isPending, error } =
    usePositionStats({ addresses });

  return (
    <LiquidityPositionsContext.Provider
      value={{
        positions,
        pools,
        markPositionAsPending,
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
