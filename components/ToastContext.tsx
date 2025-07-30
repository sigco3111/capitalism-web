import React, { createContext, useContext } from 'react';
import type { Toast as ToastType } from '../types';

interface ToastContextType {
  addToast: (message: string, type?: ToastType['type']) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const useToasts = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToasts must be used within a ToastProvider');
  }
  return context;
};

export default ToastContext;
