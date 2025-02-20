import React, { useState } from "react";
import AddLiquidityModal, { AddLiquidityStepData } from "./AddLiquidityModal";
import StatusModal, { ConfirmStepData, StatusStepData } from "./StatusModalAddLiquidity";
import Modal from "@/app/modal";
import TransactionConfirmationModal from "../TransactionConfirmationModal";

export enum LpAddSteps {
  SELECT_OPTIONS = 1,
  HANDLE_STATE = 2,
  SUCCESS_SCREEN = 3,
}

const modalTitles = {
  [LpAddSteps.SELECT_OPTIONS]: undefined,
  [LpAddSteps.HANDLE_STATE]: "Deposit tokens",
  [LpAddSteps.SUCCESS_SCREEN]: undefined,
};

interface AddLiquidityManagerProps {
  onClose: () => void;
  initialStep?: LpAddSteps;
  stepData?: StatusStepData | ConfirmStepData | AddLiquidityStepData;
}

const AddLiquidityManager = ({
  onClose,
  initialStep,
  stepData,
}: AddLiquidityManagerProps) => {
  const [step, setStep] = useState(initialStep || LpAddSteps.SELECT_OPTIONS);
  const [data, setData] = useState(stepData);

  const nextStep = (data?: StatusStepData | ConfirmStepData) => {
    setStep((prev) => prev + 1);
    setData(data);
  };

  if (step > LpAddSteps.SUCCESS_SCREEN) {
    onClose();
  }

  return (
    <Modal onClose={onClose} title={modalTitles[step]}>
      <>
        {step === LpAddSteps.SELECT_OPTIONS && (
          <AddLiquidityModal
            nextStep={nextStep}
            stepData={data as AddLiquidityStepData}
          />
        )}
        {step === LpAddSteps.HANDLE_STATE && (
          <StatusModal
            onClose={onClose}
            nextStep={nextStep}
            stepData={data as StatusStepData}
          />
        )}
        {step === LpAddSteps.SUCCESS_SCREEN && (
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
