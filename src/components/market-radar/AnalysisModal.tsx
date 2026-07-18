import React, { useEffect, useState } from "react";
import { X, Sparkles, Printer, CheckCircle, AlertTriangle, ArrowRight, Activity, HelpCircle, Shield } from "lucide-react";
import { Competitor } from "./CompetitorCard";

interface AnalysisModalProps {
  competitor: Competitor;
  tenantState: any;
  onClose: () => void;
}

interface AnalysisResult {
  summary: string;
  strengths: string[];
  weaknesses: string[];
  suggestions: string[];
  seo_analysis: string;
  identity_analysis: string;
  presence_analysis: string;
  score: number;
}

export default function AnalysisModal({ competitor, tenantState, onClose }: AnalysisModalProps) {
  const [loading, setLoading] = useState(true);
  const [loadingStep, setLoadingStep] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<{
    seo_metrics: { seo: number; performance: number; experience: number };
    analysis: AnalysisResult;
  } | null>(null);

  const loadingSteps = [
    "Geocodificando localização do concorrente...",
    "Medindo SEO técnico e velocidade mobile...",
    "Consultando avaliações no Google Meu Negócio...",
    "O Gemini está gerando inteligência estratégica...",
    "Finalizando insights práticos para o seu negócio..."
  ];

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (loading) {
      interval = setInterval(() => {
        setLoadingStep((prev) => {
          if (prev < loadingSteps.length - 1) {
            return prev + 1;
          }
          return prev;
        });
      }, 1500);
    }
    return () => clearInterval(interval);
  }, [loading]);

  useEffect(() => {
    const fetchAnalysis = async () => {
      try {
        setLoading(true);
        setError(null);
        const res = await fetch("/api/market-radar/analyze", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            competitor,
            tenantState
          })
        });

        if (!res.ok) throw new Error("Falha ao processar análise");
        const data = await res.json();
        setResult(data);
      } catch (err: any) {
        console.error("Erro na análise:", err);
        setError(err.message || "Erro desconhecido ao carregar análise.");
      } finally {
        setLoading(false);
      }
    };

    fetchAnalysis();
  }, [competitor.id]);

  const handlePrint = () => {
    window.print();
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-emerald-600 bg-emerald-50 border-emerald-200";
    if (score >= 60) return "text-amber-600 bg-amber-50 border-amber-200";
    return "text-rose-600 bg-rose-50 border-rose-200";
  };

  const getScoreLabel = (score: number) => {
    if (score >= 80) return "Forte Presença Digital";
    if (score >= 60) return "Presença Intermediária";
    return "Vulnerável / Oportunidade para você";
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 print:p-0 print:bg-white print:relative">
      <div className="bg-white rounded-3xl max-w-4xl w-full max-h-[90vh] overflow-hidden shadow-2xl flex flex-col border border-slate-100 print:shadow-none print:border-none print:max-h-none print:w-full">
        {/* Header */}
        <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-gradient-to-r from-slate-950 to-indigo-950 text-white rounded-t-3xl print:from-white print:to-white print:text-slate-800 print:border-slate-200">
          <div>
            <div className="flex items-center gap-2">
              <Sparkles size={16} className="text-violet-400 print:text-violet-600 animate-pulse" />
              <span className="text-[10px] font-mono tracking-widest text-violet-300 uppercase print:text-violet-600">
                Auditoria de IA & Presença Local
              </span>
            </div>
            <h3 className="text-lg font-bold">
              Radar de Concorrentes • {competitor.name}
            </h3>
          </div>
          <div className="flex items-center gap-2 print:hidden">
            {result && (
              <button
                onClick={handlePrint}
                className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl transition-colors cursor-pointer"
                title="Imprimir / Salvar PDF"
              >
                <Printer size={15} />
              </button>
            )}
            <button
              onClick={onClose}
              className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl transition-colors cursor-pointer"
            >
              <X size={15} />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6 print:overflow-visible">
          {loading ? (
            <div className="py-16 flex flex-col items-center justify-center space-y-4 text-center">
              <div className="relative">
                <div className="w-12 h-12 border-4 border-violet-200 border-t-violet-600 rounded-full animate-spin"></div>
                <Sparkles size={18} className="absolute top-3.5 left-3.5 text-violet-600 animate-pulse" />
              </div>
              <div className="space-y-1">
                <p className="text-sm font-semibold text-slate-700">Analisando o concorrente...</p>
                <p className="text-xs text-slate-400 font-mono animate-pulse">{loadingSteps[loadingStep]}</p>
              </div>
            </div>
          ) : error ? (
            <div className="p-6 bg-rose-50 border border-rose-100 rounded-2xl flex items-center gap-3 text-rose-700">
              <AlertTriangle size={20} className="shrink-0" />
              <div className="text-xs">
                <p className="font-semibold">Erro ao carregar análise de IA</p>
                <p className="opacity-90">{error}</p>
              </div>
            </div>
          ) : result ? (
            <div className="space-y-6">
              {/* Top Banner de Resumo Simplificado */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="md:col-span-2 p-5 bg-gradient-to-br from-violet-50 to-indigo-50 border border-violet-100 rounded-2xl space-y-2">
                  <span className="text-[9px] font-mono tracking-widest text-violet-700 uppercase font-bold block">
                    Resumo Executivo
                  </span>
                  <p className="text-xs text-slate-700 leading-relaxed font-medium">
                    {result.analysis.summary}
                  </p>
                </div>

                {/* Score Geral */}
                <div className={`p-5 rounded-2xl border flex flex-col items-center justify-center text-center space-y-1 ${getScoreColor(result.analysis.score)}`}>
                  <span className="text-[9px] font-mono uppercase tracking-widest font-bold">Nota de Maturidade</span>
                  <div className="text-3xl font-extrabold">{result.analysis.score}</div>
                  <span className="text-[10px] font-semibold">{getScoreLabel(result.analysis.score)}</span>
                </div>
              </div>

              {/* Indicadores Técnicos de Experiência (PageSpeed & Google) */}
              <div className="grid grid-cols-3 gap-3">
                <div className="p-4 bg-slate-50 border border-slate-200/60 rounded-xl space-y-1 text-center">
                  <span className="text-[9px] text-slate-400 block font-mono uppercase">SEO Local</span>
                  <div className="text-lg font-bold text-slate-800">{result.seo_metrics.seo}%</div>
                  <div className="w-full bg-slate-200 h-1 rounded-full overflow-hidden">
                    <div className="bg-emerald-500 h-full" style={{ width: `${result.seo_metrics.seo}%` }}></div>
                  </div>
                </div>
                <div className="p-4 bg-slate-50 border border-slate-200/60 rounded-xl space-y-1 text-center">
                  <span className="text-[9px] text-slate-400 block font-mono uppercase">Velocidade Site</span>
                  <div className="text-lg font-bold text-slate-800">{result.seo_metrics.performance}%</div>
                  <div className="w-full bg-slate-200 h-1 rounded-full overflow-hidden">
                    <div className="bg-amber-500 h-full" style={{ width: `${result.seo_metrics.performance}%` }}></div>
                  </div>
                </div>
                <div className="p-4 bg-slate-50 border border-slate-200/60 rounded-xl space-y-1 text-center">
                  <span className="text-[9px] text-slate-400 block font-mono uppercase">Acesso Mobile</span>
                  <div className="text-lg font-bold text-slate-800">{result.seo_metrics.experience}%</div>
                  <div className="w-full bg-slate-200 h-1 rounded-full overflow-hidden">
                    <div className="bg-violet-500 h-full" style={{ width: `${result.seo_metrics.experience}%` }}></div>
                  </div>
                </div>
              </div>

              {/* 5 Perguntas de Negócio Inteligentes */}
              <div className="border-t border-slate-100 pt-6 space-y-5">
                <h4 className="text-xs font-mono uppercase tracking-widest text-slate-400 flex items-center gap-1.5">
                  <Activity size={12} className="text-violet-500" />
                  Perguntas Chave de Negócio
                </h4>

                <div className="grid grid-cols-1 gap-4">
                  {/* Pergunta 1 */}
                  <div className="p-4 bg-white border border-slate-150 rounded-xl space-y-2">
                    <div className="flex items-center gap-2">
                      <HelpCircle size={14} className="text-violet-500 shrink-0" />
                      <h5 className="text-xs font-bold text-slate-800">O que esse concorrente faz melhor?</h5>
                    </div>
                    <ul className="pl-6 list-disc text-xs text-slate-650 space-y-1">
                      {result.analysis.strengths.map((str, idx) => (
                        <li key={idx}>{str}</li>
                      ))}
                    </ul>
                  </div>

                  {/* Pergunta 2 */}
                  <div className="p-4 bg-white border border-slate-150 rounded-xl space-y-2">
                    <div className="flex items-center gap-2">
                      <HelpCircle size={14} className="text-rose-500 shrink-0" />
                      <h5 className="text-xs font-bold text-slate-800">Quais são os principais pontos fracos dele?</h5>
                    </div>
                    <ul className="pl-6 list-disc text-xs text-slate-650 space-y-1">
                      {result.analysis.weaknesses.map((weak, idx) => (
                        <li key={idx}>{weak}</li>
                      ))}
                    </ul>
                  </div>

                  {/* Pergunta 3 */}
                  <div className="p-4 bg-white border border-slate-150 rounded-xl space-y-2">
                    <div className="flex items-center gap-2">
                      <HelpCircle size={14} className="text-emerald-500 shrink-0" />
                      <h5 className="text-xs font-bold text-slate-800">O que eu posso fazer para atrair mais clientes?</h5>
                    </div>
                    <ul className="pl-6 list-disc text-xs text-slate-650 space-y-1">
                      {result.analysis.suggestions.slice(0, 2).map((sug, idx) => (
                        <li key={idx}>{sug}</li>
                      ))}
                    </ul>
                  </div>

                  {/* Pergunta 4 */}
                  <div className="p-4 bg-white border border-slate-150 rounded-xl space-y-2">
                    <div className="flex items-center gap-2">
                      <HelpCircle size={14} className="text-indigo-500 shrink-0" />
                      <h5 className="text-xs font-bold text-slate-800">Como posso me posicionar e me destacar do mercado?</h5>
                    </div>
                    <p className="text-xs text-slate-650 pl-6 leading-relaxed">
                      {result.analysis.identity_analysis}
                    </p>
                  </div>

                  {/* Pergunta 5 */}
                  <div className="p-4 bg-white border border-slate-150 rounded-xl space-y-2">
                    <div className="flex items-center gap-2">
                      <HelpCircle size={14} className="text-amber-500 shrink-0" />
                      <h5 className="text-xs font-bold text-slate-800">Existe oportunidade de mercado na minha região para crescer?</h5>
                    </div>
                    <p className="text-xs text-slate-650 pl-6 leading-relaxed">
                      {result.analysis.presence_analysis}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          ) : null}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-100 bg-slate-50 flex justify-between items-center text-[10px] text-slate-400 print:hidden">
          <span className="flex items-center gap-1">
            <Shield size={10} className="text-emerald-500" />
            Dados estratégicos baseados em Overpass API, Nominatim e IA.
          </span>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-700 font-semibold rounded-lg cursor-pointer transition-colors"
          >
            Fechar Relatório
          </button>
        </div>
      </div>
    </div>
  );
}
