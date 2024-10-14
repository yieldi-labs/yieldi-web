"use client";

import Link from 'next/link';
import Image from 'next/image';
import TranslucentCard from '../translucentCard';

const Explore = () => {
  return (
    <>
      <main className="mx-auto">
        <nav className="mb-8">
          <ul className="flex space-x-8 font-semibold font-gt-america-exp text-2xl">
            <li>
              <Link href="/liquidity-pools" className="text-gray-900 pb-2 no-underline font-bold">
                LIQUIDITY POOLS
              </Link>
            </li>
            <li>
              <Link href="/saver-vaults" className="text-gray-400 hover:text-gray-700 no-underline font-medium">
                SAVER VAULTS
              </Link>
            </li>
          </ul>
        </nav>

        <div className="flex mb-8 font-medium text-lg align-middle items-center gap-3">
          <p>High TVL</p>
          <Image src="/arrow-unfold.svg" alt="arrow unfold" width={16} height={16} className="mb-1" />
        </div>

        {/* Pool cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          {['BTC', 'ETH', 'USDT'].map((coin) => (
            <TranslucentCard key={coin} className="p-5 rounded-2xl flex flex-col items-start">
              <div className="flex items-center mb-4">
                <Image src={`/logo-${coin.toLowerCase()}.svg`} alt={`${coin} logo`} width={32} height={32} />
                <span className="ml-2 text-2xl font-bold">{coin}</span>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-3xl font-bold">{coin === 'USDT' ? '$6.5M' : coin === 'ETH' ? '$8.54M' : '$10M'}</p>
                  <p className="text-sm text-gray-500">TVL</p>
                </div>
                <div>
                  <p className="text-3xl font-bold">{coin === 'USDT' ? '7.43%' : coin === 'ETH' ? '6.4%' : '12%'}</p>
                  <p className="text-sm text-gray-500">APR</p>
                </div>
              </div>
            </TranslucentCard>
          ))}
        </div>

        {/* All Pools table */}
        <h2 className="text-2xl font-bold mb-4">All Pools</h2>
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <table className="min-w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Pool</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Volume</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Volume/Depth</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">TVL</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">APR</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {['WBTC', 'BCH', 'BNB', 'DOGE', 'TRX', 'BUSD', 'WBTC'].map((coin) => (
                <tr key={coin}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <Image src={`/logo-${coin.toLowerCase()}.svg`} alt={`${coin} logo`} width={24} height={24} />
                      <span className="ml-2 font-medium">{coin}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">$1,234,567</td>
                  <td className="px-6 py-4 whitespace-nowrap">0.5</td>
                  <td className="px-6 py-4 whitespace-nowrap">$210.6M</td>
                  <td className="px-6 py-4 whitespace-nowrap">0.169%</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </main>
    </>
  );
};

export default Explore;