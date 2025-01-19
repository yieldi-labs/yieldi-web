import { NumericFormat, NumberFormatValues } from "react-number-format";
import Image from "next/image";
import { formatNumber } from "@/app/utils";

interface AssetInputProps {
  value: string;
  onValueChange: (values: NumberFormatValues) => void;
  assetSymbol: string;
  assetUsdValue: number;
  logoPath: string;
  assetDecimalScale: number;
  usdDecimalScale: number;
  assetBalance?: number;
  usdBalance?: number;
}

export default function AssetInput({
  value,
  onValueChange,
  assetSymbol,
  assetUsdValue,
  logoPath,
  assetDecimalScale,
  usdDecimalScale,
  assetBalance: balance,
  usdBalance,
}: AssetInputProps) {
  return (
    <div className="bg-white rounded-xl p-4 mb-6">
      <div className="flex items-center gap-2 mb-2">
        <NumericFormat
          value={value}
          onValueChange={onValueChange}
          placeholder="0"
          className="flex-1 text-xl font-medium outline-none"
          thousandSeparator=","
          decimalScale={assetDecimalScale}
          allowNegative={false}
        />
        <div className="flex items-center gap-2">
          <Image
            src={logoPath}
            alt={assetSymbol}
            width={32}
            height={32}
            className="rounded-full"
          />
          <span className="text-neutral">{assetSymbol}</span>
        </div>
      </div>
      <div className="flex justify-between text-base font-medium text-neutral-800">
        <div>≈ ${formatNumber(assetUsdValue, usdDecimalScale)}</div>
        {balance && usdBalance && (
          <div>
            Balance: {formatNumber(balance)} ($
            {formatNumber(usdBalance, usdDecimalScale)})
          </div>
        )}
      </div>
    </div>
  );
}
