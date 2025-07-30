import React from 'react';
import type { Country, Company } from '../types';
import { GameStep } from '../types';
import { BASE_EXPANSION_COST } from '../constants';

interface CountryDetailPanelProps {
  country: Country;
  onConfirm: () => void;
  gameStep: GameStep;
  company?: Company | null;
  onExpand?: (country: Country) => void;
  onManageCountry?: (country: Country) => void;
  expansionCost?: number;
}

const Stat: React.FC<{ label: string; value: React.ReactNode }> = ({ label, value }) => (
    <div className="flex justify-between text-sm py-2 border-b border-slate-700">
        <span className="text-slate-400">{label}</span>
        <span className="font-semibold text-slate-100">{value}</span>
    </div>
);

const CountryDetailPanel: React.FC<CountryDetailPanelProps> = ({ country, onConfirm, gameStep, company, onExpand, onManageCountry, expansionCost = BASE_EXPANSION_COST }) => {
  const hasCapitalCity = country.capital && country.capital.length > 0 && country.capital[0];

  const renderButtons = () => {
    if (gameStep === GameStep.SELECT_COUNTRY) {
        return (
            <>
                <button
                    onClick={onConfirm}
                    disabled={!hasCapitalCity}
                    className="mt-6 w-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-3 px-4 rounded-lg transition-all duration-200 ease-in-out transform hover:scale-105 shadow-lg disabled:bg-slate-600 disabled:cursor-not-allowed disabled:hover:scale-100"
                >
                    {hasCapitalCity ? '여기에 본사 설립' : '설립 불가'}
                </button>
                {!hasCapitalCity && (
                    <p className="text-xs text-center text-red-400 mt-2">
                        주요 도시 정보가 없어 본사를 설립할 수 없습니다. 다른 국가를 선택해 주세요.
                    </p>
                )}
            </>
        )
    }

    if (gameStep === GameStep.VIEW_WORLD_MAP && company && onExpand && onManageCountry) {
        const isHq = company.hqCountry === country.name.common;
        const isOperating = company.operatingCountryNames.includes(country.name.common);
        const canAffordExpansion = company.cash >= expansionCost;

        if(isHq) {
            return (
                 <button
                    onClick={() => onManageCountry(country)}
                    className="mt-6 w-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-3 px-4 rounded-lg transition-all duration-200 ease-in-out transform hover:scale-105 shadow-lg"
                >
                    본사 운영 관리
                </button>
            )
        }
        
        if (isOperating) {
             return (
                 <button
                    onClick={() => onManageCountry(country)}
                    className="mt-6 w-full bg-sky-600 hover:bg-sky-500 text-white font-bold py-3 px-4 rounded-lg transition-all duration-200 ease-in-out transform hover:scale-105 shadow-lg"
                >
                    지사 운영 관리
                </button>
            )
        }

        return (
            <button
                onClick={() => onExpand(country)}
                disabled={!canAffordExpansion}
                className="mt-6 w-full bg-amber-600 hover:bg-amber-500 text-white font-bold py-3 px-4 rounded-lg transition-all duration-200 ease-in-out transform hover:scale-105 shadow-lg disabled:bg-slate-600 disabled:cursor-not-allowed disabled:hover:scale-100"
            >
                해외 지사 설립 (${expansionCost.toLocaleString()})
            </button>
        )
    }

    return null;
  }

  return (
    <div className="bg-slate-800 rounded-xl p-6 border border-slate-700 shadow-lg h-full flex flex-col animate-fade-in">
        <h3 className="font-bold text-xl text-sky-400 mb-4">국가 브리핑</h3>
        
        <div className="flex items-center space-x-4 mb-4">
            <img 
                src={country.flags.svg} 
                alt={country.flags.alt || `${country.name.common} 국기`} 
                className="w-16 h-auto rounded-md object-cover border-2 border-slate-600"
            />
            <div>
                <h4 className="text-lg font-bold">{country.name.common}</h4>
                <p className="text-sm text-slate-400">{country.region}</p>
            </div>
        </div>

        <div className="space-y-2 flex-grow">
            <Stat label="수도" value={country.capital?.[0] || '정보 없음'} />
            <Stat label="인구" value={country.population.toLocaleString()} />
            <Stat label="지역" value={country.subregion || country.region} />
        </div>
        
        {renderButtons()}
       
        <style>{`
          @keyframes fade-in {
            from { opacity: 0; transform: translateY(10px); }
            to { opacity: 1; transform: translateY(0); }
          }
          .animate-fade-in { animation: fade-in 0.5s ease-out forwards; }
        `}</style>
    </div>
  );
};

export default CountryDetailPanel;