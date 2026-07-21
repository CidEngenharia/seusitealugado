import React, { useState } from "react";
import { X, Lock, Mail, AlertCircle, Loader2, Eye, EyeOff, Building2 } from "lucide-react";
import { Tenant } from "../types";

// Lista de categorias sincronizada com a Landing Page
const SIGNUP_CATEGORIES = [
  { id: "barbearia", label: "✂️ Barbearia" },
  { id: "salao_beleza", label: "💅 Salão de Beleza" },
  { id: "oficina", label: "🔧 Oficina Mecânica" },
  { id: "lava_jato", label: "🚗 Lava-jato" },
  { id: "estetica", label: "✨ Estética & Spa" },
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

// ── Super admins hardcoded (sem backend de autenticação real ainda) ──
const SUPER_ADMIN_CREDENTIALS: Record<string, string> = {
  "admin@seusitealugado.com": "14011401Sidney",
  "sidney.sales@gmail.com":   "14011401Sidney",
};

// Senha padrão provisória para tenants (até migrar para Supabase Auth)
const TENANT_DEFAULT_PASSWORD = "admin123";

interface AuthModalProps {
  tenants: Tenant[];
  onClose: () => void;
  /** role + slug do tenant (null para superadmin) */
  onLogin: (role: "superadmin" | "tenantadmin", tenantSlug: string | null) => void;
}

export default function AuthModal({ tenants, onClose, onLogin }: AuthModalProps) {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail]     = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError]     = useState("");
  const [loading, setLoading] = useState(false);

  // ── Novo cadastro ──
  const [newName, setNewName]         = useState("");
  const [newPhone, setNewPhone]       = useState("");
  const [newCategory, setNewCategory] = useState("");

  const handleLogin = async () => {
    setError("");
    if (!email.trim() || !password.trim()) {
      setError("Preencha e-mail e senha.");
      return;
    }

    setLoading(true);
    // Simula latência de rede (remover quando Supabase Auth estiver ativo)
    await new Promise((r) => setTimeout(r, 600));

    // 1️⃣ Verifica super admin
    if (SUPER_ADMIN_CREDENTIALS[email.toLowerCase()] !== undefined) {
      if (password === SUPER_ADMIN_CREDENTIALS[email.toLowerCase()]) {
        setLoading(false);
        onLogin("superadmin", null);
        return;
      } else {
        setLoading(false);
        setError("Senha incorreta.");
        return;
      }
    }

    // 2️⃣ Verifica tenant admin pelo ownerEmail
    const matchedTenant = tenants.find(
      (t) => t.ownerEmail.toLowerCase() === email.toLowerCase()
    );

    if (matchedTenant) {
      if (password === TENANT_DEFAULT_PASSWORD) {
        setLoading(false);
        onLogin("tenantadmin", matchedTenant.slug);
        return;
      } else {
        setLoading(false);
        setError("Senha incorreta. Use a senha fornecida no cadastro.");
        return;
      }
    }

    // 3️⃣ E-mail não encontrado
    setLoading(false);
    setError("E-mail não encontrado. Verifique ou crie uma conta.");
  };

  const handleRegister = async () => {
    setError("");
    if (!newCategory) {
      setError("Selecione o segmento do seu negócio.");
      return;
    }
    setLoading(true);
    await new Promise((r) => setTimeout(r, 400));
    setLoading(false);
    setError("O formulário de cadastro do site é liberado automaticamente após a escolha do plano e pagamento. Selecione o plano ideal abaixo para iniciar.");
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="bg-zinc-950 rounded-2xl p-8 w-full max-w-md shadow-2xl relative border border-yellow-500/30">
        
        {/* Fechar */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-zinc-500 hover:text-zinc-200 transition-colors"
        >
          <X size={20} />
        </button>

        {/* Título */}
        <h2 className="text-2xl font-black text-white mb-1 text-center">
          {isLogin ? "Entrar na conta" : "Criar nova conta"}
        </h2>
        <p className="text-xs text-zinc-500 text-center mb-6">
          {isLogin
            ? "Acesse o painel do seu site"
            : "Escolha seu segmento e contratante"}
        </p>

        <div className="space-y-4">
          {/* Nome (somente cadastro) */}
          {!isLogin && (
            <div className="relative">
              <input
                type="text"
                placeholder="Seu nome completo"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                className="w-full pl-4 pr-4 py-2.5 bg-zinc-900 border border-zinc-700 rounded-xl text-white text-sm focus:outline-none focus:border-yellow-500/60 transition-colors placeholder:text-zinc-500"
              />
            </div>
          )}

          {/* E-mail */}
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" size={16} />
            <input
              type="email"
              placeholder="E-mail"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && isLogin && handleLogin()}
              className="w-full pl-9 pr-4 py-2.5 bg-zinc-900 border border-zinc-700 rounded-xl text-white text-sm focus:outline-none focus:border-yellow-500/60 transition-colors placeholder:text-zinc-500"
            />
          </div>

          {/* Senha */}
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" size={16} />
            <input
              type={showPassword ? "text" : "password"}
              placeholder="Senha"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && isLogin && handleLogin()}
              className="w-full pl-9 pr-10 py-2.5 bg-zinc-900 border border-zinc-700 rounded-xl text-white text-sm focus:outline-none focus:border-yellow-500/60 transition-colors placeholder:text-zinc-500"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-200 transition-colors cursor-pointer"
              title={showPassword ? "Ocultar senha" : "Exibir senha"}
            >
              {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>

          {/* Categoria (somente cadastro) */}
          {!isLogin && (
            <div className="space-y-2">
              <label className="flex items-center gap-1.5 text-[10px] font-bold text-zinc-400 uppercase tracking-wider">
                <Building2 size={11} />
                Segmento do Negócio (Nicho)
              </label>
              <div className="grid grid-cols-2 gap-1.5 max-h-36 overflow-y-auto pr-1">
                {SIGNUP_CATEGORIES.map((cat) => (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => { setNewCategory(cat.id); setError(""); }}
                    className={`px-2.5 py-2 rounded-xl border text-left text-[11px] font-medium transition-all cursor-pointer ${
                      newCategory === cat.id
                        ? "bg-yellow-400/15 border-yellow-400/50 text-yellow-300"
                        : "bg-zinc-800 border-zinc-700 text-zinc-300 hover:border-zinc-500 hover:text-white"
                    }`}
                  >
                    {cat.label}
                  </button>
                ))}
              </div>
              {!newCategory && (
                <p className="text-[10px] text-zinc-500">Selecione o nicho do seu negócio para assinar</p>
              )}
            </div>
          )}

          {/* Aviso quando em modo cadastro */}
          {!isLogin && (
            <div className="bg-yellow-400/10 border border-yellow-500/30 rounded-xl p-3 text-xs text-yellow-200/90 space-y-2">
              <p className="font-semibold text-yellow-300 text-[11px]">Liberado após contratação do plano:</p>
              <p className="text-[11px] leading-relaxed text-zinc-300">
                O formulário completo para cadastro do site (dados da empresa, Google Negócio, tema e telefone) e geração do e-mail/senha de acesso é ativado após a confirmação do pagamento do seu plano.
              </p>
              <button
                type="button"
                onClick={() => {
                  onClose();
                  const el = document.getElementById("planos");
                  if (el) el.scrollIntoView({ behavior: "smooth" });
                }}
                className="w-full py-2 bg-yellow-400 hover:bg-yellow-300 text-zinc-950 font-black rounded-lg text-xs transition-all text-center mt-1"
              >
                Ver Planos e Contratar
              </button>
            </div>
          )}

          {/* Mensagem de erro */}
          {error && (
            <div className="flex items-start gap-2 bg-red-500/10 border border-red-500/30 rounded-xl px-3 py-2.5 text-red-400 text-xs">
              <AlertCircle size={14} className="mt-0.5 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Botão principal */}
          {isLogin && (
            <button
              onClick={handleLogin}
              disabled={loading}
              className="w-full bg-yellow-400 text-black py-3 rounded-xl font-black text-sm hover:bg-yellow-500 transition-all active:scale-95 disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading ? <Loader2 size={16} className="animate-spin" /> : "Entrar"}
            </button>
          )}
        </div>

        {/* Alternar Login / Cadastro */}
        <p className="mt-5 text-center text-xs text-zinc-500">
          {isLogin ? "Não possui uma conta?" : "Já possui uma conta?"}
          <button
            onClick={() => { setIsLogin(!isLogin); setError(""); }}
            className="text-yellow-400 font-black ml-1 hover:text-yellow-300 transition-colors"
          >
            {isLogin ? "Criar nova conta" : "Entrar no sistema"}
          </button>
        </p>
      </div>
    </div>
  );
}
