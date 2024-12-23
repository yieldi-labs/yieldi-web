import Loader from "@/app/components/Loader";
import Modal from "@/app/modal";
import {
  PositionStats,
  PositionStatus,
} from "@/hooks/dataTransformers/positionsTransformer";

interface TransactionConfirmationModalProps {
  position: PositionStats | null;
  assetHash: string | null;
  runeHash?: string | null;
  onClose: () => void;
}

export default function TransactionConfirmationModal({
  position,
  assetHash,
  runeHash,
  onClose,
}: TransactionConfirmationModalProps) {
  const assetHashThorchainUrl = `https://thorchain.net/tx/${assetHash}`;
  const runeHashThorchainUrl = runeHash ? `https://thorchain.net/tx/${runeHash}` : undefined;
  const assetHashRunescanUrl = `https://runescan.io/tx/${assetHash}`;
  const runeHashRunescanUrl = runeHash ? `https://runescan.io/tx/${runeHash}` : undefined;

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
        {position?.status === PositionStatus.LP_POSITION_DEPOSIT_PENDING ||
        position?.status === PositionStatus.LP_POSITION_WITHDRAWAL_PENDING ? (
          <div className="mb-3">
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
            href={assetHashThorchainUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center w-full p-4 bg-white rounded-xl hover:bg-gray-50 transition-colors border text-foreground group"
          >
            <span className="mr-2">View on THORChain.net</span>
            <ExternalLinkIcon />
          </a>

          <a
            href={assetHashRunescanUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center w-full p-4 bg-white rounded-xl hover:bg-gray-50 transition-colors border text-foreground group"
          >
            <span className="mr-2">View on Runescan</span>
            <ExternalLinkIcon />
          </a>

          {runeHash && (
            <>
              <a
                href={runeHashThorchainUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center w-full p-4 bg-white rounded-xl hover:bg-gray-50 transition-colors border text-foreground group"
              >
                <span className="mr-2">View Rune on THORChain.net</span>
                <ExternalLinkIcon />
              </a>

              <a
                href={runeHashRunescanUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center w-full p-4 bg-white rounded-xl hover:bg-gray-50 transition-colors border text-foreground group"
              >
                <span className="mr-2">View Rune on Runescan</span>
                <ExternalLinkIcon />
              </a>
            </>
          )}
        </div>

        {/* Hash Preview */}
        <div className="mt-4 text-sm text-gray-500 truncate max-w-full">
          Asset Transaction Hash: {assetHash}
          {runeHash && `Rune Transaction Hash: ${runeHash}`}
        </div>
      </div>
    </Modal>
  );
}
