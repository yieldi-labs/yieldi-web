import { FC } from "react";

import { Bitcoin } from "@/svg/chains";
import {
  Copy,
  Exit,
  Eye,
  LinkExternal,
  Plus,
  QRCode,
  Synchronize,
} from "@/svg/icons";
import { Metamask } from "@/svg/wallets";
import MiddleTruncate from "@/app/components/middle-truncate";
interface ComponentProps {
  isOpen: boolean;
}
const Component: FC<ComponentProps> = ({ isOpen }) => {
  return (
    isOpen && (
      <>
        <div className="bg-[rgba(0,0,0,0.5)] fixed h-full inset-0 z-20" />
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
            <span className="border-r cursor-pointer px-2">
              <Plus strokeColor="#627eea" strokeWidth={1.5} />
            </span>
            <span className="cursor-pointer px-2">
              <Exit strokeColor="#ff6656" strokeWidth={1.5} />
            </span>
          </div>
          <div className="p-4">
            <div className="bg-white flex gap-2 rounded-lg p-4">
              <span className="leading-6">
                <Metamask className="icon" />
              </span>
              <span className="flex-1 leading-6 px-2">
                <MiddleTruncate text={"0x4e9ca674e9ca674e9ca674e9ca67"} />
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
            <div className="px-2 py-4">
              <div className="flex gap-2 items-center">
                <Bitcoin />
                <div className="flex flex-1 flex-col">
                  <span className="font-bold leading-5">BTC</span>
                  <span className="leading-4 text-gray-500">Native</span>
                </div>
                <span className="font-bold">0.019245</span>
              </div>
            </div>
          </div>
        </div>
      </>
    )
  );
};

export default Component;
