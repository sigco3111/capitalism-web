import React from 'react';
import type { Company, RawMaterial } from '../types';
import { ArrowLeftIcon, TruckIcon, PackageIcon, PlusIcon } from './Icons';
import { RAW_MATERIAL_PURCHASE_AMOUNT } from '../constants';
import { useToasts } from './ToastContext';

interface LogisticsPanelProps {
    company: Company;
    setCompany: React.Dispatch<React.SetStateAction<Company | null>>;
    onBack: () => void;
    rawMaterials: RawMaterial[];
    manufacturableProducts: { [productId: string]: { name: string; recipe: { id: string; amount: number }[]; manufacturingCost: number; productionRate: number; } };
}

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

const LogisticsPanel: React.FC<LogisticsPanelProps> = ({ company, setCompany, onBack, rawMaterials, manufacturableProducts }) => {
    const { addToast } = useToasts();
    
    const formatCurrency = (amount: number) => {
        return `$${amount.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;
    };

    const handlePurchaseRawMaterial = (materialId: string) => {
        const material = rawMaterials.find(rm => rm.id === materialId);
        if (!material) return;

        const cost = material.cost * RAW_MATERIAL_PURCHASE_AMOUNT;
        
        if (company.cash < cost) {
            addToast("자금이 부족합니다.", 'error');
            return;
        }

        setCompany(prevCompany => {
            if (!prevCompany) return null;

            const newInventory = { ...prevCompany.centralInventory };
            newInventory[materialId] = (newInventory[materialId] || 0) + RAW_MATERIAL_PURCHASE_AMOUNT;

            return {
                ...prevCompany,
                cash: prevCompany.cash - cost,
                centralInventory: newInventory,
            };
        });
    };
    
    const handleManagerChange = (setting: 'autoPurchaseRawMaterials' | 'autoSupplyStores', value: boolean) => {
        setCompany(prevCompany => {
            if (!prevCompany) return null;
            return {
                ...prevCompany,
                logisticsManager: {
                    ...prevCompany.logisticsManager,
                    [setting]: value,
                }
            };
        });
    };

    const lastQuarter = company.quarterlyFinancialsHistory?.slice(-1)[0];
    const lastQuarterLogistics = lastQuarter?.logisticsExpenses || 0;
    const lastQuarterRevenue = lastQuarter?.revenue || 0;
    const logisticsAsPercentOfRevenue = lastQuarterRevenue > 0 ? (lastQuarterLogistics / lastQuarterRevenue) * 100 : 0;

    return (
        <div className="w-full h-full p-4 md:p-6 text-white animate-fade-in-slow flex flex-col">
            <div className="flex items-center mb-6">
                <button onClick={onBack} className="p-2 rounded-full hover:bg-slate-700 transition-colors mr-4">
                    <ArrowLeftIcon className="w-6 h-6 text-sky-400" />
                </button>
                <div>
                    <h2 className="text-2xl md:text-3xl font-black text-cyan-400">물류 센터</h2>
                    <p className="text-slate-300">원자재 구매 및 재고를 관리합니다.</p>
                </div>
            </div>

            <div className="flex-grow bg-slate-800 p-6 rounded-lg border border-slate-700 space-y-8">
                <div className="bg-slate-700/50 p-4 rounded-lg flex justify-between items-center">
                    <div>
                        <p className="text-sm text-slate-400">지난 분기 물류 비용</p>
                        <p className="text-2xl font-bold text-cyan-300">{formatCurrency(lastQuarterLogistics)}</p>
                    </div>
                    <div>
                        <p className="text-sm text-slate-400 text-right">매출 대비</p>
                        <p className="text-2xl font-bold text-cyan-300">{logisticsAsPercentOfRevenue.toFixed(2)}%</p>
                    </div>
                </div>

                <div>
                    <h3 className="text-xl font-bold mb-4 text-cyan-400">물류 자동화</h3>
                    <div className="space-y-3">
                        <ToggleSwitch
                            label="원자재 자동 구매"
                            description="원자재 재고가 부족할 때 자동으로 구매합니다."
                            enabled={company.logisticsManager?.autoPurchaseRawMaterials ?? true}
                            onChange={(e) => handleManagerChange('autoPurchaseRawMaterials', e.target.checked)}
                        />
                        <ToggleSwitch
                            label="매장 자동 공급"
                            description="매장 재고가 부족할 때 중앙 창고에서 자동으로 제품을 공급합니다."
                            enabled={company.logisticsManager?.autoSupplyStores ?? true}
                            onChange={(e) => handleManagerChange('autoSupplyStores', e.target.checked)}
                        />
                    </div>
                </div>

                <div>
                    <h3 className="text-xl font-bold mb-4 text-amber-400 flex items-center"><PackageIcon className="w-6 h-6 mr-2" /> 원자재</h3>
                    <div className="space-y-3">
                        {rawMaterials.map(material => {
                            const stock = company.centralInventory[material.id] || 0;
                            const canAfford = company.cash >= material.cost * RAW_MATERIAL_PURCHASE_AMOUNT;
                            return (
                                <div key={material.id} className="bg-slate-700/50 p-4 rounded-lg grid grid-cols-3 items-center gap-4">
                                    <div className="font-semibold">{material.name}</div>
                                    <div className="text-center">
                                        <span className="text-sm text-slate-400 mr-2">재고:</span>
                                        <span className="font-mono text-lg">{stock.toLocaleString()}</span>
                                    </div>
                                    <div className="text-right">
                                        <button 
                                            onClick={() => handlePurchaseRawMaterial(material.id)}
                                            disabled={!canAfford}
                                            className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-2 px-3 rounded-lg transition-transform duration-200 hover:scale-105 flex items-center gap-2 text-sm disabled:bg-slate-600 disabled:cursor-not-allowed"
                                        >
                                            <PlusIcon className="w-4 h-4"/>
                                            <span>구매 ({RAW_MATERIAL_PURCHASE_AMOUNT.toLocaleString()}개)</span>
                                        </button>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>

                <div>
                    <h3 className="text-xl font-bold mb-4 text-sky-400 flex items-center"><TruckIcon className="w-6 h-6 mr-2" /> 완제품 재고</h3>
                     <div className="space-y-3">
                        {Object.keys(manufacturableProducts).map(productId => {
                            const product = manufacturableProducts[productId];
                            const stock = company.centralInventory[productId] || 0;
                             return (
                                <div key={productId} className="bg-slate-700/50 p-4 rounded-lg grid grid-cols-3 items-center gap-4">
                                    <div className="font-semibold">{product.name}</div>
                                    <div className="text-center">
                                        <span className="text-sm text-slate-400 mr-2">재고:</span>
                                        <span className="font-mono text-lg">{stock.toLocaleString()}</span>
                                    </div>
                                    <div className="text-right text-slate-500 text-sm">
                                        공장에서 생산됨
                                    </div>
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
               .dot {
                transition: transform 0.2s ease-in-out;
              }
            `}</style>
        </div>
    );
};

export default LogisticsPanel;