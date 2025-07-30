

import type { Product, RawMaterial } from './types';

// These are now BASE costs, subject to inflation.
export const BASE_INITIAL_PRODUCTS: Omit<Product, 'stock' | 'price'>[] = [
    { id: 'prod_cola', name: '콜라', cost: 0.5, quality: 20 },
    { id: 'prod_chips', name: '감자칩', cost: 0.8, quality: 20 },
    { id: 'prod_bread', name: '빵', cost: 1.2, quality: 20 },
];

export const BASE_RAW_MATERIALS: RawMaterial[] = [
    { id: 'rm_flour', name: '밀가루', cost: 0.4 },
    { id: 'rm_sugar', name: '설탕', cost: 0.6 },
    { id: 'rm_wheat', name: '밀', cost: 0.15 },
    { id: 'rm_sugar_cane', name: '사탕수수', cost: 0.1 },
    { id: 'rm_plastic', name: '플라스틱', cost: 1.5 },
    { id: 'rm_semiconductor', name: '반도체', cost: 25 },
    { id: 'rm_steel', name: '강철', cost: 10 },
    { id: 'rm_rubber', name: '고무', cost: 5 },
    { id: 'rm_engine', name: '엔진', cost: 2000 },
    // Apparel Industry
    { id: 'rm_cotton', name: '목화', cost: 0.2 },
    { id: 'rm_dyes', name: '염료', cost: 1.0 },
    { id: 'rm_fabric', name: '직물', cost: 1.0 }, // Market price, slightly higher than mfg cost
    { id: 'rm_leather', name: '가죽', cost: 15.0 },
    // Pharmaceutical Industry
    { id: 'rm_chemicals', name: '화학물질', cost: 8.0 },
    { id: 'rm_purified_water', name: '정제수', cost: 0.5 },
    // Aerospace Industry
    { id: 'rm_aluminum', name: '알루미늄', cost: 500 },
    { id: 'rm_composites', name: '복합재료', cost: 1500 },
    { id: 'rm_avionics', name: '항공전자장비', cost: 50000 },
    { id: 'rm_jet_engine', name: '제트 엔진', cost: 500000 },
    { id: 'rm_titanium', name: '티타늄', cost: 800 },
    // Software Industry
    { id: 'rm_coders', name: '개발자 시간', cost: 100 },
    { id: 'rm_server_space', name: '서버 공간', cost: 20 },
    // New Raw Materials
    // Food
    { id: 'rm_cheese', name: '치즈', cost: 2.0 },
    { id: 'rm_tomato_sauce', name: '토마토 소스', cost: 1.0 },
    { id: 'rm_milk', name: '우유', cost: 0.8 },
    { id: 'rm_coffee_beans', name: '원두', cost: 4.0 },
    // Electronics
    { id: 'rm_lithium', name: '리튬', cost: 30.0 },
    { id: 'rm_lcd_panel', name: 'LCD 패널', cost: 40.0 },
    { id: 'rm_small_motor', name: '소형 모터', cost: 20.0 },
    // Automotive
    { id: 'rm_motorcycle_engine', name: '오토바이 엔진', cost: 500 },
];

export const FARMABLE_RAW_MATERIALS: { [rawMaterialId: string]: { name: string; productionRate: number } } = {
    'rm_wheat': { name: '밀', productionRate: 150 },
    'rm_sugar_cane': { name: '사탕수수', productionRate: 120 },
    'rm_cotton': { name: '목화', productionRate: 100 },
    'rm_milk': { name: '우유', productionRate: 90 },
    'rm_coffee_beans': { name: '원두', productionRate: 70 },
};

