import { toast } from "react-toastify";
import Image from "next/image";
import clsx from "clsx";

export const enum ToastType {
  SUCCESS = "SUCCESS",
  ERROR = "ERROR",
  WARNING = "WARNING",
  DEFAULT = "DEFAULT",
}

const iconByType = {
  [ToastType.SUCCESS]: "/success-toast-icon.svg",
  [ToastType.ERROR]: "/error-toast-icon.svg",
  [ToastType.WARNING]: "/warning-toast-icon.svg",
  [ToastType.DEFAULT]: "/default-toast-icon.svg",
}

const colorByType = {
  [ToastType.SUCCESS]: "primary",
  [ToastType.ERROR]: "red",
  [ToastType.WARNING]: "warn",
  [ToastType.DEFAULT]: "blue",
}

const shadowbyType = {
  [ToastType.SUCCESS]: "shadow-primary-light",
  [ToastType.ERROR]: "shadow-red-light",
  [ToastType.WARNING]: "shadow-warn-light",
  [ToastType.DEFAULT]: "shadow-blue-light",
}


export const showToast = ({ type, text }: { type: ToastType, text: string }) => {
  toast(
    <div>
      <div className="grid grid-cols-[1fr_6fr] grid-rows-2 gap-x-4 items-center">
        <div className="relative flex items-center justify-center h-[32px]">
          <div className={clsx("absolute w-[32px] h-[32px] rounded-full blur-[15px] opacity-50", `bg-${colorByType[type]}`)}></div>
          <Image
            src={iconByType[type]}
            alt={`${type}-icon`}
            className="absolute"
            width={20}
            height={20}
          />
        </div>

        <p className="font-semibold text-neutral-800">Error</p>

        <div></div>

        <p className="text-neutral-700 text-sm">{text}</p>
      </div>
    </div>,
    {
      className: clsx("bg-white border-l-4 rounded-md p-4 shadow-md", `border-${colorByType[type]}`, shadowbyType[type]),
      closeButton: true,
      autoClose: 1000,
      hideProgressBar: true,
    }
  );
};
