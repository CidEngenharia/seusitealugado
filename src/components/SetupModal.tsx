/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useCallback } from "react";
import {
  X, Check, Loader2, AlertCircle, CheckCircle, Globe,
  Phone, Mail, Building2, Layout, Sparkles, ArrowRight,
  ArrowLeft, Rocket, MapPin, Clock, Lock, Key, Eye, EyeOff,
  Copy, ShieldCheck
} from "lucide-react";

interface SetupModalProps {
  plan: "basic" | "professional" | "premium";
  onClose: () => void;
  onSuccess: (slug: string) => void;
}

// Categorias de negócio sincronizadas com a Landing Page
const CATEGORIES = [
  { id: "barbearia", label: "✂️ Barbearia" },
  { id: "salao_beleza", label: "💅 Salão de Beleza" },
  { id: "estetica", label: "✨ Estética & Spa" },
  { id: "oficina", label: "🔧 Oficina Mecânica" },
  { id: "lava_jato", label: "🚗 Lava-jato" },
  { id: "manicure", label: "💅 Manicure / Pedicure" },
  { id: "maquiadora", label: "💄 Maquiadora" },
  { id: "personal_trainer", label: "🏋️ Personal Trainer" },
  { id: "doceria", label: "🎂 Doceria / Confeitaria" },
  { id: "acaiteria", label: "🍇 Açaíteria" },
  { id: "loja", label: "🛍️ Loja / Comércio" },
  { id: "buffet", label: "🎉 Buffet / Eventos" },
  { id: "chaveiro", label: "🔑 Chaveiro" },
  { id: "eletricista", label: "⚡ Eletricista" },
  { id: "som_automotivo", label: "🔊 Som Automotivo" },
  { id: "dedetizacao", label: "🪲 Dedetização" },
  { id: "outro", label: "🏪 Outro Serviço" },
];

// Defaults de layout por categoria
const CATEGORY_DEFAULTS: Record<string, { themeColor: string; template: string; accent: string }> = {
  barbearia:       { themeColor: "amber",   template: "modern",  accent: "Corte, barba e estilo" },
  salao_beleza:    { themeColor: "rose",    template: "modern",  accent: "Cabelo, beleza e transformação" },
  estetica:        { themeColor: "purple",  template: "minimal", accent: "Tratamentos faciais e corporais" },
  oficina:         { themeColor: "blue",    template: "classic", accent: "Manutenção e reparo automotivo" },
  lava_jato:       { themeColor: "blue",    template: "classic", accent: "Limpeza e conservação do veículo" },
  manicure:        { themeColor: "pink",    template: "minimal", accent: "Unhas, esmalteria e beleza" },
  maquiadora:      { themeColor: "rose",    template: "minimal", accent: "Make profissional e beleza" },
  personal_trainer:{ themeColor: "green",   template: "modern",  accent: "Treino personalizado e saúde" },
  doceria:         { themeColor: "amber",   template: "classic", accent: "Doces artesanais e confeitaria" },
  acaiteria:       { themeColor: "purple",  template: "classic", accent: "Açaí, vitaminas e shakes" },
  loja:            { themeColor: "indigo",  template: "classic", accent: "Produtos e variedades" },
  buffet:          { themeColor: "amber",   template: "modern",  accent: "Eventos, festas e celebrações" },
  chaveiro:        { themeColor: "zinc",    template: "classic", accent: "Cópia de chaves e fechaduras" },
  eletricista:     { themeColor: "yellow",  template: "classic", accent: "Instalações e manutenção elétrica" },
  som_automotivo:  { themeColor: "blue",    template: "modern",  accent: "Som, multimídia e acessórios" },
  dedetizacao:     { themeColor: "green",   template: "classic", accent: "Controle de pragas e desinsetização" },
  outro:           { themeColor: "amber",   template: "modern",  accent: "Serviços profissionais" },
};

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

