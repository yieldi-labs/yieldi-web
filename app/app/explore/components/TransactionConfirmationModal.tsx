import Loader from "@/app/components/Loader";
import Modal from "@/app/modal";
import {
  PositionStats,
  PositionStatus,
} from "@/utils/lp-monitor/parsePositions";

interface TransactionConfirmationModalProps {
  position: PositionStats;
  assetHash?: string | null;
  runeHash?: string | null;
  onClose: () => void;
}

interface ExplorerLinkProps {
  url: string;
  text: string;
}

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

const ExplorerLink = ({ url, text }: ExplorerLinkProps) => {
  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      className="flex items-center justify-center w-full p-4 bg-white rounded-xl hover:bg-gray-50 transition-colors border text-foreground group"
    >
      <span className="mr-2">{text}</span>
      <ExternalLinkIcon />
    </a>
  );
};

export default function TransactionConfirmationModal({
  position,
  assetHash,
  runeHash,
  onClose,
}: TransactionConfirmationModalProps) {
  const chainName = position ? position.assetId.split(".")[0] : "";

  const createExplorerLinks = (hash: string | null, chainName: string) => {
    return hash
      ? [
          {
            url: `https://thorchain.net/tx/${hash}`,
            text: `View ${chainName} transaction on THORChain.net`,
          },
          {
            url: `https://runescan.io/tx/${hash}`,
            text: `View ${chainName} transaction on Runescan`,
          },
        ]
      : [];
  };

  const links = {
    asset: assetHash ? createExplorerLinks(assetHash, chainName) : [],
    rune: runeHash ? createExplorerLinks(runeHash, "Rune") : [],
  };

  return (
    <Modal
      title="Transaction Submitted"
      onClose={onClose}
      style={{ maxWidth: "36rem" }}
    >
      <div className="p-6 flex flex-col items-center">
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

        <p className="text-lg text-center mb-6">
          Your transaction has been submitted to the network
        </p>

        <div className="w-full space-y-3">
          {[...links.asset, ...links.rune].map((link, index) => (
            <ExplorerLink key={index} {...link} />
          ))}
        </div>

        <div className="mt-4 text-sm text-gray-500 truncate max-w-full">
          {assetHash && <p>{`${chainName} Transaction Hash: ${assetHash}`}</p>}
          {runeHash && <p>{`Rune Transaction Hash: ${runeHash}`}</p>}
        </div>
      </div>
    </Modal>
  );
}
