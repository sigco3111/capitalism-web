import React from 'react';
import type { NewsEvent } from '../types';
import { NewsEventType } from '../types';
import { InformationCircleIcon, TrendingUpIcon, UsersIcon, SparklesIcon, GlobeIcon, BellIcon } from './Icons';

interface NewsFeedPanelProps {
    isOpen: boolean;
    onClose: () => void;
    newsFeed: NewsEvent[];
}

const NewsIcon: React.FC<{type: NewsEventType, className: string}> = ({ type, className }) => {
    switch (type) {
        case NewsEventType.TUTORIAL:
            return <InformationCircleIcon className={className} />;
        case NewsEventType.ECONOMY:
            return <TrendingUpIcon className={className} />;
        case NewsEventType.COMPETITOR:
            return <UsersIcon className={className} />;
        case NewsEventType.PLAYER:
            return <SparklesIcon className={className} />;
        default:
            return <GlobeIcon className={className} />;
    }
};

const NewsFeedPanel: React.FC<NewsFeedPanelProps> = ({ isOpen, onClose, newsFeed }) => {
    const iconColorClass = (type: NewsEventType) => {
        switch (type) {
            case NewsEventType.TUTORIAL: return 'text-sky-400';
            case NewsEventType.ECONOMY: return 'text-amber-400';
            case NewsEventType.COMPETITOR: return 'text-red-400';
            case NewsEventType.PLAYER: return 'text-emerald-400';
            default: return 'text-slate-400';
        }
    };

    return (
        <>
            <div 
                className={`fixed inset-0 bg-black/60 z-50 transition-opacity duration-300 ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
                onClick={onClose}
            ></div>
            <div className={`fixed top-0 right-0 bottom-0 w-full max-w-md bg-slate-800 border-l border-slate-700 shadow-2xl z-50 transform transition-transform duration-300 ease-in-out ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}>
                <div className="flex flex-col h-full">
                    <div className="flex items-center justify-between p-4 border-b border-slate-700">
                        <h2 className="text-xl font-bold text-slate-100 flex items-center gap-3">
                            <BellIcon className="w-6 h-6 text-sky-400" />
                            뉴스 및 이벤트
                        </h2>
                        <button onClick={onClose} className="p-2 rounded-full hover:bg-slate-700 transition-colors">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                        </button>
                    </div>
                    
                    <div className="flex-grow overflow-y-auto p-4 space-y-3">
                        {newsFeed.length > 0 ? (
                            newsFeed.map(item => (
                                <div key={item.id} className={`p-4 rounded-lg bg-slate-700/50 flex gap-4 transition-all duration-300 ${!item.read ? 'border-l-4 border-sky-400' : 'border-l-4 border-transparent'}`}>
                                    <div className={`mt-1 ${iconColorClass(item.type)}`}>
                                        <NewsIcon type={item.type} className="w-6 h-6" />
                                    </div>
                                    <div className="flex-1">
                                        <div className="flex justify-between items-baseline">
                                            <h3 className="font-bold text-slate-100">{item.title}</h3>
                                            <span className="text-xs text-slate-500">{item.date.toLocaleDateString()}</span>
                                        </div>
                                        <p className="text-sm text-slate-300 mt-1">{item.message}</p>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="text-center text-slate-500 pt-20">
                                <BellIcon className="w-12 h-12 mx-auto mb-4" />
                                <p>아직 새로운 소식이 없습니다.</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </>
    );
};

export default NewsFeedPanel;