function generateRandomPassword(): string {
  const chars = "abcdefghjkmnpqrstuvwxyz23456789";
  let pass = "Site#";
  for (let i = 0; i < 6; i++) {
    pass += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return pass;
}

export default function SetupModal({ plan, onClose, onSuccess }: SetupModalProps) {
  const [step, setStep] = useState(1);

  // Step 1: Nicho & Empresa
  const [category, setCategory] = useState("");
  const [businessName, setBusinessName] = useState("");
  const [ownerName, setOwnerName] = useState("");

  // Step 2: Google Meu Negócio
  const [googleAddress, setGoogleAddress] = useState("");
  const [googleHours, setGoogleHours] = useState("Seg–Sex 08h–18h | Sáb 08h–13h");
  const [googleDescription, setGoogleDescription] = useState("");

  // Step 3: Tema & Telefone
  const [selectedTemplate, setSelectedTemplate] = useState("modern");
  const [themeColor, setThemeColor] = useState("amber");
  const [whatsapp, setWhatsapp] = useState("");

  // Step 4: Geração de Acesso e Credenciais
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState(generateRandomPassword());
  const [showPassword, setShowPassword] = useState(true);
  const [slug, setSlug] = useState("");
  const [slugStatus, setSlugStatus] = useState<"idle" | "checking" | "available" | "taken" | "invalid">("idle");

  // Step Final: Sucesso / Criando
  const [creating, setCreating] = useState(false);
  const [createError, setCreateError] = useState("");
  const [success, setSuccess] = useState(false);
  const [createdSlug, setCreatedSlug] = useState("");
  const [copiedCreds, setCopiedCreds] = useState(false);

  // Atualiza cores e sugestão de slug quando muda categoria ou nome da empresa
  useEffect(() => {
    if (category && CATEGORY_DEFAULTS[category]) {
      setThemeColor(CATEGORY_DEFAULTS[category].themeColor);
      setSelectedTemplate(CATEGORY_DEFAULTS[category].template);
    }
  }, [category]);

  useEffect(() => {
    if (businessName) {
      const auto = slugify(businessName);
      setSlug(auto);
    }
  }, [businessName]);

  // Preenche sugestão de descrição do Google Negócio se estiver vazia
  useEffect(() => {
    if (businessName && category && !googleDescription) {
      const catLabel = CATEGORIES.find(c => c.id === category)?.label?.replace(/^[\s\S]{0,3}/, "").trim() || category;
      setGoogleDescription(`${businessName} - Especialistas em ${catLabel}. Atendimento de qualidade e excelência.`);
    }
  }, [businessName, category, googleDescription]);

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
      setSlugStatus("available"); // Fallback gracioso
    }
  }, []);

  useEffect(() => {
    if (!slug) { setSlugStatus("idle"); return; }
    const timer = setTimeout(() => checkSlug(slug), 600);
    return () => clearTimeout(timer);
  }, [slug, checkSlug]);

  const handleCreate = async () => {
    setCreating(true);
    setCreateError("");
    const finalSlug = slugify(slug) || slugify(businessName) || `site-${Date.now()}`;

    const categoryDefaults = CATEGORY_DEFAULTS[category] || CATEGORY_DEFAULTS["outro"];
    const categoryLabel = CATEGORIES.find(c => c.id === category)?.label?.replace(/^[\s\S]{0,3}/, "").trim() || category;

    const newTenant = {
      id: "t-" + Date.now(),
      slug: finalSlug,
      name: businessName,
      ownerName,
      ownerEmail: email,
      ownerPassword: password,
      logoUrl: "",
      bannerUrl: "",
      themeColor: themeColor || categoryDefaults.themeColor,
      themeMode: "dark",
      fontFamily: "sans",
      template: selectedTemplate || categoryDefaults.template,
      description: googleDescription || `${businessName} — ${categoryLabel}. ${categoryDefaults.accent}.`,
      address: googleAddress,
      openingHours: googleHours,
      socials: { whatsapp, phone: whatsapp, email },
      mapLocation: googleAddress,
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

  const isStep1Valid = category !== "" && businessName.trim().length >= 2 && ownerName.trim().length >= 2;
  const isStep2Valid = googleAddress.trim().length >= 3;
  const isStep3Valid = whatsapp.trim().length >= 8;
  const isStep4Valid = email.trim().includes("@") && password.trim().length >= 4 && (slugStatus === "available" || slugStatus === "idle");

  // === Tela de Sucesso com Credenciais Geradas ===
  if (success) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/70 backdrop-blur-sm">
        <div className="bg-zinc-950 rounded-2xl sm:rounded-3xl p-5 sm:p-8 w-full max-w-lg max-h-[calc(100dvh-1.5rem)] sm:max-h-[calc(100dvh-2rem)] overflow-y-auto shadow-2xl border border-emerald-500/30 text-center space-y-6">
          <div className="w-16 h-16 mx-auto rounded-full bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center">
            <Rocket size={32} className="text-emerald-400" />
          </div>
          
          <div className="space-y-2">
            <h2 className="text-2xl font-black text-white">Site & Acesso Criados com Sucesso!</h2>
            <p className="text-xs text-zinc-400">
              Seu novo site já está no ar e seu acesso ao painel foi gerado.
            </p>
            <div className="bg-zinc-900 border border-emerald-500/30 rounded-xl px-4 py-2.5 mt-2">
              <span className="text-emerald-400 font-mono text-sm font-bold">
                seusitealugado.com/{createdSlug}
              </span>
            </div>
          </div>

          {/* Card de Credenciais de Acesso */}
          <div className="bg-zinc-900/90 border border-yellow-500/30 rounded-2xl p-4 text-left space-y-3 relative">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-black uppercase tracking-widest text-yellow-400 flex items-center gap-1.5">
                <ShieldCheck size={14} /> Credenciais de Acesso Geradas
              </span>
              <button
                type="button"
                onClick={() => {
                  navigator.clipboard.writeText(`E-mail: ${email}\nSenha: ${password}\nSite: seusitealugado.com/${createdSlug}`);
                  setCopiedCreds(true);
                  setTimeout(() => setCopiedCreds(false), 2000);
                }}
                className="flex items-center gap-1 text-[10px] font-bold text-zinc-400 hover:text-white bg-zinc-800 px-2.5 py-1 rounded-lg transition-colors cursor-pointer"
              >
                <Copy size={12} />
                {copiedCreds ? "Copiado!" : "Copiar Dados"}
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs font-mono">
              <div className="bg-zinc-950 p-2.5 rounded-xl border border-zinc-800">
                <span className="text-[9px] text-zinc-500 uppercase font-sans font-bold block mb-0.5">E-mail de Login</span>
                <span className="text-white font-bold truncate block">{email}</span>
              </div>
              <div className="bg-zinc-950 p-2.5 rounded-xl border border-zinc-800">
                <span className="text-[9px] text-zinc-500 uppercase font-sans font-bold block mb-0.5">Senha de Acesso</span>
                <span className="text-yellow-300 font-bold block">{password}</span>
              </div>
            </div>
            
            <p className="text-[10px] text-zinc-500">
              Guarde essas informações. Você pode alterar a senha a qualquer momento no seu painel.
            </p>
          </div>

          <div className="flex flex-col gap-2.5">
            <button
              onClick={() => onSuccess(createdSlug)}
              className="w-full py-3 bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-black rounded-xl text-sm transition-all active:scale-95 flex items-center justify-center gap-2 cursor-pointer"
            >
              Acessar Meu Painel Agora <ArrowRight size={16} />
            </button>
            <button
              onClick={onClose}
              className="w-full py-2.5 bg-zinc-900 border border-zinc-700 hover:bg-zinc-800 text-zinc-300 font-bold rounded-xl text-xs transition-all cursor-pointer"
            >
              Fechar
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/70 backdrop-blur-sm">
      <div className="bg-zinc-950 rounded-2xl sm:rounded-3xl w-full max-w-xl max-h-[calc(100dvh-1.5rem)] sm:max-h-[calc(100dvh-2rem)] overflow-hidden flex flex-col shadow-2xl border border-zinc-800">

        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-zinc-800 flex items-start justify-between gap-4 shrink-0">
          <div>
            <div className={`inline-flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest px-2.5 py-0.5 rounded-full border mb-1.5 ${PLAN_COLORS[plan]}`}>
              <Sparkles size={10} />
              {PLAN_LABELS[plan]} (Pagamento Confirmado)
            </div>
            <h2 className="text-lg font-black text-white">Cadastro do Novo Site</h2>
            <p className="text-xs text-zinc-400">Preencha as informações para colocarmos seu site no ar</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Fechar janela"
            className="text-zinc-500 hover:text-zinc-200 p-2 -m-2 transition-colors shrink-0"
          >
            <X size={20} />
          </button>
        </div>

        {/* Indicador de Passos */}
        <div className="px-4 sm:px-6 pt-3 shrink-0">
          <div className="flex items-center gap-1">
            {[1, 2, 3, 4].map((s) => (
              <div key={s} className="flex items-center gap-1 flex-1">
                <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-black shrink-0 transition-all ${
                  step > s ? "bg-emerald-500 text-zinc-950" :
                  step === s ? "bg-yellow-400 text-zinc-950" :
                  "bg-zinc-800 text-zinc-500"
                }`}>
                  {step > s ? <Check size={12} /> : s}
                </div>
                {s < 4 && <div className={`h-0.5 flex-1 rounded-full transition-all ${step > s ? "bg-emerald-500" : "bg-zinc-800"}`} />}
              </div>
            ))}
          </div>
          <div className="flex justify-between mt-1 text-[9px] text-zinc-500">
            <span>1. Nicho & Empresa</span>
            <span>2. Google Negócio</span>
            <span>3. Tema & Fone</span>
            <span>4. E-mail & Senha</span>
          </div>
        </div>

        {/* Conteúdo dos Passos */}
        <div className="flex-1 min-h-0 overflow-y-auto overscroll-contain p-4 sm:p-6 space-y-4">

          {/* === PASSO 1: Nicho & Nome da Empresa === */}
          {step === 1 && (
            <div className="space-y-4 animate-in fade-in duration-200">
              <h3 className="text-sm font-black text-white flex items-center gap-2">
                <Building2 size={16} className="text-yellow-400" />
                1. Escolha o Nicho e Nome do Negócio
              </h3>

              <div>
                <label className="block text-[10px] font-bold text-zinc-400 uppercase tracking-wider mb-1.5">
                  Selecione o Nicho do Seu Negócio *
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5 max-h-40 overflow-y-auto pr-1">
                  {CATEGORIES.map((cat) => (
                    <button
                      key={cat.id}
                      type="button"
                      onClick={() => setCategory(cat.id)}
                      className={`px-2.5 py-2 rounded-xl border text-left text-[11px] font-bold transition-all cursor-pointer ${
                        category === cat.id
                          ? "bg-yellow-400/20 border-yellow-400/60 text-yellow-300"
                          : "bg-zinc-900 border-zinc-700 text-zinc-300 hover:border-zinc-500 hover:text-white"
                      }`}
                    >
                      {cat.label}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-zinc-400 uppercase tracking-wider mb-1">
                  Nome da Empresa / Nome Comercial *
                </label>
                <input
                  type="text"
                  value={businessName}
                  onChange={(e) => setBusinessName(e.target.value)}
                  placeholder="Ex: Barbearia Luxo, Salão Bella..."
                  className="w-full px-3.5 py-2 bg-zinc-900 border border-zinc-700 rounded-xl text-white text-xs focus:outline-none focus:border-yellow-500/60 transition-colors placeholder:text-zinc-600"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-zinc-400 uppercase tracking-wider mb-1">
                  Seu Nome Completo (Responsável) *
                </label>
                <input
                  type="text"
                  value={ownerName}
                  onChange={(e) => setOwnerName(e.target.value)}
                  placeholder="Ex: Carlos Eduardo Silva"
                  className="w-full px-3.5 py-2 bg-zinc-900 border border-zinc-700 rounded-xl text-white text-xs focus:outline-none focus:border-yellow-500/60 transition-colors placeholder:text-zinc-600"
                />
              </div>
            </div>
          )}

          {/* === PASSO 2: Informações do Google Meu Negócio === */}
          {step === 2 && (
            <div className="space-y-4 animate-in fade-in duration-200">
              <h3 className="text-sm font-black text-white flex items-center gap-2">
                <MapPin size={16} className="text-yellow-400" />
                2. Informações para o Google Meu Negócio
              </h3>

              <div>
                <label className="block text-[10px] font-bold text-zinc-400 uppercase tracking-wider mb-1">
                  Endereço Completo (para Google Negócio / Mapa) *
                </label>
                <input
                  type="text"
                  value={googleAddress}
                  onChange={(e) => setGoogleAddress(e.target.value)}
                  placeholder="Ex: Av. Sete de Setembro, 150 - Centro, Salvador - BA"
                  className="w-full px-3.5 py-2 bg-zinc-900 border border-zinc-700 rounded-xl text-white text-xs focus:outline-none focus:border-yellow-500/60 transition-colors placeholder:text-zinc-600"
                />
                <p className="text-[10px] text-zinc-500 mt-1">Este endereço será exibido no mapa do seu site e no Google Negócio.</p>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-zinc-400 uppercase tracking-wider mb-1">
                  Horário de Funcionamento
                </label>
                <div className="relative">
                  <Clock className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" size={14} />
                  <input
                    type="text"
                    value={googleHours}
                    onChange={(e) => setGoogleHours(e.target.value)}
                    placeholder="Ex: Seg–Sex 08h–18h | Sáb 08h–13h"
                    className="w-full pl-9 pr-3.5 py-2 bg-zinc-900 border border-zinc-700 rounded-xl text-white text-xs focus:outline-none focus:border-yellow-500/60 transition-colors placeholder:text-zinc-600"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-zinc-400 uppercase tracking-wider mb-1">
                  Descrição dos Serviços (Google Negócio)
                </label>
                <textarea
                  rows={3}
                  value={googleDescription}
                  onChange={(e) => setGoogleDescription(e.target.value)}
                  placeholder="Descreva resumidamente os serviços e diferenciais da sua empresa..."
                  className="w-full px-3.5 py-2 bg-zinc-900 border border-zinc-700 rounded-xl text-white text-xs focus:outline-none focus:border-yellow-500/60 transition-colors placeholder:text-zinc-600 resize-none"
                />
              </div>
            </div>
          )}

          {/* === PASSO 3: Tema Escolhido & Telefone === */}
          {step === 3 && (
            <div className="space-y-4 animate-in fade-in duration-200">
              <h3 className="text-sm font-black text-white flex items-center gap-2">
                <Layout size={16} className="text-yellow-400" />
                3. Tema e Telefone de Atendimento
              </h3>

              <div>
                <label className="block text-[10px] font-bold text-zinc-400 uppercase tracking-wider mb-1.5">
                  Telefone / WhatsApp de Atendimento *
                </label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" size={14} />
                  <input
                    type="tel"
                    value={whatsapp}
                    onChange={(e) => setWhatsapp(e.target.value)}
                    placeholder="Ex: 71 98418-4782"
                    className="w-full pl-9 pr-3.5 py-2 bg-zinc-900 border border-zinc-700 rounded-xl text-white text-xs focus:outline-none focus:border-yellow-500/60 transition-colors placeholder:text-zinc-600"
                  />
                </div>
                <p className="text-[10px] text-zinc-500 mt-1">Os botões do seu site enviarão as mensagens diretamente para este número.</p>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-zinc-400 uppercase tracking-wider mb-2">
                  Tema Visual Escolhido
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {TEMPLATES.map((tmpl) => (
                    <button
                      key={tmpl.id}
                      type="button"
                      onClick={() => setSelectedTemplate(tmpl.id)}
                      className={`p-3 rounded-xl border text-left flex flex-col justify-between transition-all cursor-pointer ${
                        selectedTemplate === tmpl.id
                          ? "bg-yellow-400/15 border-yellow-400 text-white"
                          : "bg-zinc-900 border-zinc-800 text-zinc-400 hover:border-zinc-700"
                      }`}
                    >
                      <div>
                        <span className="font-black text-xs block text-white">{tmpl.name}</span>
                        <span className="text-[9px] text-zinc-500 leading-tight block mt-1">{tmpl.description}</span>
                      </div>
                      {selectedTemplate === tmpl.id && (
                        <span className="text-[9px] font-bold text-yellow-400 mt-2 flex items-center gap-1">
                          <Check size={10} /> Selecionado
                        </span>
                      )}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* === PASSO 4: E-mail e Geração de Senha do Cliente === */}
          {step === 4 && (
            <div className="space-y-4 animate-in fade-in duration-200">
              <h3 className="text-sm font-black text-white flex items-center gap-2">
                <Key size={16} className="text-yellow-400" />
                4. Acesso ao Sistema e Link do Site
              </h3>

              <div>
                <label className="block text-[10px] font-bold text-zinc-400 uppercase tracking-wider mb-1">
                  E-mail de Acesso do Cliente *
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" size={14} />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Ex: contato@suaempresa.com"
                    className="w-full pl-9 pr-3.5 py-2 bg-zinc-900 border border-zinc-700 rounded-xl text-white text-xs focus:outline-none focus:border-yellow-500/60 transition-colors placeholder:text-zinc-600"
                  />
                </div>
                <p className="text-[10px] text-zinc-500 mt-1">Este e-mail será usado para fazer login no painel administrativo.</p>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">
                    Senha de Acesso do Cliente *
                  </label>
                  <button
                    type="button"
                    onClick={() => setPassword(generateRandomPassword())}
                    className="text-[10px] text-yellow-400 hover:text-yellow-300 font-bold flex items-center gap-1 cursor-pointer"
                  >
                    Gerar Senha Segura
                  </button>
                </div>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" size={14} />
                  <input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Senha de acesso"
                    className="w-full pl-9 pr-10 py-2 bg-zinc-900 border border-zinc-700 rounded-xl text-yellow-300 font-mono text-xs focus:outline-none focus:border-yellow-500/60 transition-colors"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-200 cursor-pointer"
                  >
                    {showPassword ? <EyeOff size={14} /> : <Eye size={14} />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-zinc-400 uppercase tracking-wider mb-1">
                  Link Subdomínio do Site
                </label>
                <div className="flex items-center gap-0 rounded-xl overflow-hidden border border-zinc-700">
                  <span className="px-3 py-2 bg-zinc-800 text-zinc-500 text-xs font-mono border-r border-zinc-700">
                    seusitealugado.com/
                  </span>
                  <input
                    type="text"
                    value={slug}
                    onChange={(e) => setSlug(slugify(e.target.value))}
                    placeholder="seusite"
                    className="flex-1 px-3 py-2 bg-zinc-900 text-white text-xs font-mono focus:outline-none"
                  />
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

        </div>

        {/* Botões de Navegação */}
        <div className="shrink-0 border-t border-zinc-800 bg-zinc-950 p-4 sm:px-6">
          <div className="flex flex-col-reverse sm:flex-row sm:items-center sm:justify-between gap-3">
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 bg-zinc-950 border border-zinc-700 text-zinc-400 font-bold rounded-xl text-xs hover:bg-zinc-900 hover:text-zinc-200 transition-all cursor-pointer"
              >
                Cancelar
              </button>
              {step > 1 && (
                <button
                  type="button"
                  onClick={() => setStep(step - 1)}
                  className="flex items-center gap-1.5 px-4 py-2 bg-zinc-900 border border-zinc-700 text-zinc-300 font-bold rounded-xl text-xs hover:bg-zinc-800 transition-all cursor-pointer"
                >
                  <ArrowLeft size={13} /> Voltar
                </button>
              )}
            </div>

            {step < 4 ? (
              <button
                type="button"
                disabled={
                  (step === 1 && !isStep1Valid) ||
                  (step === 2 && !isStep2Valid) ||
                  (step === 3 && !isStep3Valid)
                }
                onClick={() => setStep(step + 1)}
                className="flex items-center justify-center gap-1.5 px-5 py-2.5 bg-yellow-400 hover:bg-yellow-300 text-zinc-950 font-black rounded-xl text-xs transition-all active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
              >
                Avançar <ArrowRight size={13} />
              </button>
            ) : (
              <button
                type="button"
                disabled={!isStep4Valid || creating}
                onClick={handleCreate}
                className="flex items-center justify-center gap-1.5 px-5 py-2.5 bg-emerald-400 hover:bg-emerald-300 text-zinc-950 font-black rounded-xl text-xs transition-all active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
              >
                {creating ? (
                  <><Loader2 size={13} className="animate-spin" /> Gerando Site e Acesso...</>
                ) : (
                  <><Rocket size={13} /> Finalizar e Gerar Acesso</>
                )}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
