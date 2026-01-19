
import React, { useState } from 'react';
import { Assignment, Territory } from '../types';

interface HistoryViewProps {
  assignments: Assignment[];
  territories: Territory[];
  onDeleteAssignment?: (id: string) => void;
}

const HistoryView: React.FC<HistoryViewProps> = ({ assignments, territories, onDeleteAssignment }) => {
  const [startDateFilter, setStartDateFilter] = useState('');
  const [endDateFilter, setEndDateFilter] = useState('');

  const territoryHistory = territories.map(territory => {
    const allTerritoryAssignments = assignments
      .filter(a => a.territoryId === territory.id)
      .sort((a, b) => new Date(b.startDate).getTime() - new Date(a.startDate).getTime());

    const lastConclusion = allTerritoryAssignments.find(a => !!a.endDate)?.endDate;

    const filteredAssignments = allTerritoryAssignments.filter(a => {
      const start = new Date(a.startDate);
      const filterStart = startDateFilter ? new Date(startDateFilter) : null;
      const filterEnd = endDateFilter ? new Date(endDateFilter) : null;
      
      if (filterStart && start < filterStart) return false;
      if (filterEnd && start > filterEnd) return false;
      return true;
    });

    return {
      ...territory,
      lastConclusion,
      history: filteredAssignments
    };
  }).filter(t => t.history.length > 0 || (!startDateFilter && !endDateFilter && t.history.length === 0));

  const exportToCSV = () => {
    // Usamos ';' como separador pois é o padrão do Excel em Português (Brasil)
    const SEPARATOR = ';';
    const headers = ['Território', 'Última Conclusão Geral', 'Responsável', 'Data Início', 'Data Conclusão', 'Status'];
    const rows: string[][] = [];

    territoryHistory.forEach(t => {
      t.history.forEach(h => {
        rows.push([
          `Nº ${t.number}`,
          t.lastConclusion ? new Date(t.lastConclusion).toLocaleDateString('pt-BR') : 'Nunca',
          h.responsible,
          new Date(h.startDate).toLocaleDateString('pt-BR'),
          h.endDate ? new Date(h.endDate).toLocaleDateString('pt-BR') : 'Em andamento',
          h.endDate ? 'Concluído' : 'Em andamento'
        ]);
      });
    });

    // 1. Adicionamos 'sep=;' para que o Excel saiba qual o delimitador
    // 2. Adicionamos o BOM (\uFEFF) para forçar o UTF-8
    const csvContent = [
      `sep=${SEPARATOR}`, 
      headers.join(SEPARATOR),
      ...rows.map(r => r.map(cell => `"${cell}"`).join(SEPARATOR))
    ].join('\n');

    const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `relatorio_territorios_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-8">
      <header className="flex flex-col md:flex-row md:justify-between md:items-end gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Relatório de Histórico</h2>
          <p className="text-slate-500">Acompanhamento detalhado do histórico por território.</p>
        </div>
        <button
          onClick={exportToCSV}
          className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-6 py-3 rounded-xl flex items-center gap-2 transition-all shadow-lg"
        >
          <span>📥</span> Exportar Relatório Excel
        </button>
      </header>

      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-wrap gap-6 items-end">
        <div className="flex-1 min-w-[200px]">
          <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Filtrar por Início (De)</label>
          <input
            type="date"
            value={startDateFilter}
            onChange={(e) => setStartDateFilter(e.target.value)}
            className="w-full px-4 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>
        <div className="flex-1 min-w-[200px]">
          <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Até</label>
          <input
            type="date"
            value={endDateFilter}
            onChange={(e) => setEndDateFilter(e.target.value)}
            className="w-full px-4 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>
        <button
          onClick={() => { setStartDateFilter(''); setEndDateFilter(''); }}
          className="text-indigo-600 hover:underline text-sm font-medium mb-3 px-2"
        >
          Limpar Filtros
        </button>
      </div>

      <div className="space-y-6">
        {territoryHistory.map(t => (
          <div key={t.id} className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
            <div className="bg-slate-50 px-6 py-4 border-b border-slate-200 flex flex-col md:flex-row md:justify-between md:items-center gap-2">
              <div className="flex items-center gap-3">
                <span className="bg-indigo-600 text-white text-sm font-bold px-3 py-1 rounded-lg">Nº {t.number}</span>
                <h3 className="font-bold text-slate-800">Histórico do Território</h3>
              </div>
              <div className="text-sm">
                <span className="text-slate-500">Última conclusão:</span>{' '}
                <span className="font-bold text-slate-700">
                  {t.lastConclusion ? new Date(t.lastConclusion).toLocaleDateString('pt-BR') : 'Ainda não concluído'}
                </span>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-white border-b border-slate-100">
                  <tr>
                    <th className="px-6 py-3 text-[10px] font-bold text-slate-400 uppercase tracking-wider">Responsável</th>
                    <th className="px-6 py-3 text-[10px] font-bold text-slate-400 uppercase tracking-wider">Data Início</th>
                    <th className="px-6 py-3 text-[10px] font-bold text-slate-400 uppercase tracking-wider">Data Conclusão</th>
                    <th className="px-6 py-3 text-[10px] font-bold text-slate-400 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-3 text-[10px] font-bold text-slate-400 uppercase tracking-wider text-right">Ações</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {t.history.map(h => (
                    <tr key={h.id} className="hover:bg-slate-50/50 transition-colors group">
                      <td className="px-6 py-4 text-sm font-semibold text-slate-700">{h.responsible}</td>
                      <td className="px-6 py-4 text-sm text-slate-600">{new Date(h.startDate).toLocaleDateString('pt-BR')}</td>
                      <td className="px-6 py-4 text-sm text-slate-600">
                        {h.endDate ? new Date(h.endDate).toLocaleDateString('pt-BR') : '-'}
                      </td>
                      <td className="px-6 py-4">
                        {h.endDate ? (
                          <span className="text-emerald-600 text-[10px] font-bold bg-emerald-50 px-2 py-1 rounded uppercase">Concluído</span>
                        ) : (
                          <span className="text-blue-600 text-[10px] font-bold bg-blue-50 px-2 py-1 rounded uppercase">Em andamento</span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-right">
                        {onDeleteAssignment && (
                          <button 
                            onClick={() => onDeleteAssignment(h.id)}
                            className="text-red-400 hover:text-red-600 transition-colors p-1 opacity-0 group-hover:opacity-100"
                            title="Excluir Registro"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ))}
        {territoryHistory.length === 0 && (
          <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center text-slate-400 italic">
            Nenhum registro encontrado para o filtro selecionado.
          </div>
        )}
      </div>
    </div>
  );
};

export default HistoryView;
