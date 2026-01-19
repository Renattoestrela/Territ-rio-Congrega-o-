
export interface Territory {
  id: string;
  number: string;
  kmlContent: string; // Conteúdo XML do arquivo KML
  mapLink: string;
  createdAt: string;
}

export interface Assignment {
  id: string;
  territoryId: string;
  responsible: string;
  startDate: string;
  endDate?: string;
}

export enum TerritoryStatus {
  NEVER_ASSIGNED = 'Nunca designado',
  IN_PROGRESS = 'Em andamento',
  COMPLETED = 'Concluído'
}

export interface TerritoryView extends Territory {
  status: TerritoryStatus;
  currentAssignment?: Assignment;
  lastCompletedDate?: string;
  totalAssignments: number;
  daysInWork?: number;
}
