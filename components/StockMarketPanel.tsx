
import React from 'react';
import type { Company } from '../types';
import { ArrowLeftIcon, BanknotesIcon, ChartBarIcon, TrendingUpIcon, QuestionMarkCircleIcon } from './Icons';
import Tooltip from './Tooltip';

interface StockMarketPanelProps {
    playerCompany: Company;
    allCompanies: Company[];
    onBack: () => void;
    onViewDetail: (companyId: string) => void;
    onIPO: () => void;
    ipoReadinessThreshold: number;
}

const formatCurrency = (amount: number, compact = false) => {
    if (compact) {
        if (amount >= 1e9) return `$${(amount / 1e9).toFixed(2)}B`;
        if (amount >= 1e6) return `$${(amount / 1e6).toFixed(2)}M`;
        if (amount >= 1e3) return `$${(amount / 1e3).toFixed(2)}K`;
    }
    return `$${amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
};

const StockMarketPanel: React.FC<StockMarketPanelProps> = ({ playerCompany, allCompanies, onBack, onViewDetail, onIPO, ipoReadinessThreshold }) => {
    const publicCompanies = allCompanies.filter(c => c.isPublic);

    const hasEnoughRevenue = playerCompany.revenue >= ipoReadinessThreshold;
    const canIPO = !playerCompany.isPublic && hasEnoughRevenue;

    return (
        <div className="w-full h-full p-4 md:p-6 text-white animate-fade-in-slow flex flex-col">
            <div className="flex items-center mb-6">
                <button onClick={onBack} className="p-2 rounded-full hover:bg-slate-700 transition-colors mr-4">
                    <ArrowLeftIcon className="w-6 h-6 text-sky-400" />
                </button>
                <div>
                    <h2 className="text-2xl md:text-3xl font-black text-green-400">주식 시장</h2>
                    <p className="text-slate-300">기업 가치를 평가받고 경쟁사의 주식을 거래하세요.</p>
                </div>
            </div>

            <div className="flex-grow bg-slate-800 p-6 rounded-lg border border-slate-700 flex flex-col">
                {!playerCompany.isPublic && (
                    <div className="mb-6 bg-slate-700/50 border border-green-500/30 p-4 rounded-lg text-center">
                        <h3 className="text-lg font-bold text-green-400 flex items-center justify-center gap-2">
                            기업 공개 (IPO)
                            <Tooltip content="회사를 주식 시장에 처음으로 공개하는 것을 의미합니다. IPO를 통해 대규모 자금을 조달하여 사업 확장에 사용할 수 있습니다. 일반적으로 높은 매출을 기록해야 가능합니다.">
                                <QuestionMarkCircleIcon className="w-5 h-5 text-slate-500 hover:text-sky-400" />
                            </Tooltip>
                        </h3>
                        <p className="text-sm text-slate-300 my-2">회사를 주식 시장에 상장하여 막대한 자금을 조달하고 성장을 가속화하세요.</p>
                        <button 
                            onClick={onIPO}
                            disabled={!canIPO}
                            className="bg-green-600 hover:bg-green-500 text-white font-bold py-2 px-5 rounded-lg transition-transform duration-200 hover:scale-105 disabled:bg-slate-600 disabled:cursor-not-allowed disabled:hover:scale-100 disabled:opacity-50">
                            IPO 진행
                        </button>
                        {!canIPO && (
                            <p className="text-xs text-amber-400 mt-2">
                                총 매출 ${ipoReadinessThreshold.toLocaleString('en-US')} 이상을 달성하면 IPO를 진행할 수 있습니다.
                            </p>
                        )}
                    </div>
                )}

                <div className="flex-grow overflow-y-auto pr-2">
                    <div className="grid grid-cols-5 gap-4 px-4 py-2 text-sm font-bold text-slate-400 border-b border-slate-600">
                        <div className="col-span-2">회사명</div>
                        <div className="text-right">주가</div>
                        <div className="text-right">변동</div>
                        <div className="text-right">시가총액</div>
                    </div>
                    <ul className="space-y-2 mt-2">
                        {publicCompanies.map(c => {
                            const marketCap = c.sharePrice * c.sharesOutstanding;
                            const priceHistory = c.sharePriceHistory;
                            const oldPrice = priceHistory.length > 1 ? priceHistory[priceHistory.length - 2].price : c.sharePrice;
                            const change = c.sharePrice - oldPrice;
                            const changePercent = oldPrice > 0 ? (change / oldPrice) * 100 : 0;
                            const isPlayer = c.id === playerCompany.id;

                            return (
                                <li key={c.id} onClick={() => onViewDetail(c.id)}
                                    className={`grid grid-cols-5 gap-4 items-center p-4 rounded-lg cursor-pointer transition-colors duration-200 ${isPlayer ? 'bg-sky-500/10 border border-sky-500/30 hover:bg-sky-500/20' : 'bg-slate-700/50 hover:bg-slate-700'}`}
                                >
                                    <div className="col-span-2 font-bold">{c.name} {isPlayer && '(나)'}</div>
                                    <div className="text-right font-mono text-lg">{formatCurrency(c.sharePrice)}</div>
                                    <div className={`text-right font-mono font-semibold flex items-center justify-end gap-1 ${change >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                                        <TrendingUpIcon className={`w-4 h-4 ${change < 0 ? 'transform rotate-180' : ''}`} />
                                        {changePercent.toFixed(2)}%
                                    </div>
                                    <div className="text-right font-mono">{formatCurrency(marketCap, true)}</div>
                                </li>
                            );
                        })}
                    </ul>
                    {publicCompanies.length === 0 && (
                        <div className="text-center text-slate-500 pt-10">
                            <p>아직 상장된 회사가 없습니다.</p>
                        </div>
                    )}
                </div>
            </div>
             <style>{`
              @keyframes fade-in-slow { from { opacity: 0; } to { opacity: 1; } }
              .animate-fade-in-slow { animation: fade-in-slow 0.5s ease-out forwards; }
            `}</style>
        </div>
    );
};

export default StockMarketPanel;