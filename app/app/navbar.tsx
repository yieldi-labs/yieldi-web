"use client";

import Image from "next/image";
import WalletButton from "@/app/walletButton";

export default function Navbar() {
  return (
    <nav
      className="flex w-auto h-20 px-5 pl-10 py-5 mb-9 rounded-3xl
      justify-between items-center flex-shrink-0 border-4 border-[#FFF] 
      bg-[radial-gradient(152.17%_50%_at_50%_50%,rgba(255,255,255,0.20)_0%,rgba(255,255,255,0.80)_100%)]"
    >
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
        {[
          { name: "explore", href: "/explore" },
          { name: "points", href: "/" },
        ].map((link) => (
          <a
            key={link.name}
            className="text-[#242628] text-center font-sans text-sm font-bold leading-6 uppercase mx-8 rounded-3xl hover:bg-[radial-gradient(60%_60%_at_50%_50%,rgba(0,125,152,0.11)_35.17%,rgba(94,136,145,0.00)_100%)]"
            href={link.href}
          >
            {link.name}
          </a>
        ))}
      </div>
      <div className="flex">
        <WalletButton />
      </div>
    </nav>
  );
}
