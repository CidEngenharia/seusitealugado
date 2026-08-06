/**
 * AuditDetailModal — Modal completo de auditoria com 9 módulos + IA + PDF
 * Módulo Admin Exclusivo | SeuSiteAlugado
 */

import React, { useState } from "react";
import {
  X, Globe, Shield, Smartphone, Code2, Link2, Cpu, Star, CheckCircle,
  XCircle, AlertTriangle, Info, Loader2, Copy, FileText, Download,
  Zap, MessageSquare, Mail, ChevronDown, ChevronRight, ExternalLink,
  TrendingUp, Wifi, WifiOff, Lock, Unlock, Clock, BarChart2
} from "lucide-react";

interface AuditDetailModalProps {
  company: any;
  onClose: () => void;
  onRefresh: () => Promise<void>;
}

type TabId = "overview" | "seo" | "performance" | "security" | "mobile" | "links" | "technologies" | "wordpress" | "code" | "proposal";

const TABS: { id: TabId; label: string; icon: React.ReactNode }[] = [
  { id: "overview", label: "Visão Geral", icon: <BarChart2 size={14} /> },
  { id: "seo", label: "SEO", icon: <Globe size={14} /> },
  { id: "performance", label: "Performance", icon: <TrendingUp size={14} /> },
  { id: "security", label: "Segurança", icon: <Shield size={14} /> },
  { id: "mobile", label: "Mobile", icon: <Smartphone size={14} /> },
  { id: "links", label: "Links", icon: <Link2 size={14} /> },
  { id: "technologies", label: "Tecnologias", icon: <Cpu size={14} /> },
  { id: "wordpress", label: "WordPress", icon: <Code2 size={14} /> },
  { id: "code", label: "Código", icon: <Code2 size={14} /> },
  { id: "proposal", label: "Proposta IA", icon: <Zap size={14} /> },
];

// Helpers
function severityIcon(severity: string) {
  if (severity === "critical") return <XCircle size={13} className="text-red-500 shrink-0" />;
  if (severity === "warning") return <AlertTriangle size={13} className="text-amber-500 shrink-0" />;
  return <Info size={13} className="text-blue-500 shrink-0" />;
}
function severityBg(severity: string) {
  if (severity === "critical") return "bg-red-50 border-red-200";
  if (severity === "warning") return "bg-amber-50 border-amber-200";
  return "bg-blue-50 border-blue-200";
}
function bool(val: boolean, trueLabel = "Sim", falseLabel = "Não") {
  return val
    ? <span className="flex items-center gap-1 text-emerald-600 font-medium"><CheckCircle size={13} />{trueLabel}</span>
    : <span className="flex items-center gap-1 text-red-500 font-medium"><XCircle size={13} />{falseLabel}</span>;
}
function ScoreGauge({ label, score }: { label: string; score: number }) {
  const color = score >= 70 ? "#10b981" : score >= 40 ? "#f59e0b" : "#ef4444";
  const circumference = 2 * Math.PI * 28;
  const offset = circumference - (score / 100) * circumference;
  return (
    <div className="flex flex-col items-center gap-1">
      <div className="relative w-16 h-16">
        <svg className="w-16 h-16 -rotate-90" viewBox="0 0 64 64">
          <circle cx="32" cy="32" r="28" fill="none" stroke="#e2e8f0" strokeWidth="6" />
          <circle cx="32" cy="32" r="28" fill="none" stroke={color} strokeWidth="6"
            strokeDasharray={circumference} strokeDashoffset={offset} strokeLinecap="round"
            style={{ transition: "stroke-dashoffset 0.6s ease" }} />
        </svg>
        <span className="absolute inset-0 flex items-center justify-center text-sm font-black" style={{ color }}>{score}</span>
      </div>
      <span className="text-[10px] text-slate-500 font-medium text-center">{label}</span>
    </div>
  );
}

function IssueList({ issues, moduleFilter }: { issues: any[]; moduleFilter?: string }) {
  const filtered = moduleFilter ? issues.filter(i => i.module === moduleFilter) : issues;
  if (!filtered.length) return <p className="text-xs text-slate-400 italic">Nenhum problema encontrado neste módulo. ✅</p>;
  return (
    <div className="space-y-2">
      {filtered.map((issue, i) => (
        <div key={i} className={`border rounded-lg p-3 flex gap-2.5 ${severityBg(issue.severity)}`}>
          {severityIcon(issue.severity)}
          <div>
            <p className="text-xs font-bold text-slate-700">{issue.title}</p>
            <p className="text-[11px] text-slate-500 mt-0.5">{issue.description}</p>
          </div>
        </div>
      ))}
    </div>
  );
}

function InfoRow({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex justify-between items-center py-2 border-b border-slate-100 last:border-0">
      <span className="text-xs text-slate-500">{label}</span>
      <span className="text-xs font-medium text-slate-800">{value}</span>
    </div>
  );
}

function copyToClipboard(text: string) {
  navigator.clipboard.writeText(text).then(() => alert("Copiado para a área de transferência!"));
}

