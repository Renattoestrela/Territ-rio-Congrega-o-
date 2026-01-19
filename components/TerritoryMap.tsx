
import React, { useEffect, useRef, useState } from 'react';

interface TerritoryMapProps {
  kmlContent: string;
  className?: string;
}

declare const L: any;
declare const toGeoJSON: any;

const TerritoryMap: React.FC<TerritoryMapProps> = ({ kmlContent, className = "h-48" }) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const expandedMapRef = useRef<HTMLDivElement>(null);
  const leafletMap = useRef<any>(null);
  const leafletExpandedMap = useRef<any>(null);
  const [isExpanded, setIsExpanded] = useState(false);

  // Inicialização e atualização do mapa normal
  useEffect(() => {
    if (!mapRef.current || !kmlContent) return;

    if (!leafletMap.current) {
      leafletMap.current = L.map(mapRef.current, {
        zoomControl: false,
        attributionControl: false,
        dragging: !L.Browser.mobile,
        scrollWheelZoom: false,
      }).setView([0, 0], 2);

      L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
        maxZoom: 19,
      }).addTo(leafletMap.current);
      
      L.tileLayer('https://{s}.basemaps.cartocdn.com/light_only_labels/{z}/{x}/{y}{r}.png', {
        pane: 'shadowPane',
        opacity: 0.8
      }).addTo(leafletMap.current);
    }

    renderKmlOnMap(leafletMap.current, kmlContent);

    const resizeObserver = new ResizeObserver(() => {
      if (leafletMap.current) leafletMap.current.invalidateSize();
    });
    resizeObserver.observe(mapRef.current);

    return () => resizeObserver.disconnect();
  }, [kmlContent]);

  // Inicialização e atualização do mapa expandido
  useEffect(() => {
    if (!isExpanded || !expandedMapRef.current || !kmlContent) return;

    if (!leafletExpandedMap.current) {
      leafletExpandedMap.current = L.map(expandedMapRef.current, {
        zoomControl: true,
        attributionControl: true,
      }).setView([0, 0], 2);

      L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
        maxZoom: 19,
        attribution: 'Tiles &copy; Esri'
      }).addTo(leafletExpandedMap.current);

      L.tileLayer('https://{s}.basemaps.cartocdn.com/light_only_labels/{z}/{x}/{y}{r}.png', {
        pane: 'shadowPane',
        opacity: 0.9
      }).addTo(leafletExpandedMap.current);
    }

    renderKmlOnMap(leafletExpandedMap.current, kmlContent);

    // Pequeno delay para garantir que o container do modal esteja pronto
    setTimeout(() => {
      if (leafletExpandedMap.current) {
        leafletExpandedMap.current.invalidateSize();
        // Recalcular limites após o redimensionamento
        const parser = new DOMParser();
        const kml = parser.parseFromString(kmlContent, "text/xml");
        const geojson = toGeoJSON.kml(kml);
        const geoJsonLayer = L.geoJSON(geojson);
        const bounds = geoJsonLayer.getBounds();
        if (bounds.isValid()) {
          leafletExpandedMap.current.fitBounds(bounds, { padding: [40, 40] });
        }
      }
    }, 100);

  }, [isExpanded, kmlContent]);

  const renderKmlOnMap = (mapInstance: any, content: string) => {
    mapInstance.eachLayer((layer: any) => {
      if (layer instanceof L.GeoJSON) {
        mapInstance.removeLayer(layer);
      }
    });

    try {
      const parser = new DOMParser();
      const kml = parser.parseFromString(content, "text/xml");
      const geojson = toGeoJSON.kml(kml);

      const geoJsonLayer = L.geoJSON(geojson, {
        style: {
          color: "#facc15",
          weight: 4,
          fillColor: "#facc15",
          fillOpacity: 0.2
        }
      }).addTo(mapInstance);

      const bounds = geoJsonLayer.getBounds();
      if (bounds.isValid()) {
        mapInstance.fitBounds(bounds, { padding: [20, 20] });
      }
    } catch (e) {
      console.error("Erro ao renderizar KML:", e);
    }
  };

  return (
    <>
      <div className={`relative overflow-hidden group/map ${className}`}>
        <div ref={mapRef} className="w-full h-full" />
        
        {/* Botão de Expansão */}
        <button 
          onClick={(e) => { e.preventDefault(); e.stopPropagation(); setIsExpanded(true); }}
          className="absolute top-2 right-2 z-[1000] bg-white/90 hover:bg-white text-slate-800 p-2 rounded-lg shadow-lg transition-all opacity-0 group-hover/map:opacity-100 flex items-center justify-center"
          title="Ver em Tela Cheia"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
          </svg>
        </button>

        <div className="absolute bottom-2 right-2 z-[1000] bg-black/50 px-2 py-1 rounded text-[8px] font-bold text-white uppercase pointer-events-none">
          Satélite Interativo
        </div>
      </div>

      {/* Modal de Tela Cheia */}
      {isExpanded && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-slate-900/90 backdrop-blur-sm p-4 md:p-10 animate-fadeIn">
          <div className="relative w-full h-full max-w-6xl bg-white rounded-2xl shadow-2xl overflow-hidden flex flex-col">
            <div className="flex justify-between items-center p-4 border-b border-slate-100 bg-white z-[10001]">
              <h3 className="font-bold text-slate-800 flex items-center gap-2">
                <span className="text-xl">🗺️</span> Visualização Detalhada do Território
              </h3>
              <button 
                onClick={() => setIsExpanded(false)}
                className="bg-slate-100 hover:bg-red-500 hover:text-white text-slate-500 p-2 rounded-xl transition-all font-bold flex items-center gap-2"
              >
                <span className="text-xs uppercase tracking-wider">Fechar</span>
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <div className="flex-1 relative">
              <div ref={expandedMapRef} className="w-full h-full" />
              
              <div className="absolute bottom-4 left-4 z-[10001] bg-white/90 p-3 rounded-xl shadow-lg border border-slate-200 pointer-events-none max-w-xs">
                <p className="text-[10px] font-bold text-slate-400 uppercase mb-1">Dica de Navegação</p>
                <p className="text-xs text-slate-600">Use a roda do mouse ou pinça para zoom. Arraste para mover o mapa.</p>
              </div>
            </div>
          </div>
        </div>
      )}

      <style>{`
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        .animate-fadeIn { animation: fadeIn 0.3s ease-out forwards; }
      `}</style>
    </>
  );
};

export default TerritoryMap;