export const MANUFACTURABLE_PRODUCTS: { [productId: string]: { name: string; recipe: { id: string; amount: number }[]; manufacturingCost: number; productionRate: number; requiredTech?: string; } } = {
    'rm_sugar': {
        name: '설탕',
        recipe: [{ id: 'rm_sugar_cane', amount: 4 }],
        manufacturingCost: 0.4, // 4 * 0.1
        productionRate: 80,
    },
    'prod_bread': {
        name: '빵',
        recipe: [{ id: 'rm_flour', amount: 2 }],
        manufacturingCost: 0.8, // 2 flour * 0.4 cost. This is also a base cost.
        productionRate: 50, // units per day
    },
    'prod_cake': {
        name: '케이크',
        recipe: [
            { id: 'rm_flour', amount: 3 },
            { id: 'rm_sugar', amount: 2 },
        ],
        manufacturingCost: 2.4,
        productionRate: 30,
        requiredTech: 'tech_food_processing',
    },
    'prod_frozen_pizza': {
        name: '냉동 피자',
        recipe: [ { id: 'rm_flour', amount: 1.5 }, { id: 'rm_cheese', amount: 1 }, { id: 'rm_tomato_sauce', amount: 0.5 } ],
        manufacturingCost: 3.1,
        productionRate: 40,
        requiredTech: 'tech_food_processing',
    },
    'prod_ice_cream': {
        name: '아이스크림',
        recipe: [ { id: 'rm_milk', amount: 2 }, { id: 'rm_sugar', amount: 1 } ],
        manufacturingCost: 2.2,
        productionRate: 60,
        requiredTech: 'tech_food_processing',
    },
    'prod_premium_coffee': {
        name: '프리미엄 커피',
        recipe: [ { id: 'rm_coffee_beans', amount: 0.5 }, { id: 'rm_purified_water', amount: 1 } ],
        manufacturingCost: 2.5,
        productionRate: 100,
        requiredTech: 'tech_food_processing',
    },
     'rm_fabric': {
        name: '직물',
        recipe: [{ id: 'rm_cotton', amount: 4 }],
        manufacturingCost: 0.8, // 4 * 0.2
        productionRate: 60,
        requiredTech: 'tech_textiles',
    },
     'prod_tshirt': {
        name: '티셔츠',
        recipe: [
            { id: 'rm_fabric', amount: 2 },
            { id: 'rm_dyes', amount: 0.5 },
        ],
        manufacturingCost: 2.1, // 2 * 0.8 + 0.5 * 1.0
        productionRate: 40,
        requiredTech: 'tech_textiles',
    },
    'prod_jeans': {
        name: '청바지',
        recipe: [
            { id: 'rm_fabric', amount: 5 },
            { id: 'rm_dyes', amount: 1 },
        ],
        manufacturingCost: 5.0, // 5 * 0.8 + 1 * 1.0
        productionRate: 25,
        requiredTech: 'tech_textiles',
    },
    'prod_jacket': {
        name: '가죽 자켓',
        recipe: [ { id: 'rm_fabric', amount: 3 }, { id: 'rm_leather', amount: 2 } ],
        manufacturingCost: 32.4,
        productionRate: 15,
        requiredTech: 'tech_textiles',
    },
    'prod_socks': {
        name: '양말',
        recipe: [ { id: 'rm_cotton', amount: 1 }, { id: 'rm_dyes', amount: 0.1 } ],
        manufacturingCost: 0.3,
        productionRate: 80,
        requiredTech: 'tech_textiles',
    },
    'prod_smartphone': {
        name: '스마트폰',
        recipe: [
            { id: 'rm_plastic', amount: 5 },
            { id: 'rm_semiconductor', amount: 2 }
        ],
        manufacturingCost: 57.5, // (5 * 1.5) + (2 * 25)
        productionRate: 20,
        requiredTech: 'tech_electronics',
    },
     'prod_laptop': {
        name: '노트북',
        recipe: [ { id: 'rm_plastic', amount: 10 }, { id: 'rm_semiconductor', amount: 4 }, { id: 'rm_lcd_panel', amount: 1 }, { id: 'rm_lithium', amount: 2 } ],
        manufacturingCost: 215,
        productionRate: 10,
        requiredTech: 'tech_electronics',
    },
    'prod_tv': {
        name: '텔레비전',
        recipe: [ { id: 'rm_plastic', amount: 15 }, { id: 'rm_lcd_panel', amount: 1 }, { id: 'rm_semiconductor', amount: 1 } ],
        manufacturingCost: 87.5,
        productionRate: 15,
        requiredTech: 'tech_electronics',
    },
    'prod_drone': {
        name: '드론',
        recipe: [ { id: 'rm_plastic', amount: 2 }, { id: 'rm_semiconductor', amount: 1 }, { id: 'rm_small_motor', amount: 4 } ],
        manufacturingCost: 108,
        productionRate: 25,
        requiredTech: 'tech_electronics',
    },
    'prod_car': {
        name: '자동차',
        recipe: [
            { id: 'rm_steel', amount: 100 },
            { id: 'rm_rubber', amount: 40 },
            { id: 'rm_engine', amount: 1 },
        ],
        manufacturingCost: 3200,
        productionRate: 5,
        requiredTech: 'tech_automotive',
    },
    'prod_truck': {
        name: '트럭',
        recipe: [ { id: 'rm_steel', amount: 200 }, { id: 'rm_rubber', amount: 80 }, { id: 'rm_engine', amount: 2 } ],
        manufacturingCost: 6400,
        productionRate: 2,
        requiredTech: 'tech_automotive',
    },
    'prod_motorcycle': {
        name: '오토바이',
        recipe: [ { id: 'rm_steel', amount: 20 }, { id: 'rm_rubber', amount: 10 }, { id: 'rm_motorcycle_engine', amount: 1 } ],
        manufacturingCost: 750,
        productionRate: 10,
        requiredTech: 'tech_automotive',
    },
    'prod_painkiller': {
        name: '진통제',
        recipe: [
            { id: 'rm_chemicals', amount: 1 },
            { id: 'rm_purified_water', amount: 2 },
        ],
        manufacturingCost: 9.0, // (1 * 8.0) + (2 * 0.5)
        productionRate: 30,
        requiredTech: 'tech_pharmaceuticals',
    },
    'prod_antibiotics': {
        name: '항생제',
        recipe: [
            { id: 'rm_chemicals', amount: 3 },
            { id: 'rm_purified_water', amount: 5 },
        ],
        manufacturingCost: 26.5, // (3 * 8.0) + (5 * 0.5)
        productionRate: 15,
        requiredTech: 'tech_pharmaceuticals',
    },
    'prod_vitamins': {
        name: '비타민',
        recipe: [ { id: 'rm_chemicals', amount: 0.5 }, { id: 'rm_sugar', amount: 0.2 } ],
        manufacturingCost: 4.12,
        productionRate: 50,
        requiredTech: 'tech_pharmaceuticals',
    },
    'prod_vaccine': {
        name: '백신',
        recipe: [ { id: 'rm_chemicals', amount: 5 }, { id: 'rm_purified_water', amount: 10 } ],
        manufacturingCost: 45,
        productionRate: 10,
        requiredTech: 'tech_pharmaceuticals',
    },
    'prod_airplane': {
        name: '개인용 제트기',
        recipe: [
            { id: 'rm_aluminum', amount: 500 },
            { id: 'rm_composites', amount: 200 },
            { id: 'rm_avionics', amount: 10 },
            { id: 'rm_jet_engine', amount: 2 },
        ],
        manufacturingCost: 2050000, 
        productionRate: 1,
        requiredTech: 'tech_aerospace',
    },
     'prod_satellite': {
        name: '인공위성',
        recipe: [ { id: 'rm_titanium', amount: 100 }, { id: 'rm_composites', amount: 50 }, { id: 'rm_avionics', amount: 20 } ],
        manufacturingCost: 1155000,
        productionRate: 1,
        requiredTech: 'tech_aerospace',
    },
    'prod_helicopter': {
        name: '헬리콥터',
        recipe: [ { id: 'rm_aluminum', amount: 200 }, { id: 'rm_composites', amount: 50 }, { id: 'rm_engine', amount: 1 } ],
        manufacturingCost: 177000,
        productionRate: 2,
        requiredTech: 'tech_aerospace',
    },
    'prod_videogame': {
        name: '비디오 게임',
        recipe: [
            { id: 'rm_coders', amount: 10 },
            { id: 'rm_server_space', amount: 5 },
        ],
        manufacturingCost: 1100,
        productionRate: 10,
        requiredTech: 'tech_software',
    },
    'prod_os': {
        name: '운영체제',
        recipe: [
            { id: 'rm_coders', amount: 50 },
            { id: 'rm_server_space', amount: 20 },
        ],
        manufacturingCost: 5400,
        productionRate: 2,
        requiredTech: 'tech_software',
    },
    'prod_bizsoftware': {
        name: '비즈니스 소프트웨어',
        recipe: [
            { id: 'rm_coders', amount: 30 },
            { id: 'rm_server_space', amount: 15 },
        ],
        manufacturingCost: 3300,
        productionRate: 5,
        requiredTech: 'tech_software',
    },
    'prod_antivirus': {
        name: '백신 소프트웨어',
        recipe: [ { id: 'rm_coders', amount: 20 }, { id: 'rm_server_space', amount: 10 } ],
        manufacturingCost: 2200,
        productionRate: 8,
        requiredTech: 'tech_software',
    },
    'prod_photo_editor': {
        name: '사진 편집기',
        recipe: [ { id: 'rm_coders', amount: 15 }, { id: 'rm_server_space', amount: 8 } ],
        manufacturingCost: 1660,
        productionRate: 12,
        requiredTech: 'tech_software',
    },
};

