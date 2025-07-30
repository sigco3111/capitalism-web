import React from 'react';
import type { Toast as ToastType } from '../types';
import { InformationCircleIcon, CheckCircleIcon, ExclamationCircleIcon, XIcon } from './Icons';

interface ToastProps extends ToastType {
  onClose: (id: string) => void;
}

const Toast: React.FC<ToastProps> = ({ id, message, type, onClose }) => {
  const getIcon = () => {
    switch (type) {
      case 'success':
        return <CheckCircleIcon className="w-6 h-6 text-emerald-400" />;
      case 'error':
        return <ExclamationCircleIcon className="w-6 h-6 text-red-400" />;
      case 'info':
        return <InformationCircleIcon className="w-6 h-6 text-sky-400" />;
      default:
        return null;
    }
  };

  const getBorderColor = () => {
    switch (type) {
      case 'success':
        return 'border-emerald-500/50';
      case 'error':
        return 'border-red-500/50';
      case 'info':
        return 'border-sky-500/50';
      default:
        return 'border-slate-600';
    }
  };

  return (
    <div 
        role="alert"
        className={`flex items-start p-4 w-full max-w-sm bg-slate-800 rounded-lg shadow-2xl border-l-4 ${getBorderColor()} transition-all duration-300 transform animate-toast-in`}>
      <div className="flex-shrink-0 mt-0.5">
        {getIcon()}
      </div>
      <div className="ml-3 w-0 flex-1">
        <p className="text-sm font-medium text-slate-100">{message}</p>
      </div>
      <div className="ml-4 flex-shrink-0 flex">
        <button onClick={() => onClose(id)} className="inline-flex text-slate-400 hover:text-slate-100 rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-800 focus:ring-sky-500">
          <span className="sr-only">Close</span>
          <XIcon className="h-5 w-5" />
        </button>
      </div>
    </div>
  );
};

export default Toast;
