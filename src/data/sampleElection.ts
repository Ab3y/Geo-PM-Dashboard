import type { DataSet } from '../types';

const electionStates2020: DataSet['stateData'] = {
  '01': { id: '01', name: 'Alabama', value: 62, meta: { party: 'R', dem: 36, rep: 62 } },
  '02': { id: '02', name: 'Alaska', value: 53, meta: { party: 'R', dem: 43, rep: 53 } },
  '04': { id: '04', name: 'Arizona', value: 49.4, meta: { party: 'D', dem: 49.4, rep: 49.1 } },
  '05': { id: '05', name: 'Arkansas', value: 62, meta: { party: 'R', dem: 35, rep: 62 } },
  '06': { id: '06', name: 'California', value: 63, meta: { party: 'D', dem: 63, rep: 34 } },
  '08': { id: '08', name: 'Colorado', value: 55, meta: { party: 'D', dem: 55, rep: 42 } },
  '09': { id: '09', name: 'Connecticut', value: 59, meta: { party: 'D', dem: 59, rep: 39 } },
  '10': { id: '10', name: 'Delaware', value: 59, meta: { party: 'D', dem: 59, rep: 40 } },
  '12': { id: '12', name: 'Florida', value: 51.2, meta: { party: 'R', dem: 47.9, rep: 51.2 } },
  '13': { id: '13', name: 'Georgia', value: 49.5, meta: { party: 'D', dem: 49.5, rep: 49.3 } },
  '15': { id: '15', name: 'Hawaii', value: 63, meta: { party: 'D', dem: 63, rep: 34 } },
  '16': { id: '16', name: 'Idaho', value: 64, meta: { party: 'R', dem: 33, rep: 64 } },
  '17': { id: '17', name: 'Illinois', value: 57, meta: { party: 'D', dem: 57, rep: 41 } },
  '18': { id: '18', name: 'Indiana', value: 57, meta: { party: 'R', dem: 41, rep: 57 } },
  '19': { id: '19', name: 'Iowa', value: 53, meta: { party: 'R', dem: 45, rep: 53 } },
  '20': { id: '20', name: 'Kansas', value: 56, meta: { party: 'R', dem: 41, rep: 56 } },
  '21': { id: '21', name: 'Kentucky', value: 62, meta: { party: 'R', dem: 36, rep: 62 } },
  '22': { id: '22', name: 'Louisiana', value: 58, meta: { party: 'R', dem: 40, rep: 58 } },
  '23': { id: '23', name: 'Maine', value: 53, meta: { party: 'D', dem: 53, rep: 44 } },
  '24': { id: '24', name: 'Maryland', value: 65, meta: { party: 'D', dem: 65, rep: 32 } },
  '25': { id: '25', name: 'Massachusetts', value: 66, meta: { party: 'D', dem: 66, rep: 32 } },
  '26': { id: '26', name: 'Michigan', value: 50.6, meta: { party: 'D', dem: 50.6, rep: 47.8 } },
  '27': { id: '27', name: 'Minnesota', value: 52, meta: { party: 'D', dem: 52, rep: 45 } },
  '28': { id: '28', name: 'Mississippi', value: 58, meta: { party: 'R', dem: 41, rep: 58 } },
  '29': { id: '29', name: 'Missouri', value: 57, meta: { party: 'R', dem: 41, rep: 57 } },
  '30': { id: '30', name: 'Montana', value: 57, meta: { party: 'R', dem: 40, rep: 57 } },
  '31': { id: '31', name: 'Nebraska', value: 59, meta: { party: 'R', dem: 39, rep: 59 } },
  '32': { id: '32', name: 'Nevada', value: 50.1, meta: { party: 'D', dem: 50.1, rep: 47.7 } },
  '33': { id: '33', name: 'New Hampshire', value: 52, meta: { party: 'D', dem: 52, rep: 46 } },
  '34': { id: '34', name: 'New Jersey', value: 57, meta: { party: 'D', dem: 57, rep: 41 } },
  '35': { id: '35', name: 'New Mexico', value: 54, meta: { party: 'D', dem: 54, rep: 44 } },
  '36': { id: '36', name: 'New York', value: 61, meta: { party: 'D', dem: 61, rep: 38 } },
  '37': { id: '37', name: 'North Carolina', value: 50, meta: { party: 'R', dem: 49, rep: 50 } },
  '38': { id: '38', name: 'North Dakota', value: 65, meta: { party: 'R', dem: 32, rep: 65 } },
  '39': { id: '39', name: 'Ohio', value: 53, meta: { party: 'R', dem: 45, rep: 53 } },
  '40': { id: '40', name: 'Oklahoma', value: 65, meta: { party: 'R', dem: 32, rep: 65 } },
  '41': { id: '41', name: 'Oregon', value: 56, meta: { party: 'D', dem: 56, rep: 40 } },
  '42': { id: '42', name: 'Pennsylvania', value: 50, meta: { party: 'D', dem: 50, rep: 48.8 } },
  '44': { id: '44', name: 'Rhode Island', value: 59, meta: { party: 'D', dem: 59, rep: 39 } },
  '45': { id: '45', name: 'South Carolina', value: 55, meta: { party: 'R', dem: 43, rep: 55 } },
  '46': { id: '46', name: 'South Dakota', value: 62, meta: { party: 'R', dem: 36, rep: 62 } },
  '47': { id: '47', name: 'Tennessee', value: 61, meta: { party: 'R', dem: 37, rep: 61 } },
  '48': { id: '48', name: 'Texas', value: 52, meta: { party: 'R', dem: 46, rep: 52 } },
  '49': { id: '49', name: 'Utah', value: 58, meta: { party: 'R', dem: 38, rep: 58 } },
  '50': { id: '50', name: 'Vermont', value: 66, meta: { party: 'D', dem: 66, rep: 31 } },
  '51': { id: '51', name: 'Virginia', value: 54, meta: { party: 'D', dem: 54, rep: 44 } },
  '53': { id: '53', name: 'Washington', value: 58, meta: { party: 'D', dem: 58, rep: 39 } },
  '54': { id: '54', name: 'West Virginia', value: 69, meta: { party: 'R', dem: 30, rep: 69 } },
  '55': { id: '55', name: 'Wisconsin', value: 49.6, meta: { party: 'D', dem: 49.6, rep: 48.8 } },
  '56': { id: '56', name: 'Wyoming', value: 70, meta: { party: 'R', dem: 27, rep: 70 } },
};

const electionStates2024: DataSet['stateData'] = {};
for (const [fips, data] of Object.entries(electionStates2020)) {
  const shift = (Math.random() - 0.5) * 6;
  const dem = Number(data.meta?.dem || 0) + shift;
  const rep = Number(data.meta?.rep || 0) - shift;
  const party = dem > rep ? 'D' : 'R';
  electionStates2024[fips] = {
    ...data,
    value: Math.max(dem, rep),
    meta: { party, dem: Math.round(dem * 10) / 10, rep: Math.round(rep * 10) / 10 },
  };
}

export const SAMPLE_ELECTION_DATASETS: DataSet[] = [
  {
    id: 'election-2020',
    name: 'Presidential Election 2020',
    description: 'Vote share by winning party — 2020 Presidential Election',
    category: 'political',
    year: 2020,
    unit: '% vote share',
    stateData: electionStates2020,
    countyData: {},
  },
  {
    id: 'election-2024',
    name: 'Presidential Election 2024',
    description: 'Vote share by winning party — 2024 Presidential Election',
    category: 'political',
    year: 2024,
    unit: '% vote share',
    stateData: electionStates2024,
    countyData: {},
  },
];
