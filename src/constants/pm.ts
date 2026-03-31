import type { PersonaConfig, KanbanColumn, PmpProcessGroupInfo, PmpKnowledgeAreaInfo, PokerCardValue } from '../types/pm';

export const PERSONAS: PersonaConfig[] = [
  {
    id: 'project-manager',
    label: 'Project Manager',
    icon: 'Briefcase',
    description: 'Full project visibility with PMP process groups, risk management, and reporting',
    defaultView: '/pmp',
    visibleViews: ['/dashboard', '/kanban', '/backlog', '/sprint-planning', '/pmp'],
  },
  {
    id: 'scrum-master',
    label: 'Scrum Master',
    icon: 'Shield',
    description: 'Sprint ceremonies, team velocity, impediment tracking, and facilitation tools',
    defaultView: '/sprint-planning',
    visibleViews: ['/dashboard', '/kanban', '/backlog', '/sprint-planning'],
  },
  {
    id: 'team-member',
    label: 'Team Member',
    icon: 'Code',
    description: 'Your assigned tasks, sprint board, and estimation tools',
    defaultView: '/kanban',
    visibleViews: ['/kanban', '/sprint-planning'],
  },
  {
    id: 'product-owner',
    label: 'Product Owner',
    icon: 'Target',
    description: 'Product backlog management, prioritization, and sprint review',
    defaultView: '/backlog',
    visibleViews: ['/dashboard', '/kanban', '/backlog', '/sprint-planning', '/pmp'],
  },
  {
    id: 'qa-lead',
    label: 'QA Lead',
    icon: 'TestTube',
    description: 'Testing pipeline, quality gates, and definition of done tracking',
    defaultView: '/kanban',
    visibleViews: ['/kanban', '/backlog', '/sprint-planning'],
  },
  {
    id: 'business-analyst',
    label: 'Business Analyst',
    icon: 'BarChart3',
    description: 'Requirements analysis, scope management, and stakeholder mapping',
    defaultView: '/backlog',
    visibleViews: ['/dashboard', '/backlog', '/pmp'],
  },
  {
    id: 'stakeholder',
    label: 'Stakeholder',
    icon: 'Eye',
    description: 'Read-only dashboards, project status, and milestone tracking',
    defaultView: '/dashboard',
    visibleViews: ['/dashboard', '/pmp'],
  },
  {
    id: 'devops-lead',
    label: 'DevOps Lead',
    icon: 'Server',
    description: 'Deployment pipeline, infrastructure tasks, and release management',
    defaultView: '/kanban',
    visibleViews: ['/kanban', '/sprint-planning'],
  },
];

export const KANBAN_COLUMNS: KanbanColumn[] = [
  { id: 'backlog', title: 'Backlog', wipLimit: null, color: '#6b7280' },
  { id: 'todo', title: 'To Do', wipLimit: 10, color: '#3b82f6' },
  { id: 'in-progress', title: 'In Progress', wipLimit: 5, color: '#f59e0b' },
  { id: 'review', title: 'Review', wipLimit: 3, color: '#8b5cf6' },
  { id: 'testing', title: 'Testing', wipLimit: 3, color: '#ec4899' },
  { id: 'done', title: 'Done', wipLimit: null, color: '#10b981' },
];

export const POKER_CARDS: PokerCardValue[] = ['0', '1', '2', '3', '5', '8', '13', '21', '34', '55', '89', '?', '☕'];

export const PMP_PROCESS_GROUPS: PmpProcessGroupInfo[] = [
  {
    id: 'initiating',
    label: 'Initiating',
    description: 'Define a new project or phase by obtaining authorization to start',
    color: '#3b82f6',
    icon: 'Rocket',
  },
  {
    id: 'planning',
    label: 'Planning',
    description: 'Establish scope, refine objectives, and define the course of action',
    color: '#8b5cf6',
    icon: 'Map',
  },
  {
    id: 'executing',
    label: 'Executing',
    description: 'Complete work defined in the project management plan',
    color: '#f59e0b',
    icon: 'Play',
  },
  {
    id: 'monitoring-controlling',
    label: 'Monitoring & Controlling',
    description: 'Track, review, and regulate progress and performance',
    color: '#ec4899',
    icon: 'Activity',
  },
  {
    id: 'closing',
    label: 'Closing',
    description: 'Finalize all activities to formally close the project or phase',
    color: '#10b981',
    icon: 'CheckCircle',
  },
];

export const PMP_KNOWLEDGE_AREAS: PmpKnowledgeAreaInfo[] = [
  { id: 'integration', label: 'Integration Management', description: 'Coordinate all project elements', icon: 'Layers' },
  { id: 'scope', label: 'Scope Management', description: 'Define and control what is included in the project', icon: 'Focus' },
  { id: 'schedule', label: 'Schedule Management', description: 'Manage timely completion of the project', icon: 'Calendar' },
  { id: 'cost', label: 'Cost Management', description: 'Plan, estimate, budget, and control costs', icon: 'DollarSign' },
  { id: 'quality', label: 'Quality Management', description: 'Ensure project satisfies its objectives', icon: 'Award' },
  { id: 'resource', label: 'Resource Management', description: 'Organize, manage, and lead the project team', icon: 'Users' },
  { id: 'communications', label: 'Communications Management', description: 'Ensure timely information flow', icon: 'MessageSquare' },
  { id: 'risk', label: 'Risk Management', description: 'Identify, analyze, and respond to risks', icon: 'AlertTriangle' },
  { id: 'procurement', label: 'Procurement Management', description: 'Acquire products and services from outside', icon: 'ShoppingCart' },
  { id: 'stakeholder', label: 'Stakeholder Engagement', description: 'Identify and engage stakeholders effectively', icon: 'UserCheck' },
];

export const PRIORITY_CONFIG = {
  critical: { label: 'Critical', color: '#ef4444', icon: 'AlertOctagon' },
  high: { label: 'High', color: '#f97316', icon: 'ArrowUp' },
  medium: { label: 'Medium', color: '#eab308', icon: 'Minus' },
  low: { label: 'Low', color: '#22c55e', icon: 'ArrowDown' },
} as const;

export const STORY_TYPE_CONFIG = {
  story: { label: 'Story', color: '#3b82f6', icon: 'BookOpen' },
  bug: { label: 'Bug', color: '#ef4444', icon: 'Bug' },
  task: { label: 'Task', color: '#10b981', icon: 'CheckSquare' },
  epic: { label: 'Epic', color: '#8b5cf6', icon: 'Zap' },
  spike: { label: 'Spike', color: '#f59e0b', icon: 'Search' },
} as const;
