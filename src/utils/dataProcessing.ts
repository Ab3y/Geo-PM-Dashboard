import Papa from 'papaparse';
import type { DataSet, MapDataPoint, DataCategory } from '../types';
import { STATE_NAME_TO_FIPS, STATE_FIPS } from '../constants';

export function parseCSV(file: File): Promise<Papa.ParseResult<Record<string, string>>> {
  return new Promise((resolve, reject) => {
    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: resolve,
      error: reject,
    });
  });
}

function normalizeStateName(name: string): string | null {
  const cleaned = name.trim();
  if (STATE_NAME_TO_FIPS[cleaned]) return STATE_NAME_TO_FIPS[cleaned];
  const lower = cleaned.toLowerCase();
  for (const [stateName, fips] of Object.entries(STATE_NAME_TO_FIPS)) {
    if (stateName.toLowerCase() === lower) return fips;
  }
  if (/^\d{2}$/.test(cleaned) && STATE_FIPS[cleaned]) return cleaned;
  return null;
}

export function processUploadedData(
  rows: Record<string, string>[],
  datasetName: string,
  category: DataCategory = 'custom',
): DataSet | null {
  if (!rows.length) return null;

  const columns = Object.keys(rows[0]);
  const regionCol = columns.find(c =>
    /state|region|name|county|location|area|fips/i.test(c)
  ) || columns[0];
  const valueCol = columns.find(c =>
    /value|count|total|cases|deaths|votes|amount|number|population/i.test(c)
  ) || columns[1];

  if (!regionCol || !valueCol) return null;

  const stateData: Record<string, MapDataPoint> = {};
  const countyData: Record<string, Record<string, MapDataPoint>> = {};

  const countyCol = columns.find(c => /county|parish|borough/i.test(c));
  const stateColForCounty = columns.find(c => /state/i.test(c));

  for (const row of rows) {
    const value = parseFloat(row[valueCol]) || 0;

    if (countyCol && stateColForCounty) {
      const stateFips = normalizeStateName(row[stateColForCounty]);
      if (stateFips) {
        if (!countyData[stateFips]) countyData[stateFips] = {};
        const countyName = row[countyCol].trim();
        const id = `${stateFips}-${countyName}`;
        countyData[stateFips][countyName] = { id, name: countyName, value };
      }
    } else {
      const fips = normalizeStateName(row[regionCol]);
      if (fips) {
        stateData[fips] = {
          id: fips,
          name: STATE_FIPS[fips] || row[regionCol],
          value,
        };
      }
    }
  }

  return {
    id: `custom-${Date.now()}`,
    name: datasetName,
    description: `Uploaded dataset: ${datasetName}`,
    category,
    stateData,
    countyData,
    unit: valueCol,
  };
}