// Geração de PDF simples via window.print() (fallback sem jsPDF)
function generatePDF(company: any, audit: any) {
  const issues: any[] = Array.isArray(audit?.issues) ? audit.issues : [];
  const criticals = issues.filter(i => i.severity === "critical");
  const warnings = issues.filter(i => i.severity === "warning");
  const techs: any[] = Array.isArray(audit?.technologies) ? audit.technologies : [];

  const html = `<!DOCTYPE html><html lang="pt-BR"><head><meta charset="UTF-8">
<title>Relatório de Auditoria — ${company.name}</title>
<style>
  body { font-family: Arial, sans-serif; max-width: 800px; margin: 0 auto; padding: 40px 24px; color: #1e293b; }
  .logo { display: flex; align-items: center; gap: 8px; margin-bottom: 32px; }
  .logo-title { font-size: 18px; font-weight: 900; color: #4f46e5; }
  .logo-sub { font-size: 11px; color: #94a3b8; }
  h1 { font-size: 24px; font-weight: 900; color: #1e293b; margin-bottom: 4px; }
  h2 { font-size: 16px; font-weight: 700; color: #4f46e5; border-bottom: 2px solid #e2e8f0; padding-bottom: 8px; margin-top: 32px; margin-bottom: 16px; }
  .subtitle { font-size: 13px; color: #64748b; margin-bottom: 32px; }
  .scores { display: grid; grid-template-columns: repeat(4,1fr); gap: 12px; margin-bottom: 24px; }
  .score-card { background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 10px; padding: 12px; text-align: center; }
  .score-val { font-size: 28px; font-weight: 900; }
  .score-lbl { font-size: 10px; color: #94a3b8; text-transform: uppercase; margin-top: 4px; }
  .score-green { color: #10b981; } .score-amber { color: #f59e0b; } .score-red { color: #ef4444; }
  .issue { border-left: 3px solid; padding: 8px 12px; margin-bottom: 8px; border-radius: 4px; font-size: 12px; }
  .critical { border-color: #ef4444; background: #fef2f2; } .warning { border-color: #f59e0b; background: #fffbeb; }
  .issue-title { font-weight: 700; } .issue-desc { color: #64748b; margin-top: 2px; }
  .tech-tag { display: inline-block; background: #ede9fe; color: #6d28d9; font-size: 10px; padding: 2px 8px; border-radius: 999px; margin: 2px; }
  .footer { margin-top: 48px; border-top: 1px solid #e2e8f0; padding-top: 16px; font-size: 10px; color: #94a3b8; }
  .stars { color: #f59e0b; font-size: 18px; }
  @media print { body { padding: 0; } }
</style></head><body>
<div class="logo"><div><div class="logo-title">SeuSiteAlugado</div><div class="logo-sub">Radar de Oportunidades</div></div></div>
<h1>${company.name}</h1>
<p class="subtitle">
  ${company.category || "Empresa"} • ${company.city || ""} ${company.state ? "– " + company.state : ""}<br>
  Website: ${company.website || "Não informado"} • 
  Auditado em: ${audit ? new Date(audit.audited_at).toLocaleDateString("pt-BR") : "–"}
</p>
<div class="stars">${"★".repeat(audit?.stars || 0)}${"☆".repeat(5 - (audit?.stars || 0))}</div>
<p style="font-size:12px;color:#64748b;margin:4px 0 24px">Classificação como oportunidade de negócio</p>

${audit ? `
<h2>Pontuações</h2>
<div class="scores">
  ${[
    ["SEO", audit.score_seo],
    ["Performance", audit.score_performance],
    ["Segurança", audit.score_security],
    ["Geral", audit.score_general],
  ].map(([l, v]) => {
    const cls = v >= 70 ? "score-green" : v >= 40 ? "score-amber" : "score-red";
    return `<div class="score-card"><div class="score-val ${cls}">${v || 0}</div><div class="score-lbl">${l}</div></div>`;
  }).join("")}
</div>` : ""}

${criticals.length ? `<h2>Problemas Críticos (${criticals.length})</h2>${criticals.map(i => `<div class="issue critical"><div class="issue-title">❌ ${i.title}</div><div class="issue-desc">${i.description}</div></div>`).join("")}` : ""}
${warnings.length ? `<h2>Avisos (${warnings.length})</h2>${warnings.map(i => `<div class="issue warning"><div class="issue-title">⚠️ ${i.title}</div><div class="issue-desc">${i.description}</div></div>`).join("")}` : ""}
${techs.length ? `<h2>Tecnologias Detectadas</h2><div>${techs.map(t => `<span class="tech-tag">${t.name}</span>`).join("")}</div>` : ""}
${audit?.ai_summary ? `<h2>Análise Técnica (IA)</h2><p style="font-size:12px;line-height:1.7;color:#374151">${audit.ai_summary}</p>` : ""}
${audit?.ai_commercial ? `<h2>Análise Comercial (IA)</h2><p style="font-size:12px;line-height:1.7;color:#374151">${audit.ai_commercial}</p>` : ""}
${audit?.estimated_value_min ? `<h2>Estimativa de Investimento</h2><p style="font-size:18px;font-weight:900;color:#4f46e5">R$ ${audit.estimated_value_min?.toLocaleString("pt-BR")} – R$ ${audit.estimated_value_max?.toLocaleString("pt-BR")}</p><p style="font-size:12px;color:#64748b">Complexidade: ${audit.complexity === "high" ? "Alta" : audit.complexity === "medium" ? "Média" : "Baixa"}</p>` : ""}
<div class="footer">Relatório gerado pelo SeuSiteAlugado Radar de Oportunidades • ${new Date().toLocaleDateString("pt-BR")} • Dados de fontes públicas. Análise com fins comerciais.</div>
</body></html>`;

  const w = window.open("", "_blank");
  if (w) {
    w.document.write(html);
    w.document.close();
    setTimeout(() => w.print(), 500);
  }
}

