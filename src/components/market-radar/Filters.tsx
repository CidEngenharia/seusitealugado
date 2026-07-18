import React from "react";
import { Filter, SlidersHorizontal, RotateCcw } from "lucide-react";

export interface FilterState {
  priceLevel: string[];
  maxDistance: number | null;
  minAge: number | null;
  minRating: number | null;
  minReviews: number | null;
}

interface FiltersProps {
  filters: FilterState;
  onChange: (filters: FilterState) => void;
  onClear: () => void;
}

export default function Filters({ filters, onChange, onClear }: FiltersProps) {
  const handlePriceToggle = (price: string) => {
    const active = filters.priceLevel.includes(price)
      ? filters.priceLevel.filter((p) => p !== price)
      : [...filters.priceLevel, price];
    onChange({ ...filters, priceLevel: active });
  };

  return (
    <div className="bg-white border border-slate-200 p-6 rounded-2xl shadow-sm space-y-5">
      <div className="flex items-center justify-between border-b border-slate-100 pb-3">
        <div className="flex items-center gap-2 text-slate-800 text-xs font-semibold uppercase tracking-wider">
          <Filter size={14} className="text-slate-500" />
          <span>Filtros do Radar</span>
        </div>
        <button
          onClick={onClear}
          className="flex items-center gap-1 text-[10px] font-medium text-slate-400 hover:text-indigo-600 transition-colors cursor-pointer"
        >
          <RotateCcw size={10} />
          Limpar
        </button>
      </div>

      <div className="space-y-4">
        {/* Faixa de Preço */}
        <div className="space-y-2">
          <span className="block text-[11px] font-medium text-slate-450 uppercase tracking-wider">
            Faixa de Preço
          </span>
          <div className="flex gap-2">
            {["$", "$$", "$$$", "$$$$"].map((price) => {
              const isActive = filters.priceLevel.includes(price);
              return (
                <button
                  key={price}
                  type="button"
                  onClick={() => handlePriceToggle(price)}
                  className={`flex-1 py-2 text-center text-xs border rounded-lg cursor-pointer transition-all ${
                    isActive
                      ? "bg-indigo-50 text-indigo-700 border-indigo-200 font-semibold"
                      : "bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100"
                  }`}
                >
                  {price}
                </button>
              );
            })}
          </div>
        </div>

        {/* Distância Máxima */}
        <div className="space-y-2">
          <span className="block text-[11px] font-medium text-slate-450 uppercase tracking-wider">
            Distância Máxima
          </span>
          <div className="grid grid-cols-3 gap-2">
            {[
              { val: 1, label: "1 km" },
              { val: 3, label: "3 km" },
              { val: 5, label: "5 km" },
              { val: 10, label: "10 km" },
              { val: 20, label: "20 km" },
              { val: null, label: "Todas" }
            ].map((dist) => {
              const isActive = filters.maxDistance === dist.val;
              return (
                <button
                  key={dist.label}
                  type="button"
                  onClick={() => onChange({ ...filters, maxDistance: dist.val })}
                  className={`py-1.5 px-1 text-center text-[10px] border rounded-lg cursor-pointer transition-all ${
                    isActive
                      ? "bg-indigo-50 text-indigo-700 border-indigo-200 font-semibold"
                      : "bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100"
                  }`}
                >
                  {dist.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Tempo de Mercado */}
        <div className="space-y-2">
          <span className="block text-[11px] font-medium text-slate-450 uppercase tracking-wider">
            Tempo no Mercado
          </span>
          <div className="grid grid-cols-2 gap-2">
            {[
              { val: null, label: "Qualquer idade" },
              { val: 1, label: "1+ ano" },
              { val: 3, label: "3+ anos" },
              { val: 5, label: "5+ anos" },
              { val: 10, label: "10+ anos" },
              { val: 20, label: "20+ anos" }
            ].map((age) => {
              const isActive = filters.minAge === age.val;
              return (
                <button
                  key={age.label}
                  type="button"
                  onClick={() => onChange({ ...filters, minAge: age.val })}
                  className={`py-2 px-1 text-center text-[10px] border rounded-lg cursor-pointer transition-all ${
                    isActive
                      ? "bg-indigo-50 text-indigo-700 border-indigo-200 font-semibold"
                      : "bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100"
                  }`}
                >
                  {age.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Avaliação Mínima Google */}
        <div className="space-y-2">
          <span className="block text-[11px] font-medium text-slate-450 uppercase tracking-wider">
            Avaliação no Google
          </span>
          <div className="flex gap-2">
            {[
              { val: null, label: "Todas" },
              { val: 4.0, label: "4.0+" },
              { val: 4.5, label: "4.5+" },
              { val: 5.0, label: "5 ★" }
            ].map((r) => {
              const isActive = filters.minRating === r.val;
              return (
                <button
                  key={r.label}
                  type="button"
                  onClick={() => onChange({ ...filters, minRating: r.val })}
                  className={`flex-1 py-1.5 text-center text-[10px] border rounded-lg cursor-pointer transition-all ${
                    isActive
                      ? "bg-indigo-50 text-indigo-700 border-indigo-200 font-semibold"
                      : "bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100"
                  }`}
                >
                  {r.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Quantidade Mínima de Avaliações */}
        <div className="space-y-2">
          <span className="block text-[11px] font-medium text-slate-450 uppercase tracking-wider">
            Mínimo de Avaliações
          </span>
          <div className="grid grid-cols-2 gap-2">
            {[
              { val: null, label: "Qualquer quant." },
              { val: 50, label: "50+ avaliações" },
              { val: 100, label: "100+ avaliações" },
              { val: 500, label: "500+ avaliações" }
            ].map((rev) => {
              const isActive = filters.minReviews === rev.val;
              return (
                <button
                  key={rev.label}
                  type="button"
                  onClick={() => onChange({ ...filters, minReviews: rev.val })}
                  className={`py-2 px-1 text-center text-[10px] border rounded-lg cursor-pointer transition-all ${
                    isActive
                      ? "bg-indigo-50 text-indigo-700 border-indigo-200 font-semibold"
                      : "bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100"
                  }`}
                >
                  {rev.label}
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
