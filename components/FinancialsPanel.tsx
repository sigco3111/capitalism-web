import React, { useState, useMemo } from 'react';
import type { Company } from '../types';
import { ArrowLeftIcon, ChartBarIcon, ScaleIcon, QuestionMarkCircleIcon, TrendingUpIcon } from './Icons';
import { INITIAL_CAPITAL, BASE_STORE_CONSTRUCTION_COST, BASE_RESEARCH_CENTER_COST, BASE_FACTORY_CONSTRUCTION_COST, BASE_RAW_MATERIALS, BASE_INITIAL_PRODUCTS, MANUFACTURABLE_PRODUCTS, IPO_SHARES_TO_SELL_PERCENT, TOTAL_SHARES_OUTSTANDING } from '../constants';
import Tooltip from './Tooltip';
import QuarterlyPerformanceChart from './QuarterlyPerformanceChart';


interface FinancialsPanelProps {
    company: Company;
    allCompanies: Company[];
    onBack: () => void;
}

const FinancialStat: React.FC<{ label: string; value: string; isPositive?: boolean; isTotal?: boolean; isSubtle?: boolean }> = ({ label, value, isPositive, isTotal, isSubtle }) => (
    <div className={`flex justify-between py-3 px-4 rounded-md ${isTotal ? 'bg-slate-700/50 mt-1' : ''}`}>
        <span className={`font-medium ${isTotal ? 'text-slate-100' : 'text-slate-400'}`}>{label}</span>
        <span className={`font-mono font-semibold ${isPositive === true ? 'text-emerald-400' : isPositive === false ? 'text-red-400' : 'text-slate-200'} ${isSubtle ? 'text-slate-400' : ''}`}>
            {value}
        </span>
    </div>
);