// ─── Tabs Content ─────────────────────────────────────────────
function OverviewTab({ company, audit }: { company: any; audit: any }) {
  const issues: any[] = Array.isArray(audit?.issues) ? audit.issues : [];
  const criticals = issues.filter(i => i.severity === "critical");
  const warnings = issues.filter(i => i.severity === "warning");
  const techs: any[] = Array.isArray(audit?.technologies) ? audit.technologies : [];

  if (!audit) return (
    <div className="text-center py-8 text-slate-400">
      <BarChart2 size={32} className="mx-auto mb-2 opacity-30" />
      <p className="text-sm">Nenhuma auditoria realizada ainda.</p>
    </div>
  );

  return (
    <div className="space-y-5">
      {/* Gauges de pontuação */}
      <div>
        <h4 className="text-xs font-bold text-slate-600 uppercase tracking-wide mb-3">Pontuações</h4>
        <div className="grid grid-cols-3 sm:grid-cols-6 gap-4 bg-slate-50 rounded-xl p-4">
          <ScoreGauge label="SEO" score={audit.score_seo || 0} />
          <ScoreGauge label="Performance" score={audit.score_performance || 0} />
          <ScoreGauge label="Segurança" score={audit.score_security || 0} />
          <ScoreGauge label="Mobile" score={audit.score_mobile || 0} />
          <ScoreGauge label="Acessib." score={audit.score_accessibility || 0} />
          <ScoreGauge label="Geral" score={audit.score_general || 0} />
        </div>
      </div>

      {/* Disponibilidade */}
      <div className="bg-white border border-slate-200 rounded-xl p-4">
        <h4 className="text-xs font-bold text-slate-600 uppercase tracking-wide mb-3 flex items-center gap-1.5">
          {audit.is_online ? <Wifi size={13} className="text-emerald-500" /> : <WifiOff size={13} className="text-red-500" />}
          Disponibilidade
        </h4>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
          <div className="flex flex-col gap-0.5">
            <span className="text-slate-400">Online</span>
            {bool(audit.is_online)}
          </div>
          <div className="flex flex-col gap-0.5">
            <span className="text-slate-400">HTTPS</span>
            {bool(audit.has_https)}
          </div>
          <div className="flex flex-col gap-0.5">
            <span className="text-slate-400">SSL Válido</span>
            {bool(audit.ssl_valid)}
          </div>
          <div className="flex flex-col gap-0.5">
            <span className="text-slate-400">Tempo Resp.</span>
            <span className={`font-medium ${(audit.response_time_ms || 0) > 3000 ? "text-red-500" : "text-emerald-600"}`}>
              {audit.response_time_ms ? `${audit.response_time_ms}ms` : "–"}
            </span>
          </div>
        </div>
        {audit.ssl_expiry_days !== null && audit.ssl_expiry_days !== undefined && (
          <p className="mt-2 text-[11px] text-slate-500">
            <Lock size={10} className="inline mr-1" />
            SSL expira em {audit.ssl_expiry_days} dias
          </p>
        )}
      </div>

      {/* Sumário de problemas */}
      <div className="grid grid-cols-2 gap-3">
        <div className="bg-red-50 border border-red-200 rounded-xl p-3 text-center">
          <span className="text-2xl font-black text-red-600">{criticals.length}</span>
          <p className="text-[11px] text-red-500 font-medium mt-0.5">Críticos</p>
        </div>
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 text-center">
          <span className="text-2xl font-black text-amber-600">{warnings.length}</span>
          <p className="text-[11px] text-amber-500 font-medium mt-0.5">Avisos</p>
        </div>
      </div>

      {/* Estimativa de valor */}
      {audit.estimated_value_min && (
        <div className="bg-indigo-50 border border-indigo-200 rounded-xl p-4">
          <p className="text-[11px] text-indigo-500 font-bold uppercase tracking-wide mb-1">Estimativa de Projeto</p>
          <p className="text-xl font-black text-indigo-700">
            R$ {audit.estimated_value_min?.toLocaleString("pt-BR")} – R$ {audit.estimated_value_max?.toLocaleString("pt-BR")}
          </p>
          <p className="text-[11px] text-slate-500 mt-1">
            Complexidade: <strong>{audit.complexity === "high" ? "Alta" : audit.complexity === "medium" ? "Média" : "Baixa"}</strong>
          </p>
        </div>
      )}

      {/* Tecnologias */}
      {techs.length > 0 && (
        <div>
          <h4 className="text-xs font-bold text-slate-600 uppercase tracking-wide mb-2">Tecnologias Detectadas</h4>
          <div className="flex flex-wrap gap-2">
            {techs.map((t, i) => (
              <span key={i} className="text-[11px] bg-violet-50 border border-violet-200 text-violet-700 px-2.5 py-1 rounded-full font-medium">
                {t.name}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function SeoTab({ audit }: { audit: any }) {
  const seo = audit?.seo_data;
  const issues: any[] = (Array.isArray(audit?.issues) ? audit.issues : []).filter((i: any) => i.module === "seo");

  return (
    <div className="space-y-4">
      {seo && (
        <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
          <div className="px-4 py-3 bg-slate-50 border-b border-slate-200">
            <h4 className="text-xs font-bold text-slate-600 uppercase tracking-wide">Dados SEO On-Page</h4>
          </div>
          <div className="p-4 space-y-1">
            <InfoRow label="Title" value={bool(seo.hasTitle, seo.titleLength ? `Sim (${seo.titleLength} chars)` : "Sim")} />
            <InfoRow label="Meta Description" value={bool(seo.hasMetaDescription, seo.metaDescriptionLength ? `Sim (${seo.metaDescriptionLength} chars)` : "Sim")} />
            <InfoRow label="H1" value={bool(seo.hasH1, `Sim (${seo.h1Count})`)} />
            <InfoRow label="Canonical" value={bool(seo.hasCanonical)} />
            <InfoRow label="robots.txt" value={bool(seo.hasRobotsTxt)} />
            <InfoRow label="sitemap.xml" value={bool(seo.hasSitemap)} />
            <InfoRow label="Open Graph" value={bool(seo.hasOpenGraph)} />
            <InfoRow label="Twitter Card" value={bool(seo.hasTwitterCard)} />
            <InfoRow label="Schema.org" value={bool(seo.hasSchema)} />
            <InfoRow label="Favicon" value={bool(seo.hasFavicon)} />
            <InfoRow label="Imagens sem Alt" value={<span className={seo.imagesMissingAlt > 0 ? "text-amber-600 font-bold" : "text-emerald-600 font-bold"}>{seo.imagesMissingAlt}</span>} />
            <InfoRow label="Links Internos" value={<span className="text-slate-700 font-bold">{seo.internalLinks}</span>} />
            <InfoRow label="Links Externos" value={<span className="text-slate-700 font-bold">{seo.externalLinks}</span>} />
          </div>
        </div>
      )}
      <div>
        <h4 className="text-xs font-bold text-slate-600 uppercase tracking-wide mb-2">Problemas SEO ({issues.length})</h4>
        <IssueList issues={issues} />
      </div>
    </div>
  );
}

function PerformanceTab({ audit }: { audit: any }) {
  const perf = audit?.performance_data;
  const issues: any[] = (Array.isArray(audit?.issues) ? audit.issues : []).filter((i: any) => i.module === "performance");

  return (
    <div className="space-y-4">
      {perf && (
        <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
          <div className="px-4 py-3 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
            <h4 className="text-xs font-bold text-slate-600 uppercase tracking-wide">Métricas de Performance</h4>
            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${perf.isLighthouse ? "bg-emerald-100 text-emerald-700" : "bg-amber-100 text-amber-700"}`}>
              {perf.isLighthouse ? "Lighthouse Real" : "Estimativa (Lighthouse indisponível)"}
            </span>
          </div>
          <div className="p-4 space-y-1">
            {perf.isLighthouse && <>
              <InfoRow label="Performance Score" value={<span className={perf.performanceScore >= 70 ? "text-emerald-600 font-black" : "text-red-600 font-black"}>{perf.performanceScore}/100</span>} />
              <InfoRow label="SEO Score" value={<span className={perf.seoScore >= 70 ? "text-emerald-600 font-black" : "text-red-600 font-black"}>{perf.seoScore}/100</span>} />
              <InfoRow label="Acessibilidade" value={<span className="font-black text-slate-700">{perf.accessibilityScore}/100</span>} />
              <InfoRow label="Best Practices" value={<span className="font-black text-slate-700">{perf.bestPracticesScore}/100</span>} />
              <InfoRow label="LCP (Largest Contentful Paint)" value={<span className={perf.lcp > 4000 ? "text-red-600 font-bold" : "text-emerald-600 font-bold"}>{perf.lcp ? `${(perf.lcp/1000).toFixed(1)}s` : "–"}</span>} />
              <InfoRow label="FCP (First Contentful Paint)" value={<span className={perf.fcp > 3000 ? "text-red-600 font-bold" : "text-emerald-600 font-bold"}>{perf.fcp ? `${(perf.fcp/1000).toFixed(1)}s` : "–"}</span>} />
              <InfoRow label="TTFB" value={<span>{perf.ttfb ? `${perf.ttfb}ms` : "–"}</span>} />
              <InfoRow label="CLS" value={<span className={perf.cls > 0.1 ? "text-red-600 font-bold" : "text-emerald-600 font-bold"}>{perf.cls?.toFixed(3) || "–"}</span>} />
              <InfoRow label="Speed Index" value={<span>{perf.speedIndex ? `${(perf.speedIndex/1000).toFixed(1)}s` : "–"}</span>} />
            </>}
            {!perf.isLighthouse && <>
              <InfoRow label="Score Estimado" value={<span className={perf.performanceScore >= 60 ? "text-emerald-600 font-black" : "text-red-600 font-black"}>{perf.performanceScore}/100</span>} />
              <InfoRow label="Total de Recursos" value={<span className="font-bold text-slate-700">{perf.requestCount || "–"}</span>} />
              <p className="text-[11px] text-amber-600 italic mt-2">Chrome/Lighthouse não disponível no servidor. Score estimado por análise de recursos HTML.</p>
            </>}
          </div>
        </div>
      )}
      <div>
        <h4 className="text-xs font-bold text-slate-600 uppercase tracking-wide mb-2">Problemas de Performance ({issues.length})</h4>
        <IssueList issues={issues} />
      </div>
    </div>
  );
}

function SecurityTab({ audit }: { audit: any }) {
  const sec = audit?.security_data;
  const issues: any[] = (Array.isArray(audit?.issues) ? audit.issues : []).filter((i: any) => i.module === "security");

  return (
    <div className="space-y-4">
      {sec && (
        <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
          <div className="px-4 py-3 bg-slate-50 border-b border-slate-200">
            <h4 className="text-xs font-bold text-slate-600 uppercase tracking-wide">Headers de Segurança HTTP</h4>
          </div>
          <div className="p-4 space-y-1">
            <InfoRow label="HSTS" value={bool(sec.hasHsts)} />
            <InfoRow label="Content-Security-Policy" value={bool(sec.hasCsp)} />
            <InfoRow label="X-Frame-Options" value={bool(sec.hasXFrameOptions)} />
            <InfoRow label="X-Content-Type-Options" value={bool(sec.hasXContentType)} />
            <InfoRow label="X-XSS-Protection" value={bool(sec.hasXssProtection)} />
            <InfoRow label="Cookies Seguros" value={bool(!sec.cookiesInsecure)} />
            <InfoRow label="Mixed Content" value={bool(!sec.hasMixedContent, "Sem mixed content", "Mixed content detectado")} />
          </div>
        </div>
      )}
      <div>
        <h4 className="text-xs font-bold text-slate-600 uppercase tracking-wide mb-2">Problemas de Segurança ({issues.length})</h4>
        <IssueList issues={issues} />
      </div>
    </div>
  );
}

function MobileTab({ audit }: { audit: any }) {
  const mob = audit?.mobile_data;
  const issues: any[] = (Array.isArray(audit?.issues) ? audit.issues : []).filter((i: any) => i.module === "mobile");
  return (
    <div className="space-y-4">
      {mob && (
        <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
          <div className="px-4 py-3 bg-slate-50 border-b border-slate-200">
            <h4 className="text-xs font-bold text-slate-600 uppercase tracking-wide">Responsividade Mobile</h4>
          </div>
          <div className="p-4 space-y-1">
            <InfoRow label="Meta Viewport" value={bool(mob.hasViewportMeta)} />
            {mob.viewportContent && <InfoRow label="Viewport Content" value={<code className="text-[10px] bg-slate-100 px-1.5 py-0.5 rounded">{mob.viewportContent}</code>} />}
            <InfoRow label="Imagens Responsivas (srcset)" value={bool(mob.hasResponsiveImages)} />
            <InfoRow label="Score Estimado Mobile" value={<span className={mob.estimatedMobileScore >= 70 ? "text-emerald-600 font-black" : "text-red-600 font-black"}>{mob.estimatedMobileScore}/100</span>} />
          </div>
        </div>
      )}
      <div>
        <h4 className="text-xs font-bold text-slate-600 uppercase tracking-wide mb-2">Problemas Mobile ({issues.length})</h4>
        <IssueList issues={issues} />
      </div>
    </div>
  );
}

function LinksTab({ audit }: { audit: any }) {
  const broken: any[] = Array.isArray(audit?.broken_links) ? audit.broken_links : [];
  const issues: any[] = (Array.isArray(audit?.issues) ? audit.issues : []).filter((i: any) => i.module === "links");
  return (
    <div className="space-y-4">
      <div className="flex gap-3">
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-center flex-1">
          <span className="text-2xl font-black text-red-600">{broken.length}</span>
          <p className="text-[11px] text-red-500 font-medium mt-0.5">Links Quebrados</p>
        </div>
        <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 text-center flex-1">
          <span className="text-2xl font-black text-slate-600">{audit?.seo_data?.internalLinks || 0}</span>
          <p className="text-[11px] text-slate-500 font-medium mt-0.5">Links Internos</p>
        </div>
        <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 text-center flex-1">
          <span className="text-2xl font-black text-slate-600">{audit?.seo_data?.externalLinks || 0}</span>
          <p className="text-[11px] text-slate-500 font-medium mt-0.5">Links Externos</p>
        </div>
      </div>
      {broken.length > 0 && (
        <div className="space-y-2">
          <h4 className="text-xs font-bold text-slate-600 uppercase tracking-wide">Links com Erro</h4>
          {broken.map((link, i) => (
            <div key={i} className="bg-red-50 border border-red-200 rounded-lg p-3 flex items-start gap-2">
              <XCircle size={13} className="text-red-500 shrink-0 mt-0.5" />
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-black text-red-600 bg-red-100 px-1.5 py-0.5 rounded">HTTP {link.statusCode || "ERR"}</span>
                  <span className="text-[10px] text-slate-500 capitalize">{link.type}</span>
                </div>
                <p className="text-[11px] text-slate-600 truncate mt-0.5">{link.url}</p>
              </div>
            </div>
          ))}
        </div>
      )}
      {broken.length === 0 && <p className="text-xs text-slate-400 italic">Nenhum link quebrado detectado. ✅</p>}
    </div>
  );
}

function TechnologiesTab({ audit }: { audit: any }) {
  const techs: any[] = Array.isArray(audit?.technologies) ? audit.technologies : [];
  const grouped = techs.reduce((acc: any, t) => {
    if (!acc[t.category]) acc[t.category] = [];
    acc[t.category].push(t);
    return acc;
  }, {});

  const catLabels: Record<string, string> = {
    cms: "CMS", framework: "Framework", analytics: "Analytics",
    cdn: "CDN", language: "Linguagem", ecommerce: "E-commerce", marketing: "Marketing"
  };

  if (!techs.length) return <p className="text-xs text-slate-400 italic">Nenhuma tecnologia detectada.</p>;

  return (
    <div className="space-y-4">
      {Object.entries(grouped).map(([cat, items]: [string, any]) => (
        <div key={cat}>
          <h4 className="text-[10px] font-bold text-slate-500 uppercase tracking-wide mb-2">{catLabels[cat] || cat}</h4>
          <div className="flex flex-wrap gap-2">
            {items.map((t: any, i: number) => (
              <div key={i} className="flex items-center gap-2 bg-violet-50 border border-violet-200 rounded-xl px-3 py-2">
                <Cpu size={12} className="text-violet-500" />
                <span className="text-xs font-bold text-violet-800">{t.name}</span>
                <span className="text-[10px] text-violet-400">{t.confidence}%</span>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

function WordPressTab({ audit }: { audit: any }) {
  const wp = audit?.wordpress_data;
  const issues: any[] = (Array.isArray(audit?.issues) ? audit.issues : []).filter((i: any) => i.module === "wordpress");
  if (!wp?.isWordPress) return <div className="text-center py-8 text-slate-400"><Code2 size={28} className="mx-auto mb-2 opacity-30" /><p className="text-sm">Site não é WordPress.</p></div>;
  return (
    <div className="space-y-4">
      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
        <div className="px-4 py-3 bg-slate-50 border-b border-slate-200">
          <h4 className="text-xs font-bold text-slate-600 uppercase tracking-wide">Detalhes WordPress</h4>
        </div>
        <div className="p-4 space-y-1">
          <InfoRow label="WordPress Detectado" value={bool(true)} />
          {wp.version && <InfoRow label="Versão" value={<span className="font-bold text-slate-800">v{wp.version}</span>} />}
          <InfoRow label="REST API (/wp-json/)" value={bool(wp.hasRestApi)} />
          <InfoRow label="XMLRPC Exposto" value={bool(!wp.hasXmlRpc, "Protegido", "Exposto ⚠️")} />
          <InfoRow label="Readme.html Público" value={bool(!wp.hasReadme, "Oculto", "Visível ⚠️")} />
          <InfoRow label="wp-login.php" value={bool(wp.hasWpLogin, "Acessível (padronizar URL)", "Customizado")} />
          <InfoRow label="wp-admin/" value={bool(wp.hasWpAdmin, "Acessível (proteger)", "Customizado")} />
        </div>
      </div>
      <div>
        <h4 className="text-xs font-bold text-slate-600 uppercase tracking-wide mb-2">Problemas WordPress ({issues.length})</h4>
        <IssueList issues={issues} />
      </div>
    </div>
  );
}

function CodeTab({ audit }: { audit: any }) {
  const code = audit?.code_data;
  const issues: any[] = (Array.isArray(audit?.issues) ? audit.issues : []).filter((i: any) => i.module === "code");
  return (
    <div className="space-y-4">
      {code && (
        <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
          <div className="px-4 py-3 bg-slate-50 border-b border-slate-200">
            <h4 className="text-xs font-bold text-slate-600 uppercase tracking-wide">Análise de Código</h4>
          </div>
          <div className="p-4 space-y-1">
            <InfoRow label="Scripts Externos" value={<span className={code.scriptCount > 15 ? "text-red-600 font-bold" : "text-slate-700 font-bold"}>{code.scriptCount}</span>} />
            <InfoRow label="Folhas CSS" value={<span className="font-bold text-slate-700">{code.cssCount}</span>} />
            <InfoRow label="Scripts Duplicados" value={bool(code.duplicateScripts === 0, "Nenhum", `${code.duplicateScripts} duplicado(s)`)} />
            <InfoRow label="CSS Duplicado" value={bool(code.duplicateStyles === 0, "Nenhum", `${code.duplicateStyles} duplicado(s)`)} />
            <InfoRow label="Estilos Inline" value={<span className={code.inlineStylesCount > 20 ? "text-amber-600 font-bold" : "text-slate-700 font-bold"}>{code.inlineStylesCount}</span>} />
          </div>
        </div>
      )}
      <div>
        <h4 className="text-xs font-bold text-slate-600 uppercase tracking-wide mb-2">Problemas de Código ({issues.length})</h4>
        <IssueList issues={issues} />
      </div>
    </div>
  );
}

function ProposalTab({ company, audit, onRefresh }: { company: any; audit: any; onRefresh: () => Promise<void> }) {
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState("");

  const handleGenerate = async () => {
    setIsGenerating(true);
    setError("");
    try {
      const resp = await fetch("/api/radar/generate-proposal", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ companyId: company.id, auditId: audit?.id }),
      });
      if (!resp.ok) { const e = await resp.json(); throw new Error(e.error); }
      await onRefresh();
    } catch (e: any) {
      setError(e.message || "Erro ao gerar proposta.");
    } finally {
      setIsGenerating(false);
    }
  };

  if (!audit) return (
    <div className="text-center py-8 text-slate-400">
      <Zap size={28} className="mx-auto mb-2 opacity-30" />
      <p className="text-sm">Audite o site primeiro para gerar uma proposta.</p>
    </div>
  );

  const hasProposal = !!(audit.ai_summary || audit.ai_commercial);

  return (
    <div className="space-y-4">
      {!hasProposal && (
        <div className="bg-gradient-to-br from-indigo-50 to-violet-50 border border-indigo-200 rounded-xl p-5 text-center">
          <Zap size={28} className="text-indigo-500 mx-auto mb-2" />
          <p className="text-sm font-bold text-slate-700 mb-1">Gerar Proposta com IA</p>
          <p className="text-xs text-slate-500 mb-4">O Gemini irá analisar a auditoria e gerar resumos, mensagens e proposta completa.</p>
          <button
            onClick={handleGenerate}
            disabled={isGenerating}
            className="flex items-center gap-2 mx-auto bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm px-6 py-2.5 rounded-xl transition-all active:scale-95 disabled:opacity-60 cursor-pointer"
          >
            {isGenerating ? <Loader2 size={15} className="animate-spin" /> : <Zap size={15} />}
            {isGenerating ? "Gerando…" : "Gerar Proposta com IA"}
          </button>
          {error && <p className="text-xs text-red-500 mt-2">{error}</p>}
        </div>
      )}

      {hasProposal && (
        <>
          <div className="flex gap-2 justify-end">
            <button
              onClick={handleGenerate}
              disabled={isGenerating}
              className="flex items-center gap-1.5 text-[11px] font-bold text-indigo-600 hover:bg-indigo-50 px-3 py-1.5 rounded-lg transition-colors cursor-pointer border border-indigo-200"
            >
              {isGenerating ? <Loader2 size={11} className="animate-spin" /> : <RefreshCw size={11} />}
              Regerar
            </button>
          </div>

          {audit.ai_summary && (
            <div className="bg-white border border-slate-200 rounded-xl p-4">
              <h4 className="text-xs font-bold text-slate-600 uppercase tracking-wide mb-2">Resumo Técnico</h4>
              <p className="text-xs text-slate-700 leading-relaxed whitespace-pre-wrap">{audit.ai_summary}</p>
            </div>
          )}
          {audit.ai_commercial && (
            <div className="bg-white border border-slate-200 rounded-xl p-4">
              <h4 className="text-xs font-bold text-slate-600 uppercase tracking-wide mb-2">Resumo Comercial</h4>
              <p className="text-xs text-slate-700 leading-relaxed whitespace-pre-wrap">{audit.ai_commercial}</p>
            </div>
          )}
          {audit.ai_whatsapp_msg && (
            <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4">
              <div className="flex items-center justify-between mb-2">
                <h4 className="text-xs font-bold text-emerald-700 flex items-center gap-1.5">
                  <MessageSquare size={13} /> Mensagem WhatsApp
                </h4>
                <button
                  onClick={() => copyToClipboard(audit.ai_whatsapp_msg)}
                  className="flex items-center gap-1 text-[11px] text-emerald-600 hover:bg-emerald-100 px-2 py-1 rounded-lg transition-colors cursor-pointer"
                >
                  <Copy size={10} /> Copiar
                </button>
              </div>
              <p className="text-xs text-emerald-800 leading-relaxed whitespace-pre-wrap">{audit.ai_whatsapp_msg}</p>
              {company.phone && (
                <a
                  href={`https://wa.me/${company.phone.replace(/\D/g, "")}?text=${encodeURIComponent(audit.ai_whatsapp_msg)}`}
                  target="_blank" rel="noopener noreferrer"
                  className="mt-3 flex items-center gap-1.5 text-[11px] font-bold text-white bg-emerald-600 hover:bg-emerald-700 px-3 py-1.5 rounded-lg transition-colors cursor-pointer w-fit"
                >
                  <ExternalLink size={11} /> Abrir no WhatsApp
                </a>
              )}
            </div>
          )}
          {audit.ai_email_msg && (
            <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
              <div className="flex items-center justify-between mb-2">
                <h4 className="text-xs font-bold text-blue-700 flex items-center gap-1.5">
                  <Mail size={13} /> Mensagem E-mail
                </h4>
                <button
                  onClick={() => copyToClipboard(audit.ai_email_msg)}
                  className="flex items-center gap-1 text-[11px] text-blue-600 hover:bg-blue-100 px-2 py-1 rounded-lg transition-colors cursor-pointer"
                >
                  <Copy size={10} /> Copiar
                </button>
              </div>
              <p className="text-xs text-blue-800 leading-relaxed whitespace-pre-wrap">{audit.ai_email_msg}</p>
            </div>
          )}
          {audit.ai_proposal && (
            <div className="bg-white border border-slate-200 rounded-xl p-4">
              <div className="flex items-center justify-between mb-3">
                <h4 className="text-xs font-bold text-slate-600 uppercase tracking-wide">Proposta Comercial Completa</h4>
                <button
                  onClick={() => copyToClipboard(audit.ai_proposal)}
                  className="flex items-center gap-1 text-[11px] text-slate-600 hover:bg-slate-100 px-2 py-1 rounded-lg transition-colors cursor-pointer"
                >
                  <Copy size={10} /> Copiar Markdown
                </button>
              </div>
              <div className="bg-slate-50 rounded-lg p-3 max-h-60 overflow-y-auto">
                <pre className="text-[11px] text-slate-700 whitespace-pre-wrap leading-relaxed">{audit.ai_proposal}</pre>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}

// ─── Main Modal ───────────────────────────────────────────────
function RefreshCw({ size, className }: { size: number; className?: string }) {
  return <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><polyline points="23 4 23 10 17 10"/><polyline points="1 20 1 14 7 14"/><path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"/></svg>;
}

export default function AuditDetailModal({ company, onClose, onRefresh }: AuditDetailModalProps) {
  const [activeTab, setActiveTab] = useState<TabId>("overview");
  const audit = company.radar_audits?.[0] || null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl max-h-[90vh] flex flex-col overflow-hidden">

        {/* Header */}
        <div className="flex items-center gap-3 px-5 py-4 border-b border-slate-200 bg-gradient-to-r from-indigo-600 to-violet-600 rounded-t-2xl shrink-0">
          <div className="flex-1 min-w-0">
            <h2 className="text-base font-black text-white truncate">{company.name}</h2>
            <div className="flex items-center gap-3 mt-0.5">
              <span className="text-indigo-200 text-[11px]">{company.category} • {company.city}</span>
              {company.website && (
                <a href={company.website.startsWith("http") ? company.website : `https://${company.website}`} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-[11px] text-indigo-200 hover:text-white transition-colors">
                  <ExternalLink size={11} /> {company.website.replace(/^https?:\/\//, "").slice(0, 30)}
                </a>
              )}
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            {audit && (
              <button
                onClick={() => generatePDF(company, audit)}
                className="flex items-center gap-1.5 bg-white/15 hover:bg-white/25 text-white text-[11px] font-bold px-3 py-1.5 rounded-lg transition-colors cursor-pointer border border-white/25"
              >
                <Download size={12} /> PDF
              </button>
            )}
            <button onClick={onClose} className="p-1.5 text-white/70 hover:text-white hover:bg-white/15 rounded-lg transition-colors cursor-pointer">
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex overflow-x-auto border-b border-slate-200 bg-slate-50 shrink-0">
          {TABS.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-1.5 px-3 py-3 text-[11px] font-bold whitespace-nowrap transition-colors cursor-pointer border-b-2 ${
                activeTab === tab.id
                  ? "border-indigo-600 text-indigo-700 bg-white"
                  : "border-transparent text-slate-500 hover:text-slate-700 hover:bg-white/60"
              }`}
            >
              {tab.icon}{tab.label}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-5">
          {activeTab === "overview" && <OverviewTab company={company} audit={audit} />}
          {activeTab === "seo" && <SeoTab audit={audit} />}
          {activeTab === "performance" && <PerformanceTab audit={audit} />}
          {activeTab === "security" && <SecurityTab audit={audit} />}
          {activeTab === "mobile" && <MobileTab audit={audit} />}
          {activeTab === "links" && <LinksTab audit={audit} />}
          {activeTab === "technologies" && <TechnologiesTab audit={audit} />}
          {activeTab === "wordpress" && <WordPressTab audit={audit} />}
          {activeTab === "code" && <CodeTab audit={audit} />}
          {activeTab === "proposal" && <ProposalTab company={company} audit={audit} onRefresh={onRefresh} />}
        </div>
      </div>
    </div>
  );
}
