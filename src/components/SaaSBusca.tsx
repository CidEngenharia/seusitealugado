/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { Search, Star, MapPin, Clock, ArrowLeft } from "lucide-react";
import { Tenant } from "../types";
import LogoSeusiteAlugado from "./LogoSeusiteAlugado";

interface SaaSBuscaProps {
  tenants: Tenant[];
  onSelectTenant: (slug: string) => void;
  onGoBack: () => void;
}

export default function SaaSBusca({ tenants, onSelectTenant, onGoBack }: SaaSBuscaProps) {
  const [query, setQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("todos");

  // Filtering tenants
  const filtered = tenants.filter((tenant) => {
    // Basic category heuristics based on tags/opening/descriptions
    const categoryLower = tenant.description.toLowerCase() + tenant.name.toLowerCase();
    
    let matchesCategory = true;
    if (selectedCategory === "beauty") {
      matchesCategory = categoryLower.includes("salão") || categoryLower.includes("beleza") || categoryLower.includes("manicure") || categoryLower.includes("hair");
    } else if (selectedCategory === "barber") {
      matchesCategory = categoryLower.includes("barber") || categoryLower.includes("barba") || categoryLower.includes("navala");
    } else if (selectedCategory === "mechanic") {
      matchesCategory = categoryLower.includes("oficina") || categoryLower.includes("mecân") || categoryLower.includes("suspens");
    } else if (selectedCategory === "pets") {
      matchesCategory = categoryLower.includes("pet") || categoryLower.includes("cão") || categoryLower.includes("gato") || categoryLower.includes("banho") || categoryLower.includes("tosa");
    }

    const matchesQuery = 
      tenant.name.toLowerCase().includes(query.toLowerCase()) || 
      tenant.slug.toLowerCase().includes(query.toLowerCase()) ||
      tenant.description.toLowerCase().includes(query.toLowerCase());

    return matchesCategory && matchesQuery;
  });

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans p-6 selection:bg-indigo-600 selection:text-white">
      
      {/* Top action */}
      <div className="max-w-6xl mx-auto flex items-center justify-between mb-8 border-b border-slate-200 pb-4">
        <button 
          onClick={onGoBack}
          className="text-xs bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 px-4 py-2.5 rounded-full flex items-center gap-1.5 transition-colors cursor-pointer font-bold shadow-sm"
        >
          ← Voltar para a Landing Page
        </button>
        <div className="scale-90 origin-right">
          <LogoSeusiteAlugado size="sm" theme="light" showSubtitle={false} />
        </div>
      </div>

      <div className="max-w-6xl mx-auto space-y-8">
        <div className="space-y-1">
          <h1 className="text-2xl font-extrabold tracking-tight text-slate-800">Encontre Negócios Locais Rápido</h1>
          <p className="text-xs text-slate-500">Busque através de todos os mini-sites customizados alugados na nossa plataforma unificada.</p>
        </div>

        {/* Query Controls bar */}
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 bg-white border border-slate-200 rounded-xl p-2.5 flex items-center shadow-sm focus-within:ring-2 focus-within:ring-indigo-500 transition-all">
            <Search className="text-slate-400 mx-2" size={16} />
            <input 
              type="text" 
              placeholder="Digite o nome, slug do site ou ramo (Ex: degradê, tosa, óleo)..." 
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="w-full bg-transparent border-none text-xs text-slate-800 focus:outline-none placeholder:text-slate-400"
            />
          </div>

          <div className="flex gap-2 overflow-x-auto pb-1 text-xs items-center">
            {[
              { id: 'todos', name: '📂 Todos os Ramos' },
              { id: 'barber', name: '✂️ Barbearias' },
              { id: 'beauty', name: '🌸 Salões de Beleza' },
              { id: 'mechanic', name: '🔧 Oficinas' },
              { id: 'pets', name: '🐾 Pet Shops' }
            ].map((cat) => (
              <button 
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-3.5 py-2.5 rounded-full font-bold cursor-pointer transition-colors whitespace-nowrap text-xs shadow-sm ${selectedCategory === cat.id ? 'bg-indigo-600 text-white' : 'bg-white border border-slate-200 hover:bg-slate-50 text-slate-650'}`}
              >
                {cat.name}
              </button>
            ))}
          </div>
        </div>

        {/* Results layout Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.length === 0 ? (
            <div className="col-span-full text-center py-16 text-slate-400 font-medium bg-white rounded-2xl border border-slate-200">
              Nenhum espaço alugado corresponde à sua busca atual.
            </div>
          ) : (
            filtered.map((ten) => (
              <div 
                key={ten.id}
                onClick={() => onSelectTenant(ten.slug)}
                className="bg-white border-[0.5px] border-slate-200 rounded-lg p-5 space-y-4 hover:border-indigo-400 hover:shadow-md cursor-pointer transition-all flex flex-col justify-between shadow-sm"
              >
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <img src={ten.logoUrl} className="w-12 h-12 object-cover rounded-xl shadow-inner border border-slate-100" alt="" />
                    <div>
                      <h3 className="font-bold text-sm text-slate-800 line-clamp-1">{ten.name}</h3>
                      <span className="text-[10px] text-slate-400 font-mono block">sitealugado.com/{ten.slug}</span>
                    </div>
                  </div>

                  <p className="text-xs text-slate-500 leading-relaxed line-clamp-3">
                    {ten.description}
                  </p>
                </div>

                <div className="pt-4 border-t border-slate-100 space-y-2.5 text-[11px] text-slate-450 font-medium">
                  <div className="flex items-center gap-2">
                    <MapPin size={12} className="text-slate-400 shrink-0" />
                    <span className="text-slate-600 line-clamp-1">{ten.address}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1 text-amber-500 font-bold">
                      <Star fill="currentColor" size={11} />
                      <span className="text-slate-700 font-bold">5.0</span>
                      <span className="text-slate-405 text-[10px] font-normal">({ten.reviews?.filter(r=>r.approved).length || 0})</span>
                    </div>
                    <span className="font-bold px-2 py-0.5 bg-indigo-50 text-indigo-700 rounded-full text-[9px] uppercase tracking-wide border border-indigo-100">Plano {ten.plan}</span>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

      </div>
    </div>
  );
}
