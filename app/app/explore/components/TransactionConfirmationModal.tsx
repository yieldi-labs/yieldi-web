import { useEffect } from "react";
import Modal from "@/app/modal";

interface TransactionConfirmationModalProps {
  txHash: string;
  onClose: () => void;
}

export default function TransactionConfirmationModal({
  txHash,
  onClose,
}: TransactionConfirmationModalProps) {
  // Auto-close after 10 seconds
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, 10000);
    return () => clearTimeout(timer);
  }, [onClose]);

  const explorerUrl = `https://thorchain.net/tx/${txHash}`;

  return (
    <Modal
      title="Transaction Submitted"
      onClose={onClose}
      style={{ maxWidth: "36rem" }}
    >
      <div className="p-6 flex flex-col items-center">
        {/* Success Icon */}
        <div className="w-16 h-16 mb-6 bg-primary rounded-full flex items-center justify-center">
          <svg viewBox="0 0 24 24" className="w-8 h-8 text-black">
            <polyline
              points="20 6 9 17 4 12"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>

        {/* Message */}
        <p className="text-lg text-center mb-6">
          Your transaction has been submitted to the network
        </p>

        {/* Runescan Link */}
        <a
          href={explorerUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-center w-full p-4 mb-4 bg-white rounded-xl hover:bg-gray-50 transition-colors border text-foreground group"
        >
          <span className="mr-2">View on explorer</span>
          <svg
            className="w-4 h-4 transition-transform group-hover:translate-x-0.5"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M7 17L17 7" />
            <path d="M7 7h10v10" />
          </svg>
        </a>

        {/* Hash Preview */}
        <div className="mt-4 text-sm text-gray-500 truncate max-w-full">
          Hash: {txHash}
        </div>
      </div>
    </Modal>
  );
}
