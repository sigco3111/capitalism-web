

import React from 'react';
import { GlobeIcon, PauseIcon, BellIcon, SaveIcon, LoadIcon, ResetIcon, ExclamationCircleIcon } from './Icons';

interface HeaderProps {
    gameDate?: Date;
    gameSpeed?: number;
    onGameSpeedChange?: (speed: number) => void;
    onToggleNews?: () => void;
    unreadNewsCount?: number;
}

const SpeedControlButton: React.FC<{
  onClick: () => void;
  isActive: boolean;
  children: React.ReactNode;
  title: string;
}> = ({ onClick, isActive, children, title }) => (
  <button
    type="button"
    title={title}
    onClick={onClick}
    className={`px-3 py-1.5 rounded-md text-sm font-semibold transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-900 focus:ring-sky-500 ${
      isActive
        ? 'bg-sky-500 text-white shadow'
        : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
    }`}
  >
    {children}
  </button>
);


const Header: React.FC<HeaderProps> = ({ gameDate, gameSpeed, onGameSpeedChange, onToggleNews, unreadNewsCount = 0 }) => {
  return (
    <header className="bg-slate-900/80 backdrop-blur-sm border-b border-slate-700/50 sticky top-0 z-50">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center space-x-3">
            <GlobeIcon className="h-8 w-8 text-sky-400" />
            <h1 className="text-2xl font-bold text-slate-100 tracking-tight">
              캐피탈리즘<span className="text-sky-400">월드</span>
            </h1>
          </div>
          <div className="flex items-center space-x-6">
            {gameDate && gameSpeed !== undefined && onGameSpeedChange && (
              <div className="flex items-center space-x-1.5 bg-slate-800 border border-slate-700/80 p-1.5 rounded-lg">
                  <SpeedControlButton onClick={() => onGameSpeedChange(0)} isActive={gameSpeed === 0} title="게임 일시정지">
                      <PauseIcon className="w-5 h-5"/>
                  </SpeedControlButton>
                  <SpeedControlButton onClick={() => onGameSpeedChange(1)} isActive={gameSpeed === 1} title="1배속">
                      1x
                  </SpeedControlButton>
                  <SpeedControlButton onClick={() => onGameSpeedChange(2)} isActive={gameSpeed === 2} title="2배속">
                      2x
                  </SpeedControlButton>
                  <SpeedControlButton onClick={() => onGameSpeedChange(4)} isActive={gameSpeed === 4} title="4배속">
                      4x
                  </SpeedControlButton>
              </div>
            )}
            {onToggleNews && (
                <button
                    type="button"
                    title="뉴스 및 이벤트"
                    onClick={onToggleNews}
                    className="relative p-2 rounded-full bg-slate-700 text-slate-300 hover:bg-slate-600 transition-colors duration-200"
                >
                    <BellIcon className="w-5 h-5"/>
                    {unreadNewsCount > 0 && (
                        <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-xs font-bold text-white">
                            {unreadNewsCount}
                        </span>
                    )}
                </button>
            )}
            {gameDate && (
                <div className="text-center">
                    <div className="text-lg font-bold text-slate-100">{gameDate.toLocaleDateString()}</div>
                    <div className="text-xs text-slate-400 -mt-1">Game Time</div>
                </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;