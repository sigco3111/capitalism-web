import React from 'react';
import type { Company, Country } from '../types';
import { ArrowLeftIcon, UsersIcon, GlobeIcon, CashIcon, ChartBarIcon, StoreIcon, BuildingOfficeIcon, LeafIcon, MegaphoneIcon, SparklesIcon } from './Icons';

interface CompetitorAnalysisPanelProps {
    aiCompanies: Company[];
    countries: Country[];
    onBack: () => void;
}

const formatCurrency = (amount: number) => {
    return `$${Math.round(amount).toLocaleString()}`;
};

const Stat: React.FC<{ icon: React.ReactNode; label: string; value: string; }> = ({ icon, label, value }) => (
    <div className="flex items-center space-x-3 bg-slate-700/50 p-3 rounded-md">
        {icon}
        <div>
            <p className="text-xs text-slate-400">{label}</p>
            <p className="text-base font-bold text-slate-100">{value}</p>
        </div>
    </div>
);

// 산업별 경쟁력 계산을 위한 상세 설정
const industryConfigs = {
    '식품/소매': {
        products: ['prod_cola', 'prod_chips', 'prod_bread', 'prod_cake', 'prod_frozen_pizza', 'prod_ice_cream', 'prod_premium_coffee'],
        techs: ['tech_food_processing'],
        stores: ['편의점'],
        factories: ['prod_bread', 'prod_cake', 'rm_sugar', 'prod_frozen_pizza', 'prod_ice_cream', 'prod_premium_coffee'],
    },
    '의류/직물': {
        products: ['prod_tshirt', 'prod_jeans', 'prod_jacket', 'prod_socks'],
        techs: ['tech_textiles'],
        stores: ['의류 매장'],
        factories: ['rm_fabric', 'prod_tshirt', 'prod_jeans', 'prod_jacket', 'prod_socks'],
    },
    '전자': {
        products: ['prod_smartphone', 'prod_laptop', 'prod_tv', 'prod_drone'],
        techs: ['tech_electronics'],
        stores: ['전자제품 매장'],
        factories: ['prod_smartphone', 'prod_laptop', 'prod_tv', 'prod_drone'],
    },
    '소프트웨어': {
        products: ['prod_videogame', 'prod_os', 'prod_bizsoftware', 'prod_antivirus', 'prod_photo_editor'],
        techs: ['tech_software'],
        stores: ['전자제품 매장'],
        factories: ['prod_videogame', 'prod_os', 'prod_bizsoftware', 'prod_antivirus', 'prod_photo_editor'],
    },
    '자동차': {
        products: ['prod_car', 'prod_truck', 'prod_motorcycle'],
        techs: ['tech_automotive'],
        stores: ['자동차 대리점'],
        factories: ['prod_car', 'prod_truck', 'prod_motorcycle'],
    },
    '제약': {
        products: ['prod_painkiller', 'prod_antibiotics', 'prod_vitamins', 'prod_vaccine'],
        techs: ['tech_pharmaceuticals'],
        stores: ['약국'],
        factories: ['prod_painkiller', 'prod_antibiotics', 'prod_vitamins', 'prod_vaccine'],
    },
    '항공우주': {
        products: ['prod_airplane', 'prod_helicopter', 'prod_satellite'],
        techs: ['tech_aerospace'],
        stores: ['항공 쇼룸'],
        factories: ['prod_airplane', 'prod_helicopter', 'prod_satellite'],
    },
};

const calculateIndustryCompetitiveness = (company: Company): { [industry: string]: number } => {
    const competitiveness: { [industry: string]: number } = {};

    // 1. 산업별 경쟁력 계산
    for (const [industryName, config] of Object.entries(industryConfigs)) {
        let score = 0;

        // 기술 점수 (최대 25점)
        const requiredTechs = config.techs;
        if (requiredTechs.length > 0) {
            const unlockedCount = requiredTechs.filter(t => company.unlockedTechnologies.includes(t)).length;
            score += (unlockedCount / requiredTechs.length) * 25;
        }

        // 생산 규모 점수 (최대 25점)
        const relevantFactories = company.factories.filter(f => config.factories.includes(f.productId)).length;
        score += Math.min(relevantFactories / 3, 1) * 25; // 3개 이상일 때 만점

        // 소매 규모 점수 (최대 20점)
        const relevantStores = company.stores.filter(s => config.stores.includes(s.type)).length;
        score += Math.min(relevantStores / 10, 1) * 20; // 10개 이상일 때 만점

        // 제품 품질 점수 (최대 15점)
        if (config.products.length > 0) {
            const qualities = config.products.map(pId => company.productQuality[pId] || 0);
            const avgQuality = qualities.reduce((a, b) => a + b, 0) / qualities.length;
            score += (avgQuality / 100) * 15;
        }

        // 브랜드 인지도 점수 (최대 15점)
        if (config.products.length > 0 && Object.keys(company.brandAwareness).length > 0) {
            let totalBrand = 0, brandCount = 0;
            for (const countryName in company.brandAwareness) {
                for (const pId of config.products) {
                    if (company.brandAwareness[countryName]?.[pId]) {
                        totalBrand += company.brandAwareness[countryName][pId];
                        brandCount++;
                    }
                }
            }
            const avgBrand = brandCount > 0 ? totalBrand / brandCount : 0;
            score += (avgBrand / 100) * 15;
        }
        
        competitiveness[industryName] = Math.round(Math.min(score, 100));
    }

    // 2. 농업 경쟁력 별도 계산
    const farmCount = company.farms.length;
    competitiveness['농업'] = Math.round(Math.min(farmCount / 5, 1) * 100); // 농장 5개일 때 만점

    return competitiveness;
};


