/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
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
  MessageSquare
} from "lucide-react";
import { Tenant } from "../types";

interface SuperAdminPanelProps {
  tenants: Tenant[];
  onGoBack: () => void;
  onRefreshAll: () => void;
  onEnterTenantAdmin: (slug: string) => void;
}

export default function SuperAdminPanel({ tenants, onGoBack, onRefreshAll, onEnterTenantAdmin }: SuperAdminPanelProps) {
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [selectedTenantId, setSelectedTenantId] = useState<string | null>(null);
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
    try {
      const response = await fetch("/api/super/status", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tenantId, status: newStatus })
      });
      if (response.ok) {
        onRefreshAll();
      }
    } catch (e) {
      console.error(e);
    } finally {
      setUpdatingId(null);
    }
  };

  // Direct edit plan from super console
  const handleModifyPlan = async (tenantId: string, targetPlan: 'basic' | 'professional' | 'premium') => {
    setUpdatingId(tenantId);
    try {
      const response = await fetch("/api/super/status", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tenantId, plan: targetPlan })
      });
      if (response.ok) {
        onRefreshAll();
      }
    } catch (e) {
      console.error(e);
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
        onRefreshAll();
      } else {
        alert("Erro ao excluir o site.");
      }
    } catch (e) {
      console.error(e);
      alert("Erro ao excluir o site.");
    } finally {
      setUpdatingId(null);
    }
  };

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

      <div className="max-w-6xl mx-auto space-y-8">
        
        {/* WELCOME MAT */}
        <div className="space-y-1">
          <h1 className="text-2xl font-extrabold tracking-tight text-slate-800">Painel Administrativo global.</h1>
          <p className="text-xs text-slate-500">Controle assinaturas, analise o caixa recorrente global e gerencie congelamento/bloqueio por inadimplência em tempo real com isolamento de tenant.</p>
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
            <table className="w-full text-left font-sans border-collapse">
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
                        <div className="flex items-center justify-end gap-2.5">
                          {/* WhatsApp button */}
                          {tenant.socials.whatsapp && (
                            <a 
                              href={`https://wa.me/${tenant.socials.whatsapp.replace(/\D/g, "")}?text=${encodeURIComponent("A sua assinatura vence em 5 dias, após esse prazo você ainda tem mais 5 dias para realizar o pagamento. Evite o congelamento do seu sistema")}`}
                              target="_blank"
                              rel="noreferrer"
                              className="p-2 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 transition-all cursor-pointer"
                              title="Enviar lembrete de pagamento"
                            >
                              <MessageSquare size={14} />
                            </a>
                          )}

                          {/* Pause/Play trigger button */}
                          <button 
                            disabled={updatingId === tenant.id}
                            onClick={() => handleToggleStatus(tenant.id, tenant.status)}
                            className={`p-2 rounded-lg transition-all cursor-pointer ${
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
                            className="p-2 rounded-lg bg-rose-50 hover:bg-rose-500 hover:text-white text-rose-600 border border-rose-200 transition-all cursor-pointer"
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
                  <span className="text-slate-400 block font-bold uppercase text-[9px]">Data de Vencimento</span>
                  <p className="font-semibold text-slate-700">TODO: Implementar data vencimento</p>
                </div>
                <div className="col-span-2 md:col-span-1">
                  <span className="text-slate-400 block font-bold uppercase text-[9px]">Endereço do Site</span>
                  <p className="font-semibold text-indigo-600 truncate">sitealugado.com/{selectedTenant.slug}</p>
                </div>
              </div>
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

      </div>
    </div>
  );
}
