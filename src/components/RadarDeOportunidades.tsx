/**
 * Radar de Oportunidades — Componente Principal
 * Módulo Admin Exclusivo | SeuSiteAlugado
 */

import React, { useState, useEffect, useCallback } from "react";
import {
  Search, Radar, MapPin, Globe, Phone, Mail, Instagram, Facebook,
  Star, AlertTriangle, CheckCircle, XCircle, Loader2, RefreshCw,
  ChevronRight, Trash2, Zap, FileText, TrendingUp, Shield, Smartphone,
  Code2, Link2, Cpu, Info, Filter, BarChart3, Eye
} from "lucide-react";
import AuditDetailModal from "./AuditDetailModal";

// ─── Types ────────────────────────────────────────────────────
interface RadarCompany {
  id: string;
  name: string;
  category?: string;
  phone?: string;
  website?: string;
  email?: string;
  instagram?: string;
  facebook?: string;
  address?: string;
  city?: string;
  state?: string;
  latitude?: number;
  longitude?: number;
  status: "found" | "auditing" | "audited" | "proposal_sent" | "converted";
  created_at: string;
  radar_audits?: any[];
}

const CATEGORIES = [
  { value: "geral", label: "Todas as categorias" },
  { value: "restaurante", label: "Restaurante / Café" },
  { value: "barbearia", label: "Barbearia" },
  { value: "salao", label: "Salão de Beleza" },
  { value: "dentista", label: "Clínica Odontológica" },
  { value: "clinica", label: "Clínica Médica" },
  { value: "mercado", label: "Supermercado / Mercearia" },
  { value: "farmacia", label: "Farmácia" },
  { value: "academia", label: "Academia" },
  { value: "hotel", label: "Hotel / Motel" },
  { value: "oficina", label: "Oficina Mecânica" },
  { value: "padaria", label: "Padaria" },
  { value: "petshop", label: "Pet Shop / Veterinário" },
  { value: "advocacia", label: "Escritório de Advocacia" },
  { value: "contabilidade", label: "Contabilidade" },
  { value: "escola", label: "Escola / Curso" },
];

const LIMITS = [50, 100, 250, 500];

const BR_STATES = [
  "AC","AL","AM","AP","BA","CE","DF","ES","GO","MA","MG","MS","MT","PA","PB","PE","PI","PR","RJ","RN","RO","RR","RS","SC","SE","SP","TO"
];

// ─── Helpers ─────────────────────────────────────────────────
function starsToColor(stars: number) {
  if (stars >= 5) return "text-emerald-500";
  if (stars >= 4) return "text-green-500";
  if (stars >= 3) return "text-amber-500";
  if (stars >= 2) return "text-orange-500";
  return "text-slate-400";
}

function scoreColor(score: number) {
  if (score >= 70) return "text-emerald-600";
  if (score >= 40) return "text-amber-600";
  return "text-red-600";
}

function scoreBg(score: number) {
  if (score >= 70) return "bg-emerald-50 border-emerald-200";
  if (score >= 40) return "bg-amber-50 border-amber-200";
  return "bg-red-50 border-red-200";
}

