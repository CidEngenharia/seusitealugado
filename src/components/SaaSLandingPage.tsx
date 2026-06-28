/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from "react";
import { motion } from "motion/react";
import { 
  Building2, 
  Search, 
  Star, 
  Sparkles, 
  ShieldCheck, 
  Smartphone, 
  Check, 
  Rocket, 
  Users, 
  ArrowRight,
  TrendingUp,
  Settings,
  Menu,
  X,
  ChevronDown,
  Globe,
  Sun,
  Moon,
  MessageSquare,
  Send,
  ExternalLink,
  Laptop,
  CheckCircle2,
  MapPin,
  Clock,
  Phone,
  Share2,
  ShoppingBag,
  CreditCard,
  Megaphone
} from "lucide-react";
import { Tenant } from "../types";
import LogoSeusiteAlugado from "./LogoSeusiteAlugado";
import SetupModal from "./SetupModal";

interface SaaSLandingPageProps {
  tenants: Tenant[];
  onSelectTenant: (slug: string) => void;
  onGoToSearch: () => void;
  onGoToSuperAdmin: () => void;
  onGoToPortfolio: () => void;
}

// Translations Dictionary for complete PT-BR and EN-US fidelity
const translations = {
  pt: {
    heroTag: "A revolução do aluguel digital para Microempresas" ,
    heroTitle: "Alugue seu",
    heroTitleSpan: "Site profissional",
    heroTitleEnd: " em apenas 20 segundos",
    heroSub: "Tenha uma página com sua Identidade própria, totalmente customizável , com controle de agendamentos, estoque, faturamento, crm de fidelidade e assistente de IA deforma 100% pronta",
    searchPlaceholder: "Buscar por slug (Ex: barbeariakeu, oficinadocarlos)...",
    searchBtn: "Acessar Site",
    searchDemos: "Demos de teste:",
    marketplaceTitle: "Marketplace Lojistas SeusiteAlugado",
    marketplaceSub: "Conheça algumas empresas de altíssima performance instaladas em nossa infraestrutura na nuvem.",
    marketplaceDir: "Ver diretório estruturado",
    advantagesTitle: "O que está Incluso em um Aluguel de Sites",
    advantagesSub: "Quando você aluga seu site, não precisa se preocupar com custos de Planos de hospedagem, custos com resgistro de Domínio, custo com desenvolvedores para criação. Sabe porque? Já está tudo incluso!",
    crmTitle: "Mini CRM Integrado",
    crmDesc: "Agrupe clientes de forma automática via agendamentos, dê cashback, configure pontuações e filtre quem sumiu para ações de engajamento no WhatsApp.",
    stockTitle: "Controle de Estoque & Caixa",
    stockDesc: "Consulte seu faturamento total de serviços vendidos, deduza despesas e fornecedores de consumo geral, e receba avisos de reposição rápida de produtos.",
    ecomTitle: "Mine E-commerce de produtos",
    ecomDesc: "Divulgue seus produtos com facilidade em uma loja pré-configurada. Aqui nós descomplicamos para você vender e ganhar muito mais.",
    cardTitle: "Cartão de Visitas Digital on-line",
    cardDesc: "Tenha seu cartão de visitas digital sempre on-line e compartilhe quando e quantas vezes quiser, completamente grátis e de forma totalmente automatizada.",
    demandTitle: "Publicidade On-Demand",
    demandDesc: "Você assina e nós damos aquela ajuda na divulgação do seu negócio. Clientes com Planos Profissionais e Premium, além do site , tem cadastro no Google Meu Negócio + WhatsApp + SEO Local + Avaliações dentro do Google e aparecem 24hs por dia na nossa Plataforma.",
    noCostTitle: "Sem custo adicionais",
    noCostDesc: "Quando você aluga seu site, não precisa se preocupar com planos de hospedagem, nem custos com registro, nem custo com desenvolvimento para criação. Porque? já está tudo incluso.",
    aiTitle: "Inteligência Artificial (Gemini)",
    aiDesc: "Obtenha conselhos comerciais executivos baseados no seu caixa real, monte scripts promocionais de vendas, posts prontos e previsões mensais em instantes.",
    pricingTitle: "Planos de Aluguel Sem Fidelidade",
    pricingSub: "Escolha o tamanho recomendado para sua operação. Cancele ou mude de plano instantaneamente no painel.",
    planBasic: "Plano Básico",
    planProf: "Plano Profissional",
    planPrem: "Plano Premium",
    planBasicTag: "Ideal para começar",
    planProfTag: "Controle Geral",
    planPremTag: "Automação com IA",
    mostRequested: "Mais Solicitado",
    priceMonth: "/mês",
    testDemo: "Assinar",
    footerText1: "© 2026 SeusiteAlugado. Todos os direitos reservados.",
    footerText2: "Desenvolvido com isolamento lógico multitenancy e integridade com a API do Gemini.",
    portfolioTitle: "Marketplace de Sites de clientes da Plataforma SeusiteAlugado",
    portfolioSub: "Clientes Premium aparecem em destaque na nossa plataforma de aluguel de sites, publicidade 24 horas por dia.",
    faqTitle: "Por que alugar é o melhor caminho?",
    faqSub: "Fretar tecnologia pronta elimina taxas absurdas de manutenção, dores de cabeça com servidores e agências lentas.",
    faq1Q: "Como funciona o aluguel de sites?",
    faq1A: "É idêntico ao aluguel de um ponto comercial físico, mas na internet. Em vez de gastar milhares de reais contratando programadores, você paga uma mensalidade acessível e recebe um site profissional completo, responsivo, com checkout de agendamentos, estoque integrado, CRM de clientes e atualização constante sem taxas ocultas.",
    faq2Q: "Por que alugar é melhor do que comprar um site?",
    faq2A: "Comprar um site exige custo inicial elevado (R$ 2.500 a R$ 6.000), além de custos constantes com manutenção, servidores seguros e modificações de textos. Alugando, você não tem nenhum custo extra com infraestrutura, recebe suporte ilimitado via WhatsApp e conta com ferramentas exclusivas que nenhum site estático comum oferece.",
    faq3Q: "Em quanto tempo meu site fica pronto para uso?",
    faq3A: "Sua chave de acesso e endereço URL exclusivo são provisionados imediatamente após a assinatura. Em menos de 2 minutos você já pode acessar seu painel, cadastrar seus primeiros serviços e disponibilizar o link para seus clientes agendarem.",
    faq4Q: "Posso utilizar meu próprio domínio (.com.br)?",
    faq4A: "Com certeza! Os lojistas dos planos Profissional e Premium podem apontar domínios próprios em seus painéis administrativos de forma descomplicada, mantendo a marca em total evidência técnica.",
    faq5Q: "Existe multa de rescisão ou fidelidade contratual?",
    faq5A: "Não, nenhuma. O contrato é renovado mensalmente. A sua assinatura permanece ativa até o 5° dia útil, após a data que você escolher para o pagamento mensal. A partir dessa data o sistema pausa automaticamente o site, e retorna automaticamente quando a assinatura for renovada. A pausa é realizada de forma automática pelo sistema, mas não se preocupe porque seus dados não são perdidos.",
    faq6Q: "Posso cancelar o aluguel a qualquer momento, tem alguma taxa para o cancelamento?",
    faq6A: "Não, não existe nenhuma taxa para cancelamento. Caso queira cancelar o site, poderá ser cancelado a qualquer momento, e seu site permanece ativo em pausa por 60 dias. Após esse prazo o site é excluído dos nossos servidores.",
    diagnosticTitle: "Diagnóstico Inteligente & Convite",
    diagnosticSub: "Preencha o diagnóstico interativo de 30 segundos abaixo para identificar oportunidades imediatas de melhoria.",
    meetingInvite: "Topa um bate-papo de 5 minutos sobre o aluguel de um site?",
    meetingSub: "Tenha um Diagnóstico gratuito de captação de clientes e divulgação de seu nicho de atuação.",
    diagnosticStep1: "1. Qual o nicho ou segmento da sua empresa?",
    diagnosticStep2: "2. Qual o seu maior obstáculo comercial hoje?",
    diagnosticStep3: "3. Onde podemos agendar nossa conversa rápida?",
    optBarber: "Barbearia / Estética",
    optSalon: "Salão de Beleza / Spa",
    optAuto: "Oficina Mecânica / Serviços",
    optRetail: "Comércio / Loja Física",
    optOther: "Outros Serviços Autônomos",
    painAppointments: "Falta de clientes recorrentes",
    painNoGoogle: "Não apareço no Google ou Maps",
    painManual: "Perda de tempo agendando no WhatsApp",
    painControl: "Sem faturamento mapeado ou estoque",
    btnNext: "Avançar",
    btnSubmit: "Agendar Meu Diagnóstico Grátis",
    diagSuccessHeader: "Análise Comercial Gerada!",
    diagSuccessBody: "Nossa IA mapeou seu segmento. Identificamos que você pode aumentar seus agendamentos em até 40% automatizando o fluxo. Nosso especialista entrará em contato em instantes no WhatsApp informado.",
    formNamePlaceholder: "Seu Nome Completo",
    formPhonePlaceholder: "WhatsApp com DDD (Ex: 71984184782)",
    liveSupportTitle: "Falar no WhatsApp",
    liveSupportSub: "71 98418-4782 (Suporte Rápido)",
    menuBenefitLink: "Vantagens Comerciais",
    menuPortfolioLink: "Portfólio de Sites",
    menuFaqLink: "Dúvidas Frequentes",
    menuPricingLink: "Tabela de Planos",
    menuDiagnosticLink: "Diagnóstico Gratuito",
    menuAdminLink: "Admin 🔒",
    portfolioModelLabel: "Modelo Selecionado",
    portfolioViewLive: "Visualizar Site Ativo"
  },
  en: {
    heroTag: "The digital rental revolution for Micro-businesses",
    heroTitle: "Rent your",
    heroTitleSpan: "Professional site",
    heroTitleEnd: " in just 20 seconds",
    heroSub: "Have a page with your own identity, fully customizable, with booking control, inventory, billing, loyalty CRM, and IA assistant 100% ready.",
    searchPlaceholder: "Search by slug (e.g., barbeariakeu, oficinadocarlos)...",
    searchBtn: "Access Site",
    searchDemos: "Test demos:",
    marketplaceTitle: "SeusiteAlugado Tenant Directory",
    marketplaceSub: "Meet some high-performance companies powered by our cloud multi-tenant infrastructure.",
    marketplaceDir: "View structured directory",
    advantagesTitle: "Why Rent a Website?",
    advantagesSub: "Discover why everyone is choosing to rent instead of buying a website. See the main reasons.",
    crmTitle: "Integrated Mini CRM",
    crmDesc: "Group clients automatically via bookings, offer cashback rewards, set point-based loyalty rules, and filter absent clients for proactive WhatsApp outreach.",
    stockTitle: "Stock Control & Cash Flow",
    stockDesc: "Track total revenue from services sold, subtract expenses and materials supplier cost, and receive immediate alerts for low stock items.",
    aiTitle: "Artificial Intelligence (Gemini)",
    aiDesc: "Get executive business advice generated from actual cash records, instantly create promotional copy, social posts, and monthly financial forecasts.",
    pricingTitle: "Rental Plans with No Contract",
    pricingSub: "Choose the ideal size for your operations. Cancel or upgrade your plan instantly within your admin dashboard.",
    planBasic: "Basic Plan",
    planProf: "Professional Plan",
    planPrem: "Premium Plan",
    planBasicTag: "Perfect to start",
    planProfTag: "General Control",
    planPremTag: "AI Automation",
    mostRequested: "Highly Requested",
    priceMonth: "/month",
    testDemo: "Try Demo Shop",
    footerText1: "© 2026 SeusiteAlugado. All rights reserved.",
    footerText2: "Built with secure logical multi-tenancy and high-fidelity Gemini AI API integration.",
    portfolioTitle: "Platform Client Sites Marketplace SeusiteAlugado",
    portfolioSub: "Premium clients are highlighted on our website rental platform, 24/7 advertising.",
    faqTitle: "Why Renting is the Smartest Way?",
    faqSub: "Leasing ready-to-use technology eliminates astronomical maintenance fees, server setup overheads and slow agency delays.",
    faq1Q: "How does website rental work?",
    faq1A: "It is identical to renting a real-world commercial shop, but on the internet. Instead of spending thousands paying developers, you subscribe to an affordable monthly plan and receive a fully functional, mobile-friendly professional site equipped with online booking, integrated cash register, customer CRM and weekly automated updates.",
    faq2Q: "Why is renting better than buying a custom website?",
    faq2A: "Buying a website requires high upfront capital ($500 to $1,500), alongside extra costs for hosting, secure socket layers and basic updates. By renting, you bypass all administrative efforts, enjoy lifetime technical support via WhatsApp and gain features that simple static pages cannot provide.",
    faq3Q: "How quickly will my website be live for customers?",
    faq3A: "Your system access and address links are provisioned instantly upon subscription request. In less than 2 minutes, you can manage services, schedule working windows, upload your brand assets and invite clients inside.",
    faq4Q: "Can I use my custom domain name (.com)?",
    faq4A: "Absolutely! Tenants subscribed to our Professional and Premium tiers can easily configure custom domain names inside their dashboards, keeping their brand front-and-center.",
    faq5Q: "Is there a long-term contract lock-in period?",
    faq5A: "No, none. Subscription is charged month-to-month. If you decide to pause your business operations, you can easily turn off subscription renewals in your panel dashboard with zero cancellation penalties.",
    faq6Q: "Can I cancel the rental at any time? Is there a cancellation fee?",
    faq6A: "No, there is no cancellation fee. If you wish to cancel your site, it can be done at any time, and your site will remain active in a paused state for 60 days. After this period, the site will be permanently deleted from our servers.",
    diagnosticTitle: "Free Smart Business Diagnostic",
    diagnosticSub: "Complete our interactive 30-second assessment to map crucial digital improvements for your brand.",
    meetingInvite: "Up for a quick 15-minute chat about renting a website?",
    meetingSub: "Geared with free customer acquisition strategies customized for your specific trade.",
    diagnosticStep1: "1. What is your business industry?",
    diagnosticStep2: "2. What is your primary commercial challenge?",
    diagnosticStep3: "3. Where can our digital specialist find you?",
    optBarber: "Barbershop / Grooming",
    optSalon: "Beauty Salon / Spa",
    optAuto: "Auto Repairs / Technical Care",
    optRetail: "Boutique / Physical Retail",
    optOther: "Other Professional Services",
    painAppointments: "Lack of repeat customers",
    painNoGoogle: "Not visible on Google Maps",
    painManual: "Wasting hours scheduling manually on WhatsApp",
    painControl: "No structured cash flow or low stock warning",
    btnNext: "Next Stage",
    btnSubmit: "Schedule My Free Diagnostic",
    diagSuccessHeader: "Digital Diagnosis Rendered!",
    diagSuccessBody: "Our processor mapped your industry. We calculated you can increase monthly appointments up to 40% using automated checks. Our agent will message you shortly via the provided WhatsApp number.",
    formNamePlaceholder: "Your Full Name",
    formPhonePlaceholder: "WhatsApp with country code (e.g., 5571984184782)",
    liveSupportTitle: "Chat on WhatsApp",
    liveSupportSub: "71 98418-4782 (Support Line)",
    menuBenefitLink: "Strategic Advantages",
    menuPortfolioLink: "Active Portfolios",
    menuFaqLink: "Common Questions",
    menuPricingLink: "Subscription Plans",
    menuDiagnosticLink: "Free Assessment",
    menuAdminLink: "Admin panel 🔒",
    portfolioModelLabel: "Selected Layout",
    portfolioViewLive: "Launch Active Demo"
  }
};