const CompetitorAnalysisPanel: React.FC<CompetitorAnalysisPanelProps> = ({ aiCompanies, countries, onBack }) => {
    
    const countryMap = new Map(countries.map(c => [c.name.common, c]));

    return (
        <div className="w-full h-full p-4 md:p-6 text-white animate-fade-in-slow flex flex-col">
            <div className="flex items-center mb-6">
                <button onClick={onBack} className="p-2 rounded-full hover:bg-slate-700 transition-colors mr-4">
                    <ArrowLeftIcon className="w-6 h-6 text-sky-400" />
                </button>
                <div>
                    <h2 className="text-2xl md:text-3xl font-black text-red-400">경쟁사 분석</h2>
                    <p className="text-slate-300">경쟁 기업들의 활동을 주시하세요.</p>
                </div>
            </div>

            <div className="flex-grow overflow-y-auto pr-2 space-y-6">
                {aiCompanies.length > 0 ? aiCompanies.map(company => {
                    const hqCountry = countryMap.get(company.hqCountry);
                    const competitiveness = calculateIndustryCompetitiveness(company);
                    return (
                        <div key={company.id} className="bg-slate-800 p-6 rounded-lg border border-slate-700">
                            <div className="flex justify-between items-start mb-4">
                                <h3 className="text-2xl font-bold text-slate-100">{company.name}</h3>
                                {hqCountry && (
                                    <div className="flex items-center gap-2 text-sm bg-slate-700 px-3 py-1 rounded-full">
                                        <img src={hqCountry.flags.svg} alt={hqCountry.name.common} className="w-5 h-auto rounded-sm" />
                                        <span className="font-semibold">{hqCountry.name.common} 본사</span>
                                    </div>
                                )}
                            </div>
                            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                               <Stat 
                                   icon={<CashIcon className="w-6 h-6 text-emerald-400" />}
                                   label="자금"
                                   value={formatCurrency(company.cash)}
                                />
                                <Stat 
                                   icon={<ChartBarIcon className="w-6 h-6 text-sky-400" />}
                                   label="총 매출"
                                   value={formatCurrency(company.revenue)}
                                />
                                <Stat 
                                   icon={<StoreIcon className="w-6 h-6 text-amber-400" />}
                                   label="총 소매점"
                                   value={company.stores.length.toLocaleString()}
                                />
                                <Stat 
                                   icon={<BuildingOfficeIcon className="w-6 h-6 text-rose-400" />}
                                   label="총 공장"
                                   value={company.factories.length.toLocaleString()}
                                />
                                <Stat 
                                   icon={<LeafIcon className="w-6 h-6 text-green-400" />}
                                   label="총 농장"
                                   value={company.farms.length.toLocaleString()}
                                />
                                <Stat 
                                   icon={<MegaphoneIcon className="w-6 h-6 text-pink-400" />}
                                   label="마케팅 에이전시"
                                   value={company.marketingFirms.length.toLocaleString()}
                                />
                            </div>
                            
                            <div className="mt-6 pt-4 border-t border-slate-700/50">
                                <h4 className="text-base font-semibold text-slate-300 mb-3 flex items-center gap-2">
                                    <SparklesIcon className="w-5 h-5 text-teal-400" />
                                    산업별 경쟁력
                                </h4>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-3">
                                    {Object.entries(competitiveness)
                                        .sort(([, scoreA], [, scoreB]) => scoreB - scoreA)
                                        .map(([industry, score]) => (
                                        <div key={industry}>
                                            <div className="flex justify-between items-center mb-1 text-sm">
                                                <span className="font-medium text-slate-300">{industry}</span>
                                                <span className="font-mono font-bold text-white">{score}</span>
                                            </div>
                                            <div className="w-full bg-slate-700 rounded-full h-2.5">
                                                <div
                                                    className="bg-teal-500 h-2.5 rounded-full transition-all duration-500"
                                                    style={{ width: `${score}%` }}
                                                ></div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                            
                             <div className="mt-6">
                                <h4 className="text-base font-semibold text-slate-300 mb-2 flex items-center gap-2">
                                    <GlobeIcon className="w-5 h-5 text-slate-400" />
                                    진출 국가
                                </h4>
                                <div className="flex flex-wrap gap-2">
                                    {company.operatingCountryNames.map(countryName => {
                                        const countryData = countryMap.get(countryName);
                                        return countryData ? (
                                            <div key={countryName} className="flex items-center gap-2 bg-slate-700/50 px-3 py-1.5 rounded-md text-sm">
                                                <img src={countryData.flags.svg} alt={countryName} className="w-5 h-auto rounded-sm" />
                                                <span>{countryName}</span>
                                            </div>
                                        ) : null;
                                    })}
                                </div>
                            </div>
                        </div>
                    );
                }) : (
                     <div className="text-center text-slate-400 p-8 bg-slate-800 rounded-lg border border-slate-700 h-full flex flex-col justify-center items-center">
                        <UsersIcon className="w-12 h-12 text-slate-500 mb-4" />
                        <p className="text-lg">아직 시장에 경쟁사가 없습니다.</p>
                        <p className="text-sm mt-2">독점적인 지위를 누리세요!</p>
                    </div>
                )}
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

export default CompetitorAnalysisPanel;
