import { useState, useCallback, useEffect } from "react";
import { Balance, getBalance } from "@/midgard";
import { WalletState } from "./useWalletConnection";

interface UseRuneBalanceProps {
  wallet: WalletState | null;
  pollingInterval?: number;
}

export const useRuneBalance = ({
  wallet,
  pollingInterval = 10000,
}: UseRuneBalanceProps) => {
  const [runeBalance, setRuneBalance] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const getRuneBalance = useCallback(async () => {
    if (!wallet?.address) return;
    try {
      const { data: runeBalance } = await getBalance({
        path: {
          address: wallet.address,
        },
      });
      return runeBalance;
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to fetch RUNE balance",
      );
      return undefined;
    }
  }, [wallet]);

  useEffect(() => {
    const fetchRuneBalance = async () => {
      setLoading(true);
      try {
        const balance: Balance | undefined = await getRuneBalance();
        const amountStr: string = balance?.coins[0]?.amount || "0";
        setRuneBalance(parseInt(amountStr));
        setError(null);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Failed to fetch RUNE balance",
        );
      } finally {
        setLoading(false);
      }
    };

    fetchRuneBalance();
    const intervalId = setInterval(fetchRuneBalance, pollingInterval);
    return () => clearInterval(intervalId);
  }, [getRuneBalance, pollingInterval]);

  return {
    runeBalance,
    loading,
    error,
    refetch: getRuneBalance,
  };
};