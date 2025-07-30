





import React from 'react';
import type { Company, Store, Product } from '../types';
import { ArrowLeftIcon, PlusIcon, PackageIcon, BuildingOfficeIcon } from './Icons';
import { PURCHASE_AMOUNT, BASE_INITIAL_PRODUCTS } from '../constants';
import { useToasts } from './ToastContext';

interface StoreDetailPanelProps {
    store: Store;
    company: Company;
    setCompany: React.Dispatch<React.SetStateAction<Company | null>>;
    onBack: () => void;
    initialProducts: Omit<Product, 'stock' | 'price'>[];
    manufacturableProducts: { [productId: string]: { name: string; recipe: { id: string; amount: number }[]; manufacturingCost: number; productionRate: number; } };
}

const ToggleSwitch: React.FC<{ enabled: boolean; onChange: (e: React.ChangeEvent<HTMLInputElement>) => void; label: string, description: string, disabled?: boolean }> = ({ enabled, onChange, label, description, disabled = false }) => (
  <label className={`flex items-center justify-between p-3 bg-slate-700/50 rounded-lg transition-colors ${disabled ? 'opacity-60 cursor-not-allowed' : 'hover:bg-slate-700 cursor-pointer'}`}>
    <div>
        <span className="text-slate-100 font-semibold">{label}</span>
        <p className="text-xs text-slate-400">{description}</p>
    </div>
    <div className="relative">
      <input type="checkbox" className="sr-only" checked={enabled} onChange={onChange} disabled={disabled} />
      <div className={`block w-14 h-8 rounded-full transition-all ${enabled ? 'bg-emerald-500' : 'bg-slate-600'}`}></div>
      <div className={`dot absolute left-1 top-1 bg-white w-6 h-6 rounded-full transition-transform ${enabled ? 'transform translate-x-6' : ''}`}></div>
    </div>
  </label>
);

