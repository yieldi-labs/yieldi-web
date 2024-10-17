"use client";

import { useState, useEffect } from 'react';
import Image from 'next/image';
import TranslucentCard from '../translucentCard';
import { fetchJson, formatNumber } from '@/app/utils';

interface Pool {
  asset: string;
  assetPriceUSD: string;
  volume24h: string;
  depth: string;
  poolAPY: string;
  assetDepth: string;
  runeDepth: string;
  nativeDecimal: string;
}

interface Saver {
  asset: string;
  saversCount: number;
  saversReturn: string;
  earned: string;
  filled: number;
  assetPriceUSD: string;
  saversDepth: string;
  assetDepth: string;
  synthSupply: string;
}

const Explore = () => {
  const [activeTab, setActiveTab] = useState('liquidity');
  const [pools, setPools] = useState<Pool[]>([]);
  const [savers, setSavers] = useState<Saver[]>([]);
  const [runePriceUSD, setRunePriceUSD] = useState<number>(0);
  const [loading, setLoading] = useState(true);
  const [sortConfig, setSortConfig] = useState({ key: '', direction: '' });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [poolsData, statsData, saversData] = await Promise.all([
          fetchJson('https://midgard.ninerealms.com/v2/pools'),
          fetchJson('https://midgard.ninerealms.com/v2/stats'),
          fetchJson('https://vanaheimex.com/api/saversInfo')
        ]);
        setPools(poolsData);
        setSavers(Object.values(saversData).map(s => s.savers));
        setRunePriceUSD(parseFloat(statsData.runePriceUSD));
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const getAssetSymbol = (asset: string) => {
    return asset.split(".")[1].split("-")[0] || asset;
  };

  const getLogoPath = (asset: string) => {
    const assetLower = asset.toLowerCase();
    return `https://storage.googleapis.com/token-list-swapkit-dev/images/${assetLower}.png`;
  };

  const calculateTVL = (pool: Pool) => {
    const assetValueInUSD = parseFloat(pool.assetDepth) * parseFloat(pool.assetPriceUSD) / 1e8;
    const runeValueInUSD = parseFloat(pool.runeDepth) * runePriceUSD / 1e8;
    return (assetValueInUSD + runeValueInUSD) / 1e6;
  };

  const calculateVolumeUSD = (pool: Pool) => {
    const volumeInRune = parseFloat(pool.volume24h) / 1e8;
    return volumeInRune * runePriceUSD;
  };

  const calculateVolumeDepthRatio = (pool: Pool) => {
    const volumeUSD = calculateVolumeUSD(pool);
    const tvlUSD = calculateTVL(pool) * 1e6;
    return volumeUSD / tvlUSD;
  };

  const sortData = (key: string) => {
   let direction = 'asc';
   if (sortConfig.key === key && sortConfig.direction === 'asc') {
     direction = 'desc';
   }
   setSortConfig({ key, direction });

   const sortedData = [...(activeTab === 'liquidity' ? pools : savers)].sort((a, b) => {
     if (key === 'tvl') {
       const aTvl = activeTab === 'liquidity' ? calculateTVL(a as Pool) : parseFloat(a.saversDepth) * parseFloat(a.assetPriceUSD) / 1e14;
       const bTvl = activeTab === 'liquidity' ? calculateTVL(b as Pool) : parseFloat(b.saversDepth) * parseFloat(b.assetPriceUSD) / 1e14;
       return direction === 'asc' ? aTvl - bTvl : bTvl - aTvl;
     } else if (key === 'apr') {
       const aApr = activeTab === 'liquidity' ? parseFloat((a as Pool).poolAPY) : parseFloat(a.saversReturn);
       const bApr = activeTab === 'liquidity' ? parseFloat((b as Pool).poolAPY) : parseFloat(b.saversReturn);
       return direction === 'asc' ? aApr - bApr : bApr - aApr;
     }
     return 0;
   });

   if (activeTab === 'liquidity') {
     setPools(sortedData as Pool[]);
   } else {
     setSavers(sortedData as Saver[]);
   }
 };

  const topPools = pools.slice(0, 3);
  const topSavers = savers.slice(0, 3);

  return (
    <>
      <main className="mx-auto">
        <nav className="mb-4">
          <ul className="flex space-x-8 font-semibold font-gt-america-exp text-2xl">
            <li>
              <a
                href="#"
                onClick={() => setActiveTab('liquidity')}
                className={`pb-2 no-underline ${activeTab === 'liquidity' ? 'text-gray-900 font-bold' : 'text-gray-400 hover:text-gray-700 font-medium'}`}
              >
                LIQUIDITY POOLS
              </a>
            </li>
            <li>
              <a
                href="#"
                onClick={() => setActiveTab('savers')}
                className={`pb-2 no-underline ${activeTab === 'savers' ? 'text-gray-900 font-bold' : 'text-gray-400 hover:text-gray-700 font-medium'}`}
              >
                SAVER VAULTS
              </a>
            </li>
          </ul>
        </nav>

        {loading ? (
          <p>Loading data...</p>
        ) : (
          <>
            {/* Top Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
              {activeTab === 'liquidity' ? (
                topPools.map((pool) => (
                  <TranslucentCard key={pool.asset} className="p-5 rounded-2xl flex flex-col items-start">
                    <div className="flex items-center mb-7">
                      <Image src={getLogoPath(pool.asset)} alt={`${getAssetSymbol(pool.asset)} logo`} width={40} height={40} className="rounded-full" />
                      <span className="ml-2 text-2xl font-medium font-gt-america-ext">{getAssetSymbol(pool.asset)}</span>
                    </div>
                    <div className="grid-cols-2 gap-4 w-full flex">
                      <div className="bg-white rounded-xl p-3 flex justify-center flex-col items-center flex-1 w-1/2">
                        <p className="text-3xl font-medium">${formatNumber(calculateTVL(pool), 2, 2)}M</p>
                        <p className="text-gray-700 text-base mt-2 font-medium">TVL</p>
                      </div>
                      <div className="bg-white rounded-xl p-3 flex justify-center flex-col items-center flex-1 w-1/2">
                        <p className="text-3xl font-medium">{formatNumber(parseFloat(pool.poolAPY) * 100, 2, 2)}%</p>
                        <p className="text-gray-700 text-base font-medium">APR</p>
                      </div>
                    </div>
                  </TranslucentCard>
                ))
              ) : (
                topSavers.map((saver) => (
                  <TranslucentCard key={saver.asset} className="p-5 rounded-2xl flex flex-col items-start">
                    <div className="flex items-center mb-7">
                      <Image src={getLogoPath(saver.asset)} alt={`${getAssetSymbol(saver.asset)} logo`} width={40} height={40} className="rounded-full" />
                      <span className="ml-2 text-2xl font-medium font-gt-america-ext">{getAssetSymbol(saver.asset)}</span>
                    </div>
                    <div className="grid-cols-2 gap-4 w-full flex">
                      <div className="bg-white rounded-xl p-3 flex justify-center flex-col items-center flex-1 w-1/2">
                        <p className="text-3xl font-medium">${formatNumber(parseFloat(saver.saversDepth) * parseFloat(saver.assetPriceUSD) / 1e14, 2, 2)}M</p>
                        <p className="text-gray-700 text-base mt-2 font-medium">TVL</p>
                      </div>
                      <div className="bg-white rounded-xl p-3 flex justify-center flex-col items-center flex-1 w-1/2">
                        <p className="text-3xl font-medium">{formatNumber(parseFloat(saver.saversReturn) * 100, 2, 2)}%</p>
                        <p className="text-gray-700 text-base font-medium">APR</p>
                      </div>
                    </div>
                  </TranslucentCard>
                ))
              )}
            </div>

            {/* All Pools/Savers table */}
            <h2 className="text-xl font-medium mb-4">{activeTab === 'liquidity' ? 'All Pools' : 'All Savers'}</h2>
            <div className="overflow-hidden">
              <div className="min-w-full">
                <div className="flex text-left text-base text-gray-700">
                  <div className="px-3 py-3 w-1/2">Asset</div>
                  <div className="flex flex-1 w-1/2 justify-between">
                    {activeTab === 'liquidity' ? (
                      <>
                        <div className="px-3 py-3 w-1/4 ml-6">Volume (24h)</div>
                        <div className="px-3 py-3 w-1/4">Volume/Depth</div>
                        <div className="px-3 py-3 w-1/4 flex items-center cursor-pointer" onClick={() => sortData('tvl')}>
                          TVL
                          <Image src="/arrow-unfold.svg" alt="Sort" width={16} height={16} className="ml-1" />
                        </div>
                        <div className="px-3 py-3 w-1/4 flex items-center cursor-pointer" onClick={() => sortData('apr')}>
                          APR
                          <Image src="/arrow-unfold.svg" alt="Sort" width={16} height={16} className="ml-1" />
                        </div>
                          </>
                    ) : (
                      <>
                        <div className="px-3 py-3 w-1/4 ml-6">Savers</div>
                        <div className="px-3 py-3 w-1/4">Utilization</div>
                        <div className="px-3 py-3 w-1/4 flex items-center cursor-pointer" onClick={() => sortData('tvl')}>
                          TVL
                          <Image src="/arrow-unfold.svg" alt="Sort" width={16} height={16} className="ml-1" />
                        </div>
                        <div className="px-3 py-3 w-1/4 flex items-center cursor-pointer" onClick={() => sortData('apr')}>
                          APR
                          <Image src="/arrow-unfold.svg" alt="Sort" width={16} height={16} className="ml-1" />
                        </div>
                      </>
                    )}
                  </div>
                </div>
                <div className="min-w-full">
                  {activeTab === 'liquidity' ? (
                    pools.map((pool) => {
                      const tvl = calculateTVL(pool);
                      const volumeUSD = calculateVolumeUSD(pool);
                      const volumeDepthRatio = calculateVolumeDepthRatio(pool);
                      return (
                        <TranslucentCard key={pool.asset} className="rounded-xl mb-1.5">
                          <div className="flex items-center min-w-full">
                            <div className="px-3 whitespace-nowrap flex-1 w-1/3">
                              <div className="flex items-center">
                                <Image src={getLogoPath(pool.asset)} alt={`${getAssetSymbol(pool.asset)} logo`} width={28} height={28} className="rounded-full" />
                                <span className="ml-3 font-medium">{getAssetSymbol(pool.asset)}</span>
                              </div>
                            </div>
                            <div className="flex items-start flex-1 w-2/3">
                              <div className="px-6 py-3 whitespace-nowrap flex-1 w-1/4">${formatNumber(volumeUSD, 0, 0)}</div>
                              <div className="px-6 py-3 whitespace-nowrap flex-1 w-1/4">{formatNumber(volumeDepthRatio, 2, 2)}</div>
                              <div className="px-6 py-3 whitespace-nowrap flex-1 w-1/4">${formatNumber(tvl, 2, 2)}M</div>
                              <div className="px-6 py-3 whitespace-nowrap flex-1 w-1/4">{formatNumber(parseFloat(pool.poolAPY) * 100, 2, 2)}%</div>
                            </div>
                          </div>
                        </TranslucentCard>
                      );
                    })
                  ) : (
                    savers.map((saver) => (
                      <TranslucentCard key={saver.asset} className="rounded-xl mb-1.5">
                        <div className="flex items-center min-w-full">
                          <div className="px-3 whitespace-nowrap flex-1 w-1/3">
                            <div className="flex items-center">
                              <Image src={getLogoPath(saver.asset)} alt={`${getAssetSymbol(saver.asset)} logo`} width={28} height={28} className="rounded-full" />
                              <span className="ml-3 font-medium">{getAssetSymbol(saver.asset)}</span>
                            </div>
                          </div>
                          <div className="flex items-start flex-1 w-2/3">
                            <div className="px-6 py-3 whitespace-nowrap flex-1 w-1/4">{saver.saversCount}</div>
                            <div className="px-6 py-3 whitespace-nowrap flex-1 w-1/4">{formatNumber(saver.filled * 100, 2, 2)}%</div>
                            <div className="px-6 py-3 whitespace-nowrap flex-1 w-1/4">${formatNumber(parseFloat(saver.saversDepth) * parseFloat(saver.assetPriceUSD) / 1e14, 2, 2)}M</div>
                            <div className="px-6 py-3 whitespace-nowrap flex-1 w-1/4">{formatNumber(parseFloat(saver.saversReturn) * 100, 2, 2)}%</div>
                          </div>
                        </div>
                      </TranslucentCard>
                    ))
                  )}
                </div>
              </div>
            </div>
          </>
        )}
      </main>
    </>
  );
};

export default Explore;