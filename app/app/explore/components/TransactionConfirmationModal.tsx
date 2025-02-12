import Loader from "@/app/components/Loader";
import Modal from "@/app/modal";
import { PoolDetail } from "@/midgard";
import { useLiquidityPositions } from "@/utils/contexts/PositionsContext";
import {
  PositionStatus,
  PositionType,
} from "@/utils/lp-monitor/parsePositions";
import { getAddressUrl } from "@/utils/wallet/utils";

interface TransactionConfirmationModalProps {
  stepData: {
    pool: PoolDetail;
    positionType: PositionType;
    assetHash?: string | null;
    runeHash?: string | null;
  };
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
  stepData,
  onClose,
}: TransactionConfirmationModalProps) {
  const { positions } = useLiquidityPositions();

  if (
    !positions ||
    !positions[stepData.pool.asset] ||
    !positions[stepData.pool.asset][stepData.positionType]
  ) {
    return null;
  }

  const position = positions[stepData.pool.asset][stepData.positionType];

  const chainName = position ? position.assetId.split(".")[0] : "";

  const createExplorerLinks = (hash: string | null, chainName: string) => {
    return hash
      ? [
          {
            url: `${getAddressUrl()}${hash}`,
            text: `View ${chainName} transaction on THORChain.net`,
          },
        ]
      : [];
  };

  const links = {
    asset: stepData.assetHash
      ? createExplorerLinks(stepData.assetHash, chainName)
      : [],
    rune: stepData.runeHash
      ? createExplorerLinks(stepData.runeHash, "Rune")
      : [],
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
          {stepData.assetHash && (
            <p>{`${chainName} Transaction Hash: ${stepData.assetHash}`}</p>
          )}
          {stepData.runeHash && (
            <p>{`Rune Transaction Hash: ${stepData.runeHash}`}</p>
          )}
        </div>
      </div>
    </Modal>
  );
}
