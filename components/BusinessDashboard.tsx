




















import React from 'react';
import type { Company, Store, Factory, Country, Farm, MarketingFirm } from '../types';
import { CashIcon, ChartBarIcon, StoreIcon, BuildingOfficeIcon, TruckIcon, BeakerIcon, GlobeIcon, UsersIcon, BanknotesIcon, ScaleIcon, QuestionMarkCircleIcon, LeafIcon, MegaphoneIcon, ArrowLeftIcon, PlusIcon, SaveIcon, LoadIcon, ResetIcon, ExclamationCircleIcon } from './Icons';
import Tooltip from './Tooltip';
import { RESEARCHABLE_TECHS, MANUFACTURABLE_PRODUCTS } from '../constants';

interface BusinessDashboardProps {
  company: Company;
  operatingCountry: Country;
  stores: Store[];
  factories: Factory[];
  farms: Farm[];
  marketingFirms: MarketingFirm[];
  onBuildStore: (storeType: string) => void;
  onBuildFactory: (productId: string) => void;
  onBuildFarm: (rawMaterialId: string) => void;
  onBuildMarketingFirm: () => void;
  onBuildResearchCenter: () => void;
  onSelectStore: (store: Store) => void;
  onSelectFactory: (factory: Factory) => void;
  onSelectFarm: (farm: Farm) => void;
  onSelectMarketingFirm: (firm: MarketingFirm) => void;
  onViewFinancials: () => void;
  onViewMarketReport: () => void;
  onViewRandD: () => void;
  onViewLogistics: () => void;
  onViewCompetitorAnalysis: () => void;
  onViewWorldMap: () => void;
  onViewStockMarket: () => void;
  onViewBank: () => void;
  onViewHelp: () => void;
  onSaveGame: () => void;
  onLoadGame: () => void;
  onResetGame: () => void;
  isResetArmed: boolean;
  manufacturableProducts: { [productId: string]: { name: string; } };
  farmableRawMaterials: { [rawMaterialId: string]: { name: string; } };
  costs: {
    store: number;
    factory: number;
    researchCenter: number;
    electronicsFactory: number;
    dealership: number;
    automobileFactory: number;
    farm: number;
    marketingFirm: number;
    apparelStore: number;
    textileFactory: number;
    pharmacy: number;
    pharmaceuticalFactory: number;
    aviationShowroom: number;
    aircraftFactory: number;
    electronicsStore: number;
    softwareStudio: number;
  };
}

const BigStatCard: React.FC<{ icon: React.ReactNode; label: string; value: string; color: string }> = ({ icon, label, value, color }) => (
    <div className="bg-slate-800 p-6 rounded-lg border border-slate-700 flex flex-col justify-center space-y-2">
        <div className="flex items-center space-x-4">
            <div className={`p-4 rounded-full ${color}`}>
                {icon}
            </div>
            <p className="text-base text-slate-400">{label}</p>
        </div>
        <p className="text-4xl font-black text-slate-100 self-end break-all">{value}</p>
    </div>
);

const StatCard: React.FC<{ icon: React.ReactNode; label: string; value: string; color: string }> = ({ icon, label, value, color }) => (
    <div className="bg-slate-800 p-4 rounded-lg border border-slate-700 flex items-center space-x-4">
        <div className={`p-3 rounded-full ${color}`}>
            {icon}
        </div>
        <div>
            <p className="text-sm text-slate-400">{label}</p>
            <p className="text-2xl font-bold text-slate-100">{value}</p>
        </div>
    </div>
);


