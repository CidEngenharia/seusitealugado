/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from "react";
import { 
  Phone, 
  MapPin, 
  Clock, 
  Instagram, 
  Share2, 
  Star, 
  Calendar, 
  User, 
  MessageSquare, 
  Lock, 
  CheckCircle,
  Eye, 
  Sun, 
  Moon, 
  Smartphone,
  Check,
  QrCode,
  Download,
  ArrowLeft,
  Facebook,
  Youtube,
  Twitter,
  Video,
  Globe
} from "lucide-react";
import { Tenant, Service, Booking, ReviewItem } from "../types";

function getInstagramMediaUrl(url: string): string {
  if (!url) return "";
  const match = url.match(/(?:instagram\.com)\/(?:p|reel|tv)\/([a-zA-Z0-9_\-]+)/i);
  if (match && match[1]) {
    const directMediaUrl = `https://www.instagram.com/p/${match[1]}/media/?size=l`;
    return `/api/instagram-image-proxy?url=${encodeURIComponent(directMediaUrl)}`;
  }
  if (url.includes("cdninstagram.com") || url.includes("fbcdn.net")) {
    return `/api/instagram-image-proxy?url=${encodeURIComponent(url)}`;
  }
  return url;
}

interface TenantPublicPageProps {
  tenant: Tenant;
  onRefreshTenant: () => void;
  onEnterDashboard: () => void;
  onBackToLanding: () => void;
  isAuthenticated?: boolean;
}

