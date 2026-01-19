
import React, { useState } from 'react';
import { TerritoryView, TerritoryStatus } from '../types';
import TerritoryMap from './TerritoryMap';

interface DashboardProps {
  territoryViews: TerritoryView[];
  onFinishAssignment: (assignmentId: string, date: string) => void;
  onDeleteTerritory?: (id: string) => void;
}

const Dashboard: React.FC<DashboardProps> = ({ territoryViews, onFinishAssignment, onDeleteTerritory }) => {
  const [completingId, setCompletingId] = useState<string | null>(null);
  const [completionDate, setCompletionDate] = useState(new Date().toISOString().split('T')[0]);

  const longestSinceWorked = [...territoryViews]
    .filter(t => t.status !== TerritoryStatus.IN_PROGRESS)
    .sort((a, b) => {
      const dateA = a.lastCompletedDate ? new Date(a.lastCompletedDate).getTime() : 0;
      const dateB = b.lastCompletedDate ? new Date(b.lastCompletedDate).getTime() : 0;
      return dateA - dateB;
    })
    .slice(0, 3);

  const mostWorked = [...territoryViews]
    .sort((a, b) => b.totalAssignments - a.totalAssignments)
    .slice(0, 3);

  const stats = {
    total: territoryViews.length,
    inProgress: territoryViews.filter(t => t.status === TerritoryStatus.IN_PROGRESS).length,
    completed: territoryViews.filter(t => t.status === TerritoryStatus.COMPLETED).length,
    never: territoryViews.filter(t => t.status === TerritoryStatus.NEVER_ASSIGNED).length,
  };

  const handleFinish = (assignmentId: string) => {
    onFinishAssignment(assignmentId, completionDate);
    setCompletingId(null);
    setCompletionDate(new Date().toISOString().split('T')[0]);
  };

  const handleWhatsAppShare = (t: TerritoryView) => {
    if (!t.currentAssignment) return;
    
    const message = `*Designação de Território*\n\n` +
      `*Mapa:* Nº ${t.number}\n` +
      `*Responsável:* ${t.currentAssignment.responsible}\n` +
      `*Data de Início:* ${new Date(t.currentAssignment.startDate).toLocaleDateString('pt-BR')}\n` +
      `*Link do Mapa:* ${t.mapLink}\n\n` +
      `_Acesse o sistema para visualizar a área demarcada._`;
    
    const encodedMessage = encodeURIComponent(message);
    window.open(`https://wa.me/?text=${encodedMessage}`, '_blank');
  };

  return (
    <div className="space-y-8">
      <header>
        <h2 className="text-2xl font-bold text-slate-800">Painel de Controle</h2>
        <p className="text-slate-500">Acompanhamento em tempo real com mapas interativos KML.</p>
      </header>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Total', value: stats.total, color: 'indigo' },
          { label: 'Em Trabalho', value: stats.inProgress, color: 'blue' },
          { label: 'Concluídos', value: stats.completed, color: 'emerald' },
          { label: 'Não Iniciados', value: stats.never, color: 'amber' },
        ].map(s => (
          <div key={s.label} className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
            <p className="text-xs font-semibold text-slate-500 uppercase">{s.label}</p>
            <p className={`text-3xl font-bold text-${s.color}-600 mt-1`}>{s.value}</p>
          </div>
        ))}
      </div>

      <div className="grid md:grid-cols-2 gap-8">
        <div className="space-y-6">
          <section className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
            <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
              <span>⏳</span> Mais tempo sem trabalhar
            </h3>
            <div className="space-y-3">
              {longestSinceWorked.map(t => (
                <div key={t.id} className="flex justify-between items-center p-3 rounded-lg bg-slate-50 border border-slate-100">
                  <span className="font-semibold text-slate-700">Território {t.number}</span>
                  <span className="text-xs text-slate-500 italic">
                    {t.lastCompletedDate ? `Desde ${new Date(t.lastCompletedDate).toLocaleDateString('pt-BR')}` : 'Nunca trabalhado'}
                  </span>
                </div>
              ))}
            </div>
          </section>

          <section className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
            <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
              <span>🔥</span> Territórios mais populares
            </h3>
            <div className="space-y-3">
              {mostWorked.map(t => (
                <div key={t.id} className="flex justify-between items-center p-3 rounded-lg bg-slate-50 border border-slate-100">
                  <span className="font-semibold text-slate-700">Território {t.number}</span>
                  <span className="px-2 py-1 bg-indigo-100 text-indigo-700 text-xs font-bold rounded-full">
                    {t.totalAssignments} vezes
                  </span>
                </div>
              ))}
            </div>
          </section>
        </div>

        <div className="bg-indigo-600 rounded-xl p-6 text-white shadow-lg flex flex-col justify-center">
          <h3 className="text-xl font-bold mb-2">Dica Geográfica</h3>
          <p className="text-indigo-100 leading-relaxed mb-4">
            Agora os territórios utilizam arquivos KML. Isso permite visualizar a área exata demarcada no mapa ao invés de apenas uma imagem estática.
          </p>
          <div className="flex items-center gap-4 text-sm font-medium">
            <div className="flex items-center gap-1">
              <span className="w-3 h-3 bg-blue-400 rounded-full"></span> Em andamento
            </div>
            <div className="flex items-center gap-1">
              <span className="w-3 h-3 bg-emerald-400 rounded-full"></span> Disponível
            </div>
          </div>
        </div>
      </div>

      <div>
        <h3 className="text-xl font-bold text-slate-800 mb-6">Todos os Territórios</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {territoryViews.map(t => (
            <div key={t.id} className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm hover:shadow-md transition-all group relative">
              <div className="relative aspect-video bg-slate-100">
                <TerritoryMap kmlContent={t.kmlContent} className="w-full h-full" />
                <div className={`absolute top-3 left-3 px-3 py-1 rounded-full text-xs font-bold uppercase z-[1001] ${
                  t.status === TerritoryStatus.IN_PROGRESS ? 'bg-blue-500 text-white shadow-md' : 
                  t.status === TerritoryStatus.COMPLETED ? 'bg-emerald-500 text-white shadow-md' : 
                  'bg-slate-500 text-white shadow-md'
                }`}>
                  {t.status}
                </div>
                
                {onDeleteTerritory && (
                  <button 
                    onClick={() => onDeleteTerritory(t.id)}
                    title="Excluir Território"
                    className="absolute top-3 right-3 p-2 bg-white/90 hover:bg-red-500 hover:text-white rounded-full text-slate-400 shadow-sm transition-all opacity-0 group-hover:opacity-100 z-[1001]"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                  </button>
                )}
              </div>
              
              <div className="p-5">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h4 className="text-lg font-bold text-slate-800">Nº {t.number}</h4>
                    <a 
                      href={t.mapLink} 
                      target="_blank" 
                      rel="noopener noreferrer" 
                      className="text-indigo-600 text-xs hover:underline flex items-center gap-1 mt-1 font-medium"
                    >
                      <span>📍</span> Abrir localização no Maps
                    </a>
                  </div>
                  {t.daysInWork !== undefined && (
                    <div className="text-right">
                      <span className="text-xs text-slate-400 block">Em campo há</span>
                      <span className="text-sm font-bold text-blue-600">{t.daysInWork} dias</span>
                    </div>
                  )}
                </div>

                {t.status === TerritoryStatus.IN_PROGRESS && t.currentAssignment && (
                  <div className="bg-blue-50 p-3 rounded-lg mb-4 border border-blue-100">
                    <div className="flex justify-between items-center mb-1">
                      <p className="text-xs text-blue-600 font-bold uppercase">Designado para:</p>
                      <button 
                        onClick={() => handleWhatsAppShare(t)}
                        title="Compartilhar no WhatsApp"
                        className="text-green-600 hover:text-green-700 transition-colors"
                      >
                        <span className="text-lg">💬</span>
                      </button>
                    </div>
                    <p className="text-sm font-bold text-blue-800">{t.currentAssignment.responsible}</p>
                    <p className="text-xs text-blue-500 mt-1">Início: {new Date(t.currentAssignment.startDate).toLocaleDateString('pt-BR')}</p>
                    
                    {completingId === t.currentAssignment.id ? (
                      <div className="mt-4 pt-3 border-t border-blue-200">
                        <label className="block text-[10px] font-bold text-blue-600 uppercase mb-1">Data de Conclusão</label>
                        <input 
                          type="date"
                          value={completionDate}
                          onChange={(e) => setCompletionDate(e.target.value)}
                          className="w-full px-2 py-1 text-sm rounded border border-blue-200 mb-2 focus:outline-none focus:ring-1 focus:ring-blue-500"
                        />
                        <div className="flex gap-2">
                          <button 
                            onClick={() => handleFinish(t.currentAssignment!.id)}
                            className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold py-2 rounded transition-colors"
                          >
                            CONFIRMAR
                          </button>
                          <button 
                            onClick={() => setCompletingId(null)}
                            className="px-3 bg-slate-200 hover:bg-slate-300 text-slate-600 text-xs font-bold py-2 rounded transition-colors"
                          >
                            X
                          </button>
                        </div>
                      </div>
                    ) : (
                      <button 
                        onClick={() => setCompletingId(t.currentAssignment!.id)}
                        className="w-full mt-3 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold py-2 rounded transition-colors shadow-sm"
                      >
                        MARCAR COMO CONCLUÍDO
                      </button>
                    )}
                  </div>
                )}

                {t.status !== TerritoryStatus.IN_PROGRESS && (
                  <div className="flex items-center justify-between mt-4 pt-4 border-t border-slate-100">
                    <div className="text-xs text-slate-500">
                      Total: <span className="font-bold">{t.totalAssignments} vezes</span>
                    </div>
                    {t.lastCompletedDate && (
                      <div className="text-xs text-slate-500 text-right">
                        Última: <span className="font-bold">{new Date(t.lastCompletedDate).toLocaleDateString('pt-BR')}</span>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
