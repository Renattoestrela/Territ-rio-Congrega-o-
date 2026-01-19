
import { Territory, Assignment } from '../types';

const TERRITORIES_KEY = 'territory_manager_data';
const ASSIGNMENTS_KEY = 'territory_manager_assignments';
const AUTH_KEY = 'territory_manager_auth_v2';

export const saveTerritories = (territories: Territory[]) => {
  try {
    localStorage.setItem(TERRITORIES_KEY, JSON.stringify(territories));
  } catch (e) {
    if (e instanceof DOMException && (e.name === 'QuotaExceededError' || e.name === 'NS_ERROR_DOM_QUOTA_REACHED')) {
      alert('Erro: Limite de armazenamento atingido! Tente usar arquivos KML mais simples.');
    } else {
      console.error('Erro ao salvar territórios:', e);
    }
  }
};

export const getTerritories = (): Territory[] => {
  const data = localStorage.getItem(TERRITORIES_KEY);
  return data ? JSON.parse(data) : [];
};

export const saveAssignments = (assignments: Assignment[]) => {
  try {
    localStorage.setItem(ASSIGNMENTS_KEY, JSON.stringify(assignments));
  } catch (e) {
    console.error('Erro ao salvar designações:', e);
  }
};

export const getAssignments = (): Assignment[] => {
  const data = localStorage.getItem(ASSIGNMENTS_KEY);
  return data ? JSON.parse(data) : [];
};

// Autenticação Avançada
interface AuthData {
  username: string;
  passwordHash: string; // Em uma aplicação real, seria um hash real
}

export const setupAdmin = (username: string, password: string) => {
  const auth: AuthData = { username, passwordHash: password };
  localStorage.setItem(AUTH_KEY, JSON.stringify(auth));
};

export const hasAdminConfigured = (): boolean => {
  return localStorage.getItem(AUTH_KEY) !== null;
};

export const validateCredentials = (username: string, password: string): boolean => {
  const data = localStorage.getItem(AUTH_KEY);
  if (!data) return false;
  const auth: AuthData = JSON.parse(data);
  return auth.username.toLowerCase() === username.toLowerCase() && auth.passwordHash === password;
};
