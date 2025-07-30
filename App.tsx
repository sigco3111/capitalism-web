

import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import Header from './components/Header';
import WorldMap from './components/WorldMap';
import CountryDetailPanel from './components/CountryDetailPanel';
import BusinessDashboard from './components/BusinessDashboard';
import CitySelectionPanel from './components/CitySelectionPanel';
import StoreDetailPanel from './components/StoreDetailPanel';
import FinancialsPanel from './components/FinancialsPanel';
import MarketReportPanel from './components/MarketReportPanel';
import ResearchAndDevelopmentPanel from './components/ResearchAndDevelopmentPanel';
import LogisticsPanel from './components/LogisticsPanel';
import FactoryDetailPanel from './components/FactoryDetailPanel';
import FarmDetailPanel from './components/FarmDetailPanel';
import MarketingDetailPanel from './components/MarketingDetailPanel';
import CompetitorAnalysisPanel from './components/CompetitorAnalysisPanel';
import StockMarketPanel from './components/StockMarketPanel';
import CompanyStockDetailPanel from './components/CompanyStockDetailPanel';
import CompanyNameInputModal from './components/CompanyNameInputModal';
import GlobalEconomyPanel from './components/GlobalEconomyPanel';
import NewsFeedPanel from './components/NewsFeedPanel';
import BankPanel from './components/BankPanel';
import HelpPanel from './components/HelpPanel';
import { ExclamationCircleIcon, XIcon } from './components/Icons';
import { fetchAllCountries } from './services/countryService';
import { generateCompanyNames } from './services/aiService';
import { BASE_STORE_CONSTRUCTION_COST, BASE_FACTORY_CONSTRUCTION_COST, BASE_INITIAL_PRODUCTS, PURCHASE_AMOUNT, BASE_RESEARCH_CENTER_COST, INITIAL_CAPITAL, MANUFACTURABLE_PRODUCTS, BASE_RAW_MATERIALS, RAW_MATERIAL_PURCHASE_AMOUNT, BASE_EXPANSION_COST, BASE_R_AND_D_QUALITY_COST, TOTAL_SHARES_OUTSTANDING, IPO_SHARES_TO_SELL_PERCENT, STOCK_PERFORMANCE_FACTOR, STOCK_PRICE_VOLATILITY, INITIAL_IPO_READINESS_THRESHOLD, INITIAL_INFLATION_RATE, INITIAL_INTEREST_RATE, BASE_LOAN_INTEREST_RATE_PREMIUM, LOAN_OFFERS, CORPORATE_TAX_RATE, BASE_ELECTRONICS_FACTORY_COST, ALL_PRODUCTS_DATABASE, BASE_DEALERSHIP_CONSTRUCTION_COST, BASE_AUTOMOBILE_FACTORY_COST, FARMABLE_RAW_MATERIALS, BASE_FARM_CONSTRUCTION_COST, BASE_MARKETING_FIRM_CONSTRUCTION_COST, BASE_MARKETING_CAMPAIGN_DAILY_COST, BASE_APPAREL_STORE_CONSTRUCTION_COST, BASE_TEXTILE_FACTORY_COST, RESEARCHABLE_TECHS, SHIPPING_COSTS, BASE_PHARMACY_CONSTRUCTION_COST, BASE_PHARMACEUTICAL_FACTORY_COST, BASE_AVIATION_SHOWROOM_COST, BASE_AIRCRAFT_FACTORY_COST, BASE_ELECTRONICS_STORE_COST, BASE_SOFTWARE_STUDIO_COST } from './constants';
import type { Country, Company, City, Store, Factory, Product, NewsEvent, Loan, QuarterlyFinancials, Farm, MarketingFirm } from './types';
import { GameStep, NewsEventType, EconomicCycle } from './types';
import { useToasts } from './components/ToastContext';

const GAME_SPEED_MS = 2000; // 2 seconds per day at 1x speed
const MAX_NEWS_EVENTS = 50;
const MARKET_NORMALIZATION_FACTOR = 0.005; // How fast quality trends to the market average
const SAVE_GAME_KEY = 'capitalismSimulatorSave';

const formatCurrencyForNews = (amount: number) => {
    return `$${Math.round(amount).toLocaleString('en-US')}`;
}

