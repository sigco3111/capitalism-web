import React from 'react';
import type { Factory, Company } from '../types';
import { ArrowLeftIcon, BuildingOfficeIcon, PackageIcon, TrendingUpIcon } from './Icons';

interface FactoryDetailPanelProps {
    factory: Factory;
    setCompany: React.Dispatch<React.SetStateAction<Company | null>>;
    onBack: () => void;
    manufacturableProducts: { [productId: string]: { name: string; recipe: { id: string; amount: number }[]; manufacturingCost: number; productionRate: number; } };
}

const InfoCard: React.FC<{ icon: React.ReactNode; label: string; value: string; colorClass: string }> = ({ icon, label, value, colorClass }) => (
    <div className="bg-slate-700/50 p-4 rounded-lg flex items-center space-x-4">
        <div className={`p-3 rounded-full ${colorClass}`}>
            {icon}
        </div>
        <div>
            <p className="text-sm text-slate-400">{label}</p>
            <p className="text-xl font-bold text-slate-100">{value}</p>
        </div>
    </div>
);

const ToggleSwitch: React.FC<{ enabled: boolean; onChange: (e: React.ChangeEvent<HTMLInputElement>) => void; label: string, description: string }> = ({ enabled, onChange, label, description }) => (
  <label className="flex items-center justify-between cursor-pointer p-3 bg-slate-700/50 rounded-lg hover:bg-slate-700 transition-colors">
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

const FactoryDetailPanel: React.FC<FactoryDetailPanelProps> = ({ factory, setCompany, onBack, manufacturableProducts }) => {
    const productInfo = manufacturableProducts[factory.productId];

    const handleManagerChange = (setting: 'autoProduce', value: boolean) => {
        setCompany(prevCompany => {
            if (!prevCompany) return null;
            return {
                ...prevCompany,
                factories: prevCompany.factories.map(f => 
                    f.id === factory.id 
                    ? { ...f, manager: { ...(f.manager || { autoProduce: false }), [setting]: value } }
                    : f
                )
            };
        });
    };

    if (!productInfo) {
        return (
             <div className="w-full h-full p-4 md:p-6 text-white animate-fade-in-slow flex flex-col">
                <div className="flex items-center mb-6">
                    <button onClick={onBack} className="p-2 rounded-full hover:bg-slate-700 transition-colors mr-4">
                        <ArrowLeftIcon className="w-6 h-6 text-sky-400" />
                    </button>
                    <div>
                        <h2 className="text-2xl md:text-3xl font-black text-red-400">오류</h2>
                        <p className="text-slate-300">공장 정보를 불러올 수 없습니다.</p>
                    </div>
                </div>
            </div>
        )
    }

    return (
        <div className="w-full h-full p-4 md:p-6 text-white animate-fade-in-slow flex flex-col">
            <div className="flex items-center mb-6">
                <button onClick={onBack} className="p-2 rounded-full hover:bg-slate-700 transition-colors mr-4">
                    <ArrowLeftIcon className="w-6 h-6 text-sky-400" />
                </button>
                <div>
                    <h2 className="text-2xl md:text-3xl font-black text-purple-400">{factory.cityName} {productInfo.name} 공장</h2>
                    <p className="text-slate-300">생산 시설 관리</p>
                </div>
            </div>

            <div className="bg-slate-800 p-6 rounded-lg border border-slate-700 flex-grow">
                 <h3 className="text-xl font-bold mb-4 text-slate-100">공장 상태</h3>
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <InfoCard 
                        icon={<BuildingOfficeIcon className="w-6 h-6 text-white" />}
                        label="위치"
                        value={factory.cityName}
                        colorClass="bg-purple-500/80"
                    />
                     <InfoCard 
                        icon={<PackageIcon className="w-6 h-6 text-white" />}
                        label="생산품"
                        value={productInfo.name}
                        colorClass="bg-amber-500/80"
                    />
                     <InfoCard 
                        icon={<TrendingUpIcon className="w-6 h-6 text-white" />}
                        label="일일 생산량"
                        value={`${factory.productionRate.toLocaleString()} 개`}
                        colorClass="bg-sky-500/80"
                    />
                 </div>

                <div className="mt-8">
                     <h3 className="text-xl font-bold mb-4 text-slate-100">공장 자동화</h3>
                     <div className="bg-slate-700/50 p-4 rounded-lg">
                        <ToggleSwitch
                            label="자동 생산"
                            description="원자재가 충분할 경우 자동으로 제품을 생산합니다."
                            enabled={factory.manager?.autoProduce ?? true}
                            onChange={(e) => handleManagerChange('autoProduce', e.target.checked)}
                        />
                     </div>
                </div>
            </div>
             <style>{`
              @keyframes fade-in-slow {
                from { opacity: 0; }
                to { opacity: 1; }
              }
              .animate-fade-in-slow { animation: fade-in-slow 0.5s ease-out forwards; }
              .dot {
                transition: transform 0.2s ease-in-out;
              }
            `}</style>
        </div>
    );
};

export default FactoryDetailPanel;