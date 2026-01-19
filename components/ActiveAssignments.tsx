
import React, { useState } from 'react';
import { TerritoryView, TerritoryStatus } from '../types';
import TerritoryMap from './TerritoryMap';

interface ActiveAssignmentsProps {
  territoryViews: TerritoryView[];
  onFinishAssignment: (assignmentId: string, date: string) => void;
}

const ActiveAssignments: React.FC<ActiveAssignmentsProps> = ({ territoryViews, onFinishAssignment }) => {
  const [completingId, setCompletingId] = useState<string | null>(null);
  const [completionDate, setCompletionDate] = useState(new Date().toISOString().split('T')[0]);

  const activeTerritories = territoryViews.filter(t => t.status === TerritoryStatus.IN_PROGRESS);

  const handleFinish = (assignmentId: string) => {
    onFinishAssignment(assignmentId, completionDate);
    setCompletingId(null);
  };

  const handleWhatsAppShare = (t: TerritoryView) => {
    if (!t.currentAssignment) return;
    
    const message = `*Designação Ativa - Território Nº ${t.number}*\n\n` +
      `👤 *Responsável:* ${t.currentAssignment.responsible}\n` +
      `📅 *Início:* ${new Date(t.currentAssignment.startDate).toLocaleDateString('pt-BR')}\n` +
      `⏱️ *Tempo decorrido:* ${t.daysInWork} dias\n` +
      `📍 *Link:* ${t.mapLink}\n\n` +
      `_Acompanhe o mapa KML no portal oficial._`;
    
    window.open(`https://wa.me/?text=${encodeURIComponent(message)}`, '_blank');
  };

  return (
    <div className="space-y-8 animate-fadeIn">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
            <span className="p-2 bg-indigo-100 rounded-lg">📋</span> Designações em Andamento
          </h2>
          <p className="text-slate-500 mt-1">Acompanhe quem está trabalhando em cada área no momento.</p>
        </div>
        <div className="bg-white px-4 py-2 rounded-xl border border-slate-200 shadow-sm">
          <span className="text-sm font-bold text-slate-400 uppercase tracking-wider">Total Ativo: </span>
          <span className="text-xl font-bold text-indigo-600">{activeTerritories.length}</span>
        </div>
      </header>

      {activeTerritories.length === 0 ? (
        <div className="bg-white rounded-[2rem] border-2 border-dashed border-slate-200 p-16 text-center">
          <div className="text-6xl mb-4">🍃</div>
          <h3 className="text-xl font-bold text-slate-800">Tudo em dia!</h3>
          <p className="text-slate-500 max-w-sm mx-auto mt-2">Não há territórios sendo trabalhados no momento. Que tal designar um novo mapa?</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {activeTerritories.map(t => (
            <div key={t.id} className="bg-white rounded-[2rem] border border-slate-200 shadow-xl overflow-hidden flex flex-col md:flex-row group transition-all hover:shadow-2xl hover:border-indigo-200">
              {/* Seção do Mapa */}
              <div className="w-full md:w-56 h-56 md:h-auto relative flex-shrink-0">
                <TerritoryMap kmlContent={t.kmlContent} className="w-full h-full" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent pointer-events-none"></div>
                <div className="absolute bottom-4 left-4 text-white">
                  <span className="block text-[10px] font-bold uppercase tracking-widest opacity-80">Mapa</span>
                  <span className="text-2xl font-black">Nº {t.number}</span>
                </div>
              </div>

              {/* Seção de Dados */}
              <div className="flex-1 p-6 flex flex-col justify-between">
                <div>
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h4 className="text-xs font-black text-indigo-600 uppercase tracking-widest mb-1">Responsável</h4>
                      <p className="text-lg font-bold text-slate-800 leading-tight">{t.currentAssignment?.responsible}</p>
                    </div>
                    <div className="text-right">
                      <span className="text-[10px] font-black text-slate-400 uppercase block tracking-widest">Início</span>
                      <p className="text-sm font-bold text-slate-700">
                        {new Date(t.currentAssignment!.startDate).toLocaleDateString('pt-BR')}
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4 mb-6">
                    <div className="bg-slate-50 p-3 rounded-2xl border border-slate-100">
                      <span className="block text-[9px] font-bold text-slate-400 uppercase tracking-tighter">Tempo em Campo</span>
                      <p className="text-lg font-black text-indigo-600">{t.daysInWork} <span className="text-xs font-bold text-slate-400">dias</span></p>
                    </div>
                    <a 
                      href={t.mapLink} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="bg-indigo-50 p-3 rounded-2xl border border-indigo-100 flex flex-col justify-center items-center hover:bg-indigo-100 transition-colors"
                    >
                      <span className="text-lg">📍</span>
                      <span className="text-[9px] font-bold text-indigo-600 uppercase">Google Maps</span>
                    </a>
                  </div>
                </div>

                <div className="space-y-3">
                  {completingId === t.currentAssignment?.id ? (
                    <div className="p-4 bg-emerald-50 rounded-2xl border border-emerald-100 animate-fadeIn">
                      <label className="block text-[10px] font-bold text-emerald-700 uppercase mb-2 tracking-widest">Data de Conclusão</label>
                      <div className="flex gap-2">
                        <input 
                          type="date"
                          value={completionDate}
                          onChange={(e) => setCompletionDate(e.target.value)}
                          className="flex-1 bg-white border border-emerald-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                        />
                        <button 
                          onClick={() => handleFinish(t.currentAssignment!.id)}
                          className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-4 py-2 rounded-xl text-xs transition-all shadow-lg shadow-emerald-200"
                        >
                          OK
                        </button>
                        <button 
                          onClick={() => setCompletingId(null)}
                          className="bg-slate-200 hover:bg-slate-300 text-slate-600 font-bold px-4 py-2 rounded-xl text-xs transition-all"
                        >
                          X
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex gap-2">
                      <button 
                        onClick={() => setCompletingId(t.currentAssignment!.id)}
                        className="flex-1 bg-slate-900 hover:bg-indigo-600 text-white font-bold py-3 rounded-xl text-xs transition-all flex items-center justify-center gap-2 group/btn"
                      >
                        <span>✓</span> MARCAR COMO CONCLUÍDO
                      </button>
                      <button 
                        onClick={() => handleWhatsAppShare(t)}
                        className="bg-green-500 hover:bg-green-600 text-white p-3 rounded-xl transition-all shadow-lg shadow-green-100"
                        title="Compartilhar no WhatsApp"
                      >
                        <span className="text-xl leading-none">💬</span>
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <style>{`
        @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
        .animate-fadeIn { animation: fadeIn 0.4s ease-out forwards; }
      `}</style>
    </div>
  );
};

export default ActiveAssignments;
