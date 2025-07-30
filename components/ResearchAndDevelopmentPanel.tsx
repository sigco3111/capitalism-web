


import React from 'react';
import type { Company } from '../types';
import { ArrowLeftIcon, BeakerIcon, CashIcon, QuestionMarkCircleIcon, CheckCircleIcon, SparklesIcon } from './Icons';
import { ALL_PRODUCTS_DATABASE, RESEARCHABLE_TECHS, MANUFACTURABLE_PRODUCTS, BASE_RAW_MATERIALS } from '../constants';
import Tooltip from './Tooltip';

interface ResearchAndDevelopmentPanelProps {
    company: Company;
    onBack: () => void;
    investmentCost: number;
    onResearchTech: (techId: string) => void;
    onInvestQuality: (productId: string) => void;
    onToggleAutoInvestQuality: (enabled: boolean) => void;
}

const ToggleSwitch: React.FC<{ enabled: boolean; onChange: (e: React.ChangeEvent<HTMLInputElement>) => void; label: string, description: string }> = ({ enabled, onChange, label, description }) => (
  <label className="flex items-center justify-between cursor-pointer p-3 rounded-lg hover:bg-slate-700 transition-colors">
    <div>
        <span className="text-slate-100 font-semibold">{label}</span>
        <p className="text-xs text-slate-400">{description}</p>
    </div>
    <div className="relative">
      <input type="checkbox" className="sr-only" checked={enabled} onChange={onChange} />
      <div className={`block w-14 h-8 rounded-full transition-all ${enabled ? 'bg-emerald-500' : 'bg-slate-600'}`}></div>
      <div className={`dot absolute left-1 top-1 bg-white w-6 h-6 rounded-full transition-transform ${enabled ? 'transform translate-x-6' : ''}`}></div>
    </div>
  </label>
);