export default function SaaSLandingPage({ tenants, onSelectTenant, onGoToSearch, onGoToSuperAdmin, onGoToPortfolio }: SaaSLandingPageProps) {
  const [lang, setLang] = useState<'pt' | 'en'>('pt');
  const t = translations[lang];

  const [searchQuery, setSearchQuery] = useState("");
  const [theme, setTheme] = useState<'light' | 'dark'>('dark');

  const [expandedItems, setExpandedItems] = useState<number[]>([]);
  const [hamburgerOpen, setHamburgerOpen] = useState(false);
  const [isLangDropdownOpen, setIsLangDropdownOpen] = useState(false);

  // FAQ Accordion active indices
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  // === Controle do SetupModal pós-pagamento ===
  const [showSetupModal, setShowSetupModal] = useState(false);
  const [setupPlan, setSetupPlan] = useState<"basic" | "professional" | "premium">("basic");

  // Lê parâmetros de URL quando o Stripe redireciona de volta
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const planParam = params.get("plan");
    const setupParam = params.get("setup");
    if (setupParam === "true" && (planParam === "basic" || planParam === "professional" || planParam === "premium")) {
      setSetupPlan(planParam);
      setShowSetupModal(true);
      // Remove os parâmetros da URL sem recarregar a página
      window.history.replaceState({}, document.title, window.location.pathname + window.location.hash);
    }
  }, []);

  // Interactive Diagnostic State Machine
  const [diagStep, setDiagStep] = useState(1);
  const [diagNiche, setDiagNiche] = useState("");
  const [diagPain, setDiagPain] = useState("");
  const [diagName, setDiagName] = useState("");
  const [diagPhone, setDiagPhone] = useState("");
  const [diagnosticSaved, setDiagnosticSaved] = useState(false);
  const [diagnosingProgress, setDiagnosingProgress] = useState(false);

  // Active portfolio carousel state and play indicator
  const [activeIdx, setActiveIdx] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  // Filter premium tenants to display in directory highlight
  const premiumTenants = tenants.filter(tenantItem => tenantItem.plan === 'premium').slice(0, 8);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery) return;
    
    const match = tenants.find(tenantItem => 
      tenantItem.slug.toLowerCase() === searchQuery.toLowerCase() || 
      tenantItem.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    if (match) {
      onSelectTenant(match.slug);
    } else {
      onGoToSearch();
    }
  };

  const handleDiagnosticSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!diagName || !diagPhone) return;

    setDiagnosingProgress(true);
    setTimeout(() => {
      setDiagnosingProgress(false);
      setDiagnosticSaved(true);
    }, 1500);
  };

  // Portfolio items data structures (used for automatic carousel)
  const carouselItems = [
    {
      key: 'barber',
      slug: 'barbeariakeu',
      title: lang === 'pt' ? "Keu Barbearia & Estilo" : "Keu Barbershop & Style",
      description: lang === 'pt' 
        ? "Uma barbearia com atmosfera retrô estilosa em tons de Âmbar e Preto. Oferece cortes degradê modernos, barboterapia premium sofisticada e um ambiente clássico perfeito com agendamento 100% online."
        : "A classic barbershop with a stylish retro grooming lounge in Amber & Black. Offering ultra modern skin fades, facial massage therapies, and 100% automated online booking.",
      tag: lang === 'pt' ? "Tema Âmbar & Tipografia Mono" : "Amber Gold Theme & Mono Typography",
      services: [
        { name: lang === 'pt' ? "Corte Marcial Degradê" : "Modern Skin Fade", price: 35.00, duration: 30 },
        { name: lang === 'pt' ? "Corte + Barboterapia Premium" : "Cut + Premium Beard Therapy", price: 65.00, duration: 55 },
        { name: lang === 'pt' ? "Selagem Redutora Capilar" : "Hair Alignment Therapy", price: 120.00, duration: 90 }
      ],
      reviews: [
        { author: "Thiago Mendes", rating: 5, comment: lang === 'pt' ? "Atendimento de primeira! O degradê navalhado ficou perfeito." : "Top notch service! The razor skin fade was perfect." },
        { author: "Lucas Porto", rating: 5, comment: lang === 'pt' ? "Café gelado e toalha quente na barba é um espetáculo de serviço." : "Cold brew and hot towel beard shave is on another level." }
      ],
      banner: "bg-gradient-to-br from-amber-500/20 to-zinc-900 border border-amber-500/20 text-white",
      coverGradient: "from-amber-650/40 via-zinc-900/90 to-zinc-950",
      avatarEmoji: "💈",
      avatarImg: "https://images.unsplash.com/photo-1503951914875-452162b0f3f1?w=150&auto=format&fit=crop&q=60",
      ratingText: lang === 'pt' ? "★ 4.5 • 2 avaliações • MONO" : "★ 4.5 • 2 reviews • MONO",
      aboutTitle: lang === 'pt' ? "Quem Somos" : "About Us",
      aboutDesc: lang === 'pt' 
        ? "Corte de cabelo clássico, degradê, ajuste de barba esculpida na navalha com toalha quente e massagem facial. Ambiente clássico com café artesanal e cerveja gelada inclusos na assinatura."
        : "Classic haircut, skin fade, premium warm towel beard razor shaves and advanced facial messaging. Vintage style atmosphere including craft beers and gourmet espresso.",
      address: "Rua Augusta, 1420 - Consolação, São Paulo - SP",
      hours: "Seg-Sáb: 09h às 21h",
      phone: "(11) 3215-6743",
      accentBorder: "border-amber-500",
      accentBg: "bg-amber-500",
      accentText: "text-amber-500",
      mapColor: "amber",
      street1: "Rua Augusta",
      street2: "Consolacao"
    },
    {
      key: 'salon',
      slug: 'salaodajulie',
      title: lang === 'pt' ? "Salão da Julie Cosméticos" : "Julie Beauty & Hair Salon",
      description: lang === 'pt'
        ? "Salão de beleza elegante com temática Rose de alta sofisticação. Especializado em escova hidratante L'Oréal, unhas de gel impecáveis e técnicas de mechas loiras, com controle rápido de caixa e agendamentos."
        : "An elegant hair salon featuring a cozy Rose layout and upscale styling. Specialized in L'Oréal blowouts, flawless gel manicures, and blonde highlight procedures with instant scheduling.",
      tag: lang === 'pt' ? "Tema Rose Charm & Tipografia Serif" : "Rose Charm Theme & Serif Typography",
      services: [
        { name: lang === 'pt' ? "Escova Hidratante L´Oréal" : "L'Oréal Blowout & Wash", price: 95.00, duration: 45 },
        { name: lang === 'pt' ? "Manicure & Pedicure Gel" : "Gel Manicure & Pedicure", price: 80.00, duration: 60 },
        { name: lang === 'pt' ? "Mechas Californianas + Reconstrutor" : "Californian Highlights + Care", price: 380.00, duration: 180 }
      ],
      reviews: [
        { author: "Beatriz Nogueira", rating: 5, comment: lang === 'pt' ? "Julie é maravilhosa! A escova em gel durou semanas sem frizz." : "Julie is wonderful! The blowout lasted for weeks without frizz." },
        { author: "Camila Sales", rating: 5, comment: lang === 'pt' ? "Lugar super aconchegante e profissionais incríveis!" : "Super cozy atmosphere and highly skilled professionals!" }
      ],
      banner: "bg-gradient-to-br from-rose-500/20 to-zinc-900 border border-rose-500/20 text-white",
      coverGradient: "from-rose-500/30 via-zinc-900/90 to-zinc-950",
      avatarEmoji: "🌸",
      avatarImg: "https://images.unsplash.com/photo-1560066984-138dadb4c035?w=150&auto=format&fit=crop&q=60",
      ratingText: lang === 'pt' ? "★ 4.8 • 5 avaliações • SERIF" : "★ 4.8 • 5 reviews • SERIF",
      aboutTitle: lang === 'pt' ? "Quem Somos" : "About Us",
      aboutDesc: lang === 'pt' 
        ? "Salão de beleza elegante com temática Rose de alta sofisticação. Especializada em escova reconstrutora hidratante da L'Oréal Paris, manicure gel e nail arts, e loiros fantásticos sob agendamento imediato."
        : "Elegant beauty saloon offering a Rose template style. Specialized in intense L'Oréal Paris hydration blowouts, gel manicures, premium nail art, and elite blonde highlights on immediate scheduling.",
      address: "Al. Lorena, 1500 - Jardins, São Paulo - SP",
      hours: "Ter-Sáb: 10h às 20h",
      phone: "(11) 98765-4321",
      accentBorder: "border-rose-500",
      accentBg: "bg-rose-500",
      accentText: "text-rose-400",
      mapColor: "rose",
      street1: "Alameda Lorena",
      street2: "Jardins"
    },
    {
      key: 'mechanic',
      slug: 'oficinadocarlos',
      title: lang === 'pt' ? "Oficina do Carlos Motors" : "Carlos Auto Repairs",
      description: lang === 'pt'
        ? "Centro automotivo em azul profundos e design esportivo moderno. Oferece serviços precisos de alinhamento 3D, troca rápida de óleos sintéticos e diagnóstico eletrônico computadorizado de última geração."
        : "Automotive technical lounge with deep blue accents. Offers high-precision 3D alignment, synthetic oil changes, and state-of-the-art computerized engine diagnostics.",
      tag: lang === 'pt' ? "Tema Deep Blue & Tipografia Sans" : "Deep Blue Theme & Clean Sans Typography",
      services: [
        { name: lang === 'pt' ? "Alinhamento 3D + Balanceamento" : "3D Wheel Alignment & Balance", price: 150.00, duration: 60 },
        { name: lang === 'pt' ? "Troca Filtros & Óleo Sintético" : "Filter & Synthetic Oil Change", price: 290.00, duration: 40 },
        { name: lang === 'pt' ? "Diagnóstico Eletrônico Injeção" : "Computerized Diagnostic scan", price: 120.00, duration: 45 }
      ],
      reviews: [
        { author: "Marcos Vinicius", rating: 5, comment: lang === 'pt' ? "Extremamente honesto e ágil. Explicou todo o problema elétrico." : "Extremely honest and fast process. Explained the wire diagnostics." },
        { author: "Roberto Junior", rating: 5, comment: lang === 'pt' ? "Preço justo e peças originais. Recomendo muito!" : "Fair pricing and genuine parts. Highly recommend to everyone!" }
      ],
      banner: "bg-gradient-to-br from-blue-500/20 to-zinc-900 border border-blue-500/20 text-white",
      coverGradient: "from-blue-600/30 via-zinc-900/90 to-zinc-950",
      avatarEmoji: "🔧",
      avatarImg: "https://images.unsplash.com/photo-1616788494707-ec28f08d05a1?w=150&auto=format&fit=crop&q=60",
      ratingText: lang === 'pt' ? "★ 4.7 • 8 avaliações • SANS" : "★ 4.7 • 8 reviews • SANS",
      aboutTitle: lang === 'pt' ? "Quem Somos" : "About Us",
      aboutDesc: lang === 'pt' 
        ? "Centro automotivo de engenharia precisa com layout azul esportivo. Serviços de troca de óleo sintético de alta durabilidade, alinhamento 3D a laser e varredura de injeção computadorizada avançada."
        : "Precise automotive hub featuring an action-oriented blue race design. Specialized in long durability synthetic oil swaps, state-of-the-art laser 3D alignments, and electric sweeps.",
      address: "Rua Barra Funda, 420 - Barra Funda, São Paulo - SP",
      hours: "Seg-Sex: 08h às 18h",
      phone: "(11) 5555-0199",
      accentBorder: "border-blue-500",
      accentBg: "bg-blue-600",
      accentText: "text-blue-400",
      mapColor: "blue",
      street1: "Rua Barra Funda",
      street2: "Elevado"
    },
    {
      key: 'sallesfit',
      slug: 'sallesfit',
      title: "SallesFit",
      description: lang === 'pt'
        ? "Moda fitness premium com layout Rose de alta conversão. Integrado com catálogo interativo de roupas, avaliações reais e agendamentos instantâneos de consultoria."
        : "Premium fitness apparel store featuring a high-converting Rose Layout. Integrated with beautiful interactive catalogs, live reviews, and health session bookings.",
      tag: lang === 'pt' ? "Tema Rose Fit & Tipografia Esportiva" : "Rose Fit Theme & Athletic Typography",
      services: [
        { name: lang === 'pt' ? "Consultoria Fitness VIP" : "VIP Fitness Consulting", price: 199.00, duration: 60 },
        { name: lang === 'pt' ? "Treino Funcional Alta Queima" : "High Burn HIIT Session", price: 45.00, duration: 45 },
      ],
      reviews: [
        { author: "Fernanda Lima", rating: 5, comment: lang === 'pt' ? "O top cropped veste perfeitamente bem! Tecido muito leve." : "The crop top fits incredibly well! Excellent light dry-fit fabric." }
      ],
      banner: "bg-gradient-to-br from-rose-500/20 to-zinc-900 border border-rose-500/20 text-white",
      coverGradient: "from-rose-500/30 via-zinc-900/90 to-zinc-950",
      avatarEmoji: "⚡",
      avatarImg: "/src/assets/images/sallesfit_logo_1782162401662.jpg",
      ratingText: lang === 'pt' ? "★ 5.0 • 1 avaliação • ROSE" : "★ 5.0 • 1 review • ROSE",
      aboutTitle: lang === 'pt' ? "Quem Somos" : "About Us",
      aboutDesc: lang === 'pt' 
        ? "Moda fitness premium, vestuário de alta performance e consultoria esportiva inteligente. Tecidos dry-fit premium e modelagem ergonômica feitos para te mover."
        : "Premium fitness apparel, high-performance wear, and smart sports coaching. Premium dry-fit fabrics and ergonomic modeling made to keep you moving.",
      address: "Av. Paulista, 1000 - Bela Vista, São Paulo - SP",
      hours: "Seg-Sáb: 07h às 22h",
      phone: "(11) 99999-8888",
      accentBorder: "border-rose-500",
      accentBg: "bg-rose-500",
      accentText: "text-rose-400",
      mapColor: "rose",
      street1: "Avenida Paulista",
      street2: "Bela Vista"
    }
  ];

  const currentPortfolio = carouselItems[activeIdx];

  const activeBorderColor = 
    currentPortfolio.key === 'barber' ? 'border-amber-500' :
    currentPortfolio.key === 'salon' ? 'border-rose-500' :
    currentPortfolio.key === 'sallesfit' ? 'border-rose-500' :
    'border-blue-600';

  const activeRingColor = 
    currentPortfolio.key === 'barber' ? 'ring-amber-500/20' :
    currentPortfolio.key === 'salon' ? 'ring-rose-500/20' :
    currentPortfolio.key === 'sallesfit' ? 'ring-rose-500/20' :
    'ring-blue-605/20';

  React.useEffect(() => {
    if (isPaused) return;
    const interval = setInterval(() => {
      setActiveIdx((prev) => (prev + 1) % carouselItems.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [isPaused, carouselItems.length]);

  return (
    <div 
      id="saas-homepage" 
      className={`min-h-screen transition-colors duration-300 font-sans selection:bg-indigo-600 selection:text-white ${
        theme === 'dark' ? 'bg-zinc-950 text-white' : 'bg-slate-50 text-slate-900'
      }`}
    >
      
      {/* WHATSAPP FLOATING BUTTON (ACTIVE & HIGHLY ANIMATED AS THE OFFICIAL BRAND) */}
      <a 
        href="https://wa.me/5571984184782?text=Olá%20,%20gostaria%20de%20mais%20Informações%20sobre%20aluguel%20de%20Sites" 
        target="_blank" 
        rel="noopener noreferrer"
        referrerPolicy="no-referrer"
        className="fixed bottom-5 right-4 md:bottom-6 md:right-6 z-50 group flex items-center justify-center transition-all duration-300 hover:scale-105 active:scale-95"
        title="Falar no WhatsApp"
      >
        <span className="absolute -top-0.5 -right-0.5 flex h-3 w-3">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
        </span>
        <img 
          src="/whatsapp_transparent.png" 
          alt="WhatsApp" 
          className="w-14 h-14 md:w-16 md:h-16 object-contain"
        />
      </a>

      {/* SCROLL TO TOP BUTTON */}
      <button
        onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
        className="fixed bottom-20 right-5 md:bottom-24 md:right-8 z-50 p-2.5 md:p-3 rounded-full bg-zinc-900/80 hover:bg-zinc-800 text-yellow-400 border border-yellow-400/30 hover:border-yellow-400 shadow-lg transition-all duration-300 hover:scale-105 active:scale-95 cursor-pointer"
        title="Voltar ao Topo"
      >
        <svg className="w-5 h-5 stroke-current" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 15.75l7.5-7.5 7.5 7.5" />
        </svg>
      </button>

      {/* HAMBURGER LEFT DRAWER SIDEBAR */}
      {hamburgerOpen && (
        <div className="fixed inset-0 z-50 flex">
          {/* Overlay mask */}
          <div 
            onClick={() => setHamburgerOpen(false)}
            className="fixed inset-0 bg-black/70 backdrop-blur-sm transition-opacity"
          ></div>
          
          {/* Sidebar drawer content */}
          <div className="relative flex flex-col w-72 max-w-sm bg-zinc-950/70 backdrop-blur-xl text-white h-full p-6 shadow-2xl animate-in slide-in-from-left duration-200">
            <div className="flex items-center justify-between pb-6">
              <div className="flex items-center gap-2">
                <LogoSeusiteAlugado size="sm" theme="dark" showSubtitle={false} />
              </div>
              <button 
                onClick={() => setHamburgerOpen(false)}
                className="text-zinc-400 hover:text-white p-1 rounded-lg"
              >
                <X size={16} />
              </button>
            </div>

            {/* Navigation links */}
            <nav className="flex-1 mt-6 space-y-2 text-sm font-normal text-zinc-300">
              <a 
                href="#vantagens" 
                onClick={() => setHamburgerOpen(false)} 
                className="block p-3 rounded-xl hover:bg-white/10 hover:text-white transition-all"
              >
                {t.menuBenefitLink}
              </a>
              <button
                type="button"
                onClick={() => { setHamburgerOpen(false); onGoToPortfolio(); }}
                className="w-full text-left block p-3 rounded-xl hover:bg-white/10 hover:text-white transition-all"
              >
                {t.menuPortfolioLink}
              </button>
              <a 
                href="#faq" 
                onClick={() => setHamburgerOpen(false)} 
                className="block p-3 rounded-xl hover:bg-white/10 hover:text-white transition-all"
              >
                {t.menuFaqLink}
              </a>
              <a 
                href="#planos" 
                onClick={() => setHamburgerOpen(false)} 
                className="block p-3 rounded-xl hover:bg-white/10 hover:text-white transition-all"
              >
                {t.menuPricingLink}
              </a>
              <a 
                href="#diagnostico" 
                onClick={() => setHamburgerOpen(false)} 
                className="block p-3 rounded-xl hover:bg-white/10 hover:text-white transition-all animate-pulse text-amber-400"
              >
                {t.menuDiagnosticLink}
              </a>
            </nav>

            {/* Footer shortcuts */}
            <div className="pt-4 border-t border-zinc-800 space-y-3">
              <button
                onClick={() => {
                  setHamburgerOpen(false);
                  onGoToSuperAdmin();
                }}
                className="w-full text-xs bg-zinc-950 hover:bg-zinc-850 text-amber-500 border border-zinc-800/80 px-4 py-2.5 rounded-xl flex items-center justify-center gap-1.5 transition-all font-bold cursor-pointer"
              >
                <Settings size={12} />
                <span>{t.menuAdminLink}</span>
              </button>
              <p className="text-[10px] text-zinc-550 text-center font-mono text-zinc-500">
                v2.6 • Active Multitenancy
              </p>
            </div>
          </div>
        </div>
      )}

      {/* STICKY HEADER */}
      <header className={`fixed top-2 left-3 right-3 sm:top-4 sm:left-4 sm:right-4 z-40 transition-colors duration-300 backdrop-blur-md rounded-xl sm:rounded-2xl shadow-lg border ${
        theme === 'dark' ? 'bg-zinc-950/80 border-zinc-800' : 'bg-white/80 border-slate-100'
      }`}>
        <div className="max-w-7xl mx-auto px-3 py-3 sm:px-6 sm:py-4 flex items-center justify-between gap-2 min-w-0">
          
          <div className="flex items-center gap-2 sm:gap-3 min-w-0">
            {/* Hamburger button on the left */}
            <button 
              onClick={() => setHamburgerOpen(true)}
              className="cursor-pointer hover:text-indigo-500 transition-colors focus:outline-none"
              title="Menu Lateral"
              id="hamburger-menu-toggle"
            >
              <Menu size={22} className={theme === 'dark' ? 'text-zinc-200' : 'text-slate-800'} />
            </button>

            <div className="flex items-center gap-2 cursor-pointer min-w-0" onClick={() => window.scrollTo({top: 0, behavior: 'smooth'})}>
              <span className="sm:hidden">
                <LogoSeusiteAlugado size="sm" />
              </span>
              <span className="hidden sm:inline-flex">
                <LogoSeusiteAlugado size="md" />
              </span>
            </div>
          </div>

          <div className="flex items-center gap-1.5 sm:gap-3 shrink-0">
            {/* Language Dropdown Selector with Flags */}
            <div className="relative">
              <button 
                onClick={() => setIsLangDropdownOpen(!isLangDropdownOpen)}
                className={`p-1.5 rounded-lg border text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer select-none ${
                  theme === 'dark' ? 'border-zinc-800 text-zinc-400 hover:bg-zinc-900 hover:text-white' : 'border-slate-200 text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                }`}
                title="Alterar Idioma"
              >
                <img 
                  src={lang === 'pt' ? '/flag_br.png' : '/flag_us.png'} 
                  alt={lang === 'pt' ? 'Português' : 'English'} 
                  className="w-5 h-3.5 object-cover rounded shadow-sm"
                />
                <span className="uppercase text-[10px]">{lang}</span>
                <ChevronDown size={12} className={`transition-transform duration-200 ${isLangDropdownOpen ? 'rotate-180' : ''}`} />
              </button>

              {isLangDropdownOpen && (
                <>
                  <div 
                    className="fixed inset-0 z-40" 
                    onClick={() => setIsLangDropdownOpen(false)}
                  />
                  <div className={`absolute right-0 mt-1.5 w-20 rounded-xl shadow-xl border p-1 z-50 animate-in fade-in slide-in-from-top-2 duration-150 ${
                    theme === 'dark' ? 'bg-zinc-900 border-zinc-800 text-zinc-200' : 'bg-white border-slate-200 text-slate-800'
                  }`}>
                    <button
                      onClick={() => {
                        setLang('pt');
                        setIsLangDropdownOpen(false);
                      }}
                      className={`w-full flex items-center justify-start gap-2 p-2 text-xs font-bold rounded-lg transition-colors cursor-pointer ${
                        lang === 'pt' 
                          ? (theme === 'dark' ? 'bg-zinc-800' : 'bg-slate-100') 
                          : (theme === 'dark' ? 'hover:bg-zinc-800/50' : 'hover:bg-slate-50')
                      }`}
                    >
                      <img src="/flag_br.png" alt="PT" className="w-5 h-3.5 object-cover rounded shadow-sm" />
                      <span>PT</span>
                    </button>
                    <button
                      onClick={() => {
                        setLang('en');
                        setIsLangDropdownOpen(false);
                      }}
                      className={`w-full flex items-center justify-start gap-2 p-2 text-xs font-bold rounded-lg transition-colors cursor-pointer ${
                        lang === 'en' 
                          ? (theme === 'dark' ? 'bg-zinc-800' : 'bg-slate-100') 
                          : (theme === 'dark' ? 'hover:bg-zinc-800/50' : 'hover:bg-slate-50')
                      }`}
                    >
                      <img src="/flag_us.png" alt="EN" className="w-5 h-3.5 object-cover rounded shadow-sm" />
                      <span>EN</span>
                    </button>
                  </div>
                </>
              )}
            </div>
            <button 
              onClick={() => onGoToSuperAdmin()}
              className="text-[11px] sm:text-xs font-bold text-black bg-yellow-400 px-3 sm:px-4 py-2 rounded-lg hover:bg-yellow-500 cursor-pointer leading-tight">Login / Cadastro</button>

            {/* Quick Theme Toggle */}
            <button 
              onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
              className={`p-1.5 rounded-lg border transition-all flex items-center justify-center cursor-pointer ${
                theme === 'dark' ? 'border-zinc-800 text-amber-400 hover:bg-zinc-900' : 'border-slate-200 text-indigo-600 hover:bg-slate-100'
              }`}
              title="Tema Claro/Escuro"
              id="theme-quick-picker"
            >
              {theme === 'dark' ? <Sun size={15} /> : <Moon size={15} />}
            </button>
          </div>
        </div>
      </header>

      {/* HERO SECTION */}
      <section className="relative px-4 sm:px-6 pt-40 pb-16 sm:pt-36 md:pt-40 md:pb-28 text-center max-w-4xl mx-auto space-y-5 sm:space-y-6">
        
        {/* Ambient background glow */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[350px] md:w-[450px] h-[450px] bg-indigo-500/10 rounded-full filter blur-3xl -z-10"></div>
        
        <div className="inline-flex max-w-full items-center justify-center gap-2 bg-indigo-500/10 border border-indigo-500/20 px-3 py-1 rounded-full text-[11px] sm:text-xs font-extrabold text-indigo-400">
          <Sparkles size={11} className="animate-pulse" />
          <span className="truncate">{t.heroTag}</span>
        </div>

        <h1 className="leading-tight text-center">
          {lang === 'pt' ? (
            <>
              <span className="text-yellow-400 font-black text-4xl sm:text-5xl md:text-7xl lg:text-8xl block tracking-tight mb-2 sm:mb-3">
                Alugue seu
              </span>
              <span className="text-fuchsia-400 animate-pulse text-3xl sm:text-4xl md:text-6xl lg:text-7xl font-extrabold block tracking-tight mb-2 sm:mb-3 drop-shadow-[0_2px_10px_rgba(168,85,247,0.45)]">
                Site profissional
              </span>
              <span className={`${theme === 'dark' ? 'text-zinc-100' : 'text-zinc-900'} font-medium text-xl sm:text-2xl md:text-3xl lg:text-4xl block tracking-normal`}>
                em apenas 20 segundos.
              </span>
            </>
          ) : (
            <>
              <span className="text-yellow-400 font-black text-4xl sm:text-5xl md:text-7xl lg:text-8xl block tracking-tight mb-2 sm:mb-3">
                Rent your
              </span>
              <span className="text-purple-300 animate-pulse text-3xl sm:text-4xl md:text-6xl lg:text-7xl font-extrabold block tracking-tight mb-2 sm:mb-3 drop-shadow-[0_2px_10px_rgba(168,85,247,0.45)]">
                Professional site
              </span>
              <span className="text-white font-medium text-xl sm:text-2xl md:text-3xl lg:text-4xl block tracking-normal">
                in just 20 seconds.
              </span>
            </>
          )}
        </h1>

        <p className={`text-sm md:text-base max-w-2xl mx-auto leading-relaxed font-medium px-1 ${
          theme === 'dark' ? 'text-zinc-400' : 'text-slate-500'
        }`}>
          {t.heroSub}
        </p>

        {/* SEARCH / INTERACTIVE MARKETPLACE PORTAL */}
        <div className={`w-full max-w-xl mx-auto p-2.5 rounded-3xl sm:rounded-full shadow-2xl flex flex-col sm:flex-row items-stretch sm:items-center gap-2 border transition-all ${
          theme === 'dark' ? 'bg-zinc-900/80 border-zinc-800' : 'bg-white border-slate-200/80'
        }`}>
          <button className="hidden sm:block p-2 text-zinc-400 hover:text-indigo-600" aria-label="Adicionar busca">
            <span className="text-xl font-bold">+</span>
          </button>
          
          <input 
            type="text" 
            placeholder="Buscar sites..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full min-w-0 bg-transparent px-4 py-3 sm:p-1.5 text-sm focus:outline-none placeholder:text-zinc-500"
            onKeyDown={(e) => e.key === "Enter" && handleSearchSubmit(e)}
          />

          <select 
            className="w-full sm:w-auto bg-transparent px-4 py-3 sm:p-0 text-xs text-zinc-500 font-bold focus:outline-none cursor-pointer border-y border-zinc-800/40 sm:border-0"
            onChange={(e) => {
              if (e.target.value) {
                console.log("Categoria selecionada:", e.target.value);
              }
            }}
          >
            <option value="">Categorias</option>
            <option value="barbearias">Barbearias</option>
            <option value="salao_beleza">Salão de Beleza</option>
            <option value="oficina">Oficina</option>
            <option value="chaveiro">Chaveiro</option>
            <option value="eletricista">Eletricista</option>
            <option value="pintor">Pintor</option>
            <option value="serralheiro">Serralheiro</option>
            <option value="gesseiro">Gesseiro</option>
            <option value="doceira">Doceira</option>
            <option value="acaiteria">Açaíteria</option>
            <option value="loja">Loja</option>
            <option value="buffet">Buffet</option>
            <option value="manicure_pedicure">Manicure/Pedicure</option>
            <option value="maquiadora">Maquiadora</option>
            <option value="lava_jato">Lava-jato</option>
            <option value="som_automotivo">Som automotivo</option>
            <option value="dedetizacao">Dedetização</option>
            <option value="personal_trainer">Personal trainer</option>
          </select>
          
          <button 
            type="button" 
            onClick={handleSearchSubmit}
            className="w-full sm:w-auto whitespace-nowrap bg-yellow-400 hover:bg-yellow-500 text-black font-black px-6 py-3 sm:py-2.5 text-xs rounded-full transition-all cursor-pointer shadow-md shadow-yellow-500/20"
          >
            {t.searchBtn}
          </button>
        </div>

      </section>

      {/* PORTFOLIO SHOWCASE SECTION WITH LIVE CAROUSEL DE CLIENTES */}
      <section 
        id="portfolio" 
        className={`py-16 md:py-20 border-y transition-colors duration-300 ${
          theme === 'dark' ? 'bg-zinc-900/40 border-zinc-900' : 'bg-slate-100/60 border-slate-200'
        }`}
        onMouseEnter={() => setIsPaused(true)}
        onMouseLeave={() => setIsPaused(false)}
      >
        <div className="max-w-6xl mx-auto px-6 space-y-10">
          
          <div className="text-center space-y-4 relative">
            <h2 className="text-2xl md:text-3xl font-black tracking-tight select-none leading-tight">
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-violet-400 to-indigo-400">
                {lang === 'pt' ? "Marketplace de clientes da Plataforma" : "Platform Clients Marketplace"}
              </span>
            </h2>
            <p className={`text-xs max-w-xl mx-auto ${theme === 'dark' ? 'text-zinc-400' : 'text-slate-500'}`}>{t.portfolioSub}</p>

            {isPaused && (
              <span className="absolute right-0 top-0 text-[10px] bg-indigo-500/10 text-indigo-400 px-2.5 py-0.5 rounded-full font-mono animate-pulse uppercase tracking-wider">
                ⏸️ {lang === 'pt' ? 'Pausado' : 'Paused'}
              </span>
            )}
          </div>

          {/* Device Model Live Simulator Component */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center pt-2">
            
            {/* Simulation Left Explainer card representing the active client */}
            <div className="lg:col-span-5 space-y-6">
              <div className="flex items-center gap-2">
                <span className="text-[10px] bg-indigo-500/15 text-indigo-400 font-extrabold px-3 py-1 rounded-full uppercase tracking-wider items-center gap-1 inline-flex">
                  <Laptop size={10} /> {lang === 'pt' ? "Cliente Ativo" : "Active Client"}
                </span>
                <span className="text-[10px] bg-rose-500/15 text-rose-400 font-extrabold px-3 py-1 rounded-full uppercase tracking-wider inline-flex">
                  Premium
                </span>
              </div>
              
              <h3 className="text-2xl font-extrabold tracking-tight transition-all duration-300">
                {currentPortfolio.title}
              </h3>
              
              {/* Dynamic brief description of the loaded client model */}
              <p className={`text-xs leading-relaxed transition-opacity duration-300 ${theme === 'dark' ? 'text-zinc-300' : 'text-slate-650'}`}>
                {currentPortfolio.description}
              </p>

              <div className="space-y-2">
                <p className="text-xs font-extrabold text-zinc-400">{lang === 'pt' ? "Identidade do Layout:" : "Layout Assets:"}</p>
                <div className="space-y-1.5">
                  <div className="flex items-center gap-2 text-xs">
                    <CheckCircle2 size={13} className="text-indigo-500" />
                    <span className={theme === 'dark' ? 'text-zinc-300' : 'text-slate-650'}>{currentPortfolio.tag}</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs">
                    <CheckCircle2 size={13} className="text-indigo-500" />
                    <span className={theme === 'dark' ? 'text-zinc-300' : 'text-slate-650'}>{lang === 'pt' ? "Painel de agendamentos 100% ativo" : "100% functional live booking workflow"}</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs">
                    <CheckCircle2 size={13} className="text-indigo-500" />
                    <span className={theme === 'dark' ? 'text-zinc-300' : 'text-slate-650'}>{lang === 'pt' ? "Domínio próprio mapeado sem taxas extras" : "Custom active domain mapped instantly"}</span>
                  </div>
                </div>
              </div>

              {/* Quick access row matching deleted cards style */}
              <div className="pt-3 border-t border-zinc-800/20 flex items-center justify-between">
                <span className="text-[11px] font-mono font-bold text-zinc-500 flex items-center gap-1">
                  {lang === 'pt' ? 'Link rápido:' : 'Direct link:'}
                  <button 
                    onClick={() => onSelectTenant(currentPortfolio.slug)}
                    className="text-indigo-400 hover:text-indigo-300 font-extrabold hover:underline"
                  >
                    /{currentPortfolio.slug}
                  </button>
                </span>
              </div>
            </div>

            {/* Simulated Smartphone Screenshot Block - Styled with thin single dynamic color frame */}
            <div className="lg:col-span-7 flex justify-center">
              <div className={`w-full max-w-sm border-[0.5px] ${activeBorderColor} rounded-xl p-4 md:p-5 shadow-2xl relative overflow-hidden bg-zinc-950 transition-all duration-500`}>
                
                {/* Search/Address bar browser mock with direct active link */}
                <div className="bg-zinc-900 border border-zinc-800 rounded-full px-2.5 py-1.5 flex items-center justify-between gap-1.5 overflow-hidden hover:border-zinc-700 transition-colors mb-4 shadow-inner">
                  <div className="flex items-center gap-1.5 overflow-hidden min-w-0">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse shrink-0"></span>
                    <button
                      type="button"
                      onClick={() => onSelectTenant(currentPortfolio.slug)}
                      className="truncate font-mono text-[9px] text-zinc-300 hover:text-indigo-400 font-extrabold transition-colors cursor-pointer text-left flex items-center gap-1"
                      title={lang === 'pt' ? "Clique para abrir o site ativo" : "Click to open active site"}
                    >
                      <span>seusitealugado.com/{currentPortfolio.slug}</span>
                    </button>
                  </div>
                  <button
                    type="button"
                    onClick={() => onSelectTenant(currentPortfolio.slug)}
                    className="text-[8px] bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-400 font-extrabold px-2 py-0.5 rounded-full transition-colors shrink-0 cursor-pointer flex items-center gap-0.5"
                  >
                    <span>/{currentPortfolio.slug}</span>
                    <ExternalLink size={7} />
                  </button>
                </div>

                {/* High-Fidelity Client Main Public View Simulator (scrollable viewport) */}
                <div className="h-[365px] overflow-y-auto pr-0.5 space-y-4 text-left scrollbar-thin scrollbar-thumb-zinc-800 scrollbar-track-transparent">
                  
                  {/* Banner / Cover with Gradient & Overlapping Profile image */}
                  <div className="relative h-28 rounded-2xl overflow-hidden bg-[#111115] border border-zinc-800/40">
                    <div className={`absolute inset-0 bg-cover bg-center opacity-70`} style={{ backgroundImage: `url(${currentPortfolio.avatarImg})` }} />
                    <div className={`absolute inset-0 bg-gradient-to-t ${currentPortfolio.coverGradient}`} />
                    
                    {/* Overlapping profile badge */}
                    <div className="absolute -bottom-1 left-3 flex items-end gap-2.5 z-10">
                      <div className={`w-12 h-12 rounded-2xl bg-zinc-950 border-2 ${currentPortfolio.accentBorder} overflow-hidden flex items-center justify-center p-0.5 shadow-25 shadow-black/80`}>
                        <img src={currentPortfolio.avatarImg} className="w-full h-full object-cover rounded-xl" alt="" />
                      </div>
                    </div>
                  </div>

                  {/* Under cover detail context */}
                  <div className="px-1 space-y-1">
                    <button
                      type="button"
                      onClick={() => onSelectTenant(currentPortfolio.slug)}
                      className="text-sm font-black text-white hover:text-indigo-400 transition-colors leading-tight text-left cursor-pointer"
                    >
                      {currentPortfolio.title}
                    </button>
                    <div className="flex items-center gap-1.5 text-[9px] text-zinc-400 font-medium">
                      <span className="text-amber-500 font-bold flex items-center gap-0.5">★ 4.5</span>
                      <span>•</span>
                      <span>2 {lang === 'pt' ? 'avaliações' : 'reviews'}</span>
                      <span>•</span>
                      <span className={`text-[8px] bg-zinc-900 border border-zinc-800 px-1.5 py-0.2 rounded font-mono font-bold uppercase ${currentPortfolio.accentText}`}>
                        {currentPortfolio.key === 'barber' ? 'MONO' : currentPortfolio.key === 'salon' ? 'SERIF' : 'SANS'}
                      </span>
                    </div>
                  </div>

                  {/* Mini Public App Buttons row */}
                  <div className="flex gap-2 px-1">
                    <button type="button" className="flex-1 py-1 px-2.5 border border-zinc-800 text-zinc-300 bg-zinc-900/40 rounded-xl text-[9px] font-bold flex items-center justify-center gap-1 cursor-default select-none">
                      <Smartphone size={10} className={currentPortfolio.accentText} />
                      <span>{lang === 'pt' ? "Cartão Inteligente" : "Smart Card"}</span>
                    </button>
                    <button type="button" className="w-8 h-8 flex items-center justify-center rounded-xl bg-zinc-900/40 border border-zinc-800 text-zinc-400 cursor-default select-none">
                      <Share2 size={10} />
                    </button>
                  </div>

                  {/* Quem Somos PanelCard */}
                  <div className="bg-zinc-900/50 p-3.5 rounded-2xl border border-zinc-800/40 text-left space-y-2.5 shadow-lg shadow-black/10">
                    <span className="text-[9px] uppercase tracking-wider font-extrabold text-zinc-400 block">{currentPortfolio.aboutTitle}</span>
                    <p className="text-[10px] text-zinc-300 leading-relaxed font-semibold">
                      {currentPortfolio.aboutDesc}
                    </p>
                    
                    <div className="space-y-1.5 pt-2 border-t border-zinc-800/30 text-[9px] text-zinc-400 font-medium">
                      <div className="flex items-start gap-1.5 leading-snug">
                        <MapPin size={11} className={`${currentPortfolio.accentText} shrink-0 mt-0.5`} />
                        <span>{currentPortfolio.address}</span>
                      </div>
                      <div className="flex items-center gap-1.5 leading-none">
                        <Clock size={11} className={`${currentPortfolio.accentText} shrink-0`} />
                        <span>{currentPortfolio.hours}</span>
                      </div>
                      <div className="flex items-center gap-1.5 leading-none">
                        <Phone size={11} className={`${currentPortfolio.accentText} shrink-0`} />
                        <span>{currentPortfolio.phone}</span>
                      </div>
                    </div>
                  </div>

                  {/* Localização Map PanelCard mirroring Print 3 */}
                  <div className="bg-zinc-900/50 p-3.5 rounded-2xl border border-zinc-800/40 text-left space-y-2 shadow-lg shadow-black/10">
                    <span className="text-[9px] uppercase tracking-wider font-extrabold text-zinc-400 block">
                      {lang === 'pt' ? "Localização" : "Location"}
                    </span>
                    
                    <div className="h-28 rounded-xl border border-zinc-800 overflow-hidden relative bg-[#131317] select-none">
                      {/* Grid representation */}
                      <div className="absolute inset-0 opacity-10">
                        <div className="absolute top-1/4 left-0 w-full h-[1px] bg-zinc-400" />
                        <div className="absolute top-2/3 left-0 w-full h-[1px] bg-zinc-400" />
                        <div className="absolute top-0 left-1/3 w-[1px] h-full bg-zinc-400" />
                        <div className="absolute top-0 left-2/3 w-[1px] h-full bg-zinc-400" />
                        <div className="absolute top-0 left-0 w-[150%] h-[1px] bg-zinc-400 rotate-12 origin-top-left" />
                      </div>

                      {/* Map label points */}
                      <span className="absolute top-3 left-4 text-[7px] text-zinc-500 font-semibold tracking-tight">{currentPortfolio.street1}</span>
                      <span className="absolute bottom-6 right-8 text-[7px] text-zinc-400 font-semibold tracking-tight">{currentPortfolio.street2}</span>
                      
                      {/* Pulse marker */}
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="relative flex items-center justify-center">
                          <span className={`absolute inline-flex h-6 w-6 rounded-full opacity-60 animate-ping ${currentPortfolio.accentBg}`} />
                          <div className="relative z-10 w-6 h-6 bg-zinc-950 border border-zinc-800 rounded-full flex items-center justify-center shadow-lg">
                            <MapPin size={11} className="text-red-500 fill-red-500" />
                          </div>
                        </div>
                      </div>

                      {/* Branded elements */}
                      <div className="absolute bottom-1.5 left-2 text-[5px] text-zinc-500 pl-1 tracking-widest font-bold">Google</div>
                      
                      <div className="absolute top-1.5 left-1.5 text-[7px] bg-white text-zinc-950 border border-zinc-300 font-extrabold px-1.5 py-0.5 rounded shadow-md flex items-center gap-0.5">
                        <span>Maps</span>
                        <span>↗</span>
                      </div>
                    </div>
                  </div>

                </div>
                
              </div>
            </div>

          </div>

          {/* Pagination Bullet Indicators */}
          <div className="flex justify-center gap-2 pt-2">
            {carouselItems.map((item, idx) => {
              const isActive = activeIdx === idx;
              let activeColor = "bg-indigo-505";
              if (isActive) {
                if (item.key === 'barber') activeColor = "bg-amber-500";
                else if (item.key === 'salon') activeColor = "bg-rose-500";
                else activeColor = "bg-blue-600";
              }
              return (
                <button
                  key={idx}
                  onClick={() => {
                    setActiveIdx(idx);
                    setIsPaused(true);
                  }}
                  className={`h-2 rounded-full transition-all duration-300 cursor-pointer ${
                    isActive ? `w-8 ${activeColor}` : 'w-2 bg-zinc-700 hover:bg-zinc-600'
                  }`}
                  aria-label={`Go to slide ${idx + 1}`}
                />
              );
            })}
          </div>

          {/* CTA Button to full portfolio page */}
          <div className="flex justify-center pt-4">
            <button
              onClick={onGoToPortfolio}
              className={`inline-flex items-center gap-2 border text-sm font-black px-6 py-3 rounded-full transition-all hover:scale-105 active:scale-95 cursor-pointer ${
                theme === 'dark'
                  ? 'border-indigo-500/30 text-indigo-400 hover:bg-indigo-500/10'
                  : 'border-indigo-400/50 text-indigo-600 hover:bg-indigo-50'
              }`}
            >
              <Globe size={14} />
              {lang === 'pt' ? 'Ver Portfólio Completo de Sites' : 'View Full Sites Portfolio'}
              <ArrowRight size={14} />
            </button>
          </div>

        </div>
      </section>

      {/* MID-LANDING: BENEFITS SHOWCASE */}
      <section id="vantagens" className="w-full py-16 md:py-20">
        <div className="max-w-6xl mx-auto px-6 space-y-12">
          
          <div className="text-center space-y-2">
            <h2 className="text-2xl md:text-3xl font-black tracking-tight">{t.advantagesTitle}</h2>
            <p className={`text-xs max-w-xl mx-auto ${theme === 'dark' ? 'text-zinc-400' : 'text-slate-500'}`}>{t.advantagesSub}</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
            
            {/* Right side: 3 reasons with steps exactly as in print 2 */}
            <div className="lg:col-span-12 space-y-6">
              {[
                {
                  num: "01",
                  icon: <Smartphone size={22} />,
                  title: t.crmTitle,
                  desc: t.crmDesc,
                  isActive: true,
                },
                {
                  num: "02",
                  icon: <TrendingUp size={22} />,
                  title: t.stockTitle,
                  desc: t.stockDesc,
                  isActive: false,
                },
                {
                  num: "03",
                  icon: <ShoppingBag size={22} />,
                  title: t.ecomTitle,
                  desc: t.ecomDesc,
                  isActive: false,
                },
                {
                  num: "04",
                  icon: <CreditCard size={22} />,
                  title: t.cardTitle,
                  desc: t.cardDesc,
                  isActive: false,
                },
                {
                  num: "05",
                  icon: <Megaphone size={22} />,
                  title: t.demandTitle,
                  desc: t.demandDesc,
                  isActive: false,
                },
                {
                  num: "06",
                  icon: <CheckCircle2 size={22} />,
                  title: t.noCostTitle,
                  desc: t.noCostDesc,
                  isActive: false,
                },
              ].map((item, idx) => {
                const isExpanded = expandedItems.includes(idx);
                return (
                  <div key={idx} className="flex gap-4 items-start" onClick={() => setExpandedItems(prev => isExpanded ? prev.filter(i => i !== idx) : [...prev, idx])}>
                    
                    {/* Circular step badge matching print 2 styles */}
                    <div className="flex flex-col items-center shrink-0">
                      <motion.div 
                        initial={{ backgroundColor: "transparent", borderColor: theme === 'dark' ? "#3f3f46" : "#e2e8f0" }} 
                        animate={{ 
                            backgroundColor: isExpanded ? "#7c3aed" : "transparent", 
                            borderColor: isExpanded ? "#7c3aed" : (theme === 'dark' ? "#3f3f46" : "#e2e8f0"),
                            color: isExpanded ? "white" : (theme === 'dark' ? "#52525b" : "#94a3b8")
                        }} 
                        transition={{ duration: 0.3 }} 
                        className={`w-10 h-10 rounded-full flex items-center justify-center font-black text-xs transition-all duration-300 border-2`}
                      >
                        {item.num}
                      </motion.div>
                      {/* Visual alignment line if not last */}
                      {idx < 5 && (
                        <div className="w-0.5 h-16 bg-gradient-to-b from-purple-500/30 to-transparent my-1"></div>
                      )}
                    </div>

                    {/* Benefit Card containing the card styling */}
                    <motion.div 
                      className={`flex-1 p-5 rounded-2xl border-[0.5px] transition-all duration-300 transform cursor-pointer ${
                        isExpanded 
                          ? (theme === 'dark' ? 'bg-zinc-900/40 border-violet-500/50' : 'bg-white border-indigo-500/50 shadow-lg')
                          : (theme === 'dark' ? 'bg-zinc-900/40 border-zinc-800' : 'bg-white border-slate-200')
                      }`}>
                      <div className="space-y-1">
                        <h4 className={`font-black text-sm tracking-tight ${isExpanded ? (theme === 'dark' ? 'text-white' : 'text-slate-900') : (theme === 'dark' ? 'text-zinc-500' : 'text-slate-400')}`}>
                          {item.title}
                        </h4>
                        {isExpanded && (
                          <p className={`text-xs leading-relaxed ${theme === 'dark' ? 'text-zinc-400' : 'text-slate-500'}`}>
                            {item.desc}
                          </p>
                        )}
                      </div>
                    </motion.div>
                  </div>
                );
              })}
            </div>

          </div>

        </div>
      </section>

      {/* WHY RENT: INTERACTIVE ACCORDION Q&A FIELD */}
      <section id="faq" className={`py-16 md:py-20 border-t ${
        theme === 'dark' ? 'bg-zinc-900/20 border-zinc-900' : 'bg-slate-50 border-slate-200'
      }`}>
        <div className="max-w-4xl mx-auto px-6 space-y-10">
          
          <div className="text-center space-y-2">
            <h2 className="text-2xl md:text-3xl font-black tracking-tight">{t.faqTitle}</h2>
            <p className={`text-xs max-w-xl mx-auto ${theme === 'dark' ? 'text-zinc-400' : 'text-slate-550'}`}>{t.faqSub}</p>
          </div>

          <div className="space-y-3.5">
            {[
              { q: t.faq1Q, a: t.faq1A },
              { q: t.faq2Q, a: t.faq2A },
              { q: t.faq3Q, a: t.faq3A },
              { q: t.faq4Q, a: t.faq4A },
              { q: t.faq5Q, a: t.faq5A },
              { q: t.faq6Q, a: t.faq6A }
            ].map((faq, idx) => {
              const isOpen = openFaq === idx;
              return (
                <div 
                  key={idx} 
                  className={`rounded-2xl border transition-all ${
                    theme === 'dark' 
                      ? isOpen ? 'bg-zinc-900 border-zinc-800' : 'bg-zinc-950 border-zinc-900'
                      : isOpen ? 'bg-white border-slate-300 shadow-sm' : 'bg-white border-slate-200'
                  }`}
                >
                  <button 
                    onClick={() => setOpenFaq(isOpen ? null : idx)}
                    className="w-full p-5 flex items-center justify-between text-left text-xs md:text-sm font-extrabold cursor-pointer text-zinc-200"
                    title="Alternar Detalhes"
                  >
                    <span className={theme === 'dark' ? 'text-zinc-100' : 'text-slate-900'}>{faq.q}</span>
                    <ChevronDown size={14} className={`text-indigo-400 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
                  </button>

                  {isOpen && (
                    <div className="px-5 pb-5 animate-in fade-in slide-in-from-top-1 duration-150">
                      <p className={`text-xs leading-relaxed ${theme === 'dark' ? 'text-zinc-400 font-medium' : 'text-slate-600 font-normal'}`}>
                        {faq.a}
                      </p>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

        </div>
      </section>

      {/* DIAGNOSTIC AND 15 MIN MEETING REQUEST SECTION */}
      <section id="diagnostico" className="max-w-4xl mx-auto px-6 py-16 md:py-20 space-y-10">
        
        <div className="text-center space-y-2">
          <div className="inline-flex items-center gap-1.5 bg-amber-500/15 text-amber-400 border border-amber-500/20 px-3 py-1 rounded-full text-[10px] font-bold uppercase">
            <span>Diagnóstico Exclusivo</span>
          </div>
          <h2 className="text-2xl md:text-3xl font-black tracking-tight">{t.diagnosticTitle}</h2>
          <p className="text-xs text-zinc-400">{t.diagnosticSub}</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-stretch">
          
          {/* Invitation left panel */}
          <div className="md:col-span-5 bg-gradient-to-br from-indigo-900/40 to-zinc-950 border border-indigo-500/10 rounded-3xl p-6 flex flex-col justify-between space-y-6">
            <div className="space-y-4">
              <span className="text-[9px] bg-emerald-600 text-white font-extrabold px-2 py-0.5 rounded uppercase tracking-wider block max-w-max">Bate-Papo Rápido</span>
              <h3 className="text-base font-extrabold leading-tight text-white">{t.meetingInvite}</h3>
              <p className="text-[11px] text-zinc-400 leading-relaxed font-medium">{t.meetingSub}</p>
            </div>

            <div className="bg-black/45 p-3.5 rounded-2xl border border-zinc-900 text-[10px] text-zinc-500 font-mono space-y-2">
              <span className="text-[9px] text-zinc-400 uppercase tracking-widest font-bold block">Como funciona:</span>
              <p>✔ Analisamos sua presença atual no Google Maps.</p>
              <p>✔ Verificamos a automação dos seus agendamentos.</p>
              <p>✔ Damos um panorama de precificação do seu lojsta.</p>
            </div>
            
            <a 
              href="https://wa.me/5571984184782?text=Ola%20gostaria%20de%20um%20bate-papo%20de%2015%20minutos%20sobre%20o%20aluguel%20do%20meu%20site"
              target="_blank"
              rel="noopener noreferrer"
              referrerPolicy="no-referrer"
              className="hidden w-full py-3 bg-emerald-600 hover:bg-emerald-550 text-white font-bold rounded-xl text-center text-xs items-center justify-center gap-2"
            >
              <MessageSquare size={14} />
              <span>Agendar WhatsApp Conversa</span>
            </a>
          </div>

          {/* Interactive Form panel */}
          <div className="md:col-span-7 bg-[#0a0b0e] border border-zinc-805 rounded-3xl p-6 flex flex-col justify-between space-y-4 shadow-xl">
            
            {diagnosticSaved ? (
              <div className="text-center py-10 space-y-4 animate-in zoom-in-95 duration-200">
                <div className="w-14 h-14 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 rounded-full flex items-center justify-center mx-auto text-2xl font-bold">
                  ✓
                </div>
                <div className="space-y-2">
                  <h4 className="font-extrabold text-base text-white">{t.diagSuccessHeader}</h4>
                  <p className="text-xs text-zinc-400 leading-relaxed px-4">{t.diagSuccessBody}</p>
                </div>
                
                <div className="flex flex-col gap-2 pt-2">
                  <button className="w-full py-3 bg-zinc-800 text-white font-bold rounded-xl text-xs hover:bg-zinc-700">
                    Diagnóstico Grátis
                  </button>
                  <a 
                    href={`https://wa.me/55${diagPhone.replace(/\D/g, '')}?text=Ola%20gostaria%20de%20um%20diagnostico%20sobre%20o%20aluguel%20do%20meu%20site`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full py-3 bg-[#25D366] text-white font-bold rounded-xl text-xs hover:bg-[#20ba54] flex items-center justify-center gap-2"
                  >
                    <MessageSquare size={14} />
                    <span>WhatsApp</span>
                  </a>
                </div>
              </div>
            ) : diagnosingProgress ? (
              <div className="text-center py-12 space-y-4 flex flex-col items-center justify-center">
                <div className="w-10 h-10 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
                <div className="space-y-1">
                  <p className="text-xs font-bold text-zinc-300">Analisando respostas do seu segmento...</p>
                  <p className="text-[10px] text-zinc-550 font-mono text-zinc-500">Mapeando modelo de site ideal</p>
                </div>
              </div>
            ) : (
              <form onSubmit={handleDiagnosticSubmit} className="space-y-4 text-xs">
                
                {diagStep === 1 && (
                  <div className="space-y-3 animate-in fade-in duration-200">
                    <label className="block text-zinc-400 font-extrabold text-[11px] uppercase tracking-wider">{t.diagnosticStep1}</label>
                    <div className="grid grid-cols-1 gap-2">
                      {[
                        { id: "barber", label: t.optBarber },
                        { id: "salon", label: t.optSalon },
                        { id: "auto", label: t.optAuto },
                        { id: "retail", label: t.optRetail },
                        { id: "other", label: t.optOther }
                      ].map((item) => (
                        <button 
                          key={item.id}
                          type="button"
                          onClick={() => setDiagNiche(item.id)}
                          className={`w-full p-2.5 rounded-xl border text-left font-bold ${
                            diagNiche === item.id 
                              ? 'bg-indigo-600 border-indigo-500 text-white' 
                              : 'bg-zinc-900/60 border-zinc-800 text-zinc-300 hover:border-zinc-700'
                          }`}
                        >
                          {item.label}
                        </button>
                      ))}
                    </div>
                    <div className="pt-2 flex justify-end">
                      <button 
                        type="button" 
                        disabled={!diagNiche}
                        onClick={() => setDiagStep(2)}
                        className="px-6 py-2 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-40 disabled:cursor-not-allowed text-white font-extrabold rounded-xl"
                      >
                        {t.btnNext}
                      </button>
                    </div>
                  </div>
                )}

                {diagStep === 2 && (
                  <div className="space-y-3 animate-in fade-in duration-200">
                    <label className="block text-zinc-400 font-extrabold text-[11px] uppercase tracking-wider">{t.diagnosticStep2}</label>
                    <div className="grid grid-cols-1 gap-2">
                      {[
                        { id: "appointments", label: t.painAppointments },
                        { id: "noneGoogle", label: t.painNoGoogle },
                        { id: "manual", label: t.painManual },
                        { id: "control", label: t.painControl }
                      ].map((item) => (
                        <button 
                          key={item.id}
                          type="button"
                          onClick={() => setDiagPain(item.id)}
                          className={`w-full p-2.5 rounded-xl border text-left font-bold ${
                            diagPain === item.id 
                              ? 'bg-indigo-600 border-indigo-500 text-white' 
                              : 'bg-zinc-900/60 border-zinc-800 text-zinc-300 hover:border-zinc-700'
                          }`}
                        >
                          {item.label}
                        </button>
                      ))}
                    </div>
                    <div className="pt-2 flex justify-between">
                      <button 
                        type="button" 
                        onClick={() => setDiagStep(1)}
                        className="px-4 py-2 bg-zinc-900 border border-zinc-800 text-zinc-300 font-bold rounded-xl"
                      >
                        {lang === 'pt' ? 'Voltar' : 'Back'}
                      </button>
                      <button 
                        type="button" 
                        disabled={!diagPain}
                        onClick={() => setDiagStep(3)}
                        className="px-6 py-2 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-40 disabled:cursor-not-allowed text-white font-extrabold rounded-xl"
                      >
                        {t.btnNext}
                      </button>
                    </div>
                  </div>
                )}

                {diagStep === 3 && (
                  <div className="space-y-4 animate-in fade-in duration-200">
                    <label className="block text-zinc-400 font-extrabold text-[11px] uppercase tracking-wider">{t.diagnosticStep3}</label>
                    <div className="space-y-3">
                      <div>
                        <label className="block text-zinc-450 mb-1 font-bold text-[10px]">{t.formName}</label>
                        <input 
                          type="text" 
                          required 
                          value={diagName}
                          onChange={(e) => setDiagName(e.target.value)}
                          placeholder={t.formNamePlaceholder}
                          className="w-full p-2.5 rounded-xl bg-zinc-900 border border-zinc-800 text-white placeholder:text-zinc-650 focus:outline-none focus:border-indigo-500"
                        />
                      </div>
                      <div>
                        <label className="block text-zinc-450 mb-1 font-bold text-[10px]">{t.formPhone}</label>
                        <input 
                          type="text" 
                          required 
                          value={diagPhone}
                          onChange={(e) => setDiagPhone(e.target.value)}
                          placeholder={t.formPhonePlaceholder}
                          className="w-full p-2.5 rounded-xl bg-zinc-900 border border-zinc-800 text-white placeholder:text-zinc-650 focus:outline-none focus:border-indigo-500"
                        />
                      </div>
                    </div>

                    <div className="pt-2 flex justify-between items-center gap-3">
                      <button 
                        type="button" 
                        onClick={() => setDiagStep(2)}
                        className="px-4 py-2 bg-zinc-900 border border-zinc-800 text-zinc-300 font-bold rounded-xl"
                      >
                        {lang === 'pt' ? 'Voltar' : 'Back'}
                      </button>
                      <button 
                        type="submit" 
                        className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-black rounded-xl cursor-pointer"
                      >
                        {t.btnSubmit}
                      </button>
                    </div>
                  </div>
                )}

              </form>
            )}

          </div>

        </div>

      </section>



      {/* PRICING PLANS */}
      <section id="planos" className="max-w-6xl mx-auto px-6 py-16 md:py-24 space-y-12">
        <div className="text-center space-y-2">
          <h2 className="text-2xl md:text-3xl font-black">{t.pricingTitle}</h2>
          <p className="text-xs text-zinc-400">{t.pricingSub}</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          
          {/* PLAN BASIC */}
          <div className={`p-8 rounded-3xl space-y-6 flex flex-col justify-between border transition-all duration-300 ${
            theme === 'dark' 
              ? 'bg-[#021d10]/95 border-emerald-400 text-white shadow-2xl shadow-emerald-500/20' 
              : 'bg-emerald-50 border-emerald-500 text-emerald-950 shadow-lg shadow-emerald-200/50'
          }`}>
            <div className="space-y-4">
              <div className="space-y-1">
                <span className={`text-[10px] font-extrabold uppercase tracking-widest block ${
                  theme === 'dark' ? 'text-emerald-400' : 'text-emerald-700'
                }`}>{t.planBasicTag}</span>
                <h3 className={`text-lg font-black ${
                  theme === 'dark' ? 'text-emerald-300' : 'text-emerald-900'
                }`}>{t.planBasic}</h3>
                <div className="flex items-baseline gap-1 pt-1 font-mono">
                  <span className={`text-3xl font-black ${
                    theme === 'dark' ? 'text-white' : 'text-emerald-950'
                  }`}>R$ 49,00</span>
                  <span className={`text-xs ${
                    theme === 'dark' ? 'text-emerald-400' : 'text-emerald-600'
                  }`}>{t.priceMonth}</span>
                </div>
              </div>

              <ul className={`space-y-3.5 text-xs border-t pt-4 ${
                theme === 'dark' ? 'border-emerald-800 text-emerald-100' : 'border-emerald-300 text-emerald-950'
              }`}>
                <li className="flex items-center gap-2"><Check size={14} className={`${theme === 'dark' ? 'text-emerald-400' : 'text-emerald-700'} shrink-0 font-bold`} /> <span className="font-semibold text-[11px] md:text-xs">Página Pública Customizada</span></li>
                <li className="flex items-center gap-2"><Check size={14} className={`${theme === 'dark' ? 'text-emerald-400' : 'text-emerald-700'} shrink-0 font-bold`} /> <span className="font-semibold text-[11px] md:text-xs">Cadastro Ilimitado de Serviços</span></li>
                <li className="flex items-center gap-2"><Check size={14} className={`${theme === 'dark' ? 'text-emerald-400' : 'text-emerald-707'} ${theme === 'dark' ? 'text-emerald-400' : 'text-emerald-700'} shrink-0 font-bold`} /> <span className="font-semibold text-[11px] md:text-xs">Botão Direto para Chamar WhatsApp</span></li>
                <li className="flex items-center gap-2"><Check size={14} className={`${theme === 'dark' ? 'text-emerald-400' : 'text-emerald-707'} ${theme === 'dark' ? 'text-emerald-400' : 'text-emerald-700'} shrink-0 font-bold`} /> <span className="font-semibold text-[11px] md:text-xs">Até 50 Clientes no funil</span></li>
                
                {/* Itens adicionais como nao inclusos */}
                <li className="flex items-center gap-2 text-zinc-400/80 line-through decoration-red-500 decoration-2"><X size={14} className="text-red-500 shrink-0 font-bold" /> <span className="font-semibold text-[11px] md:text-xs">Sub Domínio incluso</span></li>
                <li className="flex items-center gap-2 text-zinc-400/80 line-through decoration-red-500 decoration-2"><X size={14} className="text-red-500 shrink-0 font-bold" /> <span className="font-semibold text-[11px] md:text-xs">Template editável</span></li>
                <li className="flex items-center gap-2 text-zinc-400/80 line-through decoration-red-500 decoration-2"><X size={14} className="text-red-500 shrink-0 font-bold" /> <span className="font-semibold text-[11px] md:text-xs">cartão de visita QRCode</span></li>
                <li className="flex items-center gap-2 text-zinc-400/80 line-through decoration-red-500 decoration-2"><X size={14} className="text-red-500 shrink-0 font-bold" /> <span className="font-semibold text-[11px] md:text-xs">SEO Local</span></li>
                <li className="flex items-center gap-2 text-zinc-400/80 line-through decoration-red-500 decoration-2"><X size={14} className="text-red-500 shrink-0 font-bold" /> <span className="font-semibold text-[11px] md:text-xs">Google Maps</span></li>
              </ul>
            </div>

            <button
              onClick={() => {
                setSetupPlan("basic");
                setShowSetupModal(true);
                // Abre o Stripe em nova aba
                window.open("https://buy.stripe.com/bJefZa2urc3ye9YcKCf3a0l", "_blank");
              }}
              className={`w-full mt-6 py-3 text-center font-extrabold rounded-xl text-xs cursor-pointer transition-all ${
                theme === 'dark' 
                  ? 'bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-black shadow-md shadow-emerald-505/20' 
                  : 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-md'
              }`}
            >
              {t.testDemo}
            </button>
          </div>

          {/* PLAN PROFESSIONAL */}
          <div className={`p-8 rounded-3xl space-y-6 relative flex flex-col justify-between border transition-all duration-300 ${
            theme === 'dark' 
              ? 'bg-[#0a1834]/90 border-blue-500 text-white shadow-2xl shadow-indigo-950/20' 
              : 'bg-indigo-50 border-indigo-400 text-indigo-950 shadow-2xl shadow-indigo-200/50'
          }`}>
            <div className="absolute top-0 right-4 -translate-y-1/2 bg-indigo-600 text-white px-3.5 py-0.5 rounded-full text-[9px] font-black uppercase tracking-widest">{t.mostRequested}</div>
            
            <div className="space-y-4">
              <div className="space-y-1">
                <span className={`text-[10px] font-extrabold uppercase tracking-widest block ${
                  theme === 'dark' ? 'text-indigo-300' : 'text-indigo-700'
                }`}>{t.planProfTag}</span>
                <h3 className={`text-lg font-black ${
                  theme === 'dark' ? 'text-indigo-300' : 'text-indigo-900'
                }`}>{t.planProf}</h3>
                <div className="flex items-baseline gap-1 pt-1 font-mono">
                  <span className={`text-3xl font-black ${
                    theme === 'dark' ? 'text-white' : 'text-indigo-950'
                  }`}>R$ 69,00</span>
                  <span className={`text-xs ${
                    theme === 'dark' ? 'text-indigo-300' : 'text-indigo-600'
                  }`}>{t.priceMonth}</span>
                </div>
              </div>

              <ul className={`space-y-3.5 text-xs border-t pt-4 ${
                theme === 'dark' ? 'border-indigo-900/40 text-zinc-100' : 'border-indigo-200 text-indigo-950'
              }`}>
                <li className="flex items-center gap-2"><Check size={14} className={`${theme === 'dark' ? 'text-blue-400' : 'text-blue-600'} shrink-0 font-bold`} /> <span className="font-semibold text-[11px] md:text-xs">Tudo do Plano Básico</span></li>
                <li className="flex items-center gap-2"><Check size={14} className={`${theme === 'dark' ? 'text-blue-400' : 'text-blue-600'} shrink-0 font-bold`} /> <span className="font-semibold text-[11px] md:text-xs">Agenda Online com Horário Reservado</span></li>
                <li className="flex items-center gap-2"><Check size={14} className={`${theme === 'dark' ? 'text-blue-400' : 'text-blue-600'} shrink-0 font-bold`} /> <span className="font-semibold text-[11px] md:text-xs">Mini CRM Funil de Vendas Completo</span></li>
                <li className="flex items-center gap-2"><Check size={14} className={`${theme === 'dark' ? 'text-blue-400' : 'text-blue-600'} shrink-0 font-bold`} /> <span className="font-semibold text-[11px] md:text-xs">Caixa Financeiro e Estoque Alerta</span></li>
                <li className="flex items-center gap-2"><Check size={14} className={`${theme === 'dark' ? 'text-blue-400' : 'text-blue-600'} shrink-0 font-bold`} /> <span className="font-semibold text-[11px] md:text-xs">Até 100 Clientes no funil</span></li>
                <li className="flex items-center gap-2"><Check size={14} className={`${theme === 'dark' ? 'text-blue-400' : 'text-blue-600'} shrink-0 font-bold`} /> <span className="font-semibold text-[11px] md:text-xs">Google meu Negócio</span></li>
                <li className="flex items-center gap-2"><Check size={14} className={`${theme === 'dark' ? 'text-blue-400' : 'text-blue-600'} shrink-0 font-bold`} /> <span className="font-semibold text-[11px] md:text-xs">SEO Local</span></li>
                <li className="flex items-center gap-2"><Check size={14} className={`${theme === 'dark' ? 'text-blue-400' : 'text-blue-600'} shrink-0 font-bold`} /> <span className="font-semibold text-[11px] md:text-xs">Avaliações</span></li>
                <li className="flex items-center gap-2"><Check size={14} className={`${theme === 'dark' ? 'text-blue-400' : 'text-blue-600'} shrink-0 font-bold`} /> <span className="font-semibold text-[11px] md:text-xs">Template Editável</span></li>
              </ul>
            </div>

            <button
              onClick={() => {
                setSetupPlan("professional");
                setShowSetupModal(true);
                window.open("https://buy.stripe.com/7sYdR2b0Xc3y1ncbGyf3a0m", "_blank");
              }}
              className={`w-full mt-6 py-3 text-center font-extrabold rounded-xl text-xs cursor-pointer transition-all ${
                theme === 'dark' 
                  ? 'bg-blue-600 hover:bg-blue-500 text-white shadow-lg shadow-blue-500/30' 
                  : 'bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-600/30'
              }`}
            >
              {t.testDemo}
            </button>
          </div>

          {/* PLAN PREMIUM */}
          <div className={`p-8 rounded-3xl space-y-6 flex flex-col justify-between border transition-all duration-300 ${
            theme === 'dark' 
              ? 'bg-[#221503]/95 border-amber-400 text-white shadow-2xl shadow-amber-500/20' 
              : 'bg-amber-50 border-amber-500 text-amber-950 shadow-lg shadow-amber-200/50'
          }`}>
            <div className="space-y-4">
              <div className="space-y-1">
                <span className={`text-[10px] font-extrabold uppercase tracking-widest block ${
                  theme === 'dark' ? 'text-amber-400' : 'text-amber-700'
                }`}>{t.planPremTag}</span>
                <h3 className={`text-lg font-black ${
                  theme === 'dark' ? 'text-amber-300' : 'text-amber-900'
                }`}>{t.planPrem}</h3>
                <div className="flex items-baseline gap-1 pt-1 font-mono">
                  <span className={`text-3xl font-black ${
                    theme === 'dark' ? 'text-white' : 'text-amber-950'
                  }`}>R$ 99,00</span>
                  <span className={`text-xs ${
                    theme === 'dark' ? 'text-amber-400' : 'text-amber-600'
                  }`}>{t.priceMonth}</span>
                </div>
              </div>

              <ul className={`space-y-3.5 text-xs border-t pt-4 ${
                theme === 'dark' ? 'border-amber-900/30 text-zinc-100' : 'border-amber-300 text-amber-950'
              }`}>
                <li className="flex items-center gap-2"><Check size={14} className={`${theme === 'dark' ? 'text-amber-400' : 'text-amber-600'} shrink-0 font-bold`} /> <span className="font-semibold text-[11px] md:text-xs">Tudo do Profissional</span></li>
                <li className="flex items-center gap-2"><Check size={14} className={`${theme === 'dark' ? 'text-amber-400' : 'text-amber-600'} shrink-0 font-bold`} /> <span className="font-semibold text-[11px] md:text-xs">Assistente de IA Comercial Integrado</span></li>
                <li className="flex items-center gap-2"><Check size={14} className={`${theme === 'dark' ? 'text-amber-400' : 'text-amber-600'} shrink-0 font-bold`} /> <span className="font-semibold text-[11px] md:text-xs">Lista Transmissão WhatsApp automática</span></li>
                <li className="flex items-center gap-2"><Check size={14} className={`${theme === 'dark' ? 'text-amber-400' : 'text-amber-600'} shrink-0 font-bold`} /> <span className="font-semibold text-[11px] md:text-xs">Cartão Digital com QR Code do local</span></li>
                <li className="flex items-center gap-2"><Check size={14} className={`${theme === 'dark' ? 'text-amber-400' : 'text-amber-600'} shrink-0 font-bold`} /> <span className="font-semibold text-[11px] md:text-xs">Programa de Fidelidade Cashback</span></li>
                <li className="flex items-center gap-2"><Check size={14} className={`${theme === 'dark' ? 'text-amber-400' : 'text-amber-600'} shrink-0 font-bold`} /> <span className="font-semibold text-[11px] md:text-xs">Clientes Ilimitados no funil</span></li>
                <li className="flex items-center gap-2"><Check size={14} className={`${theme === 'dark' ? 'text-amber-400' : 'text-amber-600'} shrink-0 font-bold`} /> <span className="font-semibold text-[11px] md:text-xs">Google meu Negócio</span></li>
                <li className="flex items-center gap-2"><Check size={14} className={`${theme === 'dark' ? 'text-amber-400' : 'text-amber-600'} shrink-0 font-bold`} /> <span className="font-semibold text-[11px] md:text-xs">SEO Local</span></li>
                <li className="flex items-center gap-2"><Check size={14} className={`${theme === 'dark' ? 'text-amber-400' : 'text-amber-600'} shrink-0 font-bold`} /> <span className="font-semibold text-[11px] md:text-xs">Avaliações</span></li>
                <li className="flex items-center gap-2"><Check size={14} className={`${theme === 'dark' ? 'text-amber-400' : 'text-amber-600'} shrink-0 font-bold`} /> <span className="font-semibold text-[11px] md:text-xs">Template Editável</span></li>
              </ul>
            </div>

            <button
              onClick={() => {
                setSetupPlan("premium");
                setShowSetupModal(true);
                window.open("https://buy.stripe.com/dRm9AM8SP7Ni6HwbGyf3a0n", "_blank");
              }}
              className={`w-full mt-6 py-3 text-center font-extrabold rounded-xl text-xs cursor-pointer transition-all ${
                theme === 'dark' 
                  ? 'bg-amber-500 hover:bg-amber-400 text-zinc-950 font-black shadow-lg shadow-amber-500/25' 
                  : 'bg-amber-600 hover:bg-amber-700 text-white shadow-lg'
              }`}
            >
              {t.testDemo}
            </button>
          </div>

        </div>
      </section>

      {/* SetupModal — ativado após pagamento confirmado */}
      {showSetupModal && (
        <SetupModal
          plan={setupPlan}
          onClose={() => setShowSetupModal(false)}
          onSuccess={(slug) => {
            setShowSetupModal(false);
            onSelectTenant(slug);
          }}
        />
      )}

      {/* FOOTER */}
      <footer className={`border-t py-12 text-center text-xs space-y-2 font-medium ${
        theme === 'dark' ? 'bg-[#050608] border-zinc-900 text-zinc-500' : 'bg-white border-slate-200 text-slate-500'
      }`}>
        <p>{t.footerText1}</p>
        <p className="opacity-80">{t.footerText2}</p>
      </footer>
    </div>

  );
}
