import {
  ChainKey,
  CHAINS,
  SUPPORTED_WALLETS,
  ThorchainIdentifiers,
  WalletKey,
} from "./wallet/constants";
import { ChainInfo, ChainType, ConnectedWalletsState } from "./interfaces";
import { InboundAddress, InboundAddressesResponse } from "@/thornode";
import {
  AnyAsset,
  assetFromString,
  baseAmount,
  baseToAsset,
} from "@xchainjs/xchain-util";

/**
 * Validate inbound address for liquidity operations
 */
export const validateInboundAddress = (inbound: InboundAddress) => {
  if (!inbound.router && !inbound.address) {
    throw new Error("Inbound address not found");
  }

  if (inbound.halted) {
    throw new Error("Network is halted");
  }

  if (inbound.chain_lp_actions_paused) {
    throw new Error("LP actions are paused for this chain");
  }
};

/**
 * Switch EVM chain if necessary
 */
export const switchEvmChain = async (
  wallet: { walletId: WalletKey; provider: any },
  targetChain: string,
): Promise<void> => {
  const selectedWallet = SUPPORTED_WALLETS[wallet.walletId];

  if (!selectedWallet.hasSupportMultichain) {
    return;
  }

  let currentChainId = null;

  try {
    currentChainId = await wallet.provider.request({
      method: "eth_chainId",
    });
  } catch (e) {
    console.error(e);
  }

  const targetChainInfo = CHAINS.find(
    (chain) => chain.chainId?.toLowerCase() === targetChain.toLowerCase(),
  );
  const targetChainId = targetChainInfo?.chainId;

  if (!targetChainId) {
    throw new Error(`Unsupported chain: ${targetChain}`);
  }

  try {
    if (currentChainId !== targetChainInfo?.chainId) {
      await wallet.provider.request({
        method: "wallet_switchEthereumChain",
        params: [{ chainId: targetChainId }],
      });
    }
  } catch (e) {
    if ((e as { code: number }).code === 4902) {
      if (!targetChainInfo.addChainRequestPayload) {
        throw new Error("Chain not supported. Add it manually");
      }

      await wallet.provider.request({
        method: "wallet_addEthereumChain",
        params: [targetChainInfo.addChainRequestPayload],
      });
    }
  }
};

/**
 * Get supported chain by asset chain
 */
export const getChainInfoFromChainString = (
  assetChain: string,
): ChainInfo | undefined => {
  const chain = CHAINS.find(
    (c) => assetChain.toLowerCase() === c.thorchainIdentifier.toLowerCase(),
  );
  if (!chain) {
    throw new Error(`Chain not found for assetId: ${assetChain}`);
  }
  return chain;
};

/**
 * Given the assetChain string, checks whether it's a supported chain.
 *
 * @param assetChain string, the chain to check if it's supported e.g: "ETH, "BNB", "BTC"
 * @returns boolean, true if it's a supported chain, false otherwise
 */
export const isSupportedChain = (assetChain: string): boolean => {
  return !!getChainInfoFromChainString(assetChain);
};

/**
 * Get minimum amount by chain
 */
export const getMinAmountByChain = (
  chain: ThorchainIdentifiers,
  decimals: number,
  inboundAddressesResponse?: InboundAddressesResponse,
): number => {
  const inbound = inboundAddressesResponse?.find(
    (inbound) => inbound.chain?.toLowerCase() === chain.toLowerCase(),
  );
  if (!inbound) {
    return 0; // For RUNE
  }
  const dustBaseAmount = baseAmount(Number(inbound.dust_threshold) + 1, decimals);
  const dustAssetAmount = baseToAsset(dustBaseAmount).amount().toNumber();
  return dustAssetAmount;
};

/**
 * Generate liquidity memo string
 */
