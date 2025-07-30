import React, { useState } from 'react';
import type { Company, Loan } from '../types';
import { ArrowLeftIcon, ScaleIcon, CashIcon, BanknotesIcon, QuestionMarkCircleIcon } from './Icons';
import { LOAN_OFFERS, BASE_LOAN_INTEREST_RATE_PREMIUM } from '../constants';
import Tooltip from './Tooltip';

interface BankPanelProps {
    company: Company;
    onBack: () => void;
    onTakeOutLoan: (offer: { amount: number, termDays: number }) => void;
    onRepayLoan: (loanId: string, amount: number) => void;
    interestRate: number;
}

const formatCurrency = (amount: number, digits = 0) => `$${amount.toLocaleString('en-US', { minimumFractionDigits: digits, maximumFractionDigits: digits })}`;

const BankPanel: React.FC<BankPanelProps> = ({ company, onBack, onTakeOutLoan, onRepayLoan, interestRate }) => {
    const [repayAmounts, setRepayAmounts] = useState<{ [loanId: string]: string }>({});

    const handleRepayAmountChange = (loanId: string, value: string) => {
        setRepayAmounts(prev => ({ ...prev, [loanId]: value }));
    };

    const handleRepay = (loanId: string) => {
        const amount = parseFloat(repayAmounts[loanId] || '0');
        if (amount > 0) {
            onRepayLoan(loanId, amount);
            setRepayAmounts(prev => ({...prev, [loanId]: ''}));
        }
    };

    return (
        <div className="w-full h-full p-4 md:p-6 text-white animate-fade-in-slow flex flex-col">
            <div className="flex items-center mb-6">
                <button onClick={onBack} className="p-2 rounded-full hover:bg-slate-700 transition-colors mr-4">
                    <ArrowLeftIcon className="w-6 h-6 text-sky-400" />
                </button>
                <div>
                    <h2 className="text-2xl md:text-3xl font-black text-gray-400">은행</h2>
                    <p className="text-slate-300">대출을 통해 자금을 조달하고 관리합니다.</p>
                </div>
            </div>

            <div className="flex-grow bg-slate-800 p-6 rounded-lg border border-slate-700 space-y-8 overflow-y-auto">
                <div>
                    <h3 className="text-xl font-bold mb-4 text-sky-400 flex items-center gap-2">
                        <BanknotesIcon className="w-6 h-6" />
                        대출 상품
                        <Tooltip content="은행에서 제공하는 대출 상품입니다. 대출을 받아 현금 유동성을 확보할 수 있지만, 정기적으로 이자와 원금을 상환해야 합니다. 이자율은 세계 경제의 기준 금리에 따라 변동됩니다.">
                            <QuestionMarkCircleIcon className="w-5 h-5 text-slate-500 hover:text-sky-400" />
                        </Tooltip>
                    </h3>
                    <div className="space-y-4">
                        {LOAN_OFFERS.map(offer => {
                            const currentLoanInterestRate = (interestRate + BASE_LOAN_INTEREST_RATE_PREMIUM) * 100;
                            return (
                                <div key={offer.amount} className="bg-slate-700/50 p-4 rounded-lg flex justify-between items-center">
                                    <div>
                                        <p className="font-bold text-lg">{formatCurrency(offer.amount)}</p>
                                        <p className="text-sm text-slate-400">
                                            기간: {offer.termDays}일, 이자율: 연 {currentLoanInterestRate.toFixed(2)}%
                                        </p>
                                    </div>
                                    <button 
                                        onClick={() => onTakeOutLoan(offer)}
                                        className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-2 px-4 rounded-lg transition-transform duration-200 hover:scale-105 flex items-center gap-2"
                                    >
                                        <CashIcon className="w-5 h-5" />
                                        <span>대출 받기</span>
                                    </button>
                                </div>
                            );
                        })}
                    </div>
                </div>
                
                <div>
                    <h3 className="text-xl font-bold mb-4 text-amber-400 flex items-center gap-2">
                        <ScaleIcon className="w-6 h-6" />
                        현재 대출 현황 ({company.loans.length}건)
                    </h3>
                    <div className="space-y-4">
                        {company.loans.length > 0 ? company.loans.map(loan => (
                            <div key={loan.id} className="bg-slate-700/50 p-4 rounded-lg">
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
                                    <div>
                                        <p className="font-semibold">{formatCurrency(loan.principal)} 대출</p>
                                        <p className="text-xs text-slate-400">시작일: {new Date(loan.startDate).toLocaleDateString()}</p>
                                        <p className="text-xs text-slate-400">이자율: 연 {(loan.interestRate * 100).toFixed(2)}%</p>
                                    </div>
                                    <div className="text-center">
                                        <p className="text-lg font-mono">{formatCurrency(loan.remainingBalance, 2)}</p>
                                        <p className="text-sm text-slate-400">남은 원금</p>
                                    </div>
                                    <div className="flex items-center space-x-2">
                                        <input
                                            type="number"
                                            placeholder="상환 금액"
                                            value={repayAmounts[loan.id] || ''}
                                            onChange={(e) => handleRepayAmountChange(loan.id, e.target.value)}
                                            className="w-full bg-slate-800 border border-slate-600 rounded-md py-2 px-3 text-slate-100 focus:ring-2 focus:ring-sky-500"
                                        />
                                        <button 
                                            onClick={() => handleRepay(loan.id)}
                                            disabled={!repayAmounts[loan.id] || parseFloat(repayAmounts[loan.id]) <= 0 || company.cash < parseFloat(repayAmounts[loan.id])}
                                            className="bg-sky-600 hover:bg-sky-500 text-white font-bold py-2 px-4 rounded-lg transition-colors disabled:bg-slate-600 disabled:cursor-not-allowed">
                                            상환
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )) : (
                            <div className="text-center text-slate-500 py-8">
                                <p>현재 보유중인 대출이 없습니다.</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
            
            <style>{`
              @keyframes fade-in-slow {
                from { opacity: 0; }
                to { opacity: 1; }
              }
              .animate-fade-in-slow { animation: fade-in-slow 0.5s ease-out forwards; }
              input[type=number]::-webkit-inner-spin-button,
              input[type=number]::-webkit-outer-spin-button {
                -webkit-appearance: none;
                margin: 0;
              }
              input[type=number] {
                -moz-appearance: textfield;
              }
            `}</style>
        </div>
    );
};

export default BankPanel;