import { useState, useEffect, useMemo, useCallback, type MouseEvent } from 'react';
import {
  ComposableMap,
  Geographies,
  Geography,
  ZoomableGroup,
} from 'react-simple-maps';
import { useAppState, useAppDispatch } from '../context/AppContext';
import { MAP_URLS, STATE_FIPS } from '../constants';
import { getRegionColor } from '../utils/colors';

export default function USMap() {
  const { activeDataset, datasets, gradient } = useAppState();
  const dispatch = useAppDispatch();
  const [geoData, setGeoData] = useState<any>(null);

  const dataset = useMemo(
    () => datasets.find(d => d.id === activeDataset),
    [datasets, activeDataset],
  );

  const { min, max } = useMemo(() => {
    if (!dataset) return { min: 0, max: 0 };
    const vals = Object.values(dataset.stateData).map(d => d.value);
    if (!vals.length) return { min: 0, max: 0 };
    return { min: Math.min(...vals), max: Math.max(...vals) };
  }, [dataset]);

  useEffect(() => {
    fetch(MAP_URLS.usStates)
      .then(r => r.json())
      .then(setGeoData)
      .catch(console.error);
  }, []);

  const handleStateClick = useCallback(
    (geo: any) => {
      const fips = String(geo.id).padStart(2, '0');
      const name = STATE_FIPS[fips] || geo.properties?.name || `State ${fips}`;
      dispatch({ type: 'DRILL_TO_STATE', payload: { fips, name } });
    },
    [dispatch],
  );

  const handleMouseMove = useCallback(
    (geo: any, e: MouseEvent) => {
      const fips = String(geo.id).padStart(2, '0');
      const name = STATE_FIPS[fips] || geo.properties?.name || `State ${fips}`;
      const stateData = dataset?.stateData[fips];

      const extra: Record<string, string | number> = {};
      if (stateData?.meta) {
        Object.entries(stateData.meta).forEach(([k, v]) => { extra[k] = v; });
      }
      extra['Click'] = 'View counties';

      dispatch({
        type: 'SET_TOOLTIP',
        payload: {
          name,
          value: stateData?.value,
          unit: dataset?.unit,
          extra,
          x: e.clientX,
          y: e.clientY,
        },
      });
    },
    [dispatch, dataset],
  );

  const handleMouseLeave = useCallback(() => {
    dispatch({ type: 'SET_TOOLTIP', payload: null });
  }, [dispatch]);

  if (!geoData) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-[#00d4ff] animate-pulse-neon text-lg">Loading US Map...</div>
      </div>
    );
  }

  return (
    <ComposableMap
      projection="geoAlbersUsa"
      projectionConfig={{ scale: 1000 }}
      className="w-full h-full"
      style={{ background: 'transparent' }}
    >
      <ZoomableGroup>
        <Geographies geography={geoData}>
          {({ geographies }) =>
            geographies.map((geo) => {
              const fips = String(geo.id).padStart(2, '0');
              const stateData = dataset?.stateData[fips];
              const fillColor = stateData
                ? getRegionColor(stateData.value, min, max, gradient)
                : '#151d30';

              return (
                <Geography
                  key={geo.rsmKey}
                  geography={geo}
                  className="geo-region"
                  onClick={() => handleStateClick(geo)}
                  onMouseMove={(e) => handleMouseMove(geo, e as unknown as MouseEvent)}
                  onMouseLeave={handleMouseLeave}
                  style={{
                    default: {
                      fill: fillColor,
                      stroke: '#00d4ff25',
                      strokeWidth: 0.75,
                      outline: 'none',
                    },
                    hover: {
                      fill: fillColor,
                      stroke: '#00d4ff',
                      strokeWidth: 1.5,
                      outline: 'none',
                      filter: 'brightness(1.4)',
                    },
                    pressed: {
                      fill: '#00d4ff60',
                      stroke: '#00d4ff',
                      strokeWidth: 2,
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
