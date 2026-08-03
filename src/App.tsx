/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from "react";
import SaaSLandingPage from "./components/SaaSLandingPage";
import TenantPublicPage from "./components/TenantPublicPage";
import TenantAdminDashboard from "./components/TenantAdminDashboard";
import SuperAdminPanel from "./components/SuperAdminPanel";
import SaaSBusca from "./components/SaaSBusca";
import PortfolioPage from "./components/PortfolioPage";
import AuthModal from "./components/AuthModal";
import LoadingScreen from "./components/LoadingScreen";
import { Tenant } from "./types";
import fallbackTenants from "../database.json";

const LOCAL_FALLBACK_TENANTS = fallbackTenants as Tenant[];
const RESERVED_ROUTES = new Set(["", "portfolio", "busca", "admin"]);

// Chave para persistir sessão (sessionStorage: limpa ao fechar o browser)
const SESSION_KEY = "siteAlugado_session";

export default function App() {
  const [tenants, setTenants] = useState<Tenant[]>(LOCAL_FALLBACK_TENANTS);
  const [loading, setLoading] = useState(true);
  const [showSplash, setShowSplash] = useState(true);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [role, setRole] = useState<'superadmin' | 'tenantadmin' | null>(null);
  
  // Função utilitária para buscar tenant por domínio personalizado (customDomain)
  const getTenantByDomain = (tenantsList: Tenant[]) => {
    const hostname = window.location.hostname;
    const platformHosts = ["localhost", "seusitealugado.vercel.app", "127.0.0.1"];
    if (platformHosts.some(h => hostname === h || hostname.endsWith(".vercel.app"))) return null;
    const cleanHost = hostname.toLowerCase().replace(/^www\./, "");
    return tenantsList.find(t => t.customDomain && t.customDomain.toLowerCase().replace(/^www\./, "") === cleanHost) || null;
  };

  const initialDomainTenant = getTenantByDomain(LOCAL_FALLBACK_TENANTS);

  // Custom SPA Client-Side States
  const [currentView, setCurrentView] = useState<'landing' | 'busca' | 'portfolio' | 'tenant-public' | 'tenant-admin' | 'super-admin'>(
    initialDomainTenant ? 'tenant-public' : 'landing'
  );
  const [activeSlug, setActiveSlug] = useState<string | null>(
    initialDomainTenant ? initialDomainTenant.slug : null
  );

  const updateBrowserPath = (path: string) => {
    const nextPath = path.startsWith("/") ? path : `/${path}`;
    window.history.pushState(null, "", nextPath === "/" ? "/" : nextPath);
  };

  // Fetch tenants — sem fallback automático que sobrescreve dados reais
  const fetchTenants = async () => {
    try {
      const response = await fetch("/api/tenants");
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const data = await response.json();
      if (Array.isArray(data) && data.length > 0) {
        setTenants(data);
        return true; // sucesso
      }
      // API retornou array vazio → usar fallback apenas se não tiver dados
      setTenants((current) => current.length > 0 ? current : LOCAL_FALLBACK_TENANTS);
      return false;
    } catch (e) {
      console.error("API indisponível, usando dados locais de demonstração:", e);
      // Só aplica fallback se não houver dados já carregados
      setTenants((current) => current.length > 0 ? current : LOCAL_FALLBACK_TENANTS);
      return false;
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Tentar restaurar sessão do sessionStorage
    try {
      const savedSession = sessionStorage.getItem(SESSION_KEY);
      if (savedSession) {
        const { role: savedRole, slug: savedSlug } = JSON.parse(savedSession);
        if (savedRole === 'superadmin') {
          setRole('superadmin');
          setCurrentView('super-admin');
        } else if (savedRole === 'tenantadmin' && savedSlug) {
          setRole('tenantadmin');
          setActiveSlug(savedSlug);
          setCurrentView('tenant-admin');
        }
      }
    } catch {}

    fetchTenants();

    // Direct URL routing support para produção e hash URLs
    const handleClientRouting = () => {
      // Se for domínio personalizado pago (ex: jkaturismo.com.br), força a exibição do tenant do domínio
      const domainTenant = getTenantByDomain(tenants);
      if (domainTenant) {
        setActiveSlug(domainTenant.slug);
        setCurrentView((current) => current === 'tenant-admin' ? current : 'tenant-public');
        return;
      }

      const hashPath = window.location.hash.startsWith("#/")
        ? window.location.hash.replace("#/", "")
        : "";
      const pathSlug = window.location.pathname.replace(/^\/+|\/+$/g, "");
      const route = hashPath || pathSlug;

      if (route === "portfolio") {
        setCurrentView('portfolio');
        setActiveSlug(null);
      } else if (route === "busca") {
        setCurrentView('busca');
        setActiveSlug(null);
      } else if (!RESERVED_ROUTES.has(route)) {
        // Verificar se o tenant com esse slug tem domínio personalizado → redirecionar
        const slugTenant = tenants.find(t => t.slug === route);
        if (slugTenant && slugTenant.customDomain) {
          const targetDomain = slugTenant.customDomain.toLowerCase().startsWith('http')
            ? slugTenant.customDomain
            : `https://${slugTenant.customDomain}`;
          window.location.replace(targetDomain);
          return;
        }
        setActiveSlug(route);
        // Só vai para public se não estiver no painel admin da mesma slug
        setCurrentView((current) => 
          current === 'tenant-admin' ? current : 'tenant-public'
        );
      } else {
        setCurrentView('landing');
        setActiveSlug(null);
      }
    };

    handleClientRouting();
    window.addEventListener("hashchange", handleClientRouting);
    window.addEventListener("popstate", handleClientRouting);
    return () => {
      window.removeEventListener("hashchange", handleClientRouting);
      window.removeEventListener("popstate", handleClientRouting);
    };
  }, []);

  // Detectar acesso por domínio personalizado quando os tenants forem atualizados
  useEffect(() => {
    // 1. Acesso via domínio personalizado (ex: jkaturismo.com.br)
    const domainTenant = getTenantByDomain(tenants);
    if (domainTenant) {
      setActiveSlug(domainTenant.slug);
      setCurrentView(prev => prev === 'tenant-admin' ? prev : 'tenant-public');
      return;
    }

    // 2. Acesso via slug da plataforma (ex: seusitealugado.vercel.app/jkaturismo)
    // Se o tenant desse slug tem customDomain, redirecionar para ele
    const hostname = window.location.hostname;
    const platformHosts = ["localhost", "seusitealugado.vercel.app", "127.0.0.1"];
    const isOnPlatform = platformHosts.some(h => hostname === h || hostname.endsWith('.vercel.app')) || hostname.includes('localhost');
    if (isOnPlatform) {
      const pathSlug = window.location.pathname.replace(/^\/+|\/+$/g, '');
      if (pathSlug && !RESERVED_ROUTES.has(pathSlug)) {
        const slugTenant = tenants.find(t => t.slug === pathSlug);
        if (slugTenant && slugTenant.customDomain) {
          const targetDomain = slugTenant.customDomain.toLowerCase().startsWith('http')
            ? slugTenant.customDomain
            : `https://${slugTenant.customDomain}`;
          window.location.replace(targetDomain);
        }
      }
    }
  }, [tenants]);

  // Salvar sessão ao fazer login
  const handleLogin = (newRole: 'superadmin' | 'tenantadmin', tenantSlug: string | null) => {
    setRole(newRole);
    setShowAuthModal(false);
    try {
      sessionStorage.setItem(SESSION_KEY, JSON.stringify({ role: newRole, slug: tenantSlug }));
    } catch {}
    if (newRole === 'superadmin') {
      setCurrentView('super-admin');
      setActiveSlug(null);
      updateBrowserPath('/');
    } else if (newRole === 'tenantadmin' && tenantSlug) {
      setActiveSlug(tenantSlug);
      setCurrentView('tenant-admin');
      updateBrowserPath(`/${tenantSlug}`);
    }
  };

  // Logout limpa a sessão
  const handleLogout = () => {
    try { sessionStorage.removeItem(SESSION_KEY); } catch {}
    setRole(null);
    setCurrentView('landing');
    setActiveSlug(null);
    updateBrowserPath('/');
  };

  // Refresh apenas quando necessário (evita race condition com o Supabase)
  const handleRefreshActiveTenant = () => {
    fetchTenants();
  };

  const handleTenantUpdated = (updatedTenant: Tenant) => {
    setTenants((current) => {
      const exists = current.some((tenant) => tenant.id === updatedTenant.id);
      return exists
        ? current.map((tenant) => tenant.id === updatedTenant.id ? updatedTenant : tenant)
        : [...current, updatedTenant];
    });
  };

  const handleTenantDeleted = (tenantId: string) => {
    setTenants((current) => current.filter((tenant) => tenant.id !== tenantId));
  };

  // Find currently active tenant data
  const activeTenant = tenants.find((t) => t.slug === activeSlug);

  // Exibe splash screen animada enquanto carrega (mínimo 4s para experiência premium)
  if (showSplash) {
    return (
      <LoadingScreen
        duration={4}
        onComplete={() => setShowSplash(false)}
      />
    );
  }

  // Render correct visual router
  return (
    <div className="bg-slate-950 min-h-screen select-none">
      
      {showAuthModal && (
        <AuthModal
          tenants={tenants}
          onClose={() => setShowAuthModal(false)}
          onLogin={handleLogin}
        />
      )}

      {/* QUICK FLOATING MULTI-TENANT TEST BAR - ONLY FOR ADMINS */}
      {(role === 'superadmin' || role === 'tenantadmin') && currentView !== 'landing' && (
        <div className="bg-zinc-900 border-b border-zinc-800 text-[10px] text-zinc-400 p-2 flex justify-end items-center px-4 font-mono select-none gap-3">
            <span>Acesso Rápido:</span>
            <button 
              onClick={() => {
                setCurrentView('landing');
                setActiveSlug(null);
                updateBrowserPath("/");
              }}
              className={`hover:text-amber-500 ${currentView === 'landing' ? 'text-amber-500 font-bold' : ''}`}
            >
              Home
            </button>
            <span>|</span>
            <button 
              onClick={() => {
                setCurrentView('super-admin');
                updateBrowserPath("/");
              }}
              className={`hover:text-amber-500 ${currentView === 'super-admin' ? 'text-amber-500 font-bold' : ''}`}
            >
              Admin Geral
            </button>
            <span>|</span>
            <button 
              onClick={handleLogout}
              className="hover:text-red-400 text-zinc-500"
            >
              Sair
            </button>
        </div>
      )}

      {currentView === 'landing' && (
        <SaaSLandingPage 
          tenants={tenants}
          onSelectTenant={(slug) => {
            setActiveSlug(slug);
            setCurrentView('tenant-public');
            updateBrowserPath(`/${slug}`);
          }}
          onGoToSearch={() => setCurrentView('busca')}
          onGoToSuperAdmin={() => setShowAuthModal(true)}
          onGoToPortfolio={() => {
            setCurrentView('portfolio');
            updateBrowserPath('/portfolio');
          }}
        />
      )}

      {currentView === 'busca' && (
        <SaaSBusca 
          tenants={tenants}
          onSelectTenant={(slug) => {
            setActiveSlug(slug);
            setCurrentView('tenant-public');
            updateBrowserPath(`/${slug}`);
          }}
          onGoBack={() => setCurrentView('landing')}
        />
      )}

      {currentView === 'portfolio' && (
        <PortfolioPage
          tenants={tenants}
          onSelectTenant={(slug) => {
            setActiveSlug(slug);
            setCurrentView('tenant-public');
            updateBrowserPath(`/${slug}`);
          }}
          onGoBack={() => {
            setCurrentView('landing');
            updateBrowserPath('/');
          }}
        />
      )}

      {currentView === 'tenant-public' && activeTenant && (
      <TenantPublicPage 
          tenant={activeTenant}
          onRefreshTenant={handleRefreshActiveTenant}
          isAuthenticated={role !== null}
          onEnterDashboard={() => setCurrentView('tenant-admin')}
          onBackToLanding={() => {
            setCurrentView('landing');
            setActiveSlug(null);
            updateBrowserPath("/");
          }}
        />
      )}

      {currentView === 'tenant-public' && !activeTenant && !loading && (
        <div className="min-h-screen bg-zinc-950 flex items-center justify-center p-6 text-center">
          <div className="max-w-md space-y-4 bg-zinc-900 border border-zinc-800 p-8 rounded-3xl shadow-2xl">
            <div className="w-16 h-16 mx-auto rounded-full bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 font-mono text-2xl font-bold">
              404
            </div>
            <h2 className="text-xl font-extrabold text-white">Site Não Encontrado</h2>
            <p className="text-xs text-zinc-400 leading-relaxed">
              O site no endereço <code className="text-amber-400 font-mono bg-zinc-950 px-2 py-0.5 rounded">/{activeSlug}</code> não existe ou ainda não foi publicado na plataforma.
            </p>
            <button
              onClick={() => {
                setCurrentView('landing');
                setActiveSlug(null);
                updateBrowserPath("/");
              }}
              className="w-full py-3 bg-amber-400 hover:bg-yellow-300 text-zinc-950 font-black rounded-xl text-xs transition-all cursor-pointer"
            >
              Voltar para a Página Inicial
            </button>
          </div>
        </div>
      )}

      {currentView === 'tenant-admin' && activeTenant && (
        <TenantAdminDashboard 
          tenant={activeTenant}
          onRefreshTenant={handleRefreshActiveTenant}
          onTenantUpdated={handleTenantUpdated}
          onBackToPublicSite={() => setCurrentView('tenant-public')}
          userRole={role}
        />
      )}

      {currentView === 'super-admin' && (
        <SuperAdminPanel 
          tenants={tenants}
          onGoBack={() => setCurrentView('landing')}
          onRefreshAll={fetchTenants}
          onEnterTenantAdmin={(slug) => {
            setActiveSlug(slug);
            setCurrentView('tenant-admin');
          }}
          onTenantDeleted={handleTenantDeleted}
          onTenantUpdated={handleTenantUpdated}
        />
      )}

    </div>
  );
}
