import ReactDOM from "react-dom";

export default function Modal({
  title,
  children,
  onClose,
  style,
}: {
  title?: string;
  children: React.ReactNode;
  onClose: () => void;
  style?: object;
}) {
  const modalRoot = document.getElementById("modal-root");

  if (!modalRoot) {
    console.error("Can not find id 'modal-root' in DOM.");
    return null;
  }

  const modalContent = (
    <div
      className="fixed z-20 inset-0 w-auto h-full overflow-y-auto bg-[rgb(0,0,0,0.5)] flex justify-center text-left pt-10 md:pt-0"
      onClick={onClose}
    >
      <div
        className="md:relative md:min-w-[570px] w-full md:w-auto md:mx-auto mt-auto md:mt-[5vh] md:mb-auto rounded-t-large md:rounded-large border-4 border-white bg-neutral-100"
        onClick={(e) => e.stopPropagation()}
        style={style}
      >
        {title && (
          <h2 className="text-foreground text-center text-xl w-full font-medium mt-7">
            {title}
          </h2>
        )}
        <div className="p-6">{children}</div>
      </div>
    </div>
  );

  return ReactDOM.createPortal(modalContent, modalRoot);
}
