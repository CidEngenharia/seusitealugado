/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo } from "react";
import {
  Search,
  Globe,
  ExternalLink,
  Star,
  ArrowLeft,
  ChevronLeft,
  ChevronRight,
  MapPin,
  Clock,
  Sparkles,
  Filter,
  X,
} from "lucide-react";
import { Tenant } from "../types";
import LogoSeusiteAlugado from "./LogoSeusiteAlugado";

interface PortfolioPageProps {
  tenants: Tenant[];
  onSelectTenant: (slug: string) => void;
  onGoBack: () => void;
}

const ITEMS_PER_PAGE = 4;

const CATEGORY_TAGS: Record<string, string> = {
  barbearia: "Barbearia",
  salao: "Salão de Beleza",
  spa: "Spa",
  oficina: "Oficina",
  fitness: "Fitness",
  loja: "Loja",
  restaurante: "Restaurante",
  outros: "Outros",
};

const PLAN_LABELS: Record<string, { label: string; color: string }> = {
  premium: { label: "PREMIUM", color: "bg-amber-400 text-zinc-950" },
  professional: { label: "PROFISSIONAL", color: "bg-indigo-500 text-white" },
  basic: { label: "BÁSICO", color: "bg-zinc-700 text-zinc-300" },
};

const THEME_COLORS: Record<string, { bg: string; border: string; text: string; glow: string }> = {
  amber: {
    bg: "from-amber-500/20 to-zinc-900",
    border: "border-amber-500/30",
    text: "text-amber-400",
    glow: "shadow-amber-500/10",
  },
  rose: {
    bg: "from-rose-500/20 to-zinc-900",
    border: "border-rose-500/30",
    text: "text-rose-400",
    glow: "shadow-rose-500/10",
  },
  blue: {
    bg: "from-blue-600/20 to-zinc-900",
    border: "border-blue-500/30",
    text: "text-blue-400",
    glow: "shadow-blue-500/10",
  },
  emerald: {
    bg: "from-emerald-500/20 to-zinc-900",
    border: "border-emerald-500/30",
    text: "text-emerald-400",
    glow: "shadow-emerald-500/10",
  },
  zinc: {
    bg: "from-zinc-600/20 to-zinc-900",
    border: "border-zinc-600/30",
    text: "text-zinc-300",
    glow: "shadow-zinc-500/10",
  },
};

