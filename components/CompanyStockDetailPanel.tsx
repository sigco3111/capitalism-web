import React, { useState, useMemo, useRef, useEffect } from 'react';
import type { Company, SharePriceHistory } from '../types';
import { ArrowLeftIcon, BanknotesIcon, ChartBarIcon, CashIcon } from './Icons';

declare const d3: any;

interface CompanyStockDetailPanelProps {
    playerCompany: Company;
    targetCompany: Company;
    onBack: () => void;
    onTrade: (targetCompanyId: string, shares: number) => void;
}

const formatCurrency = (amount: number, digits = 2) => `$${amount.toLocaleString('en-US', { minimumFractionDigits: digits, maximumFractionDigits: digits })}`;

const Stat: React.FC<{ label: string; value: string; icon: React.ReactNode }> = ({ label, value, icon }) => (
    <div className="bg-slate-700/50 p-3 rounded-lg flex items-center space-x-3">
        {icon}
        <div>
            <p className="text-sm text-slate-400">{label}</p>
            <p className="text-lg font-bold text-slate-100">{value}</p>
        </div>
    </div>
);

const StockChart: React.FC<{ data: SharePriceHistory[] }> = ({ data }) => {
    const svgRef = useRef<SVGSVGElement>(null);

    useEffect(() => {
        if (!data || data.length < 2 || !svgRef.current) return;

        const svg = d3.select(svgRef.current);
        svg.selectAll("*").remove();

        const width = 500;
        const height = 200;
        const margin = { top: 20, right: 20, bottom: 30, left: 50 };

        const x = d3.scaleTime()
            .domain(d3.extent(data, (d: SharePriceHistory) => new Date(d.date)))
            .range([margin.left, width - margin.right]);

        const y = d3.scaleLinear()
            .domain([d3.min(data, (d: SharePriceHistory) => d.price) * 0.95, d3.max(data, (d: SharePriceHistory) => d.price) * 1.05])
            .range([height - margin.bottom, margin.top]);

        const line = d3.line()
            .x((d: any) => x(new Date(d.date)))
            .y((d: any) => y(d.price));
            
        svg.attr("viewBox", `0 0 ${width} ${height}`);

        const path = svg.append("path")
            .datum(data)
            .attr("fill", "none")
            .attr("stroke", "#22c55e")
            .attr("stroke-width", 2)
            .attr("d", line);
            
        const totalLength = path.node().getTotalLength();

        path.attr("stroke-dasharray", totalLength + " " + totalLength)
          .attr("stroke-dashoffset", totalLength)
          .transition()
            .ease(d3.easeLinear)
            .attr("stroke-dashoffset", 0)
            .duration(1000);

        svg.append("g")
            .attr("transform", `translate(0,${height - margin.bottom})`)
            .call(d3.axisBottom(x).ticks(5).tickFormat(d3.timeFormat("%m/%d")))
            .selectAll("text").style("fill", "#94a3b8");

        svg.append("g")
            .attr("transform", `translate(${margin.left},0)`)
            .call(d3.axisLeft(y).ticks(5).tickFormat((d:any) => `$${d.toFixed(2)}`))
            .selectAll("text").style("fill", "#94a3b8");

    }, [data]);

    return <svg ref={svgRef} className="w-full h-auto"></svg>;
};

