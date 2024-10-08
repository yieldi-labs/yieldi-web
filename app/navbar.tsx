"use client";

import Image from "next/image";
import WalletButton from "@/app/walletButton";

export default function Navbar() {
  return (
    <nav className="flex w-auto h-[86px] px-5 pl-10 py-5 
      justify-between items-center flex-shrink-0 rounded-[20px] border-4 border-[#FFF] 
      bg-[radial-gradient(152.17%_50%_at_50%_50%,rgba(255,255,255,0.20)_0%,rgba(255,255,255,0.80)_100%)] mx-[120px] mt-[20px] mb-[34px]">
      <div className="flex items-center py-3">
        <Image
          alt="Yieldi Logo"
          src="/logo.svg"
          width={0}
          height={0}
          className="w-24 h-auto md:block mx-4"
        />
      </div>
      <div className="flex-1 flex w-auto justify-center">
        <a
          className="text-[#242628] text-center font-sans text-sm font-bold leading-5 uppercase mx-[32px] rounded-[30px] hover:bg-[radial-gradient(50%_50%_at_50%_50%,rgba(0,125,152,0.11)_35.17%,rgba(94,136,145,0.00)_100%)]"
          href="/"
        >
          explore
        </a>
        <a className="text-[#242628] text-center font-sans text-sm font-bold leading-5 uppercase mx-[32px] rounded-[30px] hover:bg-[radial-gradient(50%_50%_at_50%_50%,rgba(0,125,152,0.11)_35.17%,rgba(94,136,145,0.00)_100%)]" href="/about">
            points
        </a>

      </div>
      <div className="flex">
        <WalletButton />
      </div>
    </nav>
  );
}
