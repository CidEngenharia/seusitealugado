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
import AuthModal from "./components/AuthModal";
import LoadingScreen from "./components/LoadingScreen";
import { Tenant } from "./types";

export default function App() {
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [loading, setLoading] = useState(true);
  const [showSplash, setShowSplash] = useState(true);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [role, setRole] = useState<'superadmin' | 'tenantadmin' | null>(null);
  
  // Custom SPA Client-Side States
  // 'landing' | ' busca' | 'tenant-public' | 'tenant-admin' | 'super-admin'
  const [currentView, setCurrentView] = useState<'landing' | 'busca' | 'tenant-public' | 'tenant-admin' | 'super-admin'>('landing');
  const [activeSlug, setActiveSlug] = useState<string | null>(null);

  // Fetch tenants on mount
  const fetchTenants = async () => {
    try {
      const response = await fetch("/api/tenants");
      if (response.ok) {
        const data = await response.json();
        setTenants(data);
      }
    } catch (e) {
      console.error("Erro ao carregar lojistas da API, usando redundância local", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTenants();

    // Direct url-hash slug routing support for testing
    const handleHashRouting = () => {
      const hash = window.location.hash;
      if (hash.startsWith("#/")) {
        const slug = hash.replace("#/", "");
        if (slug) {
          setActiveSlug(slug);
          setCurrentView('tenant-public');
        }
      }
    };

    handleHashRouting();
    window.addEventListener("hashchange", handleHashRouting);
    return () => window.removeEventListener("hashchange", handleHashRouting);
  }, []);

  // Update current tenant state changes
  const handleRefreshActiveTenant = () => {
    fetchTenants();
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
              window.location.hash = '';
            } else if (role === 'tenantadmin' && tenantSlug) {
              // Tenant admin → somente o painel do seu site
              setActiveSlug(tenantSlug);
              setCurrentView('tenant-admin');
              window.location.hash = `/${tenantSlug}`;
            }
          }}
        />
      )}

      {/* QUICK FLOATING MULTI-TENANT TEST BAR - ONLY FOR ADMINS */}
      {(role === 'superadmin' || role === 'tenantadmin') && (
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
                window.location.hash = "";
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
                window.location.hash = "/barbeariakeu";
              }}
              className={`hover:text-amber-500 ${activeSlug === 'barbeariakeu' && currentView === 'tenant-public' ? 'text-amber-500 font-bold' : ''}`}
            >
              ✂️ Barbearia Keu
            </button>
            <button 
              onClick={() => {
                setActiveSlug('salaodajulie');
                setCurrentView('tenant-public');
                window.location.hash = "/salaodajulie";
              }}
              className={`hover:text-amber-500 ${activeSlug === 'salaodajulie' && currentView === 'tenant-public' ? 'text-amber-500 font-bold' : ''}`}
            >
              🌸 Salão Julie
            </button>
            <button 
              onClick={() => {
                setActiveSlug('oficinadocarlos');
                setCurrentView('tenant-public');
                window.location.hash = "/oficinadocarlos";
              }}
              className={`hover:text-amber-500 ${activeSlug === 'oficinadocarlos' && currentView === 'tenant-public' ? 'text-amber-500 font-bold' : ''}`}
            >
              🔧 Oficina Carlos
            </button>
            <span>|</span>
            <button 
              onClick={() => {
                setCurrentView('super-admin');
                window.location.hash = "";
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
            window.location.hash = `/${slug}`;
          }}
          onGoToSearch={() => setCurrentView('busca')}
          onGoToSuperAdmin={() => setShowAuthModal(true)}
        />
      )}

      {currentView === 'busca' && (
        <SaaSBusca 
          tenants={tenants}
          onSelectTenant={(slug) => {
            setActiveSlug(slug);
            setCurrentView('tenant-public');
            window.location.hash = `/${slug}`;
          }}
          onGoBack={() => setCurrentView('landing')}
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
            window.location.hash = "";
          }}
        />
      )}

      {currentView === 'tenant-admin' && activeTenant && (
        <TenantAdminDashboard 
          tenant={activeTenant}
          onRefreshTenant={handleRefreshActiveTenant}
          onBackToPublicSite={() => setCurrentView('tenant-public')}
        />
      )}

      {currentView === 'super-admin' && (
        <SuperAdminPanel 
          tenants={tenants}
          onGoBack={() => setCurrentView('landing')}
          onRefreshAll={fetchTenants}
        />
      )}

    </div>
  );
}
