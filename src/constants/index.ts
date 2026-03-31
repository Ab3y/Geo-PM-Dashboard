export const MAP_URLS = {
  world: 'https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json',
  usStates: 'https://cdn.jsdelivr.net/npm/us-atlas@3/states-10m.json',
  usCounties: 'https://cdn.jsdelivr.net/npm/us-atlas@3/counties-10m.json',
} as const;

export const STATE_FIPS: Record<string, string> = {
  '01': 'Alabama', '02': 'Alaska', '04': 'Arizona', '05': 'Arkansas',
  '06': 'California', '08': 'Colorado', '09': 'Connecticut', '10': 'Delaware',
  '11': 'District of Columbia', '12': 'Florida', '13': 'Georgia', '15': 'Hawaii',
  '16': 'Idaho', '17': 'Illinois', '18': 'Indiana', '19': 'Iowa',
  '20': 'Kansas', '21': 'Kentucky', '22': 'Louisiana', '23': 'Maine',
  '24': 'Maryland', '25': 'Massachusetts', '26': 'Michigan', '27': 'Minnesota',
  '28': 'Mississippi', '29': 'Missouri', '30': 'Montana', '31': 'Nebraska',
  '32': 'Nevada', '33': 'New Hampshire', '34': 'New Jersey', '35': 'New Mexico',
  '36': 'New York', '37': 'North Carolina', '38': 'North Dakota', '39': 'Ohio',
  '40': 'Oklahoma', '41': 'Oregon', '42': 'Pennsylvania', '44': 'Rhode Island',
  '45': 'South Carolina', '46': 'South Dakota', '47': 'Tennessee', '48': 'Texas',
  '49': 'Utah', '50': 'Vermont', '51': 'Virginia', '53': 'Washington',
  '54': 'West Virginia', '55': 'Wisconsin', '56': 'Wyoming',
};

export const STATE_NAME_TO_FIPS: Record<string, string> = Object.fromEntries(
  Object.entries(STATE_FIPS).map(([k, v]) => [v, k])
);

export const NEWS_CATEGORIES = [
  { id: 'healthcare', label: 'Healthcare', icon: '🏥', color: '#22d3ee' },
  { id: 'political', label: 'Political', icon: '🏛️', color: '#a78bfa' },
  { id: 'military', label: 'Military', icon: '🎖️', color: '#f97316' },
  { id: 'education', label: 'Education', icon: '🎓', color: '#34d399' },
  { id: 'custom', label: 'Custom', icon: '📊', color: '#f472b6' },
] as const;

export const DEFAULT_GRADIENT = {
  startColor: '#0c2d48',
  endColor: '#00d4ff',
};

export const PRESET_GRADIENTS = [
  { name: 'Neon Blue', startColor: '#0c2d48', endColor: '#00d4ff' },
  { name: 'Fire', startColor: '#1a0000', endColor: '#ff4444' },
  { name: 'Emerald', startColor: '#001a0c', endColor: '#00ff88' },
  { name: 'Purple Haze', startColor: '#0d001a', endColor: '#b366ff' },
  { name: 'Sunset', startColor: '#1a0d00', endColor: '#ff8800' },
  { name: 'Political Red', startColor: '#1a0000', endColor: '#dc2626' },
  { name: 'Political Blue', startColor: '#00001a', endColor: '#2563eb' },
];
