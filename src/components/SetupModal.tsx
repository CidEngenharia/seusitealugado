/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useCallback } from "react";
import {
  X, Check, Loader2, AlertCircle, CheckCircle, Globe,
  Phone, Mail, Building2, Layout, Sparkles, ArrowRight,
  ArrowLeft, Rocket
} from "lucide-react";

interface SetupModalProps {
  plan: "basic" | "professional" | "premium";
  onClose: () => void;
  onSuccess: (slug: string) => void;
}

// Categorias de negócio disponíveis
const CATEGORIES = [
  { id: "barbearia", label: "Barbearia" },
  { id: "salao_beleza", label: "Salão de Beleza" },
  { id: "estetica", label: "Estética & Spa" },
  { id: "oficina", label: "Oficina Mecânica" },
  { id: "manicure", label: "Manicure / Pedicure" },
  { id: "personal_trainer", label: "Personal Trainer" },
  { id: "lava_jato", label: "Lava-jato" },
  { id: "doceria", label: "Doceria / Confeitaria" },
  { id: "acaiteria", label: "Açaíteria" },
  { id: "loja", label: "Loja / Comércio" },
  { id: "buffet", label: "Buffet / Eventos" },
  { id: "maquiadora", label: "Maquiadora" },
  { id: "chaveiro", label: "Chaveiro" },
  { id: "eletricista", label: "Eletricista" },
  { id: "outro", label: "Outro Serviço" },
];

// Templates disponíveis por plano
const TEMPLATES = [
  {
    id: "modern",
    name: "Modern",
    description: "Layout bento grid com cards arredondados, animações suaves e visual futurista.",
    plans: ["basic", "professional", "premium"],
    preview: "bg-gradient-to-br from-zinc-900 to-zinc-800",
    accent: "from-indigo-500 to-purple-500",
    badge: "bg-indigo-500/20 text-indigo-400 border-indigo-500/30",
  },
  {
    id: "classic",
    name: "Classic",
    description: "Layout clássico de duas colunas, limpo e profissional. Ideal para qualquer negócio.",
    plans: ["basic", "professional", "premium"],
    preview: "bg-gradient-to-br from-zinc-800 to-zinc-900",
    accent: "from-amber-500 to-orange-500",
    badge: "bg-amber-500/20 text-amber-400 border-amber-500/30",
  },
  {
    id: "minimal",
    name: "Minimal",
    description: "Design ultra-minimalista com foco em clareza e velocidade de carregamento.",
    plans: ["professional", "premium"],
    preview: "bg-gradient-to-br from-zinc-950 to-zinc-900",
    accent: "from-rose-500 to-pink-500",
    badge: "bg-rose-500/20 text-rose-400 border-rose-500/30",
  },
];

const PLAN_LABELS: Record<string, string> = {
  basic: "Plano Básico",
  professional: "Plano Profissional",
  premium: "Plano Premium",
};

const PLAN_COLORS: Record<string, string> = {
  basic: "text-emerald-400 border-emerald-500/30 bg-emerald-500/10",
  professional: "text-blue-400 border-blue-500/30 bg-blue-500/10",
  premium: "text-amber-400 border-amber-500/30 bg-amber-500/10",
};

function slugify(text: string): string {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9\s\-]/g, "")
    .replace(/\s+/g, "")
    .trim();
}