export default function App(): React.ReactNode {
  const [gameStep, setGameStep] = useState<GameStep>(GameStep.SELECT_COUNTRY);
  const [gameDate, setGameDate] = useState<Date>(new Date(2024, 0, 1));
  const [gameSpeed, setGameSpeed] = useState<number>(1);
  const [countries, setCountries] = useState<Country[]>([]);
  const [selectedCountry, setSelectedCountry] = useState<Country | null>(null);
  const [operatingCountry, setOperatingCountry] = useState<Country | null>(null);
  const [company, setCompany] = useState<Company | null>(null);
  const [aiCompanies, setAiCompanies] = useState<Company[]>([]);
  const [selectedStore, setSelectedStore] = useState<Store | null>(null);
  const [selectedFactory, setSelectedFactory] = useState<Factory | null>(null);
  const [selectedFarm, setSelectedFarm] = useState<Farm | null>(null);
  const [selectedMarketingFirm, setSelectedMarketingFirm] = useState<MarketingFirm | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [viewingFinancials, setViewingFinancials] = useState<boolean>(false);
  const [viewingMarketReport, setViewingMarketReport] = useState<boolean>(false);
  const [viewingRandD, setViewingRandD] = useState<boolean>(false);
  const [viewingLogistics, setViewingLogistics] = useState<boolean>(false);
  const [viewingCompetitorAnalysis, setViewingCompetitorAnalysis] = useState<boolean>(false);
  const [viewingStockMarket, setViewingStockMarket] = useState<boolean>(false);
  const [viewingBankPanel, setViewingBankPanel] = useState<boolean>(false);
  const [viewingHelp, setViewingHelp] = useState<boolean>(false);
  const [stockDetailCompanyId, setStockDetailCompanyId] = useState<string | null>(null);
  const [ipoReadinessThreshold, setIpoReadinessThreshold] = useState<number>(INITIAL_IPO_READINESS_THRESHOLD);
  const [isNamingCompany, setIsNamingCompany] = useState<boolean>(false);
  const [factoryToBuild, setFactoryToBuild] = useState<string | null>(null);
  const [farmToBuild, setFarmToBuild] = useState<string | null>(null);
  const [storeToBuild, setStoreToBuild] = useState<string | null>(null);
  const [buildingTypeToBuild, setBuildingTypeToBuild] = useState<string | null>(null);
  const [isResetArmed, setIsResetArmed] = useState(false);
  const resetTimeoutRef = useRef<number | null>(null);

  // Economic Model State
  const [inflation, setInflation] = useState<number>(INITIAL_INFLATION_RATE);
  const [interestRate, setInterestRate] = useState<number>(INITIAL_INTEREST_RATE);
  const [economicCycle, setEconomicCycle] = useState<EconomicCycle>(EconomicCycle.NORMAL);
  const [quartersInCurrentCycle, setQuartersInCurrentCycle] = useState<number>(0);
  
  // News & Events State
  const [newsFeed, setNewsFeed] = useState<NewsEvent[]>([]);
  const [isNewsOpen, setIsNewsOpen] = useState<boolean>(false);
  const unreadNewsCount = useMemo(() => newsFeed.filter(item => !item.read).length, [newsFeed]);
  
  // Market Averages
  const [marketAverageQuality, setMarketAverageQuality] = useState<{ [productId: string]: number }>({});
  const [marketAverageBrand, setMarketAverageBrand] = useState<{ [countryName: string]: { [productId: string]: number } }>({});

  const { addToast } = useToasts();

  const allCompanies = useMemo(() => (company ? [company, ...aiCompanies] : aiCompanies), [company, aiCompanies]);

  // Memoize current costs to avoid recalculating on every render
  const currentStoreCost = useMemo(() => BASE_STORE_CONSTRUCTION_COST * (1 + inflation), [inflation]);
  const currentDealershipCost = useMemo(() => BASE_DEALERSHIP_CONSTRUCTION_COST * (1 + inflation), [inflation]);
  const currentApparelStoreCost = useMemo(() => BASE_APPAREL_STORE_CONSTRUCTION_COST * (1 + inflation), [inflation]);
  const currentPharmacyCost = useMemo(() => BASE_PHARMACY_CONSTRUCTION_COST * (1 + inflation), [inflation]);
  const currentAviationShowroomCost = useMemo(() => BASE_AVIATION_SHOWROOM_COST * (1 + inflation), [inflation]);
  const currentElectronicsStoreCost = useMemo(() => BASE_ELECTRONICS_STORE_COST * (1 + inflation), [inflation]);
  const currentFactoryCost = useMemo(() => BASE_FACTORY_CONSTRUCTION_COST * (1 + inflation), [inflation]);
  const currentTextileFactoryCost = useMemo(() => BASE_TEXTILE_FACTORY_COST * (1 + inflation), [inflation]);
  const currentElectronicsFactoryCost = useMemo(() => BASE_ELECTRONICS_FACTORY_COST * (1 + inflation), [inflation]);
  const currentAutomobileFactoryCost = useMemo(() => BASE_AUTOMOBILE_FACTORY_COST * (1 + inflation), [inflation]);
  const currentPharmaceuticalFactoryCost = useMemo(() => BASE_PHARMACEUTICAL_FACTORY_COST * (1 + inflation), [inflation]);
  const currentAircraftFactoryCost = useMemo(() => BASE_AIRCRAFT_FACTORY_COST * (1 + inflation), [inflation]);
  const currentSoftwareStudioCost = useMemo(() => BASE_SOFTWARE_STUDIO_COST * (1 + inflation), [inflation]);
  const currentFarmCost = useMemo(() => BASE_FARM_CONSTRUCTION_COST * (1 + inflation), [inflation]);
  const currentMarketingFirmCost = useMemo(() => BASE_MARKETING_FIRM_CONSTRUCTION_COST * (1 + inflation), [inflation]);
  const currentResearchCenterCost = useMemo(() => BASE_RESEARCH_CENTER_COST * (1 + inflation), [inflation]);
  const currentExpansionCost = useMemo(() => BASE_EXPANSION_COST * (1 + inflation), [inflation]);
  const currentRandDQualityCost = useMemo(() => BASE_R_AND_D_QUALITY_COST * (1 + inflation), [inflation]);
  
  const currentInitialProducts = useMemo(() => BASE_INITIAL_PRODUCTS.map(p => ({...p, cost: p.cost * (1 + inflation)})), [inflation]);
  const currentRawMaterials = useMemo(() => BASE_RAW_MATERIALS.map(rm => ({...rm, cost: rm.cost * (1 + inflation)})), [inflation]);
  
  const currentManufacturableProducts = useMemo(() => {
    const updated = { ...MANUFACTURABLE_PRODUCTS };
    for (const key in updated) {
        const product = updated[key];
        const recipeCost = product.recipe.reduce((total, ing) => {
            const material = currentRawMaterials.find(rm => rm.id === ing.id);
            return total + (ing.amount * (material?.cost || 0));
        }, 0);
        updated[key] = { ...product, manufacturingCost: recipeCost };
    }
    return updated;
  }, [currentRawMaterials]);

  const currentAllProductsForStore = useMemo(() => ALL_PRODUCTS_DATABASE.map(p => {
    const productInfo = currentManufacturableProducts[p.id];
    const sourcingInfo = currentInitialProducts.find(ip => ip.id === p.id);
    let cost = productInfo ? productInfo.manufacturingCost : (sourcingInfo?.cost || 0);
    
    // For products that can be both sourced and manufactured (like bread), use the sourcing cost for this DB.
    // The actual cost average will be calculated in the store inventory.
    if(sourcingInfo) {
        cost = sourcingInfo.cost;
    }

    return {...p, cost };
  }), [currentManufacturableProducts, currentInitialProducts]);

  const addNewsEvent = useCallback((type: NewsEventType, title: string, message: string) => {
    setNewsFeed(prev => {
        const newEvent: NewsEvent = { id: `news_${Date.now()}_${Math.random()}`, date: new Date(gameDate), type, title, message, read: false };
        const updatedFeed = [newEvent, ...prev];
        if (updatedFeed.length > MAX_NEWS_EVENTS) {
            updatedFeed.pop();
        }
        return updatedFeed;
    });
  }, [gameDate]);

  useEffect(() => {
    if (gameStep === GameStep.MANAGE_BUSINESS && company && newsFeed.length === 0) {
      addNewsEvent(
        NewsEventType.TUTORIAL,
        "환영합니다, CEO님!",
        `${company.name}의 성공적인 시작을 기원합니다. 첫 번째 목표는 소매점을 건설하여 수익을 창출하는 것입니다.`
      );
    }
  }, [gameStep, company, newsFeed.length, addNewsEvent]);

  // Data Loading Effect
  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      const countryData = await fetchAllCountries();
      setCountries(countryData);
      setLoading(false);
    };
    loadData();
  }, []);

  // Game Loop Effect
  useEffect(() => {
    if (gameStep !== GameStep.MANAGE_BUSINESS || gameSpeed === 0) return;
    const hasOperations = company && (company.stores.length > 0 || company.factories.length > 0 || company.farms.length > 0 || company.loans.length > 0 || aiCompanies.some(ai => ai.stores.length > 0));
    if (!hasOperations) return;

    const intervalDuration = GAME_SPEED_MS / gameSpeed;

    const gameTimeout = setTimeout(() => {
      const nextDate = new Date(gameDate);
      nextDate.setDate(nextDate.getDate() + 1);
      
      const companyUpdates = new Map<string, { updatedCompany: Company, dailyNet: number }>();

      const simulateCompany = (currentCompany: Company, currentCycle: EconomicCycle): { updatedCompany: Company, dailyNet: number } => {
          let tempCompany = { ...currentCompany };
          
          // Quality Normalization
          const newProductQuality = { ...tempCompany.productQuality };
          Object.keys(newProductQuality).forEach(pId => {
            const avgQuality = marketAverageQuality[pId] || newProductQuality[pId];
            const currentQuality = newProductQuality[pId];
            newProductQuality[pId] = currentQuality + (avgQuality - currentQuality) * MARKET_NORMALIZATION_FACTOR;
          });
          tempCompany.productQuality = newProductQuality;

          let tempCash = tempCompany.cash;
          let tempInterestIncome = tempCompany.interestIncome;
          let tempInterestExpense = tempCompany.interestExpense;

          // Process interest income from cash
          const dailyInterest = tempCash > 0 ? tempCash * (interestRate / 365) : 0;
          tempCash += dailyInterest;
          tempInterestIncome += dailyInterest;
          
          // Automated R&D Quality Investment (Player + AI)
          if (tempCompany.hasResearchCenter && tempCompany.researchManager?.autoInvestQuality && nextDate.getUTCDate() % 15 === 0) { // Run twice a month
              const relevantProducts = new Set<string>();
              tempCompany.stores.forEach(s => s.inventory.forEach(p => relevantProducts.add(p.id)));
              tempCompany.factories.forEach(f => relevantProducts.add(f.productId));

              if (relevantProducts.size > 0) {
                  const productToImprove = Array.from(relevantProducts).reduce((lowest, current) => {
                      const lowestQuality = tempCompany.productQuality[lowest] || 100;
                      const currentQuality = tempCompany.productQuality[current] || 100;
                      return currentQuality < lowestQuality ? current : lowest;
                  });
                  
                  const currentQuality = tempCompany.productQuality[productToImprove] || 0;
                  if (currentQuality < 95 && tempCash > currentRandDQualityCost) {
                      tempCash -= currentRandDQualityCost;
                      tempCompany.operatingExpenses = (tempCompany.operatingExpenses || 0) + currentRandDQualityCost;
                      
                      const newQuality = Math.min(100, currentQuality + (Math.random() * 5 + 2));
                      tempCompany.productQuality[productToImprove] = newQuality;
                      
                      tempCompany.stores = tempCompany.stores.map(store => ({
                          ...store,
                          inventory: store.inventory.map(p =>
                              p.id === productToImprove ? { ...p, quality: newQuality } : p
                          ),
                      }));

                      if (tempCompany.id.startsWith('player')) {
                          const productName = ALL_PRODUCTS_DATABASE.find(p => p.id === productToImprove)?.name || '제품';
                          addToast(`${productName}의 품질이 자동으로 개선되었습니다.`, 'info');
                      }
                  }
              }
          }
          
          // Process loan repayments
          let updatedLoans: Loan[] = [];
          if (tempCompany.loans.length > 0) {
              tempCompany.loans.forEach(loan => {
                  tempCash -= loan.dailyPayment;
                  const dailyInterestPayment = loan.remainingBalance * (loan.interestRate / 365);
                  tempInterestExpense += dailyInterestPayment;
                  const dailyPrincipalPayment = loan.dailyPayment - dailyInterestPayment;
                  const newRemainingBalance = loan.remainingBalance - dailyPrincipalPayment;
                  
                  if (newRemainingBalance > 0) {
                      updatedLoans.push({ ...loan, remainingBalance: newRemainingBalance });
                  }
              });
          }
          tempCompany.loans = updatedLoans;

          // Process Marketing
          const newBrandAwareness = JSON.parse(JSON.stringify(tempCompany.brandAwareness || {}));
          let dailyMarketingCost = 0;
          
          // Initialize brand awareness for new countries/products
          tempCompany.operatingCountryNames.forEach(countryName => {
            if (!newBrandAwareness[countryName]) newBrandAwareness[countryName] = {};
            ALL_PRODUCTS_DATABASE.forEach(p => {
              if (newBrandAwareness[countryName][p.id] === undefined) newBrandAwareness[countryName][p.id] = 0;
            });
          });
          
          // Automated Campaign Management
          if (tempCompany.id.startsWith('ai_') || tempCompany.marketingFirms.some(f => f.manager?.autoManageCampaigns)) {
              tempCompany.marketingFirms.forEach(firm => {
                  if ((tempCompany.id.startsWith('player') && firm.manager?.autoManageCampaigns) || tempCompany.id.startsWith('ai_')) {
                      const countryName = firm.countryName;
                      let activeCampaigns = tempCompany.activeMarketingCampaigns[firm.id] || [];
                      const MAX_CAMPAIGNS = 3; 

                      if (activeCampaigns.length > MAX_CAMPAIGNS) {
                          activeCampaigns = activeCampaigns.slice(0, MAX_CAMPAIGNS);
                          tempCompany.activeMarketingCampaigns[firm.id] = activeCampaigns;
                      }

                      if (activeCampaigns.length < MAX_CAMPAIGNS && tempCash > BASE_MARKETING_CAMPAIGN_DAILY_COST * 7 * (activeCampaigns.length + 1)) {
                          const productsSoldInCountry = tempCompany.stores
                              .filter(s => s.countryName === countryName)
                              .flatMap(s => s.inventory.map(p => p.id));
                          
                          const uniqueProductsSold = [...new Set(productsSoldInCountry)];

                          const potentialProducts = uniqueProductsSold
                              .filter(pid => !activeCampaigns.includes(pid))
                              .map(pid => ({
                                  id: pid,
                                  awareness: newBrandAwareness[countryName]?.[pid] || 0
                              }))
                              .sort((a, b) => a.awareness - b.awareness);

                          if (potentialProducts.length > 0) {
                              const productToMarket = potentialProducts[0];
                              activeCampaigns.push(productToMarket.id);
                              tempCompany.activeMarketingCampaigns[firm.id] = activeCampaigns;
                          }
                      }
                  }
              });
          }

          // Process active campaigns
          tempCompany.marketingFirms.forEach(firm => {
            const activeCampaigns = tempCompany.activeMarketingCampaigns[firm.id] || [];
            activeCampaigns.forEach(productId => {
                dailyMarketingCost += BASE_MARKETING_CAMPAIGN_DAILY_COST;
                if (newBrandAwareness[firm.countryName]) {
                    const currentAwareness = newBrandAwareness[firm.countryName][productId] || 0;
                    newBrandAwareness[firm.countryName][productId] = Math.min(100, currentAwareness + 0.5); 
                }
            });
          });

          // Decay brand awareness
          Object.keys(newBrandAwareness).forEach(countryName => {
              Object.keys(newBrandAwareness[countryName]).forEach(productId => {
                  const activeCampaignsForCountry = tempCompany.marketingFirms
                      .filter(f => f.countryName === countryName)
                      .flatMap(f => tempCompany.activeMarketingCampaigns[f.id] || []);
                  
                  if (!activeCampaignsForCountry.includes(productId)) {
                      const currentAwareness = newBrandAwareness[countryName][productId] || 0;
                      newBrandAwareness[countryName][productId] = Math.max(0, currentAwareness - 0.1);
                  }
              });
          });


          const dailyOperatingExpenses = (tempCompany.stores.length * 50) + (tempCompany.factories.length * 500) + (tempCompany.farms.length * 250) + dailyMarketingCost;
          let dailyLogisticsCost = 0;
          
          let productionCost = 0;
          const newCentralInventory = { ...tempCompany.centralInventory };

          if(tempCompany.id.startsWith('player') && tempCompany.logisticsManager.autoPurchaseRawMaterials) {
              currentRawMaterials.forEach(material => {
                  if ((newCentralInventory[material.id] || 0) < RAW_MATERIAL_PURCHASE_AMOUNT * 2 && tempCash >= material.cost * RAW_MATERIAL_PURCHASE_AMOUNT) {
                      tempCash -= material.cost * RAW_MATERIAL_PURCHASE_AMOUNT;
                      newCentralInventory[material.id] = (newCentralInventory[material.id] || 0) + RAW_MATERIAL_PURCHASE_AMOUNT;
                  }
              });
          }
          
          tempCompany.farms.forEach(farm => {
              if (farm.manager?.autoProduce) {
                  newCentralInventory[farm.producesId] = (newCentralInventory[farm.producesId] || 0) + farm.productionRate;
              }
          });

          tempCompany.factories.forEach(factory => {
              if (!factory.manager?.autoProduce) return;
              const productInfo = currentManufacturableProducts[factory.productId];
              if (!productInfo) return;
              let canProduce = productInfo.recipe.every(ing => (newCentralInventory[ing.id] || 0) >= ing.amount * factory.productionRate);
              if (canProduce) {
                  productInfo.recipe.forEach(ing => {
                      newCentralInventory[ing.id] -= ing.amount * factory.productionRate;
                      productionCost += (currentRawMaterials.find(rm => rm.id === ing.id)?.cost || 0) * ing.amount * factory.productionRate;
                  });
                  newCentralInventory[factory.productId] = (newCentralInventory[factory.productId] || 0) + factory.productionRate;
              }
          });

          const storesAfterAutomation = tempCompany.stores.map(store => {
              const updatedInventory = store.inventory.map(product => {
                  let newStock = product.stock; let newPrice = product.price; let newAverageCost = product.cost;
                  if (store.manager.autoPrice) newPrice = product.cost > 0 ? product.cost * 2 : (currentAllProductsForStore.find(p=>p.id === product.id)?.cost || 1) * 2;
                  
                  if (product.stock < 10) {
                      const isManufacturable = !!currentManufacturableProducts[product.id];
                      const canAutoSupply = tempCompany.id.startsWith('player') ? tempCompany.logisticsManager.autoSupplyStores : true;
                      
                      if (canAutoSupply && isManufacturable) {
                           const sourceFactories = tempCompany.factories.filter(f => f.productId === product.id);
                           if (sourceFactories.length > 0) {
                                const destCountry = countries.find(c => c.name.common === store.countryName);
                                if (destCountry) {
                                    let bestSource = { factoryId: '', cost: Infinity };
                                    for (const factory of sourceFactories) {
                                        const sourceCountry = countries.find(c => c.name.common === factory.countryName);
                                        if (!sourceCountry) continue;

                                        let shippingCostPerBatch = SHIPPING_COSTS.INTERCONTINENTAL;
                                        if (sourceCountry.name.common === destCountry.name.common) {
                                            shippingCostPerBatch = SHIPPING_COSTS.DOMESTIC;
                                        } else if (sourceCountry.region === destCountry.region) {
                                            shippingCostPerBatch = SHIPPING_COSTS.REGIONAL;
                                        }
                                        
                                        if (shippingCostPerBatch < bestSource.cost) {
                                            bestSource = { factoryId: factory.id, cost: shippingCostPerBatch };
                                        }
                                    }

                                    const centralStock = newCentralInventory[product.id] || 0;
                                    if (bestSource.factoryId && centralStock >= PURCHASE_AMOUNT && tempCash >= bestSource.cost) {
                                        tempCash -= bestSource.cost;
                                        dailyLogisticsCost += bestSource.cost;
                                        
                                        const productInfo = currentManufacturableProducts[product.id];
                                        newCentralInventory[product.id] -= PURCHASE_AMOUNT;
                                        const newTotalValue = (product.stock * product.cost) + (PURCHASE_AMOUNT * productInfo.manufacturingCost);
                                        newStock += PURCHASE_AMOUNT;
                                        newAverageCost = newStock > 0 ? newTotalValue / newStock : productInfo.manufacturingCost;
                                    }
                                }
                           }
                      } else if (store.manager.autoStock && !['자동차 대리점', '의류 매장', '약국', '항공 쇼룸', '전자제품 매장'].includes(store.type)) {
                          const sourcingInfo = currentAllProductsForStore.find(p => p.id === product.id);
                          if (sourcingInfo && tempCash >= sourcingInfo.cost * PURCHASE_AMOUNT) {
                              tempCash -= sourcingInfo.cost * PURCHASE_AMOUNT;
                              const newTotalValue = (product.stock * product.cost) + (PURCHASE_AMOUNT * sourcingInfo.cost);
                              newStock += PURCHASE_AMOUNT;
                              newAverageCost = newStock > 0 ? newTotalValue / newStock : sourcingInfo.cost;
                          }
                      }
                  }
                  return { ...product, stock: newStock, price: newPrice, cost: newAverageCost };
              });
              return { ...store, inventory: updatedInventory };
          });
          tempCompany.stores = storesAfterAutomation;

          let dailyRevenue = 0; let dailyCostOfGoods = 0;
          const updatedStoresAfterSales = tempCompany.stores.map(store => {
            const updatedInventory = store.inventory.map(product => {
              if (product.stock <= 0) return product;
              const demandModifier = currentCycle === EconomicCycle.BOOM ? 1.2 : currentCycle === EconomicCycle.RECESSION ? 0.8 : 1.0;
              const baseDemand = (tempCompany.id.startsWith('player') ? 15 : 8) * demandModifier;
              const priceFactor = Math.max(0, 1 - ( (product.price - product.cost) / (product.cost * 15) ));
              
              const marketAvgProdQuality = marketAverageQuality[product.id] || product.quality;
              const qualityDifference = product.quality - marketAvgProdQuality;
              const qualityFactor = 1 + (qualityDifference / 100);

              const currentBrandAwareness = (newBrandAwareness[store.countryName]?.[product.id]) || 0;
              const marketAvgBrandAwareness = marketAverageBrand[store.countryName]?.[product.id] || currentBrandAwareness;
              const brandDifference = currentBrandAwareness - marketAvgBrandAwareness;
              const brandFactor = 1 + (brandDifference / 150);

              const potentialSales = Math.floor(baseDemand * priceFactor * qualityFactor * brandFactor * (Math.random() * 0.4 + 0.8));
              const actualSales = Math.min(product.stock, Math.max(0, potentialSales));
              if (actualSales > 0) {
                dailyRevenue += actualSales * product.price;
                dailyCostOfGoods += actualSales * product.cost;
              }
              return { ...product, stock: product.stock - actualSales };
            });
            return { ...store, inventory: updatedInventory };
          });
          
          const dailyNet = dailyRevenue - dailyCostOfGoods - dailyOperatingExpenses - dailyLogisticsCost - productionCost + dailyInterest - (tempInterestExpense - currentCompany.interestExpense);
          
          const updatedCompany = { 
              ...tempCompany, 
              cash: tempCash + dailyRevenue - dailyCostOfGoods - dailyOperatingExpenses,
              revenue: tempCompany.revenue + dailyRevenue,
              costOfGoodsSold: (tempCompany.costOfGoodsSold || 0) + dailyCostOfGoods + productionCost,
              operatingExpenses: (tempCompany.operatingExpenses || 0) + dailyOperatingExpenses,
              logisticsExpenses: (tempCompany.logisticsExpenses || 0) + dailyLogisticsCost,
              interestIncome: tempInterestIncome,
              interestExpense: tempInterestExpense,
              stores: updatedStoresAfterSales,
              centralInventory: newCentralInventory,
              brandAwareness: newBrandAwareness
          };
          return { updatedCompany, dailyNet };
      };

      if (company) {
          companyUpdates.set(company.id, simulateCompany(company, economicCycle));
      }
      aiCompanies.forEach(ai => {
          companyUpdates.set(ai.id, simulateCompany(ai, economicCycle));
      });

      // AI expansion logic
      companyUpdates.forEach((value, key) => {
          if (key.startsWith('ai_') && nextDate.getUTCDate() % 7 === 1) { // Weekly decision making for AI
              let updatedAI = value.updatedCompany;
              let tempCash = updatedAI.cash;
              let newStores = [...updatedAI.stores];
              let newFarms = [...updatedAI.farms];
              let newFactories = [...updatedAI.factories];
              let newMarketingFirms = [...updatedAI.marketingFirms];
              let newOperatingCountries = [...updatedAI.operatingCountryNames];
              let newUnlockedTech = [...updatedAI.unlockedTechnologies];

              // AI Research Logic
              if (updatedAI.hasResearchCenter && Math.random() < 0.3) {
                  const availableTechs = Object.keys(RESEARCHABLE_TECHS)
                      .filter(techId => !newUnlockedTech.includes(techId));
                  if (availableTechs.length > 0) {
                      const techToResearchId = availableTechs[Math.floor(Math.random() * availableTechs.length)];
                      const techCost = RESEARCHABLE_TECHS[techToResearchId].cost;
                      if (tempCash > techCost * 2.0) {
                          tempCash -= techCost;
                          newUnlockedTech.push(techToResearchId);
                          updatedAI.operatingExpenses += techCost;
                      }
                  }
              }
              // AI builds research center
              else if (!updatedAI.hasResearchCenter && tempCash > currentResearchCenterCost * 2.5 && Math.random() < 0.1) {
                  tempCash -= currentResearchCenterCost;
                  updatedAI.hasResearchCenter = true;
              }
              else if (!updatedAI.isPublic && updatedAI.revenue > ipoReadinessThreshold && Math.random() < 0.25) {
                  const valuation = (updatedAI.revenue - updatedAI.costOfGoodsSold - updatedAI.operatingExpenses) * 10;
                  if (valuation > 0) {
                      const cashInjection = (valuation / TOTAL_SHARES_OUTSTANDING) * (TOTAL_SHARES_OUTSTANDING * IPO_SHARES_TO_SELL_PERCENT);
                      updatedAI = {
                          ...updatedAI, cash: updatedAI.cash + cashInjection, isPublic: true, sharesOutstanding: TOTAL_SHARES_OUTSTANDING,
                          sharePrice: valuation / TOTAL_SHARES_OUTSTANDING, sharePriceHistory: [{ date: nextDate.toISOString(), price: valuation / TOTAL_SHARES_OUTSTANDING }]
                      };
                      addNewsEvent(NewsEventType.COMPETITOR, `${updatedAI.name} IPO 실시`, `${updatedAI.name}이(가) 주식 시장에 상장하여 사업 확장을 위한 자금을 확보했습니다.`);
                  }
              }
              else if (tempCash > currentMarketingFirmCost * 2.5 && Math.random() < 0.15) { // Chance to build marketing firm
                  const targetCountryName = newOperatingCountries[Math.floor(Math.random() * newOperatingCountries.length)];
                  const targetCountry = countries.find(c => c.name.common === targetCountryName);
                   if (targetCountry && targetCountry.capital?.[0] && !updatedAI.marketingFirms.some(f=>f.countryName === targetCountryName)) {
                        tempCash -= currentMarketingFirmCost;
                        const newFirm: MarketingFirm = {
                            id: `mkt_ai_${updatedAI.id}_${Date.now()}`,
                            cityName: targetCountry.capital[0],
                            countryName: targetCountry.name.common,
                            manager: { autoManageCampaigns: true },
                        };
                        newMarketingFirms.push(newFirm);
                   }
              }
              else if (tempCash > currentFarmCost * 2.5 && Math.random() < 0.2) { // Chance to build farm
                  const targetCountryName = newOperatingCountries[Math.floor(Math.random() * newOperatingCountries.length)];
                  const targetCountry = countries.find(c => c.name.common === targetCountryName);
                  const farmableIds = Object.keys(FARMABLE_RAW_MATERIALS);
                  const farmToBuildId = farmableIds[Math.floor(Math.random() * farmableIds.length)];
                  if (targetCountry && targetCountry.capital?.[0] && farmToBuildId) {
                      const capitalCity = targetCountry.capital[0];
                      if (updatedAI.farms.length < 3) { // Limit AI farms
                          tempCash -= currentFarmCost;
                          newFarms.push({
                              id: `farm_ai_${updatedAI.id}_${Date.now()}`,
                              cityName: capitalCity,
                              countryName: targetCountryName,
                              producesId: farmToBuildId,
                              productionRate: FARMABLE_RAW_MATERIALS[farmToBuildId].productionRate,
                              manager: { autoProduce: true },
                          });
                      }
                  }
              }
              else if (tempCash > currentFactoryCost * 2.5 && Math.random() < 0.1) { // AI builds factories
                const targetCountryName = newOperatingCountries[Math.floor(Math.random() * newOperatingCountries.length)];
                const targetCountry = countries.find(c => c.name.common === targetCountryName);
                if (targetCountry && targetCountry.capital?.[0]) {
                    const capitalCity = targetCountry.capital[0];
                    const unlockedProducts = Object.keys(MANUFACTURABLE_PRODUCTS).filter(pId => {
                        const tech = MANUFACTURABLE_PRODUCTS[pId].requiredTech;
                        return !tech || newUnlockedTech.includes(tech);
                    });

                    if (unlockedProducts.length > 0) {
                        const productToBuild = unlockedProducts[Math.floor(Math.random() * unlockedProducts.length)];
                        
                        let cost = currentFactoryCost;
                        if (productToBuild === 'prod_smartphone') cost = currentElectronicsFactoryCost;
                        else if (productToBuild === 'prod_car') cost = currentAutomobileFactoryCost;
                        else if (['rm_fabric', 'prod_tshirt', 'prod_jeans'].includes(productToBuild)) cost = currentTextileFactoryCost;
                        else if (['prod_painkiller', 'prod_antibiotics'].includes(productToBuild)) cost = currentPharmaceuticalFactoryCost;
                        else if (productToBuild === 'prod_airplane') cost = currentAircraftFactoryCost;
                        else if (['prod_videogame', 'prod_os', 'prod_bizsoftware'].includes(productToBuild)) cost = currentSoftwareStudioCost;
                        
                        if (tempCash > cost * 2.0 && !updatedAI.factories.some(f => f.productId === productToBuild)) {
                            tempCash -= cost;
                            newFactories.push({
                                id: `factory_ai_${updatedAI.id}_${Date.now()}`,
                                cityName: capitalCity,
                                countryName: targetCountryName,
                                productId: productToBuild,
                                productionRate: (currentManufacturableProducts[productToBuild] || MANUFACTURABLE_PRODUCTS[productToBuild]).productionRate,
                                manager: { autoProduce: true },
                            });
                        }
                    }
                }
              }
              else if (tempCash > currentElectronicsStoreCost * 2.5 && newUnlockedTech.includes('tech_electronics') && Math.random() < 0.1) { // AI builds electronics stores
                const targetCountryName = newOperatingCountries[Math.floor(Math.random() * newOperatingCountries.length)];
                const targetCountry = countries.find(c => c.name.common === targetCountryName);
                if (targetCountry && targetCountry.capital?.[0]) {
                    const capitalCity = targetCountry.capital[0];
                    if (!updatedAI.stores.some(s => s.cityName === capitalCity && s.type === '전자제품 매장')) {
                        tempCash -= currentElectronicsStoreCost;
                        const electronicsInventory = currentAllProductsForStore
                            .filter(p => ['prod_smartphone', 'prod_laptop', 'prod_tv', 'prod_drone', 'prod_videogame', 'prod_os', 'prod_bizsoftware', 'prod_antivirus', 'prod_photo_editor'].includes(p.id))
                            .map(p => ({ ...p, stock: 0, price: p.cost * 1.8, quality: p.quality }));
                        newStores.push({
                            id: `store_ai_${updatedAI.id}_${Date.now()}`,
                            type: '전자제품 매장',
                            cityName: capitalCity,
                            countryName: targetCountryName,
                            inventory: electronicsInventory,
                            manager: { autoPrice: true, autoStock: true }
                        });
                    }
                }
              }
              else if (tempCash > currentApparelStoreCost * 2.5 && newUnlockedTech.includes('tech_textiles') && Math.random() < 0.1) { // AI builds apparel stores
                const targetCountryName = newOperatingCountries[Math.floor(Math.random() * newOperatingCountries.length)];
                const targetCountry = countries.find(c => c.name.common === targetCountryName);
                if (targetCountry && targetCountry.capital?.[0]) {
                    const capitalCity = targetCountry.capital[0];
                    if (!updatedAI.stores.some(s => s.cityName === capitalCity && s.type === '의류 매장')) {
                        tempCash -= currentApparelStoreCost;
                        const apparelInventory = currentAllProductsForStore
                            .filter(p => ['prod_tshirt', 'prod_jeans', 'prod_jacket', 'prod_socks'].includes(p.id))
                            .map(p => ({ ...p, stock: 0, price: p.cost * 1.8, quality: p.quality }));
                        newStores.push({
                            id: `store_ai_${updatedAI.id}_${Date.now()}`,
                            type: '의류 매장',
                            cityName: capitalCity,
                            countryName: targetCountryName,
                            inventory: apparelInventory,
                            manager: { autoPrice: true, autoStock: true }
                        });
                    }
                }
              }
              else if (tempCash > currentPharmacyCost * 2.5 && newUnlockedTech.includes('tech_pharmaceuticals') && Math.random() < 0.1) { // AI builds pharmacies
                const targetCountryName = newOperatingCountries[Math.floor(Math.random() * newOperatingCountries.length)];
                const targetCountry = countries.find(c => c.name.common === targetCountryName);
                if (targetCountry && targetCountry.capital?.[0]) {
                    const capitalCity = targetCountry.capital[0];
                    if (!updatedAI.stores.some(s => s.cityName === capitalCity && s.type === '약국')) {
                        tempCash -= currentPharmacyCost;
                        const pharmacyInventory = currentAllProductsForStore
                            .filter(p => ['prod_painkiller', 'prod_antibiotics', 'prod_vitamins', 'prod_vaccine'].includes(p.id))
                            .map(p => ({ ...p, stock: 0, price: p.cost * 1.8, quality: p.quality }));
                        newStores.push({
                            id: `store_ai_${updatedAI.id}_${Date.now()}`,
                            type: '약국',
                            cityName: capitalCity,
                            countryName: targetCountryName,
                            inventory: pharmacyInventory,
                            manager: { autoPrice: true, autoStock: true }
                        });
                    }
                }
              }
              else if (tempCash > currentAviationShowroomCost * 2.5 && newUnlockedTech.includes('tech_aerospace') && Math.random() < 0.05) { // AI builds aviation showrooms
                const targetCountryName = newOperatingCountries[Math.floor(Math.random() * newOperatingCountries.length)];
                const targetCountry = countries.find(c => c.name.common === targetCountryName);
                if (targetCountry && targetCountry.capital?.[0]) {
                    const capitalCity = targetCountry.capital[0];
                    if (!updatedAI.stores.some(s => s.cityName === capitalCity && s.type === '항공 쇼룸')) {
                        tempCash -= currentAviationShowroomCost;
                        const airplaneInventory = currentAllProductsForStore
                            .filter(p => ['prod_airplane', 'prod_helicopter', 'prod_satellite'].includes(p.id))
                            .map(p => ({ ...p, stock: 0, price: p.cost * 1.8, quality: p.quality }));
                        newStores.push({
                            id: `store_ai_${updatedAI.id}_${Date.now()}`,
                            type: '항공 쇼룸',
                            cityName: capitalCity,
                            countryName: targetCountryName,
                            inventory: airplaneInventory,
                            manager: { autoPrice: true, autoStock: true }
                        });
                    }
                }
              }
              else if (tempCash > currentExpansionCost * 3.5 && newOperatingCountries.length < 5) {
                  const aiHqCountry = countries.find(c => c.name.common === updatedAI.hqCountry);
                  const potentialTarget = countries.find(c => c.subregion === aiHqCountry?.subregion && !newOperatingCountries.includes(c.name.common) && c.capital?.[0]);
                  if (potentialTarget) {
                      tempCash -= currentExpansionCost;
                      newOperatingCountries.push(potentialTarget.name.common);
                      addNewsEvent(NewsEventType.COMPETITOR, `${updatedAI.name} 해외 진출`, `${updatedAI.name}이(가) ${potentialTarget.name.common} 시장에 새롭게 진출했습니다.`);
                  }
              }
              else if (tempCash > currentStoreCost * 2.5 && newOperatingCountries.length > 0) {
                   const targetCountryName = newOperatingCountries[Math.floor(Math.random() * newOperatingCountries.length)];
                   const targetCountry = countries.find(c => c.name.common === targetCountryName);
                   if (targetCountry && targetCountry.capital?.[0]) {
                      const capitalCity = targetCountry.capital[0];
                      if (!updatedAI.stores.some(s => s.cityName === capitalCity && s.type === '편의점')) {
                          tempCash -= currentStoreCost;
                          newStores.push({
                              id: `store_ai_${updatedAI.id}_${Date.now()}`, type: '편의점', cityName: capitalCity, countryName: targetCountryName,
                              inventory: currentAllProductsForStore.filter(p => BASE_INITIAL_PRODUCTS.some(bp => bp.id === p.id)).map(p => ({ ...p, stock: PURCHASE_AMOUNT, price: p.cost * 1.8, quality: p.quality })),
                              manager: { autoPrice: true, autoStock: true }
                          });
                      }
                   }
              }
              updatedAI = { ...updatedAI, cash: tempCash, stores: newStores, farms: newFarms, factories: newFactories, operatingCountryNames: newOperatingCountries, marketingFirms: newMarketingFirms, unlockedTechnologies: newUnlockedTech };
              value.updatedCompany = updatedAI;
          }
      });
      
      // Quarterly Updates (Economy + Taxes)
      if (nextDate.getUTCDate() === 1 && nextDate.getUTCMonth() % 3 === 0) {
          const prevInflation = inflation;
          const prevInterest = interestRate;
          const inflationShock = (Math.random() - 0.5) * 0.01; // +/- 0.5%
          const interestShock = (Math.random() - 0.5) * 0.015; // +/- 0.75%
          const newInflation = Math.max(-0.05, prevInflation + inflationShock);
          const newInterestRate = Math.max(0.005, prevInterest + interestShock);

          setInflation(newInflation);
          setInterestRate(newInterestRate);
          
          addNewsEvent(
            NewsEventType.ECONOMY, 
            '세계 경제 동향 업데이트', 
            `기준 금리가 ${(prevInterest * 100).toFixed(2)}%에서 ${(newInterestRate * 100).toFixed(2)}%로, 물가 상승률이 ${(prevInflation * 100).toFixed(2)}%에서 ${(newInflation * 100).toFixed(2)}%로 변동되었습니다.`
          );

          // Update Economic Cycle
          const newQuartersInCycle = quartersInCurrentCycle + 1;
          setQuartersInCurrentCycle(newQuartersInCycle);
          
          const MIN_CYCLE_QUARTERS = 4; // 1 year
          const MAX_CYCLE_QUARTERS = 12; // 3 years

          if (newQuartersInCycle > MIN_CYCLE_QUARTERS && Math.random() < 0.25 || newQuartersInCycle > MAX_CYCLE_QUARTERS) {
              let nextCycle = economicCycle;
              const roll = Math.random();

              if (economicCycle === EconomicCycle.NORMAL) {
                  if (roll < 0.5) nextCycle = EconomicCycle.BOOM;
                  else nextCycle = EconomicCycle.RECESSION;
              } else if (economicCycle === EconomicCycle.BOOM) {
                  if (roll < 0.7) nextCycle = EconomicCycle.NORMAL;
              } else { // RECESSION
                  if (roll < 0.7) nextCycle = EconomicCycle.NORMAL;
              }

              if (nextCycle !== economicCycle) {
                  setEconomicCycle(nextCycle);
                  setQuartersInCurrentCycle(0);
                  
                  let cycleMessage = '';
                  if (nextCycle === EconomicCycle.BOOM) {
                      cycleMessage = '소비자 수요가 증가하고 기업 활동이 활발해질 것입니다.';
                  } else if (nextCycle === EconomicCycle.RECESSION) {
                      cycleMessage = '소비 심리가 위축되고 시장이 침체에 빠질 것입니다.';
                  } else { // Back to Normal
                      cycleMessage = '경제가 안정세로 돌아섰습니다.';
                  }
                  addNewsEvent(
                      NewsEventType.ECONOMY,
                      `세계 경제, ${nextCycle} 국면 진입`,
                      cycleMessage
                  );
              }
          }

          // Process Taxes and Quarterly History
          const processQuarterlyData = (c: Company): Company => {
              const last = c.lastQuarterFinancials;
              
              const quarterlyRevenue = c.revenue - last.revenue;
              const quarterlyCOGS = (c.costOfGoodsSold || 0) - (last.costOfGoodsSold || 0);
              const quarterlyOpEx = (c.operatingExpenses || 0) - (last.operatingExpenses || 0);
              const quarterlyLogisticsEx = (c.logisticsExpenses || 0) - (last.logisticsExpenses || 0);
              const quarterlyInterestIncome = (c.interestIncome || 0) - (last.interestIncome || 0);
              const quarterlyInterestExpense = (c.interestExpense || 0) - (last.interestExpense || 0);
              
              const quarterlyProfit = quarterlyRevenue - quarterlyCOGS - quarterlyOpEx - quarterlyLogisticsEx + quarterlyInterestIncome - quarterlyInterestExpense;

              let updatedCompany = { ...c };
              let taxAmount = 0;
              if (quarterlyProfit > 0) {
                  taxAmount = quarterlyProfit * CORPORATE_TAX_RATE;
                  updatedCompany.cash -= taxAmount;
                  updatedCompany.taxesPaid = (updatedCompany.taxesPaid || 0) + taxAmount;
                  
                  if (updatedCompany.id.startsWith('player')) {
                      addNewsEvent(
                          NewsEventType.PLAYER,
                          '법인세 납부',
                          `분기 순이익 ${formatCurrencyForNews(quarterlyProfit)}에 대한 법인세 ${formatCurrencyForNews(taxAmount)}를 납부했습니다.`
                      );
                  }
              }

              const netIncome = quarterlyProfit - taxAmount;
              const newHistoryEntry: QuarterlyFinancials = {
                  date: nextDate.toISOString(),
                  revenue: quarterlyRevenue,
                  costOfGoodsSold: quarterlyCOGS,
                  operatingExpenses: quarterlyOpEx,
                  logisticsExpenses: quarterlyLogisticsEx,
                  interestIncome: quarterlyInterestIncome,
                  interestExpense: quarterlyInterestExpense,
                  taxesPaid: taxAmount,
                  netIncome: netIncome,
              };

              const newHistory = [...(updatedCompany.quarterlyFinancialsHistory || []), newHistoryEntry];
              if (newHistory.length > 12) { // Keep last 12 quarters (3 years)
                  newHistory.shift();
              }
              updatedCompany.quarterlyFinancialsHistory = newHistory;

              updatedCompany.lastQuarterFinancials = {
                  revenue: c.revenue,
                  costOfGoodsSold: c.costOfGoodsSold || 0,
                  operatingExpenses: c.operatingExpenses || 0,
                  logisticsExpenses: c.logisticsExpenses || 0,
                  interestIncome: c.interestIncome || 0,
                  interestExpense: c.interestExpense || 0,
              };
              return updatedCompany;
          };

          companyUpdates.forEach((value, key) => {
              value.updatedCompany = processQuarterlyData(value.updatedCompany);
          });
      }

      companyUpdates.forEach(value => {
          const c = value.updatedCompany;
          if (c.isPublic) {
              const { dailyNet } = value;
              const performanceEffect = (dailyNet / (c.cash > 0 ? c.cash : 1)) * STOCK_PERFORMANCE_FACTOR;
              const randomVolatility = (Math.random() - 0.5) * STOCK_PRICE_VOLATILITY;
              const cycleEffect = economicCycle === EconomicCycle.BOOM ? 0.0005 : economicCycle === EconomicCycle.RECESSION ? -0.0008 : 0;
              const newPrice = Math.max(0.01, c.sharePrice * (1 + performanceEffect + randomVolatility + cycleEffect));
              
              c.sharePrice = newPrice;
              c.sharePriceHistory = [...(c.sharePriceHistory || []), { date: nextDate.toISOString(), price: newPrice }];
              if (c.sharePriceHistory.length > 30) {
                c.sharePriceHistory.shift();
              }
          }
      });
      
      const finalUpdatedCompanies = Array.from(companyUpdates.values()).map(v => v.updatedCompany);
      
      // Calculate Market Averages for NEXT tick
      const nextMarketAvgQuality: { [productId: string]: number } = {};
      const productCompanyCount: { [productId: string]: number } = {};
      const nextMarketAvgBrand: { [countryName: string]: { [productId: string]: number } } = {};
      const brandCompanyCount: { [countryName: string]: { [productId: string]: number } } = {};

      finalUpdatedCompanies.forEach(c => {
        Object.entries(c.productQuality).forEach(([pId, quality]) => {
          nextMarketAvgQuality[pId] = (nextMarketAvgQuality[pId] || 0) + quality;
          productCompanyCount[pId] = (productCompanyCount[pId] || 0) + 1;
        });

        Object.entries(c.brandAwareness).forEach(([countryName, productBrands]) => {
          if (!nextMarketAvgBrand[countryName]) nextMarketAvgBrand[countryName] = {};
          if (!brandCompanyCount[countryName]) brandCompanyCount[countryName] = {};
          Object.entries(productBrands).forEach(([pId, awareness]) => {
            nextMarketAvgBrand[countryName][pId] = (nextMarketAvgBrand[countryName][pId] || 0) + awareness;
            brandCompanyCount[countryName][pId] = (brandCompanyCount[countryName][pId] || 0) + 1;
          });
        });
      });
      
      Object.keys(nextMarketAvgQuality).forEach(pId => {
        if (productCompanyCount[pId] > 0) {
          nextMarketAvgQuality[pId] /= productCompanyCount[pId];
        }
      });
      Object.keys(nextMarketAvgBrand).forEach(countryName => {
        Object.keys(nextMarketAvgBrand[countryName]).forEach(pId => {
          if (brandCompanyCount[countryName][pId] > 0) {
            nextMarketAvgBrand[countryName][pId] /= brandCompanyCount[countryName][pId];
          }
        });
      });
      
      setMarketAverageQuality(nextMarketAvgQuality);
      setMarketAverageBrand(nextMarketAvgBrand);

      setCompany(companyUpdates.get(company!.id)!.updatedCompany);
      setAiCompanies(finalUpdatedCompanies.filter(c => !c.id.startsWith('player')));
      setGameDate(nextDate);

    }, intervalDuration);

    return () => clearTimeout(gameTimeout);
  }, [gameStep, company, countries, aiCompanies, gameSpeed, gameDate, ipoReadinessThreshold, inflation, interestRate, economicCycle, quartersInCurrentCycle, currentStoreCost, currentExpansionCost, currentAllProductsForStore, currentManufacturableProducts, currentRawMaterials, currentFarmCost, currentMarketingFirmCost, addNewsEvent, currentApparelStoreCost, currentTextileFactoryCost, currentFactoryCost, currentDealershipCost, currentAutomobileFactoryCost, currentElectronicsFactoryCost, currentResearchCenterCost, currentPharmacyCost, currentPharmaceuticalFactoryCost, currentAircraftFactoryCost, currentAviationShowroomCost, currentElectronicsStoreCost, currentSoftwareStudioCost, marketAverageBrand, marketAverageQuality, currentRandDQualityCost]);

  useEffect(() => {
    return () => {
        if (resetTimeoutRef.current) {
            clearTimeout(resetTimeoutRef.current);
        }
    };
  }, []);

  const handleCountrySelect = useCallback((country: Country | null) => {
    setSelectedCountry(country);
  }, []);

  const initializeAICompanies = useCallback(async (playerHqCountry: Country) => {
    try {
        const names = await generateCompanyNames(4);
        const potentialCountries = countries.filter(c => c.cca3 !== playerHqCountry?.cca3 && c.capital && c.capital.length > 0).sort((a, b) => b.population - a.population).slice(0, 4);
        if (potentialCountries.length < 4) return;

        const newAICompanies: Company[] = names.map((name, index) => {
            const hqCountry = potentialCountries[index];
            const initialFinancials = { revenue: 0, costOfGoodsSold: 0, operatingExpenses: 0, logisticsExpenses: 0, interestIncome: 0, interestExpense: 0 };
            return {
                id: `ai_${Date.now()}_${index}`, name, cash: INITIAL_CAPITAL * 0.8, revenue: 0, costOfGoodsSold: 0, operatingExpenses: 0, logisticsExpenses: 0, interestIncome: 0, interestExpense: 0, taxesPaid: 0,
                hqCountry: hqCountry.name.common, operatingCountryNames: [hqCountry.name.common],
                stores: [], factories: [], farms: [], marketingFirms: [], centralInventory: {}, hasResearchCenter: false,
                researchManager: { autoInvestQuality: true },
                productQuality: ALL_PRODUCTS_DATABASE.reduce((acc, p) => ({...acc, [p.id]: p.quality}), {}),
                unlockedTechnologies: [],
                brandAwareness: {}, activeMarketingCampaigns: {},
                logisticsManager: { autoPurchaseRawMaterials: true, autoSupplyStores: true },
                isPublic: false, sharesOutstanding: 0, sharePrice: 0, sharePriceHistory: [], ownedShares: [], loans: [],
                lastQuarterFinancials: initialFinancials,
                quarterlyFinancialsHistory: [],
            };
        });
        setAiCompanies(newAICompanies);
    } catch (error) {
        console.error("Failed to initialize AI companies:", error);
    }
  }, [countries]);

  const handleConfirmEstablishment = useCallback((companyName: string) => {
    if (selectedCountry) {
      const initialFinancials = { revenue: 0, costOfGoodsSold: 0, operatingExpenses: 0, logisticsExpenses: 0, interestIncome: 0, interestExpense: 0 };
      const newCompany: Company = {
        id: `player_${Date.now()}`, name: companyName, cash: INITIAL_CAPITAL,
        revenue: 0, costOfGoodsSold: 0, operatingExpenses: 0, logisticsExpenses: 0, interestIncome: 0, interestExpense: 0, taxesPaid: 0, hqCountry: selectedCountry.name.common,
        stores: [], factories: [], farms: [], marketingFirms: [], operatingCountryNames: [selectedCountry.name.common], centralInventory: {},
        hasResearchCenter: false,
        researchManager: { autoInvestQuality: false },
        productQuality: ALL_PRODUCTS_DATABASE.reduce((acc, p) => ({ ...acc, [p.id]: p.quality }), {} as { [productId: string]: number }),
        unlockedTechnologies: [],
        brandAwareness: {}, activeMarketingCampaigns: {},
        logisticsManager: { autoPurchaseRawMaterials: true, autoSupplyStores: true },
        isPublic: false, sharesOutstanding: 0, sharePrice: 0, sharePriceHistory: [], ownedShares: [], loans: [],
        lastQuarterFinancials: initialFinancials,
        quarterlyFinancialsHistory: [],
      };
      setCompany(newCompany);
      setOperatingCountry(selectedCountry);
      setGameStep(GameStep.MANAGE_BUSINESS);
      setIsNamingCompany(false);
      if (aiCompanies.length === 0) {
        initializeAICompanies(selectedCountry);
      }
    }
  }, [selectedCountry, aiCompanies.length, initializeAICompanies]);

  const handleStartBuildingStore = useCallback((storeType: string) => {
    let cost: number;
    let requiredTech: string | undefined;

    if (storeType === '자동차 대리점') {
        cost = currentDealershipCost;
        requiredTech = 'tech_automotive';
    } else if (storeType === '의류 매장') {
        cost = currentApparelStoreCost;
        requiredTech = 'tech_textiles';
    } else if (storeType === '약국') {
        cost = currentPharmacyCost;
        requiredTech = 'tech_pharmaceuticals';
    } else if (storeType === '항공 쇼룸') {
        cost = currentAviationShowroomCost;
        requiredTech = 'tech_aerospace';
    } else if (storeType === '전자제품 매장') {
        cost = currentElectronicsStoreCost;
        requiredTech = 'tech_electronics';
    } else { // 편의점
        cost = currentStoreCost;
    }
    
    if (company) {
        if (requiredTech && !company.unlockedTechnologies.includes(requiredTech)) {
            addToast(`${RESEARCHABLE_TECHS[requiredTech].name} 연구가 필요합니다.`, 'error');
            return;
        }
        if (company.cash >= cost) {
          setStoreToBuild(storeType);
          setGameStep(GameStep.SELECT_CITY_FOR_STORE);
        } else {
          addToast("자금이 부족합니다.", 'error');
        }
    }
  }, [company, currentStoreCost, currentDealershipCost, currentApparelStoreCost, currentPharmacyCost, currentAviationShowroomCost, currentElectronicsStoreCost, addToast]);
  
  const handleStartBuildingFactory = useCallback((productId: string) => {
    const productInfo = MANUFACTURABLE_PRODUCTS[productId];
    if (!productInfo || !company) return;

    if (productInfo.requiredTech && !company.unlockedTechnologies.includes(productInfo.requiredTech)) {
        addToast(`${RESEARCHABLE_TECHS[productInfo.requiredTech].name} 연구가 필요합니다.`, 'error');
        return;
    }

    let cost: number;
    if (productId === 'prod_smartphone') {
      cost = currentElectronicsFactoryCost;
    } else if (productId === 'prod_car') {
      cost = currentAutomobileFactoryCost;
    } else if (['rm_fabric', 'prod_tshirt', 'prod_jeans'].includes(productId)) {
        cost = currentTextileFactoryCost;
    } else if (['prod_painkiller', 'prod_antibiotics'].includes(productId)) {
        cost = currentPharmaceuticalFactoryCost;
    } else if (productId === 'prod_airplane') {
        cost = currentAircraftFactoryCost;
    } else if (['prod_videogame', 'prod_os', 'prod_bizsoftware'].includes(productId)) {
        cost = currentSoftwareStudioCost;
    } else {
      cost = currentFactoryCost;
    }

    if (company.cash >= cost) {
      setFactoryToBuild(productId);
      setGameStep(GameStep.SELECT_CITY_FOR_FACTORY);
    } else {
      addToast("자금이 부족합니다.", 'error');
    }
  }, [company, currentFactoryCost, currentElectronicsFactoryCost, currentAutomobileFactoryCost, currentTextileFactoryCost, currentPharmaceuticalFactoryCost, currentAircraftFactoryCost, currentSoftwareStudioCost, addToast]);

  const handleStartBuildingFarm = useCallback((rawMaterialId: string) => {
    if (company && company.cash >= currentFarmCost) {
      setFarmToBuild(rawMaterialId);
      setGameStep(GameStep.SELECT_CITY_FOR_FARM);
    } else {
      addToast("자금이 부족합니다.", 'error');
    }
  }, [company, currentFarmCost, addToast]);

  const handleStartBuildingMarketingFirm = useCallback(() => {
    if (company && company.cash >= currentMarketingFirmCost) {
      setBuildingTypeToBuild('marketing_firm');
      setGameStep(GameStep.SELECT_CITY_FOR_MARKETING_FIRM);
    } else {
      addToast("자금이 부족합니다.", 'error');
    }
  }, [company, currentMarketingFirmCost, addToast]);

  const handleBuildResearchCenter = useCallback(() => { 
      if (company && company.cash >= currentResearchCenterCost) {
          setCompany({ ...company, cash: company.cash - currentResearchCenterCost, hasResearchCenter: true });
           addNewsEvent(NewsEventType.PLAYER, '연구개발 센터 설립', '이제 R&D 패널에서 새로운 기술을 연구하고 제품 품질을 개선할 수 있습니다.');
      } else {
          addToast('자금이 부족하여 연구소를 설립할 수 없습니다.', 'error');
      }
  }, [company, currentResearchCenterCost, addToast, addNewsEvent]);

  const handleEstablishStore = useCallback((city: City) => {
    if (company && operatingCountry && storeToBuild) {
        let cost: number;
        let inventory: Product[];
        
        if (storeToBuild === '자동차 대리점') {
            cost = currentDealershipCost;
            const productIds = ['prod_car', 'prod_truck', 'prod_motorcycle'];
            inventory = currentAllProductsForStore
                .filter(p => productIds.includes(p.id))
                .map(p => ({ ...p, stock: 0, price: p.cost * 1.5, quality: company.productQuality[p.id] || p.quality }));
        } else if (storeToBuild === '의류 매장') {
            cost = currentApparelStoreCost;
            const productIds = ['prod_tshirt', 'prod_jeans', 'prod_jacket', 'prod_socks'];
            inventory = currentAllProductsForStore
                .filter(p => productIds.includes(p.id))
                .map(p => ({ ...p, stock: 0, price: p.cost * 2, quality: company.productQuality[p.id] || p.quality }));
        } else if (storeToBuild === '약국') {
            cost = currentPharmacyCost;
            const productIds = ['prod_painkiller', 'prod_antibiotics', 'prod_vitamins', 'prod_vaccine'];
            inventory = currentAllProductsForStore
                .filter(p => productIds.includes(p.id))
                .map(p => ({ ...p, stock: 0, price: p.cost * 2, quality: company.productQuality[p.id] || p.quality }));
        } else if (storeToBuild === '항공 쇼룸') {
            cost = currentAviationShowroomCost;
            const productIds = ['prod_airplane', 'prod_helicopter', 'prod_satellite'];
            inventory = currentAllProductsForStore
                .filter(p => productIds.includes(p.id))
                .map(p => ({ ...p, stock: 0, price: p.cost * 1.5, quality: company.productQuality[p.id] || p.quality }));
        } else if (storeToBuild === '전자제품 매장') {
            cost = currentElectronicsStoreCost;
            const productIds = ['prod_smartphone', 'prod_laptop', 'prod_tv', 'prod_drone', 'prod_videogame', 'prod_os', 'prod_bizsoftware', 'prod_antivirus', 'prod_photo_editor'];
            inventory = currentAllProductsForStore
                .filter(p => productIds.includes(p.id))
                .map(p => ({ ...p, stock: 0, price: p.cost * 2, quality: company.productQuality[p.id] || p.quality }));
        } else { // Convenience Store
            cost = currentStoreCost;
            const productIds = ['prod_cola', 'prod_chips', 'prod_bread', 'prod_cake', 'prod_frozen_pizza', 'prod_ice_cream', 'prod_premium_coffee'];
            inventory = currentAllProductsForStore
                .filter(p => productIds.includes(p.id))
                .map(p => ({ ...p, stock: 0, price: p.cost * 2, quality: company.productQuality[p.id] || p.quality }));
        }

        const newStore: Store = { 
            id: `store_${Date.now()}`, 
            type: storeToBuild, 
            cityName: city.name, 
            countryName: operatingCountry.name.common, 
            inventory, 
            manager: { autoPrice: true, autoStock: true } 
        };

        setCompany({
            ...company, 
            cash: company.cash - cost, 
            stores: [...company.stores, newStore]
        }); 
        
        setGameStep(GameStep.MANAGE_BUSINESS);
        setStoreToBuild(null);
        
        addNewsEvent(
            NewsEventType.PLAYER, 
            `${storeToBuild} 설립 완료!`, 
            `${city.name}에 새로운 ${storeToBuild}을(를) 열었습니다. 이제 관리 화면에서 판매를 시작할 수 있습니다.`
        ); 
    }
  }, [company, operatingCountry, storeToBuild, currentStoreCost, currentDealershipCost, currentApparelStoreCost, currentPharmacyCost, currentAviationShowroomCost, currentElectronicsStoreCost, currentAllProductsForStore, addNewsEvent]);

  const handleEstablishFactory = useCallback((city: City) => {
    if (!company || !operatingCountry || !factoryToBuild) return;
  
    const productInfo = currentManufacturableProducts[factoryToBuild];
    
    let cost: number;
    if (factoryToBuild === 'prod_smartphone') {
      cost = currentElectronicsFactoryCost;
    } else if (factoryToBuild === 'prod_car') {
      cost = currentAutomobileFactoryCost;
    } else if (['rm_fabric', 'prod_tshirt', 'prod_jeans'].includes(factoryToBuild)) {
        cost = currentTextileFactoryCost;
    } else if (['prod_painkiller', 'prod_antibiotics'].includes(factoryToBuild)) {
        cost = currentPharmaceuticalFactoryCost;
    } else if (factoryToBuild === 'prod_airplane') {
        cost = currentAircraftFactoryCost;
    } else if (['prod_videogame', 'prod_os', 'prod_bizsoftware'].includes(factoryToBuild)) {
        cost = currentSoftwareStudioCost;
    } else {
      cost = currentFactoryCost;
    }
  
    if (productInfo) {
      setCompany({
        ...company,
        cash: company.cash - cost,
        factories: [
          ...company.factories,
          {
            id: `factory_${Date.now()}`,
            cityName: city.name,
            countryName: operatingCountry.name.common,
            productId: factoryToBuild,
            productionRate: productInfo.productionRate,
            manager: { autoProduce: true }
          }
        ]
      });
      setGameStep(GameStep.MANAGE_BUSINESS);
      setFactoryToBuild(null);
    }
  }, [company, operatingCountry, factoryToBuild, currentFactoryCost, currentTextileFactoryCost, currentElectronicsFactoryCost, currentAutomobileFactoryCost, currentPharmaceuticalFactoryCost, currentAircraftFactoryCost, currentSoftwareStudioCost, currentManufacturableProducts]);

  const handleEstablishFarm = useCallback((city: City) => {
    if (!company || !operatingCountry || !farmToBuild) return;
    
    const farmInfo = FARMABLE_RAW_MATERIALS[farmToBuild];
    if (farmInfo) {
      const newFarm: Farm = {
        id: `farm_${Date.now()}`,
        cityName: city.name,
        countryName: operatingCountry.name.common,
        producesId: farmToBuild,
        productionRate: farmInfo.productionRate,
        manager: { autoProduce: true },
      };
      
      setCompany({
        ...company,
        cash: company.cash - currentFarmCost,
        farms: [...company.farms, newFarm],
      });
      
      setGameStep(GameStep.MANAGE_BUSINESS);
      setFarmToBuild(null);

      addNewsEvent(
          NewsEventType.PLAYER,
          '농장 건설 완료!',
          `${city.name}에 새로운 ${farmInfo.name} 농장을 건설했습니다. 이제 중앙 창고로 원자재가 자동 공급됩니다.`
      );
    }
  }, [company, operatingCountry, farmToBuild, currentFarmCost, addNewsEvent]);

  const handleEstablishMarketingFirm = useCallback((city: City) => {
    if (!company || !operatingCountry) return;
      const newFirm: MarketingFirm = {
        id: `mkt_firm_${Date.now()}`,
        cityName: city.name,
        countryName: operatingCountry.name.common,
        manager: { autoManageCampaigns: true },
      };
      setCompany({
        ...company,
        cash: company.cash - currentMarketingFirmCost,
        marketingFirms: [...company.marketingFirms, newFirm],
      });
      setGameStep(GameStep.MANAGE_BUSINESS);
      setBuildingTypeToBuild(null);
      addNewsEvent(
          NewsEventType.PLAYER,
          '마케팅 에이전시 설립!',
          `${city.name}에 마케팅 에이전시를 설립했습니다. 이제 브랜드 인지도를 높일 수 있습니다.`
      );
  }, [company, operatingCountry, currentMarketingFirmCost, addNewsEvent]);

  const handleStoreSelect = (store: Store) => { if(company?.stores.find(s => s.id === store.id)) setSelectedStore(store); };
  const handleFactorySelect = (factory: Factory) => { if(company?.factories.find(f => f.id === factory.id)) setSelectedFactory(factory); };
  const handleFarmSelect = (farm: Farm) => { if(company?.farms.find(f => f.id === farm.id)) setSelectedFarm(farm); };
  const handleMarketingFirmSelect = (firm: MarketingFirm) => { if(company?.marketingFirms.find(f => f.id === firm.id)) setSelectedMarketingFirm(firm); };

  const handleBackToDashboard = () => {
    setSelectedStore(null); setSelectedFactory(null); setSelectedFarm(null); setSelectedMarketingFirm(null); setViewingFinancials(false);
    setViewingMarketReport(false); setViewingRandD(false); setViewingLogistics(false);
    setViewingCompetitorAnalysis(false); setViewingStockMarket(false); setStockDetailCompanyId(null);
    setViewingBankPanel(false); setViewingHelp(false);
    setGameStep(GameStep.MANAGE_BUSINESS);
  }

  const handleCancelBuild = useCallback(() => {
    setFactoryToBuild(null);
    setStoreToBuild(null);
    setFarmToBuild(null);
    setBuildingTypeToBuild(null);
    setGameStep(GameStep.MANAGE_BUSINESS)
  }, []);
  const handleViewWorldMap = useCallback(() => { setGameStep(GameStep.VIEW_WORLD_MAP); setSelectedCountry(null); }, []);
  const handleViewStockMarket = useCallback(() => setViewingStockMarket(true), []);
  const handleViewBank = useCallback(() => setViewingBankPanel(true), []);
  const handleViewHelp = useCallback(() => setViewingHelp(true), []);

  const handleExpandToCountry = useCallback((country: Country) => {
      if (!company || company.cash < currentExpansionCost) {
          addToast("자금이 부족하여 해외 지사를 설립할 수 없습니다.", 'error');
          return;
      }
      addNewsEvent(NewsEventType.PLAYER, '해외 진출 성공!', `${country.name.common}에 새로운 지사를 설립했습니다. 이제 이 지역에서 사업을 시작할 수 있습니다.`);
      setCompany(prev => ({ ...prev!, cash: prev!.cash - currentExpansionCost, operatingCountryNames: [...prev!.operatingCountryNames, country.name.common] }));
      setOperatingCountry(country);
      setGameStep(GameStep.MANAGE_BUSINESS);
  }, [company, currentExpansionCost, addNewsEvent]);

  const handleManageCountry = useCallback((country: Country) => { setOperatingCountry(country); setGameStep(GameStep.MANAGE_BUSINESS); }, []);
  
  const handleIPO = useCallback(() => {
    if (!company || company.isPublic) return;

    const profit = company.revenue - (company.costOfGoodsSold || 0) - (company.operatingExpenses || 0);
    let valuation = profit * 10;
    if (valuation <= 0) { valuation = company.revenue * 2; }
    if (valuation <= 0) {
        addToast("회사 가치가 0 이하이므로 상장할 수 없습니다. (매출 또는 이익이 필요합니다)", 'error');
        return;
    }

    setCompany(prev => {
        if (!prev) return null;
        const initialSharePrice = valuation / TOTAL_SHARES_OUTSTANDING;
        const sharesToSell = TOTAL_SHARES_OUTSTANDING * IPO_SHARES_TO_SELL_PERCENT;
        const cashInjection = sharesToSell * initialSharePrice;
        
        addNewsEvent(
            NewsEventType.PLAYER, 
            '성공적인 기업 공개!', 
            `축하합니다! ${prev.name}이(가) 주식 시장에 상장되어 $${cashInjection.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}의 자금을 조달했습니다.`
        );
        
        return {
            ...prev, cash: prev.cash + cashInjection, isPublic: true, sharePrice: initialSharePrice,
            sharesOutstanding: TOTAL_SHARES_OUTSTANDING, sharePriceHistory: [{ date: gameDate.toISOString(), price: initialSharePrice }],
        };
    });
  }, [company, gameDate, addNewsEvent, addToast]);

  const handleTradeShares = (targetCompanyId: string, sharesToTrade: number) => {
    const targetCompany = allCompanies.find(c => c.id === targetCompanyId);
    if (!company || !targetCompany) return;

    const tradeValue = targetCompany.sharePrice * Math.abs(sharesToTrade);

    if (sharesToTrade > 0) { // Buying
        if (company.cash < tradeValue) { 
            addToast("자금이 부족합니다.", 'error');
            return;
        }
        setCompany(prev => {
            if (!prev) return null;
            const newCash = prev.cash - tradeValue;
            const existingHolding = prev.ownedShares.find(h => h.companyId === targetCompanyId);
            let newOwnedShares;
            if (existingHolding) {
                const totalShares = existingHolding.shares + sharesToTrade;
                const newAvgCost = ((existingHolding.avgCost * existingHolding.shares) + tradeValue) / totalShares;
                newOwnedShares = prev.ownedShares.map(h => h.companyId === targetCompanyId ? { ...h, shares: totalShares, avgCost: newAvgCost } : h);
            } else {
                newOwnedShares = [...prev.ownedShares, { companyId: targetCompanyId, shares: sharesToTrade, avgCost: targetCompany.sharePrice }];
            }
            return { ...prev, cash: newCash, ownedShares: newOwnedShares };
        });
    } else { // Selling
        const sharesToSell = Math.abs(sharesToTrade);
        const existingHolding = company.ownedShares.find(h => h.companyId === targetCompanyId);
        if (!existingHolding || existingHolding.shares < sharesToSell) { 
            addToast("보유 주식이 부족합니다.", 'error');
            return;
        }
        setCompany(prev => {
            if (!prev) return null;
            const newCash = prev.cash + tradeValue;
            const newOwnedShares = prev.ownedShares.map(h => {
                if (h.companyId === targetCompanyId) { return { ...h, shares: h.shares - sharesToSell }; }
                return h;
            }).filter(h => h.shares > 0);
            return { ...prev, cash: newCash, ownedShares: newOwnedShares };
        });
    }
  };

  const handleTakeOutLoan = useCallback((offer: { amount: number, termDays: number }) => {
    setCompany(prev => {
        if (!prev) return null;
        
        const loanInterestRate = interestRate + BASE_LOAN_INTEREST_RATE_PREMIUM;
        const dailyRate = loanInterestRate / 365;
        const n = offer.termDays;
        
        // Amortization calculation
        const dailyPayment = offer.amount * (dailyRate * Math.pow(1 + dailyRate, n)) / (Math.pow(1 + dailyRate, n) - 1);

        const newLoan: Loan = {
            id: `loan_${Date.now()}`,
            principal: offer.amount,
            interestRate: loanInterestRate,
            remainingBalance: offer.amount,
            termDays: offer.termDays,
            dailyPayment: dailyPayment,
            startDate: gameDate.toISOString(),
        };
        
        addNewsEvent(
            NewsEventType.PLAYER,
            '대출 계약 체결',
            `은행으로부터 ${offer.amount.toLocaleString()} 규모의 대출을 받았습니다. 상환 기간은 ${offer.termDays}일입니다.`
        );

        return {
            ...prev,
            cash: prev.cash + offer.amount,
            loans: [...prev.loans, newLoan],
        };
    });
  }, [interestRate, gameDate, addNewsEvent]);

  const handleRepayLoan = useCallback((loanId: string, amount: number) => {
      setCompany(prev => {
          if (!prev) return null;
          const loan = prev.loans.find(l => l.id === loanId);
          if (!loan || amount <= 0) return prev;
          if (prev.cash < amount) {
              addToast("자금이 부족합니다.", 'error');
              return prev;
          }

          const repaymentAmount = Math.min(amount, loan.remainingBalance);
          const newLoans = prev.loans.map(l => {
              if (l.id === loanId) {
                  return { ...l, remainingBalance: l.remainingBalance - repaymentAmount };
              }
              return l;
          }).filter(l => l.remainingBalance > 0.01); // Filter out fully paid loans

          return { ...prev, cash: prev.cash - repaymentAmount, loans: newLoans };
      });
  }, [addToast]);
  
  const handleToggleNews = () => {
      setIsNewsOpen(prev => {
          if (!prev) { // If opening
              setNewsFeed(currentNews => currentNews.map(item => ({...item, read: true})));
          }
          return !prev;
      });
  };

  const handleResearchTech = useCallback((techId: string) => {
    if (!company) return;
    const tech = RESEARCHABLE_TECHS[techId];
    if (!tech) return;

    if (company.cash < tech.cost) {
      addToast('자금이 부족하여 기술을 연구할 수 없습니다.', 'error');
      return;
    }

    setCompany(prev => {
      if (!prev) return null;
      addNewsEvent(NewsEventType.PLAYER, '기술 연구 완료!', `새로운 기술 '${tech.name}'을(를) 성공적으로 연구했습니다!`);
      return {
        ...prev,
        cash: prev.cash - tech.cost,
        operatingExpenses: prev.operatingExpenses + tech.cost,
        unlockedTechnologies: [...prev.unlockedTechnologies, techId],
      };
    });
  }, [company, addNewsEvent, addToast]);

  const handleInvestQuality = useCallback((productId: string) => {
    if (!company) return;

    if (company.cash < currentRandDQualityCost) {
      addToast("자금이 부족합니다.", 'error');
      return;
    }

    const currentQuality = company.productQuality[productId] || 0;
    if (currentQuality >= 100) {
      addToast("최고 품질에 도달했습니다.", 'info');
      return;
    }
        
    setCompany(prevCompany => {
        if (!prevCompany) return null;

        const newQuality = Math.min(100, currentQuality + 10);

        addToast(`${ALL_PRODUCTS_DATABASE.find(p => p.id === productId)?.name} 제품의 품질이 ${newQuality.toFixed(0)}으로 향상되었습니다!`, 'success');

        return {
            ...prevCompany,
            cash: prevCompany.cash - currentRandDQualityCost,
            operatingExpenses: prevCompany.operatingExpenses + currentRandDQualityCost,
            productQuality: {
                ...prevCompany.productQuality,
                [productId]: newQuality,
            },
            stores: prevCompany.stores.map(store => ({
                ...store,
                inventory: store.inventory.map(p =>
                    p.id === productId ? { ...p, quality: newQuality } : p
                ),
            })),
        };
    });
  }, [company, currentRandDQualityCost, addToast]);
  
  const handleToggleAutoInvestQuality = useCallback((enabled: boolean) => {
    if (!company) return;
    setCompany(prev => {
        if (!prev) return null;
        return {
            ...prev,
            researchManager: {
                ...(prev.researchManager || { autoInvestQuality: false }),
                autoInvestQuality: enabled
            }
        };
    });
    addToast(`자동 품질 개선이 ${enabled ? '활성화' : '비활성화'}되었습니다.`, 'info');
  }, [company, addToast]);

  const handleSaveGame = useCallback(() => {
    if (!company) {
        addToast("저장할 게임이 없습니다.", 'error');
        return;
    }
    
    const gameState = {
        gameStep,
        gameDate,
        company,
        aiCompanies,
        selectedCountry,
        operatingCountry,
        inflation,
        interestRate,
        economicCycle,
        quartersInCurrentCycle,
        newsFeed,
        marketAverageQuality,
        marketAverageBrand,
        ipoReadinessThreshold,
    };
    
    try {
        localStorage.setItem(SAVE_GAME_KEY, JSON.stringify(gameState));
        addToast("게임이 성공적으로 저장되었습니다.", 'success');
    } catch (e) {
        console.error("Failed to save game:", e);
        addToast("게임 저장에 실패했습니다. 저장 공간이 부족할 수 있습니다.", 'error');
    }
  }, [
      gameStep, gameDate, company, aiCompanies, selectedCountry, operatingCountry,
      inflation, interestRate, economicCycle, quartersInCurrentCycle, newsFeed,
      marketAverageQuality, marketAverageBrand, ipoReadinessThreshold, addToast
  ]);

  const handleLoadGame = useCallback(() => {
    const savedDataString = localStorage.getItem(SAVE_GAME_KEY);
    if (!savedDataString) {
        addToast("저장된 게임이 없습니다.", 'error');
        return;
    }

    try {
        const savedData = JSON.parse(savedDataString);

        const hydrateCompany = (c: Company | null): Company | null => {
            if (!c) return null;
            return {
                ...c,
                sharePriceHistory: (c.sharePriceHistory || []).map((h: any) => ({ ...h, date: new Date(h.date) })),
                loans: (c.loans || []).map((l: any) => ({ ...l, startDate: new Date(l.startDate) })),
                quarterlyFinancialsHistory: (c.quarterlyFinancialsHistory || []).map((q: any) => ({ ...q, date: new Date(q.date) })),
            };
        };

        setGameStep(savedData.gameStep);
        setGameDate(new Date(savedData.gameDate));
        setCompany(hydrateCompany(savedData.company));
        setAiCompanies(savedData.aiCompanies.map(hydrateCompany));
        setSelectedCountry(savedData.selectedCountry);
        setOperatingCountry(savedData.operatingCountry);
        setInflation(savedData.inflation);
        setInterestRate(savedData.interestRate);
        setEconomicCycle(savedData.economicCycle);
        setQuartersInCurrentCycle(savedData.quartersInCurrentCycle);
        setNewsFeed((savedData.newsFeed || []).map((item: any) => ({ ...item, date: new Date(item.date) })));
        setMarketAverageQuality(savedData.marketAverageQuality);
        setMarketAverageBrand(savedData.marketAverageBrand);
        setIpoReadinessThreshold(savedData.ipoReadinessThreshold);

        // Reset transient UI state
        setGameSpeed(0); // Pause on load
        handleBackToDashboard();

        addToast("게임을 불러왔습니다. 게임이 일시정지되었습니다.", 'success');
        
    } catch (e) {
        console.error("Failed to load game:", e);
        addToast("게임 불러오기에 실패했습니다. 저장 파일이 손상되었을 수 있습니다.", 'error');
        localStorage.removeItem(SAVE_GAME_KEY);
    }
  }, [addToast]);

  const handleDisarmReset = useCallback(() => {
    if (resetTimeoutRef.current) {
        clearTimeout(resetTimeoutRef.current);
        resetTimeoutRef.current = null;
    }
    setIsResetArmed(false);
  }, []);

  const handleResetGame = useCallback(() => {
    if (isResetArmed) {
        handleDisarmReset();

        localStorage.removeItem(SAVE_GAME_KEY);
        
        setGameStep(GameStep.SELECT_COUNTRY);
        setGameDate(new Date(2024, 0, 1));
        setGameSpeed(1);
        setSelectedCountry(null);
        setOperatingCountry(null);
        setCompany(null);
        setAiCompanies([]);
        setSelectedStore(null);
        setSelectedFactory(null);
        setSelectedFarm(null);
        setSelectedMarketingFirm(null);
        setViewingFinancials(false);
        setViewingMarketReport(false);
        setViewingRandD(false);
        setViewingLogistics(false);
        setViewingCompetitorAnalysis(false);
        setViewingStockMarket(false);
        setViewingBankPanel(false);
        setViewingHelp(false);
        setStockDetailCompanyId(null);
        setIpoReadinessThreshold(INITIAL_IPO_READINESS_THRESHOLD);
        setIsNamingCompany(false);
        setFactoryToBuild(null);
        setFarmToBuild(null);
        setStoreToBuild(null);
        setBuildingTypeToBuild(null);
        setInflation(INITIAL_INFLATION_RATE);
        setInterestRate(INITIAL_INTEREST_RATE);
        setEconomicCycle(EconomicCycle.NORMAL);
        setQuartersInCurrentCycle(0);
        setNewsFeed([]);
        setIsNewsOpen(false);
        setMarketAverageQuality({});
        setMarketAverageBrand({});
        
        setIsResetArmed(false);
        addToast("새 게임을 시작합니다.", 'info');

    } else {
        setIsResetArmed(true);
        resetTimeoutRef.current = window.setTimeout(() => {
            setIsResetArmed(false);
        }, 5000); // Auto-disarm after 5 seconds
    }
  }, [addToast, isResetArmed, handleDisarmReset]);


  const renderMainContent = () => {
    if (loading) return <p>세계 데이터 로딩 중...</p>;

    if (stockDetailCompanyId && company) {
        return <CompanyStockDetailPanel playerCompany={company} targetCompany={allCompanies.find(c => c.id === stockDetailCompanyId)!} onBack={() => setStockDetailCompanyId(null)} onTrade={handleTradeShares} />
    }
    if (viewingStockMarket && company) {
        return <StockMarketPanel playerCompany={company} allCompanies={allCompanies} onBack={handleBackToDashboard} onViewDetail={setStockDetailCompanyId} onIPO={handleIPO} ipoReadinessThreshold={ipoReadinessThreshold} />;
    }
    if (selectedStore && company) {
        return <StoreDetailPanel store={company.stores.find(s => s.id === selectedStore.id) || selectedStore} company={company} setCompany={setCompany} onBack={handleBackToDashboard} initialProducts={currentInitialProducts} manufacturableProducts={currentManufacturableProducts} />;
    }
    if (selectedFactory && company) {
        return <FactoryDetailPanel factory={company.factories.find(f => f.id === selectedFactory.id) || selectedFactory} setCompany={setCompany} onBack={handleBackToDashboard} manufacturableProducts={currentManufacturableProducts} />;
    }
    if (selectedFarm && company) {
        return <FarmDetailPanel farm={company.farms.find(f => f.id === selectedFarm.id) || selectedFarm} setCompany={setCompany} onBack={handleBackToDashboard} farmableRawMaterials={FARMABLE_RAW_MATERIALS} />;
    }
    if (selectedMarketingFirm && company) {
        return <MarketingDetailPanel firm={company.marketingFirms.find(f => f.id === selectedMarketingFirm.id) || selectedMarketingFirm} company={company} setCompany={setCompany} onBack={handleBackToDashboard} allProducts={ALL_PRODUCTS_DATABASE} campaignCost={BASE_MARKETING_CAMPAIGN_DAILY_COST} />;
    }

    switch (gameStep) {
        case GameStep.SELECT_COUNTRY:
        case GameStep.VIEW_WORLD_MAP:
            return <WorldMap countries={countries} onCountrySelect={handleCountrySelect} selectedCountry={selectedCountry} hqCountryName={company?.hqCountry || null} operatingCountryNames={company?.operatingCountryNames || []} />;
        case GameStep.MANAGE_BUSINESS:
            if (company && operatingCountry) {
                if (viewingFinancials) return <FinancialsPanel company={company} allCompanies={allCompanies} onBack={handleBackToDashboard} />
                if (viewingMarketReport && selectedCountry) return <MarketReportPanel country={selectedCountry} onBack={handleBackToDashboard} aiCompanies={aiCompanies} />
                if (viewingMarketReport && operatingCountry) return <MarketReportPanel country={operatingCountry} onBack={handleBackToDashboard} aiCompanies={aiCompanies} />
                if (viewingRandD) return <ResearchAndDevelopmentPanel company={company} onBack={handleBackToDashboard} investmentCost={currentRandDQualityCost} onResearchTech={handleResearchTech} onInvestQuality={handleInvestQuality} onToggleAutoInvestQuality={handleToggleAutoInvestQuality} />
                if (viewingLogistics) return <LogisticsPanel company={company} setCompany={setCompany} onBack={handleBackToDashboard} rawMaterials={currentRawMaterials} manufacturableProducts={currentManufacturableProducts} />
                if (viewingCompetitorAnalysis) return <CompetitorAnalysisPanel aiCompanies={aiCompanies} countries={countries} onBack={handleBackToDashboard} />
                if (viewingBankPanel) return <BankPanel company={company} onBack={handleBackToDashboard} onTakeOutLoan={handleTakeOutLoan} onRepayLoan={handleRepayLoan} interestRate={interestRate} />
                if (viewingHelp) return <HelpPanel onBack={handleBackToDashboard} />;
                return <BusinessDashboard 
                    company={company} operatingCountry={operatingCountry}
                    stores={company.stores.filter(s => s.countryName === operatingCountry.name.common)}
                    factories={company.factories.filter(f => f.countryName === operatingCountry.name.common)}
                    farms={company.farms.filter(f => f.countryName === operatingCountry.name.common)}
                    marketingFirms={company.marketingFirms.filter(f => f.countryName === operatingCountry.name.common)}
                    onBuildStore={handleStartBuildingStore} onBuildFactory={handleStartBuildingFactory} onBuildFarm={handleStartBuildingFarm} onBuildMarketingFirm={handleStartBuildingMarketingFirm}
                    onBuildResearchCenter={handleBuildResearchCenter} onSelectStore={handleStoreSelect} onSelectFactory={handleFactorySelect} onSelectFarm={handleFarmSelect} onSelectMarketingFirm={handleMarketingFirmSelect}
                    onViewFinancials={() => setViewingFinancials(true)} onViewMarketReport={() => setViewingMarketReport(true)} 
                    onViewRandD={() => setViewingRandD(true)} onViewLogistics={() => setViewingLogistics(true)}
                    onViewCompetitorAnalysis={() => setViewingCompetitorAnalysis(true)}
                    onViewWorldMap={handleViewWorldMap} onViewStockMarket={handleViewStockMarket}
                    onViewBank={handleViewBank} onViewHelp={handleViewHelp}
                    onSaveGame={handleSaveGame} onLoadGame={handleLoadGame} onResetGame={handleResetGame} isResetArmed={isResetArmed}
                    manufacturableProducts={currentManufacturableProducts}
                    farmableRawMaterials={FARMABLE_RAW_MATERIALS}
                    costs={{ 
                        store: currentStoreCost, 
                        factory: currentFactoryCost, 
                        researchCenter: currentResearchCenterCost, 
                        electronicsFactory: currentElectronicsFactoryCost, 
                        dealership: currentDealershipCost, 
                        automobileFactory: currentAutomobileFactoryCost, 
                        farm: currentFarmCost, 
                        marketingFirm: currentMarketingFirmCost,
                        apparelStore: currentApparelStoreCost,
                        textileFactory: currentTextileFactoryCost,
                        pharmacy: currentPharmacyCost,
                        pharmaceuticalFactory: currentPharmaceuticalFactoryCost,
                        aviationShowroom: currentAviationShowroomCost,
                        aircraftFactory: currentAircraftFactoryCost,
                        electronicsStore: currentElectronicsStoreCost,
                        softwareStudio: currentSoftwareStudioCost,
                    }}
                />;
            }
            return null;
        case GameStep.SELECT_CITY_FOR_STORE:
            if (operatingCountry && storeToBuild) {
                let cost;
                if (storeToBuild === '자동차 대리점') {
                    cost = currentDealershipCost;
                } else if (storeToBuild === '의류 매장') {
                    cost = currentApparelStoreCost;
                } else if (storeToBuild === '약국') {
                    cost = currentPharmacyCost;
                } else if (storeToBuild === '항공 쇼룸') {
                    cost = currentAviationShowroomCost;
                } else if (storeToBuild === '전자제품 매장') {
                    cost = currentElectronicsStoreCost;
                } else {
                    cost = currentStoreCost;
                }
                return <CitySelectionPanel country={operatingCountry} onCitySelect={handleEstablishStore} buildingType={storeToBuild} onCancel={handleCancelBuild} cost={cost} />;
            }
            return null;
        case GameStep.SELECT_CITY_FOR_FACTORY:
            if (operatingCountry && factoryToBuild) {
                let cost: number;
                if (factoryToBuild === 'prod_smartphone') {
                  cost = currentElectronicsFactoryCost;
                } else if (factoryToBuild === 'prod_car') {
                  cost = currentAutomobileFactoryCost;
                } else if (['rm_fabric', 'prod_tshirt', 'prod_jeans'].includes(factoryToBuild)) {
                    cost = currentTextileFactoryCost;
                } else if (['prod_painkiller', 'prod_antibiotics'].includes(factoryToBuild)) {
                    cost = currentPharmaceuticalFactoryCost;
                } else if (factoryToBuild === 'prod_airplane') {
                    cost = currentAircraftFactoryCost;
                } else if (['prod_videogame', 'prod_os', 'prod_bizsoftware'].includes(factoryToBuild)) {
                    cost = currentSoftwareStudioCost;
                } else {
                  cost = currentFactoryCost;
                }
                const productInfo = currentManufacturableProducts[factoryToBuild];

                return <CitySelectionPanel
                    country={operatingCountry}
                    onCitySelect={handleEstablishFactory}
                    buildingType="factory"
                    onCancel={handleCancelBuild}
                    cost={cost}
                    factoryProductName={productInfo?.name}
                />;
            }
            return null;
        case GameStep.SELECT_CITY_FOR_FARM:
             if (operatingCountry && farmToBuild) {
                const farmInfo = FARMABLE_RAW_MATERIALS[farmToBuild];
                return <CitySelectionPanel
                    country={operatingCountry}
                    onCitySelect={handleEstablishFarm}
                    buildingType="farm"
                    onCancel={handleCancelBuild}
                    cost={currentFarmCost}
                    farmRawMaterialName={farmInfo?.name}
                />;
            }
            return null;
        case GameStep.SELECT_CITY_FOR_MARKETING_FIRM:
            if(operatingCountry && buildingTypeToBuild === 'marketing_firm') {
                return <CitySelectionPanel 
                    country={operatingCountry}
                    onCitySelect={handleEstablishMarketingFirm}
                    buildingType="마케팅 에이전시"
                    onCancel={handleCancelBuild}
                    cost={currentMarketingFirmCost}
                />
            }
            return null;
        default:
            return null;
    }
  };
  
  const hqCountry = company ? countries.find(c => c.name.common === company.hqCountry) : null;
  const gameTimeRunning = gameStep === GameStep.MANAGE_BUSINESS && company && (company.stores.length > 0 || company.factories.length > 0 || company.farms.length > 0 || aiCompanies.some(ai => ai.stores.length > 0) || (company?.loans.length ?? 0) > 0);

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 flex flex-col">
      <Header
        gameDate={gameTimeRunning ? gameDate : undefined}
        gameSpeed={gameSpeed}
        onGameSpeedChange={setGameSpeed}
        onToggleNews={handleToggleNews}
        unreadNewsCount={unreadNewsCount}
      />
      <main className="flex-grow container mx-auto p-4 md:p-6 lg:p-8 grid grid-cols-1 lg:grid-cols-12 gap-6">
        {isResetArmed && (
            <div className="lg:col-span-12 bg-red-900/30 border-l-4 border-red-500 border border-red-500/30 rounded-r-lg p-4 flex items-center justify-between animate-fade-in-slow shadow-lg shadow-red-900/30">
                <div className="flex items-center">
                    <ExclamationCircleIcon className="w-6 h-6 text-red-400 mr-3 flex-shrink-0" />
                    <p className="text-white font-medium">
                        정말로 초기화하시겠습니까? 다시 클릭하여 확인하세요.
                    </p>
                </div>
                <button
                    onClick={handleDisarmReset}
                    className="p-1 rounded-full hover:bg-red-800/50 transition-colors ml-4"
                    aria-label="경고 닫기"
                >
                    <XIcon className="w-5 h-5 text-red-300"/>
                </button>
            </div>
        )}
        <div className="lg:col-span-8 bg-slate-800/50 rounded-xl border border-slate-700 shadow-2xl flex items-center justify-center p-2 min-h-[400px] lg:min-h-0">
          {renderMainContent()}
        </div>

        <div className="lg:col-span-4">
            {gameStep === GameStep.SELECT_COUNTRY && selectedCountry && (
                <CountryDetailPanel country={selectedCountry} onConfirm={() => setIsNamingCompany(true)} gameStep={gameStep} />
            )}
            {gameStep === GameStep.VIEW_WORLD_MAP && (
                selectedCountry ? (
                    <CountryDetailPanel country={selectedCountry} onConfirm={() => {}} gameStep={gameStep} company={company} onExpand={handleExpandToCountry} onManageCountry={handleManageCountry} expansionCost={currentExpansionCost} />
                ) : (
                    <GlobalEconomyPanel interestRate={interestRate} inflationRate={inflation} economicCycle={economicCycle} />
                )
            )}
            {gameStep !== GameStep.SELECT_COUNTRY && gameStep !== GameStep.VIEW_WORLD_MAP && hqCountry && company && (
                <div className="bg-slate-800 rounded-xl p-6 border border-slate-700 shadow-lg h-full">
                    <h3 className="font-bold text-xl text-emerald-400 mb-4">본사 정보</h3>
                    <div className="flex items-center space-x-4 mb-4">
                        <img src={hqCountry.flags.svg} alt={hqCountry.flags.alt || `${hqCountry.name.common} 국기`} className="w-16 h-auto rounded-md object-cover border-2 border-slate-600" />
                        <div>
                            <p className="font-bold text-lg">{hqCountry.name.common}</p>
                            <p className="text-sm text-slate-400">{hqCountry.capital?.[0]}</p>
                        </div>
                    </div>
                    <h4 className="font-semibold text-md text-sky-400 mt-6 mb-2">글로벌 자산 현황</h4>
                    <div className="text-sm space-y-2">
                        <div className="flex justify-between"><span className="text-slate-400">진출 국가:</span> <span>{company.operatingCountryNames.length} 개국</span></div>
                        <div className="flex justify-between"><span className="text-slate-400">총 소매점:</span> <span>{company.stores.length} 개</span></div>
                        <div className="flex justify-between"><span className="text-slate-400">총 공장:</span> <span>{company.factories.length} 개</span></div>
                        <div className="flex justify-between"><span className="text-slate-400">총 농장:</span> <span>{company.farms.length} 개</span></div>
                        <div className="flex justify-between"><span className="text-slate-400">총 마케팅 에이전시:</span> <span>{company.marketingFirms.length} 개</span></div>
                        <div className="flex justify-between"><span className="text-slate-400">총 대출금:</span> <span>{company.loans.reduce((acc, loan) => acc + loan.remainingBalance, 0).toLocaleString('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 0 })}</span></div>
                        <div className="flex justify-between"><span className="text-slate-400">연구소:</span> <span>{company.hasResearchCenter ? '보유' : '미보유'}</span></div>
                        <div className="flex justify-between"><span className="text-slate-400">상장 여부:</span> <span>{company.isPublic ? '상장' : '비상장'}</span></div>
                        <div className="flex justify-between"><span className="text-slate-400">경쟁사:</span> <span>{aiCompanies.length} 곳</span></div>
                    </div>
                </div>
            )}
        </div>
      </main>
       {isNamingCompany && selectedCountry && (
        <CompanyNameInputModal
            country={selectedCountry}
            onConfirm={handleConfirmEstablishment}
            onCancel={() => setIsNamingCompany(false)}
        />
      )}
      <NewsFeedPanel 
        isOpen={isNewsOpen}
        onClose={() => setIsNewsOpen(false)}
        newsFeed={newsFeed}
      />
    </div>
  );
}