export default function TenantPublicPage({ tenant, onRefreshTenant, onEnterDashboard, onBackToLanding, isAuthenticated = false }: TenantPublicPageProps) {
  const isPremiumThemeEnabled = tenant.plan === 'premium';
  const initialTheme = isPremiumThemeEnabled ? (tenant.themeMode || 'dark') : 'light';
  const [themeMode, setThemeMode] = useState<'light' | 'dark'>(initialTheme);

  useEffect(() => {
    setThemeMode(isPremiumThemeEnabled ? (tenant.themeMode || 'dark') : 'light');
  }, [tenant.themeMode, tenant.plan]);

  useEffect(() => {
    // SEO: título e meta description configurados pelo inquilino
    const seo = tenant.seoAnalyticsConfig;
    document.title = seo?.metaTitle || `${tenant.name} | SeuSiteAlugado`;

    let metaDesc = document.querySelector('meta[name="description"]');
    if (seo?.metaDescription) {
      if (!metaDesc) {
        metaDesc = document.createElement('meta');
        (metaDesc as HTMLMetaElement).name = 'description';
        document.head.appendChild(metaDesc);
      }
      (metaDesc as HTMLMetaElement).content = seo.metaDescription;
    }

    // Analytics: Google Analytics GA4
    if (seo?.googleAnalyticsId) {
      const gaId = seo.googleAnalyticsId;
      if (!document.getElementById('ga-script')) {
        const script = document.createElement('script');
        script.id = 'ga-script';
        script.async = true;
        script.src = `https://www.googletagmanager.com/gtag/js?id=${gaId}`;
        document.head.appendChild(script);

        const inline = document.createElement('script');
        inline.id = 'ga-inline';
        inline.innerHTML = `window.dataLayer = window.dataLayer || []; function gtag(){dataLayer.push(arguments);} gtag('js', new Date()); gtag('config', '${gaId}');`;
        document.head.appendChild(inline);
      }
    }

    // Analytics: Facebook Pixel
    if (seo?.facebookPixelId) {
      const pixelId = seo.facebookPixelId;
      if (!document.getElementById('fb-pixel')) {
        const script = document.createElement('script');
        script.id = 'fb-pixel';
        script.innerHTML = `!function(f,b,e,v,n,t,s){if(f.fbq)return;n=f.fbq=function(){n.callMethod?n.callMethod.apply(n,arguments):n.queue.push(arguments)};if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';n.queue=[];t=b.createElement(e);t.async=!0;t.src=v;s=b.getElementsByTagName(e)[0];s.parentNode.insertBefore(t,s)}(window,document,'script','https://connect.facebook.net/en_US/fbevents.js');fbq('init','${pixelId}');fbq('track','PageView');`;
        document.head.appendChild(script);
      }
    }
  }, [tenant.name, tenant.seoAnalyticsConfig]);

  const [activeTab, setActiveTab] = useState<'services' | 'reviews' | 'about' | 'products' | 'instagram' | 'contact'>('services');
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const [bookingName, setBookingName] = useState("");
  const [bookingPhone, setBookingPhone] = useState("");
  const [bookingEmail, setBookingEmail] = useState("");
  const [bookingDate, setBookingDate] = useState("");
  const [bookingTime, setBookingTime] = useState("");
  const [bookingNotes, setBookingNotes] = useState("");
  const [bookingSuccess, setBookingSuccess] = useState(false);

  // Leave review state
  const [reviewAuthor, setReviewAuthor] = useState("");
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState("");
  const [reviewSubmitting, setReviewSubmitting] = useState(false);
  const [reviewSuccess, setReviewSuccess] = useState(false);

  // Digital card overlay state
  const [showDigitalCard, setShowDigitalCard] = useState(false);
  const [showUpgradeMessage, setShowUpgradeMessage] = useState(false);
  const [copiedShare, setCopiedShare] = useState(false);
  const [showAccessDenied, setShowAccessDenied] = useState(false);

  // Mapping theme colors
  const colorMap: Record<string, { bg: string; text: string; bgHover: string; border: string; accent: string; badge: string; ring: string }> = {
    amber: {
      bg: "bg-amber-600",
      text: "text-amber-500",
      bgHover: "hover:bg-amber-700",
      border: "border-amber-500",
      accent: "text-amber-400",
      badge: "bg-amber-500/10 text-amber-400 border-amber-500/20",
      ring: "focus:ring-amber-500"
    },
    rose: {
      bg: "bg-rose-500",
      text: "text-rose-500",
      bgHover: "hover:bg-rose-600",
      border: "border-rose-400",
      accent: "text-rose-400",
      badge: "bg-rose-500/10 text-rose-400 border-rose-500/20",
      ring: "focus:ring-rose-500"
    },
    blue: {
      bg: "bg-blue-600",
      text: "text-blue-500",
      bgHover: "hover:bg-blue-700",
      border: "border-blue-500",
      accent: "text-blue-400",
      badge: "bg-blue-500/10 text-blue-400 border-blue-500/20",
      ring: "focus:ring-blue-500"
    },
    emerald: {
      bg: "bg-emerald-600",
      text: "text-emerald-500",
      bgHover: "hover:bg-emerald-700",
      border: "border-emerald-500",
      accent: "text-emerald-400",
      badge: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
      ring: "focus:ring-emerald-500"
    },
    zinc: {
      bg: "bg-zinc-700",
      text: "text-zinc-600",
      bgHover: "hover:bg-zinc-800",
      border: "border-zinc-500",
      accent: "text-zinc-600 dark:text-zinc-400",
      badge: "bg-zinc-500/10 text-zinc-600 dark:text-zinc-400 border-zinc-500/20",
      ring: "focus:ring-zinc-500"
    }
  };

  const themeColors = colorMap[tenant.themeColor] || colorMap.amber;

  // Font Family mappings
  const fontClass = {
    sans: "font-sans",
    serif: "font-serif",
    mono: "font-mono"
  }[tenant.fontFamily || 'sans'];

  // Handle new booking
  const handleBookingSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedService || !bookingDate || !bookingTime || !bookingName || !bookingPhone) return;

    const newBooking: Booking = {
      id: "b-" + Date.now(),
      clientName: bookingName,
      clientPhone: bookingPhone,
      clientEmail: bookingEmail,
      serviceId: selectedService.id,
      dateTime: `${bookingDate}T${bookingTime}:00`,
      status: "pending",
      notes: bookingNotes
    };

    try {
      const response = await fetch(`/api/tenants/${tenant.slug}/bookings`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newBooking)
      });
      if (response.ok) {
        setBookingSuccess(true);
        setTimeout(() => {
          setBookingSuccess(false);
          setShowBookingModal(false);
          onRefreshTenant();
          // Reset fields
          setBookingName("");
          setBookingPhone("");
          setBookingEmail("");
          setBookingDate("");
          setBookingTime("");
          setBookingNotes("");
        }, 3000);
      }
    } catch (e) {
      console.error(e);
    }
  };

  // Leave a review
  const handleReviewSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reviewAuthor || !reviewComment) return;
    setReviewSubmitting(true);

    const newReview: ReviewItem = {
      id: "rev-" + Date.now(),
      author: reviewAuthor,
      rating: reviewRating,
      comment: reviewComment,
      date: new Date().toISOString().split('T')[0],
      approved: false // requires manual approval in SaaS CRM!
    };

    try {
      const res = await fetch(`/api/tenants/${tenant.slug}/reviews`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newReview)
      });
      if (res.ok) {
        setReviewSuccess(true);
        setReviewAuthor("");
        setReviewComment("");
        setReviewRating(5);
        setTimeout(() => {
          setReviewSuccess(false);
          onRefreshTenant();
        }, 4000);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setReviewSubmitting(false);
    }
  };

  // Generate simulated vcard download
  const downloadVCard = () => {
    const vcardContent = `BEGIN:VCARD
VERSION:3.0
N:${tenant.ownerName};${tenant.name};;;
FN:${tenant.name}
ORG:${tenant.name}
TEL;TYPE=CELL,VOICE:${tenant.socials.whatsapp}
TEL;TYPE=WORK,VOICE:${tenant.socials.phone}
EMAIL;TYPE=PREF,INTERNET:${tenant.socials.email}
ADR;TYPE=WORK:;;${tenant.address};;;;
NOTE:${tenant.description}
URL:${window.location.href}
END:VCARD`;

    const blob = new Blob([vcardContent], { type: "text/vcard" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `${tenant.slug}-contato.vcf`);
    link.click();
    URL.revokeObjectURL(url);
  };

  // Calc average ratings
  const approvedReviews = tenant.reviews?.filter(r => r.approved) || [];
  const averageRating = approvedReviews.length > 0 
    ? (approvedReviews.reduce((acc, r) => acc + r.rating, 0) / approvedReviews.length).toFixed(1)
    : "5.0";

  const isMinimal = tenant.template === 'minimal' || tenant.slug === 'jkaturismo';
  const isBento = tenant.template === 'modern' && tenant.slug !== 'jkaturismo';
  
  // Layout containers matching chosen design vibe
  const containerClass = isMinimal 
    ? "max-w-4xl mx-auto px-4 py-12 space-y-12 animate-in fade-in duration-300"
    : "max-w-7xl mx-auto px-4 py-8 grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 animate-in fade-in duration-300";

  const brandColumnClass = isMinimal
    ? "space-y-6"
    : "lg:col-span-4 space-y-6";

  const contentColumnClass = isMinimal
    ? "space-y-8"
    : "lg:col-span-8 space-y-6";

  const cardClass = isMinimal
    ? `p-0 bg-transparent border-0 space-y-4`
    : isBento
      ? `p-6 rounded-3xl border-2 ${themeMode === 'dark' ? 'bg-zinc-900 border-zinc-800' : 'bg-white border-zinc-200'} space-y-4 shadow-md transition-all hover:translate-y-[-2px] duration-300`
      : `p-6 rounded-2xl border ${themeMode === 'dark' ? 'bg-zinc-900 border-zinc-800/80' : 'bg-white border-zinc-200/80'} space-y-4 shadow-sm`;

  const serviceItemClass = isMinimal
    ? `py-4 border-b ${themeMode === 'dark' ? 'border-zinc-800/60' : 'border-zinc-200'} flex items-center justify-between gap-4 transition-all w-full`
    : isBento
      ? `p-5 rounded-2xl border-2 flex flex-col justify-between gap-4 transition-all hover:scale-[1.02] duration-300 shadow-sm ${themeMode === 'dark' ? 'bg-zinc-900 border-zinc-800 hover:border-zinc-700' : 'bg-white border-zinc-200 hover:border-zinc-300'}`
      : `p-4 rounded-xl border flex flex-col justify-between gap-4 transition-all ${themeMode === 'dark' ? 'bg-zinc-900 border-zinc-800 hover:border-zinc-755' : 'bg-white border-zinc-200 hover:shadow-md'}`;

  // Check block status
  if (tenant.status === "blocked" || tenant.status === "suspended") {
    return (
      <div className="min-h-screen bg-neutral-900 flex items-center justify-center p-6 text-white font-sans">
        <div className="max-w-md w-full text-center space-y-6 bg-neutral-800 p-8 rounded-2xl border border-red-500/20 shadow-2xl">
          <div className="w-16 h-16 bg-red-500/10 text-red-500 rounded-full flex items-center justify-center mx-auto text-3xl font-bold">
            !
          </div>
          <div className="space-y-2">
            <h1 className="text-2xl font-bold tracking-tight text-white">Espaço Temporariamente Suspenso</h1>
            <p className="text-neutral-400 text-sm">
              O mini site **{tenant.name}** está suspenso pelo administrador da plataforma SeusiteAlugado devido a pendências na assinatura ou auditoria de termos.
            </p>
          </div>
          <div className="pt-4 border-t border-neutral-700/50 text-xs text-neutral-500">
            Se você é o proprietário, acesse o painel administrativo do SeusiteAlugado para regularizar sua assinatura mensal.
          </div>
        </div>
      </div>
    );
  }

  return (
    <div id="tenant-public-view" className={`min-h-screen transition-colors duration-300 ${fontClass} ${themeMode === 'dark' ? 'bg-zinc-950 text-zinc-100' : 'bg-neutral-50 text-zinc-900'}`}>
      
      {/* HEADER CONTROLS (Floating Sandbox bar) */}
      <div className="bg-neutral-900 border-b border-neutral-800 text-xs px-4 py-2 text-neutral-400 flex items-center justify-between sticky top-0 z-50 shadow-sm">
        <div className="flex items-center gap-3">
          <button 
            onClick={onBackToLanding}
            className="text-[10px] text-zinc-300 hover:text-white flex items-center justify-center cursor-pointer bg-neutral-800 h-7 w-7 rounded border border-neutral-700 transition-colors"
            title="Voltar"
          >
            <ArrowLeft size={14} />
          </button>
          <span className="text-zinc-700">|</span>
          <span className="inline-flex h-2 w-2 rounded-full bg-emerald-500 animate-pulse"></span>
          <span>site:</span>
          <div className="flex items-center gap-1.5">
            <strong className="text-white font-bold">sitealugado.com/{tenant.slug}</strong>
            <button 
              onClick={() => {
                const shareMsg = `Confira o meu site "${tenant.name}"! Agora você pode agendar os servicos de forma profissional., e ver as nossas promoções semanais.`;
                const slugUrl = `https://sitealugado.com/${tenant.slug}`;
                const textToShare = `${shareMsg} ${slugUrl}`;
                
                // Open WhatsApp Web/App
                window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(textToShare)}`, '_blank');
                
                // Copy to clipboard
                navigator.clipboard.writeText(textToShare).then(() => {
                  setCopiedShare(true);
                  setTimeout(() => setCopiedShare(false), 3000);
                }).catch(() => {});
              }}
              className="h-7 w-7 bg-neutral-800 hover:bg-neutral-750 text-emerald-400 hover:text-emerald-300 rounded border border-neutral-700 flex items-center justify-center cursor-pointer transition-all shrink-0"
              title={copiedShare ? "Copiado!" : "Compartilhar por WhatsApp"}
            >
              <Share2 size={13} className={copiedShare ? "text-white" : "text-emerald-500"} />
            </button>
          </div>
          <span className="text-[10px] text-emerald-500 font-medium lowercase">plan: {tenant.plan}</span>
        </div>
        
        <div className="flex items-center gap-4">
          <button 
            onClick={() => {
              if (isPremiumThemeEnabled) {
                setThemeMode(themeMode === 'dark' ? 'light' : 'dark');
              } else {
                setShowUpgradeMessage(true);
              }
            }}
            className="flex items-center justify-center h-7 w-7 text-neutral-300 hover:text-white transition-colors cursor-pointer bg-neutral-800 rounded border border-neutral-705"
            title={isPremiumThemeEnabled ? "Mudar visual para Dia/Noite" : "Tema escuro/claro (Recurso Premium)"}
          >
            {themeMode === 'dark' ? <Sun size={14} className="text-amber-400" /> : <Moon size={14} className="text-indigo-400" />}
            {!isPremiumThemeEnabled && <Lock size={10} className="text-amber-500 animate-pulse ml-0.5" />}
          </button>

          <button 
            onClick={() => {
              if (isAuthenticated) {
                onEnterDashboard();
              } else {
                setShowAccessDenied(true);
              }
            }}
            className="flex items-center gap-1.5 bg-neutral-800 text-white font-medium px-2.5 py-1 rounded hover:bg-neutral-700 hover:border-neutral-600 border border-neutral-700 cursor-pointer transition-all text-[11px]"
          >
            <Lock size={11} />
            <span>Painel admin site</span>
          </button>
        </div>
      </div>

      {/* HERO BANNER SECTION */}
      <div className="relative h-64 md:h-80 bg-neutral-800 overflow-hidden">
        <img 
          src={tenant.bannerUrl || "https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=800"} 
          alt="Banner do negócio" 
          className="w-full h-full object-cover opacity-60 filter blur-[1px] hover:blur-none transition-all duration-700"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/40 to-transparent"></div>
        
        {/* Absolute branding inside Banner */}
        <div className="absolute bottom-6 left-6 right-6 flex flex-col md:flex-row items-start md:items-end justify-between gap-4">
          <div className="flex items-center gap-5 md:gap-6">
            <div className={`w-28 h-28 md:w-36 md:h-36 rounded-full bg-zinc-900 border-[1px] ${themeColors.border} overflow-hidden shadow-[0_8px_30px_rgb(0,0,0,0.5)] shrink-0 transition-transform hover:scale-105 duration-300`}>
              <img 
                src={tenant.logoUrl || "https://images.unsplash.com/photo-1560066984-138dadb4c035?w=150"} 
                alt="Logo da Empresa" 
                className="w-full h-full object-cover"
              />
            </div>
            <div className="space-y-1">
              <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-white drop-shadow-md">{tenant.name}</h1>
              <div className="flex items-center gap-2 text-sm text-zinc-300 flex-wrap">
                <div className="flex items-center text-yellow-400">
                  <Star fill="currentColor" size={14} />
                  <span className="ml-1 font-semibold">{averageRating}</span>
                </div>
                <span>•</span>
                <span>{approvedReviews.length} avaliações</span>
                <span>•</span>
                <span className={`px-2 py-0.5 rounded-full text-xs font-mono font-bold bg-neutral-900 border border-zinc-700 uppercase`}>
                  {tenant.fontFamily}
                </span>
                {tenant.socials?.whatsapp && (
                  <>
                    <span>•</span>
                    <a 
                      href={`https://wa.me/55${tenant.socials.whatsapp.replace(/\D/g,"")}`}
                      target="_blank"
                      rel="noreferrer"
                      className="flex items-center gap-1.5 px-2.5 py-1 text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 hover:bg-emerald-500/20 rounded-full transition-colors font-semibold"
                      title="Chamar no WhatsApp"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51a12.8 12.8 0 0 0-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413Z"/></svg>
                      WhatsApp
                    </a>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* BARRA DISCRETA DE REDES SOCIAIS E AÇÕES ABAIXO DO BANNER (AZUL EXCLUSIVO PARA JKA TURISMO) */}
      <div className={`${tenant.slug === 'jkaturismo' ? 'bg-[#002b5b] border-blue-900' : 'bg-zinc-900/90 border-zinc-800'} border-b backdrop-blur-md sticky top-0 z-20 py-3 px-4 sm:px-8`}>
        <div className="max-w-6xl mx-auto flex items-center justify-end gap-5 text-sm">
          
          {/* Ícones de Redes Sociais */}
          <div className="flex items-center gap-4">
            {tenant.socials?.whatsapp && (
              <a
                href={`https://wa.me/55${tenant.socials.whatsapp.replace(/\D/g, "")}`}
                target="_blank"
                rel="noreferrer"
                className="text-emerald-400 hover:text-emerald-300 transition-colors cursor-pointer"
                title="WhatsApp"
              >
                <Phone size={20} />
              </a>
            )}

            {Object.entries(tenant.socials || {}).map(([platform, link]) => {
              if (!link || platform === "whatsapp" || platform === "phone" || platform === "email") return null;

              let href = link;
              if (!link.startsWith("http://") && !link.startsWith("https://")) {
                href = `https://${link}`;
              }

              let IconComp = Globe;
              let title = platform.charAt(0).toUpperCase() + platform.slice(1);
              if (platform === "instagram") IconComp = Instagram;
              else if (platform === "facebook") IconComp = Facebook;
              else if (platform === "youtube") IconComp = Youtube;
              else if (platform === "twitter") IconComp = Twitter;
              else if (platform === "tiktok" || platform === "kwai") IconComp = Video;

              return (
                <a
                  key={platform}
                  href={href}
                  target="_blank"
                  rel="noreferrer"
                  className="text-zinc-300 hover:text-white transition-colors cursor-pointer"
                  title={title}
                >
                  <IconComp size={20} />
                </a>
              );
            })}

            {/* Ícone de Cartão Inteligente Sem Moldura */}
            <button
              onClick={() => setShowDigitalCard(true)}
              className="text-yellow-400 hover:text-yellow-300 transition-colors cursor-pointer flex items-center gap-1.5 font-semibold text-xs"
              title="Cartão Inteligente"
            >
              <Smartphone size={20} />
              <span className="hidden sm:inline">Cartão Inteligente</span>
            </button>

            {/* Ícone de Compartilhar Sem Moldura */}
            <button
              onClick={() => {
                const url = encodeURIComponent(window.location.href);
                const text = encodeURIComponent(`Confira o site de ${tenant.name}!`);
                window.open(`https://api.whatsapp.com/send?text=${text}%20${url}`);
              }}
              className="text-zinc-300 hover:text-white transition-colors cursor-pointer"
              title="Compartilhar Link"
            >
              <Share2 size={20} />
            </button>
          </div>

        </div>
      </div>

      {/* CORE INFORMATION GRID */}
      <main className={containerClass}>
        
        {/* LEFT COLUMN: ABOUT / MAPS / HOURS */}
        <section className={brandColumnClass}>
          {/* Quick BIO */}
          <div className={cardClass}>
            <h2 className="text-lg font-bold">Quem Somos</h2>
            <p className={`${themeMode === 'dark' ? 'text-zinc-400' : 'text-zinc-650'} text-sm leading-relaxed`}>
              {tenant.description}
            </p>
            
            {/* Ícones de info — ocultos para jkaturismo pois aparecem nos cards abaixo */}
            {tenant.slug !== 'jkaturismo' && (
              <div className="space-y-3 pt-2 text-sm">
                <div className="flex items-start gap-2.5">
                  <MapPin className={`${themeColors.text} shrink-0 mt-0.5`} size={16} />
                  <span className="text-xs leading-tight">{tenant.address}</span>
                </div>
                <div className="flex items-center gap-2.5">
                  <Clock className={`${themeColors.text} shrink-0`} size={16} />
                  <span className="text-xs">{tenant.openingHours}</span>
                </div>
                <div className="flex items-center gap-2.5">
                  <Phone className={`${themeColors.text} shrink-0`} size={16} />
                  <span className="text-xs">{tenant.socials.phone || tenant.socials.whatsapp}</span>
                </div>
              </div>
            )}

            {/* JKA TURISMO - Info Cards: Endereço, Horários, Contatos */}
            {tenant.slug === 'jkaturismo' && (
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-4">
                {/* Card Endereço */}
                <div className="rounded-xl p-4 flex flex-col gap-2" style={{ backgroundColor: '#3a3a3a' }}>
                  <h4 className="text-white text-xs tracking-widest font-bold uppercase border-b border-white/20 pb-2">Endereço</h4>
                  <div className="w-6 border-t-2 border-white/40 mb-1" />
                  <p className="text-zinc-200 text-xs leading-relaxed">
                    {tenant.address || 'Rua do Panta nº 38 Fazenda Garcia - Salvador - BA'}
                  </p>
                </div>

                {/* Card Horários */}
                <div className="rounded-xl p-4 flex flex-col gap-2" style={{ backgroundColor: '#5a6a6a' }}>
                  <h4 className="text-white text-xs tracking-widest font-bold uppercase border-b border-white/20 pb-2">Horários</h4>
                  <div className="w-6 border-t-2 border-white/40 mb-1" />
                  <p className="text-zinc-200 text-xs leading-relaxed">
                    Segunda - Sexta: 08:00hs às 18:00hs<br />
                    Sábado: 08:00hs às 13:00hs
                  </p>
                </div>

                {/* Card Contatos */}
                <div className="rounded-xl p-4 flex flex-col gap-2" style={{ backgroundColor: '#2aa87a' }}>
                  <h4 className="text-white text-xs tracking-widest font-bold uppercase border-b border-white/20 pb-2">Contatos</h4>
                  <div className="w-6 border-t-2 border-white/40 mb-1" />
                  <div className="text-zinc-200 text-xs leading-relaxed space-y-1">
                    {tenant.socials?.phone && (
                      <p>Tel: {tenant.socials.phone}</p>
                    )}
                    {tenant.socials?.whatsapp && (
                      <p>WhatsApp: {tenant.socials.whatsapp}</p>
                    )}
                    {(tenant as any).email && (
                      <p>E-mail: {(tenant as any).email}</p>
                    )}
                    {!tenant.socials?.phone && !tenant.socials?.whatsapp && (
                      <p>71 98723-5349</p>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Map Location */}
          <div className={cardClass}>
            <h3 className="text-sm font-bold px-2">Localização</h3>
            <div className="w-full h-44 bg-neutral-800 rounded-xl overflow-hidden relative">
              {(() => {
                const isEmbedLink = tenant.mapLocation && (tenant.mapLocation.includes("embed") || tenant.mapLocation.includes("iframe") || tenant.mapLocation.includes("google.com/maps"));
                const mapSrc = isEmbedLink 
                  ? tenant.mapLocation 
                  : `https://maps.google.com/maps?q=${encodeURIComponent(tenant.mapLocation || tenant.address)}&t=&z=15&ie=UTF8&iwloc=&output=embed`;
                
                return (
                  <iframe 
                    src={mapSrc} 
                    className="w-full h-full border-0" 
                    allowFullScreen={false} 
                    loading="lazy"
                  ></iframe>
                );
              })()}
            </div>
          </div>
        </section>

        {/* RIGHT COLUMN: CORE INTERACTIVE AREA */}
        <section className={contentColumnClass}>
          
          {/* Layout Tab selectors */}
          <div className={`border-b ${tenant.slug === 'jkaturismo' ? 'border-zinc-200' : 'border-zinc-800'} flex gap-6 text-sm font-medium overflow-x-auto`}>
            <button 
              onClick={() => setActiveTab('services')}
              className={`pb-3 relative cursor-pointer whitespace-nowrap ${activeTab === 'services' ? (tenant.slug === 'jkaturismo' ? 'text-[#002b5b] font-bold' : `${themeColors.text} font-bold`) : (tenant.slug === 'jkaturismo' ? 'text-black hover:text-[#002b5b]' : 'text-zinc-400 hover:text-zinc-200')}`}
            >
              Serviços Disponíveis
              {activeTab === 'services' && <div className={`absolute bottom-0 left-0 right-0 h-0.5 ${tenant.slug === 'jkaturismo' ? 'bg-[#002b5b]' : themeColors.bg}`}></div>}
            </button>
            <button 
              onClick={() => setActiveTab('reviews')}
              className={`pb-3 relative cursor-pointer whitespace-nowrap ${activeTab === 'reviews' ? (tenant.slug === 'jkaturismo' ? 'text-[#002b5b] font-bold' : `${themeColors.text} font-bold`) : (tenant.slug === 'jkaturismo' ? 'text-black hover:text-[#002b5b]' : 'text-zinc-400 hover:text-zinc-200')}`}
            >
              Avaliações ({approvedReviews.length})
              {activeTab === 'reviews' && <div className={`absolute bottom-0 left-0 right-0 h-0.5 ${tenant.slug === 'jkaturismo' ? 'bg-[#002b5b]' : themeColors.bg}`}></div>}
            </button>
            <button 
              onClick={() => setActiveTab('about')}
              className={`pb-3 relative cursor-pointer whitespace-nowrap ${activeTab === 'about' ? (tenant.slug === 'jkaturismo' ? 'text-[#002b5b] font-bold' : `${themeColors.text} font-bold`) : (tenant.slug === 'jkaturismo' ? 'text-black hover:text-[#002b5b]' : 'text-zinc-400 hover:text-zinc-200')}`}
            >
              Receber Ofertas
              {activeTab === 'about' && <div className={`absolute bottom-0 left-0 right-0 h-0.5 ${tenant.slug === 'jkaturismo' ? 'bg-[#002b5b]' : themeColors.bg}`}></div>}
            </button>
            <button 
              onClick={() => setActiveTab('products')}
              className={`pb-3 relative cursor-pointer whitespace-nowrap ${activeTab === 'products' ? (tenant.slug === 'jkaturismo' ? 'text-[#002b5b] font-bold' : `${themeColors.text} font-bold`) : (tenant.slug === 'jkaturismo' ? 'text-black hover:text-[#002b5b]' : 'text-zinc-400 hover:text-zinc-200')}`}
            >
              Produtos à Venda
              {activeTab === 'products' && <div className={`absolute bottom-0 left-0 right-0 h-0.5 ${tenant.slug === 'jkaturismo' ? 'bg-[#002b5b]' : themeColors.bg}`}></div>}
            </button>
            {tenant.socials?.instagram && (
              <button 
                onClick={() => setActiveTab('instagram')}
                className={`pb-3 relative cursor-pointer whitespace-nowrap ${activeTab === 'instagram' ? (tenant.slug === 'jkaturismo' ? 'text-[#002b5b] font-bold' : `${themeColors.text} font-bold`) : (tenant.slug === 'jkaturismo' ? 'text-black hover:text-[#002b5b]' : 'text-zinc-400 hover:text-zinc-200')}`}
              >
                Instagram
                {activeTab === 'instagram' && <div className={`absolute bottom-0 left-0 right-0 h-0.5 ${tenant.slug === 'jkaturismo' ? 'bg-[#002b5b]' : themeColors.bg}`}></div>}
              </button>
            )}
            <button 
              onClick={() => setActiveTab('contact')}
              className={`pb-3 relative cursor-pointer whitespace-nowrap ${activeTab === 'contact' ? (tenant.slug === 'jkaturismo' ? 'text-[#002b5b] font-bold' : `${themeColors.text} font-bold`) : (tenant.slug === 'jkaturismo' ? 'text-black hover:text-[#002b5b]' : 'text-zinc-400 hover:text-zinc-200')}`}
            >
              Fale Conosco
              {activeTab === 'contact' && <div className={`absolute bottom-0 left-0 right-0 h-0.5 ${tenant.slug === 'jkaturismo' ? 'bg-[#002b5b]' : themeColors.bg}`}></div>}
            </button>
          </div>

          {/* TAB 1: SERVICES LIST */}
          {activeTab === 'services' && (
            <div className="space-y-4">
              {tenant.services.length === 0 ? (
                <div className="text-center py-12 text-zinc-500">Nenhum serviço disponível no momento.</div>
              ) : (
                <div className={isMinimal ? "divide-y divide-zinc-800/20" : "grid grid-cols-1 md:grid-cols-2 gap-4"}>
                  {tenant.services.map((service) => (
                    <div 
                      key={service.id}
                      className={serviceItemClass}
                    >
                      <div className="flex gap-3">
                        {service.imageUrl && (
                          <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-xl bg-zinc-800 overflow-hidden shrink-0 shadow-md border border-zinc-700/50">
                            <img src={service.imageUrl} alt={service.name} className="w-full h-full object-cover" />
                          </div>
                        )}
                        <div className="space-y-1 flex-1">
                          <h3 className="font-bold text-sm line-clamp-1">{service.name}</h3>
                          <p className={`text-xs ${themeMode === 'dark' ? 'text-zinc-400' : 'text-neutral-500'} line-clamp-3`}>
                            {service.description}
                          </p>
                          {/* Ícone Estilo OLX - Total de Visitas/Visualizações em Tempo Real */}
                          <div className={`flex items-center gap-1 text-[11px] font-medium pt-1 ${tenant.slug === 'jkaturismo' ? 'text-emerald-500' : 'text-zinc-400'}`}>
                            <User size={13} className={`shrink-0 ${tenant.slug === 'jkaturismo' ? 'text-emerald-500' : 'text-zinc-400'}`} />
                            <span>{service.views ?? Math.floor(150 + Math.random() * 200)} visitas</span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center justify-between pt-1 border-t border-zinc-850">
                        <div className="space-y-0.5">
                          {service.priceOnRequest ? (
                            <span className={`font-bold ${tenant.slug === 'jkaturismo' ? 'text-emerald-500 text-xs' : 'text-amber-400 text-sm'}`}>Sob Consulta</span>
                          ) : (
                            <span className="text-emerald-500 font-bold text-sm">R$ {service.price.toFixed(2)}</span>
                          )}
                          <span className={`block text-[10px] ${themeMode === 'dark' ? 'text-zinc-500' : 'text-zinc-400'}`}>Duração: {service.duration} mins</span>
                        </div>
                        <button 
                          onClick={() => {
                            setSelectedService(service);
                            setShowBookingModal(true);
                          }}
                          className={`px-3 py-1.5 rounded-lg text-white font-semibold text-xs flex items-center gap-1 cursor-pointer transition-transform duration-100 active:scale-95 ${themeColors.bg} ${themeColors.bgHover}`}
                        >
                          <Calendar size={12} />
                          <span>Detalhes/Agendar</span>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 2: REVIEWS */}
          {activeTab === 'reviews' && (
            <div className="space-y-6">
              {/* Review Input Box */}
              <div className={cardClass}>
                <h3 className="font-bold text-sm mb-4">Deixe sua Avaliação Pública</h3>
                
                {reviewSuccess ? (
                  <div className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-lg p-4 text-xs flex items-center gap-2">
                    <CheckCircle size={16} />
                    <span>Sua recomendação foi registrada! O lojista analisará seu feedback para aprovação no mini-CRM.</span>
                  </div>
                ) : (
                  <form onSubmit={handleReviewSubmit} className="space-y-4 text-xs">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-zinc-450 mb-1">Seu Nome</label>
                        <input 
                          type="text" 
                          required
                          value={reviewAuthor}
                          onChange={(e) => setReviewAuthor(e.target.value)}
                          placeholder="Ex: Clara Silva" 
                          className={`w-full p-2.5 rounded bg-zinc-805 border ${themeMode === 'dark' ? 'border-zinc-700 text-white' : 'border-neutral-300 text-neutral-900'} focus:outline-none focus:border-zinc-500`}
                        />
                      </div>
                      <div>
                        <label className="block text-zinc-450 mb-1">Nota (Estrelas)</label>
                        <select 
                          value={reviewRating}
                          onChange={(e) => setReviewRating(Number(e.target.value))}
                          className={`w-full p-2.5 rounded bg-zinc-805 border ${themeMode === 'dark' ? 'border-zinc-700 text-white font-bold' : 'border-neutral-300 text-neutral-900'} focus:outline-none`}
                        >
                          <option value="5">⭐⭐⭐⭐⭐ (5 estrelas)</option>
                          <option value="4">⭐⭐⭐⭐ (4 estrelas)</option>
                          <option value="3">⭐⭐⭐ (3 estrelas)</option>
                          <option value="2">⭐⭐ (2 estrelas)</option>
                          <option value="1">⭐ (1 estrela)</option>
                        </select>
                      </div>
                    </div>
                    <div>
                      <label className="block text-zinc-450 mb-1">Seu Comentário</label>
                      <textarea 
                        rows={3}
                        required
                        value={reviewComment}
                        onChange={(e) => setReviewComment(e.target.value)}
                        placeholder="Escreva sobre sua experiência..." 
                        className={`w-full p-2.5 rounded bg-zinc-805 border ${themeMode === 'dark' ? 'border-zinc-700 text-white' : 'border-neutral-300'}`}
                      ></textarea>
                    </div>

                    <button 
                      type="submit" 
                      disabled={reviewSubmitting}
                      className={`w-full py-2 bg-zinc-800 text-white font-bold rounded-lg border border-zinc-700 hover:bg-zinc-750 cursor-pointer transition-colors ${reviewSubmitting ? 'opacity-50' : ''}`}
                    >
                      {reviewSubmitting ? "Enviando..." : "Enviar Avaliação"}
                    </button>
                  </form>
                )}
              </div>

              {/* Verified List */}
              <div className="space-y-4">
                <h4 className="font-bold text-sm text-zinc-400">Depoimentos Aprovados ({approvedReviews.length})</h4>
                {approvedReviews.length === 0 ? (
                  <div className="text-zinc-500 text-xs py-4">Nenhum depoimento de cliente exibido ainda.</div>
                ) : (
                  <div className="space-y-3">
                    {approvedReviews.map((rev) => (
                      <div 
                        key={rev.id} 
                        className={`p-4 rounded-xl border ${themeMode === 'dark' ? 'bg-zinc-900/60 border-zinc-800' : 'bg-white border-zinc-150 shadow-sm'}`}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <div className="font-bold text-xs">{rev.author}</div>
                          <div className="flex text-yellow-500">
                            {Array.from({ length: rev.rating }).map((_, i) => (
                              <Star key={i} fill="currentColor" size={12} />
                            ))}
                          </div>
                        </div>
                        <p className={`text-xs ${themeMode === 'dark' ? 'text-zinc-400' : 'text-zinc-600'} italic`}>
                          "{rev.comment}"
                        </p>
                        <span className="block text-[10px] text-zinc-500 mt-2 text-right">{rev.date}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

            </div>
          )}

          {/* TAB 3: CONTACT FORM */}
          {activeTab === 'about' && (
            <div className={`p-6 rounded-2xl border text-xs space-y-4 ${themeMode === 'dark' ? 'bg-zinc-900 border-zinc-800' : 'bg-white border-zinc-200'}`}>
              <h3 className="font-bold text-sm">Gostaria de Orçamento Exclusivo?</h3>
              <p className="text-zinc-400">Preencha os campos para receber ofertas exclusivas antecipadas.</p>
              
              <div className="space-y-3">
                <input 
                  type="text" 
                  placeholder="Seu Nome Completo" 
                  className={`w-full p-2.5 rounded border ${themeMode === 'dark' ? 'bg-zinc-950 border-zinc-750 text-white' : 'bg-white border-neutral-300 text-neutral-900'}`}
                />
                <input 
                  type="text" 
                  placeholder="Seu WhatsApp" 
                  className={`w-full p-2.5 rounded border ${themeMode === 'dark' ? 'bg-zinc-950 border-zinc-750 text-white' : 'bg-white border-neutral-300 text-neutral-900'}`}
                />
                <textarea 
                  rows={3}
                  placeholder="Quais serviços você tem interesse e para qual data?" 
                  className={`w-full p-2.5 rounded border ${themeMode === 'dark' ? 'bg-zinc-950 border-zinc-750 text-white' : 'bg-white border-neutral-300 text-neutral-900'}`}
                ></textarea>
                <button 
                  onClick={() => alert("Simulado: Orçamento enviado diretamente para a caixa de mensagens e pipeline do mini-CRM!")}
                  className={`w-full p-2.5 text-white font-medium rounded-lg shadow cursor-pointer text-center ${themeColors.bg} ${themeColors.bgHover}`}
                >
                  Confirmar e Receber Ofertas
                </button>
              </div>
            </div>
          )}

          {/* TAB 4: PRODUCTS FOR SALE */}
          {activeTab === 'products' && (
            <div className="space-y-4">
              {(!tenant.productsToSell || tenant.productsToSell.length === 0) ? (
                <div className={`p-12 text-center rounded-2xl border ${themeMode === 'dark' ? 'bg-zinc-900 border-zinc-800' : 'bg-white border-zinc-200'}`}>
                  <p className="text-zinc-500 text-xs text-zinc-400">Nenhum produto cadastrado para venda no momento.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {tenant.productsToSell.map((product) => {
                    const message = encodeURIComponent(`Olá! Gostaria de comprar o produto ${product.name} no valor de R$ ${product.price.toFixed(2)}. Está disponível?`);
                    const cleanPhone = (tenant.socials?.whatsapp || "(11) 99999-8888").replace(/\D/g, "");
                    const waLink = `https://api.whatsapp.com/send?phone=55${cleanPhone}&text=${message}`;

                    // Configuração de link para o botão de acordo com a opção de pagamento/checkout ativa
                    let purchaseLink = waLink;
                    let purchaseLabel = "Falar com Vendedor";
                    
                    if (tenant.paymentConfig?.enabled) {
                      const gateway = tenant.paymentConfig.gateway;
                      if (gateway === "pix_whatsapp" && tenant.paymentConfig.pixKey) {
                        const pixMsg = encodeURIComponent(
                          `Olá! Gostaria de comprar o produto *${product.name}* no valor de *R$ ${product.price.toFixed(2)}*.\n\n*Informações de pagamento Pix:*\nChave Pix: ${tenant.paymentConfig.pixKey}\nBeneficiário: ${tenant.paymentConfig.pixHolderName || tenant.ownerName}`
                        );
                        purchaseLink = `https://api.whatsapp.com/send?phone=55${cleanPhone}&text=${pixMsg}`;
                        purchaseLabel = "Pagar via Pix / WhatsApp";
                      } else if (gateway === "stripe") {
                        purchaseLink = `/api/checkout-session?gateway=stripe&productId=${product.id}&tenantSlug=${tenant.slug}`;
                        purchaseLabel = "Comprar com Stripe";
                      } else if (gateway === "mercadopago") {
                        purchaseLink = `/api/checkout-session?gateway=mercadopago&productId=${product.id}&tenantSlug=${tenant.slug}`;
                        purchaseLabel = "Comprar com Mercado Pago";
                      } else if (gateway === "pagbank") {
                        purchaseLink = `/api/checkout-session?gateway=pagbank&productId=${product.id}&tenantSlug=${tenant.slug}`;
                        purchaseLabel = "Comprar com PagBank";
                      }
                    }

                    return (
                      <div 
                        key={product.id}
                        className={`p-4 rounded-2xl border flex flex-col justify-between transition-all duration-300 transform hover:scale-[1.01] ${
                          themeMode === 'dark' 
                            ? 'bg-zinc-900 border-zinc-800/80 hover:border-zinc-700 shadow-xl' 
                            : 'bg-white border-slate-200/90 shadow-sm hover:shadow-md text-slate-800'
                        }`}
                      >
                        <div className="space-y-3">
                          {product.imageUrl && (
                            <div className="w-full h-40 rounded-xl bg-zinc-800 overflow-hidden shadow-inner relative group border border-zinc-800/20">
                              <img 
                                src={product.imageUrl} 
                                alt={product.name} 
                                className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105" 
                                referrerPolicy="no-referrer"
                              />
                              <span className="absolute top-2.5 right-2.5 bg-emerald-500/90 text-white backdrop-blur px-2.5 py-1 rounded-full text-[9px] font-mono font-bold tracking-tight">
                                Disponível
                              </span>
                            </div>
                          )}
                          <div className="space-y-1">
                            <h3 className={`font-extrabold text-sm tracking-tight ${themeMode === 'dark' ? 'text-white' : 'text-slate-900'}`}>{product.name}</h3>
                            <p className={`text-xs ${themeMode === 'dark' ? 'text-zinc-400' : 'text-slate-500'} leading-relaxed line-clamp-3`}>
                              {product.description}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center justify-between pt-3 mt-3 border-t border-zinc-800/30">
                          <div className="space-y-0.5">
                            <span className="text-[9px] text-zinc-500 block uppercase tracking-wide">Valor do Produto</span>
                            <span className={`text-sm font-black tracking-tight ${themeColors.text}`}>
                              R$ {product.price.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                            </span>
                          </div>
                          
                          <a 
                            href={purchaseLink}
                            target={purchaseLink.startsWith("http") ? "_blank" : "_self"}
                            rel="noreferrer"
                            className="px-3.5 py-2 rounded-xl text-white font-bold text-xs flex items-center gap-1.5 cursor-pointer bg-emerald-600 hover:bg-emerald-500 transition-all duration-100 active:scale-95 shadow-lg shadow-emerald-600/10 shrink-0"
                          >
                            <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
                              <path d="M12.031 6.172c-3.202 0-5.805 2.603-5.805 5.806 0 1.041.273 2.059.796 2.964l-.847 3.093 3.164-.83c.875.477 1.86.729 2.865.729 3.203 0 5.854-2.603 5.854-5.806 0-3.203-2.651-5.806-5.854-5.806zm4.186 7.915c-.172-.086-1.02-.504-1.177-.562-.158-.058-.273-.086-.388.087-.116.172-.446.562-.547.677-.101.115-.202.13-.374.043-.172-.086-.729-.268-1.39-.857-.514-.458-.861-1.025-.961-1.198-.101-.172-.011-.266.075-.352.078-.077.172-.202.259-.302.087-.101.115-.172.173-.287.058-.115.029-.216-.014-.302-.043-.087-.389-.936-.533-1.282-.14-.338-.282-.292-.388-.297-.101-.005-.216-.005-.331-.005-.115 0-.302.043-.46.216-.158.173-.604.59-.604 1.439 0 .849.619 1.669.705 1.784.087.115 1.218 1.86 2.951 2.61.412.178.734.284.985.364.415.13.791.112 1.09.067.331-.05 1.02-.417 1.164-.819.144-.403.144-.748.1-.82-.043-.072-.158-.115-.331-.201zM12 .003C5.373.003 0 5.377 0 12c0 2.112.551 4.103 1.516 5.855L.231 22.955a.8.8 0 0 0 .937.938l5.101-1.284A11.9 11.9 0 0 0 12 23.997c6.627 0 12-5.374 12-12s-5.373-11.994-12-11.994zM12 21.997a9.907 9.907 0 0 1-5.116-1.4 1 1 0 0 0-.742-.112l-3.238.815.828-3.029a1 1 0 0 0-.083-.81A9.914 9.914 0 0 1 2.052 12c0-5.485 4.463-9.997 9.948-9.997 5.485 0 10.003 4.512 10.003 9.997s-4.518 9.997-10.003 9.997z"/>
                            </svg>
                            {purchaseLabel}
                          </a>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* TAB 5: INSTAGRAM GALLERY ONLY */}
          {activeTab === 'instagram' && (
            <div className="space-y-6">
              {tenant.socials?.instagram && (
                <div className={`p-6 rounded-2xl border text-center ${themeMode === 'dark' ? 'bg-zinc-900 border-zinc-800' : 'bg-white border-zinc-200'}`}>
                  <div className="flex items-center justify-center gap-2 mb-4">
                    <Instagram className="text-pink-500" size={24} />
                    <h3 className="font-bold text-lg">Nosso Instagram</h3>
                  </div>
                  <p className={`text-sm mb-6 ${themeMode === 'dark' ? 'text-zinc-400' : 'text-zinc-500'}`}>
                    Acompanhe nossas novidades, produtos e serviços pelo nosso perfil!
                  </p>
                  
                  {(() => {
                    const customPhotos = (tenant as any).instagramPhotos?.filter((u: string) => u && u.trim()) || [];
                    const placeholderPhotos = [
                      'https://images.unsplash.com/photo-1518611012118-696072aa579a?w=300&h=300&fit=crop',
                      'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=300&h=300&fit=crop',
                      'https://images.unsplash.com/photo-1506629082955-511b1aa562c8?w=300&h=300&fit=crop',
                      'https://images.unsplash.com/photo-1540497077202-7c8a3999166f?w=300&h=300&fit=crop',
                      'https://images.unsplash.com/photo-1593079831268-3381b0db4a77?w=300&h=300&fit=crop',
                      'https://images.unsplash.com/photo-1583454110551-21f2fa2afe61?w=300&h=300&fit=crop',
                    ];
                    const photos = customPhotos.length > 0 ? customPhotos : placeholderPhotos;
                    return (
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-6">
                        {photos.slice(0, 6).map((src: string, i: number) => {
                          const instagramUser = tenant.socials?.instagram || "";
                          const instagramLink = instagramUser.startsWith('http') 
                            ? instagramUser 
                            : `https://instagram.com/${instagramUser.replace('@', '')}`;
                          
                          const isCustom = customPhotos.length > 0;
                          const linkUrl = isCustom ? instagramLink : src;
                          const imgSrc = src.startsWith("data:") ? src : getInstagramMediaUrl(src);

                          return (
                            <a
                              key={i}
                              href={linkUrl}
                              target="_blank"
                              rel="noreferrer"
                              className="aspect-square bg-gradient-to-tr from-[#f09433] via-[#e6683c] to-[#bc1888] rounded-xl overflow-hidden relative group shadow-lg cursor-pointer block"
                            >
                              <img
                                src={imgSrc}
                                alt={`Instagram post ${i + 1}`}
                                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110 opacity-90 group-hover:opacity-100 absolute inset-0 z-10"
                                referrerPolicy="no-referrer"
                                onError={(e) => {
                                  (e.target as HTMLImageElement).style.display = 'none';
                                }}
                              />
                              <div className="absolute inset-0 flex flex-col items-center justify-center p-3 text-center bg-zinc-900/90 z-0">
                                <Instagram className="text-zinc-500 w-8 h-8 mb-1 animate-pulse" />
                                <span className="text-[9px] text-zinc-600 font-mono">Ver no Instagram</span>
                              </div>
                              <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center z-20">
                                <div className="w-10 h-10 bg-white/10 backdrop-blur-md rounded-full flex items-center justify-center">
                                  <Instagram className="text-white w-5 h-5" />
                                </div>
                              </div>
                            </a>
                          );
                        })}
                      </div>
                    );
                  })()}

                  <a 
                    href={tenant.socials.instagram.startsWith('http') ? tenant.socials.instagram : `https://instagram.com/${tenant.socials.instagram.replace('@', '')}`}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl text-white font-bold text-sm shadow-lg cursor-pointer bg-gradient-to-tr from-yellow-500 via-pink-500 to-purple-600 hover:opacity-90 transition-opacity"
                  >
                    <Instagram size={18} />
                    Ver Perfil Completo
                  </a>
                </div>
              )}
            </div>
          )}

          {/* TAB 6: FALE CONOSCO (Formulário Separado) */}
          {activeTab === 'contact' && (
            <div className="space-y-6">
              <div className={`p-6 rounded-2xl border max-w-xl mx-auto ${themeMode === 'dark' ? 'bg-zinc-900 border-zinc-800' : 'bg-white border-zinc-200'}`}>
                <h3 className={`text-xl font-black text-center mb-2 ${themeMode === 'dark' ? 'text-white' : 'text-zinc-900'}`}>
                  {tenant.customForm?.title || 'Fale Conosco'}
                </h3>
                <p className="text-center text-xs text-zinc-400 mb-6">
                  Preencha os dados abaixo para entrar em contato diretamente conosco.
                </p>
                <form
                  onSubmit={async (e) => {
                    e.preventDefault();
                    const formEl = e.currentTarget;
                    const data: Record<string, string> = {};
                    
                    if (tenant.customForm?.fields && tenant.customForm.fields.length > 0) {
                      tenant.customForm.fields.forEach((field) => {
                        const el = formEl.elements.namedItem(field.id) as HTMLInputElement | HTMLTextAreaElement;
                        if (el) data[field.label] = el.value;
                      });
                    } else {
                      const nameEl = formEl.elements.namedItem('fullName') as HTMLInputElement;
                      const emailEl = formEl.elements.namedItem('contactEmail') as HTMLInputElement;
                      const msgEl = formEl.elements.namedItem('messageContent') as HTMLTextAreaElement;
                      if (nameEl) data['Nome Completo'] = nameEl.value;
                      if (emailEl) data['E-mail'] = emailEl.value;
                      if (msgEl) data['Mensagem'] = msgEl.value;
                    }

                    if (tenant.customForm?.destination === 'whatsapp' || !tenant.customForm?.enabled) {
                      const targetPhone = tenant.customForm?.destinationWhatsapp || (tenant.socials?.whatsapp || tenant.socials?.phone || "").replace(/\D/g, "");
                      const msg = Object.entries(data).map(([k, v]) => `${k}: ${v}`).join('\n');
                      window.open(`https://api.whatsapp.com/send?phone=55${targetPhone}&text=${encodeURIComponent(msg)}`, '_blank');
                    } else {
                      await fetch(`/api/tenants/${tenant.slug}/submit-form`, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ data }),
                      });
                      alert('Mensagem enviada com sucesso!');
                    }
                    formEl.reset();
                  }}
                  className="space-y-4 text-xs font-sans"
                >
                  {tenant.customForm?.enabled && tenant.customForm.fields && tenant.customForm.fields.length > 0 ? (
                    tenant.customForm.fields.map((field) => (
                      <div key={field.id}>
                        <label className={`block text-xs mb-1 font-semibold ${themeMode === 'dark' ? 'text-zinc-400' : 'text-zinc-600'}`}>
                          {field.label}{field.required && <span className="text-rose-500 ml-1">*</span>}
                        </label>
                        {field.type === 'textarea' ? (
                          <textarea
                            name={field.id}
                            required={field.required}
                            placeholder={field.placeholder}
                            rows={3}
                            className={`w-full p-3 rounded-xl border text-sm outline-none ${themeMode === 'dark' ? 'bg-zinc-800 border-zinc-700 text-white' : 'bg-zinc-50 border-zinc-200 text-zinc-900'}`}
                          />
                        ) : (
                          <input
                            type={field.type}
                            name={field.id}
                            required={field.required}
                            placeholder={field.placeholder}
                            className={`w-full p-3 rounded-xl border text-sm outline-none ${themeMode === 'dark' ? 'bg-zinc-800 border-zinc-700 text-white' : 'bg-zinc-50 border-zinc-200 text-zinc-900'}`}
                          />
                        )}
                      </div>
                    ))
                  ) : (
                    <>
                      <div>
                        <label className={`block text-xs mb-1 font-semibold ${themeMode === 'dark' ? 'text-zinc-400' : 'text-zinc-600'}`}>
                          Nome Completo <span className="text-rose-500">*</span>
                        </label>
                        <input
                          type="text"
                          name="fullName"
                          required
                          placeholder="Digite seu nome"
                          className={`w-full p-3 rounded-xl border text-sm outline-none ${themeMode === 'dark' ? 'bg-zinc-800 border-zinc-700 text-white' : 'bg-zinc-50 border-zinc-200 text-zinc-900'}`}
                        />
                      </div>
                      <div>
                        <label className={`block text-xs mb-1 font-semibold ${themeMode === 'dark' ? 'text-zinc-400' : 'text-zinc-600'}`}>
                          E-mail de Contato <span className="text-rose-500">*</span>
                        </label>
                        <input
                          type="email"
                          name="contactEmail"
                          required
                          placeholder="seu@email.com"
                          className={`w-full p-3 rounded-xl border text-sm outline-none ${themeMode === 'dark' ? 'bg-zinc-800 border-zinc-700 text-white' : 'bg-zinc-50 border-zinc-200 text-zinc-900'}`}
                        />
                      </div>
                      <div>
                        <label className={`block text-xs mb-1 font-semibold ${themeMode === 'dark' ? 'text-zinc-400' : 'text-zinc-600'}`}>
                          Mensagem <span className="text-rose-500">*</span>
                        </label>
                        <textarea
                          name="messageContent"
                          required
                          placeholder="Como podemos te ajudar?"
                          rows={4}
                          className={`w-full p-3 rounded-xl border text-sm outline-none ${themeMode === 'dark' ? 'bg-zinc-800 border-zinc-700 text-white' : 'bg-zinc-50 border-zinc-200 text-zinc-900'}`}
                        />
                      </div>
                    </>
                  )}
                  <button
                    type="submit"
                    className={`w-full py-3.5 rounded-xl text-white font-extrabold text-sm transition-all cursor-pointer shadow-lg ${themeColors.bg} ${themeColors.bgHover}`}
                  >
                    Enviar Mensagem
                  </button>
                </form>
              </div>
            </div>
          )}

        </section>
      </main>

      {/* FOOTER METADATA */}
      <footer className="border-t border-zinc-800/40 mt-16 py-6 text-center text-[10px] text-zinc-500">
        <p>© 2026 {tenant.name}. Alugado no sistema SeusiteAlugado.</p>
        <p className="mt-1">Dispositivo móvel amigável • PWA Instalável • Assinatura Mensal {tenant.plan.toUpperCase()}</p>

        {/* CidEngenharia Badge */}
        <div className="mt-4 flex items-center justify-center gap-2">
          <style>{`
            @keyframes cid-pulse {
              0%, 100% { transform: scale(1); opacity: 0.9; }
              50% { transform: scale(1.12); opacity: 1; }
            }
            .cid-logo {
              animation: cid-pulse 2s ease-in-out infinite;
              transition: transform 0.2s ease;
            }
          `}</style>
          <img
            src="/cidengenharia_logo.jpeg"
            alt="CidEngenharia"
            className="cid-logo w-7 h-7 object-contain rounded-md"
          />
          <span className="text-[10px] tracking-widest" style={{
            background: "linear-gradient(90deg, #c026d3, #06b6d4)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            letterSpacing: "0.12em"
          }}>
            CidEngenharia
          </span>
        </div>
      </footer>

      {/* MODAL: SERVICE DETAILS & BOOKING WIZARD (ESTILO OLX) */}
      {showBookingModal && selectedService && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
          <div className="max-w-2xl w-full max-h-[90vh] overflow-y-auto bg-[#0a0b0e] border border-zinc-800/80 rounded-2xl p-4 sm:p-6 shadow-2xl relative text-white shadow-zinc-950/80 animate-in fade-in zoom-in-95 duration-150 my-auto">
            <button 
              onClick={() => setShowBookingModal(false)}
              className="absolute top-3 right-3 sm:top-4 sm:right-4 z-10 text-zinc-400 hover:text-white hover:bg-zinc-900 duration-150 w-8 h-8 rounded-full cursor-pointer flex items-center justify-center text-sm font-black border border-zinc-800/30"
            >
              ✕
            </button>

            {/* Banner/Imagem do Serviço Destaque OLX */}
            {selectedService.imageUrl && (
              <div className="w-full h-44 sm:h-56 md:h-64 rounded-xl bg-zinc-900 overflow-hidden mb-4 relative border border-zinc-800 shrink-0">
                <img 
                  src={selectedService.imageUrl} 
                  alt={selectedService.name} 
                  className="w-full h-full object-cover"
                />
                <div className="absolute bottom-3 left-3 bg-black/70 backdrop-blur-md px-3 py-1 rounded-lg flex items-center gap-1.5 text-xs text-zinc-200 border border-zinc-700 font-medium">
                  <User size={14} className="text-zinc-400 shrink-0" />
                  <span>{selectedService.views ?? Math.floor(150 + Math.random() * 200)} visitas</span>
                </div>
              </div>
            )}

            <div className="flex items-start justify-between gap-4 mb-3 border-b border-zinc-800 pb-3">
              <div>
                <h3 className="text-xl font-extrabold tracking-tight text-white">{selectedService.name}</h3>
                <p className="text-xs text-zinc-400 mt-1">{selectedService.description}</p>
              </div>
              <div className="text-right shrink-0">
                <span className="text-lg font-black text-emerald-400 block">R$ {selectedService.price.toFixed(2)}</span>
                <span className="text-[10px] text-zinc-400">Duração: {selectedService.duration} min</span>
              </div>
            </div>

            {bookingSuccess ? (
              <div className="text-center py-8 space-y-4">
                <div className="w-14 h-14 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 rounded-full flex items-center justify-center mx-auto text-2xl font-bold">
                  ✓
                </div>
                <div className="space-y-1">
                  <h4 className="font-extrabold text-sm text-white">Agendamento Realizado com Sucesso!</h4>
                  <p className="text-xs text-zinc-400">Um lembrete de confirmação foi disparado via WhatsApp.</p>
                  <p className="text-[9px] px-3 py-1.5 bg-zinc-950 border border-zinc-900 rounded-lg mt-3 text-zinc-400 font-mono inline-block">Confirmação automática de horário ativa no plano do lojista.</p>
                </div>
              </div>
            ) : (
              <form onSubmit={handleBookingSubmit} className="space-y-4 text-xs font-sans">
                <div className="space-y-3.5">
                  <div>
                    <label className="block text-zinc-400 font-bold mb-1.5 text-[11px]">Seu Nome Completo *</label>
                    <input 
                      type="text" 
                      required
                      value={bookingName}
                      onChange={(e) => setBookingName(e.target.value)}
                      placeholder="Ex: Carlos Drumond" 
                      className="w-full p-2.5 rounded-xl bg-zinc-900/60 border border-zinc-800 text-zinc-100 placeholder:text-zinc-500 focus:outline-none focus:border-zinc-500 transition-colors"
                    />
                  </div>
                  
                  <div className="grid grid-cols-2 gap-3.5">
                    <div>
                      <label className="block text-zinc-400 font-bold mb-1.5 text-[11px]">Seu WhatsApp *</label>
                      <input 
                        type="text" 
                        required
                        value={bookingPhone}
                        onChange={(e) => setBookingPhone(e.target.value)}
                        placeholder="Ex: (11) 98765-4321" 
                        className="w-full p-2.5 rounded-xl bg-zinc-900/60 border border-zinc-800 text-zinc-100 placeholder:text-zinc-500 focus:outline-none focus:border-zinc-505 transition-colors"
                      />
                    </div>
                    <div>
                      <label className="block text-zinc-400 font-bold mb-1.5 text-[11px]">E-mail (Opcional)</label>
                      <input 
                        type="email" 
                        value={bookingEmail}
                        onChange={(e) => setBookingEmail(e.target.value)}
                        placeholder="seu@email.com" 
                        className="w-full p-2.5 rounded-xl bg-zinc-900/60 border border-zinc-800 text-zinc-100 placeholder:text-zinc-550 focus:outline-none focus:border-zinc-530 transition-colors"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3.5">
                    <div>
                      <label className="block text-zinc-400 font-bold mb-1.5 text-[11px]">Data Desejada *</label>
                      <input 
                        type="date" 
                        required
                        value={bookingDate}
                        onChange={(e) => setBookingDate(e.target.value)}
                        className="w-full p-2.5 rounded-xl bg-zinc-900/60 border border-zinc-800 text-zinc-100 placeholder:text-zinc-500 focus:outline-none focus:border-zinc-500 transition-colors"
                      />
                    </div>
                    <div>
                      <label className="block text-zinc-400 font-bold mb-1.5 text-[11px]">Horário Disponível *</label>
                      <input 
                        type="time" 
                        required
                        value={bookingTime}
                        onChange={(e) => setBookingTime(e.target.value)}
                        className="w-full p-2.5 rounded-xl bg-zinc-905/60 border border-zinc-800 text-zinc-100 placeholder:text-zinc-500 focus:outline-none focus:border-zinc-500 transition-colors"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-zinc-400 font-bold mb-1.5 text-[11px]">Observações (Opcional)</label>
                    <textarea 
                      rows={2}
                      value={bookingNotes}
                      onChange={(e) => setBookingNotes(e.target.value)}
                      placeholder="Ex: Alguma alergia, preferência de corte, etc..." 
                      className="w-full p-2.5 rounded-xl bg-zinc-900/60 border border-zinc-800 text-zinc-100 placeholder:text-zinc-500 focus:outline-none focus:border-zinc-500 transition-colors"
                    ></textarea>
                  </div>
                </div>

                <div className="flex gap-3 pt-3">
                  <button 
                    type="button"
                    onClick={() => setShowBookingModal(false)}
                    className="flex-1 py-3 bg-zinc-90 w-full bg-zinc-900/60 hover:bg-zinc-850 text-zinc-300 font-bold rounded-xl border border-zinc-800/80 cursor-pointer duration-100 active:scale-95"
                  >
                    Voltar
                  </button>
                  <button 
                    type="submit"
                    className={`flex-1 py-3 text-white font-extrabold rounded-xl shadow-lg cursor-pointer duration-100 active:scale-95 transition-transform ${themeColors.bg} ${themeColors.bgHover}`}
                  >
                    Confirmar Reserva
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {/* OVERLAY MODAL: DIGITAL CARD */}
      {showDigitalCard && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="max-w-[260px] w-full bg-[#0a0b0e] border border-zinc-800/80 rounded-xl p-3 text-center text-white space-y-2 relative shadow-2xl animate-in fade-in zoom-in-95 duration-150">
            <button 
              onClick={() => setShowDigitalCard(false)}
              className="absolute top-3 right-3 text-zinc-400 hover:text-white hover:bg-zinc-900 duration-150 w-6 h-6 rounded-full cursor-pointer flex items-center justify-center text-[10px] font-black border border-zinc-800/30"
            >
              ✕
            </button>

            <span className="text-zinc-500 font-mono text-[8px] uppercase tracking-widest block font-bold">Cartão de Visita Digital</span>
            
            <div className="space-y-2 mt-1">
              <div className="w-full h-20 overflow-hidden mx-auto bg-zinc-800 border-b border-indigo-500/20 shadow-md">
                <img src={tenant.logoUrl} className="w-full h-full object-cover" alt="banner" />
              </div>
              
              <div className="text-center">
                <h4 className="font-extrabold text-base text-white">{tenant.name}</h4>
                <p className="text-[9px] text-zinc-400 leading-relaxed px-2 mt-0.5 font-medium">{tenant.description.slice(0, 80)}...</p>
                
                {/* Colored social icons */}
                <div className="flex justify-center gap-1 mt-2">
                </div>
              </div>
            </div>

            {/* Simulated QR Code using clear CSS boxes */}
            <div className="bg-white p-1.5 rounded-lg w-24 h-24 mx-auto flex flex-col items-center justify-center border border-zinc-150 shadow-inner mt-2">
              <QrCode size={60} className="text-neutral-950" />
              <span className="text-[6px] text-neutral-400 font-mono mt-0.5 font-black tracking-widest">SCAN ME</span>
            </div>

            {/* Redes Sociais */}
            <div className="mt-6">
              <h4 className="text-[9px] text-zinc-400 font-bold uppercase tracking-widest mb-2">Redes Sociais</h4>
              <div className="flex justify-center gap-2">
                  {Object.entries(tenant.socials).map(([platform, link]) => {
                    if (!link || platform === 'whatsapp' || platform === 'phone' || platform === 'email') return null;
                    
                    let IconComp = Globe;
                    let color = "text-zinc-400";
                    if (platform === 'instagram') { IconComp = Instagram; color = "text-pink-500"; }
                    else if (platform === 'facebook') { IconComp = Facebook; color = "text-blue-600"; }
                    else if (platform === 'youtube') { IconComp = Youtube; color = "text-red-600"; }
                    else if (platform === 'twitter') { IconComp = Twitter; color = "text-sky-400"; }
                    else if (platform === 'tiktok') { IconComp = Video; color = "text-zinc-100"; }

                    return (
                      <a key={platform} href={link} target="_blank" rel="noreferrer" className={`p-1.5 bg-zinc-900 rounded-full hover:bg-zinc-800 transition-colors ${color}`}>
                          <IconComp size={16} />
                      </a>
                    );
                  })}
              </div>
            </div>

            <div className="space-y-3 text-xs pt-6">
              {tenant.plan === 'basic' ? (
                <button 
                  onClick={downloadVCard}
                  className="w-full py-2.5 bg-zinc-800 hover:bg-zinc-700 text-white font-bold rounded-xl cursor-pointer flex items-center justify-center gap-2 hover:opacity-95 transition-all text-xs border border-zinc-700"
                >
                  <Download size={14} />
                  <span>Salvar Contato (.vcf)</span>
                </button>
              ) : (
                <>
                  <div className="grid grid-cols-3 gap-1 px-2">
                    <button 
                      onClick={downloadVCard}
                      className="py-2 bg-zinc-800 hover:bg-zinc-700 text-white font-bold rounded-xl cursor-pointer flex items-center justify-center gap-1 transition-all text-[9px] border border-zinc-700"
                    >
                      <Download size={10} />
                      <span>.vcf</span>
                    </button>
                    <button 
                      onClick={() => alert("PDF download feature coming soon!")}
                      className="py-2 bg-zinc-800 hover:bg-zinc-700 text-white font-bold rounded-xl cursor-pointer flex items-center justify-center gap-1 transition-all text-[9px] border border-zinc-700"
                    >
                      <Download size={10} />
                      <span>.pdf</span>
                    </button>
                    <a 
                      href={`https://wa.me/${(tenant.socials.whatsapp || tenant.socials.phone || "").replace(/\D/g, "")}?text=${encodeURIComponent(`Confira o Cartão de Visita Digital de *${tenant.name}*: ${window.location.href}`)}`}
                      target="_blank"
                      rel="noreferrer"
                      className="py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl cursor-pointer flex items-center justify-center gap-1 transition-all text-[9px]"
                    >
                      <Share2 size={10} />
                      <span>WhatsApp</span>
                    </a>
                  </div>
                  <div className="text-[10px] text-zinc-500 mt-3 text-center">
                    Acessar site: <a href={window.location.href} target="_blank" className="text-indigo-400 hover:underline">{window.location.hostname}{window.location.pathname}</a>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {/* UPGRADE PROMOTION MODAL */}
      {showUpgradeMessage && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="max-w-md w-full bg-[#0a0b0e] border border-amber-500/20 rounded-3xl p-7 text-center text-white space-y-6 relative shadow-2xl animate-in fade-in zoom-in-95 duration-150">
            <button 
              onClick={() => setShowUpgradeMessage(false)}
              className="absolute top-5 right-5 text-zinc-400 hover:text-white hover:bg-zinc-900 duration-150 w-8 h-8 rounded-full cursor-pointer flex items-center justify-center text-sm font-black border border-zinc-800/30"
            >
              ✕
            </button>

            <div className="w-14 h-14 bg-amber-500/10 text-amber-500 rounded-full flex items-center justify-center mx-auto text-2xl font-bold">
              <Lock size={26} />
            </div>

            <div className="space-y-3 text-center">
              <h3 className="text-xl font-extrabold text-white tracking-tight">Recurso Exclusivo do Plano Premium</h3>
              <p className="text-zinc-400 text-xs leading-relaxed px-2">
                O visual inteligente adaptativo **Claro e Escuro (Dark/Light Mode)** está desabilitado para esta página porque este site está configurado no **Plano {tenant.plan.toUpperCase()}**.
              </p>
              <p className="text-[10px] text-zinc-500 font-mono bg-zinc-90 w-full bg-zinc-900/60 border border-zinc-800 px-3 py-1.5 rounded-lg inline-block max-w-max">
                Plano: {tenant.plan.toUpperCase()} • upgrade imediato liberado
              </p>
            </div>

            <div className="pt-4 border-t border-zinc-900 space-y-3">
              <p className="text-[11px] text-zinc-400 font-bold mb-1">Como lojista, você pode destravar e ativar essa função agora:</p>
              <button 
                onClick={() => {
                  if (isAuthenticated) {
                    onEnterDashboard();
                  } else {
                    setShowAccessDenied(true);
                  }
                }}
                className="w-full py-3 bg-indigo-600 text-white font-extrabold rounded-xl cursor-pointer flex items-center justify-center gap-2 hover:bg-indigo-700 shadow-lg shadow-indigo-900/10 transition-colors text-xs"
              >
                ⚡ Ir para o Painel Administrativo do Site
              </button>
            </div>
          </div>
        </div>
      )}
      


      {/* WIDGET FLUTUANTE DE WHATSAPP */}
      {tenant.whatsappWidgetConfig?.enabled && tenant.whatsappWidgetConfig.phoneNumber && (
        <a
          href={`https://api.whatsapp.com/send?phone=${tenant.whatsappWidgetConfig.phoneNumber}&text=${encodeURIComponent(tenant.whatsappWidgetConfig.defaultMessage || 'Olá, vim pelo site!')}`}
          target="_blank"
          rel="noopener noreferrer"
          className="fixed bottom-6 right-6 z-50 flex items-center gap-2 bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-sm px-4 py-3 rounded-full shadow-2xl transition-all hover:scale-105 cursor-pointer"
          title="Falar no WhatsApp"
        >
          <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
          </svg>
          WhatsApp
        </a>
      )}

      {/* MODAL DE ACESSO NEGADO */}
      {showAccessDenied && (
        <div
          className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm"
          onClick={() => setShowAccessDenied(false)}
        >
          <div
            className="bg-zinc-900 border border-zinc-700 rounded-2xl shadow-2xl max-w-sm w-full p-7 text-center space-y-5 animate-fade-in"
            onClick={e => e.stopPropagation()}
          >
            {/* Ícone de alerta */}
            <div className="w-14 h-14 mx-auto rounded-full bg-rose-500/10 border border-rose-500/30 flex items-center justify-center">
              <Lock size={26} className="text-rose-400" />
            </div>

            {/* Título */}
            <div className="space-y-2">
              <h2 className="text-lg text-white" style={{ fontWeight: 700 }}>
                ⚠️ Atenção
              </h2>
              <p className="text-sm text-zinc-300 leading-relaxed">
                Você não tem privilégios para acesso a essa área.
                <br />
                <span className="text-zinc-400">
                  Contate o Administrador do Sistema.
                </span>
              </p>
            </div>

            {/* Botão fechar */}
            <button
              onClick={() => setShowAccessDenied(false)}
              className="w-full py-2.5 bg-rose-600 hover:bg-rose-700 text-white text-sm rounded-xl transition-all cursor-pointer"
            >
              Entendido
            </button>
          </div>
        </div>
      )}

    </div>
  );
}