const FinancialsPanel: React.FC<FinancialsPanelProps> = ({ company, allCompanies, onBack }) => {
    const [activeTab, setActiveTab] = useState<'pnl' | 'balance' | 'chart'>('pnl');

    const formatCurrency = (amount: number) => {
        const options = { minimumFractionDigits: 2, maximumFractionDigits: 2 };
        if (amount < 0) {
            return `($${Math.abs(amount).toLocaleString('en-US', options)})`;
        }
        return `$${amount.toLocaleString('en-US', options)}`;
    };

    // P&L Calculations
    const { revenue, costOfGoodsSold, operatingExpenses, logisticsExpenses = 0, interestIncome = 0, interestExpense = 0, taxesPaid = 0 } = company;
    const grossProfit = revenue - costOfGoodsSold;
    const operatingIncome = grossProfit - operatingExpenses - logisticsExpenses;
    const preTaxIncome = operatingIncome + interestIncome - interestExpense;
    const netIncome = preTaxIncome - taxesPaid;


    // Balance Sheet Calculations (memoized for performance)
    const balanceSheetData = useMemo(() => {
        const storeInventoryValue = company.stores.reduce((total, store) => total + store.inventory.reduce((storeTotal, product) => storeTotal + (product.stock * product.cost), 0), 0);
        
        const centralInventoryValue = Object.entries(company.centralInventory || {}).reduce((total, [itemId, stock]) => {
            if (stock <= 0) return total;
            let itemCost = BASE_RAW_MATERIALS.find(rm => rm.id === itemId)?.cost || MANUFACTURABLE_PRODUCTS[itemId]?.manufacturingCost || BASE_INITIAL_PRODUCTS.find(p => p.id === itemId)?.cost || 0;
            return total + (stock * itemCost);
        }, 0);

        const inventoryValue = storeInventoryValue + centralInventoryValue;

        const investmentValue = company.ownedShares.reduce((total, holding) => {
            const targetCompany = allCompanies.find(c => c.id === holding.companyId);
            return total + (holding.shares * (targetCompany?.sharePrice || 0));
        }, 0);

        const ppe = (company.stores.length * BASE_STORE_CONSTRUCTION_COST) + 
                    (company.factories.length * BASE_FACTORY_CONSTRUCTION_COST) +
                    (company.hasResearchCenter ? BASE_RESEARCH_CENTER_COST : 0);
        
        const totalAssets = company.cash + inventoryValue + ppe + investmentValue;
        
        const liabilities = company.loans.reduce((total, loan) => total + loan.remainingBalance, 0);

        let contributedCapital = INITIAL_CAPITAL;
        if (company.isPublic) {
            const valuationAtIPO = (company.sharePriceHistory[0]?.price || 0) * TOTAL_SHARES_OUTSTANDING;
            const ipoCapital = valuationAtIPO * IPO_SHARES_TO_SELL_PERCENT;
            contributedCapital += ipoCapital;
        }
        
        const retainedEarnings = totalAssets - liabilities - contributedCapital;
        
        const totalEquity = contributedCapital + retainedEarnings;
        const discrepancy = totalAssets - (liabilities + totalEquity);

        return {
            cash: company.cash,
            inventoryValue,
            investmentValue,
            ppe,
            totalAssets,
            liabilities,
            contributedCapital,
            retainedEarnings,
            totalEquity,
            discrepancy
        };
    }, [company, allCompanies]);
    
    const TabButton: React.FC<{ label: string; icon: React.ReactNode; active: boolean; onClick: () => void }> = ({ label, icon, active, onClick }) => (
        <button
            onClick={onClick}
            className={`flex-1 flex items-center justify-center space-x-2 py-3 text-sm font-bold rounded-t-lg transition-colors ${
                active ? 'bg-slate-800 text-sky-400' : 'bg-slate-900 text-slate-400 hover:bg-slate-800/50'
            }`}
        >
            {icon}
            <span>{label}</span>
        </button>
    );

    return (
        <div className="w-full h-full p-4 md:p-6 text-white animate-fade-in-slow flex flex-col">
            <div className="flex items-center mb-6">
                <button onClick={onBack} className="p-2 rounded-full hover:bg-slate-700 transition-colors mr-4">
                    <ArrowLeftIcon className="w-6 h-6 text-sky-400" />
                </button>
                <div>
                    <h2 className="text-2xl md:text-3xl font-black text-sky-400">재무제표</h2>
                    <p className="text-slate-300">회사의 재무 상태를 분석합니다.</p>
                </div>
            </div>

            <div className="flex flex-col flex-grow">
                <div className="flex border-b border-slate-700">
                    <TabButton label="손익 계산서" icon={<ChartBarIcon className="w-5 h-5"/>} active={activeTab === 'pnl'} onClick={() => setActiveTab('pnl')} />
                    <TabButton label="대차대조표" icon={<ScaleIcon className="w-5 h-5"/>} active={activeTab === 'balance'} onClick={() => setActiveTab('balance')} />
                    <TabButton label="실적 차트" icon={<TrendingUpIcon className="w-5 h-5"/>} active={activeTab === 'chart'} onClick={() => setActiveTab('chart')} />
                </div>
                
                <div className="bg-slate-800 p-6 rounded-b-lg border border-t-0 border-slate-700 flex-grow">
                    {activeTab === 'pnl' && (
                        <div>
                            <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                                손익 계산서 (누적)
                                <Tooltip content="일정 기간 동안의 회사의 수익성을 보여주는 보고서입니다. 매출에서 모든 비용을 차감하여 순이익을 계산합니다.">
                                    <QuestionMarkCircleIcon className="w-5 h-5 text-slate-500 hover:text-sky-400" />
                                </Tooltip>
                            </h3>
                            <div className="space-y-1">
                                <FinancialStat label="총 매출 (Revenue)" value={formatCurrency(revenue)} isPositive={true}/>
                                <FinancialStat label="매출 원가 (COGS)" value={formatCurrency(-costOfGoodsSold)} isSubtle />
                                <div className="border-t border-slate-600/50 my-2"></div>
                                <FinancialStat label="매출 총이익 (Gross Profit)" value={formatCurrency(grossProfit)} isPositive={grossProfit >= 0} isTotal />
                                
                                <div className="pt-4 space-y-1">
                                     <FinancialStat label="판매 및 일반 관리비 (OpEx)" value={formatCurrency(-operatingExpenses)} isSubtle/>
                                     <FinancialStat label="물류비 (Logistics)" value={formatCurrency(-logisticsExpenses)} isSubtle />
                                     <div className="border-t border-slate-600/50 my-2"></div>
                                     <FinancialStat label="영업 이익 (Operating Income)" value={formatCurrency(operatingIncome)} isPositive={operatingIncome >= 0} isTotal />
                                </div>
                                 <div className="pt-4 space-y-1">
                                     <FinancialStat label="이자 수익 (Interest Income)" value={formatCurrency(interestIncome)} isPositive={interestIncome > 0} isSubtle/>
                                     <FinancialStat label="이자 비용 (Interest Expense)" value={formatCurrency(-interestExpense)} isPositive={false} isSubtle/>
                                     <div className="border-t border-slate-600/50 my-2"></div>
                                     <FinancialStat label="세전이익 (Pre-Tax Income)" value={formatCurrency(preTaxIncome)} isPositive={preTaxIncome >= 0} isTotal />
                                </div>
                                <div className="pt-4 space-y-1">
                                     <FinancialStat label="법인세 (Taxes)" value={formatCurrency(-taxesPaid)} isPositive={taxesPaid === 0} isSubtle />
                                     <div className="border-t border-slate-600/50 my-2"></div>
                                     <FinancialStat label="순이익 (Net Income)" value={formatCurrency(netIncome)} isPositive={netIncome >= 0} isTotal />
                                </div>
                            </div>
                             <p className="text-xs text-slate-500 mt-6 text-center">이 보고서는 게임 시작일부터 현재까지의 누적 데이터를 보여줍니다.</p>
                        </div>
                    )}

                    {activeTab === 'balance' && (
                        <div>
                            <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                                대차대조표
                                <Tooltip content="특정 시점의 회사의 재무 상태를 보여줍니다. 회사가 소유한 자산과 갚아야 할 부채, 그리고 주주의 지분인 자본으로 구성됩니다. '자산 = 부채 + 자본' 공식이 항상 성립합니다.">
                                    <QuestionMarkCircleIcon className="w-5 h-5 text-slate-500 hover:text-sky-400" />
                                </Tooltip>
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8">
                                {/* Assets */}
                                <div className="space-y-1">
                                    <h4 className="font-bold text-lg text-emerald-400 mb-2 border-b border-emerald-400/30 pb-1">자산 (Assets)</h4>
                                    <FinancialStat label="현금 (Cash)" value={formatCurrency(balanceSheetData.cash)} isSubtle />
                                    <FinancialStat label="재고 (Inventory)" value={formatCurrency(balanceSheetData.inventoryValue)} isSubtle />
                                    <FinancialStat label="투자 자산 (Investments)" value={formatCurrency(balanceSheetData.investmentValue)} isSubtle />
                                    <FinancialStat label="유형자산 (PP&E)" value={formatCurrency(balanceSheetData.ppe)} isSubtle />
                                    <div className="border-t border-slate-600/50 my-2"></div>
                                    <FinancialStat label="총 자산" value={formatCurrency(balanceSheetData.totalAssets)} isTotal />
                                </div>

                                {/* Liabilities & Equity */}
                                <div className="space-y-1 mt-6 md:mt-0">
                                    <h4 className="font-bold text-lg text-sky-400 mb-2 border-b border-sky-400/30 pb-1">부채 및 자본 (L & E)</h4>
                                    <FinancialStat label="부채 (Liabilities)" value={formatCurrency(balanceSheetData.liabilities)} isPositive={balanceSheetData.liabilities === 0} isSubtle />
                                    <div className="border-t border-slate-600/50 my-2"></div>
                                    <FinancialStat label={company.isPublic ? '자본금 (Share Capital)' : '납입 자본 (Contributed Capital)'} value={formatCurrency(balanceSheetData.contributedCapital)} isSubtle />
                                    <FinancialStat label="이익 잉여금 (Retained Earnings)" value={formatCurrency(balanceSheetData.retainedEarnings)} isPositive={balanceSheetData.retainedEarnings >= 0} isSubtle />
                                    <div className="border-t border-slate-600/50 my-2"></div>
                                    <FinancialStat label="총 자본" value={formatCurrency(balanceSheetData.totalEquity)} isPositive={balanceSheetData.totalEquity >= 0} isTotal/>
                                </div>
                            </div>
                             {Math.abs(balanceSheetData.discrepancy) > 1 && (
                                <p className="text-xs text-amber-400 mt-4 text-center">
                                    참고: 자산과 부채+자본의 차액({formatCurrency(balanceSheetData.discrepancy)})이 존재합니다. 이는 시뮬레이션 단순화 또는 부동소수점 계산으로 인해 발생할 수 있습니다.
                                </p>
                            )}
                            <p className="text-xs text-slate-500 mt-6 text-center">대차대조표는 특정 시점의 회사 재무 상태를 나타냅니다.</p>
                        </div>
                    )}
                    
                    {activeTab === 'chart' && (
                        <div>
                             <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                                분기별 실적
                                <Tooltip content="분기별 매출, 총 비용(매출원가+판관비), 순이익을 시각적으로 보여줍니다. 회사의 성장성과 수익성 추세를 파악하는 데 유용합니다.">
                                    <QuestionMarkCircleIcon className="w-5 h-5 text-slate-500 hover:text-sky-400" />
                                </Tooltip>
                            </h3>
                            <QuarterlyPerformanceChart data={company.quarterlyFinancialsHistory} />
                        </div>
                    )}
                </div>
            </div>
             <style>{`
              @keyframes fade-in-slow {
                from { opacity: 0; }
                to { opacity: 1; }
              }
              .animate-fade-in-slow { animation: fade-in-slow 0.5s ease-out forwards; }
            `}</style>
        </div>
    );
};

export default FinancialsPanel;