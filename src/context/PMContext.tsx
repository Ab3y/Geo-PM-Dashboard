import { createContext, useContext, useReducer, useEffect, type ReactNode, type Dispatch } from 'react';
import type { Story, Sprint, PokerSession, StoryStatus, PokerCardValue } from '../types/pm';
import { v4 as uuidv4 } from 'uuid';

interface PMState {
  stories: Story[];
  sprints: Sprint[];
  pokerSession: PokerSession | null;
}

type PMAction =
  | { type: 'ADD_STORY'; payload: Omit<Story, 'id' | 'createdAt' | 'updatedAt'> }
  | { type: 'UPDATE_STORY'; payload: { id: string; changes: Partial<Story> } }
  | { type: 'DELETE_STORY'; payload: string }
  | { type: 'MOVE_STORY'; payload: { storyId: string; newStatus: StoryStatus; newIndex?: number } }
  | { type: 'REORDER_STORIES'; payload: { status: StoryStatus; storyIds: string[] } }
  | { type: 'ADD_SPRINT'; payload: Omit<Sprint, 'id' | 'createdAt'> }
  | { type: 'UPDATE_SPRINT'; payload: { id: string; changes: Partial<Sprint> } }
  | { type: 'START_POKER'; payload: { storyId: string; participants: string[] } }
  | { type: 'CAST_VOTE'; payload: { participant: string; value: PokerCardValue } }
  | { type: 'REVEAL_VOTES' }
  | { type: 'SET_FINAL_ESTIMATE'; payload: number }
  | { type: 'END_POKER' }
  | { type: 'LOAD_STATE'; payload: PMState };

const STORAGE_KEY = 'abeops-data';

