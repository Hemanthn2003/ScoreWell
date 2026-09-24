import type { ReactNode } from "react";

interface ModalProps {
  isOpen: boolean;
  title: string;
  message?: string;
  children?: ReactNode;
  onClose: () => void;
  type?: "success" | "error" | "info";
  closeButtonText?: string;
}

const Modal = ({
  isOpen,
  title,
  message,
  children,
  onClose,
  type = "info",
  closeButtonText = "Continue",
}: ModalProps) => {
  if (!isOpen) {
    return null;
  }

  const icon =
    type === "success"
      ? "✓"
      : type === "error"
        ? "!"
        : "i";

  const iconClasses =
    type === "success"
      ? "bg-green-100 text-green-600"
      : type === "error"
        ? "bg-red-100 text-red-600"
        : "bg-purple-100 text-purple-600";

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 px-4 backdrop-blur-sm">
      <div
        className="w-full max-w-md overflow-hidden rounded-2xl border border-purple-100 bg-white shadow-2xl"
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
      >
        <div className="h-1 w-full bg-gradient-to-r from-purple-700 via-purple-500 to-orange-400" />

        <div className="p-6 sm:p-7">
          <div className="flex flex-col items-center text-center">
            <div
              className={`mb-4 flex h-14 w-14 items-center justify-center rounded-full text-2xl font-bold ${iconClasses}`}
            >
              {icon}
            </div>

            <h2
              id="modal-title"
              className="text-xl font-bold text-purple-950"
            >
              {title}
            </h2>

            {message && (
              <p className="mt-2 text-sm leading-6 text-gray-600">
                {message}
              </p>
            )}

            {children && (
              <div className="mt-4 w-full">
                {children}
              </div>
            )}

            <button
              type="button"
              onClick={onClose}
              className="mt-6 w-full rounded-xl bg-purple-700 px-5 py-3 text-sm font-semibold text-white transition hover:bg-purple-800 active:scale-[0.99]"
            >
              {closeButtonText}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Modal;