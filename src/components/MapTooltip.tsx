import { useAppState } from '../context/AppContext';

export default function MapTooltip() {
  const { tooltip } = useAppState();

  if (!tooltip) return null;

  return (
    <div
      className="map-tooltip"
      style={{ left: tooltip.x + 12, top: tooltip.y - 10 }}
    >
      <div className="font-semibold text-[#00d4ff] text-sm">{tooltip.name}</div>
      {tooltip.value !== undefined && (
        <div className="text-gray-300 text-xs mt-1">
          <span className="text-white font-medium">
            {typeof tooltip.value === 'number'
              ? tooltip.value.toLocaleString()
              : tooltip.value}
          </span>
          {tooltip.unit && <span className="text-gray-500 ml-1">{tooltip.unit}</span>}
        </div>
      )}
      {tooltip.extra && Object.entries(tooltip.extra).map(([key, val]) => (
        <div key={key} className="text-gray-400 text-[11px]">
          {key}: <span className="text-gray-200">{val}</span>
        </div>
      ))}
    </div>
  );
}
