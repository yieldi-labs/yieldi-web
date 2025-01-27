import React from "react";

export default function ConfirmationModal({
  nextStep
}: {
  nextStep: () => void;
}) {
  return (
    <div>
      Conrfirm modal
      <button onClick={nextStep} className="btn btn-primary">
        Continue
      </button>
    </div>
  );
}
