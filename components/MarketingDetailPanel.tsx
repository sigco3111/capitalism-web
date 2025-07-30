import React from 'react';
import type { Company, MarketingFirm, Product } from '../types';
import { ArrowLeftIcon, MegaphoneIcon, CashIcon } from './Icons';

interface MarketingDetailPanelProps {
    firm: MarketingFirm;
    company: Company;
    setCompany: React.Dispatch<React.SetStateAction<Company | null>>;
    onBack: () => void;
    allProducts: Omit<Product, 'stock' | 'price'>[];
    campaignCost: number;
}

const AutomationToggleSwitch: React.FC<{ enabled: boolean; onChange: (e: React.ChangeEvent<HTMLInputElement>) => void; label: string, description: string }> = ({ enabled, onChange, label, description }) => (
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

const CampaignToggleSwitch: React.FC<{ enabled: boolean; onChange: (e: React.ChangeEvent<HTMLInputElement>) => void; disabled?: boolean; }> = ({ enabled, onChange, disabled = false }) => (
    <label className={`relative ${disabled ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'}`}>
      <input type="checkbox" className="sr-only" checked={enabled} onChange={onChange} disabled={disabled} />
      <div className={`block w-14 h-8 rounded-full transition-all ${enabled ? 'bg-emerald-500' : 'bg-slate-600'}`}></div>
      <div className={`dot absolute left-1 top-1 bg-white w-6 h-6 rounded-full transition-transform ${enabled ? 'transform translate-x-6' : ''}`}></div>
    </label>
);


const MarketingDetailPanel: React.FC<MarketingDetailPanelProps> = ({ firm, company, setCompany, onBack, allProducts, campaignCost }) => {
    const handleManagerChange = (setting: 'autoManageCampaigns', value: boolean) => {
        setCompany(prev => {
            if (!prev) return null;
            return {
                ...prev,
                marketingFirms: prev.marketingFirms.map(f =>
                    f.id === firm.id
                    ? { ...f, manager: { ...(f.manager || { autoManageCampaigns: false }), [setting]: value } }
                    : f
                )
            };
        });
    };

    const handleCampaignToggle = (productId: string, isActive: boolean) => {
        setCompany(prev => {
            if (!prev) return null;
            const currentCampaigns = prev.activeMarketingCampaigns[firm.id] || [];
            let newCampaigns;
            if (isActive) {
                newCampaigns = [...currentCampaigns, productId];
            } else {
                newCampaigns = currentCampaigns.filter(id => id !== productId);
            }
            return {
                ...prev,
                activeMarketingCampaigns: {
                    ...prev.activeMarketingCampaigns,
                    [firm.id]: newCampaigns
                }
            };
        });
    };

    const activeCampaigns = company.activeMarketingCampaigns[firm.id] || [];
    const isManagerEnabled = firm.manager?.autoManageCampaigns ?? true;

    return (
        <div className="w-full h-full p-4 md:p-6 text-white animate-fade-in-slow flex flex-col">
            <div className="flex items-center mb-6">
                <button onClick={onBack} className="p-2 rounded-full hover:bg-slate-700 transition-colors mr-4">
                    <ArrowLeftIcon className="w-6 h-6 text-sky-400" />
                </button>
                <div>
                    <h2 className="text-2xl md:text-3xl font-black text-pink-400">{firm.cityName} 마케팅 에이전시</h2>
                    <p className="text-slate-300">제품별 브랜드 캠페인 관리</p>
                </div>
            </div>

            <div className="flex-grow bg-slate-800 p-6 rounded-lg border border-slate-700 overflow-y-auto space-y-8">
                <div>
                    <h3 className="text-xl font-bold mb-4 text-sky-400">마케팅 자동화</h3>
                    <AutomationToggleSwitch
                        label="AI 캠페인 관리"
                        description="AI가 자동으로 유망 상품을 선택하여 브랜드 캠페인을 관리합니다."
                        enabled={isManagerEnabled}
                        onChange={(e) => handleManagerChange('autoManageCampaigns', e.target.checked)}
                    />
                </div>

                <div>
                    <div className="flex justify-between items-center bg-slate-700/50 p-4 rounded-lg mb-6">
                        <div className="flex items-center gap-3">
                            <CashIcon className="w-7 h-7 text-emerald-400" />
                            <div>
                                <p className="text-sm text-slate-400">총 캠페인 일일 비용</p>
                                <p className="text-xl font-bold text-white">${(activeCampaigns.length * campaignCost).toLocaleString()}</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-3">
                            <MegaphoneIcon className="w-7 h-7 text-pink-400" />
                            <div>
                                <p className="text-sm text-slate-400">진행중인 캠페인</p>
                                <p className="text-xl font-bold text-white">{activeCampaigns.length} 개</p>
                            </div>
                        </div>
                    </div>

                    <div className="space-y-4">
                        {allProducts.map(product => {
                            const brandAwareness = company.brandAwareness?.[firm.countryName]?.[product.id] || 0;
                            const isCampaignActive = activeCampaigns.includes(product.id);

                            return (
                                <div key={product.id} className="bg-slate-700/50 p-4 rounded-lg flex justify-between items-center">
                                    <div>
                                        <p className="font-bold text-lg">{product.name}</p>
                                        <div className="flex items-center mt-2">
                                            <div className="w-36 text-sm text-slate-400">브랜드 인지도 ({firm.countryName})</div>
                                            <div className="w-48 bg-slate-600 rounded-full h-4">
                                                <div className="bg-pink-400 h-4 rounded-full text-xs flex items-center justify-center text-slate-900 font-bold" style={{ width: `${brandAwareness}%` }}>
                                                {brandAwareness.toFixed(1)}%
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-4">
                                        <div className="text-center">
                                            <p className={`font-semibold ${isManagerEnabled ? 'text-slate-500' : ''}`}>{isCampaignActive ? '캠페인 진행중' : '캠페인 비활성'}</p>
                                            <p className={`text-xs ${isManagerEnabled ? 'text-slate-600' : 'text-slate-400'}`}>일일 비용: ${campaignCost.toLocaleString()}</p>
                                        </div>
                                        <CampaignToggleSwitch
                                            enabled={isCampaignActive}
                                            onChange={(e) => handleCampaignToggle(product.id, e.target.checked)}
                                            disabled={isManagerEnabled}
                                        />
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

export default MarketingDetailPanel;