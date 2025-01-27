import React, { useState } from "react";
import AddLiquidityModal from "./AddLiquidityModal";
import StatusModal from "./StatusModal";
import ConfirmationModal from "./ConfirmationModal";
import Modal from "@/app/modal";

enum LpSteps {
    SELECT_OPTIONS = 1,
    HANDLE_STATE = 2,
    SUCCESS_SCREEN = 3,
}

const AddLiquidityManager = ({
    onClose,
    ...props // TODO: Remove use of ...props
}: any) => {
  const [step, setStep] = useState(LpSteps.SELECT_OPTIONS); // Controla el paso actual
//   const [data, setData] = useState({});

  const nextStep = () => setStep((prev) => prev + 1);
//   const prevStep = () => setStep((prev) => Math.max(prev - 1, 1));

  if (step > LpSteps.SUCCESS_SCREEN) {
    onClose()
  }

  console.log('step', step)

  return (
    <Modal onClose={onClose}>
        <>
            {step === LpSteps.SELECT_OPTIONS && <AddLiquidityModal nextStep={nextStep} {...props} />}
            {step === LpSteps.HANDLE_STATE && <StatusModal nextStep={nextStep} {...props} />}
            {step === LpSteps.SUCCESS_SCREEN && <ConfirmationModal nextStep={nextStep} {...props} />}
        </>
    </Modal>
  );
};

export default AddLiquidityManager;
