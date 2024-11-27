"use client";
import { cloneElement, FC, useEffect, useState } from "react";
import Image from "next/image";
import {
  Copy,
  Exit,
  Eye,
  LinkExternal,
  Plus,
  QRCode,
  Synchronize,
} from "@/svg/icons";
import MiddleTruncate from "@/app/components/middle-truncate";
import { useAppState } from "@/utils/context";
import ERC20_ABI from "@/hooks/erc20.json";
import { ProviderKey, SUPPORTED_WALLETS } from "@/utils/wallet/constants";
import {
  getAssetSymbol,
  getLogoPath,
  isERC20,
  normalizeAddress,
} from "@/app/utils";
import { decodeFunctionResult, encodeFunctionData, formatUnits } from "viem";
import { getPools } from "@/midgard";

const Component: FC = () => {
  const {
    walletsState,
    isWalletDrawerOpen,
    toggleWalletDrawer,
    toggleWalletModal,
  } = useAppState();
  const [ercTokensData, setErcTokensData] = useState<any[]>();
  const handleAddWallet = () => {
    toggleWalletModal();
    toggleWalletDrawer();
  };

  useEffect(() => {
    if (walletsState) {
      getPools({
        query: {
          period: "30d",
          status: "available",
        },
      }).then(({ data }) => {
        const addresses: any[] = [];
        if (!data) return;
        for (const pool of data) {
          if (isERC20(pool.asset)) {
            if (walletsState[ProviderKey.EVM]) {
              const poolViemAddress = pool.asset.split(".")[1].split("-")[1];
              const tokenAddress = normalizeAddress(poolViemAddress!);
              if (tokenAddress) {
                getERC20TokenInfo(
                  walletsState[ProviderKey.EVM].address,
                  walletsState[ProviderKey.EVM].provider,
                  tokenAddress
                )
                  .then((info) => {
                    if (info) addresses.push({ ...info, asset: pool.asset });
                  })
                  .catch();
              }
            }
          }
        }
        setErcTokensData(addresses);
      });
    }
  }, [walletsState]);

  const getERC20TokenInfo = async (
    walletAddress: string,
    provider: any,
    tokenAddress: `0x${string}`
  ) => {
    try {
      // Encode function calls
      const nameData = encodeFunctionData({
        abi: ERC20_ABI,
        functionName: "name",
      });

      const symbolData = encodeFunctionData({
        abi: ERC20_ABI,
        functionName: "symbol",
      });

      const decimalsData = encodeFunctionData({
        abi: ERC20_ABI,
        functionName: "decimals",
      });

      const balanceData = encodeFunctionData({
        abi: ERC20_ABI,
        functionName: "balanceOf",
        args: [walletAddress],
      });

      // Make parallel RPC calls
      const [nameHex, symbolHex, decimalsHex, balanceHex] = await Promise.all([
        provider.request({
          method: "eth_call",
          params: [{ to: tokenAddress, data: nameData }, "latest"],
        }),
        provider.request({
          method: "eth_call",
          params: [{ to: tokenAddress, data: symbolData }, "latest"],
        }),
        provider.request({
          method: "eth_call",
          params: [{ to: tokenAddress, data: decimalsData }, "latest"],
        }),
        provider.request({
          method: "eth_call",
          params: [{ to: tokenAddress, data: balanceData }, "latest"],
        }),
      ]);
      // Decode results
      const name = decodeFunctionResult({
        abi: ERC20_ABI,
        functionName: "name",
        data: nameHex,
      }) as string;

      const symbol = decodeFunctionResult({
        abi: ERC20_ABI,
        functionName: "symbol",
        data: symbolHex,
      }) as string;

      const decimals = decodeFunctionResult({
        abi: ERC20_ABI,
        functionName: "decimals",
        data: decimalsHex,
      }) as number;

      const balanceBigInt = decodeFunctionResult({
        abi: ERC20_ABI,
        functionName: "balanceOf",
        data: balanceHex,
      }) as bigint;

      // Format balance
      const balance = Number(formatUnits(balanceBigInt, Number(decimals)));
      return { name, symbol, decimals, balance };
    } catch {}
    return null;
  };

  return (
    isWalletDrawerOpen && (
      <>
        <div
          className="bg-[rgba(0,0,0,0.5)] fixed h-full inset-0 z-20"
          onClick={toggleWalletDrawer}
        />
        <div className="bg-secondary border-b-4 border-l-4 border-t-4 border-white fixed h-full right-0 rounded-l-large top-0 w-[360px] z-20">
          <div className="border-b flex py-4">
            <span className="flex-1 font-bold leading-6 px-4 text-2xl">
              Wallet
            </span>
            <span className="border-r cursor-pointer px-2">
              <Eye strokeColor="#627eea" strokeWidth={1.5} />
            </span>
            <span className="border-r cursor-pointer px-2">
              <Synchronize strokeColor="#627eea" strokeWidth={1.5} />
            </span>
            <span
              className="border-r cursor-pointer px-2"
              onClick={handleAddWallet}
            >
              <Plus strokeColor="#627eea" strokeWidth={1.5} />
            </span>
            <span className="cursor-pointer px-2">
              <Exit strokeColor="#ff6656" strokeWidth={1.5} />
            </span>
          </div>
          {Object.values(walletsState!).map((wallet) => (
            <div key={wallet.walletId} className="p-4">
              <div className="bg-white flex gap-2 rounded-lg p-4">
                <span className="leading-6">
                  {cloneElement(SUPPORTED_WALLETS[wallet.walletId].icon)}
                  {/* <Metamask className="icon" /> */}
                </span>
                <span className="flex-1 leading-6 px-2">
                  <MiddleTruncate text={wallet.address} />
                </span>
                <span className="cursor-pointer">
                  <Copy strokeColor="#627eea" />
                </span>
                <span className="cursor-pointer">
                  <QRCode strokeColor="#627eea" />
                </span>
                <span className="cursor-pointer">
                  <LinkExternal strokeColor="#627eea" />
                </span>
                <span className="cursor-pointer -mr-1">
                  <Exit strokeColor="#ff6656" />
                </span>
              </div>
              {ercTokensData
                ?.filter((token) => token.balance > 0)
                .map((token) => (
                  <div key={token.asset} className="px-2 py-4">
                    <div className="flex gap-2 items-center">
                      <Image
                        src={getLogoPath(token.asset)}
                        alt={`${getAssetSymbol(token.asset)} logo`}
                        width={26}
                        height={26}
                        className="rounded-full"
                      />
                      <div className="flex flex-1 flex-col">
                        <span className="font-bold leading-5">
                          {token.name}
                        </span>
                        <span className="leading-4 text-gray-500">ETH</span>
                      </div>
                      <span className="font-bold">{token.balance}</span>
                    </div>
                  </div>
                ))}
            </div>
          ))}
        </div>
      </>
    )
  );
};

export default Component;
