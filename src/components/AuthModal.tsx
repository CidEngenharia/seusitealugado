import React, { useState } from "react";
import { X, Lock, Mail, AlertCircle, Loader2, Eye, EyeOff } from "lucide-react";
import { Tenant } from "../types";

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
    if (!newName.trim() || !email.trim() || !password.trim() || !newCategory) {
      setError("Preencha todos os campos para se cadastrar.");
      return;
    }
    setLoading(true);
    await new Promise((r) => setTimeout(r, 800));
    setLoading(false);
    // Por ora: informa que o cadastro é feito pelo admin
    setError("Novos cadastros são realizados pelo administrador da plataforma. Entre em contato via WhatsApp.");
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
          {isLogin ? "Entrar na conta" : "Criar conta"}
        </h2>
        <p className="text-xs text-zinc-500 text-center mb-6">
          {isLogin
            ? "Acesse o painel do seu site"
            : "Solicite acesso ao administrador"}
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
            <select
              value={newCategory}
              onChange={(e) => setNewCategory(e.target.value)}
              className="w-full px-4 py-2.5 bg-zinc-900 border border-zinc-700 rounded-xl text-white text-sm focus:outline-none focus:border-yellow-500/60 transition-colors appearance-none cursor-pointer"
            >
              <option value="" className="text-black">Selecione a Categoria</option>
              <option value="barbearias" className="text-black">Barbearias</option>
              <option value="salao_beleza" className="text-black">Salão de Beleza</option>
              <option value="oficina" className="text-black">Oficina</option>
              <option value="chaveiro" className="text-black">Chaveiro</option>
              <option value="eletricista" className="text-black">Eletricista</option>
              <option value="pintor" className="text-black">Pintor</option>
              <option value="serralheiro" className="text-black">Serralheiro</option>
              <option value="gesseiro" className="text-black">Gesseiro</option>
              <option value="doceira" className="text-black">Doceira</option>
              <option value="acaiteria" className="text-black">Açaíteria</option>
              <option value="loja" className="text-black">Loja</option>
              <option value="buffet" className="text-black">Buffet</option>
              <option value="manicure_pedicure" className="text-black">Manicure/Pedicure</option>
              <option value="maquiadora" className="text-black">Maquiadora</option>
              <option value="lava_jato" className="text-black">Lava-jato</option>
              <option value="personal_trainer" className="text-black">Personal trainer</option>
            </select>
          )}

          {/* Mensagem de erro */}
          {error && (
            <div className="flex items-start gap-2 bg-red-500/10 border border-red-500/30 rounded-xl px-3 py-2.5 text-red-400 text-xs">
              <AlertCircle size={14} className="mt-0.5 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Botão principal */}
          <button
            onClick={isLogin ? handleLogin : handleRegister}
            disabled={loading}
            className="w-full bg-yellow-400 text-black py-3 rounded-xl font-black text-sm hover:bg-yellow-500 transition-all active:scale-95 disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {loading ? (
              <Loader2 size={16} className="animate-spin" />
            ) : (
              isLogin ? "Entrar" : "Solicitar Cadastro"
            )}
          </button>
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
