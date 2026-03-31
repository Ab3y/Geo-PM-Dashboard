// Persona types
export type PersonaRole =
  | 'project-manager'
  | 'scrum-master'
  | 'team-member'
  | 'product-owner'
  | 'qa-lead'
  | 'business-analyst'
  | 'stakeholder'
  | 'devops-lead';

export interface PersonaConfig {
  id: PersonaRole;
  label: string;
  icon: string; // lucide icon name
  description: string;
  defaultView: string; // default route
  visibleViews: string[]; // which nav items they see
}

// Task/Story types
export type Priority = 'critical' | 'high' | 'medium' | 'low';
export type StoryStatus = 'backlog' | 'todo' | 'in-progress' | 'review' | 'testing' | 'done';
export type StoryType = 'story' | 'bug' | 'task' | 'epic' | 'spike';

export interface Story {
  id: string;
  title: string;
  description: string;
  type: StoryType;
  status: StoryStatus;
  priority: Priority;
  storyPoints: number | null;
  assignee: string | null;
  tags: string[];
  sprintId: string | null;
  epicId: string | null;
  createdAt: string;
  updatedAt: string;
  acceptanceCriteria: string[];
  // PMP fields
  processGroup: PmpProcessGroup | null;
  knowledgeArea: PmpKnowledgeArea | null;
}

// Sprint types
export type SprintStatus = 'planning' | 'active' | 'review' | 'completed' | 'cancelled';

export interface Sprint {
  id: string;
  name: string;
  goal: string;
  startDate: string;
  endDate: string;
  status: SprintStatus;
  velocity: number | null;
  storyIds: string[];
  createdAt: string;
}

// Kanban types
export interface KanbanColumn {
  id: StoryStatus;
  title: string;
  wipLimit: number | null;
  color: string;
}

// Scrum Poker types
export type PokerCardValue = '0' | '1' | '2' | '3' | '5' | '8' | '13' | '21' | '34' | '55' | '89' | '?' | '☕';

export interface PokerSession {
  id: string;
  storyId: string;
  votes: Record<string, PokerCardValue>; // participantName -> value
  revealed: boolean;
  finalEstimate: number | null;
  participants: string[];
}

// PMP types based on PMBOK Guide
export type PmpProcessGroup =
  | 'initiating'
  | 'planning'
  | 'executing'
  | 'monitoring-controlling'
  | 'closing';

export type PmpKnowledgeArea =
  | 'integration'
  | 'scope'
  | 'schedule'
  | 'cost'
  | 'quality'
  | 'resource'
  | 'communications'
  | 'risk'
  | 'procurement'
  | 'stakeholder';

export interface PmpProcessGroupInfo {
  id: PmpProcessGroup;
  label: string;
  description: string;
  color: string;
  icon: string;
}

export interface PmpKnowledgeAreaInfo {
  id: PmpKnowledgeArea;
  label: string;
  description: string;
  icon: string;
}

// Per-persona saved state
export interface PersonaState {
  currentView: string;
  kanbanFilters: {
    assignee: string | null;
    priority: Priority | null;
    type: StoryType | null;
    search: string;
  };
  selectedSprintId: string | null;
  sidebarOpen: boolean;
}
