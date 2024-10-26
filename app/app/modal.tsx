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
      className="fixed z-[1000] inset-0 w-full h-full overflow-y-auto bg-[rgb(0,0,0,0.5)] flex items-center justify-center"
      onClick={onClose}
    >
      <div
        className="bg-white-radial border-4 border-white relative z-20 max-w-lg w-[95%] mx-auto rounded-xl p-7"
        onClick={(e) => e.stopPropagation()}
        style={style}
      >
        <div className="flex mb-4">
          <h2 className="flex-1 mt-0 leading-none text-xl font-gt-america font-medium">
            {title}
          </h2>
          <a className="cursor-pointer foreground pb-4" onClick={onClose}>
            {xIcon}
          </a>
        </div>
        <div>{children}</div>
      </div>
    </div>
  );
}
