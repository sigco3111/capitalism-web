import React from 'react';
import { TrendingUpIcon, GlobeIcon } from './Icons';
import { EconomicCycle } from '../types';

interface GlobalEconomyPanelProps {
    interestRate: number;
    inflationRate: number;
    economicCycle: EconomicCycle;
}

const Stat: React.FC<{ label: string; value: React.ReactNode; trendDirection: 'up' | 'down' | 'stable' }> = ({ label, value, trendDirection }) => (
    <div className="bg-slate-700/50 p-6 rounded-xl text-center border border-slate-600">
        <p className="text-slate-300 text-lg">{label}</p>
        <p className="text-4xl font-bold text-white my-2">{value}</p>
        <div className={`flex items-center justify-center gap-1 font-semibold ${
            trendDirection === 'up' ? 'text-red-400' : 
            trendDirection === 'down' ? 'text-emerald-400' : 'text-slate-500'
        }`}>
            <TrendingUpIcon className={`w-5 h-5 ${trendDirection === 'down' ? 'transform rotate-180' : ''}`} />
            <span>{trendDirection === 'up' ? '상승' : trendDirection === 'down' ? '하락' : '안정'}</span>
        </div>
    </div>
);


const GlobalEconomyPanel: React.FC<GlobalEconomyPanelProps> = ({ interestRate, inflationRate, economicCycle }) => {
    // These are simplified trend indicators. A more complex implementation would track previous values.
    // For now, we compare against a baseline to show UI capability.
    const interestTrend = interestRate > 0.031 ? 'up' : interestRate < 0.029 ? 'down' : 'stable';
    const inflationTrend = inflationRate > 0.021 ? 'up' : inflationRate < 0.019 ? 'down' : 'stable';

    return (
        <div className="bg-slate-800 rounded-xl p-6 border border-slate-700 shadow-lg h-full flex flex-col justify-center animate-fade-in w-full">
            <div className="text-center mb-6">
                <GlobeIcon className="w-12 h-12 text-sky-500 mx-auto mb-4"/>
                <h3 className="font-bold text-xl text-sky-400">세계 경제 지표</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Stat 
                    label="기준 금리"
                    value={`${(interestRate * 100).toFixed(2)}%`}
                    trendDirection={interestTrend}
                />
                <Stat 
                    label="물가 상승률"
                    value={`${(inflationRate * 100).toFixed(2)}%`}
                    trendDirection={inflationTrend}
                />
            </div>

            <div className="mt-6 text-center bg-slate-700/50 p-4 rounded-xl border border-slate-600">
                 <p className="text-slate-300 text-lg">현재 경제 사이클</p>
                 <p className={`text-3xl font-bold my-1 ${
                    economicCycle === EconomicCycle.BOOM ? 'text-emerald-400' :
                    economicCycle === EconomicCycle.RECESSION ? 'text-red-400' :
                    'text-white'
                 }`}>
                    {economicCycle}
                 </p>
            </div>

            <p className="text-xs text-slate-500 mt-6 text-center">경제 지표는 분기별로 변동되며, 소비자 수요, 비용, 주가에 영향을 줍니다.</p>
        </div>
    );
};

export default GlobalEconomyPanel;