const StoreDetailPanel: React.FC<StoreDetailPanelProps> = ({ store, company, setCompany, onBack, initialProducts, manufacturableProducts }) => {
    const { addToast } = useToasts();
    
    const canAnyProductBeSourced = store.inventory.some(p => BASE_INITIAL_PRODUCTS.some(ip => ip.id === p.id));

    const handlePriceChange = (productId: string, newPrice: number) => {
        setCompany(prevCompany => {
            if (!prevCompany) return null;
            return {
                ...prevCompany,
                stores: prevCompany.stores.map(s => 
                    s.id === store.id 
                    ? { ...s, inventory: s.inventory.map(p => p.id === productId ? { ...p, price: newPrice } : p) }
                    : s
                )
            };
        });
    };

    const handlePurchaseStock = (product: Product) => {
        const sourcingInfo = initialProducts.find(p => p.id === product.id);
        if (!sourcingInfo) return;
        
        const sourcingCost = sourcingInfo.cost;
        const purchaseAmount = PURCHASE_AMOUNT;
        const totalCost = sourcingCost * purchaseAmount;

        if (company.cash < totalCost) {
            addToast("자금이 부족합니다.", 'error');
            return;
        }

        setCompany(prevCompany => {
            if (!prevCompany) return null;
            const companyProductQuality = prevCompany.productQuality[product.id];
            
            return {
                ...prevCompany,
                cash: prevCompany.cash - totalCost,
                stores: prevCompany.stores.map(s => 
                    s.id === store.id 
                    ? { ...s, inventory: s.inventory.map(p => {
                        if (p.id !== product.id) return p;

                        const currentStock = p.stock;
                        const currentAvgCost = p.cost;
                        const newStock = currentStock + purchaseAmount;
                        const newTotalValue = (currentStock * currentAvgCost) + (purchaseAmount * sourcingCost);
                        const newAverageCost = newStock > 0 ? newTotalValue / newStock : sourcingCost;

                        return { ...p, stock: newStock, cost: newAverageCost, quality: companyProductQuality };
                      }) 
                    }
                    : s
                )
            };
        });
    };
    
    const handleInternalSupply = (product: Product) => {
        const productInfo = manufacturableProducts[product.id];
        if (!productInfo) return;

        const supplyAmount = PURCHASE_AMOUNT;
        const centralStock = company.centralInventory[product.id] || 0;

        if (centralStock < supplyAmount) {
            addToast("중앙 창고의 재고가 부족합니다.", 'error');
            return;
        }

        const manufacturingCost = productInfo.manufacturingCost;

        setCompany(prevCompany => {
            if (!prevCompany) return null;

            const newCentralInventory = { ...prevCompany.centralInventory };
            newCentralInventory[product.id] -= supplyAmount;
            
            return {
                ...prevCompany,
                centralInventory: newCentralInventory,
                stores: prevCompany.stores.map(s => 
                    s.id === store.id 
                    ? { 
                        ...s, 
                        inventory: s.inventory.map(p => {
                            if (p.id !== product.id) return p;

                            const currentStock = p.stock;
                            const currentAvgCost = p.cost;
                            const newStock = currentStock + supplyAmount;
                            const newTotalValue = (currentStock * currentAvgCost) + (supplyAmount * manufacturingCost);
                            const newAverageCost = newStock > 0 ? newTotalValue / newStock : manufacturingCost;

                            return { ...p, stock: newStock, cost: newAverageCost };
                        }) 
                      }
                    : s
                )
            };
        });
    };

    const handleManagerChange = (setting: 'autoPrice' | 'autoStock', value: boolean) => {
        setCompany(prevCompany => {
            if (!prevCompany) return null;
            return {
                ...prevCompany,
                stores: prevCompany.stores.map(s => 
                    s.id === store.id 
                    ? { ...s, manager: { ...(s.manager || { autoPrice: false, autoStock: false }), [setting]: value } }
                    : s
                )
            };
        });
    };
    
    return (
        <div className="w-full h-full p-4 md:p-6 text-white animate-fade-in-slow flex flex-col">
            <div className="flex items-center mb-6">
                <button onClick={onBack} className="p-2 rounded-full hover:bg-slate-700 transition-colors mr-4">
                    <ArrowLeftIcon className="w-6 h-6 text-sky-400" />
                </button>
                <div>
                    <h2 className="text-2xl md:text-3xl font-black text-emerald-400">{store.cityName} {store.type}</h2>
                    <p className="text-slate-300">재고 및 가격 관리</p>
                </div>
            </div>

            <div className="flex-grow overflow-y-auto pr-2 space-y-6">
                <div className="bg-slate-800 p-4 rounded-lg border border-slate-700">
                    <h3 className="text-xl font-bold mb-4 text-sky-400">매장 자동화</h3>
                    <div className="space-y-3">
                       <ToggleSwitch 
                            label="자동 가격 설정"
                            description="AI가 평균 원가의 2배로 가격을 자동 설정합니다."
                            enabled={store.manager?.autoPrice || false}
                            onChange={(e) => handleManagerChange('autoPrice', e.target.checked)}
                        />
                        <ToggleSwitch 
                            label="자동 재고 보충 (외부 조달)"
                            description={canAnyProductBeSourced ? "재고가 10개 미만일 때 자동으로 외부 조달합니다." : "이 매장에서는 외부 조달 가능한 상품이 없습니다."}
                            enabled={store.manager?.autoStock || false}
                            onChange={(e) => handleManagerChange('autoStock', e.target.checked)}
                            disabled={!canAnyProductBeSourced}
                        />
                    </div>
                </div>

                <div className="bg-slate-800 p-4 rounded-lg border border-slate-700">
                    <h3 className="text-xl font-bold mb-4 text-amber-400">상품 목록</h3>
                    <div className="space-y-2">
                        <div className="grid grid-cols-6 gap-4 px-4 py-2 text-sm font-bold text-slate-400 border-b border-slate-600">
                            <div className="col-span-2">상품</div>
                            <div className="text-center">재고</div>
                            <div className="text-right">평균원가</div>
                            <div className="text-right">판매가</div>
                            <div className="text-center">재고 관리</div>
                        </div>

                        <ul className="space-y-3">
                            {store.inventory.map(product => {
                                const isManufacturable = Object.keys(manufacturableProducts).includes(product.id);
                                const canBeSourced = !!initialProducts.find(p => p.id === product.id);
                                const centralStock = company.centralInventory[product.id] || 0;
                                
                                return (
                                    <li key={product.id} className="grid grid-cols-6 gap-4 items-center bg-slate-700/50 p-4 rounded-lg">
                                        <div className="col-span-2 font-semibold flex items-center">
                                            <PackageIcon className="w-6 h-6 mr-3 text-amber-400"/>
                                            <div>
                                                <p>{product.name}</p>
                                                <div className="text-xs text-teal-400 font-mono">품질: {product.quality.toFixed(1)}</div>
                                            </div>
                                        </div>
                                        <div className="text-center font-mono text-lg">{product.stock.toLocaleString()}</div>
                                        <div className="text-right font-mono text-slate-400">${product.cost.toFixed(2)}</div>
                                        <div className="text-right">
                                            <div className="relative">
                                                <span className="absolute left-2 top-1/2 -translate-y-1/2 text-slate-400">$</span>
                                                <input 
                                                    type="number" 
                                                    value={product.price.toFixed(2)}
                                                    onChange={(e) => handlePriceChange(product.id, parseFloat(e.target.value) || 0)}
                                                    className="bg-slate-800 border border-slate-600 rounded-md w-24 py-1 pl-5 pr-2 text-right font-mono focus:ring-2 focus:ring-sky-500 focus:border-sky-500 disabled:bg-slate-900/50 disabled:cursor-not-allowed disabled:text-slate-400"
                                                    step="0.01"
                                                    min="0"
                                                    disabled={store.manager?.autoPrice}
                                                />
                                            </div>
                                        </div>
                                        <div className="text-center space-y-2">
                                            <button 
                                                onClick={() => handlePurchaseStock(product)}
                                                className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-1 px-2 rounded-md transition-transform duration-150 hover:scale-105 flex items-center justify-center text-xs disabled:bg-slate-600 disabled:cursor-not-allowed"
                                                disabled={store.manager?.autoStock || !canBeSourced}
                                                title={!canBeSourced ? "이 제품은 외부에서 조달할 수 없습니다." : ""}
                                            >
                                                <PlusIcon className="w-3 h-3 mr-1"/>
                                                외부 조달 ({PURCHASE_AMOUNT})
                                            </button>
                                            {isManufacturable && (
                                                 <button 
                                                    onClick={() => handleInternalSupply(product)}
                                                    className="w-full bg-cyan-600 hover:bg-cyan-500 text-white font-bold py-1 px-2 rounded-md transition-transform duration-150 hover:scale-105 flex items-center justify-center text-xs disabled:bg-slate-600 disabled:cursor-not-allowed"
                                                    disabled={centralStock < PURCHASE_AMOUNT}
                                                >
                                                    <BuildingOfficeIcon className="w-3 h-3 mr-1"/>
                                                    내부 공급 ({Math.min(centralStock, PURCHASE_AMOUNT)})
                                                </button>
                                            )}
                                        </div>
                                    </li>
                                );
                            })}
                        </ul>
                    </div>
                </div>
            </div>
             <style>{`
              @keyframes fade-in-slow {
                from { opacity: 0; }
                to { opacity: 1; }
              }
              .animate-fade-in-slow { animation: fade-in-slow 0.5s ease-out forwards; }
              /* Hide number input spinners */
              input[type=number]::-webkit-inner-spin-button, 
              input[type=number]::-webkit-outer-spin-button { 
                -webkit-appearance: none; 
                margin: 0; 
              }
              input[type=number] {
                -moz-appearance: textfield;
              }
              .dot {
                transition: transform 0.2s ease-in-out;
              }
            `}</style>
        </div>
    );
};

export default StoreDetailPanel;