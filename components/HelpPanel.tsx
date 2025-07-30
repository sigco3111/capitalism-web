import React from 'react';
import { ArrowLeftIcon, InformationCircleIcon, GlobeIcon, StoreIcon, BeakerIcon, BuildingOfficeIcon, CheckCircleIcon } from './Icons';

const HelpPanel: React.FC<{ onBack: () => void }> = ({ onBack }) => {
    
    const StepCard: React.FC<{
        step: string;
        title: string;
        icon: React.ReactNode;
        children: React.ReactNode;
    }> = ({ step, title, icon, children }) => (
        <div className="bg-slate-700/50 p-6 rounded-lg border border-slate-600 flex gap-6">
            <div className="flex flex-col items-center">
                <div className="bg-sky-500/20 text-sky-400 p-3 rounded-full mb-2">
                    {icon}
                </div>
                <div className="text-sky-400 font-bold">{step}</div>
            </div>
            <div>
                <h4 className="text-xl font-bold text-slate-100 mb-2">{title}</h4>
                <div className="text-slate-300 space-y-2 text-base">
                    {children}
                </div>
            </div>
        </div>
    );
    
    return (
        <div className="w-full h-full p-4 md:p-6 text-white animate-fade-in-slow flex flex-col">
            <div className="flex items-center mb-6">
                <button onClick={onBack} className="p-2 rounded-full hover:bg-slate-700 transition-colors mr-4">
                    <ArrowLeftIcon className="w-6 h-6 text-sky-400" />
                </button>
                <div>
                    <h2 className="text-2xl md:text-3xl font-black text-amber-400 flex items-center gap-3">
                        <InformationCircleIcon className="w-8 h-8"/>
                        도움말 및 초반 공략
                    </h2>
                    <p className="text-slate-300">성공적인 시작을 위한 가이드입니다.</p>
                </div>
            </div>

            <div className="flex-grow bg-slate-800 p-6 rounded-lg border border-slate-700 space-y-6 overflow-y-auto">
                <StepCard step="1단계" title="시작 국가 선택" icon={<GlobeIcon className="w-8 h-8" />}>
                    <p>게임을 시작할 때 가장 중요한 것은 **인구가 많은 국가** (예: 중국, 인도, 미국)를 선택하는 것입니다.</p>
                    <p>인구는 곧 잠재 고객의 수입니다. 인구가 많을수록 기본적인 수요가 보장되어 초반 수익 창출이 훨씬 수월합니다.</p>
                </StepCard>

                <StepCard step="2단계" title="첫 소매점 건설" icon={<StoreIcon className="w-8 h-8" />}>
                    <p>첫 수입원을 마련하기 위해 **편의점**부터 건설하세요. 이것이 당신의 제국을 위한 첫걸음입니다.</p>
                    <p>건설 후, 매장 관리 화면에서 **외부 조달**을 통해 '콜라', '감자칩' 같은 기본 상품의 재고를 확보해야 합니다. 초기에는 '자동 가격 설정'을 켜두는 것이 편리합니다.</p>
                </StepCard>

                <StepCard step="3단계" title="연구소 건설" icon={<BeakerIcon className="w-8 h-8" />}>
                    <p>편의점에서 안정적인 수입이 발생하기 시작하면, 다음 목표는 **연구개발(R&D) 센터**를 짓는 것입니다.</p>
                    <p>연구소는 장기적인 성장의 핵심입니다. R&D 패널에서 **'식품 가공 기술'**을 먼저 연구하여 케이크, 피자 같은 더 비싸고 수익성 높은 제품을 생산할 기반을 마련하세요.</p>
                </StepCard>
                
                <StepCard step="4단계" title="첫 공장 건설" icon={<BuildingOfficeIcon className="w-8 h-8" />}>
                    <p>'식품 가공 기술' 연구가 완료되면, 해당 기술로 잠금 해제된 제품(예: 빵, 케이크)을 만드는 **공장**을 지으세요.</p>
                    <p>외부에서 상품을 사 오는 것보다 직접 만들어 파는 것이 훨씬 저렴해서 **수익률이 크게 오릅니다**. 공장 가동에 필요한 원자재(밀가루, 설탕 등)는 물류 센터에서 구매해야 합니다.</p>
                </StepCard>
                
                <div className="bg-emerald-900/50 p-6 rounded-lg border border-emerald-500/30">
                    <h4 className="text-xl font-bold text-emerald-400 mb-2 flex items-center gap-3"><CheckCircleIcon className="w-7 h-7" />핵심 요약</h4>
                    <p className="text-slate-200 text-lg font-semibold">
                        <span className="text-amber-300">편의점</span> → 
                        <span className="text-amber-300">기본 상품 판매</span> → 
                        <span className="text-amber-300">연구소</span> → 
                        <span className="text-amber-300">공장</span>
                    </p>
                    <p className="mt-2 text-slate-300">이 단계를 통해 안정적인 현금 흐름을 만들면, 더 다양한 산업으로 확장할 자본을 마련할 수 있습니다.</p>
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

export default HelpPanel;