// A list of ALL products that can potentially be in a store.
export const ALL_PRODUCTS_DATABASE: Omit<Product, 'stock' | 'price'>[] = [
    ...BASE_INITIAL_PRODUCTS,
    { id: 'prod_cake', name: '케이크', cost: 2.4, quality: 35 },
    { id: 'prod_frozen_pizza', name: '냉동 피자', cost: 3.1, quality: 30 },
    { id: 'prod_ice_cream', name: '아이스크림', cost: 2.2, quality: 32 },
    { id: 'prod_premium_coffee', name: '프리미엄 커피', cost: 2.5, quality: 40 },
    { id: 'prod_tshirt', name: '티셔츠', cost: 2.5, quality: 25 },
    { id: 'prod_jeans', name: '청바지', cost: 6.0, quality: 30 },
    { id: 'prod_jacket', name: '가죽 자켓', cost: 33.0, quality: 50 },
    { id: 'prod_socks', name: '양말', cost: 0.3, quality: 15 },
    { id: 'prod_smartphone', name: '스마트폰', cost: 57.5, quality: 40 },
    { id: 'prod_laptop', name: '노트북', cost: 215, quality: 60 },
    { id: 'prod_tv', name: '텔레비전', cost: 87.5, quality: 55 },
    { id: 'prod_drone', name: '드론', cost: 108, quality: 58 },
    { id: 'prod_car', name: '자동차', cost: 3200, quality: 50 },
    { id: 'prod_truck', name: '트럭', cost: 6400, quality: 52 },
    { id: 'prod_motorcycle', name: '오토바이', cost: 750, quality: 48 },
    { id: 'prod_painkiller', name: '진통제', cost: 9.0, quality: 45 },
    { id: 'prod_antibiotics', name: '항생제', cost: 26.5, quality: 55 },
    { id: 'prod_vitamins', name: '비타민', cost: 4.12, quality: 48 },
    { id: 'prod_vaccine', name: '백신', cost: 45, quality: 60 },
    { id: 'prod_airplane', name: '개인용 제트기', cost: 2050000, quality: 70 },
    { id: 'prod_satellite', name: '인공위성', cost: 1155000, quality: 80 },
    { id: 'prod_helicopter', name: '헬리콥터', cost: 177000, quality: 75 },
    { id: 'prod_videogame', name: '비디오 게임', cost: 1100, quality: 60 },
    { id: 'prod_os', name: '운영체제', cost: 5400, quality: 65 },
    { id: 'prod_bizsoftware', name: '비즈니스 소프트웨어', cost: 3300, quality: 62 },
    { id: 'prod_antivirus', name: '백신 소프트웨어', cost: 2200, quality: 68 },
    { id: 'prod_photo_editor', name: '사진 편집기', cost: 1660, quality: 64 },
].filter((v,i,a)=>a.findIndex(t=>(t.id === v.id))===i);


