
import React, { useState } from 'react';
import { Territory } from '../types';
import TerritoryMap from './TerritoryMap';

interface AssignmentFormProps {
  territories: Territory[];
  onAssign: (territoryId: string, responsible: string, startDate: string) => void;
}

const AssignmentForm: React.FC<AssignmentFormProps> = ({ territories, onAssign }) => {
  const [territoryId, setTerritoryId] = useState('');
  const [responsible, setResponsible] = useState('');
  const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0]);
  const [lastAssigned, setLastAssigned] = useState<{ number: string, link: string, responsible: string, date: string, kmlContent: string } | null>(null);

  const selectedTerritory = territories.find(t => t.id === territoryId);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!territoryId || !responsible || !startDate) {
      alert('Preencha todos os campos.');
      return;
    }

    if (selectedTerritory) {
      onAssign(territoryId, responsible, startDate);
      setLastAssigned({
        number: selectedTerritory.number,
        link: selectedTerritory.mapLink,
        responsible: responsible,
        date: startDate,
        kmlContent: selectedTerritory.kmlContent
      });
    }

    setTerritoryId('');
    setResponsible('');
  };

  const handleWhatsAppShare = () => {
    if (!lastAssigned) return;
    
    const message = `*Designação de Território*\n\n` +
      `*Mapa:* Nº ${lastAssigned.number}\n` +
      `*Responsável:* ${lastAssigned.responsible}\n` +
      `*Data de Início:* ${new Date(lastAssigned.date).toLocaleDateString('pt-BR')}\n` +
      `*Link do Mapa:* ${lastAssigned.link}\n\n` +
      `_A área demarcada está disponível no sistema._`;
    
    const encodedMessage = encodeURIComponent(message);
    window.open(`https://wa.me/?text=${encodedMessage}`, '_blank');
  };

  return (
    <div className="space-y-10">
      <header>
        <h2 className="text-2xl font-bold text-slate-800">Designar Território</h2>
        <p className="text-slate-500">Atribua um mapa para um responsável iniciar o trabalho.</p>
      </header>

      <div className="max-w-4xl mx-auto md:mx-0">
        {lastAssigned ? (
          <div className="bg-white border border-slate-200 rounded-3xl shadow-xl overflow-hidden mb-6">
            <div className="bg-emerald-600 p-6 text-white text-center">
              <h3 className="text-2xl font-bold">Designado com Sucesso!</h3>
              <p className="text-emerald-50 mt-1">O mapa {lastAssigned.number} está agora sob cuidados de {lastAssigned.responsible}.</p>
            </div>
            
            <div className="p-8 grid md:grid-cols-2 gap-8 items-center">
              <div>
                <p className="text-xs font-bold text-slate-400 uppercase mb-4 tracking-widest">Área de Trabalho Atribuída:</p>
                <div className="rounded-2xl overflow-hidden border border-slate-100 shadow-lg h-64">
                  <TerritoryMap kmlContent={lastAssigned.kmlContent} className="h-full" />
                </div>
              </div>

              <div className="space-y-4">
                <button
                  onClick={handleWhatsAppShare}
                  className="w-full bg-green-500 hover:bg-green-600 text-white font-bold py-5 rounded-2xl flex justify-center items-center gap-3 transition-all shadow-xl shadow-green-100 text-lg"
                >
                  <span className="text-2xl">💬</span> Enviar no WhatsApp
                </button>
                <button
                  onClick={() => setLastAssigned(null)}
                  className="w-full bg-slate-50 text-slate-600 font-bold py-4 rounded-2xl hover:bg-slate-100 transition-all border border-slate-100"
                >
                  Nova Designação
                </button>
              </div>
            </div>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 gap-8 items-start">
            <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-xl">
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2 uppercase tracking-wide">Selecionar Território</label>
                  <select
                    value={territoryId}
                    onChange={(e) => setTerritoryId(e.target.value)}
                    className="w-full px-4 py-4 rounded-2xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all bg-slate-50 font-medium"
                    required
                  >
                    <option value="">Selecione um mapa...</option>
                    {territories.map(t => (
                      <option key={t.id} value={t.id}>Nº {t.number}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2 uppercase tracking-wide">Responsável</label>
                  <input
                    type="text"
                    value={responsible}
                    onChange={(e) => setResponsible(e.target.value)}
                    placeholder="Nome completo"
                    className="w-full px-4 py-4 rounded-2xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all bg-slate-50"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2 uppercase tracking-wide">Data de Início</label>
                  <input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="w-full px-4 py-4 rounded-2xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all bg-slate-50"
                    required
                  />
                </div>

                <button
                  type="submit"
                  className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-5 rounded-2xl shadow-xl shadow-indigo-100 transition-all flex justify-center items-center gap-2 text-lg"
                >
                  <span>✅</span> Designar Agora
                </button>
              </form>
            </div>

            {selectedTerritory ? (
              <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-xl space-y-4">
                <h3 className="font-bold text-slate-800 flex items-center gap-2">
                  <span>🗺️</span> Visualização do Mapa {selectedTerritory.number}
                </h3>
                <div className="h-80 rounded-2xl overflow-hidden border border-slate-100">
                  <TerritoryMap kmlContent={selectedTerritory.kmlContent} className="h-full" />
                </div>
                <p className="text-xs text-slate-400 italic text-center">Área obtida do arquivo KML carregado no cadastro.</p>
              </div>
            ) : (
              <div className="bg-slate-100 h-full min-h-[400px] rounded-3xl border-2 border-dashed border-slate-200 flex flex-col items-center justify-center p-8 text-center">
                <span className="text-5xl mb-4 grayscale opacity-50">🌍</span>
                <p className="text-slate-500 font-medium">Selecione um território para visualizar a área demarcada antes de designar.</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default AssignmentForm;
