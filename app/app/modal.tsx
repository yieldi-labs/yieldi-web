export default function Modal({
  title,
  children,
  onClose,
  style,
}: {
  title: string;
  children: React.ReactNode;
  onClose: () => void;
  style?: object;
}) {
  const xIcon = (
    <svg className="icon" viewBox="0 0 24 24">
      <line x1="18" y1="6" x2="6" y2="18"></line>
      <line x1="6" y1="6" x2="18" y2="18"></line>
    </svg>
  );
  return (
    <div
      className="fixed z-10 inset-0 w-full h-full overflow-y-auto bg-[rgb(0,0,0,0.5)] flex justify-center text-left"
      onClick={onClose}
    >
      <div
        className="relative z-20 bg-background max-w-lg mx-auto mb-auto mt-[5vh] w-[95%] border"
        onClick={(e) => e.stopPropagation()}
        style={style}
      >
        <div className="flex border-b">
          <h2 className="flex-1 mt-0 leading-none font-bold text-2xl px-6  py-4 border-r tracking-wider">
            {title}
          </h2>
          <a className="cursor-pointer foreground p-4" onClick={onClose}>
            {xIcon}
          </a>
        </div>
        <div className="p-6">{children}</div>
      </div>
    </div>
  );
}
