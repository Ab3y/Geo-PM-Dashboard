import { createContext, useContext, useReducer, useEffect, type ReactNode, type Dispatch } from 'react';
import type { PersonaRole, PersonaState } from '../types/pm';
import { PERSONAS } from '../constants/pm';

interface PersonaContextState {
  currentPersona: PersonaRole;
  personaStates: Record<PersonaRole, PersonaState>;
}

type PersonaAction =
  | { type: 'SET_PERSONA'; payload: PersonaRole }
  | { type: 'UPDATE_PERSONA_STATE'; payload: Partial<PersonaState> }
  | { type: 'LOAD_SAVED_STATE'; payload: PersonaContextState };

const defaultPersonaState: PersonaState = {
  currentView: '/kanban',
  kanbanFilters: {
    assignee: null,
    priority: null,
    type: null,
    search: '',
  },
  selectedSprintId: null,
  sidebarOpen: true,
};

function createInitialState(): PersonaContextState {
  const personaStates = {} as Record<PersonaRole, PersonaState>;
  for (const p of PERSONAS) {
    personaStates[p.id] = { ...defaultPersonaState, currentView: p.defaultView };
  }
  return {
    currentPersona: 'scrum-master',
    personaStates,
  };
}

const STORAGE_KEY = 'abeops-persona-state';

function loadFromStorage(): PersonaContextState | null {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) return JSON.parse(saved);
  } catch { /* ignore */ }
  return null;
}

function saveToStorage(state: PersonaContextState) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch { /* ignore */ }
}

function personaReducer(state: PersonaContextState, action: PersonaAction): PersonaContextState {
  switch (action.type) {
    case 'SET_PERSONA':
      return { ...state, currentPersona: action.payload };
    case 'UPDATE_PERSONA_STATE':
      return {
        ...state,
        personaStates: {
          ...state.personaStates,
          [state.currentPersona]: {
            ...state.personaStates[state.currentPersona],
            ...action.payload,
          },
        },
      };
    case 'LOAD_SAVED_STATE':
      return action.payload;
    default:
      return state;
  }
}

const PersonaStateContext = createContext<PersonaContextState>(createInitialState());
const PersonaDispatchContext = createContext<Dispatch<PersonaAction>>(() => {});

export function PersonaProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(personaReducer, null, () => {
    return loadFromStorage() || createInitialState();
  });

  // Persist to localStorage on every state change
  useEffect(() => {
    saveToStorage(state);
  }, [state]);

  return (
    <PersonaStateContext.Provider value={state}>
      <PersonaDispatchContext.Provider value={dispatch}>
        {children}
      </PersonaDispatchContext.Provider>
    </PersonaStateContext.Provider>
  );
}

export function usePersonaState() { return useContext(PersonaStateContext); }
export function usePersonaDispatch() { return useContext(PersonaDispatchContext); }

// Convenience hooks
export function useCurrentPersona() {
  const { currentPersona, personaStates } = usePersonaState();
  const config = PERSONAS.find(p => p.id === currentPersona)!;
  const personaState = personaStates[currentPersona];
  return { persona: currentPersona, config, state: personaState };
}