export default function SetupModal({ plan, onClose, onSuccess }: SetupModalProps) {
  const [step, setStep] = useState(1);

  // Step 1 — dados básicos
  const [businessName, setBusinessName] = useState("");
  const [category, setCategory] = useState("");
  const [ownerName, setOwnerName] = useState("");

  // Step 2 — contato
  const [whatsapp, setWhatsapp] = useState("");
  const [email, setEmail] = useState("");

  // Step 3 — slug e template
  const [slug, setSlug] = useState("");
  const [slugStatus, setSlugStatus] = useState<"idle" | "checking" | "available" | "taken" | "invalid">("idle");
  const [selectedTemplate, setSelectedTemplate] = useState("modern");

  // Step 4 — criando
  const [creating, setCreating] = useState(false);
  const [createError, setCreateError] = useState("");
  const [success, setSuccess] = useState(false);
  const [createdSlug, setCreatedSlug] = useState("");

  // Auto-gera slug a partir do nome
  useEffect(() => {
    if (businessName) {
      const auto = slugify(businessName);
      setSlug(auto);
    }
  }, [businessName]);

  // Verifica disponibilidade do slug com debounce
  const checkSlug = useCallback(async (value: string) => {
    const clean = slugify(value);
    if (!clean || clean.length < 3) {
      setSlugStatus("invalid");
      return;
    }
    setSlugStatus("checking");
    try {
      const res = await fetch(`/api/check-slug/${clean}`);
      const data = await res.json();
      setSlugStatus(data.available ? "available" : "taken");
    } catch {
      setSlugStatus("idle");
    }
  }, []);

  useEffect(() => {
    if (!slug) { setSlugStatus("idle"); return; }
    const timer = setTimeout(() => checkSlug(slug), 600);
    return () => clearTimeout(timer);
  }, [slug, checkSlug]);

  const availableTemplates = TEMPLATES.filter(t => t.plans.includes(plan));

  const handleCreate = async () => {
    setCreating(true);
    setCreateError("");
    const finalSlug = slugify(slug);

    const newTenant = {
      id: "t-" + Date.now(),
      slug: finalSlug,
      name: businessName,
      ownerName,
      ownerEmail: email,
      logoUrl: "",
      bannerUrl: "",
      themeColor: "amber",
      themeMode: "dark",
      fontFamily: "sans",
      template: selectedTemplate,
      description: `${businessName} — ${CATEGORIES.find(c => c.id === category)?.label || category}`,
      address: "",
      openingHours: "Seg–Sex 08h–18h",
      socials: { whatsapp, phone: whatsapp, email },
      mapLocation: "",
      fidelityProgram: { type: "points", rate: 1, rule: "1 ponto por real gasto" },
      plan,
      status: "active",
      createdAt: new Date().toISOString(),
      planExpiration: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
      services: [],
      crmClients: [],
      bookings: [],
      finance: { entries: [], payables: [], receivables: [] },
      inventory: [],
      marketingCampaigns: [],
      reviews: [],
      productsToSell: [],
    };

    try {
      const res = await fetch("/api/tenants", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newTenant),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Erro ao criar o site");
      }

      setCreatedSlug(finalSlug);
      setSuccess(true);
    } catch (err: any) {
      setCreateError(err.message || "Erro desconhecido ao criar o site.");
    } finally {
      setCreating(false);
    }
  };

  const isStep1Valid = businessName.trim().length >= 2 && category && ownerName.trim().length >= 2;
  const isStep2Valid = whatsapp.trim().length >= 9 && email.trim().includes("@");
  const isStep3Valid = slugStatus === "available" && selectedTemplate;

  // === Tela de Sucesso ===
  if (success) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
        <div className="bg-zinc-950 rounded-3xl p-8 w-full max-w-md shadow-2xl border border-emerald-500/30 text-center space-y-6">
          <div className="w-20 h-20 mx-auto rounded-full bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center">
            <Rocket size={36} className="text-emerald-400" />
          </div>
          <div className="space-y-2">
            <h2 className="text-2xl font-black text-white">Site Criado!</h2>
            <p className="text-sm text-zinc-400">
              Seu site profissional está pronto e disponível em:
            </p>
            <div className="bg-zinc-900 border border-emerald-500/20 rounded-xl px-4 py-3 mt-2">
              <span className="text-emerald-400 font-mono text-sm font-bold">
                seusitealugado.com/{createdSlug}
              </span>
            </div>
          </div>

          <div className="bg-zinc-900/60 border border-zinc-800 rounded-xl p-4 text-xs text-zinc-400 text-left space-y-1.5">
            <p className="text-white font-bold text-[11px] uppercase tracking-wider mb-2">Próximos Passos</p>
            <p>✅ Acesse o painel para cadastrar seus serviços</p>
            <p>✅ Adicione sua logo e banner personalizado</p>
            <p>✅ Configure seu WhatsApp e endereço completo</p>
            <p>✅ Compartilhe o link com seus clientes</p>
          </div>

          <div className="flex flex-col gap-3">
            <button
              onClick={() => onSuccess(createdSlug)}
              className="w-full py-3 bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-black rounded-xl text-sm transition-all active:scale-95"
            >
              Acessar Meu Painel Agora
            </button>
            <button
              onClick={onClose}
              className="w-full py-2.5 bg-zinc-900 border border-zinc-700 hover:bg-zinc-800 text-zinc-300 font-bold rounded-xl text-xs transition-all"
            >
              Fechar
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm overflow-y-auto">
      <div className="bg-zinc-950 rounded-3xl w-full max-w-lg shadow-2xl border border-zinc-800 my-4">

        {/* Header */}
        <div className="p-6 border-b border-zinc-800 flex items-start justify-between">
          <div>
            <div className={`inline-flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest px-2.5 py-1 rounded-full border mb-2 ${PLAN_COLORS[plan]}`}>
              <Sparkles size={10} />
              {PLAN_LABELS[plan]}
            </div>
            <h2 className="text-xl font-black text-white">Configure seu Site</h2>
            <p className="text-xs text-zinc-500 mt-1">Preencha os dados para criar sua presença digital</p>
          </div>
          <button onClick={onClose} className="text-zinc-500 hover:text-zinc-200 p-1 transition-colors shrink-0">
            <X size={20} />
          </button>
        </div>

        {/* Progress Indicator */}
        <div className="px-6 pt-4">
          <div className="flex items-center gap-1">
            {[1, 2, 3].map((s) => (
              <div key={s} className="flex items-center gap-1 flex-1">
                <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-black shrink-0 transition-all ${
                  step > s ? "bg-emerald-500 text-zinc-950" :
                  step === s ? "bg-yellow-400 text-zinc-950" :
                  "bg-zinc-800 text-zinc-500"
                }`}>
                  {step > s ? <Check size={12} /> : s}
                </div>
                {s < 3 && <div className={`h-0.5 flex-1 rounded-full transition-all ${step > s ? "bg-emerald-500" : "bg-zinc-800"}`} />}
              </div>
            ))}
          </div>
          <div className="flex justify-between mt-1">
            <span className="text-[9px] text-zinc-500">Dados</span>
            <span className="text-[9px] text-zinc-500">Contato</span>
            <span className="text-[9px] text-zinc-500">Site</span>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4">

          {/* === STEP 1: Dados Básicos === */}
          {step === 1 && (
            <div className="space-y-4 animate-in fade-in duration-200">
              <h3 className="text-sm font-black text-white flex items-center gap-2">
                <Building2 size={16} className="text-yellow-400" />
                Dados do Negócio
              </h3>

              <div>
                <label className="block text-[10px] font-bold text-zinc-400 uppercase tracking-wider mb-1.5">
                  Nome da Empresa / Negócio
                </label>
                <input
                  type="text"
                  value={businessName}
                  onChange={(e) => setBusinessName(e.target.value)}
                  placeholder="Ex: Barbearia do Keu, Salão da Julie..."
                  className="w-full px-4 py-2.5 bg-zinc-900 border border-zinc-700 rounded-xl text-white text-sm focus:outline-none focus:border-yellow-500/60 transition-colors placeholder:text-zinc-600"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-zinc-400 uppercase tracking-wider mb-1.5">
                  Seu Nome Completo (Proprietário)
                </label>
                <input
                  type="text"
                  value={ownerName}
                  onChange={(e) => setOwnerName(e.target.value)}
                  placeholder="Ex: João da Silva"
                  className="w-full px-4 py-2.5 bg-zinc-900 border border-zinc-700 rounded-xl text-white text-sm focus:outline-none focus:border-yellow-500/60 transition-colors placeholder:text-zinc-600"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-zinc-400 uppercase tracking-wider mb-1.5">
                  Segmento / Categoria
                </label>
                <div className="grid grid-cols-2 gap-2 max-h-48 overflow-y-auto pr-1">
                  {CATEGORIES.map((cat) => (
                    <button
                      key={cat.id}
                      type="button"
                      onClick={() => setCategory(cat.id)}
                      className={`px-3 py-2 rounded-xl border text-left text-xs font-bold transition-all ${
                        category === cat.id
                          ? "bg-yellow-400/10 border-yellow-400/40 text-yellow-300"
                          : "bg-zinc-900 border-zinc-700 text-zinc-300 hover:border-zinc-600"
                      }`}
                    >
                      {cat.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* === STEP 2: Contato === */}
          {step === 2 && (
            <div className="space-y-4 animate-in fade-in duration-200">
              <h3 className="text-sm font-black text-white flex items-center gap-2">
                <Phone size={16} className="text-yellow-400" />
                Dados de Contato
              </h3>

              <div>
                <label className="block text-[10px] font-bold text-zinc-400 uppercase tracking-wider mb-1.5">
                  WhatsApp (com DDD)
                </label>
                <input
                  type="tel"
                  value={whatsapp}
                  onChange={(e) => setWhatsapp(e.target.value)}
                  placeholder="Ex: 71984184782"
                  className="w-full px-4 py-2.5 bg-zinc-900 border border-zinc-700 rounded-xl text-white text-sm focus:outline-none focus:border-yellow-500/60 transition-colors placeholder:text-zinc-600"
                />
                <p className="text-[10px] text-zinc-500 mt-1">Usado para contato dos clientes e suporte da plataforma</p>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-zinc-400 uppercase tracking-wider mb-1.5">
                  E-mail do Proprietário
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Ex: seunegocio@email.com"
                  className="w-full px-4 py-2.5 bg-zinc-900 border border-zinc-700 rounded-xl text-white text-sm focus:outline-none focus:border-yellow-500/60 transition-colors placeholder:text-zinc-600"
                />
                <p className="text-[10px] text-zinc-500 mt-1">Este e-mail será usado para acessar o painel administrativo</p>
              </div>

              <div className="bg-zinc-900/60 border border-zinc-800 rounded-xl p-3 text-xs text-zinc-400 space-y-1">
                <p className="font-bold text-zinc-300 text-[11px]">Senha de acesso inicial:</p>
                <p>A senha padrão para entrar no painel é <span className="font-mono text-yellow-400 bg-yellow-400/10 px-1.5 py-0.5 rounded">admin123</span></p>
                <p className="text-zinc-500">Você poderá alterá-la no painel administrativo.</p>
              </div>
            </div>
          )}

          {/* === STEP 3: Subdomínio e Template === */}
          {step === 3 && (
            <div className="space-y-5 animate-in fade-in duration-200">
              <div>
                <h3 className="text-sm font-black text-white flex items-center gap-2 mb-3">
                  <Globe size={16} className="text-yellow-400" />
                  Endereço do Site (Subdomínio)
                </h3>
                <div className="flex items-center gap-0 rounded-xl overflow-hidden border border-zinc-700 focus-within:border-yellow-500/60 transition-colors">
                  <span className="px-3 py-2.5 bg-zinc-800 text-zinc-500 text-xs font-mono shrink-0 border-r border-zinc-700">
                    seusitealugado.com/
                  </span>
                  <input
                    type="text"
                    value={slug}
                    onChange={(e) => setSlug(slugify(e.target.value))}
                    placeholder="seuslug"
                    className="flex-1 px-3 py-2.5 bg-zinc-900 text-white text-sm focus:outline-none font-mono placeholder:text-zinc-600"
                  />
                  <div className="px-3 shrink-0">
                    {slugStatus === "checking" && <Loader2 size={14} className="text-zinc-400 animate-spin" />}
                    {slugStatus === "available" && <CheckCircle size={14} className="text-emerald-400" />}
                    {slugStatus === "taken" && <AlertCircle size={14} className="text-red-400" />}
                    {slugStatus === "invalid" && <AlertCircle size={14} className="text-amber-400" />}
                  </div>
                </div>
                {slugStatus === "available" && (
                  <p className="text-[10px] text-emerald-400 mt-1.5 flex items-center gap-1">
                    <Check size={10} /> Disponível! Este endereço está livre.
                  </p>
                )}
                {slugStatus === "taken" && (
                  <p className="text-[10px] text-red-400 mt-1.5 flex items-center gap-1">
                    <AlertCircle size={10} /> Este endereço já está em uso. Tente outro.
                  </p>
                )}
                {slugStatus === "invalid" && (
                  <p className="text-[10px] text-amber-400 mt-1.5">
                    Use pelo menos 3 letras (apenas letras, números e hífen)
                  </p>
                )}
              </div>

              <div>
                <h3 className="text-sm font-black text-white flex items-center gap-2 mb-3">
                  <Layout size={16} className="text-yellow-400" />
                  Escolha o Layout Visual
                </h3>
                <div className="space-y-3">
                  {availableTemplates.map((tmpl) => (
                    <button
                      key={tmpl.id}
                      type="button"
                      onClick={() => setSelectedTemplate(tmpl.id)}
                      className={`w-full p-4 rounded-2xl border text-left transition-all ${
                        selectedTemplate === tmpl.id
                          ? "border-yellow-400/50 bg-yellow-400/5"
                          : "border-zinc-800 bg-zinc-900/60 hover:border-zinc-700"
                      }`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <div className={`w-8 h-8 rounded-lg bg-gradient-to-br ${tmpl.accent} flex items-center justify-center`}>
                            <Layout size={14} className="text-white" />
                          </div>
                          <span className="font-black text-white text-sm">{tmpl.name}</span>
                        </div>
                        <div className={`text-[9px] font-bold px-2 py-0.5 rounded-full border ${tmpl.badge}`}>
                          {selectedTemplate === tmpl.id ? "Selecionado" : "Selecionar"}
                        </div>
                      </div>
                      <p className="text-[11px] text-zinc-400 leading-relaxed">{tmpl.description}</p>
                    </button>
                  ))}
                  {plan === "basic" && (
                    <p className="text-[10px] text-zinc-500 text-center">
                      O template Minimal está disponível apenas nos planos Profissional e Premium.
                    </p>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Erro de criação */}
          {createError && (
            <div className="flex items-start gap-2 bg-red-500/10 border border-red-500/30 rounded-xl px-3 py-2.5 text-red-400 text-xs">
              <AlertCircle size={14} className="mt-0.5 shrink-0" />
              <span>{createError}</span>
            </div>
          )}

          {/* Botões de navegação */}
          <div className="flex items-center justify-between pt-2 gap-3">
            {step > 1 ? (
              <button
                type="button"
                onClick={() => setStep(step - 1)}
                className="flex items-center gap-1.5 px-4 py-2.5 bg-zinc-900 border border-zinc-700 text-zinc-300 font-bold rounded-xl text-xs hover:bg-zinc-800 transition-all"
              >
                <ArrowLeft size={13} /> Voltar
              </button>
            ) : (
              <div />
            )}

            {step < 3 ? (
              <button
                type="button"
                disabled={
                  (step === 1 && !isStep1Valid) ||
                  (step === 2 && !isStep2Valid)
                }
                onClick={() => setStep(step + 1)}
                className="flex items-center gap-1.5 px-5 py-2.5 bg-yellow-400 hover:bg-yellow-300 text-zinc-950 font-black rounded-xl text-xs transition-all active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed"
              >
                Avançar <ArrowRight size={13} />
              </button>
            ) : (
              <button
                type="button"
                disabled={!isStep3Valid || creating}
                onClick={handleCreate}
                className="flex items-center gap-1.5 px-5 py-2.5 bg-yellow-400 hover:bg-yellow-300 text-zinc-950 font-black rounded-xl text-xs transition-all active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed"
              >
                {creating ? (
                  <><Loader2 size={13} className="animate-spin" /> Criando...</>
                ) : (
                  <><Rocket size={13} /> Criar Meu Site</>
                )}
              </button>
            )}
          </div>

        </div>
      </div>
    </div>
  );
}
