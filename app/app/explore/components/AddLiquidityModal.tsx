import { useState } from 'react';
import Image from 'next/image';
import Button from '@/app/button';
import Modal from '@/app/modal';
import TranslucentCard from '@/app/TranslucentCard';
import { formatNumber } from '@/app/utils';

interface AddLiquidityModalProps {
  pool: {
    asset: string;
    poolAPY: string;
  };
  runePriceUSD: number;
  onClose: () => void;
}

export default function AddLiquidityModal({ pool, runePriceUSD, onClose }: AddLiquidityModalProps) {
  const [selectedTab, setSelectedTab] = useState('single');
  const [btcAmount, setBtcAmount] = useState('1.2345');
  const [runeAmount, setRuneAmount] = useState('1.2345');

  const getAssetSymbol = (asset: string) => {
    return asset.split(".")[1] || asset;
  };

  return (
    <Modal title={`Add ${getAssetSymbol(pool.asset)} Liquidity`} onClose={onClose}>
      <div className="max-w-2xl mx-auto">
        {/* Tab Selector */}
        <div className="flex rounded-full bg-white p-1 mb-8">
          <button
            onClick={() => setSelectedTab('single')}
            className={`flex-1 py-3 px-6 rounded-full text-sm font-medium ${
              selectedTab === 'single' ? 'bg-background' : ''
            }`}
          >
            Add {getAssetSymbol(pool.asset)}
          </button>
          <button
            onClick={() => setSelectedTab('double')}
            className={`flex-1 py-3 px-6 rounded-full text-sm font-medium ${
              selectedTab === 'double' ? 'bg-background' : ''
            }`}
          >
            Add {getAssetSymbol(pool.asset)} + RUNE
          </button>
        </div>

        {/* Asset Input Section */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center">
              <Image
                src={`/logo-${getAssetSymbol(pool.asset).toLowerCase()}.svg`}
                alt={getAssetSymbol(pool.asset)}
                width={32}
                height={32}
                className="mr-3"
              />
              <span className="text-xl font-medium">{getAssetSymbol(pool.asset)} Balance</span>
            </div>
            <div className="text-xl font-medium">1.2345 ($100,000)</div>
          </div>
          
          <div className="relative mb-4">
            <div className="h-2 bg-gray-200 rounded-full">
              <div className="h-2 bg-purple rounded-full w-1/4"></div>
            </div>
          </div>

          <div className="flex justify-center gap-4">
            <button className="px-6 py-2 rounded-full bg-87A1FF text-white font-medium">
              25%
            </button>
            <button className="px-6 py-2 rounded-full bg-white font-medium">
              50%
            </button>
            <button className="px-6 py-2 rounded-full bg-white font-medium">
              MAX
            </button>
          </div>
        </div>

        {/* RUNE Input Section */}
        {selectedTab === 'double' && (
          <div className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center">
                <div className="w-8 h-8 bg-[#00CCFF] rounded-full mr-3"></div>
                <span className="text-xl font-medium">RUNE Balance</span>
              </div>
              <div className="text-xl font-medium">1.2345 ($100,000)</div>
            </div>
            
            <div className="relative mb-4">
              <div className="h-2 bg-gray-200 rounded-full">
                <div className="h-2 bg-purple rounded-full w-full"></div>
              </div>
            </div>

            <div className="flex justify-center gap-4">
              <button className="px-6 py-2 rounded-full bg-white font-medium">
                25%
              </button>
              <button className="px-6 py-2 rounded-full bg-white font-medium">
                50%
              </button>
              <button className="px-6 py-2 rounded-full bg-purple text-white font-medium">
                MAX
              </button>
            </div>
          </div>
        )}

        {/* Add Button */}
        <Button className="w-full py-4 text-lg bg-[#A1FD59] text-black">
          Add Liquidity
        </Button>
      </div>
    </Modal>
  );
}