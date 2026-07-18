import React, { useState } from "react";
import { Search, MapPin, Building2 } from "lucide-react";

interface SearchBarProps {
  onSearch: (niche: string, city: string, radius: number, neighborhood?: string) => void;
  isLoading: boolean;
}

export default function SearchBar({ onSearch, isLoading }: SearchBarProps) {
  const [niche, setNiche] = useState("Oficina");
  const [city, setCity] = useState("Salvador");
  const [neighborhood, setNeighborhood] = useState("");
  const [radius, setRadius] = useState(5000);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch(niche, city, radius, neighborhood.trim() || undefined);
  };

  const niches = [
    { value: "Barbearia", label: "✂️ Barbearia" },
    { value: "Salão", label: "💅 Salão de Beleza" },
    { value: "Lava-jato", label: "🚗 Lava-jato" },
    { value: "Estética", label: "✨ Estética & Spa" },
    { value: "Manicure", label: "💅 Manicure / Pedicure" },
    { value: "Maquiadora", label: "💄 Maquiadora" },
    { value: "Personal Trainer", label: "🏋️ Personal Trainer" },
    { value: "Doceria", label: "🎂 Doceria / Confeitaria" },
    { value: "Açaíteria", label: "🍇 Açaíteria" },
    { value: "Loja", label: "🛍️ Loja / Comércio" },
    { value: "Buffet", label: "🎉 Buffet / Eventos" },
    { value: "Chaveiro", label: "🔑 Chaveiro" },
    { value: "Eletricista", label: "⚡ Eletricista" },
    { value: "Som Automotivo", label: "🔊 Som Automotivo" },
    { value: "Dedetização", label: "🪲 Dedetização" },
    { value: "Oficina", label: "🔧 Oficina Mecânica" },
    { value: "Dentista", label: "🦷 Dentista / Odonto" },
    { value: "Clínica", label: "🏥 Clínica Médica" },
    { value: "Mercado", label: "🛒 Supermercado / Mercado" },
    { value: "Restaurante", label: "🍽️ Restaurante / Cafeteria" },
  ];

  const radiuses = [
    { value: 2000, label: "2 km" },
    { value: 5000, label: "5 km" },
    { value: 10000, label: "10 km" },
    { value: 20000, label: "20 km" }
  ];

  return (
    <form onSubmit={handleSubmit} className="bg-white border border-slate-200 p-5 rounded-2xl shadow-sm space-y-4">
      <div className="text-[10px] font-mono tracking-wider text-slate-400 uppercase">
        Buscar Concorrentes na Minha Região
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
        {/* Nicho */}
        <div className="space-y-1">
          <label htmlFor="radar-niche" className="block text-[11px] font-medium text-slate-500">
            Meu Segmento
          </label>
          <select
            id="radar-niche"
            value={niche}
            onChange={(e) => setNiche(e.target.value)}
            className="w-full bg-slate-50 border border-slate-200 text-slate-700 text-xs rounded-xl p-2.5 focus:outline-none focus:ring-1 focus:ring-violet-500 transition-all"
          >
            {niches.map((n) => (
              <option key={n.value} value={n.value}>{n.label}</option>
            ))}
          </select>
        </div>

        {/* Cidade */}
        <div className="space-y-1">
          <label htmlFor="radar-city" className="block text-[11px] font-medium text-slate-500">
            Cidade
          </label>
          <div className="relative">
            <MapPin size={13} className="absolute left-2.5 top-3 text-slate-400" />
            <input
              type="text"
              id="radar-city"
              value={city}
              onChange={(e) => setCity(e.target.value)}
              placeholder="Ex: Salvador"
              className="w-full bg-slate-50 border border-slate-200 text-slate-700 text-xs rounded-xl pl-8 pr-3 py-2.5 focus:outline-none focus:ring-1 focus:ring-violet-500 transition-all"
            />
          </div>
        </div>

        {/* Bairro (novo) */}
        <div className="space-y-1">
          <label htmlFor="radar-neighborhood" className="block text-[11px] font-medium text-slate-500">
            Bairro <span className="text-slate-350">(opcional)</span>
          </label>
          <div className="relative">
            <Building2 size={13} className="absolute left-2.5 top-3 text-slate-400" />
            <input
              type="text"
              id="radar-neighborhood"
              value={neighborhood}
              onChange={(e) => setNeighborhood(e.target.value)}
              placeholder="Ex: Pituba, Barra"
              className="w-full bg-slate-50 border border-slate-200 text-slate-700 text-xs rounded-xl pl-8 pr-3 py-2.5 focus:outline-none focus:ring-1 focus:ring-violet-500 transition-all"
            />
          </div>
        </div>

        {/* Raio */}
        <div className="space-y-1">
          <span className="block text-[11px] font-medium text-slate-500">Raio de Busca</span>
          <div className="grid grid-cols-4 gap-1">
            {radiuses.map((r) => (
              <label
                key={r.value}
                className={`text-center py-2 text-[10px] font-medium border rounded-lg cursor-pointer transition-all ${
                  radius === r.value
                    ? "bg-violet-600 text-white border-violet-600"
                    : "bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100"
                }`}
              >
                <input
                  type="radio"
                  name="radius"
                  value={r.value}
                  checked={radius === r.value}
                  onChange={() => setRadius(r.value)}
                  className="sr-only"
                />
                {r.label}
              </label>
            ))}
          </div>
        </div>
      </div>

      <button
        type="submit"
        disabled={isLoading}
        className="w-full py-3 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 disabled:from-slate-400 disabled:to-slate-400 text-white rounded-xl text-xs font-semibold cursor-pointer transition-all flex items-center justify-center gap-2 shadow-md"
      >
        <Search size={13} />
        {isLoading ? "Buscando concorrentes na região..." : "Buscar Concorrentes"}
      </button>
    </form>
  );
}