const BusinessDashboard: React.FC<BusinessDashboardProps> = ({ company, operatingCountry, stores, factories, farms, marketingFirms, onBuildStore, onBuildFactory, onBuildFarm, onBuildMarketingFirm, onSelectStore, onSelectFactory, onSelectFarm, onSelectMarketingFirm, onViewFinancials, onViewMarketReport, onBuildResearchCenter, onViewRandD, onViewLogistics, onViewCompetitorAnalysis, onViewWorldMap, onViewStockMarket, onViewBank, onViewHelp, onSaveGame, onLoadGame, onResetGame, isResetArmed, manufacturableProducts, farmableRawMaterials, costs }) => {
  const [isBuildingMode, setIsBuildingMode] = React.useState(false);
  const hasAssetsInCountry = stores.length > 0 || factories.length > 0 || farms.length > 0 || marketingFirms.length > 0;

  const FactoryButton: React.FC<{productId: string, label: string, cost: number, colorClass?: string}> = ({ productId, label, cost, colorClass = 'bg-purple-600 hover:bg-purple-500' }) => {
    const productInfo = MANUFACTURABLE_PRODUCTS[productId];
    const requiredTechId = productInfo?.requiredTech;
    const isTechUnlocked = !requiredTechId || company.unlockedTechnologies.includes(requiredTechId);
    
    const button = (
      <button
        onClick={() => onBuildFactory(productId)}
        disabled={!isTechUnlocked}
        className={`w-full text-center ${colorClass} text-white font-bold py-2 px-4 rounded-lg transition-transform duration-200 hover:scale-105 disabled:bg-slate-600 disabled:cursor-not-allowed disabled:hover:scale-100`}
      >
        {label} (${Math.round(cost).toLocaleString()})
      </button>
    );

    if (!isTechUnlocked && requiredTechId) {
      const techName = RESEARCHABLE_TECHS[requiredTechId]?.name || '필요한 기술';
      return (
        <Tooltip content={`${techName} 연구가 필요합니다.`}>
          <div className="w-full">{button}</div>
        </Tooltip>
      );
    }
    return button;
  };
  
  const StoreButton: React.FC<{storeType: string, label: string, cost: number, colorClass?: string}> = ({ storeType, label, cost, colorClass = 'bg-sky-600 hover:bg-sky-500' }) => {
    let requiredTechId: string | undefined;
    if (storeType === '의류 매장') requiredTechId = 'tech_textiles';
    if (storeType === '자동차 대리점') requiredTechId = 'tech_automotive';
    if (storeType === '약국') requiredTechId = 'tech_pharmaceuticals';
    if (storeType === '항공 쇼룸') requiredTechId = 'tech_aerospace';
    if (storeType === '전자제품 매장') requiredTechId = 'tech_electronics';

    const isTechUnlocked = !requiredTechId || company.unlockedTechnologies.includes(requiredTechId);

    const button = (
       <button onClick={() => onBuildStore(storeType)} disabled={!isTechUnlocked} className={`w-full text-center ${colorClass} text-white font-bold py-3 px-4 rounded-lg transition-transform duration-200 hover:scale-105 disabled:bg-slate-600 disabled:cursor-not-allowed disabled:hover:scale-100`}>
          {label} (${Math.round(cost).toLocaleString()})
       </button>
    );

    if (!isTechUnlocked && requiredTechId) {
       const techName = RESEARCHABLE_TECHS[requiredTechId]?.name || '필요한 기술';
       return (
        <Tooltip content={`${techName} 연구가 필요합니다.`}>
            <div className="w-full">{button}</div>
        </Tooltip>
       );
    }
    return button;
  };


  return (
    <div className="w-full h-full p-4 md:p-6 text-white animate-fade-in-slow">
      <h2 className="text-2xl md:text-3xl font-black mb-1">
        <span className="text-emerald-400">{operatingCountry.name.common}</span> 지사 운영
      </h2>
      <p className="text-slate-300 mb-6">귀사의 <span className="font-bold">{company.name}</span>은(는) 이 지역에서 사업을 진행 중입니다.</p>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <BigStatCard 
            icon={<CashIcon className="w-8 h-8 text-white"/>} 
            label="회사 자금 (전체)"
            value={`$${company.cash.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
            color="bg-emerald-500/80"
          />
          <BigStatCard 
            icon={<ChartBarIcon className="w-8 h-8 text-white"/>} 
            label="총 매출 (전체)"
            value={`$${company.revenue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
            color="bg-sky-500/80"
          />
      </div>
       <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <StatCard 
            icon={<StoreIcon className="w-6 h-6 text-white"/>} 
            label="지역 내 소매점"
            value={stores.length.toLocaleString()}
            color="bg-amber-500/80"
          />
          <StatCard 
            icon={<BuildingOfficeIcon className="w-6 h-6 text-white"/>} 
            label="지역 내 생산/지원시설"
            value={(factories.length + farms.length + marketingFirms.length).toLocaleString()}
            color="bg-purple-500/80"
          />
      </div>

      <div className="bg-slate-800 p-6 rounded-lg border border-slate-700">
        <h3 className="text-xl font-bold mb-4 text-emerald-400">운영 센터</h3>
        {!hasAssetsInCountry ? (
            <div className="text-center py-4">
                <p className="text-slate-300 mb-4">이 지역의 첫 번째 목표는 소매점을 여는 것입니다. 시장을 분석하고 제국을 시작할 도시를 선택하세요.</p>
                <button 
                    onClick={() => onBuildStore('편의점')}
                    className="bg-sky-600 hover:bg-sky-500 text-white font-bold py-2 px-4 rounded-lg transition-transform duration-200 hover:scale-105"
                >
                    첫 매장 설립 (비용: ${Math.round(costs.store).toLocaleString()})
                </button>
            </div>
        ) : isBuildingMode ? (
            <>
                <div className="flex justify-between items-center mb-4">
                    <h4 className="font-semibold text-lg text-slate-300 flex items-center gap-2">
                        신규 시설 건설
                        <Tooltip content="이 지역에 새로운 소매점이나 공장을 건설하여 사업을 확장할 수 있습니다. 일부 고급 시설은 특정 기술을 연구해야 잠금 해제됩니다.">
                            <QuestionMarkCircleIcon className="w-5 h-5 text-slate-500 hover:text-sky-400" />
                        </Tooltip>
                    </h4>
                    <button onClick={() => setIsBuildingMode(false)} className="bg-slate-600 hover:bg-slate-500 text-white font-bold py-2 px-3 rounded-lg transition-transform duration-200 hover:scale-105 text-sm flex items-center gap-2">
                        <ArrowLeftIcon className="w-4 h-4" /> 뒤로
                    </button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="space-y-4">
                        <h5 className="font-bold text-md mb-2 text-sky-400">소매점</h5>
                        <StoreButton storeType="편의점" label="편의점 설립" cost={costs.store} />
                        <StoreButton storeType="전자제품 매장" label="전자제품 매장 설립" cost={costs.electronicsStore} />
                        <StoreButton storeType="의류 매장" label="의류 매장 설립" cost={costs.apparelStore} />
                        <StoreButton storeType="약국" label="약국 설립" cost={costs.pharmacy} colorClass="bg-blue-600 hover:bg-blue-500" />
                        <StoreButton storeType="자동차 대리점" label="자동차 대리점 설립" cost={costs.dealership} />
                        <StoreButton storeType="항공 쇼룸" label="항공 쇼룸 설립" cost={costs.aviationShowroom} />
                    </div>
                    <div className="space-y-2">
                        <h5 className="font-bold text-md mb-2 text-purple-400">공장</h5>
                        <FactoryButton productId="prod_bread" label="제빵 공장" cost={costs.factory} />
                        <FactoryButton productId="prod_cake" label="케이크 공장" cost={costs.factory} />
                        <FactoryButton productId="prod_frozen_pizza" label="냉동 피자 공장" cost={costs.factory} />
                        <FactoryButton productId="prod_ice_cream" label="아이스크림 공장" cost={costs.factory} />
                         <FactoryButton productId="prod_premium_coffee" label="커피 로스팅 공장" cost={costs.factory} />
                        <FactoryButton productId="rm_fabric" label="직물 공장" cost={costs.textileFactory} colorClass="bg-rose-600 hover:bg-rose-500" />
                        <FactoryButton productId="prod_tshirt" label="티셔츠 공장" cost={costs.textileFactory} colorClass="bg-rose-600 hover:bg-rose-500" />
                        <FactoryButton productId="prod_jeans" label="청바지 공장" cost={costs.textileFactory} colorClass="bg-rose-600 hover:bg-rose-500" />
                        <FactoryButton productId="prod_jacket" label="자켓 공장" cost={costs.textileFactory} colorClass="bg-rose-600 hover:bg-rose-500" />
                        <FactoryButton productId="prod_socks" label="양말 공장" cost={costs.textileFactory} colorClass="bg-rose-600 hover:bg-rose-500" />
                        <FactoryButton productId="prod_painkiller" label="진통제 공장" cost={costs.pharmaceuticalFactory} colorClass="bg-fuchsia-600 hover:bg-fuchsia-500" />
                        <FactoryButton productId="prod_antibiotics" label="항생제 공장" cost={costs.pharmaceuticalFactory} colorClass="bg-fuchsia-600 hover:bg-fuchsia-500" />
                         <FactoryButton productId="prod_vitamins" label="비타민 공장" cost={costs.pharmaceuticalFactory} colorClass="bg-fuchsia-600 hover:bg-fuchsia-500" />
                        <FactoryButton productId="prod_vaccine" label="백신 공장" cost={costs.pharmaceuticalFactory} colorClass="bg-fuchsia-600 hover:bg-fuchsia-500" />
                        <FactoryButton productId="prod_smartphone" label="스마트폰 공장" cost={costs.electronicsFactory} colorClass="bg-indigo-600 hover:bg-indigo-500" />
                         <FactoryButton productId="prod_laptop" label="노트북 공장" cost={costs.electronicsFactory} colorClass="bg-indigo-600 hover:bg-indigo-500" />
                        <FactoryButton productId="prod_tv" label="TV 공장" cost={costs.electronicsFactory} colorClass="bg-indigo-600 hover:bg-indigo-500" />
                        <FactoryButton productId="prod_drone" label="드론 공장" cost={costs.electronicsFactory} colorClass="bg-indigo-600 hover:bg-indigo-500" />
                        <FactoryButton productId="prod_videogame" label="비디오 게임 스튜디오" cost={costs.softwareStudio} colorClass="bg-indigo-600 hover:bg-indigo-500" />
                        <FactoryButton productId="prod_os" label="운영체제 스튜디오" cost={costs.softwareStudio} colorClass="bg-indigo-600 hover:bg-indigo-500" />
                        <FactoryButton productId="prod_bizsoftware" label="비즈니스 S/W 스튜디오" cost={costs.softwareStudio} colorClass="bg-indigo-600 hover:bg-indigo-500" />
                         <FactoryButton productId="prod_antivirus" label="백신 S/W 스튜디오" cost={costs.softwareStudio} colorClass="bg-indigo-600 hover:bg-indigo-500" />
                        <FactoryButton productId="prod_photo_editor" label="사진편집 S/W 스튜디오" cost={costs.softwareStudio} colorClass="bg-indigo-600 hover:bg-indigo-500" />
                        <FactoryButton productId="prod_car" label="자동차 공장" cost={costs.automobileFactory} colorClass="bg-indigo-600 hover:bg-indigo-500" />
                         <FactoryButton productId="prod_truck" label="트럭 공장" cost={costs.automobileFactory} colorClass="bg-indigo-600 hover:bg-indigo-500" />
                        <FactoryButton productId="prod_motorcycle" label="오토바이 공장" cost={costs.automobileFactory} colorClass="bg-indigo-600 hover:bg-indigo-500" />
                        <FactoryButton productId="prod_airplane" label="항공기 공장" cost={costs.aircraftFactory} colorClass="bg-indigo-600 hover:bg-indigo-500" />
                         <FactoryButton productId="prod_satellite" label="인공위성 공장" cost={costs.aircraftFactory} colorClass="bg-indigo-600 hover:bg-indigo-500" />
                        <FactoryButton productId="prod_helicopter" label="헬리콥터 공장" cost={costs.aircraftFactory} colorClass="bg-indigo-600 hover:bg-indigo-500" />
                    </div>
                     <div className="space-y-4">
                        <h5 className="font-bold text-md mb-2 text-green-400">농장 & 지원</h5>
                        <div className="space-y-2">
                            {Object.entries(farmableRawMaterials).map(([id, material]) => (
                                 <button key={id} onClick={() => onBuildFarm(id)} className="w-full text-center bg-green-600 hover:bg-green-500 text-white font-bold py-3 px-4 rounded-lg transition-transform duration-200 hover:scale-105">{material.name} 농장 설립 (${Math.round(costs.farm).toLocaleString()})</button>
                            ))}
                            <button onClick={onBuildMarketingFirm} className="w-full text-center bg-pink-600 hover:bg-pink-500 text-white font-bold py-3 px-4 rounded-lg transition-transform duration-200 hover:scale-105">마케팅 에이전시 설립 (${Math.round(costs.marketingFirm).toLocaleString()})</button>
                        </div>
                    </div>
                </div>
            </>
        ) : (
             <div>
                 <div className="flex justify-between items-center mb-4 flex-wrap gap-2">
                    <p className="text-slate-300">자산을 선택하여 관리하거나 새로운 시설을 건설하세요.</p>
                     <div className="flex flex-wrap gap-2">
                        <button onClick={onViewWorldMap} className="bg-blue-600 hover:bg-blue-500 text-white font-bold py-2 px-3 rounded-lg transition-transform duration-200 hover:scale-105 text-sm flex items-center gap-2"><GlobeIcon className="w-4 h-4" /> 세계 지도</button>
                        <button onClick={onViewFinancials} className="bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-2 px-3 rounded-lg transition-transform duration-200 hover:scale-105 text-sm flex items-center gap-2"><ChartBarIcon className="w-4 h-4" /> 재무</button>
                        <button onClick={onViewBank} className="bg-gray-600 hover:bg-gray-500 text-white font-bold py-2 px-3 rounded-lg transition-transform duration-200 hover:scale-105 text-sm flex items-center gap-2"><ScaleIcon className="w-4 h-4" /> 은행</button>
                        <button onClick={onViewStockMarket} className="bg-green-600 hover:bg-green-500 text-white font-bold py-2 px-3 rounded-lg transition-transform duration-200 hover:scale-105 text-sm flex items-center gap-2"><BanknotesIcon className="w-4 h-4" /> 주식 시장</button>
                        <button onClick={onViewCompetitorAnalysis} className="bg-red-600 hover:bg-red-500 text-white font-bold py-2 px-3 rounded-lg transition-transform duration-200 hover:scale-105 text-sm flex items-center gap-2"><UsersIcon className="w-4 h-4" /> 경쟁사 분석</button>
                        <button onClick={onViewLogistics} className="bg-cyan-600 hover:bg-cyan-500 text-white font-bold py-2 px-3 rounded-lg transition-transform duration-200 hover:scale-105 text-sm flex items-center gap-2"><TruckIcon className="w-4 h-4" /> 물류 센터</button>
                        
                        {company.hasResearchCenter ? (
                            <button onClick={onViewRandD} className="bg-teal-600 hover:bg-teal-500 text-white font-bold py-2 px-3 rounded-lg transition-transform duration-200 hover:scale-105 text-sm flex items-center gap-2"><BeakerIcon className="w-4 h-4" /> R&D</button>
                        ) : (
                          <Tooltip content="R&D 센터를 건설하면 신기술 연구와 제품 품질 개선이 가능합니다.">
                            <button onClick={onBuildResearchCenter} className="bg-teal-600 hover:bg-teal-500 text-white font-bold py-2 px-3 rounded-lg transition-transform duration-200 hover:scale-105 text-sm">연구소 설립 (${Math.round(costs.researchCenter).toLocaleString()})</button>
                          </Tooltip>
                        )}
                        <button onClick={onViewMarketReport} className="bg-purple-600 hover:bg-purple-500 text-white font-bold py-2 px-3 rounded-lg transition-transform duration-200 hover:scale-105 text-sm">시장 보고서</button>
                        <button onClick={onViewHelp} className="bg-amber-600 hover:bg-amber-500 text-white font-bold py-2 px-3 rounded-lg transition-transform duration-200 hover:scale-105 text-sm flex items-center gap-2"><QuestionMarkCircleIcon className="w-4 h-4"/> 도움말</button>
                    </div>
                 </div>
                 
                <div className="mt-6 pt-4 border-t border-slate-700/50">
                    <h4 className="text-base font-semibold text-slate-400 mb-3">게임 관리</h4>
                    <div className="flex flex-wrap gap-2">
                         <button onClick={onSaveGame} className="bg-slate-500 hover:bg-slate-400 text-white font-bold py-2 px-3 rounded-lg transition-transform duration-200 hover:scale-105 text-sm flex items-center gap-2"><SaveIcon className="w-4 h-4" /> 저장</button>
                         <button onClick={onLoadGame} className="bg-slate-500 hover:bg-slate-400 text-white font-bold py-2 px-3 rounded-lg transition-transform duration-200 hover:scale-105 text-sm flex items-center gap-2"><LoadIcon className="w-4 h-4" /> 불러오기</button>
                         <button onClick={onResetGame} className={`font-bold py-2 px-3 rounded-lg transition-colors duration-200 text-sm flex items-center gap-2 text-white ${isResetArmed ? 'bg-red-600 hover:bg-red-500' : 'bg-slate-500 hover:bg-slate-400'}`}>
                            {isResetArmed ? <ExclamationCircleIcon className="w-4 h-4"/> : <ResetIcon className="w-4 h-4"/>}
                            {isResetArmed ? '클릭하여 확인' : '게임 초기화'}
                        </button>
                    </div>
                </div>

                 <div className="mt-6">
                    <div className="flex justify-between items-center mb-3">
                        <h4 className="font-semibold text-lg text-slate-300">지역 내 자산 목록</h4>
                        <button onClick={() => setIsBuildingMode(true)} className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-2 px-3 rounded-lg transition-transform duration-200 hover:scale-105 text-sm flex items-center gap-2">
                           <PlusIcon className="w-4 h-4" /> 신규 시설 건설
                        </button>
                    </div>
                    <ul className="space-y-3 max-h-60 overflow-y-auto pr-2">
                        {stores.map(store => (
                            <li key={store.id} onClick={() => onSelectStore(store)}
                                className="bg-slate-700/50 p-4 rounded-lg border border-slate-600 hover:border-sky-500 hover:bg-slate-700 transition-all duration-200 cursor-pointer flex justify-between items-center"
                            >
                                <div className="flex items-center gap-4">
                                    <StoreIcon className="w-6 h-6 text-amber-400" />
                                    <div>
                                        <p className="font-bold text-lg">{store.cityName} {store.type}</p>
                                        <p className="text-sm text-slate-400">{store.inventory.length}개 상품 취급</p>
                                    </div>
                                </div>
                                <span className="text-sky-400 font-semibold">매장 관리</span>
                            </li>
                        ))}
                         {factories.map(factory => {
                            const productInfo = manufacturableProducts[factory.productId];
                            return (
                                <li key={factory.id} onClick={() => onSelectFactory(factory)}
                                    className="bg-slate-700/50 p-4 rounded-lg border border-slate-600 hover:border-purple-500 hover:bg-slate-700 transition-all duration-200 cursor-pointer flex justify-between items-center"
                                >
                                    <div className="flex items-center gap-4">
                                        <BuildingOfficeIcon className="w-6 h-6 text-purple-400" />
                                        <div>
                                            <p className="font-bold text-lg">{factory.cityName} 공장</p>
                                            <p className="text-sm text-slate-400">{productInfo ? `'${productInfo.name}' 생산 중` : '알 수 없는 제품 생산'}</p>
                                        </div>
                                    </div>
                                    <span className="text-purple-400 font-semibold">공장 관리</span>
                                </li>
                            );
                        })}
                        {farms.map(farm => {
                            const farmInfo = farmableRawMaterials[farm.producesId];
                            return (
                                <li key={farm.id} onClick={() => onSelectFarm(farm)}
                                    className="bg-slate-700/50 p-4 rounded-lg border border-slate-600 hover:border-green-500 hover:bg-slate-700 transition-all duration-200 cursor-pointer flex justify-between items-center"
                                >
                                    <div className="flex items-center gap-4">
                                        <LeafIcon className="w-6 h-6 text-green-400" />
                                        <div>
                                            <p className="font-bold text-lg">{farm.cityName} 농장</p>
                                            <p className="text-sm text-slate-400">{farmInfo ? `'${farmInfo.name}' 생산 중` : '알 수 없는 작물 생산'}</p>
                                        </div>
                                    </div>
                                    <span className="text-green-400 font-semibold">농장 관리</span>
                                </li>
                            );
                        })}
                        {marketingFirms.map(firm => (
                            <li key={firm.id} onClick={() => onSelectMarketingFirm(firm)}
                                className="bg-slate-700/50 p-4 rounded-lg border border-slate-600 hover:border-pink-500 hover:bg-slate-700 transition-all duration-200 cursor-pointer flex justify-between items-center"
                            >
                                <div className="flex items-center gap-4">
                                    <MegaphoneIcon className="w-6 h-6 text-pink-400" />
                                    <div>
                                        <p className="font-bold text-lg">{firm.cityName} 마케팅 에이전시</p>
                                        <p className="text-sm text-slate-400">브랜드 캠페인 관리</p>
                                    </div>
                                </div>
                                <span className="text-pink-400 font-semibold">캠페인 관리</span>
                            </li>
                        ))}
                    </ul>
                 </div>
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

export default BusinessDashboard;