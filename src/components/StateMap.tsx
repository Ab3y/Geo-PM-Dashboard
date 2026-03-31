import { useState, useEffect, useMemo, useCallback, type MouseEvent } from 'react';
import {
  ComposableMap,
  Geographies,
  Geography,
  ZoomableGroup,
} from 'react-simple-maps';
import { feature } from 'topojson-client';
import type { Topology, GeometryCollection } from 'topojson-specification';
import { useAppState, useAppDispatch } from '../context/AppContext';
import { MAP_URLS, STATE_FIPS } from '../constants';
import { getRegionColor } from '../utils/colors';

interface StateMapProps {
  stateFips: string;
}

export default function StateMap({ stateFips }: StateMapProps) {
  const { activeDataset, datasets, gradient } = useAppState();
  const dispatch = useAppDispatch();
  const [filteredGeo, setFilteredGeo] = useState<any>(null);

  const dataset = useMemo(
    () => datasets.find(d => d.id === activeDataset),
    [datasets, activeDataset],
  );

  const countyData = useMemo(
    () => dataset?.countyData[stateFips] || {},
    [dataset, stateFips],
  );

  const { min, max } = useMemo(() => {
    const vals = Object.values(countyData).map(d => d.value);
    if (!vals.length) return { min: 0, max: 0 };
    return { min: Math.min(...vals), max: Math.max(...vals) };
  }, [countyData]);

  useEffect(() => {
    fetch(MAP_URLS.usCounties)
      .then(r => r.json())
      .then((topo: Topology) => {
        const counties = topo.objects.counties as GeometryCollection;
        const filtered = {
          ...counties,
          geometries: counties.geometries.filter((g: any) => {
            const id = String(g.id).padStart(5, '0');
            return id.startsWith(stateFips.padStart(2, '0'));
          }),
        };
        const geoJson = feature(topo, filtered);
        setFilteredGeo(geoJson);
      })
      .catch(console.error);
  }, [stateFips]);

  const handleMouseMove = useCallback(
    (geo: any, e: MouseEvent) => {
      const countyId = String(geo.id).padStart(5, '0');
      const name = geo.properties?.name || `County ${countyId}`;
      const countyMatch = Object.values(countyData).find(
        d => d.name.toLowerCase().includes(name.toLowerCase()) ||
             name.toLowerCase().includes(d.name.toLowerCase().replace(' parish', '').replace(' county', ''))
      );

      dispatch({
        type: 'SET_TOOLTIP',
        payload: {
          name: `${name}${STATE_FIPS[stateFips] ? `, ${STATE_FIPS[stateFips]}` : ''}`,
          value: countyMatch?.value,
          unit: dataset?.unit,
          x: e.clientX,
          y: e.clientY,
        },
      });
    },
    [dispatch, countyData, dataset, stateFips],
  );

  const handleMouseLeave = useCallback(() => {
    dispatch({ type: 'SET_TOOLTIP', payload: null });
  }, [dispatch]);

  if (!filteredGeo) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-[#00d4ff] animate-pulse-neon text-lg">
          Loading {STATE_FIPS[stateFips] || 'State'} Counties...
        </div>
      </div>
    );
  }

  return (
    <ComposableMap
      projection="geoMercator"
      projectionConfig={{ scale: 3000 }}
      className="w-full h-full"
      style={{ background: 'transparent' }}
    >
      <ZoomableGroup
        center={getCenterForState(stateFips)}
        zoom={1}
      >
        <Geographies geography={filteredGeo}>
          {({ geographies }) =>
            geographies.map((geo) => {
              const name = geo.properties?.name || '';
              const countyMatch = Object.values(countyData).find(
                d => d.name.toLowerCase().includes(name.toLowerCase()) ||
                     name.toLowerCase().includes(d.name.toLowerCase().replace(' parish', '').replace(' county', ''))
              );
              const fillColor = countyMatch
                ? getRegionColor(countyMatch.value, min, max, gradient)
                : '#151d30';

              return (
                <Geography
                  key={geo.rsmKey}
                  geography={geo}
                  className="geo-region"
                  onMouseMove={(e) => handleMouseMove(geo, e as unknown as MouseEvent)}
                  onMouseLeave={handleMouseLeave}
                  style={{
                    default: {
                      fill: fillColor,
                      stroke: '#00d4ff20',
                      strokeWidth: 0.5,
                      outline: 'none',
                    },
                    hover: {
                      fill: fillColor,
                      stroke: '#00d4ff',
                      strokeWidth: 1.5,
                      outline: 'none',
                      filter: 'brightness(1.5)',
                    },
                    pressed: {
                      fill: '#00d4ff60',
                      stroke: '#00d4ff',
                      outline: 'none',
                    },
                  }}
                />
              );
            })
          }
        </Geographies>
      </ZoomableGroup>
    </ComposableMap>
  );
}

function getCenterForState(fips: string): [number, number] {
  const centers: Record<string, [number, number]> = {
    '01': [-86.9, 32.8], '02': [-153.5, 64.2], '04': [-111.9, 34.2],
    '05': [-92.4, 34.8], '06': [-119.7, 37.3], '08': [-105.5, 39.0],
    '09': [-72.7, 41.6], '10': [-75.5, 39.0], '11': [-77.0, 38.9],
    '12': [-81.7, 28.1], '13': [-83.5, 32.7], '15': [-155.5, 19.9],
    '16': [-114.7, 44.2], '17': [-89.4, 40.0], '18': [-86.3, 39.8],
    '19': [-93.5, 42.0], '20': [-98.5, 38.5], '21': [-85.3, 37.8],
    '22': [-91.2, 30.5], '23': [-69.4, 45.3], '24': [-76.6, 39.0],
    '25': [-71.5, 42.2], '26': [-84.5, 44.3], '27': [-94.6, 46.4],
    '28': [-89.7, 32.7], '29': [-92.6, 38.5], '30': [-109.6, 46.9],
    '31': [-100.0, 41.5], '32': [-116.6, 38.8], '33': [-71.6, 43.7],
    '34': [-74.5, 40.1], '35': [-105.9, 34.5], '36': [-75.5, 43.0],
    '37': [-79.0, 35.5], '38': [-100.5, 47.5], '39': [-82.8, 40.4],
    '40': [-97.5, 35.5], '41': [-120.6, 43.8], '42': [-77.2, 41.2],
    '44': [-71.5, 41.7], '45': [-81.2, 34.0], '46': [-100.0, 44.4],
    '47': [-86.0, 35.5], '48': [-99.5, 31.5], '49': [-111.9, 39.3],
    '50': [-72.6, 44.0], '51': [-79.5, 37.8], '53': [-120.7, 47.4],
    '54': [-80.6, 38.6], '55': [-90.0, 44.6], '56': [-107.6, 43.0],
  };
  return centers[fips] || [-98.5, 39.8];
}
