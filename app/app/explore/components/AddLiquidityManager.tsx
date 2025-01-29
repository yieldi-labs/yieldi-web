import React, { useState } from "react";
import AddLiquidityModal, { AddLiquidityStepData } from "./AddLiquidityModal";
import StatusModal, { ConfirmStepData, StatusStepData } from "./StatusModal";
import Modal from "@/app/modal";
import TransactionConfirmationModal from "./TransactionConfirmationModal";

export enum LpSteps {
  SELECT_OPTIONS = 1,
  HANDLE_STATE = 2,
  SUCCESS_SCREEN = 3,
}

const modalTitles = {
  [LpSteps.SELECT_OPTIONS]: undefined,
  [LpSteps.HANDLE_STATE]: "Deposit tokens",
  [LpSteps.SUCCESS_SCREEN]: undefined,
};

interface AddLiquidityManagerProps {
  onClose: () => void;
  initialStep?: LpSteps;
  stepData?: StatusStepData | ConfirmStepData | AddLiquidityStepData;
}

const AddLiquidityManager = ({
  onClose,
  initialStep,
  stepData,
}: AddLiquidityManagerProps) => {
  const [step, setStep] = useState(initialStep || LpSteps.SELECT_OPTIONS);
  const [data, setData] = useState(stepData);

  const nextStep = (data?: StatusStepData | ConfirmStepData) => {
    setStep((prev) => prev + 1);
    setData(data);
  };

  if (step > LpSteps.SUCCESS_SCREEN) {
    onClose();
  }

  return (
    <Modal onClose={onClose} title={modalTitles[step]}>
      <>
        {step === LpSteps.SELECT_OPTIONS && (
          <AddLiquidityModal
            nextStep={nextStep}
            stepData={data as AddLiquidityStepData}
          />
        )}
        {step === LpSteps.HANDLE_STATE && (
          <StatusModal
            onClose={onClose}
            nextStep={nextStep}
            stepData={data as StatusStepData}
          />
        )}
        {step === LpSteps.SUCCESS_SCREEN && (
          <TransactionConfirmationModal
            onClose={onClose}
            stepData={data as ConfirmStepData}
          />
        )}
      </>
    </Modal>
  );
};

export default AddLiquidityManager;