// Create sample data for demo purposes
function createSampleData(): PMState {
  const now = new Date().toISOString();
  const stories: Story[] = [
    {
      id: uuidv4(), title: 'User authentication flow', description: 'Implement OAuth2 login with Google and GitHub providers',
      type: 'story', status: 'done', priority: 'high', storyPoints: 8, assignee: 'Trinity',
      tags: ['auth', 'security'], sprintId: null, epicId: null, createdAt: now, updatedAt: now,
      acceptanceCriteria: ['Users can sign in with Google', 'Users can sign in with GitHub', 'Session persists across tabs'],
      processGroup: 'executing', knowledgeArea: 'integration',
    },
    {
      id: uuidv4(), title: 'Dashboard performance optimization', description: 'Reduce initial load time to under 2 seconds',
      type: 'task', status: 'in-progress', priority: 'high', storyPoints: 5, assignee: 'Neo',
      tags: ['performance', 'frontend'], sprintId: null, epicId: null, createdAt: now, updatedAt: now,
      acceptanceCriteria: ['Lighthouse score > 90', 'First contentful paint < 1.5s'],
      processGroup: 'executing', knowledgeArea: 'quality',
    },
    {
      id: uuidv4(), title: 'API rate limiting', description: 'Implement rate limiting middleware for all API endpoints',
      type: 'story', status: 'review', priority: 'medium', storyPoints: 5, assignee: 'Tank',
      tags: ['api', 'security'], sprintId: null, epicId: null, createdAt: now, updatedAt: now,
      acceptanceCriteria: ['Rate limit headers returned', '429 status on exceed', 'Configurable per endpoint'],
      processGroup: 'executing', knowledgeArea: 'risk',
    },
    {
      id: uuidv4(), title: 'Data export feature', description: 'Allow users to export dashboard data as CSV and PDF',
      type: 'story', status: 'todo', priority: 'medium', storyPoints: 8, assignee: 'Morpheus',
      tags: ['export', 'data'], sprintId: null, epicId: null, createdAt: now, updatedAt: now,
      acceptanceCriteria: ['CSV export works', 'PDF export with charts', 'Custom date range selection'],
      processGroup: 'planning', knowledgeArea: 'scope',
    },
    {
      id: uuidv4(), title: 'Fix tooltip positioning bug', description: 'Tooltips overflow screen on right edge',
      type: 'bug', status: 'todo', priority: 'low', storyPoints: 2, assignee: 'Trinity',
      tags: ['ui', 'bug'], sprintId: null, epicId: null, createdAt: now, updatedAt: now,
      acceptanceCriteria: ['Tooltip stays within viewport', 'Works on all screen sizes'],
      processGroup: 'monitoring-controlling', knowledgeArea: 'quality',
    },
    {
      id: uuidv4(), title: 'Evaluate charting libraries', description: 'Compare Recharts vs Victory vs Nivo for new dashboard charts',
      type: 'spike', status: 'backlog', priority: 'low', storyPoints: 3, assignee: null,
      tags: ['research', 'charts'], sprintId: null, epicId: null, createdAt: now, updatedAt: now,
      acceptanceCriteria: ['Performance comparison documented', 'Accessibility comparison', 'Bundle size analysis'],
      processGroup: 'initiating', knowledgeArea: 'procurement',
    },
    {
      id: uuidv4(), title: 'CI/CD pipeline setup', description: 'Configure GitHub Actions for build, test, and deploy',
      type: 'task', status: 'in-progress', priority: 'high', storyPoints: 5, assignee: 'Tank',
      tags: ['devops', 'ci-cd'], sprintId: null, epicId: null, createdAt: now, updatedAt: now,
      acceptanceCriteria: ['Build runs on PR', 'Tests run automatically', 'Auto-deploy to staging on merge'],
      processGroup: 'executing', knowledgeArea: 'integration',
    },
    {
      id: uuidv4(), title: 'Stakeholder reporting module', description: 'Build executive summary dashboard with KPIs',
      type: 'epic', status: 'backlog', priority: 'medium', storyPoints: 21, assignee: null,
      tags: ['reporting', 'stakeholder'], sprintId: null, epicId: null, createdAt: now, updatedAt: now,
      acceptanceCriteria: ['Weekly report generation', 'KPI trend visualization', 'Email digest option'],
      processGroup: 'planning', knowledgeArea: 'communications',
    },
    {
      id: uuidv4(), title: 'Mobile responsive layout', description: 'Ensure dashboard works on tablets and phones',
      type: 'story', status: 'backlog', priority: 'medium', storyPoints: 13, assignee: null,
      tags: ['mobile', 'responsive'], sprintId: null, epicId: null, createdAt: now, updatedAt: now,
      acceptanceCriteria: ['Works on iPad', 'Works on iPhone', 'Touch gestures for charts'],
      processGroup: 'planning', knowledgeArea: 'scope',
    },
    {
      id: uuidv4(), title: 'Database migration strategy', description: 'Plan migration from SQLite to PostgreSQL for production',
      type: 'task', status: 'backlog', priority: 'high', storyPoints: 8, assignee: null,
      tags: ['database', 'migration'], sprintId: null, epicId: null, createdAt: now, updatedAt: now,
      acceptanceCriteria: ['Migration scripts ready', 'Rollback plan documented', 'Zero-downtime migration'],
      processGroup: 'planning', knowledgeArea: 'risk',
    },
    {
      id: uuidv4(), title: 'Unit test coverage', description: 'Increase test coverage to 80% across core modules',
      type: 'task', status: 'testing', priority: 'medium', storyPoints: 8, assignee: 'Dozer',
      tags: ['testing', 'quality'], sprintId: null, epicId: null, createdAt: now, updatedAt: now,
      acceptanceCriteria: ['Coverage > 80%', 'All critical paths tested', 'CI fails below threshold'],
      processGroup: 'monitoring-controlling', knowledgeArea: 'quality',
    },
  ];

  const sprints: Sprint[] = [
    {
      id: uuidv4(), name: 'Sprint 1 — Foundation', goal: 'Set up core infrastructure and authentication',
      startDate: '2026-03-16', endDate: '2026-03-30', status: 'completed',
      velocity: 21, storyIds: [], createdAt: now,
    },
    {
      id: uuidv4(), name: 'Sprint 2 — Core Features', goal: 'Build dashboard and data pipeline',
      startDate: '2026-03-30', endDate: '2026-04-13', status: 'active',
      velocity: null, storyIds: [], createdAt: now,
    },
  ];

  // Assign some stories to the active sprint
  const activeSprintId = sprints[1].id;
  const sprintStoryIndices = [1, 2, 4, 6, 10];
  for (const idx of sprintStoryIndices) {
    if (stories[idx]) {
      stories[idx].sprintId = activeSprintId;
      sprints[1].storyIds.push(stories[idx].id);
    }
  }
  // Assign completed stories to sprint 1
  const completedSprintId = sprints[0].id;
  stories[0].sprintId = completedSprintId;
  sprints[0].storyIds.push(stories[0].id);

  return { stories, sprints, pokerSession: null };
}