export const getLiquidityMemo = (
  type: "add" | "remove",
  asset: string,
  pairedAddr: string = "",
  affiliate: string = "",
  feeBps: number = 0,
  percentage?: number,
  withdrawAsset?: string,
): string => {
  if (type === "add") {
    if (pairedAddr) {
      // Dual-sided add liquidity with optional affiliate and fee
      return `+:${asset}:${pairedAddr}:${affiliate}:${feeBps}`;
    }
    // Single-sided add liquidity
    return `+:${asset}::${affiliate}:${feeBps}`;
  }

  if (type === "remove") {
    const basisPoints = percentage ? Math.round(percentage * 100) : 0;
    if (basisPoints < 0 || basisPoints > 10000) {
      throw new Error("Percentage must be between 0 and 100");
    }
    // Single-sided or dual-sided remove liquidity
    return withdrawAsset
      ? `-:${asset}:${basisPoints}:${withdrawAsset}` // Single-sided
      : `-:${asset}:${basisPoints}`; // Dual-sided
  }

  throw new Error("Invalid liquidity operation type");
};

export const getChainKeyFromChain = (chain: string): ChainKey => {
  const chainInfo = CHAINS.find(
    (c) => c.thorchainIdentifier.toLowerCase() === chain.toLowerCase(),
  );
  if (!chainInfo) {
    throw new Error(`Chain not found for chain: ${chain}`);
  }
  return chainInfo.name;
};

export const isChainType = (
  type: ChainType,
  asset: AnyAsset,
): ThorchainIdentifiers | null => {
  const chain = CHAINS.find(
    (c) =>
      c.thorchainIdentifier.toLowerCase() === asset.chain.toLowerCase() &&
      c.type === type,
  );
  return chain ? chain.thorchainIdentifier : null;
};

export const getChainFromAssetId = (assetId: string): ChainInfo => {
  const asset = assetFromString(assetId);
  const chain = getChainInfoFromChainString(asset?.chain || "");
  if (!chain) {
    throw new Error(`Chain not found for assetId: ${assetId}`);
  }
  return chain;
};

const mapCtrlProvider: Record<WalletKey, string | null> = {
  [WalletKey.CTRL]: "Ctrl Wallet",
  [WalletKey.METAMASK]: "MetaMask",
  [WalletKey.VULTISIG]: "Vultisig",
  [WalletKey.OKX]: "OKX Wallet",
  [WalletKey.PHANTOM]: "Phantom",
  [WalletKey.LEAP]: "Leap Wallet",
  [WalletKey.WALLETCONNECT]: null,
  [WalletKey.LEDGER]: null,
};

export const detectOverwritedEthProviders = (wallet: WalletKey): any => {
  const ctrlProviders = window?.ctrlEthProviders;
  if (!ctrlProviders) {
    return null;
  }
  const providerId = mapCtrlProvider[wallet];
  if (!providerId) {
    return null;
  }
  if (ctrlProviders[providerId]) {
    return ctrlProviders[providerId].provider;
  }
  return null;
};

export const detectOverwritedThorchainProviders = (wallet: WalletKey): any => {
  const KeplProviders = window?.ctrlKeplrProviders;
  if (!KeplProviders) {
    return null;
  }
  const providerId = mapCtrlProvider[wallet];
  if (!providerId) {
    return null;
  }
  if (KeplProviders[providerId]) {
    return KeplProviders[providerId].provider;
  }
  return null;
};

export const getWalletId = (
  chain: ChainInfo,
  provider: any,
  defaultWalletKey: WalletKey,
) => {
  if (chain.type === ChainType.EVM) {
    if (provider?.isPhantom) {
      return WalletKey.PHANTOM;
    }
    if (provider?.isVultiConnect) {
      return WalletKey.VULTISIG;
    }
    if (provider?.isXDEFI) {
      return WalletKey.CTRL;
    }
    if (provider?.isMetaMask) {
      return WalletKey.METAMASK;
    }
  }
  if (chain.type === ChainType.BFT) {
    if (provider?.isOkxWallet) {
      return WalletKey.OKX;
    }
    if (provider?.isOkxWallet) {
      return WalletKey.OKX;
    }
    if (provider?.isXDEFI) {
      return WalletKey.CTRL;
    }
  }
  return defaultWalletKey;
};

export function getChainsConnected(walletsState: ConnectedWalletsState) {
  const chains: ChainKey[] = [];
  for (const key in walletsState) {
    if (walletsState?.hasOwnProperty(key)) {
      const wallet = walletsState[key];
      const chain = wallet?.ChainInfo;
      if (chain) {
        chains.push(chain);
      }
    }
  }
  return chains;
}