const ResearchAndDevelopmentPanel: React.FC<ResearchAndDevelopmentPanelProps> = ({ company, onBack, investmentCost, onResearchTech, onInvestQuality, onToggleAutoInvestQuality }) => {

    const allItemsMap = React.useMemo(() => {
        const map = new Map<string, string>();
        ALL_PRODUCTS_DATABASE.forEach(p => map.set(p.id, p.name));
        Object.entries(MANUFACTURABLE_PRODUCTS).forEach(([id, p]) => map.set(id, p.name));
        BASE_RAW_MATERIALS.forEach(rm => map.set(rm.id, rm.name));
        return map;
    }, []);
    
    const unlockedProducts = React.useMemo(() => {
        const products = new Set(ALL_PRODUCTS_DATABASE.filter(p => !Object.values(RESEARCHABLE_TECHS).some(t => t.unlocks.includes(p.id))).map(p => p.id));
        company.unlockedTechnologies.forEach(techId => {
            const tech = RESEARCHABLE_TECHS[techId];
            if (tech) {
                tech.unlocks.forEach(productId => products.add(productId));
            }
        });
        return ALL_PRODUCTS_DATABASE.filter(p => products.has(p.id));

    }, [company.unlockedTechnologies]);
    
    const isAutoInvestOn = company.researchManager?.autoInvestQuality ?? false;

    return (
        <div className="w-full h-full p-4 md:p-6 text-white animate-fade-in-slow flex flex-col">
            <div className="flex items-center mb-6">
                <button onClick={onBack} className="p-2 rounded-full hover:bg-slate-700 transition-colors mr-4">
                    <ArrowLeftIcon className="w-6 h-6 text-sky-400" />
                </button>
                <div>
                    <h2 className="text-2xl md:text-3xl font-black text-teal-400 flex items-center gap-2">
                        연구개발 센터
                    </h2>
                    <p className="text-slate-300">기술 혁신으로 시장을 선도하세요.</p>
                </div>
            </div>

            <div className="bg-slate-800 p-6 rounded-lg border border-slate-700 flex-grow overflow-y-auto space-y-8">
                <div>
                    <h3 className="text-xl font-bold mb-4 text-sky-400 flex items-center gap-2">
                       <BeakerIcon className="w-6 h-6" /> 
                       신기술 연구
                       <Tooltip content="핵심 기술을 연구하여 새로운 제품, 공장, 상점을 잠금 해제할 수 있습니다. 기술 연구는 미래 성장을 위한 필수적인 투자입니다.">
                            <QuestionMarkCircleIcon className="w-5 h-5 text-slate-500 hover:text-sky-400" />
                        </Tooltip>
                    </h3>
                     <div className="space-y-4">
                        {Object.entries(RESEARCHABLE_TECHS).map(([techId, tech]) => {
                            const isResearched = company.unlockedTechnologies.includes(techId);
                            const canAfford = company.cash >= tech.cost;

                            return (
                                <div key={techId} className="bg-slate-700/50 p-4 rounded-lg flex justify-between items-center">
                                    <div>
                                        <p className="font-bold text-lg">{tech.name}</p>
                                        <p className="text-sm text-slate-400 mt-1">{tech.description}</p>
                                        <p className="text-xs text-amber-400 mt-2">잠금 해제: {tech.unlocks.map(id => allItemsMap.get(id) || id).join(', ')}</p>
                                    </div>
                                    {isResearched ? (
                                        <div className="flex items-center gap-2 text-emerald-400 font-bold">
                                            <CheckCircleIcon className="w-6 h-6"/>
                                            <span>연구 완료</span>
                                        </div>
                                    ) : (
                                        <button
                                            onClick={() => onResearchTech(techId)}
                                            disabled={!canAfford}
                                            className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-2 px-4 rounded-lg transition-transform duration-200 hover:scale-105 flex items-center space-x-2 disabled:bg-slate-600 disabled:cursor-not-allowed disabled:hover:scale-100"
                                        >
                                            <CashIcon className="w-5 h-5" />
                                            <span>연구 (${tech.cost.toLocaleString()})</span>
                                        </button>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                </div>
                
                 <div>
                    <h3 className="text-xl font-bold mb-4 text-sky-400">R&D 자동화</h3>
                    <div className="bg-slate-700/50 p-3 rounded-lg">
                        <ToggleSwitch
                            label="자동 품질 개선"
                            description="AI가 주기적으로 유망 제품의 품질을 자동으로 개선합니다."
                            enabled={isAutoInvestOn}
                            onChange={(e) => onToggleAutoInvestQuality(e.target.checked)}
                        />
                    </div>
                </div>


                 <div>
                    <h3 className="text-xl font-bold mb-4 text-amber-400 flex items-center gap-2">
                        <SparklesIcon className="w-6 h-6" />
                        제품 품질 개선
                         <Tooltip content="지속적인 품질 투자를 통해 경쟁사 대비 우위를 점하고 판매량을 높일 수 있습니다. 품질은 100이 최대치이며, 시장 평균에 맞춰 서서히 조정되므로 꾸준한 관리가 필요합니다.">
                            <QuestionMarkCircleIcon className="w-5 h-5 text-slate-500 hover:text-sky-400" />
                        </Tooltip>
                    </h3>
                     <div className="space-y-4">
                        {unlockedProducts.map(product => {
                            const quality = company.productQuality[product.id] || 0;
                            const canAfford = company.cash >= investmentCost;
                            const isMaxQuality = quality >= 100;

                            return (
                                <div key={product.id} className="bg-slate-700/50 p-4 rounded-lg flex justify-between items-center">
                                    <div>
                                        <p className="font-bold text-lg">{product.name}</p>
                                        <div className="flex items-center mt-2">
                                            <div className="w-32 text-sm text-slate-400">현재 품질</div>
                                            <div className="w-40 bg-slate-600 rounded-full h-2.5">
                                                <div className="bg-amber-400 h-2.5 rounded-full" style={{ width: `${quality}%` }}></div>
                                            </div>
                                            <span className="ml-3 font-mono text-amber-300">{quality.toFixed(1)} / 100</span>
                                        </div>
                                    </div>
                                    <Tooltip content={isAutoInvestOn ? "자동 개선이 활성화되어 있어 수동 투자가 비활성화됩니다." : `클릭하여 품질 개선 (+10)`}>
                                        <button
                                            onClick={() => onInvestQuality(product.id)}
                                            disabled={!canAfford || isMaxQuality || isAutoInvestOn}
                                            className="bg-sky-600 hover:bg-sky-500 text-white font-bold py-2 px-4 rounded-lg transition-transform duration-200 hover:scale-105 flex items-center space-x-2 disabled:bg-slate-600 disabled:cursor-not-allowed disabled:hover:scale-100"
                                        >
                                            <CashIcon className="w-5 h-5" />
                                            <span>품질 개선 (+10 / ${investmentCost.toLocaleString()})</span>
                                        </button>
                                    </Tooltip>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>
            <style>{`
              @keyframes fade-in-slow {
                from { opacity: 0; }
                to { opacity: 1; }
              }
              .animate-fade-in-slow { animation: fade-in-slow 0.5s ease-out forwards; }
              .dot { transition: transform 0.2s ease-in-out; }
            `}</style>
        </div>
    );
};

export default ResearchAndDevelopmentPanel;