function loadPMState(): PMState | null {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) return JSON.parse(saved);
  } catch { /* ignore */ }
  return null;
}

function savePMState(state: PMState) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch { /* ignore */ }
}

function pmReducer(state: PMState, action: PMAction): PMState {
  switch (action.type) {
    case 'ADD_STORY': {
      const now = new Date().toISOString();
      const newStory: Story = {
        ...action.payload,
        id: uuidv4(),
        createdAt: now,
        updatedAt: now,
      };
      return { ...state, stories: [...state.stories, newStory] };
    }
    case 'UPDATE_STORY':
      return {
        ...state,
        stories: state.stories.map(s =>
          s.id === action.payload.id
            ? { ...s, ...action.payload.changes, updatedAt: new Date().toISOString() }
            : s
        ),
      };
    case 'DELETE_STORY':
      return { ...state, stories: state.stories.filter(s => s.id !== action.payload) };
    case 'MOVE_STORY':
      return {
        ...state,
        stories: state.stories.map(s =>
          s.id === action.payload.storyId
            ? { ...s, status: action.payload.newStatus, updatedAt: new Date().toISOString() }
            : s
        ),
      };
    case 'REORDER_STORIES': {
      const orderedIds = action.payload.storyIds;
      const otherStories = state.stories.filter(s => s.status !== action.payload.status);
      const columnStories = orderedIds
        .map(id => state.stories.find(s => s.id === id))
        .filter((s): s is Story => s !== undefined);
      return { ...state, stories: [...otherStories, ...columnStories] };
    }
    case 'ADD_SPRINT': {
      const newSprint: Sprint = {
        ...action.payload,
        id: uuidv4(),
        createdAt: new Date().toISOString(),
      };
      return { ...state, sprints: [...state.sprints, newSprint] };
    }
    case 'UPDATE_SPRINT':
      return {
        ...state,
        sprints: state.sprints.map(s =>
          s.id === action.payload.id ? { ...s, ...action.payload.changes } : s
        ),
      };
    case 'START_POKER':
      return {
        ...state,
        pokerSession: {
          id: uuidv4(),
          storyId: action.payload.storyId,
          votes: {},
          revealed: false,
          finalEstimate: null,
          participants: action.payload.participants,
        },
      };
    case 'CAST_VOTE':
      if (!state.pokerSession) return state;
      return {
        ...state,
        pokerSession: {
          ...state.pokerSession,
          votes: { ...state.pokerSession.votes, [action.payload.participant]: action.payload.value },
        },
      };
    case 'REVEAL_VOTES':
      if (!state.pokerSession) return state;
      return {
        ...state,
        pokerSession: { ...state.pokerSession, revealed: true },
      };
    case 'SET_FINAL_ESTIMATE':
      if (!state.pokerSession) return state;
      return {
        ...state,
        pokerSession: { ...state.pokerSession, finalEstimate: action.payload },
        stories: state.stories.map(s =>
          s.id === state.pokerSession!.storyId
            ? { ...s, storyPoints: action.payload, updatedAt: new Date().toISOString() }
            : s
        ),
      };
    case 'END_POKER':
      return { ...state, pokerSession: null };
    case 'LOAD_STATE':
      return action.payload;
    default:
      return state;
  }
}

const PMStateContext = createContext<PMState>({ stories: [], sprints: [], pokerSession: null });
const PMDispatchContext = createContext<Dispatch<PMAction>>(() => {});

export function PMProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(pmReducer, null, () => {
    return loadPMState() || createSampleData();
  });

  useEffect(() => {
    savePMState(state);
  }, [state]);

  return (
    <PMStateContext.Provider value={state}>
      <PMDispatchContext.Provider value={dispatch}>
        {children}
      </PMDispatchContext.Provider>
    </PMStateContext.Provider>
  );
}

export function usePMState() { return useContext(PMStateContext); }
export function usePMDispatch() { return useContext(PMDispatchContext); }
