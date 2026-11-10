import { X } from "lucide-react";

function Modal({
  isOpen,
  onClose,
  title,
  children,
  size = "medium",
}) {
  if (!isOpen) return null;

  const sizeClass =
    size === "large" ? "max-w-[680px]" : "max-w-[500px]";

  return (
    <div
      className="fixed inset-0 z-[1500] flex items-center justify-center bg-slate-900/55 p-4 max-[600px]:items-end max-[600px]:p-0"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label={title || "Dialog"}
        className={`w-full ${sizeClass} max-h-[90vh] overflow-y-auto rounded-[14px] bg-white shadow-[0_20px_60px_rgba(0,0,0,0.20)] max-[600px]:max-h-[90dvh] max-[600px]:rounded-t-[18px] max-[600px]:rounded-b-none`}
        onMouseDown={(event) => event.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-[#e8edf3] px-6 py-5 max-[600px]:px-[18px] max-[600px]:py-[18px]">
          <h2 className="text-lg font-semibold text-[#17243b]">
            {title}
          </h2>

          <button
            type="button"
            onClick={onClose}
            aria-label="Close dialog"
            className="rounded-md p-1 text-slate-500 transition hover:bg-slate-100 hover:text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <X size={21} />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 max-[600px]:p-[18px]">
          {children}
        </div>
      </div>
    </div>
  );
}

export default Modal;
