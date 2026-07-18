import React from "react";
import {
  Star,
  MapPin,
  Phone,
  Globe,
  Instagram,
  MessageCircle,
  Sparkles,
  BarChart2,
  Clock,
  DollarSign
} from "lucide-react";

export interface Competitor {
  id: string;
  name: string;
  category: string;
  address?: string;
  latitude: number;
  longitude: number;
  distance_km: number;
  price_level: string;
  business_age: number;
  rating: number;
  reviews_count: number;
  phone?: string;
  whatsapp?: string;
  website?: string;
  instagram?: string;
  facebook?: string;
  opening_hours?: string;
}

interface CompetitorCardProps {
  competitor: Competitor;
  onAnalyze: (competitor: Competitor) => void;
  onCompareAndOpen: (competitor: Competitor) => void;
  isCompared: boolean;
  rank?: number;
}

export default function CompetitorCard({
  competitor,
  onAnalyze,
  onCompareAndOpen,
  isCompared,
  rank
}: CompetitorCardProps) {

  const getDistanceText = (km: number) => {
    if (km < 1) return `${Math.round(km * 1000)} m`;
    return `${km.toFixed(1)} km`;
  };

  const getRatingColor = (r: number) => {
    if (r >= 4.5) return "text-emerald-600";
    if (r >= 4.0) return "text-amber-500";
    return "text-orange-500";
  };

  const getPriceBadgeStyle = (level: string) => {
    const len = level.length;
    if (len <= 1) return "bg-emerald-50 text-emerald-700 border-emerald-200";
    if (len === 2) return "bg-amber-50 text-amber-700 border-amber-200";
    return "bg-rose-50 text-rose-700 border-rose-200";
  };

  const getAgeLabel = (years: number) => {
    if (years < 1) return "Novo no mercado";
    if (years === 1) return "1 ano no mercado";
    return `${years} anos no mercado`;
  };

  const starsArray = [1, 2, 3, 4, 5];

  return (
    <div className={`bg-white border rounded-2xl overflow-hidden transition-all hover:shadow-lg group ${
      isCompared ? "border-violet-300 ring-1 ring-violet-200" : "border-slate-200 hover:border-violet-300"
    }`}>
      {/* Rank e Tipo */}
      <div className="flex items-start justify-between p-4 pb-0">
        <div className="flex items-center gap-2">
          {rank && (
            <span className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold ${
              rank === 1 ? "bg-amber-400 text-white" :
              rank === 2 ? "bg-slate-300 text-slate-700" :
              rank === 3 ? "bg-amber-700 text-white" :
              "bg-slate-100 text-slate-500"
            }`}>
              {rank}
            </span>
          )}
          <span className="text-[10px] bg-violet-50 text-violet-700 border border-violet-200 px-2 py-0.5 rounded-full font-medium">
            {competitor.category}
          </span>
        </div>

        <div className="flex items-center gap-1 text-[11px] text-slate-500 font-mono">
          <MapPin size={10} className="text-slate-400" />
          <span>{getDistanceText(competitor.distance_km)}</span>
        </div>
      </div>

      <div className="p-4 space-y-3">
        {/* Nome */}
        <h4 className="text-sm font-semibold text-slate-800 line-clamp-1 group-hover:text-violet-700 transition-colors">
          {competitor.name}
        </h4>

        {/* Rating */}
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-0.5">
            {starsArray.map((s) => (
              <Star
                key={s}
                size={11}
                className={s <= Math.round(competitor.rating) ? "fill-amber-400 text-amber-400" : "text-slate-200 fill-slate-200"}
              />
            ))}
          </div>
          <span className={`text-xs font-bold ${getRatingColor(competitor.rating)}`}>
            {competitor.rating.toFixed(1)}
          </span>
          <span className="text-[11px] text-slate-400">
            ({competitor.reviews_count.toLocaleString("pt-BR")})
          </span>
        </div>

        {/* Info secundária: preço + idade */}
        <div className="flex items-center gap-2 flex-wrap">
          {competitor.price_level && (
            <span className={`inline-flex items-center gap-1 text-[10px] font-medium px-2 py-0.5 rounded-full border ${getPriceBadgeStyle(competitor.price_level)}`}>
              <DollarSign size={9} />
              {competitor.price_level === "$" ? "Preço baixo" :
               competitor.price_level === "$$" ? "Preço médio" :
               competitor.price_level === "$$$" ? "Preço alto" : "Premium"}
            </span>
          )}
          {competitor.business_age > 0 && (
            <span className="inline-flex items-center gap-1 text-[10px] text-slate-500 bg-slate-50 border border-slate-200 px-2 py-0.5 rounded-full">
              <Clock size={9} />
              {getAgeLabel(competitor.business_age)}
            </span>
          )}
        </div>

        {/* Endereço */}
        {competitor.address && (
          <p className="text-[11px] text-slate-450 line-clamp-1 flex items-center gap-1">
            <MapPin size={10} className="shrink-0 text-slate-300" />
            {competitor.address}
          </p>
        )}

        {/* Contatos rápidos */}
        <div className="flex items-center gap-1.5 pt-2 border-t border-slate-100">
          {competitor.phone && (
            <a
              href={`tel:${competitor.phone.replace(/\D/g, "")}`}
              title={competitor.phone}
              className="p-1.5 rounded-lg bg-slate-50 hover:bg-violet-50 hover:text-violet-600 text-slate-400 transition-colors cursor-pointer"
            >
              <Phone size={12} />
            </a>
          )}
          {competitor.whatsapp && (
            <a
              href={`https://wa.me/${competitor.whatsapp.replace(/\D/g, "")}`}
              target="_blank"
              rel="noopener noreferrer"
              title="WhatsApp"
              className="p-1.5 rounded-lg bg-slate-50 hover:bg-emerald-50 hover:text-emerald-600 text-slate-400 transition-colors cursor-pointer"
            >
              <MessageCircle size={12} />
            </a>
          )}
          {competitor.website && (
            <a
              href={competitor.website}
              target="_blank"
              rel="noopener noreferrer"
              title="Site"
              className="p-1.5 rounded-lg bg-slate-50 hover:bg-indigo-50 hover:text-indigo-600 text-slate-400 transition-colors cursor-pointer"
            >
              <Globe size={12} />
            </a>
          )}
          {competitor.instagram && (
            <a
              href={`https://instagram.com/${competitor.instagram.replace("@", "")}`}
              target="_blank"
              rel="noopener noreferrer"
              title="Instagram"
              className="p-1.5 rounded-lg bg-slate-50 hover:bg-pink-50 hover:text-pink-600 text-slate-400 transition-colors cursor-pointer"
            >
              <Instagram size={12} />
            </a>
          )}
        </div>
      </div>

      {/* Ações */}
      <div className="px-4 pb-4 grid grid-cols-4 gap-1.5">
        <button
          onClick={() => onAnalyze(competitor)}
          className="col-span-3 py-2 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 text-white rounded-xl text-[10px] font-semibold cursor-pointer transition-all flex items-center justify-center gap-1.5 shadow-sm"
        >
          <Sparkles size={11} />
          Analisar com IA
        </button>

        <button
          onClick={() => onCompareAndOpen(competitor)}
          title={isCompared ? "Remover da comparação" : "Comparar e abrir painel"}
          className={`py-2 rounded-xl border cursor-pointer transition-all flex items-center justify-center gap-1 ${
            isCompared
              ? "bg-violet-600 text-white border-violet-600"
              : "bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100"
          }`}
        >
          <BarChart2 size={13} />
        </button>
      </div>
    </div>
  );
}
