import React, { useRef, useEffect, useState } from 'react';

interface TooltipProps {
    content: React.ReactNode;
    children: React.ReactNode;
}

const Tooltip: React.FC<TooltipProps> = ({ content, children }) => {
    const [isVisible, setIsVisible] = useState(false);
    const wrapperRef = useRef<HTMLDivElement>(null);

    const handleToggle = (e: React.MouseEvent) => {
        e.stopPropagation();
        setIsVisible(prev => !prev);
    };

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
                setIsVisible(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);


    return (
        <div ref={wrapperRef} className="relative inline-flex items-center">
            <span onClick={handleToggle} className="flex items-center cursor-pointer">
                {children}
            </span>
            {isVisible && (
                <div 
                    className="absolute top-full left-1/2 -translate-x-1/2 mt-2 w-64 p-3 bg-slate-900 border border-slate-700 rounded-lg shadow-lg z-20 text-sm text-slate-300 animate-fade-in-fast"
                    onClick={(e) => e.stopPropagation()}
                >
                    {content}
                </div>
            )}
            <style>{`
                @keyframes fade-in-fast {
                    from { opacity: 0; transform: translateY(-5px) scale(0.95); }
                    to { opacity: 1; transform: translateY(0) scale(1); }
                }
                .animate-fade-in-fast { 
                    animation: fade-in-fast 0.2s ease-out forwards; 
                    transform-origin: top center;
                }
            `}</style>
        </div>
    );
};

export default Tooltip;