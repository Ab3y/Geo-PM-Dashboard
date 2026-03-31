export interface MapDataPoint {
  id: string;
  name: string;
  value: number;
  label?: string;
  meta?: Record<string, string | number>;
}

export interface DataSet {
  id: string;
  name: string;
  description: string;
  category: DataCategory;
  stateData: Record<string, MapDataPoint>;
  countyData: Record<string, Record<string, MapDataPoint>>;
  year?: number;
  unit?: string;
}

export type DataCategory = 'healthcare' | 'political' | 'military' | 'education' | 'custom';

export type ViewLevel = 'world' | 'us' | 'state';
export type ViewMode = '2d' | '3d';

export interface GradientConfig {
  startColor: string;
  endColor: string;
}

export interface TooltipData {
  name: string;
  value?: number;
  unit?: string;
  extra?: Record<string, string | number>;
  x: number;
  y: number;
}

export interface AppState {
  viewLevel: ViewLevel;
  viewMode: ViewMode;
  selectedState: string | null;
  selectedStateName: string | null;
  activeDataset: string | null;
  activeCategory: DataCategory | 'all';
  datasets: DataSet[];
  gradient: GradientConfig;
  tooltip: TooltipData | null;
  sidebarOpen: boolean;
}

export type AppAction =
  | { type: 'SET_VIEW_LEVEL'; payload: ViewLevel }
  | { type: 'SET_VIEW_MODE'; payload: ViewMode }
  | { type: 'SELECT_STATE'; payload: { fips: string; name: string } | null }
  | { type: 'SET_ACTIVE_DATASET'; payload: string | null }
  | { type: 'SET_CATEGORY'; payload: DataCategory | 'all' }
  | { type: 'ADD_DATASET'; payload: DataSet }
  | { type: 'SET_GRADIENT'; payload: GradientConfig }
  | { type: 'SET_TOOLTIP'; payload: TooltipData | null }
  | { type: 'TOGGLE_SIDEBAR' }
  | { type: 'DRILL_TO_US' }
  | { type: 'DRILL_TO_STATE'; payload: { fips: string; name: string } }
  | { type: 'NAVIGATE_BACK' };
