import Loader from "@/app/components/Loader";
import Modal from "@/app/modal";
import {
  PositionData,
  PositionStatus,
} from "@/hooks/dataTransformers/positionsTransformer";

interface TransactionConfirmationModalProps {
  position: PositionData | null;
  txHash: string;
  onClose: () => void;
}

export default function TransactionConfirmationModal({
  position,
  txHash,
  onClose,
}: TransactionConfirmationModalProps) {
  const thorchainUrl = `https://thorchain.net/tx/${txHash}`;
  const runescanUrl = `https://runescan.io/tx/${txHash}`;

  console.log("position", position);

  const ExternalLinkIcon = () => (
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
  );

  return (
    <Modal
      title="Transaction Submitted"
      onClose={onClose}
      style={{ maxWidth: "36rem" }}
    >
      <div className="p-6 flex flex-col items-center">
        {/* Success Icon */}
        {position?.status === PositionStatus.LP_POSITION_PENDING ? (
          <div className="mb-6">
            <Loader />
          </div>
        ) : (
          <div className="w-16 h-16  bg-primary rounded-full flex items-center justify-center">
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
        )}

        {/* Message */}
        <p className="text-lg text-center mb-6">
          Your transaction has been submitted to the network
        </p>

        {/* Explorer Links */}
        <div className="w-full space-y-3">
          <a
            href={thorchainUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center w-full p-4 bg-white rounded-xl hover:bg-gray-50 transition-colors border text-foreground group"
          >
            <span className="mr-2">View on THORChain.net</span>
            <ExternalLinkIcon />
          </a>

          <a
            href={runescanUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center w-full p-4 bg-white rounded-xl hover:bg-gray-50 transition-colors border text-foreground group"
          >
            <span className="mr-2">View on Runescan</span>
            <ExternalLinkIcon />
          </a>
        </div>

        {/* Hash Preview */}
        <div className="mt-4 text-sm text-gray-500 truncate max-w-full">
          Hash: {txHash}
        </div>
      </div>
    </Modal>
  );
}
