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
  return (
    <div
      className="fixed z-10 inset-0 w-auto h-full overflow-y-auto bg-[rgb(0,0,0,0.5)] flex justify-center text-left"
      onClick={onClose}
    >
      <div
        className="relative z-20 max-w-2xl mx-auto mb-auto mt-[5vh] rounded-large border-4 border-white bg-neutral-100"
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
}