function statusBadge(status: string) {
  const map: Record<string, { label: string; cls: string }> = {
    found: { label: "Encontrada", cls: "bg-slate-100 text-slate-600" },
    auditing: { label: "Auditando…", cls: "bg-blue-100 text-blue-700 animate-pulse" },
    audited: { label: "Auditada", cls: "bg-indigo-100 text-indigo-700" },
    proposal_sent: { label: "Proposta Enviada", cls: "bg-emerald-100 text-emerald-700" },
    converted: { label: "Cliente Convertido", cls: "bg-purple-100 text-purple-700" },
  };
  const s = map[status] || map.found;
  return <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-full uppercase ${s.cls}`}>{s.label}</span>;
}

function StarRating({ stars }: { stars: number }) {
  return (
    <span className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map(i => (
        <Star key={i} size={13} className={i <= stars ? starsToColor(stars) : "text-slate-200"} fill={i <= stars ? "currentColor" : "none"} />
      ))}
    </span>
  );
}

function ScorePill({ label, score }: { label: string; score: number }) {
  return (
    <div className={`flex flex-col items-center border rounded-lg px-2 py-1.5 ${scoreBg(score)}`}>
      <span className={`text-sm font-black ${scoreColor(score)}`}>{score}</span>
      <span className="text-[9px] text-slate-500 font-medium mt-0.5">{label}</span>
    </div>
  );
}

// ─── Company Card ─────────────────────────────────────────────
function CompanyCard({
  company, onAudit, onDelete, onViewDetail, isAuditing
}: {
  company: RadarCompany;
  onAudit: () => void;
  onDelete: () => void;
  onViewDetail: () => void;
  isAuditing: boolean;
}) {
  const audit = company.radar_audits?.[0];

  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-4 flex flex-col gap-3 shadow-sm hover:shadow-md transition-shadow group">
      {/* Header */}
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          <h3 className="text-sm font-bold text-slate-800 truncate leading-tight">{company.name}</h3>
          <p className="text-[11px] text-slate-400 capitalize mt-0.5">{company.category || "Empresa"}</p>
        </div>
        {statusBadge(company.status)}
      </div>

      {/* Auditoria — pontuações */}
      {audit && (
        <div className="grid grid-cols-3 gap-1.5">
          <ScorePill label="SEO" score={audit.score_seo || 0} />
          <ScorePill label="Perf." score={audit.score_performance || 0} />
          <ScorePill label="Seg." score={audit.score_security || 0} />
        </div>
      )}

      {/* Stars (oportunidade) */}
      {audit && (
        <div className="flex items-center justify-between">
          <div className="flex flex-col">
            <span className="text-[10px] text-slate-400 font-medium mb-0.5">Oportunidade</span>
            <StarRating stars={audit.stars || 1} />
          </div>
          <div className="text-right">
            <span className="text-[10px] text-slate-400">Valor est.</span>
            <p className="text-xs font-bold text-indigo-700">
              R$ {audit.estimated_value_min?.toLocaleString("pt-BR") || "–"} – {audit.estimated_value_max?.toLocaleString("pt-BR") || "–"}
            </p>
          </div>
        </div>
      )}

      {/* Infos básicas */}
      <div className="space-y-1 border-t border-slate-100 pt-2">
        {company.website && (
          <div className="flex items-center gap-1.5 text-[11px] text-slate-500">
            <Globe size={11} className="text-slate-400 shrink-0" />
            <a href={company.website.startsWith("http") ? company.website : `https://${company.website}`} target="_blank" rel="noopener noreferrer" className="truncate hover:text-indigo-600 transition-colors">
              {company.website.replace(/^https?:\/\//, "")}
            </a>
          </div>
        )}
        {company.phone && (
          <div className="flex items-center gap-1.5 text-[11px] text-slate-500">
            <Phone size={11} className="text-slate-400 shrink-0" />
            <span>{company.phone}</span>
          </div>
        )}
        {company.address && (
          <div className="flex items-center gap-1.5 text-[11px] text-slate-500">
            <MapPin size={11} className="text-slate-400 shrink-0" />
            <span className="truncate">{company.address}</span>
          </div>
        )}
      </div>

      {/* Ações */}
      <div className="flex gap-2 pt-1">
        {!audit && company.website && !isAuditing && (
          <button
            onClick={onAudit}
            className="flex-1 flex items-center justify-center gap-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-[11px] font-bold py-2 rounded-lg transition-colors cursor-pointer"
          >
            <Zap size={12} /> Auditar Site
          </button>
        )}
        {isAuditing && (
          <div className="flex-1 flex items-center justify-center gap-1.5 bg-blue-50 text-blue-600 text-[11px] font-bold py-2 rounded-lg">
            <Loader2 size={12} className="animate-spin" /> Auditando…
          </div>
        )}
        {audit && (
          <button
            onClick={onViewDetail}
            className="flex-1 flex items-center justify-center gap-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-[11px] font-bold py-2 rounded-lg transition-colors cursor-pointer"
          >
            <Eye size={12} /> Ver Relatório
          </button>
        )}
        {!company.website && !audit && (
          <div className="flex-1 flex items-center justify-center text-[10px] text-slate-400 py-2 border border-dashed border-slate-200 rounded-lg">
            Sem website cadastrado
          </div>
        )}
        <button
          onClick={onDelete}
          className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
          title="Remover empresa"
        >
          <Trash2 size={13} />
        </button>
      </div>
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────
export default function RadarDeOportunidades() {
  const [city, setCity] = useState("");
  const [state, setState] = useState("BA");
  const [category, setCategory] = useState("geral");
  const [limit, setLimit] = useState(50);
  const [isSearching, setIsSearching] = useState(false);
  const [companies, setCompanies] = useState<RadarCompany[]>([]);
  const [auditingIds, setAuditingIds] = useState<Set<string>>(new Set());
  const [selectedCompany, setSelectedCompany] = useState<RadarCompany | null>(null);
  const [searchError, setSearchError] = useState("");
  const [filter, setFilter] = useState<"all" | "audited" | "not_audited" | "with_website">("all");
  const [sortBy, setSortBy] = useState<"created" | "stars" | "score">("created");
  const [isLoading, setIsLoading] = useState(true);
  const [searchStats, setSearchStats] = useState<{ total: number; withWebsite: number; audited: number } | null>(null);

  // Carregar empresas salvas ao montar
  useEffect(() => {
    loadCompanies();
  }, []);

  const loadCompanies = async () => {
    setIsLoading(true);
    try {
      const resp = await fetch("/api/radar/companies");
      if (resp.ok) {
        const data = await resp.json();
        setCompanies(data);
        setSearchStats({
          total: data.length,
          withWebsite: data.filter((c: RadarCompany) => c.website).length,
          audited: data.filter((c: RadarCompany) => c.status === "audited" || c.status === "proposal_sent").length,
        });
      }
    } catch (e) {
      console.error("Erro ao carregar empresas:", e);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearch = async () => {
    if (!city.trim()) { setSearchError("Informe a cidade para buscar."); return; }
    setSearchError("");
    setIsSearching(true);
    try {
      const resp = await fetch("/api/radar/search", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ city: city.trim(), state, category, limit }),
      });
      const data = await resp.json();
      if (!resp.ok) throw new Error(data.error || "Erro na busca");
      await loadCompanies();
      setSearchError(`✅ ${data.total} empresa(s) encontrada(s) em ${city}.`);
    } catch (e: any) {
      setSearchError(`❌ Erro: ${e.message}`);
    } finally {
      setIsSearching(false);
    }
  };

  const handleAudit = async (company: RadarCompany) => {
    if (!company.website) return;
    setAuditingIds(prev => new Set(prev).add(company.id));
    // Atualizar status localmente imediatamente
    setCompanies(prev => prev.map(c => c.id === company.id ? { ...c, status: "auditing" } : c));
    try {
      const resp = await fetch("/api/radar/audit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ companyId: company.id, url: company.website }),
      });
      if (resp.ok) {
        await loadCompanies();
      } else {
        const err = await resp.json();
        alert(`Erro na auditoria: ${err.error}`);
        setCompanies(prev => prev.map(c => c.id === company.id ? { ...c, status: "found" } : c));
      }
    } catch (e: any) {
      alert(`Erro: ${e.message}`);
      setCompanies(prev => prev.map(c => c.id === company.id ? { ...c, status: "found" } : c));
    } finally {
      setAuditingIds(prev => { const s = new Set(prev); s.delete(company.id); return s; });
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Remover esta empresa do radar?")) return;
    try {
      await fetch(`/api/radar/companies/${id}`, { method: "DELETE" });
      setCompanies(prev => prev.filter(c => c.id !== id));
    } catch (e) {
      alert("Erro ao remover empresa.");
    }
  };

  const handleAuditAll = async () => {
    const toAudit = filteredCompanies.filter(c => c.website && c.status === "found");
    if (!toAudit.length) { alert("Nenhuma empresa com website para auditar."); return; }
    if (!confirm(`Auditar ${toAudit.length} empresa(s) com website? Isso pode demorar.`)) return;
    for (const c of toAudit.slice(0, 10)) { // Limitar a 10 por vez
      await handleAudit(c);
    }
  };

  // Filtro e ordenação
  const filteredCompanies = companies
    .filter(c => {
      if (filter === "audited") return c.status === "audited" || c.status === "proposal_sent";
      if (filter === "not_audited") return c.status === "found";
      if (filter === "with_website") return !!c.website;
      return true;
    })
    .sort((a, b) => {
      if (sortBy === "stars") {
        const aS = a.radar_audits?.[0]?.stars || 0;
        const bS = b.radar_audits?.[0]?.stars || 0;
        return bS - aS;
      }
      if (sortBy === "score") {
        const aS = a.radar_audits?.[0]?.score_general || 0;
        const bS = b.radar_audits?.[0]?.score_general || 0;
        return aS - bS; // score baixo = melhor oportunidade
      }
      return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
    });

  const auditedCount = companies.filter(c => c.radar_audits?.length).length;
  const withWebsiteCount = companies.filter(c => c.website).length;

  return (
    <div className="space-y-6">

      {/* ── Cabeçalho ─────────────────────────────────────────── */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-600 to-violet-600 flex items-center justify-center shadow-md">
            <Radar className="text-white" size={20} />
          </div>
          <div>
            <h2 className="text-lg font-black text-slate-800">Radar de Oportunidades</h2>
            <p className="text-[11px] text-slate-500">Encontre e audite websites de potenciais clientes automaticamente</p>
          </div>
        </div>
        <button onClick={loadCompanies} className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer" title="Recarregar">
          <RefreshCw size={15} />
        </button>
      </div>

      {/* ── Stats rápidos ──────────────────────────────────────── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: "Empresas no Radar", value: companies.length, icon: MapPin, color: "text-indigo-600 bg-indigo-50" },
          { label: "Com Website", value: withWebsiteCount, icon: Globe, color: "text-blue-600 bg-blue-50" },
          { label: "Auditadas", value: auditedCount, icon: BarChart3, color: "text-emerald-600 bg-emerald-50" },
          { label: "Propostas Enviadas", value: companies.filter(c => c.status === "proposal_sent").length, icon: FileText, color: "text-violet-600 bg-violet-50" },
        ].map(({ label, value, icon: Icon, color }) => (
          <div key={label} className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm">
            <div className="flex items-center gap-2 mb-2">
              <div className={`p-1.5 rounded-lg ${color.split(" ")[1]}`}>
                <Icon size={14} className={color.split(" ")[0]} />
              </div>
              <span className="text-[10px] text-slate-500 font-medium uppercase tracking-wide">{label}</span>
            </div>
            <span className="text-2xl font-black text-slate-800">{value}</span>
          </div>
        ))}
      </div>

      {/* ── Painel de Busca ────────────────────────────────────── */}
      <div className="bg-gradient-to-br from-indigo-600 to-violet-700 rounded-2xl p-5 shadow-lg text-white">
        <h3 className="text-sm font-black mb-4 flex items-center gap-2">
          <Search size={15} /> Nova Varredura
        </h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
          <div className="col-span-2 sm:col-span-1">
            <label className="block text-[10px] font-bold text-indigo-200 mb-1 uppercase tracking-wide">Cidade</label>
            <input
              type="text"
              value={city}
              onChange={e => setCity(e.target.value)}
              onKeyDown={e => e.key === "Enter" && handleSearch()}
              placeholder="Ex: Salvador"
              className="w-full bg-white/15 backdrop-blur border border-white/25 rounded-lg px-3 py-2 text-sm text-white placeholder-indigo-200 focus:outline-none focus:ring-2 focus:ring-white/40"
            />
          </div>
          <div>
            <label className="block text-[10px] font-bold text-indigo-200 mb-1 uppercase tracking-wide">Estado</label>
            <select
              value={state}
              onChange={e => setState(e.target.value)}
              className="w-full bg-white/15 backdrop-blur border border-white/25 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-white/40"
            >
              {BR_STATES.map(s => <option key={s} value={s} className="text-slate-800">{s}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-[10px] font-bold text-indigo-200 mb-1 uppercase tracking-wide">Categoria</label>
            <select
              value={category}
              onChange={e => setCategory(e.target.value)}
              className="w-full bg-white/15 backdrop-blur border border-white/25 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-white/40"
            >
              {CATEGORIES.map(c => <option key={c.value} value={c.value} className="text-slate-800">{c.label}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-[10px] font-bold text-indigo-200 mb-1 uppercase tracking-wide">Quantidade</label>
            <select
              value={limit}
              onChange={e => setLimit(Number(e.target.value))}
              className="w-full bg-white/15 backdrop-blur border border-white/25 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-white/40"
            >
              {LIMITS.map(l => <option key={l} value={l} className="text-slate-800">{l} empresas</option>)}
            </select>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={handleSearch}
            disabled={isSearching}
            className="flex items-center gap-2 bg-white text-indigo-700 font-black text-sm px-6 py-2.5 rounded-xl hover:bg-indigo-50 transition-all active:scale-95 disabled:opacity-60 cursor-pointer shadow-md"
          >
            {isSearching ? <Loader2 size={15} className="animate-spin" /> : <Radar size={15} />}
            {isSearching ? "Varrendo…" : "INICIAR VARREDURA"}
          </button>
          {withWebsiteCount > 0 && (
            <button
              onClick={handleAuditAll}
              className="flex items-center gap-2 bg-white/15 hover:bg-white/25 text-white font-bold text-sm px-4 py-2.5 rounded-xl transition-all border border-white/25 cursor-pointer"
            >
              <Zap size={14} /> Auditar Todos
            </button>
          )}
        </div>
        {searchError && (
          <p className={`mt-3 text-sm font-medium ${searchError.startsWith("✅") ? "text-emerald-200" : "text-red-200"}`}>
            {searchError}
          </p>
        )}
      </div>

      {/* ── Filtros e Ordenação ────────────────────────────────── */}
      {companies.length > 0 && (
        <div className="flex flex-wrap items-center gap-2">
          <Filter size={14} className="text-slate-400" />
          {[
            { value: "all", label: "Todas" },
            { value: "with_website", label: "Com Website" },
            { value: "not_audited", label: "Não Auditadas" },
            { value: "audited", label: "Auditadas" },
          ].map(f => (
            <button
              key={f.value}
              onClick={() => setFilter(f.value as any)}
              className={`text-[11px] font-bold px-3 py-1.5 rounded-full transition-colors cursor-pointer ${filter === f.value ? "bg-indigo-600 text-white" : "bg-white border border-slate-200 text-slate-600 hover:border-indigo-300"}`}
            >
              {f.label}
            </button>
          ))}
          <div className="ml-auto flex items-center gap-2">
            <span className="text-[11px] text-slate-400">Ordenar:</span>
            <select
              value={sortBy}
              onChange={e => setSortBy(e.target.value as any)}
              className="text-[11px] border border-slate-200 rounded-lg px-2 py-1.5 text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-400"
            >
              <option value="created">Mais recentes</option>
              <option value="stars">Melhor oportunidade</option>
              <option value="score">Pior score (prioridade)</option>
            </select>
          </div>
        </div>
      )}

      {/* ── Lista de Empresas ─────────────────────────────────── */}
      {isLoading ? (
        <div className="flex items-center justify-center py-16 text-slate-400">
          <Loader2 size={24} className="animate-spin mr-3" />
          <span className="text-sm">Carregando empresas…</span>
        </div>
      ) : filteredCompanies.length === 0 ? (
        <div className="bg-white border border-slate-200 border-dashed rounded-2xl p-12 text-center">
          <Radar size={40} className="text-slate-300 mx-auto mb-3" />
          <h3 className="text-slate-500 font-bold text-sm mb-1">Nenhuma empresa encontrada</h3>
          <p className="text-slate-400 text-xs">Use o painel acima para iniciar uma varredura por cidade e categoria.</p>
        </div>
      ) : (
        <div>
          <p className="text-xs text-slate-400 mb-3">{filteredCompanies.length} empresa(s) exibidas</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {filteredCompanies.map(company => (
              <CompanyCard
                key={company.id}
                company={company}
                isAuditing={auditingIds.has(company.id)}
                onAudit={() => handleAudit(company)}
                onDelete={() => handleDelete(company.id)}
                onViewDetail={() => setSelectedCompany(company)}
              />
            ))}
          </div>
        </div>
      )}

      {/* ── Modal de Detalhe ──────────────────────────────────── */}
      {selectedCompany && (
        <AuditDetailModal
          company={selectedCompany}
          onClose={() => setSelectedCompany(null)}
          onRefresh={async () => {
            await loadCompanies();
            // Atualizar empresa selecionada com dados frescos
            const resp = await fetch(`/api/radar/companies/${selectedCompany.id}`);
            if (resp.ok) {
              const updated = await resp.json();
              setSelectedCompany(updated);
            }
          }}
        />
      )}
    </div>
  );
}
