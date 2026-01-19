
import React from 'react';

interface LayoutProps {
  children: React.ReactNode;
  activeTab: 'dashboard' | 'active' | 'territories' | 'assign' | 'history';
  setActiveTab: (tab: 'dashboard' | 'active' | 'territories' | 'assign' | 'history') => void;
  onLogout: () => void;
}

const Layout: React.FC<LayoutProps> = ({ children, activeTab, setActiveTab, onLogout }) => {
  const tabs = [
    { id: 'dashboard', label: 'Início', icon: '📊' },
    { id: 'active', label: 'Em Trabalho', icon: '📋' },
    { id: 'assign', label: 'Designar', icon: '👤' },
    { id: 'territories', label: 'Mapas', icon: '🗺️' },
    { id: 'history', label: 'Relatórios', icon: '🕒' },
  ];

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-slate-50">
      {/* Sidebar / Topbar */}
      <nav className="bg-white border-b md:border-b-0 md:border-r border-slate-200 w-full md:w-64 flex-shrink-0 flex flex-col sticky top-0 z-50 md:h-screen">
        <div className="p-6">
          <h1 className="text-xl font-bold text-indigo-600 flex items-center gap-2">
            <span className="text-2xl">🌍</span> Territórios
          </h1>
          <p className="text-[10px] text-slate-400 mt-1 uppercase tracking-[0.2em] font-bold">Congregação</p>
        </div>
        
        <ul className="flex md:flex-col gap-1 p-2 md:p-4 overflow-x-auto md:overflow-visible flex-grow scrollbar-hide">
          {tabs.map((tab) => (
            <li key={tab.id} className="flex-1 md:flex-none">
              <button
                onClick={() => setActiveTab(tab.id as any)}
                className={`w-full flex items-center justify-center md:justify-start gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all ${
                  activeTab === tab.id
                    ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-200'
                    : 'text-slate-500 hover:bg-slate-100'
                }`}
              >
                <span className="text-lg">{tab.icon}</span>
                <span className="hidden md:inline">{tab.label}</span>
              </button>
            </li>
          ))}
        </ul>

        {/* Logout Button */}
        <div className="p-4 border-t border-slate-100 hidden md:block">
          <button
            onClick={onLogout}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold text-red-500 hover:bg-red-50 transition-colors"
          >
            <span>🚪</span>
            <span>Sair</span>
          </button>
        </div>
      </nav>

      {/* Main Content */}
      <main className="flex-1 p-4 md:p-8 overflow-y-auto">
        <div className="max-w-6xl mx-auto">
          {children}
        </div>
      </main>
    </div>
  );
};

export default Layout;
