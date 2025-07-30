
import React from 'react';
import type { Country, City, Company } from '../types';
import { ArrowLeftIcon, BuildingOfficeIcon, UsersIcon, TrendingUpIcon } from './Icons';

interface MarketReportPanelProps {
    country: Country;
    onBack: () => void;
    aiCompanies?: Company[];
}

const generateCityData = (country: Country): City[] => {
    return (country.capital || []).map(c => {
        let incomeLevel: '낮음' | '중간' | '높음';
        if (country.population > 50_000_000) {
            incomeLevel = '높음';
        } else if (country.population > 10_000_000) {
            incomeLevel = '중간';
        } else {
            incomeLevel = '낮음';
        }
        
        let hash = 0;
        for (let i = 0; i < country.name.common.length; i++) {
            hash = country.name.common.charCodeAt(i) + ((hash << 5) - hash);
        }
        const pseudoRandom = (hash & 0x7FFFFFFF) / 0x7FFFFFFF;
        const economicGrowth = parseFloat(((pseudoRandom * 4) - 1).toFixed(2)); // Stable random: -1% to +3%

        return {
          name: c,
          population: country.population,
          incomeLevel,
          economicGrowth
        };
      });
};

const ReportStatCard: React.FC<{ icon: React.ReactNode; label: string; value: React.ReactNode; color: string }> = ({ icon, label, value, color }) => (
    <div className="bg-slate-700/50 p-6 rounded-xl border border-slate-600 flex items-start space-x-5">
        <div className={`p-3 rounded-full ${color}`}>
            {icon}
        </div>
        <div>
            <p className="text-base text-slate-300">{label}</p>
            <p className="text-3xl font-bold text-slate-50">{value}</p>
        </div>
    </div>
);

const MarketReportPanel: React.FC<MarketReportPanelProps> = ({ country, onBack, aiCompanies = [] }) => {
    const cities = generateCityData(country);
    const competitorsInCountry = aiCompanies.filter(c => c.operatingCountryNames.includes(country.name.common));

    return (
        <div className="w-full h-full p-4 md:p-6 text-white animate-fade-in-slow flex flex-col">
            <div className="flex items-center mb-6">
                <button onClick={onBack} className="p-2 rounded-full hover:bg-slate-700 transition-colors mr-4">
                    <ArrowLeftIcon className="w-6 h-6 text-sky-400" />
                </button>
                <div>
                    <h2 className="text-2xl md:text-3xl font-black text-purple-400">시장 보고서</h2>
                    <p className="text-slate-300">{country.name.common} 지역 분석</p>
                </div>
            </div>

            <div className="bg-slate-800 p-6 rounded-lg border border-slate-700 flex-grow overflow-y-auto">
                 {cities.length > 0 ? cities.map(city => (
                    <div key={city.name}>
                        <h3 className="text-2xl font-bold mb-4 text-slate-100">{city.name}</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            <ReportStatCard 
                                icon={<UsersIcon className="w-8 h-8 text-white"/>} 
                                label="인구" 
                                value={city.population.toLocaleString()} 
                                color="bg-blue-500/80" 
                            />
                            <ReportStatCard 
                                icon={<BuildingOfficeIcon className="w-8 h-8 text-white"/>} 
                                label="소득 수준" 
                                value={city.incomeLevel} 
                                color="bg-green-500/80" 
                            />
                            <ReportStatCard 
                                icon={<TrendingUpIcon className="w-8 h-8 text-white"/>} 
                                label="경제 성장률 (연간)" 
                                value={<span className={city.economicGrowth >= 0 ? 'text-emerald-400' : 'text-red-400'}>{`${city.economicGrowth > 0 ? '+' : ''}${city.economicGrowth.toFixed(2)}%`}</span>} 
                                color={city.economicGrowth >= 0 ? "bg-emerald-500/80" : "bg-red-500/80"} 
                            />
                        </div>
                        <p className="text-xs text-slate-500 mt-6 text-center">이 데이터는 국가 전체 데이터를 기반으로 한 추정치이며, 게임 내 경제 상황에 따라 변동될 수 있습니다.</p>
                    </div>
                 )) : (
                    <div className="text-center text-slate-400 p-8">
                        <p>이 지역에 대한 시장 보고서 데이터를 사용할 수 없습니다.</p>
                    </div>
                 )}

                 {competitorsInCountry.length > 0 && (
                    <div className="mt-8 pt-6 border-t border-slate-700">
                        <h3 className="text-xl font-bold mb-4 text-slate-100 flex items-center">
                            <UsersIcon className="w-6 h-6 mr-3 text-red-400" />
                            지역 내 경쟁사 현황
                        </h3>
                        <div className="space-y-3">
                            {competitorsInCountry.map(competitor => {
                                const storesInCountry = competitor.stores.filter(s => s.countryName === country.name.common);
                                return (
                                    <div key={competitor.id} className="bg-slate-700/50 p-4 rounded-lg flex justify-between items-center">
                                        <div>
                                            <p className="font-bold text-lg">{competitor.name}</p>
                                            <p className="text-sm text-slate-400">{storesInCountry.length}개 매장 운영 중</p>
                                        </div>
                                        <div className="text-right">
                                            <span className="font-mono text-sm font-semibold px-3 py-1 rounded-full bg-red-500/20 text-red-400 border border-red-500/30">경쟁사</span>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
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

export default MarketReportPanel;