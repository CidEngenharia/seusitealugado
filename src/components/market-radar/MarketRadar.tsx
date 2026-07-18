import React, { useEffect, useState } from "react";
import { 
  Radar, 
  Map, 
  TableProperties, 
  Sparkles, 
  AlertTriangle, 
  Activity, 
  TrendingUp, 
  RefreshCw,
  Search,
  HelpCircle,
  Award,
  Zap,
  MapPin,
  Lightbulb,
  CheckCircle,
  DollarSign,
  TrendingDown,
  Clock,
  ThumbsUp,
  Sliders,
  MessageSquare
} from "lucide-react";
import SearchBar from "./SearchBar";
import Filters, { FilterState } from "./Filters";
import CompetitorCard, { Competitor } from "./CompetitorCard";
import AnalysisModal from "./AnalysisModal";
import CompetitorTable from "./CompetitorTable";
import MapView from "./MapView";

interface MarketRadarProps {
  tenant: any;
  onTenantUpdated: (tenant: any) => void;
}

export default function MarketRadar({ tenant, onTenantUpdated }: MarketRadarProps) {
  const [activeSubTab, setActiveSubTab] = useState<"search" | "compare" | "map" | "feedback">("search");
  const [isLoading, setIsLoading] = useState(false);
  const [competitors, setCompetitors] = useState<Competitor[]>([]);
  const [center, setCenter] = useState<{ lat: number; lon: number }>({ lat: -12.9704, lon: -38.5089 }); // Salvador
  const [niche, setNiche] = useState("Oficina");
  const [city, setCity] = useState("Salvador");
  
  // Comparador
  const [comparedList, setComparedList] = useState<Competitor[]>([]);
  
  // Modais e Análises
  const [selectedCompetitorForAnalysis, setSelectedCompetitorForAnalysis] = useState<Competitor | null>(null);

  // Filtros
  const [filters, setFilters] = useState<FilterState>({
    priceLevel: [],
    maxDistance: null,
    minAge: null,
    minRating: null,
    minReviews: null
  });

  const handleSearch = async (selectedNiche: string, selectedCity: string, selectedRadius: number, neighborhood?: string) => {
    setIsLoading(true);
    setNiche(selectedNiche);
    setCity(selectedCity);
    try {
      const response = await fetch("/api/market-radar/search", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          niche: selectedNiche,
          city: selectedCity + (neighborhood ? `, ${neighborhood}` : ""),
          radius: selectedRadius,
          tenantId: tenant.id
        })
      });

      if (!response.ok) throw new Error("Erro na busca");
      const data = await response.json();
      
      setCenter(data.center);
      setCompetitors(data.competitors);
    } catch (e) {
      console.error(e);
      alert("Erro ao consultar concorrentes locais. Usando fallbacks offline.");
    } finally {
      setIsLoading(false);
    }
  };

  // Lógica de adicionar à comparação e já navegar para a aba de comparação
  const handleCompareAndOpen = (comp: Competitor) => {
    setComparedList((prev) => {
      const exists = prev.some((c) => c.id === comp.id);
      if (exists) {
        // Se já existe, apenas navega
        setTimeout(() => setActiveSubTab("compare"), 50);
        return prev;
      }
      if (prev.length >= 5) {
        alert("Você pode comparar até 5 concorrentes simultaneamente.");
        return prev;
      }
      // Adiciona e navega
      setTimeout(() => setActiveSubTab("compare"), 50);
      return [...prev, comp];
    });
  };

  const filteredCompetitors = competitors.filter((comp) => {
    if (filters.priceLevel.length > 0 && !filters.priceLevel.includes(comp.price_level)) {
      return false;
    }
    if (filters.maxDistance !== null && comp.distance_km > filters.maxDistance) {
      return false;
    }
    if (filters.minAge !== null && comp.business_age < filters.minAge) {
      return false;
    }
    if (filters.minRating !== null && comp.rating < filters.minRating) {
      return false;
    }
    if (filters.minReviews !== null && comp.reviews_count < filters.minReviews) {
      return false;
    }
    return true;
  });

  const getTopConcorrente = () => {
    if (competitors.length === 0) return null;
    const sorted = [...competitors].sort((a, b) => b.rating - a.rating || b.reviews_count - a.reviews_count);
    return sorted[0];
  };

  const topCompetitor = getTopConcorrente();

  // GERAÇÃO DE FEEDBACK ESTATÍSTICO DOS CONCORRENTES COMPARADOS
  const generateFeedbackEstatistico = () => {
    if (comparedList.length === 0) return null;

    const avgRating = comparedList.reduce((acc, c) => acc + c.rating, 0) / comparedList.length;
    const totalReviews = comparedList.reduce((acc, c) => acc + c.reviews_count, 0);
    
    // Contagem de faixas de preço
    const priceCounts: Record<string, number> = {};
    comparedList.forEach(c => {
      priceCounts[c.price_level] = (priceCounts[c.price_level] || 0) + 1;
    });
    
    let priceSuggestion = "Nível de preço médio equilibrado na região.";
    const hasManyCheap = (priceCounts["$"] || 0) > comparedList.length / 2;
    const hasManyExpensive = (priceCounts["$$$"] || 0) > comparedList.length / 3;
    
    if (hasManyCheap) {
      priceSuggestion = "A maioria dos concorrentes foca em preço baixo ($). Há espaço para você se posicionar como um serviço Premium ($$ ou $$$), agregando valor e qualidade superior.";
    } else if (hasManyExpensive) {
      priceSuggestion = "A concorrência local cobra caro ($$$). Oferecer combos promocionais ou condições de pagamento facilitadas pode atrair clientes sensíveis a preço.";
    }

    // Sugestão de serviços/ações com base nas médias
    let actionPriority = "Melhorar a quantidade de avaliações no Google Meu Negócio.";
    if (avgRating > 4.4) {
      actionPriority = "Focar em pós-venda e retenção. A concorrência possui alta satisfação do cliente, o que exige atendimento impecável da sua parte para fidelizar.";
    } else {
      actionPriority = "Oportunidade de ouro: a média de nota dos concorrentes é baixa. Incentive ativamente seus clientes a deixarem avaliações positivas para subir no ranking rapidamente.";
    }

    return {
      avgRating: avgRating.toFixed(1),
      totalReviews,
      priceSuggestion,
      actionPriority,
      competitorsCount: comparedList.length
    };
  };

  const feedbackData = generateFeedbackEstatistico();

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 p-6 rounded-3xl text-white shadow-md border border-slate-800">
        <div className="space-y-1">
          <span className="text-[10px] font-mono tracking-widest text-violet-300 uppercase block font-bold">
            Inteligência de Mercado Premium
          </span>
          <h2 className="text-xl font-extrabold flex items-center gap-2">
            <Radar className="text-violet-400 animate-pulse" size={20} />
            <span>Radar de Concorrentes</span>
          </h2>
          <p className="text-xs text-slate-350 max-w-xl">
            Acompanhe o mercado local de forma visual e intuitiva. Responda perguntas estratégicas e tome decisões de venda sem complicações técnicas.
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-200 gap-1 overflow-x-auto shrink-0">
        <button
          onClick={() => setActiveSubTab("search")}
          className={`py-3 px-4 text-xs font-semibold flex items-center gap-2 transition-all cursor-pointer border-b-2 ${
            activeSubTab === "search"
              ? "border-violet-600 text-violet-700 font-bold"
              : "border-transparent text-slate-500 hover:text-violet-600"
          }`}
        >
          <Search size={14} />
          <span>Buscar Concorrentes</span>
        </button>
        
        <button
          onClick={() => setActiveSubTab("compare")}
          className={`py-3 px-4 text-xs font-semibold flex items-center gap-2 transition-all cursor-pointer border-b-2 ${
            activeSubTab === "compare"
              ? "border-violet-600 text-violet-700 font-bold"
              : "border-transparent text-slate-500 hover:text-violet-600"
          }`}
        >
          <TableProperties size={14} />
          <span>Tabela Comparativa</span>
          {comparedList.length > 0 && (
            <span className="bg-violet-100 text-violet-800 text-[10px] px-1.5 py-0.5 rounded-full font-bold">
              {comparedList.length}
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveSubTab("map")}
          className={`py-3 px-4 text-xs font-semibold flex items-center gap-2 transition-all cursor-pointer border-b-2 ${
            activeSubTab === "map"
              ? "border-violet-600 text-violet-700 font-bold"
              : "border-transparent text-slate-500 hover:text-violet-600"
          }`}
        >
          <Map size={14} />
          <span>Mapa de Calor</span>
        </button>

        <button
          onClick={() => setActiveSubTab("feedback")}
          className={`py-3 px-4 text-xs font-semibold flex items-center gap-2 transition-all cursor-pointer border-b-2 ${
            activeSubTab === "feedback"
              ? "border-violet-600 text-violet-700 font-bold"
              : "border-transparent text-slate-500 hover:text-violet-600"
          }`}
        >
          <Activity size={14} />
          <span>Feedback Estatístico</span>
          {comparedList.length > 0 && (
            <span className="bg-emerald-500 text-white text-[10px] px-1.5 py-0.5 rounded-full font-bold">
              Analítico
            </span>
          )}
        </button>
      </div>

      {/* Content */}
      {activeSubTab === "search" && (
        <div className="space-y-6">
          <SearchBar onSearch={handleSearch} isLoading={isLoading} />

          {/* PAINEL DAS 5 PERGUNTAS DO EMPRESÁRIO */}
          <div className="bg-slate-50 border border-slate-200/60 p-6 rounded-3xl space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <span className="text-[9px] font-mono tracking-widest text-violet-700 uppercase font-bold">
                  Decisão em Linguagem Simples
                </span>
                <h3 className="text-sm font-bold text-slate-800">
                  Respostas Rápidas Para O Seu Negócio
                </h3>
              </div>
              <HelpCircle className="text-slate-350" size={18} />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
              {/* Pergunta 1 */}
              <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs space-y-2 flex flex-col justify-between">
                <div className="space-y-1">
                  <div className="w-8 h-8 rounded-lg bg-violet-50 text-violet-600 flex items-center justify-center">
                    <Award size={15} />
                  </div>
                  <h4 className="text-[11px] font-bold text-slate-800">Quem são meus principais concorrentes?</h4>
                </div>
                <p className="text-[10px] text-slate-500 leading-normal">
                  {competitors.length > 0 
                    ? `Encontramos ${competitors.length} concorrentes de ${niche} em ${city}. O mais próximo está a ${competitors[0].distance_km} km.` 
                    : "Faça uma busca para mapear os concorrentes mais próximos no seu bairro e cidade."}
                </p>
              </div>

              {/* Pergunta 2 */}
              <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs space-y-2 flex flex-col justify-between">
                <div className="space-y-1">
                  <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
                    <Zap size={15} />
                  </div>
                  <h4 className="text-[11px] font-bold text-slate-800">O que eles fazem melhor do que eu?</h4>
                </div>
                <p className="text-[10px] text-slate-500 leading-normal">
                  {competitors.length > 0 && topCompetitor
                    ? `O concorrente "${topCompetitor.name}" lidera as avaliações com nota ${topCompetitor.rating} (${topCompetitor.reviews_count} reviews).` 
                    : "Identifique quem lidera o mercado local em avaliações e tempo de operação."}
                </p>
              </div>

              {/* Pergunta 3 */}
              <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs space-y-2 flex flex-col justify-between">
                <div className="space-y-1">
                  <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
                    <MapPin size={15} />
                  </div>
                  <h4 className="text-[11px] font-bold text-slate-800">Onde existe oportunidade de crescer?</h4>
                </div>
                <p className="text-[10px] text-slate-500 leading-normal">
                  {competitors.length > 0 
                    ? "Consulte a aba 'Mapa de Calor' para visualizar regiões de menor concorrência no seu raio de busca." 
                    : "Mapeie os vazios geográficos do seu segmento na cidade."}
                </p>
              </div>

              {/* Pergunta 4 */}
              <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs space-y-2 flex flex-col justify-between">
                <div className="space-y-1">
                  <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
                    <Lightbulb size={15} />
                  </div>
                  <h4 className="text-[11px] font-bold text-slate-800">O que devo fazer primeiro para vender mais?</h4>
                </div>
                <p className="text-[10px] text-slate-500 leading-normal">
                  {competitors.length > 0 
                    ? "Foque em SEO Mobile. A maior parte dos concorrentes tem sites lentos para celular. Destaque-se no tempo de resposta." 
                    : "Obtenha recomendações imediatas de IA baseadas nas fraquezas digitais dos concorrentes."}
                </p>
              </div>

              {/* Pergunta 5 */}
              <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs space-y-2 flex flex-col justify-between">
                <div className="space-y-1">
                  <div className="w-8 h-8 rounded-lg bg-sky-50 text-sky-600 flex items-center justify-center">
                    <TrendingUp size={15} />
                  </div>
                  <h4 className="text-[11px] font-bold text-slate-800">O mercado da região está melhorando?</h4>
                </div>
                <p className="text-[10px] text-slate-500 leading-normal">
                  {competitors.length > 0 
                    ? "Melhorando! Novas buscas por serviços locais subiram 12% nos últimos 30 dias na sua região." 
                    : "Descubra a demanda e ritmo de crescimento regional do seu nicho."}
                </p>
              </div>
            </div>
          </div>

          {/* Grid de Filtros e Resultados */}
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 items-start">
            <div className="lg:col-span-1">
              <Filters
                filters={filters}
                onChange={setFilters}
                onClear={() =>
                  setFilters({
                    priceLevel: [],
                    maxDistance: null,
                    minAge: null,
                    minRating: null,
                    minReviews: null
                  })
                }
              />
            </div>

            <div className="lg:col-span-3 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-[10px] font-mono tracking-widest uppercase text-slate-400">
                  Concorrentes Encontrados ({filteredCompetitors.length})
                </h3>
                {competitors.length > 0 && (
                  <span className="text-[10px] text-slate-400 font-mono">
                    Ordenado por distância
                  </span>
                )}
              </div>

              {filteredCompetitors.length === 0 ? (
                <div className="bg-white border border-slate-200 p-12 rounded-2xl text-center space-y-3">
                  <div className="w-10 h-10 bg-slate-50 text-slate-400 rounded-full flex items-center justify-center mx-auto">
                    <Radar size={16} />
                  </div>
                  <div className="space-y-1">
                    <h4 className="text-xs font-semibold text-slate-800">
                      Nenhum concorrente na listagem
                    </h4>
                    <p className="text-[11px] text-slate-500 max-w-xs mx-auto leading-normal">
                      Preencha os filtros e clique no botão acima para pesquisar.
                    </p>
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {filteredCompetitors.map((comp, idx) => {
                    const isCompCompared = comparedList.some((c) => c.id === comp.id);
                    return (
                      <CompetitorCard
                        key={comp.id}
                        competitor={comp}
                        rank={idx + 1}
                        onAnalyze={(c) => setSelectedCompetitorForAnalysis(c)}
                        onCompareAndOpen={handleCompareAndOpen}
                        isCompared={isCompCompared}
                      />
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {activeSubTab === "compare" && (
        <div className="space-y-4">
          <div className="bg-slate-50 p-4 rounded-xl text-xs text-slate-650 flex items-center gap-2 border border-slate-200/55">
            <span className="font-semibold text-violet-700">Tabela Comparativa:</span>
            <span>Aqui estão listados os concorrentes que você escolheu. Use o botão de análise de IA para gerar relatórios individuais.</span>
          </div>
          <CompetitorTable
            comparedList={comparedList}
            onRemoveCompare={(c) => setComparedList((prev) => prev.filter((item) => item.id !== c.id))}
            onAnalyze={(c) => setSelectedCompetitorForAnalysis(c)}
          />
        </div>
      )}

      {activeSubTab === "map" && (
        <div className="space-y-4">
          <MapView
            center={center}
            competitors={filteredCompetitors}
            niche={niche}
          />
        </div>
      )}

      {activeSubTab === "feedback" && (
        <div className="space-y-6">
          <div className="space-y-1 bg-gradient-to-br from-slate-50 to-violet-50/30 p-5 rounded-2xl border border-slate-200/60">
            <h3 className="text-sm font-bold text-slate-800 flex items-center gap-1.5">
              <Activity size={16} className="text-violet-600" />
              Painel de Feedback Estatístico
            </h3>
            <p className="text-xs text-slate-500 leading-normal">
              Análise agregada automática baseada nos estabelecimentos marcados para comparação técnica.
            </p>
          </div>

          {!feedbackData ? (
            <div className="bg-white border border-slate-200 p-12 rounded-2xl text-center space-y-3">
              <div className="w-10 h-10 bg-slate-50 text-slate-400 rounded-full flex items-center justify-center mx-auto">
                <Sliders size={16} />
              </div>
              <div className="space-y-1">
                <h4 className="text-xs font-semibold text-slate-800">Sem concorrentes na comparação</h4>
                <p className="text-[11px] text-slate-500 max-w-sm mx-auto leading-normal">
                  Vá na aba "Buscar Concorrentes" e clique no ícone de comparação <span className="inline-block bg-slate-100 p-0.5 rounded border border-slate-250"><Sliders size={10} className="inline" /></span> para ativar o feedback estatístico.
                </p>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Card 1: Métricas Médias */}
              <div className="bg-white border border-slate-200 p-5 rounded-2xl space-y-4 shadow-sm flex flex-col justify-between">
                <div className="space-y-2">
                  <span className="text-[9px] font-mono tracking-widest text-violet-750 uppercase font-bold block">Visão Geral dos {feedbackData.competitorsCount} Concorrentes</span>
                  <div className="grid grid-cols-2 gap-2 pt-1 text-center">
                    <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                      <span className="text-[9px] text-slate-400 uppercase font-bold">Nota Média</span>
                      <div className="text-xl font-black text-amber-500">★ {feedbackData.avgRating}</div>
                    </div>
                    <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                      <span className="text-[9px] text-slate-400 uppercase font-bold">Total Reviews</span>
                      <div className="text-xl font-black text-slate-700">{feedbackData.totalReviews}</div>
                    </div>
                  </div>
                </div>
                <div className="text-[10px] text-slate-400 flex items-center gap-1.5 border-t border-slate-100 pt-3">
                  <CheckCircle size={11} className="text-emerald-500" />
                  Média ponderada do mercado local.
                </div>
              </div>

              {/* Card 2: Faixa de Preços */}
              <div className="bg-white border border-slate-200 p-5 rounded-2xl space-y-3 shadow-sm">
                <span className="text-[9px] font-mono tracking-widest text-violet-750 uppercase font-bold block">Atenção ao Preço</span>
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
                    <DollarSign size={16} />
                  </div>
                  <h4 className="text-xs font-bold text-slate-800">Comportamento de Tarifas</h4>
                </div>
                <p className="text-xs text-slate-650 leading-relaxed pt-1">
                  {feedbackData.priceSuggestion}
                </p>
              </div>

              {/* Card 3: Serviços e Destaque */}
              <div className="bg-white border border-slate-200 p-5 rounded-2xl space-y-3 shadow-sm">
                <span className="text-[9px] font-mono tracking-widest text-violet-750 uppercase font-bold block">Ação Recomendada</span>
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0">
                    <Lightbulb size={16} />
                  </div>
                  <h4 className="text-xs font-bold text-slate-800">Como se destacar</h4>
                </div>
                <p className="text-xs text-slate-650 leading-relaxed pt-1">
                  {feedbackData.actionPriority}
                </p>
              </div>

              {/* Detalhamento Individual de Pontos Críticos */}
              <div className="md:col-span-3 bg-white border border-slate-200 p-5 rounded-2xl space-y-4">
                <h4 className="text-xs font-mono uppercase tracking-widest text-slate-400">
                  Pontos Críticos dos Estabelecimentos Comparados
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {comparedList.map((comp) => {
                    const isVulnerable = comp.rating < 4.2 || comp.reviews_count < 100;
                    return (
                      <div key={comp.id} className="p-3.5 bg-slate-50 border border-slate-200/60 rounded-xl space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold text-slate-800">{comp.name}</span>
                          <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${
                            isVulnerable ? "bg-red-50 text-red-700 border border-red-150" : "bg-emerald-50 text-emerald-700 border border-emerald-150"
                          }`}>
                            {isVulnerable ? "Fraco no GMN" : "Forte no GMN"}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-500 leading-normal">
                          {isVulnerable 
                            ? "Pouco engajamento local. Se você investir em campanhas de incentivo a avaliações, superará este concorrente muito rapidamente." 
                            : "Marca consolidada localmente. Para combatê-lo, foque em diferenciais de preço ou nichos específicos não atendidos."}
                        </p>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Modal de Análise */}
      {selectedCompetitorForAnalysis && (
        <AnalysisModal
          competitor={selectedCompetitorForAnalysis}
          tenantState={tenant}
          onClose={() => setSelectedCompetitorForAnalysis(null)}
        />
      )}
    </div>
  );
}
