
import React, { useState } from 'react';
import type { Country } from '../types';
import { GlobeIcon } from './Icons';

interface CompanyNameInputModalProps {
  country: Country;
  onConfirm: (name: string) => void;
  onCancel: () => void;
}

const CompanyNameInputModal: React.FC<CompanyNameInputModalProps> = ({ country, onConfirm, onCancel }) => {
  const [companyName, setCompanyName] = useState(`글로벌 기업 ${country.cca3}`);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (companyName.trim()) {
      onConfirm(companyName.trim());
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center animate-fade-in">
      <div className="bg-slate-800 rounded-xl p-8 border border-slate-700 shadow-lg w-full max-w-md m-4">
        <div className="text-center">
            <GlobeIcon className="mx-auto h-12 w-12 text-sky-400" />
            <h2 className="mt-4 text-2xl font-bold text-slate-100">회사 설립</h2>
            <p className="mt-2 text-sm text-slate-400">
                {country.name.common}에 본사를 둔 회사의 이름을 정해주세요.
            </p>
        </div>
        <form onSubmit={handleSubmit} className="mt-6">
          <div>
            <label htmlFor="company-name" className="block text-sm font-medium text-slate-300">
              회사명
            </label>
            <div className="mt-1">
              <input
                type="text"
                id="company-name"
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
                className="w-full bg-slate-700 border border-slate-600 rounded-md py-2 px-3 text-slate-100 focus:ring-2 focus:ring-sky-500 focus:border-sky-500"
                required
                autoFocus
              />
            </div>
          </div>
          <div className="mt-6 flex justify-end space-x-3">
            <button
              type="button"
              onClick={onCancel}
              className="px-4 py-2 rounded-md text-sm font-semibold bg-slate-600 text-slate-200 hover:bg-slate-500 transition-colors"
            >
              취소
            </button>
            <button
              type="submit"
              className="px-4 py-2 rounded-md text-sm font-semibold bg-emerald-600 text-white hover:bg-emerald-500 transition-colors"
            >
              설립 확정
            </button>
          </div>
        </form>
      </div>
      <style>{`
          @keyframes fade-in {
            from { opacity: 0; }
            to { opacity: 1; }
          }
          .animate-fade-in { animation: fade-in 0.3s ease-out forwards; }
        `}</style>
    </div>
  );
};

export default CompanyNameInputModal;
