import React from 'react';
import type { Country, City } from '../types';
import { StoreIcon, UsersIcon, BuildingOfficeIcon, ArrowLeftIcon, LeafIcon, MegaphoneIcon } from './Icons';

interface CitySelectionPanelProps {
  country: Country;
  onCitySelect: (city: City) => void;
  onCancel: () => void;
  buildingType: string;
  cost: number;
  factoryProductName?: string;
  farmRawMaterialName?: string;
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

const CitySelectionPanel: React.FC<CitySelectionPanelProps> = ({ country, onCitySelect, onCancel, buildingType, cost, factoryProductName, farmRawMaterialName }) => {
  const cities: City[] = generateCityData(country);

  const isFactory = buildingType === 'factory';
  const isFarm = buildingType === 'farm';
  const isMarketingFirm = buildingType === '마케팅 에이전시';
  
  let title = '소매점 설립';
  let description = '사업을 시작할 도시를 선택하세요.';
  let buttonText = `${buildingType} 설립`;
  let ButtonIcon = StoreIcon;
  let buttonColorClass = 'bg-sky-600 hover:bg-sky-500';

  if (isFactory) {
      title = '공장 설립';
      description = '생산 시설을 건설할 도시를 선택하세요.';
      buttonText = `${factoryProductName || ''} 공장 설립`;
      ButtonIcon = BuildingOfficeIcon;
      buttonColorClass = 'bg-purple-600 hover:bg-purple-500';
  } else if (isFarm) {
      title = '농장 건설';
      description = '농작물을 재배할 도시를 선택하세요.';
      buttonText = `${farmRawMaterialName || ''} 농장 건설`;
      ButtonIcon = LeafIcon;
      buttonColorClass = 'bg-green-600 hover:bg-green-500';
  } else if (isMarketingFirm) {
      title = '마케팅 에이전시 설립';
      description = '브랜드 캠페인을 시작할 도시를 선택하세요.';
      buttonText = `${buildingType} 설립`;
      ButtonIcon = MegaphoneIcon;
      buttonColorClass = 'bg-pink-600 hover:bg-pink-500';
  }


  return (
    <div className="w-full h-full p-4 md:p-6 text-white animate-fade-in-slow flex flex-col">
        <div className="flex items-center mb-6">
            <button onClick={onCancel} className="p-2 rounded-full hover:bg-slate-700 transition-colors mr-4">
                <ArrowLeftIcon className="w-6 h-6 text-sky-400" />
            </button>
            <div>
                <h2 className="text-2xl md:text-3xl font-black text-sky-400">{title}</h2>
                <p className="text-slate-300">{description}</p>
            </div>
        </div>
        
        <div className="flex-grow overflow-y-auto pr-2 space-y-4">
            {cities.map(city => (
                <div key={city.name} className="bg-slate-800 p-5 rounded-lg border border-slate-700 flex items-center justify-between hover:border-sky-500 transition-colors duration-200">
                    <div>
                        <h3 className="text-xl font-bold">{city.name}</h3>
                        <div className="flex items-center space-x-2 text-slate-400 mt-1">
                            <UsersIcon className="w-4 h-4" />
                            <span>인구: {city.population.toLocaleString()}</span>
                        </div>
                    </div>
                    <button 
                        onClick={() => onCitySelect(city)}
                        className={`${buttonColorClass} text-white font-bold py-2 px-4 rounded-lg transition-transform duration-200 hover:scale-105 flex items-center space-x-2`}
                    >
                        <ButtonIcon className="w-5 h-5"/>
                        <span>{buttonText} (${cost.toLocaleString()})</span>
                    </button>
                </div>
            ))}
             {cities.length === 0 && (
                <div className="text-center text-slate-400 p-8 bg-slate-800 rounded-lg border border-slate-700">
                    <p>이 국가에는 건설 가능한 주요 도시 정보가 없습니다.</p>
                    <p className="text-sm mt-2">다른 국가를 선택하여 다시 시도해 주세요.</p>
                </div>
            )}
        </div>

        <style>{`
          @keyframes fade-in-slow {
            from { opacity: 0; }
            to { opacity: 1; }
          }
          .animate-fade-in-slow { animation: fade-in-slow 0.8s ease-out forwards; }
        `}</style>
    </div>
  );
};

export default CitySelectionPanel;