import { useEffect, useRef, useCallback } from 'react';
import { useAppDispatch } from '../context/AppContext';

export default function GlobeView() {
  const containerRef = useRef<HTMLDivElement>(null);
  const globeRef = useRef<any>(null);
  const dispatch = useAppDispatch();

  const initGlobe = useCallback(async () => {
    if (!containerRef.current) return;

    const Globe = (await import('globe.gl')).default;

    const worldRes = await fetch('https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json');
    const worldData = await worldRes.json();

    const { feature } = await import('topojson-client');
    const countries = feature(worldData, worldData.objects.countries);

    const globe = new Globe(containerRef.current)
      .backgroundColor('rgba(0,0,0,0)')
      .showAtmosphere(true)
      .atmosphereColor('#00d4ff')
      .atmosphereAltitude(0.25)
      .polygonsData((countries as any).features)
      .polygonCapColor((d: any) => {
        const name = d.properties?.name;
        if (name === 'United States of America' || name === 'United States') {
          return '#00d4ff30';
        }
        return '#151d30';
      })
      .polygonSideColor(() => '#00d4ff10')
      .polygonStrokeColor(() => '#00d4ff30')
      .polygonAltitude(0.01)
      .polygonLabel((d: any) => {
        const name = d.properties?.name || 'Unknown';
        return `
          <div style="
            background: rgba(15,21,37,0.95);
            border: 1px solid #00d4ff;
            border-radius: 8px;
            padding: 8px 12px;
            color: #00d4ff;
            font-family: Inter, sans-serif;
            font-size: 13px;
            box-shadow: 0 0 15px rgba(0,212,255,0.3);
          ">
            <b>${name}</b>
            ${name === 'United States of America' ? '<br/><span style="color:#888;font-size:11px">Click to drill down</span>' : ''}
          </div>
        `;
      })
      .onPolygonClick((d: any) => {
        const name = d.properties?.name;
        if (name === 'United States of America' || name === 'United States') {
          dispatch({ type: 'SET_VIEW_MODE', payload: '2d' });
          dispatch({ type: 'DRILL_TO_US' });
        }
      })
      .onPolygonHover((hovered: any) => {
        if (containerRef.current) {
          containerRef.current.style.cursor = hovered ? 'pointer' : 'default';
        }
        globe.polygonCapColor((d: any) => {
          if (d === hovered) return '#00d4ff50';
          const name = d.properties?.name;
          if (name === 'United States of America') return '#00d4ff30';
          return '#151d30';
        });
      });

    globe.controls().autoRotate = true;
    globe.controls().autoRotateSpeed = 0.5;
    globe.controls().enableZoom = true;

    globeRef.current = globe;

    const handleResize = () => {
      if (containerRef.current && globeRef.current) {
        globeRef.current.width(containerRef.current.clientWidth);
        globeRef.current.height(containerRef.current.clientHeight);
      }
    };
    window.addEventListener('resize', handleResize);
    handleResize();

    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, [dispatch]);

  useEffect(() => {
    let cleanup: (() => void) | undefined;
    initGlobe().then(c => { cleanup = c; });
    return () => {
      cleanup?.();
      if (containerRef.current) {
        containerRef.current.innerHTML = '';
      }
    };
  }, [initGlobe]);

  return (
    <div
      ref={containerRef}
      className="w-full h-full"
      style={{ background: 'radial-gradient(ellipse at center, #0a1628 0%, #050a12 100%)' }}
    />
  );
}
