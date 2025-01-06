import React, { useState } from "react";
import { QRCodeSVG } from "qrcode.react";
import { Copy } from "@/svg/icons";
import useCopyToClipboard from "@/hooks/useCopyToClipboard";
import Modal from "@/app/modal";

interface QRCodeModalProps {
  title: string;
  address: string;
  onClose: () => void;
}

const QRCodeModal: React.FC<QRCodeModalProps> = ({
  title,
  address,
  onClose,
}) => {
  const { copy } = useCopyToClipboard();

  return (
    <Modal title={title} onClose={onClose}>
      <div className="flex flex-col items-center">
        <div className="bg-white p-2 rounded-md mb-4">
          <QRCodeSVG value={address} size={200} bgColor="#ffffff" fgColor="#000000" />
        </div>
        <div className="flex items-center gap-2 text-gray-700 text-sm mb-2">
          <span className="truncate">{address}</span>
          <span
            className="cursor-pointer my-auto rounded-full transition-all transform hover:scale-110 active:scale-95"
            onClick={() => copy(address)}
          >
            <Copy strokeColor="#627eea" size={20} />
          </span>
        </div>
      </div>
    </Modal>
  );
};

export default QRCodeModal;
