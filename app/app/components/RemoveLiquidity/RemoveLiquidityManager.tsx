import React, { useState } from "react";
import StatusModalRemoveLiquidity, {
  ConfirmStepData,
  StatusModalRemoveLiquidityStepData,
} from "./StatusModalRemoveLiquidity";
import Modal from "@/app/modal";
import TransactionConfirmationModal from "../TransactionConfirmationModal";
import RemoveLiquidityModal, {
  RemoveLiquidityStepData,
} from "./RemoveLiquidityModal";

export enum LpRemoveSteps {
  SELECT_OPTIONS = 1,
  HANDLE_STATE = 2,
  SUCCESS_SCREEN = 3,
}

const modalTitles = {
  [LpRemoveSteps.SELECT_OPTIONS]: undefined,
  [LpRemoveSteps.HANDLE_STATE]: "Remove tokens",
  [LpRemoveSteps.SUCCESS_SCREEN]: undefined,
};

interface AddLiquidityManagerProps {
  onClose: () => void;
  initialStep?: LpRemoveSteps;
  stepData?:
    | StatusModalRemoveLiquidityStepData
    | ConfirmStepData
    | RemoveLiquidityStepData;
}

const RemoveLiquidityManager = ({
  onClose,
  initialStep,
  stepData,
}: AddLiquidityManagerProps) => {
  const [step, setStep] = useState(initialStep || LpRemoveSteps.SELECT_OPTIONS);
  const [data, setData] = useState(stepData);

  const nextStep = (
    data?: StatusModalRemoveLiquidityStepData | ConfirmStepData,
  ) => {
    setStep((prev) => prev + 1);
    setData(data);
  };

  if (step > LpRemoveSteps.SUCCESS_SCREEN) {
    onClose();
  }

  return (
    <Modal onClose={onClose} title={modalTitles[step]}>
      <>
        {step === LpRemoveSteps.SELECT_OPTIONS && (
          <RemoveLiquidityModal
            nextStep={nextStep}
            stepData={data as RemoveLiquidityStepData}
          />
        )}
        {step === LpRemoveSteps.HANDLE_STATE && (
          <StatusModalRemoveLiquidity
            onClose={onClose}
            nextStep={nextStep}
            stepData={data as StatusModalRemoveLiquidityStepData}
          />
        )}
        {step === LpRemoveSteps.SUCCESS_SCREEN && (
          <TransactionConfirmationModal
            onClose={onClose}
            stepData={data as ConfirmStepData}
          />
        )}
      </>
    </Modal>
  );
};

export default RemoveLiquidityManager;