const SitePreviewCard: React.FC<{
  tenant: Tenant;
  onSelectTenant: (slug: string) => void;
}> = ({
  tenant,
  onSelectTenant,
}) => {
  const theme = THEME_COLORS[tenant.themeColor] || THEME_COLORS["zinc"];
  const planInfo = PLAN_LABELS[tenant.plan] || PLAN_LABELS["basic"];
  const avgRating =
    tenant.reviews && tenant.reviews.length > 0
      ? (
          tenant.reviews.reduce((s, r) => s + r.rating, 0) /
          tenant.reviews.length
        ).toFixed(1)
      : null;

  return (
    <div
      className={`relative group bg-zinc-900/80 border ${theme.border} rounded-2xl overflow-hidden shadow-xl ${theme.glow} hover:shadow-2xl transition-all duration-300 hover:-translate-y-1 flex flex-col`}
    >
      {/* Preview Banner */}
      <div
        className={`relative h-52 bg-gradient-to-br ${theme.bg} flex items-center justify-center overflow-hidden cursor-pointer`}
        onClick={() => onSelectTenant(tenant.slug)}
      >
        {/* Simulated browser bar */}
        <div className="absolute top-0 left-0 right-0 h-8 bg-zinc-950/70 backdrop-blur-sm flex items-center px-3 gap-1.5 z-10">
          <span className="w-2 h-2 rounded-full bg-red-500/70"></span>
          <span className="w-2 h-2 rounded-full bg-yellow-500/70"></span>
          <span className="w-2 h-2 rounded-full bg-emerald-500/70"></span>
          <span className="ml-2 flex-1 bg-zinc-800/60 rounded text-[9px] text-zinc-500 px-2 py-0.5 font-mono truncate">
            seusitealugado.com/{tenant.slug}
          </span>
          <span className={`text-[9px] font-mono font-bold ${theme.text}`}>
            /{tenant.slug}
          </span>
        </div>

        {/* Logo/Avatar area */}
        <div className="flex flex-col items-center gap-3 mt-4">
          {tenant.logoUrl ? (
            <img
              src={tenant.logoUrl}
              alt={tenant.name}
              className="w-14 h-14 rounded-full object-cover border-2 border-white/10 shadow-xl"
              referrerPolicy="no-referrer"
            />
          ) : (
            <div
              className={`w-14 h-14 rounded-full bg-gradient-to-br ${theme.bg} border ${theme.border} flex items-center justify-center text-2xl`}
            >
              🏪
            </div>
          )}
          <div className="text-center px-4">
            <h3 className="text-white font-black text-base leading-tight">
              {tenant.name}
            </h3>
            {avgRating && (
              <div className="flex items-center justify-center gap-1 mt-1">
                <Star size={10} className="fill-amber-400 text-amber-400" />
                <span className="text-amber-400 text-[10px] font-bold">
                  {avgRating}
                </span>
                <span className="text-zinc-500 text-[10px]">
                  • {tenant.reviews.length} avaliação(ões)
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Services mini-list overlay */}
        <div className="absolute bottom-0 left-0 right-0 bg-zinc-950/80 backdrop-blur-sm px-3 py-2">
          <div className="flex gap-1.5 overflow-hidden">
            {tenant.services.slice(0, 3).map((svc) => (
              <span
                key={svc.id}
                className="text-[9px] bg-zinc-800/80 text-zinc-400 px-1.5 py-0.5 rounded font-mono truncate max-w-[90px]"
              >
                {svc.name}
              </span>
            ))}
            {tenant.services.length > 3 && (
              <span className="text-[9px] text-zinc-500">
                +{tenant.services.length - 3}
              </span>
            )}
          </div>
        </div>

        {/* Plan badge */}
        <div className="absolute top-10 right-2">
          <span
            className={`text-[9px] font-black px-2 py-0.5 rounded-full ${planInfo.color}`}
          >
            {planInfo.label}
          </span>
        </div>

        {/* Hover overlay */}
        <div className="absolute inset-0 bg-indigo-600/0 group-hover:bg-indigo-600/10 transition-all duration-300 flex items-center justify-center opacity-0 group-hover:opacity-100">
          <span className="bg-white/10 backdrop-blur-md border border-white/20 text-white text-xs font-bold px-3 py-1.5 rounded-full flex items-center gap-1.5">
            <ExternalLink size={11} />
            Ver site
          </span>
        </div>
      </div>

      {/* Card body */}
      <div className="p-4 flex flex-col flex-1 gap-3">
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1">
            <h3 className="text-white font-black text-sm leading-tight">
              {tenant.name}
            </h3>
            <p className="text-zinc-500 text-[11px] mt-0.5 line-clamp-2 leading-relaxed">
              {tenant.description ||
                "Site profissional com agendamento, CRM e controle integrado."}
            </p>
          </div>
        </div>

        {/* Info row */}
        <div className="space-y-1.5 text-[10px] text-zinc-500">
          {tenant.address && (
            <div className="flex items-center gap-1.5">
              <MapPin size={10} className="shrink-0 text-zinc-600" />
              <span className="truncate">{tenant.address}</span>
            </div>
          )}
          {tenant.openingHours && (
            <div className="flex items-center gap-1.5">
              <Clock size={10} className="shrink-0 text-zinc-600" />
              <span className="truncate">{tenant.openingHours}</span>
            </div>
          )}
        </div>

        {/* Services count */}
        <div className="flex items-center gap-2 flex-wrap">
          <span
            className={`text-[9px] font-bold ${theme.text} bg-zinc-800 px-2 py-0.5 rounded-full`}
          >
            {tenant.services.length} serviço(s)
          </span>
          {tenant.plan === "premium" && (
            <span className="text-[9px] font-bold text-indigo-400 bg-indigo-950/50 border border-indigo-800/50 px-2 py-0.5 rounded-full flex items-center gap-0.5">
              <Sparkles size={8} />
              IA Ativa
            </span>
          )}
        </div>

        {/* CTA */}
        <button
          onClick={() => onSelectTenant(tenant.slug)}
          className={`mt-auto w-full py-2.5 rounded-xl text-xs font-black text-zinc-950 transition-all duration-200 hover:scale-[1.02] active:scale-95 cursor-pointer ${
            tenant.themeColor === "amber"
              ? "bg-amber-400 hover:bg-amber-300"
              : tenant.themeColor === "rose"
              ? "bg-rose-400 hover:bg-rose-300"
              : tenant.themeColor === "blue"
              ? "bg-blue-400 hover:bg-blue-300"
              : tenant.themeColor === "emerald"
              ? "bg-emerald-400 hover:bg-emerald-300"
              : "bg-zinc-400 hover:bg-zinc-300"
          }`}
        >
          <Globe size={12} className="inline mr-1.5" />
          Visitar Site
        </button>
      </div>
    </div>
  );
};

export default function PortfolioPage({
  tenants,
  onSelectTenant,
  onGoBack,
}: PortfolioPageProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [selectedPlan, setSelectedPlan] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [showFilters, setShowFilters] = useState(false);

  // Filter and search logic
  const filtered = useMemo(() => {
    let result = tenants.filter((t) => t.status === "active");

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (t) =>
          t.name.toLowerCase().includes(q) ||
          t.slug.toLowerCase().includes(q) ||
          t.description?.toLowerCase().includes(q) ||
          t.services.some((s) => s.name.toLowerCase().includes(q)) ||
          t.address?.toLowerCase().includes(q)
      );
    }

    if (selectedPlan) {
      result = result.filter((t) => t.plan === selectedPlan);
    }

    // Sort: premium first, then professional, then basic
    result.sort((a, b) => {
      const order = { premium: 0, professional: 1, basic: 2 };
      return (order[a.plan] ?? 2) - (order[b.plan] ?? 2);
    });

    return result;
  }, [tenants, searchQuery, selectedPlan]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / ITEMS_PER_PAGE));
  const paginated = filtered.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setCurrentPage(1);
  };

  const clearFilters = () => {
    setSearchQuery("");
    setSelectedCategory("");
    setSelectedPlan("");
    setCurrentPage(1);
  };

  const hasActiveFilters = searchQuery || selectedCategory || selectedPlan;

  return (
    <div className="min-h-screen bg-zinc-950 text-white">
      {/* Ambient background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-indigo-600/5 rounded-full filter blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-violet-600/5 rounded-full filter blur-3xl" />
      </div>

      {/* Header */}
      <header className="sticky top-0 z-40 bg-zinc-950/90 backdrop-blur-xl border-b border-zinc-800/60">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <button
              onClick={onGoBack}
              className="p-2 rounded-xl bg-zinc-900 border border-zinc-800 hover:bg-zinc-800 text-zinc-400 hover:text-white transition-all cursor-pointer"
              title="Voltar"
            >
              <ArrowLeft size={16} />
            </button>
            <LogoSeusiteAlugado size="sm" theme="dark" showSubtitle={false} />
          </div>

          <div className="flex items-center gap-2">
            <span className="text-zinc-500 text-xs hidden sm:block">
              {filtered.length} site(s) encontrado(s)
            </span>
            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse hidden sm:block" />
          </div>
        </div>
      </header>

      {/* Page Header */}
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 pt-12 pb-8 text-center">
        <div className="inline-flex items-center gap-2 bg-indigo-500/10 border border-indigo-500/20 px-3.5 py-1 rounded-full text-xs font-extrabold text-indigo-400 mb-4">
          <Globe size={11} className="animate-pulse" />
          <span>Portfólio de Sites Ativos</span>
        </div>
        <h1 className="text-3xl sm:text-4xl md:text-5xl font-black text-white mb-3 leading-tight">
          Conheça os{" "}
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-amber-500">
            Sites dos Clientes
          </span>
        </h1>
        <p className="text-zinc-400 text-sm max-w-xl mx-auto leading-relaxed">
          Empresas reais, sites profissionais, funcionando agora mesmo na nossa
          plataforma. Clique para visitar.
        </p>
      </div>

      {/* Search + Filters */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 pb-6">
        <form onSubmit={handleSearch}>
          <div className="flex gap-2">
            {/* Search bar - estilo landing page */}
            <div className="flex-1 flex items-center gap-2 bg-zinc-900/80 border border-zinc-800 rounded-2xl px-4 py-2.5 shadow-xl focus-within:border-indigo-500/50 transition-all">
              <Search size={15} className="text-zinc-500 shrink-0" />
              <input
                type="text"
                placeholder="Buscar por nome, serviço, cidade..."
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setCurrentPage(1);
                }}
                className="flex-1 bg-transparent text-sm text-white placeholder:text-zinc-600 focus:outline-none"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => {
                    setSearchQuery("");
                    setCurrentPage(1);
                  }}
                  className="text-zinc-600 hover:text-zinc-400 transition-colors cursor-pointer"
                >
                  <X size={13} />
                </button>
              )}

              {/* Category selector - inline no search bar como na landing */}
              <div className="hidden sm:block w-px h-4 bg-zinc-800 mx-1" />
              <select
                value={selectedPlan}
                onChange={(e) => {
                  setSelectedPlan(e.target.value);
                  setCurrentPage(1);
                }}
                className="hidden sm:block bg-transparent text-xs text-zinc-500 font-bold focus:outline-none cursor-pointer"
              >
                <option value="">Todos os planos</option>
                <option value="premium">Premium</option>
                <option value="professional">Profissional</option>
                <option value="basic">Básico</option>
              </select>

              <button
                type="submit"
                className="bg-yellow-400 hover:bg-yellow-300 text-zinc-950 font-black text-xs px-5 py-2 rounded-xl transition-all cursor-pointer shrink-0"
              >
                Buscar
              </button>
            </div>
          </div>

          {/* Mobile filters */}
          <div className="sm:hidden mt-2 flex gap-2">
            <select
              value={selectedPlan}
              onChange={(e) => {
                setSelectedPlan(e.target.value);
                setCurrentPage(1);
              }}
              className="flex-1 bg-zinc-900 border border-zinc-800 text-zinc-400 text-xs rounded-xl px-3 py-2 focus:outline-none cursor-pointer"
            >
              <option value="">Todos os planos</option>
              <option value="premium">Premium</option>
              <option value="professional">Profissional</option>
              <option value="basic">Básico</option>
            </select>

            {hasActiveFilters && (
              <button
                type="button"
                onClick={clearFilters}
                className="text-xs text-red-400 border border-red-900/50 bg-red-950/30 px-3 py-2 rounded-xl flex items-center gap-1 cursor-pointer"
              >
                <X size={11} />
                Limpar
              </button>
            )}
          </div>
        </form>

        {/* Active filters summary */}
        {hasActiveFilters && (
          <div className="mt-3 flex items-center gap-2 flex-wrap">
            <span className="text-xs text-zinc-500">Filtros ativos:</span>
            {searchQuery && (
              <span className="text-[11px] bg-indigo-950/50 border border-indigo-800/50 text-indigo-300 px-2 py-0.5 rounded-full">
                "{searchQuery}"
              </span>
            )}
            {selectedPlan && (
              <span className="text-[11px] bg-amber-950/50 border border-amber-800/50 text-amber-300 px-2 py-0.5 rounded-full">
                Plano: {PLAN_LABELS[selectedPlan]?.label}
              </span>
            )}
            <button
              onClick={clearFilters}
              className="text-[11px] text-zinc-500 hover:text-red-400 underline cursor-pointer transition-colors"
            >
              limpar tudo
            </button>
          </div>
        )}
      </div>

      {/* Sites Grid */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 pb-12">
        {paginated.length === 0 ? (
          <div className="py-24 text-center space-y-4">
            <div className="w-20 h-20 rounded-full bg-zinc-900 border border-zinc-800 flex items-center justify-center mx-auto text-3xl">
              🔍
            </div>
            <h3 className="text-white font-black text-lg">
              Nenhum site encontrado
            </h3>
            <p className="text-zinc-500 text-sm max-w-sm mx-auto">
              Tente buscar por outro nome ou serviço, ou limpe os filtros para
              ver todos os sites.
            </p>
            <button
              onClick={clearFilters}
              className="inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-sm px-5 py-2.5 rounded-xl cursor-pointer transition-all"
            >
              <X size={14} />
              Limpar Filtros
            </button>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              {paginated.map((tenant) => (
                <SitePreviewCard
                  key={tenant.id}
                  tenant={tenant}
                  onSelectTenant={onSelectTenant}
                />
              ))}
            </div>

            {/* Pagination - estilo Google */}
            {totalPages > 1 && (
              <div className="mt-10 flex items-center justify-center gap-1">
                <button
                  onClick={() =>
                    setCurrentPage((p) => Math.max(1, p - 1))
                  }
                  disabled={currentPage === 1}
                  className="p-2 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 disabled:opacity-30 disabled:cursor-not-allowed transition-all cursor-pointer"
                >
                  <ChevronLeft size={18} />
                </button>

                {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                  (page) => {
                    const isActive = page === currentPage;
                    const isNear =
                      Math.abs(page - currentPage) <= 2 ||
                      page === 1 ||
                      page === totalPages;

                    if (!isNear) {
                      if (
                        page === currentPage - 3 ||
                        page === currentPage + 3
                      ) {
                        return (
                          <span
                            key={page}
                            className="px-1 text-zinc-600 text-sm"
                          >
                            …
                          </span>
                        );
                      }
                      return null;
                    }

                    return (
                      <button
                        key={page}
                        onClick={() => setCurrentPage(page)}
                        className={`w-9 h-9 rounded-lg text-sm font-bold transition-all cursor-pointer ${
                          isActive
                            ? "bg-indigo-600 text-white shadow-lg shadow-indigo-600/20"
                            : "text-zinc-400 hover:text-white hover:bg-zinc-800"
                        }`}
                      >
                        {page}
                      </button>
                    );
                  }
                )}

                <button
                  onClick={() =>
                    setCurrentPage((p) => Math.min(totalPages, p + 1))
                  }
                  disabled={currentPage === totalPages}
                  className="p-2 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 disabled:opacity-30 disabled:cursor-not-allowed transition-all cursor-pointer"
                >
                  <ChevronRight size={18} />
                </button>
              </div>
            )}

            {/* Pagination info */}
            <div className="mt-4 text-center text-xs text-zinc-600">
              Mostrando{" "}
              {Math.min((currentPage - 1) * ITEMS_PER_PAGE + 1, filtered.length)}–
              {Math.min(currentPage * ITEMS_PER_PAGE, filtered.length)} de{" "}
              {filtered.length} site(s)
            </div>
          </>
        )}
      </main>

      {/* Footer CTA */}
      <div className="border-t border-zinc-900 py-10 text-center px-4">
        <p className="text-zinc-500 text-sm mb-4">
          Quer ter seu próprio site aqui no portfólio?
        </p>
        <button
          onClick={onGoBack}
          className="inline-flex items-center gap-2 bg-yellow-400 hover:bg-yellow-300 text-zinc-950 font-black text-sm px-6 py-3 rounded-xl cursor-pointer transition-all hover:scale-105 active:scale-95"
        >
          <Sparkles size={14} />
          Alugar meu site agora
        </button>
      </div>
    </div>
  );
}
