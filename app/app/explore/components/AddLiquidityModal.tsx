"use client";

import { useState, useRef, useEffect } from 'react';
import Image from 'next/image';
import Button from '@/app/button';
import Modal from '@/app/modal';
import { Slider } from '@shared/components/ui';

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
  const [btcAmount, setBtcAmount] = useState(1.2345);
  const [runeAmount, setRuneAmount] = useState(1.2345);

  const getAssetSymbol = (asset: string) => {
    return asset.split(".")[1] || asset;
  };

  const handlePercentageClick = (percentage: number, isRune: boolean = false) => {
    if (isRune) {
      setRuneAmount(1.2345 * (percentage / 100));
    } else {
      setBtcAmount(1.2345 * (percentage / 100));
    }
  };

  return (
    <Modal onClose={onClose}>
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
            <div className="text-xl font-medium">{btcAmount.toFixed(4)} ($100,000)</div>
          </div>
          
          <div className="relative mb-4">
            <Slider
              value={btcAmount}
              max={1.2345}
              onChange={setBtcAmount}
            />
          </div>

          <div className="flex justify-center gap-4">
            <button
              className="px-6 py-2 rounded-full bg-87A1FF text-white font-medium"
              onClick={() => handlePercentageClick(25)}
            >
              25%
            </button>
            <button
              className="px-6 py-2 rounded-full bg-white font-medium"
              onClick={() => handlePercentageClick(50)}
            >
              50%
            </button>
            <button
              className="px-6 py-2 rounded-full bg-white font-medium"
              onClick={() => handlePercentageClick(100)}
            >
              MAX
            </button>
          </div>
        </div>

        {/* RUNE Input Section */}
        {selectedTab === 'double' && (
          <div className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center">
                <div className="w-8 h-8 bg- rounded-full mr-3"></div>
                <span className="text-xl font-medium">RUNE Balance</span>
              </div>
              <div className="text-xl font-medium">{runeAmount.toFixed(4)} ($100,000)</div>
            </div>
            
            <div className="relative mb-4">
              <Slider
                value={runeAmount}
                max={1.2345}
                onChange={setRuneAmount}
              />
            </div>

            <div className="flex justify-center gap-4">
              <button
                className="px-6 py-2 rounded-full bg-white font-medium"
                onClick={() => handlePercentageClick(25, true)}
              >
                25%
              </button>
              <button
                className="px-6 py-2 rounded-full bg-white font-medium"
                onClick={() => handlePercentageClick(50, true)}
              >
                50%
              </button>
              <button
                className="px-6 py-2 rounded-full bg-purple text-white font-medium"
                onClick={() => handlePercentageClick(100, true)}
              >
                MAX
              </button>
            </div>
          </div>
        )}

        <Button className="w-full bg-primary text-black font-semibold py-3 rounded-full mt-8">
          Add Liquidity
        </Button>
      </div>
    </Modal>
  );
}