export const INITIAL_CAPITAL = 10000000;
export const BASE_STORE_CONSTRUCTION_COST = 150000;
export const BASE_DEALERSHIP_CONSTRUCTION_COST = 750000;
export const BASE_APPAREL_STORE_CONSTRUCTION_COST = 300000;
export const BASE_PHARMACY_CONSTRUCTION_COST = 400000;
export const BASE_AVIATION_SHOWROOM_COST = 10000000;
export const BASE_ELECTRONICS_STORE_COST = 500000;
export const BASE_FACTORY_CONSTRUCTION_COST = 1000000; // For basic factories like Food
export const BASE_TEXTILE_FACTORY_COST = 1600000;
export const BASE_ELECTRONICS_FACTORY_COST = 3000000;
export const BASE_AUTOMOBILE_FACTORY_COST = 10000000;
export const BASE_PHARMACEUTICAL_FACTORY_COST = 5000000;
export const BASE_AIRCRAFT_FACTORY_COST = 50000000;
export const BASE_SOFTWARE_STUDIO_COST = 4000000;
export const BASE_FARM_CONSTRUCTION_COST = 800000;
export const BASE_MARKETING_FIRM_CONSTRUCTION_COST = 1200000;
export const BASE_RESEARCH_CENTER_COST = 750000;
export const BASE_EXPANSION_COST = 300000;
export const BASE_R_AND_D_QUALITY_COST = 250000;
export const BASE_MARKETING_CAMPAIGN_DAILY_COST = 5000;
export const PURCHASE_AMOUNT = 100; // 재고 구매 단위
export const RAW_MATERIAL_PURCHASE_AMOUNT = 500; // 원자재 구매 단위
export const SHIPPING_COSTS = {
    DOMESTIC: 100, // 동일 국가 내 운송 비용 (PURCHASE_AMOUNT 단위당)
    REGIONAL: 500, // 동일 대륙 내 운송 비용 (PURCHASE_AMOUNT 단위당)
    INTERCONTINENTAL: 1500, // 대륙 간 운송 비용 (PURCHASE_AMOUNT 단위당)
};

