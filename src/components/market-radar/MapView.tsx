import React, { useEffect, useRef, useState } from "react";
import { ShieldAlert, MapPin, Eye, Compass, Info } from "lucide-react";
import { Competitor } from "./CompetitorCard";

interface MapViewProps {
  center: { lat: number; lon: number };
  competitors: Competitor[];
  niche: string;
}

export default function MapView({ center, competitors, niche }: MapViewProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const [mapLoaded, setMapLoaded] = useState(false);
  const [leafletReady, setLeafletReady] = useState(false);
  const [viewMode, setViewMode] = useState<"standard" | "heatmap" | "opportunity">("standard");

  // Função utilitária para cálculo de distância Haversine
  const calculateHaversineDistance = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
    const R = 6371; // Raio da Terra em km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return Number((R * c).toFixed(2));
  };
  const mapInstanceRef = useRef<any>(null);
  const markersGroupRef = useRef<any>(null);
  const heatGroupRef = useRef<any>(null);
  const opportunityGroupRef = useRef<any>(null);

  // 1. Carregar Leaflet via CDN dinamicamente
  useEffect(() => {
    if ((window as any).L) {
      setLeafletReady(true);
      return;
    }

    // Inserir CSS
    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css";
    link.integrity = "sha255-p4NxAoJBhIIN+hmNHrzRCf9tD/miZyoHS5obTRR9BMY=";
    link.crossOrigin = "";
    document.head.appendChild(link);

    // Inserir JS
    const script = document.createElement("script");
    script.src = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.js";
    script.integrity = "sha255-20nQCchB9co0qIjJZRGuk2/Z9VM+kNiyxNV1lvTlZBo=";
    script.crossOrigin = "";
    script.onload = () => {
      setLeafletReady(true);
    };
    document.head.appendChild(script);

    return () => {
      // Opcionalmente podemos limpar, mas é melhor manter em cache se o usuário navegar entre abas
    };
  }, []);

  // 2. Inicializar o Mapa
  useEffect(() => {
    if (!leafletReady || !mapContainerRef.current) return;
    const L = (window as any).L;

    // Destruir mapa antigo se já existir
    if (mapInstanceRef.current) {
      mapInstanceRef.current.remove();
      mapInstanceRef.current = null;
    }

    // Criar instância do mapa
    const map = L.map(mapContainerRef.current).setView([center.lat, center.lon], 13);
    mapInstanceRef.current = map;

    // Adicionar camada OpenStreetMap (Estilo limpo e moderno)
    L.tileLayer("https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png", {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
      subdomains: 'abcd',
      maxZoom: 20
    }).addTo(map);

    // Criar grupos de camadas
    markersGroupRef.current = L.layerGroup().addTo(map);
    heatGroupRef.current = L.layerGroup();
    opportunityGroupRef.current = L.layerGroup();

    setMapLoaded(true);

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
      setMapLoaded(false);
    };
  }, [leafletReady, center]);

  // 3. Atualizar camadas conforme os concorrentes e o modo de visualização
  useEffect(() => {
    if (!mapLoaded || !mapInstanceRef.current) return;
    const L = (window as any).L;
    const map = mapInstanceRef.current;

    // Limpar todas as camadas
    markersGroupRef.current.clearLayers();
    heatGroupRef.current.clearLayers();
    opportunityGroupRef.current.clearLayers();

    // Centralizar mapa nas novas coordenadas
    map.setView([center.lat, center.lon], 13);

    // 3.1. Adicionar marcador do próprio estabelecimento (o centro da busca)
    const centerIcon = L.divIcon({
      className: "custom-div-icon",
      html: `<div class="w-7 h-7 bg-indigo-600 border-2 border-white rounded-full flex items-center justify-center text-white shadow-lg animate-pulse"><svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-building-2"><path d="M6 22V4a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v18Z"/><path d="M6 12H4a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2h2Z"/><path d="M18 9h2a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2h-2Z"/><path d="M10 6h4"/><path d="M10 10h4"/><path d="M10 14h4"/><path d="M10 18h4"/></svg></div>`,
      iconSize: [28, 28],
      iconAnchor: [14, 14]
    });
    
    L.marker([center.lat, center.lon], { icon: centerIcon })
      .bindPopup(`<div class="text-xs font-semibold text-slate-800">Sua Localização de Busca</div>`)
      .addTo(markersGroupRef.current);

    // 3.2. Adicionar concorrentes
    competitors.forEach((comp) => {
      // Marcadores Padrão
      const compIcon = L.divIcon({
        className: "custom-div-icon",
        html: `<div class="w-6 h-6 bg-slate-800 border border-white rounded-full flex items-center justify-center text-white shadow-md hover:scale-110 transition-transform"><svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-users"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg></div>`,
        iconSize: [24, 24],
        iconAnchor: [12, 12]
      });

      const popupHtml = `
        <div class="text-xs p-1 space-y-1 text-slate-750">
          <div class="font-semibold text-slate-800">${comp.name}</div>
          <div>Nicho: ${comp.category}</div>
          <div class="flex items-center gap-1 font-semibold text-amber-600">★ ${comp.rating.toFixed(1)} <span class="text-slate-400 font-normal">(${comp.reviews_count} reviews)</span></div>
          <div>Preço: <span class="text-emerald-600 font-semibold font-mono">${comp.price_level}</span></div>
          <div>Distância: ${comp.distance_km} km</div>
        </div>
      `;

      L.marker([comp.latitude, comp.longitude], { icon: compIcon })
        .bindPopup(popupHtml)
        .addTo(markersGroupRef.current);

      // Camada de Calor (Heatmap)
      // Desenhamos círculos concêntricos vermelhos/laranjas/amarelos com opacidade baixa
      // que se sobrepõem para simular um mapa de calor de alta concorrência
      L.circle([comp.latitude, comp.longitude], {
        radius: 400, // 400m
        fillColor: "#ef4444",
        fillOpacity: 0.12,
        stroke: false
      }).addTo(heatGroupRef.current);

      L.circle([comp.latitude, comp.longitude], {
        radius: 800, // 800m
        fillColor: "#f97316",
        fillOpacity: 0.05,
        stroke: false
      }).addTo(heatGroupRef.current);
    });

    // 3.3. Oportunidades de Mercado (Mapa de Oportunidades)
    // O sistema analisa onde NÃO há concorrentes (baixa densidade)
    // Para simplificar e criar uma visualização interativa, desenhamos anéis verdes onde a distância
    // de qualquer concorrente é alta, mostrando "Alta Oportunidade"
    // Vamos colocar áreas de oportunidade em pontos distantes dos concorrentes (vazios geográficos)
    if (competitors.length > 0) {
      // Simulação de 2 zonas de alta oportunidade próximas ao centro mas distantes dos pins
      // O algoritmo busca setores vazios nos quadrantes (ex: nordeste, sudoeste)
      const opZones = [
        { lat: center.lat + 0.015, lon: center.lon - 0.015, desc: "Setor Norte-Oeste" },
        { lat: center.lat - 0.018, lon: center.lon + 0.018, desc: "Setor Sul-Leste" }
      ];

      opZones.forEach((zone) => {
        // Verifica se realmente está livre (nenhum concorrente a menos de 1.8km)
        const isFree = competitors.every(
          (c) => calculateHaversineDistance(zone.lat, zone.lon, c.latitude, c.longitude) > 1.8
        );

        if (isFree) {
          L.circle([zone.lat, zone.lon], {
            radius: 900,
            color: "#10b981",
            weight: 1,
            fillColor: "#10b981",
            fillOpacity: 0.12
          }).addTo(opportunityGroupRef.current);

          const opIcon = L.divIcon({
            className: "custom-div-icon",
            html: `<div class="w-5 h-5 bg-emerald-500 border border-white rounded-full flex items-center justify-center text-white shadow-md animate-bounce"><svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-compass"><circle cx="12" cy="12" r="10"/><polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76"/></svg></div>`,
            iconSize: [20, 20],
            iconAnchor: [10, 10]
          });

          L.marker([zone.lat, zone.lon], { icon: opIcon })
            .bindPopup(`<div class="text-xs p-1.5 space-y-1"><div class="font-semibold text-emerald-800">Alta Oportunidade</div><div class="text-slate-500">Nenhum concorrente do nicho "${niche}" num raio de 1.8 km.<br/><strong>Excelente setor comercial!</strong></div></div>`)
            .addTo(opportunityGroupRef.current);
        }
      });
    }

    // 3.4. Alternar camadas no mapa ativo
    if (viewMode === "standard") {
      map.removeLayer(heatGroupRef.current);
      map.removeLayer(opportunityGroupRef.current);
      if (!map.hasLayer(markersGroupRef.current)) map.addLayer(markersGroupRef.current);
    } else if (viewMode === "heatmap") {
      map.removeLayer(markersGroupRef.current);
      map.removeLayer(opportunityGroupRef.current);
      if (!map.hasLayer(heatGroupRef.current)) map.addLayer(heatGroupRef.current);
      
      // Adiciona o marcador central
      L.marker([center.lat, center.lon], { icon: centerIcon }).addTo(heatGroupRef.current);
    } else if (viewMode === "opportunity") {
      map.removeLayer(heatGroupRef.current);
      if (!map.hasLayer(markersGroupRef.current)) map.addLayer(markersGroupRef.current);
      if (!map.hasLayer(opportunityGroupRef.current)) map.addLayer(opportunityGroupRef.current);
    }
  }, [mapLoaded, competitors, viewMode, center]);

  return (
    <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden flex flex-col h-[520px]">
      {/* Menu do Mapa */}
      <div className="p-4 border-b border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-3 shrink-0">
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-slate-800 uppercase tracking-wider">
            Visualização Espacial
          </span>
          <span className="text-[10px] bg-indigo-50 text-indigo-700 px-1.5 py-0.5 rounded font-mono">
            {competitors.length} localizações
          </span>
        </div>

        <div className="flex gap-2">
          <button
            onClick={() => setViewMode("standard")}
            className={`py-1.5 px-3 text-[10px] font-medium border rounded-lg cursor-pointer transition-all ${
              viewMode === "standard"
                ? "bg-indigo-50 text-indigo-700 border-indigo-200 font-semibold"
                : "bg-slate-50 text-slate-650 border-slate-200 hover:bg-slate-100"
            }`}
          >
            Marcadores Padrão
          </button>
          <button
            onClick={() => setViewMode("heatmap")}
            className={`py-1.5 px-3 text-[10px] font-medium border rounded-lg cursor-pointer transition-all ${
              viewMode === "heatmap"
                ? "bg-indigo-50 text-indigo-700 border-indigo-200 font-semibold"
                : "bg-slate-50 text-slate-650 border-slate-200 hover:bg-slate-100"
            }`}
          >
            Heatmap (Concentração)
          </button>
          <button
            onClick={() => setViewMode("opportunity")}
            className={`py-1.5 px-3 text-[10px] font-medium border rounded-lg cursor-pointer transition-all ${
              viewMode === "opportunity"
                ? "bg-indigo-50 text-indigo-700 border-indigo-200 font-semibold"
                : "bg-slate-50 text-slate-650 border-slate-200 hover:bg-slate-100"
            }`}
          >
            Oportunidades Comerciais
          </button>
        </div>
      </div>

      {/* Info Banner do Heatmap */}
      {viewMode === "heatmap" && (
        <div className="bg-amber-50 border-b border-amber-200 p-2.5 text-[10px] text-amber-800 flex items-center gap-2 shrink-0">
          <Info size={12} className="shrink-0 text-amber-600" />
          <span>
            Zonas avermelhadas indicam maior densidade de concorrência. Zonas claras representam menor concorrência física do nicho {niche}.
          </span>
        </div>
      )}

      {/* Info Banner da Oportunidade */}
      {viewMode === "opportunity" && (
        <div className="bg-emerald-50 border-b border-emerald-250 p-2.5 text-[10px] text-emerald-800 flex items-center gap-2 shrink-0">
          <Info size={12} className="shrink-0 text-emerald-600" />
          <span>
            Círculos verdes demarcam <strong>vazios de concorrência</strong> (raios sem concorrentes num raio de 1.8km). Altas oportunidades locais!
          </span>
        </div>
      )}

      {/* Mapa container */}
      <div className="flex-1 relative bg-slate-50">
        {!leafletReady && (
          <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center space-y-3 z-10 bg-white">
            <div className="w-8 h-8 rounded-full border-2 border-indigo-200 border-t-indigo-600 animate-spin"></div>
            <p className="text-slate-500 text-xs">Carregando mapas interativos do OpenStreetMap...</p>
          </div>
        )}
        <div ref={mapContainerRef} className="w-full h-full z-0"></div>
      </div>
    </div>
  );
}
