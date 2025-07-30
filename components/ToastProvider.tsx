import React, { useState, useCallback } from 'react';
import ToastContext from './ToastContext';
import ToastContainer from './ToastContainer';
import type { Toast as ToastType } from '../types';

export const ToastProvider: React.FC<{children: React.ReactNode}> = ({ children }) => {
    const [toasts, setToasts] = useState<ToastType[]>([]);

    const removeToast = useCallback((id: string) => {
        setToasts(prev => prev.filter(t => t.id !== id));
    }, []);

    const addToast = useCallback((message: string, type: ToastType['type'] = 'info') => {
        const id = `toast_${Date.now()}_${Math.random()}`;
        
        setToasts(prev => {
            const recentToasts = prev.slice(-3);
            if (recentToasts.some(t => t.message === message)) {
                return prev;
            }
            return [...prev, { id, message, type }];
        });
        
        setTimeout(() => removeToast(id), 5000);
    }, [removeToast]);
    
    return (
        <ToastContext.Provider value={{ addToast }}>
            {children}
            <ToastContainer toasts={toasts} onClose={removeToast} />
        </ToastContext.Provider>
    )
}