const CompanyStockDetailPanel: React.FC<CompanyStockDetailPanelProps> = ({ playerCompany, targetCompany, onBack, onTrade }) => {
    const [tradeAmount, setTradeAmount] = useState('100');
    const [tradeMode, setTradeMode] = useState<'buy' | 'sell'>('buy');
    
    const holding = playerCompany.ownedShares.find(h => h.companyId === targetCompany.id);
    const sharesOwned = holding?.shares || 0;
    const avgCost = holding?.avgCost || 0;
    
    const tradeValue = targetCompany.sharePrice * parseInt(tradeAmount || '0');
    const canAffordBuy = playerCompany.cash >= tradeValue;
    const canCoverSell = sharesOwned >= parseInt(tradeAmount || '0');

    const handleTrade = () => {
        const shares = parseInt(tradeAmount || '0');
        if (shares <= 0) return;
        onTrade(targetCompany.id, tradeMode === 'buy' ? shares : -shares);
        setTradeAmount('100');
    };

    return (
        <div className="w-full h-full p-4 md:p-6 text-white animate-fade-in-slow flex flex-col">
            <div className="flex items-center mb-6">
                <button onClick={onBack} className="p-2 rounded-full hover:bg-slate-700 transition-colors mr-4">
                    <ArrowLeftIcon className="w-6 h-6 text-sky-400" />
                </button>
                <div>
                    <h2 className="text-2xl md:text-3xl font-black text-green-400">{targetCompany.name}</h2>
                    <p className="text-slate-300">주식 상세 정보 및 거래</p>
                </div>
            </div>

            <div className="flex-grow bg-slate-800 p-6 rounded-lg border border-slate-700 flex flex-col space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <Stat label="현재 주가" value={formatCurrency(targetCompany.sharePrice)} icon={<BanknotesIcon className="w-7 h-7 text-green-400" />} />
                    <Stat label="총 매출" value={formatCurrency(targetCompany.revenue, 0)} icon={<ChartBarIcon className="w-7 h-7 text-sky-400" />} />
                    <Stat label="회사 자금" value={formatCurrency(targetCompany.cash, 0)} icon={<CashIcon className="w-7 h-7 text-emerald-400" />} />
                </div>
                
                <div>
                    <h3 className="text-lg font-bold text-slate-200 mb-2">주가 차트 (최근 30일)</h3>
                    <div className="bg-slate-900/50 p-2 rounded-lg">
                        <StockChart data={targetCompany.sharePriceHistory} />
                    </div>
                </div>

                <div className="bg-slate-900/50 p-4 rounded-lg">
                    <h3 className="text-lg font-bold text-slate-200 mb-4">주식 거래</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="bg-slate-800 p-4 rounded-lg">
                            <h4 className="font-semibold text-center mb-2 text-sky-400">내 지분 현황</h4>
                            <div className="text-center">
                                <p className="text-3xl font-mono">{sharesOwned.toLocaleString()}</p>
                                <p className="text-sm text-slate-400">보유 주식</p>
                            </div>
                             <div className="text-center mt-2">
                                <p className="text-lg font-mono">{formatCurrency(avgCost)}</p>
                                <p className="text-sm text-slate-400">평균 매입 단가</p>
                            </div>
                        </div>
                        <div className="bg-slate-800 p-4 rounded-lg">
                             <div className="flex mb-3">
                                <button onClick={() => setTradeMode('buy')} className={`flex-1 py-2 text-center font-bold rounded-l-lg ${tradeMode === 'buy' ? 'bg-emerald-600 text-white' : 'bg-slate-700 hover:bg-slate-600'}`}>매수</button>
                                <button onClick={() => setTradeMode('sell')} className={`flex-1 py-2 text-center font-bold rounded-r-lg ${tradeMode === 'sell' ? 'bg-red-600 text-white' : 'bg-slate-700 hover:bg-slate-600'}`}>매도</button>
                            </div>
                            <input
                                type="number"
                                value={tradeAmount}
                                onChange={e => setTradeAmount(e.target.value)}
                                className="w-full bg-slate-700 border-slate-600 rounded-md p-2 text-center font-mono text-xl mb-3"
                                min="1"
                            />
                            <p className="text-center text-sm text-slate-400 mb-3">총 거래 금액: <span className="font-bold text-white">{formatCurrency(tradeValue)}</span></p>
                            <button
                                onClick={handleTrade}
                                disabled={(tradeMode === 'buy' && !canAffordBuy) || (tradeMode === 'sell' && !canCoverSell)}
                                className={`w-full py-2 font-bold rounded-lg transition-colors ${tradeMode === 'buy' ? 'bg-emerald-600 hover:bg-emerald-500' : 'bg-red-600 hover:bg-red-500'} disabled:bg-slate-600 disabled:cursor-not-allowed`}
                            >
                                {tradeMode === 'buy' ? '매수 확인' : '매도 확인'}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
             <style>{`
              @keyframes fade-in-slow { from { opacity: 0; } to { opacity: 1; } }
              .animate-fade-in-slow { animation: fade-in-slow 0.5s ease-out forwards; }
            `}</style>
        </div>
    );
};

export default CompanyStockDetailPanel;
