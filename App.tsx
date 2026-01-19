
import React, { useState, useEffect, useMemo } from 'react';
import { Territory, Assignment, TerritoryStatus, TerritoryView } from './types';
import { getTerritories, saveTerritories, getAssignments, saveAssignments } from './services/storage';
import Layout from './components/Layout';
import Dashboard from './components/Dashboard';
import TerritoryForm from './components/TerritoryForm';
import AssignmentForm from './components/AssignmentForm';
import HistoryView from './components/HistoryView';
import Login from './components/Login';
import ActiveAssignments from './components/ActiveAssignments';

const App: React.FC = () => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null); // null significa "verificando"
  const [activeTab, setActiveTab] = useState<'dashboard' | 'active' | 'territories' | 'assign' | 'history'>('dashboard');
  const [territories, setTerritories] = useState<Territory[]>([]);
  const [assignments, setAssignments] = useState<Assignment[]>([]);

  useEffect(() => {
    // Verificar sessão ativa
    const sessionAuth = sessionStorage.getItem('is_authenticated_v2');
    if (sessionAuth === 'true') {
      setIsAuthenticated(true);
    } else {
      setIsAuthenticated(false);
    }
  }, []);

  useEffect(() => {
    if (isAuthenticated === true) {
      setTerritories(getTerritories());
      setAssignments(getAssignments());
    }
  }, [isAuthenticated]);

  const handleLogin = () => {
    setIsAuthenticated(true);
    sessionStorage.setItem('is_authenticated_v2', 'true');
  };

  const handleLogout = () => {
    if (window.confirm('Deseja realmente sair do sistema?')) {
      setIsAuthenticated(false);
      sessionStorage.removeItem('is_authenticated_v2');
    }
  };

  const territoryViews: TerritoryView[] = useMemo(() => {
    return territories.map(t => {
      const tAssignments = assignments
        .filter(a => a.territoryId === t.id)
        .sort((a, b) => new Date(b.startDate).getTime() - new Date(a.startDate).getTime());
      
      const latest = tAssignments[0];
      const completed = tAssignments.filter(a => !!a.endDate);
      const lastCompleted = completed.length > 0 ? completed[0].endDate : undefined;

      let status = TerritoryStatus.NEVER_ASSIGNED;
      let daysInWork = 0;

      if (latest) {
        if (!latest.endDate) {
          status = TerritoryStatus.IN_PROGRESS;
          const start = new Date(latest.startDate);
          const now = new Date();
          daysInWork = Math.floor((now.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
        } else {
          status = TerritoryStatus.COMPLETED;
        }
      }

      return {
        ...t,
        status,
        currentAssignment: latest && !latest.endDate ? latest : undefined,
        lastCompletedDate: lastCompleted,
        totalAssignments: tAssignments.length,
        daysInWork: status === TerritoryStatus.IN_PROGRESS ? daysInWork : undefined
      };
    });
  }, [territories, assignments]);

  const addTerritory = (newTerritory: Omit<Territory, 'id' | 'createdAt'>) => {
    const territory: Territory = {
      ...newTerritory,
      id: crypto.randomUUID(),
      createdAt: new Date().toISOString()
    };
    const updated = [...territories, territory];
    setTerritories(updated);
    saveTerritories(updated);
  };

  const deleteTerritory = (id: string) => {
    if (window.confirm('Excluir território? Isso afetará o histórico.')) {
      const updated = territories.filter(t => t.id !== id);
      setTerritories(updated);
      saveTerritories(updated);
    }
  };

  const deleteAssignment = (id: string) => {
    if (window.confirm('Excluir este registro?')) {
      const updated = assignments.filter(a => a.id !== id);
      setAssignments(updated);
      saveAssignments(updated);
    }
  };

  const assignTerritory = (territoryId: string, responsible: string, startDate: string) => {
    const newAssignment: Assignment = {
      id: crypto.randomUUID(),
      territoryId,
      responsible,
      startDate
    };
    const updated = [...assignments, newAssignment];
    setAssignments(updated);
    saveAssignments(updated);
  };

  const finishAssignment = (assignmentId: string, endDate: string) => {
    const updated = assignments.map(a => 
      a.id === assignmentId ? { ...a, endDate } : a
    );
    setAssignments(updated);
    saveAssignments(updated);
  };

  // Enquanto verifica a sessão
  if (isAuthenticated === null) {
    return <div className="min-h-screen bg-slate-900 flex items-center justify-center">
      <div className="w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
    </div>;
  }

  // Se não estiver logado
  if (!isAuthenticated) {
    return <Login onLoginSuccess={handleLogin} />;
  }

  return (
    <Layout 
      activeTab={activeTab} 
      setActiveTab={setActiveTab} 
      onLogout={handleLogout}
    >
      {activeTab === 'dashboard' && (
        <Dashboard 
          territoryViews={territoryViews} 
          onFinishAssignment={finishAssignment} 
          onDeleteTerritory={deleteTerritory}
        />
      )}
      {activeTab === 'active' && (
        <ActiveAssignments 
          territoryViews={territoryViews} 
          onFinishAssignment={finishAssignment} 
        />
      )}
      {activeTab === 'territories' && (
        <TerritoryForm 
          territoryViews={territoryViews} 
          onAdd={addTerritory} 
          onDelete={deleteTerritory} 
        />
      )}
      {activeTab === 'assign' && (
        <AssignmentForm 
          territories={territories} 
          onAssign={assignTerritory} 
        />
      )}
      {activeTab === 'history' && (
        <HistoryView 
          assignments={assignments} 
          territories={territories} 
          onDeleteAssignment={deleteAssignment}
        />
      )}
    </Layout>
  );
};

export default App;
