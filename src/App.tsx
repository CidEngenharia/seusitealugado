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

export default function App() {
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [loading, setLoading] = useState(true);
  const [showSplash, setShowSplash] = useState(true);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [role, setRole] = useState<'superadmin' | 'tenantadmin' | null>(null);
  
  // Custom SPA Client-Side States
  // 'landing' | 'busca' | 'portfolio' | 'tenant-public' | 'tenant-admin' | 'super-admin'
  const [currentView, setCurrentView] = useState<'landing' | 'busca' | 'portfolio' | 'tenant-public' | 'tenant-admin' | 'super-admin'>('landing');
  const [activeSlug, setActiveSlug] = useState<string | null>(null);

  const updateBrowserPath = (path: string) => {
    const nextPath = path.startsWith("/") ? path : `/${path}`;
    window.history.pushState(null, "", nextPath === "/" ? "/" : nextPath);
  };

  // Fetch tenants on mount
  const fetchTenants = async () => {
    try {
      const response = await fetch("/api/tenants");
      if (response.ok) {
        const data = await response.json();
        if (Array.isArray(data) && data.length > 0) {
          setTenants(data);
          return;
        }
      }
    } catch (e) {
      console.error("Erro ao carregar lojistas da API, usando redundância local", e);
    } finally {
      setTenants((current) => current.length > 0 ? current : LOCAL_FALLBACK_TENANTS);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTenants();

    // Direct URL routing support for production plus legacy hash URLs.
    const handleClientRouting = () => {
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
        setActiveSlug(route);
        setCurrentView('tenant-public');
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

  // Update current tenant state changes
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
          onLogin={(role, tenantSlug) => {
            setRole(role);
            setShowAuthModal(false);
            if (role === 'superadmin') {
              // Super admin → painel completo
              setCurrentView('super-admin');
              setActiveSlug(null);
              updateBrowserPath('/');
            } else if (role === 'tenantadmin' && tenantSlug) {
              // Tenant admin → somente o painel do seu site
              setActiveSlug(tenantSlug);
              setCurrentView('tenant-admin');
              updateBrowserPath(`/${tenantSlug}`);
            }
          }}
        />
      )}

      {/* QUICK FLOATING MULTI-TENANT TEST BAR - ONLY FOR ADMINS */}
      {(role === 'superadmin' || role === 'tenantadmin') && currentView !== 'landing' && (
        <div className="bg-zinc-900 border-b border-zinc-800 text-[10px] text-zinc-400 p-2 flex justify-between items-center px-4 font-mono select-none">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            <span>Ambiente Dev</span>
          </div>
          <div className="flex items-center gap-3">
            <span>Acesso Rápido:</span>
            <button 
              onClick={() => {
                setCurrentView('landing');
                setActiveSlug(null);
                updateBrowserPath("/");
              }}
              className={`hover:text-amber-500 ${currentView === 'landing' ? 'text-amber-500 font-bold' : ''}`}
            >
              🏠 Home
            </button>
            <span>|</span>
            <button 
              onClick={() => {
                setActiveSlug('barbeariakeu');
                setCurrentView('tenant-public');
                updateBrowserPath("/barbeariakeu");
              }}
              className={`hover:text-amber-500 ${activeSlug === 'barbeariakeu' && currentView === 'tenant-public' ? 'text-amber-500 font-bold' : ''}`}
            >
              ✂️ Barbearia Keu
            </button>
            <button 
              onClick={() => {
                setActiveSlug('salaodajulie');
                setCurrentView('tenant-public');
                updateBrowserPath("/salaodajulie");
              }}
              className={`hover:text-amber-500 ${activeSlug === 'salaodajulie' && currentView === 'tenant-public' ? 'text-amber-500 font-bold' : ''}`}
            >
              🌸 Salão Julie
            </button>
            <button 
              onClick={() => {
                setActiveSlug('oficinadocarlos');
                setCurrentView('tenant-public');
                updateBrowserPath("/oficinadocarlos");
              }}
              className={`hover:text-amber-500 ${activeSlug === 'oficinadocarlos' && currentView === 'tenant-public' ? 'text-amber-500 font-bold' : ''}`}
            >
              🔧 Oficina Carlos
            </button>
            <span>|</span>
            <button 
              onClick={() => {
                setCurrentView('super-admin');
                updateBrowserPath("/");
              }}
              className={`hover:text-amber-500 ${currentView === 'super-admin' ? 'text-amber-500 font-bold' : ''}`}
            >
              🛡️ Admin
            </button>
          </div>
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
          onEnterDashboard={() => setCurrentView('tenant-admin')}
          onBackToLanding={() => {
            setCurrentView('landing');
            setActiveSlug(null);
            updateBrowserPath("/");
          }}
        />
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
