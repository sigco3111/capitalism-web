import React from 'react';
import Toast from './Toast';
import type { Toast as ToastType } from '../types';

interface ToastContainerProps {
  toasts: ToastType[];
  onClose: (id: string) => void;
}

const ToastContainer: React.FC<ToastContainerProps> = ({ toasts, onClose }) => {
  return (
    <>
        <div aria-live="assertive" className="fixed inset-0 flex items-end px-4 py-6 pointer-events-none sm:p-6 sm:items-start z-[100]">
            <div className="w-full flex flex-col items-center space-y-4 sm:items-end">
                {toasts.map((toast) => (
                    <Toast
                    key={toast.id}
                    id={toast.id}
                    message={toast.message}
                    type={toast.type}
                    onClose={onClose}
                    />
                ))}
            </div>
        </div>
        <style>{`
          @keyframes toast-in-right {
            from {
              transform: translateX(100%);
              opacity: 0;
            }
            to {
              transform: translateX(0);
              opacity: 1;
            }
          }
          .animate-toast-in {
            animation: toast-in-right 0.5s ease-out forwards;
          }
        `}</style>
    </>
  );
};

export default ToastContainer;