// R&D Tech Tree
export const RESEARCHABLE_TECHS: { [techId: string]: { name: string; description: string; cost: number; unlocks: string[] } } = {
    'tech_food_processing': {
        name: '식품 가공 기술',
        description: '케이크, 피자, 아이스크림 등 고급 식품을 생산할 수 있습니다.',
        cost: 750000,
        unlocks: ['prod_cake', 'prod_frozen_pizza', 'prod_ice_cream', 'prod_premium_coffee'],
    },
    'tech_textiles': {
        name: '직물 기술',
        description: '직물, 티셔츠, 청바지, 자켓, 양말 등 다양한 의류를 생산하고 의류 매장을 운영할 수 있습니다.',
        cost: 1200000,
        unlocks: ['rm_fabric', 'prod_tshirt', 'prod_jeans', 'prod_jacket', 'prod_socks'],
    },
    'tech_electronics': {
        name: '소비자 가전',
        description: '스마트폰, 노트북, TV, 드론 등 첨단 전자제품을 생산하고 전자제품 매장을 운영합니다.',
        cost: 5000000,
        unlocks: ['prod_smartphone', 'prod_laptop', 'prod_tv', 'prod_drone'],
    },
    'tech_software': {
        name: '소프트웨어 개발',
        description: '게임, OS, 비즈니스 SW, 보안 SW 등 다양한 디지털 제품을 개발합니다.',
        cost: 6000000,
        unlocks: ['prod_videogame', 'prod_os', 'prod_bizsoftware', 'prod_antivirus', 'prod_photo_editor'],
    },
    'tech_automotive': {
        name: '자동차 공학',
        description: '자동차, 트럭, 오토바이 등 다양한 차량을 생산하고 관련 대리점을 운영합니다.',
        cost: 15000000,
        unlocks: ['prod_car', 'prod_truck', 'prod_motorcycle'],
    },
    'tech_pharmaceuticals': {
        name: '제약 기술',
        description: '진통제, 항생제, 비타민, 백신 등 다양한 의약품을 생산하고 약국을 운영합니다.',
        cost: 8000000,
        unlocks: ['prod_painkiller', 'prod_antibiotics', 'prod_vitamins', 'prod_vaccine'],
    },
    'tech_aerospace': {
        name: '항공우주 공학',
        description: '개인용 제트기, 헬리콥터, 인공위성 등 첨단 항공우주 제품을 생산합니다.',
        cost: 30000000,
        unlocks: ['prod_airplane', 'prod_helicopter', 'prod_satellite'],
    },
};

// Stock Market Constants
export const IPO_SHARES_TO_SELL_PERCENT = 0.3; // 30% of shares sold at IPO
export const TOTAL_SHARES_OUTSTANDING = 1000000; // Total shares for any company
export const STOCK_PRICE_VOLATILITY = 0.03; // Daily random volatility
export const STOCK_PERFORMANCE_FACTOR = 0.05; // How much daily performance affects stock price
export const INITIAL_IPO_READINESS_THRESHOLD = 5000000; // Revenue threshold for AI to consider IPO

// Initial Economic Model Values
export const INITIAL_INFLATION_RATE = 0.02; // 2%
export const INITIAL_INTEREST_RATE = 0.03; // 3%

// Loan Constants
export const BASE_LOAN_INTEREST_RATE_PREMIUM = 0.01; // 1% premium over global interest rate
export const LOAN_OFFERS = [
    { amount: 500000, termDays: 365 },
    { amount: 2000000, termDays: 730 },
    { amount: 10000000, termDays: 1095 },
];

// Tax Constants
export const CORPORATE_TAX_RATE = 0.20; // 20% 법인세율