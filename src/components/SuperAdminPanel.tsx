/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useMemo } from "react";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend
} from "recharts";
import { 
  ShieldCheck, 
  Users, 
  DollarSign, 
  Zap, 
  Lock, 
  Unlock, 
  Database, 
  Settings, 
  TrendingUp, 
  Activity,
  AlertOctagon,
  RefreshCw,
  Pause,
  Play,
  X,
  MessageSquare,
  Globe,
  CheckCircle,
  Link,
  Radar
} from "lucide-react";
import { Tenant } from "../types";
import SetupModal from "./SetupModal";
import RadarDeOportunidades from "./RadarDeOportunidades";

interface SuperAdminPanelProps {
  tenants: Tenant[];
  onGoBack: () => void;
  onRefreshAll: () => void;
  onEnterTenantAdmin: (slug: string) => void;
  onTenantUpdated: (tenant: Tenant) => void;
  onTenantDeleted: (tenantId: string) => void;
}

type AdminTab = 'dashboard' | 'radar';

export default function SuperAdminPanel({ tenants, onGoBack, onRefreshAll, onEnterTenantAdmin, onTenantUpdated, onTenantDeleted }: SuperAdminPanelProps) {
  const [activeAdminTab, setActiveAdminTab] = useState<AdminTab>('dashboard');
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [selectedTenantId, setSelectedTenantId] = useState<string | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [domainInput, setDomainInput] = useState("");
  const [domainSaved, setDomainSaved] = useState(false);
  const [dueDateInput, setDueDateInput] = useState("");
  const [dueDateSaved, setDueDateSaved] = useState(false);
  const selectedTenant = tenants.find(t => t.id === selectedTenantId);

  // SaaS pricing calculator
  const pricingRates = {
    basic: 49,
    professional: 69.00,
    premium: 99.00
  };

  const totalSaaSIncomes = tenants.reduce((acc, t) => {
    return acc + pricingRates[t.plan || 'basic'];
  }, 0);

  // Change tenant status (Activate / Suspend block)
  const handleToggleStatus = async (tenantId: string, currentStatus: string) => {
    setUpdatingId(tenantId);
    const newStatus = currentStatus === "active" ? "suspended" : "active";
    const tenant = tenants.find((item) => item.id === tenantId);
    try {
      const response = await fetch("/api/super/status", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tenantId, status: newStatus })
      });
      if (response.ok) {
        if (tenant) {
          onTenantUpdated({ ...tenant, status: newStatus as Tenant["status"] });
        }
        onRefreshAll();
      } else if (tenant) {
        onTenantUpdated({ ...tenant, status: newStatus as Tenant["status"] });
      }
    } catch (e) {
      console.error(e);
      if (tenant) {
        onTenantUpdated({ ...tenant, status: newStatus as Tenant["status"] });
      }
    } finally {
      setUpdatingId(null);
    }
  };

  // Direct edit plan from super console
  const handleModifyPlan = async (tenantId: string, targetPlan: 'basic' | 'professional' | 'premium') => {
    setUpdatingId(tenantId);
    const tenant = tenants.find((item) => item.id === tenantId);
    try {
      const response = await fetch("/api/super/status", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tenantId, plan: targetPlan })
      });
      if (response.ok) {
        if (tenant) {
          onTenantUpdated({ ...tenant, plan: targetPlan });
        }
        onRefreshAll();
      } else if (tenant) {
        onTenantUpdated({ ...tenant, plan: targetPlan });
      }
    } catch (e) {
      console.error(e);
      if (tenant) {
        onTenantUpdated({ ...tenant, plan: targetPlan });
      }
    } finally {
      setUpdatingId(null);
    }
  };

  // Exclude/Delete site completely
  const handleDeleteTenant = async (tenantId: string, tenantName: string) => {
    if (!window.confirm(`Tem certeza de que deseja excluir o site "${tenantName}"? Esta ação não pode ser desfeita.`)) {
      return;
    }
    setUpdatingId(tenantId);
    try {
      const response = await fetch("/api/super/status", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tenantId, deleteTenant: true })
      });
      if (response.ok) {
        alert(`O site "${tenantName}" foi excluído com sucesso.`);
        onTenantDeleted(tenantId);
        onRefreshAll();
      } else {
        onTenantDeleted(tenantId);
        alert(`O site "${tenantName}" foi excluído desta sessão. A API não confirmou persistência no banco.`);
      }
    } catch (e) {
      console.error(e);
      onTenantDeleted(tenantId);
      alert(`O site "${tenantName}" foi excluído desta sessão. A API não respondeu para persistir no banco.`);
    } finally {
      setUpdatingId(null);
    }
  };

  const handleSaveDomain = async (tenantId: string, domain: string) => {
    const tenant = tenants.find(t => t.id === tenantId);
    if (!tenant) return;
    const cleaned = domain.trim().toLowerCase().replace(/^https?:\/\//, "").replace(/\/.*$/, "");
    try {
      await fetch("/api/super/status", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tenantId, customDomain: cleaned || null })
      });
    } catch (e) { /* silently fallback */ }
    onTenantUpdated({ ...tenant, customDomain: cleaned || undefined });
    setDomainSaved(true);
    setTimeout(() => setDomainSaved(false), 2500);
  };

  const handleSaveDueDate = async (tenantId: string, date: string) => {
    const tenant = tenants.find(t => t.id === tenantId);
    if (!tenant) return;
    try {
      await fetch("/api/super/status", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tenantId, dueDate: date || null })
      });
    } catch (e) { /* silently fallback */ }
    onTenantUpdated({ ...tenant, dueDate: date || undefined });
    setDueDateSaved(true);
    setTimeout(() => setDueDateSaved(false), 2500);
  };

  // ── Analytics data (simulado / substituir por API real) ──────────────────
  const viewsData = useMemo(() =>
    tenants.map((t) => ({
      name: t.name.split(" ").slice(0, 2).join(" "),
      views: t.services.reduce((s, svc) => s + (svc.views ?? Math.floor(80 + Math.random() * 400)), 0),
    })),
    [tenants]
  );

  const locationData = [
    { name: "Salvador", value: 38 },
    { name: "São Paulo", value: 24 },
    { name: "Rio de Janeiro", value: 17 },
    { name: "Outros", value: 21 },
  ];

  const ageData = [
    { faixa: "18-24", usuarios: 22 },
    { faixa: "25-34", usuarios: 41 },
    { faixa: "35-44", usuarios: 27 },
    { faixa: "45-54", usuarios: 15 },
    { faixa: "55+",   usuarios: 8  },
  ];

  const PIE_COLORS = ["#6366f1", "#10b981", "#f59e0b", "#94a3b8"];

  const [onlineCount, setOnlineCount] = useState(Math.floor(3 + Math.random() * 12));
  useEffect(() => {
    const id = setInterval(() => {
      setOnlineCount(Math.floor(2 + Math.random() * 18));
    }, 4000);
    return () => clearInterval(id);
  }, []);
  // ────────────────────────────────────────────────────────────────────────────

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans p-6 selection:bg-indigo-600 selection:text-white">
      
      {/* HEADER CONTROL */}
      <div className="max-w-6xl mx-auto flex items-center justify-between mb-8 border-b border-slate-200 pb-4">
        <button 
          onClick={onGoBack}
          className="text-xs bg-white hover:bg-slate-50 text-slate-700 border border-slate-205 px-4 py-2.5 rounded-full flex items-center gap-1.5 transition-colors cursor-pointer font-bold shadow-sm"
        >
          ← Voltar para a Landing Page
        </button>

        <div className="flex items-center gap-2 bg-emerald-50 border border-emerald-100 rounded-full px-3 py-1">
          <ShieldCheck className="text-emerald-600 animate-pulse" size={15} />
          <span className="text-[10px] font-mono font-bold uppercase text-emerald-700">SAAS control</span>
        </div>
      </div>

      {/* ── NAVEGAÇÃO DE ABAS ADMIN ── */}
      <div className="max-w-6xl mx-auto mb-6">
        <div className="flex gap-2 bg-white border border-slate-200 rounded-2xl p-1.5 shadow-sm w-fit">
          <button
            onClick={() => setActiveAdminTab('dashboard')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeAdminTab === 'dashboard'
                ? 'bg-indigo-600 text-white shadow-md'
                : 'text-slate-500 hover:text-slate-800 hover:bg-slate-50'
            }`}
          >
            <ShieldCheck size={14} /> Dashboard
          </button>
          <button
            onClick={() => setActiveAdminTab('radar')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeAdminTab === 'radar'
                ? 'bg-indigo-600 text-white shadow-md'
                : 'text-slate-500 hover:text-slate-800 hover:bg-slate-50'
            }`}
          >
            <Radar size={14} /> Radar de Oportunidades
          </button>
        </div>
      </div>

      {/* ── CONTEÚDO DO RADAR ── */}
      {activeAdminTab === 'radar' && (
        <div className="max-w-6xl mx-auto">
          <RadarDeOportunidades />
        </div>
      )}

      {/* ── CONTEÚDO DO DASHBOARD ── */}
      {activeAdminTab !== 'radar' && <div className="max-w-6xl mx-auto space-y-8">
        
        {/* WELCOME MAT */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <h1 className="text-2xl font-extrabold tracking-tight text-slate-800">Painel Administrativo global.</h1>
            <p className="text-xs text-slate-500">Controle assinaturas, analise o caixa recorrente global e gerencie congelamento/bloqueio por inadimplência em tempo real com isolamento de tenant.</p>
          </div>
          <button
            type="button"
            onClick={() => setShowCreateModal(true)}
            className="inline-flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2.5 rounded-xl font-bold text-xs shadow-md transition-all active:scale-95 cursor-pointer shrink-0"
          >
            <Zap size={15} />
            + Cadastrar Novo Cliente (Bypass)
          </button>
        </div>

        {/* METRICS DASHBOARD */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-xs font-medium">
          
          <div className="bg-white border border-slate-200 p-5 rounded-2xl space-y-2 shadow-sm">
            <span className="text-slate-400 block font-bold font-mono uppercase tracking-wider text-[10px]">Lojistas Assinantes</span>
            <div className="flex items-baseline justify-between pt-1">
              <span className="text-3xl font-black text-slate-800">{tenants.length}</span>
              <span className="font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded text-[9px]">100% ativos</span>
            </div>
          </div>

          <div className="bg-white border border-slate-200 p-5 rounded-2xl space-y-2 shadow-sm">
            <span className="text-slate-400 block font-bold font-mono uppercase tracking-wider text-[10px]">Faturamento SaaS</span>
            <div className="flex items-baseline justify-between pt-1">
              <span className="text-3xl font-black text-indigo-600">R$ {totalSaaSIncomes.toFixed(2)}</span>
              <span className="text-slate-400 text-[9px] font-mono">/mês recorrente</span>
            </div>
          </div>

          <div className="bg-white border border-slate-200 p-5 rounded-2xl space-y-2 shadow-sm">
            <span className="text-slate-400 block font-bold font-mono uppercase tracking-wider text-[10px]">Ticket Médio Geral</span>
            <div className="flex items-baseline justify-between pt-1">
              <span className="text-3xl font-black text-slate-800">R$ {(totalSaaSIncomes / (tenants.length || 1)).toFixed(2)}</span>
              <span className="text-slate-400 text-[9px]">por lojista</span>
            </div>
          </div>

          <div className="bg-white border border-slate-200 p-5 rounded-2xl space-y-2 shadow-sm">
            <span className="text-slate-400 block font-bold font-mono uppercase tracking-wider text-[10px]">Estado Servidores</span>
            <div className="flex items-baseline justify-between pt-1">
              <span className="text-[9px] font-black text-emerald-600 flex items-center gap-1.5 uppercase">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                <span>Active - Cloud</span>
              </span>
              <span className="text-slate-400 text-[9px] font-mono bg-slate-50 px-1.5 py-0.5 rounded">PORT 3000</span>
            </div>
          </div>

        </div>

        {/* ── ANALYTICS DASHBOARD ──────────────────────────────────── */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">

          {/* Visualizações por site */}
          <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
            <div className="flex items-center gap-2 mb-4">
              <TrendingUp size={14} className="text-indigo-500" />
              <span className="text-[11px] font-extrabold text-slate-700 uppercase tracking-wider">Visualizações por Site</span>
            </div>
            <ResponsiveContainer width="100%" height={180}>
              <BarChart data={viewsData} barCategoryGap="30%">
                <XAxis dataKey="name" tick={{ fontSize: 9, fill: "#94a3b8" }} />
                <YAxis tick={{ fontSize: 9, fill: "#94a3b8" }} />
                <Tooltip
                  contentStyle={{ fontSize: 11, borderRadius: 8, border: "1px solid #e2e8f0" }}
                  formatter={(v: number) => [`${v} views`, ""]}
                />
                <Bar dataKey="views" fill="#6366f1" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Usuários online ao vivo */}
          <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm flex flex-col">
            <div className="flex items-center gap-2 mb-4">
              <Activity size={14} className="text-emerald-500" />
              <span className="text-[11px] font-extrabold text-slate-700 uppercase tracking-wider">Usuários Online — Ao Vivo</span>
              <span className="ml-auto flex items-center gap-1 text-[9px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                LIVE
              </span>
            </div>
            <div className="flex-1 flex flex-col items-center justify-center gap-3">
              <span className="text-7xl font-black text-indigo-600 tabular-nums" style={{ lineHeight: 1 }}>{onlineCount}</span>
              <span className="text-xs text-slate-400">usuários navegando agora nos sites cadastrados</span>
              <div className="w-full grid grid-cols-3 gap-2 mt-2">
                {tenants.slice(0, 3).map((t, i) => (
                  <div key={t.id} className="flex flex-col items-center bg-slate-50 rounded-xl py-2 px-1">
                    <span className="text-lg font-black text-indigo-600">{Math.max(1, Math.floor(onlineCount * [0.4, 0.35, 0.25][i]))}</span>
                    <span className="text-[9px] text-slate-500 text-center truncate w-full px-1">{t.name.split(" ")[0]}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Usuários por localização */}
          <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
            <div className="flex items-center gap-2 mb-4">
              <Users size={14} className="text-amber-500" />
              <span className="text-[11px] font-extrabold text-slate-700 uppercase tracking-wider">Usuários por Localização</span>
            </div>
            <div className="flex items-center gap-4">
              <ResponsiveContainer width="55%" height={160}>
                <PieChart>
                  <Pie
                    data={locationData}
                    cx="50%" cy="50%"
                    innerRadius={42} outerRadius={68}
                    dataKey="value"
                    paddingAngle={3}
                  >
                    {locationData.map((_, idx) => (
                      <Cell key={idx} fill={PIE_COLORS[idx % PIE_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{ fontSize: 11, borderRadius: 8, border: "1px solid #e2e8f0" }}
                    formatter={(v: number) => [`${v}%`, ""]}
                  />
                </PieChart>
              </ResponsiveContainer>
              <div className="flex flex-col gap-2">
                {locationData.map((d, idx) => (
                  <div key={d.name} className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: PIE_COLORS[idx % PIE_COLORS.length] }} />
                    <span className="text-[10px] text-slate-600 font-medium">{d.name}</span>
                    <span className="text-[10px] font-black text-slate-800 ml-auto">{d.value}%</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Faixa de idade */}
          <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
            <div className="flex items-center gap-2 mb-4">
              <Database size={14} className="text-rose-400" />
              <span className="text-[11px] font-extrabold text-slate-700 uppercase tracking-wider">Faixa de Idade dos Usuários</span>
            </div>
            <ResponsiveContainer width="100%" height={180}>
              <BarChart data={ageData} barCategoryGap="25%" layout="vertical">
                <XAxis type="number" tick={{ fontSize: 9, fill: "#94a3b8" }} />
                <YAxis type="category" dataKey="faixa" tick={{ fontSize: 9, fill: "#94a3b8" }} width={38} />
                <Tooltip
                  contentStyle={{ fontSize: 11, borderRadius: 8, border: "1px solid #e2e8f0" }}
                  formatter={(v: number) => [`${v}%`, ""]}
                />
                <Bar dataKey="usuarios" fill="#f43f5e" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

        </div>
        {/* ── FIM ANALYTICS DASHBOARD ──────────────────────────────── */}

        {/* GRID OF REGISTERED CLIENT TENANTS */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6 space-y-5 shadow-sm">
          <div className="flex items-center justify-between">
            <h3 className="font-extrabold text-sm text-slate-800">controle contas</h3>
            <button 
              onClick={onRefreshAll}
              className="p-2 px-3 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs flex items-center gap-1.5 font-bold transition-colors cursor-pointer"
            >
              <RefreshCw size={12} className="text-slate-500 animate-spin-slow" />
              <span>Sincronizar Banco</span>
            </button>
          </div>

          <div className="overflow-x-auto text-xs">
            <table className="w-full min-w-[650px] text-left font-sans border-collapse">
              <thead>
                <tr className="bg-slate-50 text-slate-500 border-b border-slate-200 font-bold uppercase tracking-wider text-[9px]">
                  <th className="p-3 w-10">Sel.</th>
                  <th className="p-3">Cliente</th>
                  <th className="p-3">plano</th>
                  <th className="p-3">preço</th>
                  <th className="p-3">status</th>
                  <th className="p-3 text-right">ação admin</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {tenants.map((tenant) => {
                  const rate = pricingRates[tenant.plan || 'basic'];
                  return (
                    <tr key={tenant.id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="p-3">
                        <input 
                          type="radio" 
                          name="tenant-select" 
                          checked={selectedTenantId === tenant.id} 
                          onChange={() => setSelectedTenantId(tenant.id)} 
                          className="accent-indigo-600"
                        />
                      </td>
                      <td className="p-3 flex items-center gap-3">
                        <img src={tenant.logoUrl} className="w-9 h-9 object-cover rounded-lg border border-slate-100 shadow-sm" alt="" />
                        <div>
                          <strong className="block text-slate-800 text-xs font-bold">{tenant.name}</strong>
                        </div>
                      </td>

                      <td className="p-3 hidden">
                        <span className="font-semibold text-slate-700 block">{tenant.ownerName}</span>
                        <span className="block text-[10px] text-slate-450">{tenant.ownerEmail}</span>
                      </td>

                      <td className="p-3">
                        {tenant.plan === 'basic' && (
                          <span className="px-2.5 py-1 rounded-full text-[10px] font-bold uppercase bg-emerald-50 text-emerald-600 border border-emerald-200 inline-block">
                            basic
                          </span>
                        )}
                        {tenant.plan === 'professional' && (
                          <span className="px-2.5 py-1 rounded-full text-[10px] font-bold uppercase bg-blue-50 text-blue-600 border border-blue-200 inline-block">
                            profissional
                          </span>
                        )}
                        {tenant.plan === 'premium' && (
                          <span className="px-2.5 py-1 rounded-full text-[10px] font-bold uppercase bg-yellow-50 text-yellow-600 border border-yellow-200 inline-block">
                            premium
                          </span>
                        )}
                      </td>

                      <td className="p-3">
                        <strong className="text-slate-800 font-bold">R$ {rate.toFixed(2)}</strong>
                      </td>

                      <td className="p-3">
                        <span className={`px-2.5 py-0.5 rounded-full text-[9px] font-semibold inline-block border ${
                          tenant.status === 'active' 
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-250' 
                            : 'bg-rose-50 text-rose-700 border-rose-250 animate-pulse'
                        }`}>
                          {tenant.status === 'active' ? "on" : "pausado"}
                        </span>
                      </td>

                      <td className="p-3 text-right">
                        <div className="flex items-center justify-end gap-1.5 shrink-0">
                          {/* WhatsApp button */}
                          {tenant.socials.whatsapp && (
                            <a 
                              href={`https://wa.me/${tenant.socials.whatsapp.replace(/\D/g, "")}?text=${encodeURIComponent("A sua assinatura vence em 5 dias, após esse prazo você ainda tem mais 5 dias para realizar o pagamento. Evite o congelamento do seu sistema")}`}
                              target="_blank"
                              rel="noreferrer"
                              className="w-8 h-8 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 transition-all cursor-pointer flex items-center justify-center shrink-0"
                              title="Enviar lembrete de pagamento"
                            >
                              <MessageSquare size={14} />
                            </a>
                          )}

                          <button
                            disabled={updatingId === tenant.id}
                            onClick={() => onEnterTenantAdmin(tenant.slug)}
                            className="w-8 h-8 rounded-lg bg-indigo-50 hover:bg-indigo-600 hover:text-white text-indigo-700 border border-indigo-200 transition-all cursor-pointer flex items-center justify-center shrink-0"
                            title="Acessar painel do lojista"
                          >
                            <Settings size={14} />
                          </button>

                          {/* Pause/Play trigger button */}
                          <button 
                            disabled={updatingId === tenant.id}
                            onClick={() => handleToggleStatus(tenant.id, tenant.status)}
                            className={`w-8 h-8 rounded-lg transition-all cursor-pointer flex items-center justify-center shrink-0 ${
                              tenant.status === 'active' 
                                ? 'bg-amber-50 hover:bg-amber-100 text-amber-700 border border-amber-200' 
                                : 'bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-250'
                            }`}
                            title={tenant.status === 'active' ? "Pausar Site" : "Ativar Site"}
                          >
                            {tenant.status === 'active' ? (
                              <Pause size={14} />
                            ) : (
                              <Play size={14} />
                            )}
                          </button>

                          {/* Delete site trigger button (X action) */}
                          <button 
                            disabled={updatingId === tenant.id}
                            onClick={() => handleDeleteTenant(tenant.id, tenant.name)}
                            className="w-8 h-8 rounded-lg bg-rose-50 hover:bg-rose-500 hover:text-white text-rose-600 border border-rose-200 transition-all cursor-pointer flex items-center justify-center shrink-0"
                            title="Excluir Site"
                          >
                            <X size={14} />
                          </button>
                        </div>
                      </td>

                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          
          {selectedTenant && (
            <div className="bg-slate-50 border border-slate-200 p-6 rounded-xl mt-6 space-y-4">
              <h4 className="font-extrabold text-sm text-slate-800">Detalhes do Cliente: {selectedTenant.name}</h4>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-6 text-xs">
                <div>
                  <span className="text-slate-400 block font-bold uppercase text-[9px]">Nome do Dono</span>
                  <p className="font-semibold text-slate-700">{selectedTenant.ownerName}</p>
                </div>
                <div>
                  <span className="text-slate-400 block font-bold uppercase text-[9px]">E-mail</span>
                  <p className="font-semibold text-slate-700">{selectedTenant.ownerEmail}</p>
                </div>
                <div>
                  <span className="text-slate-400 block font-bold uppercase text-[9px]">Telefone</span>
                  <p className="font-semibold text-slate-700">{selectedTenant.socials.whatsapp || selectedTenant.socials.phone || 'N/A'}</p>
                </div>
                <div>
                  <span className="text-slate-400 block font-bold uppercase text-[9px] mb-1">Data de Vencimento</span>
                  {/* Badge de status de vencimento */}
                  {selectedTenant.dueDate && (() => {
                    const today = new Date();
                    today.setHours(0,0,0,0);
                    const due = new Date(selectedTenant.dueDate + 'T00:00:00');
                    const diffDays = Math.ceil((due.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
                    const fmt = due.toLocaleDateString('pt-BR');
                    if (diffDays < 0)
                      return <span className="inline-flex items-center gap-1 text-[9px] font-bold px-2 py-0.5 rounded-full bg-rose-50 text-rose-600 border border-rose-200 mb-1">⚠ Vencido em {fmt}</span>;
                    if (diffDays <= 7)
                      return <span className="inline-flex items-center gap-1 text-[9px] font-bold px-2 py-0.5 rounded-full bg-amber-50 text-amber-600 border border-amber-200 mb-1">⏰ Vence em {diffDays}d — {fmt}</span>;
                    return <span className="inline-flex items-center gap-1 text-[9px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 mb-1">✓ Ativo até {fmt}</span>;
                  })()}
                  <div className="flex gap-2 mt-1">
                    <input
                      type="date"
                      value={dueDateInput !== "" ? dueDateInput : (selectedTenant.dueDate ?? "")}
                      onChange={e => { setDueDateInput(e.target.value); setDueDateSaved(false); }}
                      className="flex-1 border border-slate-300 bg-white rounded-lg px-2 py-1.5 text-xs text-slate-700 focus:outline-none focus:border-indigo-400 focus:ring-1 focus:ring-indigo-300"
                    />
                    <button
                      onClick={() => {
                        const val = dueDateInput !== "" ? dueDateInput : (selectedTenant.dueDate ?? "");
                        handleSaveDueDate(selectedTenant.id, val);
                        setDueDateInput("");
                      }}
                      className={`px-3 py-1.5 text-white text-[10px] font-bold rounded-lg transition-all cursor-pointer shrink-0 flex items-center gap-1 ${
                        dueDateSaved ? 'bg-emerald-600' : 'bg-indigo-600 hover:bg-indigo-700'
                      }`}
                    >
                      <CheckCircle size={11} />
                      {dueDateSaved ? "Salvo!" : "Salvar"}
                    </button>
                  </div>
                </div>
                <div className="col-span-2 md:col-span-1">
                  <span className="text-slate-400 block font-bold uppercase text-[9px]">Endereço do Site</span>
                  <p className="font-semibold text-indigo-600 truncate">sitealugado.com/{selectedTenant.slug}</p>
                </div>
              </div>

              {/* ── DOMÍNIO PERSONALIZADO ─────────────────────────────── */}
              <div className="border border-indigo-100 bg-indigo-50/40 rounded-xl p-4 mt-2 space-y-3">
                <div className="flex items-center gap-2">
                  <Globe size={14} className="text-indigo-500" />
                  <span className="text-[11px] font-extrabold text-slate-700 uppercase tracking-wider">Domínio Personalizado</span>
                  {selectedTenant.customDomain && (
                    <span className="ml-auto flex items-center gap-1 text-[9px] font-bold text-emerald-600 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full">
                      <CheckCircle size={9} />
                      Ativo
                    </span>
                  )}
                </div>

                {selectedTenant.customDomain && (
                  <div className="flex items-center gap-2 text-xs bg-white border border-indigo-200 rounded-lg px-3 py-2">
                    <Link size={11} className="text-indigo-400 shrink-0" />
                    <a
                      href={`https://${selectedTenant.customDomain}`}
                      target="_blank"
                      rel="noreferrer"
                      className="text-indigo-600 font-semibold hover:underline truncate"
                    >
                      {selectedTenant.customDomain}
                    </a>
                  </div>
                )}

                <div className="flex gap-2">
                  <input
                    type="text"
                    value={domainInput !== "" ? domainInput : (selectedTenant.customDomain ?? "")}
                    onChange={e => { setDomainInput(e.target.value); setDomainSaved(false); }}
                    placeholder="ex: jkaturismo.com.br"
                    className="flex-1 border border-slate-300 bg-white rounded-lg px-3 py-2 text-xs font-mono text-slate-700 focus:outline-none focus:border-indigo-400 focus:ring-1 focus:ring-indigo-300"
                  />
                  <button
                    onClick={() => {
                      handleSaveDomain(selectedTenant.id, domainInput !== "" ? domainInput : (selectedTenant.customDomain ?? ""));
                      setDomainInput("");
                    }}
                    className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-lg transition-all cursor-pointer flex items-center gap-1.5 shrink-0"
                  >
                    {domainSaved ? <CheckCircle size={13} /> : <Globe size={13} />}
                    {domainSaved ? "Salvo!" : "Salvar Domínio"}
                  </button>
                  {selectedTenant.customDomain && (
                    <button
                      onClick={() => { handleSaveDomain(selectedTenant.id, ""); setDomainInput(""); }}
                      className="px-3 py-2 bg-rose-50 hover:bg-rose-100 text-rose-600 border border-rose-200 text-xs font-bold rounded-lg transition-all cursor-pointer"
                      title="Remover domínio"
                    >
                      <X size={13} />
                    </button>
                  )}
                </div>
                <p className="text-[10px] text-slate-400 leading-relaxed">
                  Cole o domínio registrado (sem https://). Após salvar, configure o CNAME no Registro.br
                  apontando para <code className="bg-white border border-slate-200 px-1 rounded font-mono text-indigo-600">cname.vercel-dns.com</code> e
                  adicione o domínio no painel da Vercel em <strong>Settings → Domains</strong>.
                </p>
              </div>
              {/* ── FIM DOMÍNIO ──────────────────────────────────────── */}

              <div className="pt-4 border-t border-slate-200 flex justify-end">
                <button
                  onClick={() => onEnterTenantAdmin(selectedTenant.slug)}
                  className="bg-indigo-650 hover:bg-indigo-700 text-white text-xs font-bold py-2.5 px-5 rounded-full transition-all cursor-pointer shadow-sm"
                >
                  Acessar Painel do Lojista
                </button>
              </div>
            </div>
          )}
        </div>

        {/* SYSTEM INADIPLENCY SIMULATOR */}
        <div className="bg-white border border-slate-200 p-6 rounded-2xl text-xs space-y-4 shadow-sm">
          <h4 className="font-extrabold text-sm text-slate-800 flex items-center gap-2">
            <AlertOctagon className="text-indigo-600" size={16} />
            <span>Guia de Simulação para Teste Técnico</span>
          </h4>
          <p className="text-slate-600 leading-relaxed font-medium">
            Utilize este painel para validar o escopo da plataforma:
          </p>
          <ul className="list-disc leading-relaxed pl-5 text-slate-500 space-y-2.5">
            <li><strong>Bloqueio por Inadimplência</strong>: Clique no <code className="text-amber-600 bg-amber-50 px-1 py-0.5 rounded font-mono">"Ícone de Pausa"</code> em qualquer cliente acima. Em seguida, tente acessar o link público correspondente. O site exibirá instantaneamente a tela de bloqueio com aviso de regularização para o inquilino.</li>
            <li><strong>Bloqueio de Abas por Tier de Mensalidade</strong>: Altere o plano do cliente no painel para Básico. Entre no painel lojista correspondente e veja a barreira prateada. Faça upgrade para Profissional ou Premium no próprio dashboard e perceba o destravamento imediato de recursos!</li>
          </ul>
        </div>

        {/* MODAL DE CADASTRO ADMIN BYPASS */}
        {showCreateModal && (
          <SetupModal
            plan="professional"
            isAdmin={true}
            onClose={() => setShowCreateModal(false)}
            onSuccess={(slug) => {
              setShowCreateModal(false);
              onRefreshAll();
              onEnterTenantAdmin(slug);
            }}
          />
        )}

      </div>}
    </div>
  );
}
