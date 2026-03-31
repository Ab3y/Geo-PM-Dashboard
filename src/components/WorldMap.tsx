import { useState, useEffect, useMemo, useCallback, type MouseEvent } from 'react';
import {
  ComposableMap,
  Geographies,
  Geography,
  ZoomableGroup,
} from 'react-simple-maps';
import { useAppDispatch } from '../context/AppContext';
import { MAP_URLS } from '../constants';

export default function WorldMap() {
  const dispatch = useAppDispatch();
  const [geoData, setGeoData] = useState<any>(null);
  const [hoveredId, setHoveredId] = useState<string | null>(null);

  useEffect(() => {
    fetch(MAP_URLS.world)
      .then(r => r.json())
      .then(setGeoData)
      .catch(console.error);
  }, []);

  const handleCountryClick = useCallback(
    (geo: any) => {
      const name: string = geo.properties.name;
      if (name === 'United States of America' || name === 'United States') {
        dispatch({ type: 'DRILL_TO_US' });
      }
    },
    [dispatch],
  );

  const handleMouseEnter = useCallback(
    (geo: any, e: MouseEvent) => {
      setHoveredId(geo.rsmKey);
      dispatch({
        type: 'SET_TOOLTIP',
        payload: {
          name: geo.properties.name,
          x: e.clientX,
          y: e.clientY,
          extra: {
            'Click': geo.properties.name === 'United States of America' ? 'Drill into US' : 'Coming soon',
          },
        },
      });
    },
    [dispatch],
  );

  const handleMouseLeave = useCallback(() => {
    setHoveredId(null);
    dispatch({ type: 'SET_TOOLTIP', payload: null });
  }, [dispatch]);

  const projection = useMemo(
    () => ({
      rotate: [-10, 0, 0] as [number, number, number],
      scale: 147,
    }),
    [],
  );

  if (!geoData) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-[#00d4ff] animate-pulse-neon text-lg">Loading World Map...</div>
      </div>
    );
  }

  return (
    <ComposableMap
      projection="geoEqualEarth"
      projectionConfig={projection}
      className="w-full h-full"
      style={{ background: 'transparent' }}
    >
      <ZoomableGroup>
        <Geographies geography={geoData}>
          {({ geographies }) =>
            geographies.map((geo) => {
              const isUS =
                geo.properties.name === 'United States of America' ||
                geo.properties.name === 'United States';
              const isHovered = hoveredId === geo.rsmKey;

              return (
                <Geography
                  key={geo.rsmKey}
                  geography={geo}
                  className="geo-region"
                  onClick={() => handleCountryClick(geo)}
                  onMouseEnter={(e) => handleMouseEnter(geo, e as unknown as MouseEvent)}
                  onMouseMove={(e) => {
                    const me = e as unknown as MouseEvent;
                    dispatch({
                      type: 'SET_TOOLTIP',
                      payload: {
                        name: geo.properties.name,
                        x: me.clientX,
                        y: me.clientY,
                        extra: {
                          'Click': isUS ? 'Drill into US' : 'Coming soon',
                        },
                      },
                    });
                  }}
                  onMouseLeave={handleMouseLeave}
                  style={{
                    default: {
                      fill: isUS
                        ? '#00d4ff30'
                        : isHovered
                        ? '#00d4ff40'
                        : '#151d30',
                      stroke: '#00d4ff20',
                      strokeWidth: 0.5,
                      outline: 'none',
                    },
                    hover: {
                      fill: isUS ? '#00d4ff50' : '#00d4ff30',
                      stroke: '#00d4ff',
                      strokeWidth: 1,
                      outline: 'none',
                    },
                    pressed: {
                      fill: '#00d4ff60',
                      stroke: '#00d4ff',
                      strokeWidth: 1.5,
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
