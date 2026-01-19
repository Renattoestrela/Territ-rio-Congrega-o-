
import React, { useState } from 'react';
import { Territory, TerritoryView } from '../types';
import TerritoryMap from './TerritoryMap';

interface TerritoryFormProps {
  territoryViews: TerritoryView[];
  onAdd: (territory: Omit<Territory, 'id' | 'createdAt'>) => void;
  onDelete: (id: string) => void;
}

const TerritoryForm: React.FC<TerritoryFormProps> = ({ territoryViews, onAdd, onDelete }) => {
  const [number, setNumber] = useState('');
  const [mapLink, setMapLink] = useState('');
  const [kmlContent, setKmlContent] = useState<string>('');
  const [fileName, setFileName] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleKmlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.name.toLowerCase().endsWith('.kml')) {
        alert('Por favor, selecione um arquivo válido .KML');
        return;
      }
      setFileName(file.name);
      const reader = new FileReader();
      reader.onload = (event) => {
        const content = event.target?.result as string;
        if (!content || content.length < 10) {
          alert('O arquivo KML parece estar vazio ou corrompido.');
          return;
        }
        setKmlContent(content);
      };
      reader.onerror = () => alert('Erro ao ler o arquivo.');
      reader.readAsText(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!number.trim()) {
      alert('Por favor, insira o número do mapa.');
      return;
    }
    if (!kmlContent) {
      alert('Por favor, anexe o arquivo KML.');
      return;
    }

    try {
      setIsSubmitting(true);
      // O mapLink é opcional ou se não for fornecido, usamos um placeholder ou deixamos vazio
      onAdd({ 
        number: number.trim(), 
        mapLink: mapLink.trim() || `https://www.google.com/maps/search/${encodeURIComponent('Território ' + number)}`, 
        kmlContent 
      });
      
      // Resetar form
      setNumber('');
      setMapLink('');
      setKmlContent('');
      setFileName('');
      
      // Feedback visual
      alert('Território cadastrado com sucesso!');
    } catch (err) {
      console.error("Erro ao submeter território:", err);
      alert('Erro ao salvar o território. Verifique os dados e tente novamente.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-10">
      <header>
        <h2 className="text-2xl font-bold text-slate-800">Cadastro de Territórios</h2>
        <p className="text-slate-500">Importe arquivos KML para definir as áreas de trabalho.</p>
      </header>

      <div className="grid lg:grid-cols-2 gap-8">
        <section className="bg-white p-8 rounded-2xl border border-slate-200 shadow-lg">
          <h3 className="text-lg font-bold text-slate-800 mb-6">Novo Território</h3>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">Número do Mapa *</label>
              <input
                type="text"
                value={number}
                onChange={(e) => setNumber(e.target.value)}
                placeholder="Ex: 01, 12A, etc."
                className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">Link do Google Maps (Opcional)</label>
              <input
                type="url"
                value={mapLink}
                onChange={(e) => setMapLink(e.target.value)}
                placeholder="https://www.google.com/maps/..."
                className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">Arquivo de Área (KML) *</label>
              <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-slate-300 border-dashed rounded-xl hover:border-indigo-400 transition-colors cursor-pointer relative bg-slate-50">
                <div className="space-y-1 text-center">
                  <span className="text-3xl mb-2 block">🌍</span>
                  <div className="flex text-sm text-slate-600">
                    <label className="relative cursor-pointer bg-white px-3 py-1 rounded-md font-medium text-indigo-600 hover:text-indigo-500 border border-indigo-100">
                      <span>{fileName || 'Selecionar arquivo .KML'}</span>
                      <input type="file" className="sr-only" accept=".kml" onChange={handleKmlChange} />
                    </label>
                  </div>
                  <p className="text-xs text-slate-500">Google Earth KML (Satélite Ativo)</p>
                </div>
              </div>
            </div>

            {kmlContent && (
              <div className="border border-slate-200 rounded-xl overflow-hidden shadow-inner">
                <p className="text-[10px] font-bold text-slate-500 p-2 bg-slate-100 uppercase flex justify-between">
                  <span>Pré-visualização (Satélite)</span>
                  <span className="text-indigo-600">Arquivo Carregado ✓</span>
                </p>
                <TerritoryMap kmlContent={kmlContent} className="h-44" />
              </div>
            )}

            <button
              type="submit"
              disabled={isSubmitting}
              className={`w-full ${isSubmitting ? 'bg-slate-400' : 'bg-indigo-600 hover:bg-indigo-700'} text-white font-bold py-4 rounded-xl shadow-lg transition-all flex justify-center items-center gap-2`}
            >
              <span>{isSubmitting ? 'Salvando...' : '💾 Salvar Território'}</span>
            </button>
          </form>
        </section>

        <section>
          <h3 className="text-xl font-bold text-slate-800 mb-6">Lista de Registros</h3>
          <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-slate-50 border-b border-slate-200">
                  <tr>
                    <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Nº Mapa</th>
                    <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-right">Ações</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {territoryViews.map(t => (
                    <tr key={t.id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-6 py-4 font-bold text-slate-700">Território {t.number}</td>
                      <td className="px-6 py-4 text-right">
                        <button 
                          onClick={() => onDelete(t.id)}
                          className="text-red-500 hover:text-red-700 text-xs font-bold px-3 py-1 rounded border border-red-200 hover:border-red-500 transition-all"
                        >
                          Excluir
                        </button>
                      </td>
                    </tr>
                  ))}
                  {territoryViews.length === 0 && (
                    <tr>
                      <td colSpan={2} className="px-6 py-8 text-center text-slate-400 italic">Nenhum território cadastrado.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};

export default TerritoryForm;
