

export interface Country {
  name: {
    common: string;
    official: string;
  };
  cca3: string;
  ccn3: string;
  capital: string[];
  region: string;
  subregion: string;
  population: number;
  flags: {
    png: string;
    svg: string;
    alt?: string;
  };
  id?: string; // Matched from topojson
}

export enum GameStep {
  SELECT_COUNTRY,
  SELECT_CITY_FOR_STORE,
  SELECT_CITY_FOR_FACTORY,
  SELECT_CITY_FOR_FARM,
  SELECT_CITY_FOR_MARKETING_FIRM,
  MANAGE_BUSINESS,
  MANAGE_FACTORY,
  VIEW_WORLD_MAP,
}

export enum EconomicCycle {
  NORMAL = '정상',
  BOOM = '호황',
  RECESSION = '불황',
}

export interface City {
    name: string;
    population: number;
    incomeLevel: '낮음' | '중간' | '높음';
    economicGrowth: number; // percentage
}

export interface Product {
    id: string;
    name:string;
    cost: number; // Represents the *average* cost of goods in stock
    price: number; // Selling price, to be set by player
    stock: number; // Current inventory level
    quality: number; // Quality of the product (0-100)
}

export interface Store {
    id:string;
    type: string; // e.g., 'Convenience Store'
    cityName: string;
    countryName: string;
    inventory: Product[];
    manager: {
        autoPrice: boolean;
        autoStock: boolean;
    };
}

export interface RawMaterial {
    id: string;
    name: string;
    cost: number;
}

export interface Factory {
    id: string;
    cityName: string;
    countryName: string;
    productId: string; // What it produces
    productionRate: number; // units per day
    manager: {
        autoProduce: boolean;
    };
}

export interface Farm {
    id: string;
    cityName: string;
    countryName:string;
    producesId: string; // What raw material it produces
    productionRate: number; // units per day
    manager: {
        autoProduce: boolean;
    };
}

export interface MarketingFirm {
    id: string;
    cityName: string;
    countryName: string;
    manager: {
        autoManageCampaigns: boolean;
    };
}


export interface ShareHolding {
    companyId: string;
    shares: number;
    avgCost: number;
}

export interface SharePriceHistory {
    date: string; // ISO string
    price: number;
}

export interface Loan {
    id: string;
    principal: number; // Original loan amount
    interestRate: number; // Annual interest rate at time of loan
    remainingBalance: number;
    termDays: number; // e.g., 365 for a 1-year loan
    dailyPayment: number;
    startDate: string; // ISO date string
}

export interface QuarterlyFinancials {
    date: string; // End of quarter date
    revenue: number;
    costOfGoodsSold: number;
    operatingExpenses: number;
    logisticsExpenses: number;
    interestIncome: number;
    interestExpense: number;
    taxesPaid: number;
    netIncome: number;
}

export interface Company {
    id: string;
    name: string;
    cash: number;
    revenue: number; // Cumulative total revenue
    costOfGoodsSold: number; // Cumulative total COGS
    operatingExpenses: number; // Cumulative total OpEx
    logisticsExpenses: number; // 누적 총 물류비
    interestIncome: number; // Cumulative total interest income
    interestExpense: number; // Cumulative total interest expense from loans
    taxesPaid: number; // 누적 납부 세금
    hqCountry: string;
    stores: Store[];
    factories: Factory[];
    farms: Farm[];
    marketingFirms: MarketingFirm[];
    centralInventory: { [itemId: string]: number }; // Key is product or raw material ID.
    operatingCountryNames: string[];
    hasResearchCenter: boolean;
    researchManager: {
        autoInvestQuality: boolean;
    };
    productQuality: { [productId: string]: number };
    unlockedTechnologies: string[]; // Array of tech IDs that have been researched
    brandAwareness: { [countryName: string]: { [productId: string]: number } }; // { countryName: { productId: awareness (0-100) } }
    logisticsManager: {
        autoPurchaseRawMaterials: boolean;
        autoSupplyStores: boolean;
    };
    activeMarketingCampaigns: { [marketingFirmId: string]: string[] }; // { marketingFirmId: [productId1, productId2] }
    // Stock Market Properties
    isPublic: boolean;
    sharesOutstanding: number;
    sharePrice: number;
    sharePriceHistory: SharePriceHistory[];
    ownedShares: ShareHolding[];
    // Financials
    loans: Loan[];
    lastQuarterFinancials: { // 분기별 수익 계산을 위해 지난 분기 말의 재무 상태 저장
        revenue: number;
        costOfGoodsSold: number;
        operatingExpenses: number;
        logisticsExpenses: number;
        interestIncome: number;
        interestExpense: number;
    };
    quarterlyFinancialsHistory: QuarterlyFinancials[];
}

export enum NewsEventType {
    TUTORIAL = 'tutorial',
    ECONOMY = 'economy',
    COMPETITOR = 'competitor',
    PLAYER = 'player',
    GENERAL = 'general',
}

export interface NewsEvent {
    id: string;
    date: Date;
    type: NewsEventType;
    title: string;
    message: string;
    read: boolean;
}

export interface Toast {
  id: string;
  message: string;
  type: 'success' | 'error' | 'info';
}