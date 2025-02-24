import { LpSubstepsAddLiquidity } from "@/hooks/useLiquidityPosition";
import { WalletState } from "@/utils/interfaces";
import { Asset } from "@xchainjs/xchain-util";

export const getButtonText = (
  selectedWallet: WalletState,
  isValidAmount: boolean,
  isDisableDueTooSmallAmount: boolean,
  runeBalance: number,
  assetBalance: number,
  runeAmount: string,
  assetAmount: string,
) => {
  if (!selectedWallet?.address) {
    return "Connect Wallet";
  }

  if (!isValidAmount && assetAmount) {
    return "Invalid Amount";
  }

  if (isDisableDueTooSmallAmount) {
    return "Small amount";
  }

  // if (runeBalance < Number(runeAmount) || assetBalance < Number(assetAmount)) {
  //   return "Insufficient Balance";
  // }

  return "Add";
};

export const getSubsteps = (isDualSided: boolean, asset: Asset) => {
  const steps = [];

  if (asset.symbol.indexOf("-") !== -1) {
    // Not native
    steps.push(LpSubstepsAddLiquidity.APRROVE_DEPOSIT_ASSET);
  }

  steps.push(LpSubstepsAddLiquidity.BROADCAST_DEPOSIT_ASSET);

  if (isDualSided) {
    steps.push(LpSubstepsAddLiquidity.BROADCAST_DEPOSIT_RUNE);
  }

  return steps;
};
