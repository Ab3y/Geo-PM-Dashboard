import { createContext, useContext, useReducer, type ReactNode, type Dispatch } from 'react';
import type { AppState, AppAction } from '../types';
import { DEFAULT_GRADIENT } from '../constants';
import { SAMPLE_COVID_DATASET } from '../data/sampleCovid';
import { SAMPLE_ELECTION_DATASETS } from '../data/sampleElection';

const initialState: AppState = {
  viewLevel: 'world',
  viewMode: '2d',
  selectedState: null,
  selectedStateName: null,
  activeDataset: null,
  activeCategory: 'all',
  datasets: [SAMPLE_COVID_DATASET, ...SAMPLE_ELECTION_DATASETS],
  gradient: DEFAULT_GRADIENT,
  tooltip: null,
  sidebarOpen: true,
};

function appReducer(state: AppState, action: AppAction): AppState {
  switch (action.type) {
    case 'SET_VIEW_LEVEL':
      return { ...state, viewLevel: action.payload };
    case 'SET_VIEW_MODE':
      return { ...state, viewMode: action.payload };
    case 'SELECT_STATE':
      return action.payload
        ? { ...state, selectedState: action.payload.fips, selectedStateName: action.payload.name }
        : { ...state, selectedState: null, selectedStateName: null };
    case 'SET_ACTIVE_DATASET':
      return { ...state, activeDataset: action.payload };
    case 'SET_CATEGORY':
      return { ...state, activeCategory: action.payload };
    case 'ADD_DATASET':
      return { ...state, datasets: [...state.datasets, action.payload] };
    case 'SET_GRADIENT':
      return { ...state, gradient: action.payload };
    case 'SET_TOOLTIP':
      return { ...state, tooltip: action.payload };
    case 'TOGGLE_SIDEBAR':
      return { ...state, sidebarOpen: !state.sidebarOpen };
    case 'DRILL_TO_US':
      return { ...state, viewLevel: 'us', selectedState: null, selectedStateName: null };
    case 'DRILL_TO_STATE':
      return {
        ...state,
        viewLevel: 'state',
        selectedState: action.payload.fips,
        selectedStateName: action.payload.name,
      };
    case 'NAVIGATE_BACK':
      if (state.viewLevel === 'state') {
        return { ...state, viewLevel: 'us', selectedState: null, selectedStateName: null };
      }
      if (state.viewLevel === 'us') {
        return { ...state, viewLevel: 'world' };
      }
      return state;
    default:
      return state;
  }
}

const AppContext = createContext<AppState>(initialState);
const DispatchContext = createContext<Dispatch<AppAction>>(() => {});

export function AppProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(appReducer, initialState);
  return (
    <AppContext.Provider value={state}>
      <DispatchContext.Provider value={dispatch}>
        {children}
      </DispatchContext.Provider>
    </AppContext.Provider>
  );
}

export function useAppState() { return useContext(AppContext); }
export function useAppDispatch() { return useContext(DispatchContext); }
