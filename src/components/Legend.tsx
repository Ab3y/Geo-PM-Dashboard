import { useAppState } from '../context/AppContext';
import { generateGradientStops } from '../utils/colors';
import { useMemo } from 'react';

export default function Legend() {
  const { activeDataset, datasets, gradient } = useAppState();

  const dataset = datasets.find(d => d.id === activeDataset);

  const { min, max } = useMemo(() => {
    if (!dataset) return { min: 0, max: 0 };
    const values = Object.values(dataset.stateData).map(d => d.value);
    return { min: Math.min(...values), max: Math.max(...values) };
  }, [dataset]);

  const stops = useMemo(() => generateGradientStops(gradient, 10), [gradient]);

  if (!dataset) return null;

  const formatVal = (v: number) => {
    if (v >= 1_000_000) return `${(v / 1_000_000).toFixed(1)}M`;
    if (v >= 1_000) return `${(v / 1_000).toFixed(0)}K`;
    return v.toFixed(1);
  };

  return (
    <div className="absolute bottom-4 right-4 bg-[#0f1525cc] backdrop-blur-md border border-[#00d4ff20] rounded-xl p-4 min-w-[200px]">
      <div className="text-[10px] uppercase tracking-widest text-gray-500 mb-2 font-semibold">
        {dataset.name}
      </div>
      <div
        className="h-3 rounded-full mb-2"
        style={{
          background: `linear-gradient(to right, ${stops.join(', ')})`,
        }}
      />
      <div className="flex justify-between text-[10px] text-gray-400">
        <span>{formatVal(min)}</span>
        <span className="text-gray-500">{dataset.unit}</span>
        <span>{formatVal(max)}</span>
      </div>
    </div>
  );
}
