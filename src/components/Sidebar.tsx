import { useAppState, useAppDispatch } from '../context/AppContext';
import { NEWS_CATEGORIES, PRESET_GRADIENTS } from '../constants';
import DataUploader from './DataUploader';
import type { DataCategory, GradientConfig } from '../types';

export default function Sidebar() {
  const state = useAppState();
  const dispatch = useAppDispatch();
  const { sidebarOpen, viewMode, activeDataset, activeCategory, datasets, gradient } = state;

  const filteredDatasets = activeCategory === 'all'
    ? datasets
    : datasets.filter(d => d.category === activeCategory);

  return (
    <>
      {/* Toggle button */}
      <button
        onClick={() => dispatch({ type: 'TOGGLE_SIDEBAR' })}
        className="fixed top-4 z-50 bg-[#0c1220] border border-[#00d4ff30] rounded-r-lg
                   px-2 py-3 text-[#00d4ff] hover:bg-[#151d30] transition-all"
        style={{ left: sidebarOpen ? 268 : 0 }}
      >
        {sidebarOpen ? '◀' : '▶'}
      </button>

      {/* Sidebar panel */}
      <aside
        className="sidebar fixed top-0 left-0 h-full z-40 overflow-y-auto transition-transform duration-300"
        style={{
          width: 280,
          transform: sidebarOpen ? 'translateX(0)' : 'translateX(-100%)',
        }}
      >
        <div className="p-5">
          {/* Logo */}
          <div className="flex items-center gap-3 mb-8">
            <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-[#00d4ff] to-[#0066ff] flex items-center justify-center text-lg">
              🌐
            </div>
            <div>
              <h1 className="text-sm font-semibold text-white tracking-wide">GeoIntel</h1>
              <p className="text-[10px] text-gray-500 tracking-widest uppercase">Dashboard</p>
            </div>
          </div>

          {/* View Mode Toggle */}
          <Section title="View Mode">
            <div className="flex gap-2">
              <ToggleButton
                active={viewMode === '2d'}
                onClick={() => dispatch({ type: 'SET_VIEW_MODE', payload: '2d' })}
                label="2D Flat"
              />
              <ToggleButton
                active={viewMode === '3d'}
                onClick={() => dispatch({ type: 'SET_VIEW_MODE', payload: '3d' })}
                label="3D Globe"
              />
            </div>
          </Section>

          {/* Category Slicer */}
          <Section title="News Categories">
            <button
              onClick={() => dispatch({ type: 'SET_CATEGORY', payload: 'all' })}
              className={`w-full text-left px-3 py-2 rounded-lg text-xs mb-1 transition-all ${
                activeCategory === 'all'
                  ? 'bg-[#00d4ff15] text-[#00d4ff] border border-[#00d4ff40]'
                  : 'text-gray-400 hover:bg-[#151d30] hover:text-gray-200'
              }`}
            >
              📋 All Categories
            </button>
            {NEWS_CATEGORIES.map(cat => (
              <button
                key={cat.id}
                onClick={() => dispatch({ type: 'SET_CATEGORY', payload: cat.id as DataCategory })}
                className={`w-full text-left px-3 py-2 rounded-lg text-xs mb-1 transition-all ${
                  activeCategory === cat.id
                    ? 'bg-[#00d4ff15] text-[#00d4ff] border border-[#00d4ff40]'
                    : 'text-gray-400 hover:bg-[#151d30] hover:text-gray-200'
                }`}
              >
                {cat.icon} {cat.label}
              </button>
            ))}
          </Section>

          {/* Dataset Selector */}
          <Section title="Datasets">
            <button
              onClick={() => dispatch({ type: 'SET_ACTIVE_DATASET', payload: null })}
              className={`w-full text-left px-3 py-2 rounded-lg text-xs mb-1 transition-all ${
                activeDataset === null
                  ? 'bg-[#00d4ff15] text-[#00d4ff] border border-[#00d4ff40]'
                  : 'text-gray-400 hover:bg-[#151d30]'
              }`}
            >
              None (empty map)
            </button>
            {filteredDatasets.map(ds => (
              <button
                key={ds.id}
                onClick={() => dispatch({ type: 'SET_ACTIVE_DATASET', payload: ds.id })}
                className={`w-full text-left px-3 py-2 rounded-lg text-xs mb-1 transition-all ${
                  activeDataset === ds.id
                    ? 'bg-[#00d4ff15] text-[#00d4ff] border border-[#00d4ff40]'
                    : 'text-gray-400 hover:bg-[#151d30]'
                }`}
              >
                <div className="font-medium">{ds.name}</div>
                <div className="text-[10px] text-gray-500 mt-0.5">{ds.description}</div>
              </button>
            ))}
          </Section>

          {/* Gradient Customizer */}
          <Section title="Color Gradient">
            <div className="space-y-3">
              <div className="flex gap-2">
                <label className="flex-1">
                  <span className="text-[10px] text-gray-500 block mb-1">Low</span>
                  <input
                    type="color"
                    value={gradient.startColor}
                    onChange={e => dispatch({ type: 'SET_GRADIENT', payload: { ...gradient, startColor: e.target.value } })}
                    className="w-full h-8 rounded cursor-pointer bg-transparent border border-gray-700"
                  />
                </label>
                <label className="flex-1">
                  <span className="text-[10px] text-gray-500 block mb-1">High</span>
                  <input
                    type="color"
                    value={gradient.endColor}
                    onChange={e => dispatch({ type: 'SET_GRADIENT', payload: { ...gradient, endColor: e.target.value } })}
                    className="w-full h-8 rounded cursor-pointer bg-transparent border border-gray-700"
                  />
                </label>
              </div>
              <div
                className="h-3 rounded-full"
                style={{
                  background: `linear-gradient(to right, ${gradient.startColor}, ${gradient.endColor})`,
                }}
              />
              <div className="flex flex-wrap gap-1">
                {PRESET_GRADIENTS.map(preset => (
                  <button
                    key={preset.name}
                    onClick={() => dispatch({ type: 'SET_GRADIENT', payload: preset as GradientConfig })}
                    className="px-2 py-1 rounded text-[10px] text-gray-400 bg-[#151d30] hover:bg-[#1c2640] transition-colors"
                    title={preset.name}
                  >
                    <span
                      className="inline-block w-3 h-3 rounded-sm mr-1 align-middle"
                      style={{ background: `linear-gradient(135deg, ${preset.startColor}, ${preset.endColor})` }}
                    />
                    {preset.name}
                  </button>
                ))}
              </div>
            </div>
          </Section>

          {/* Upload */}
          <Section title="Upload Data">
            <DataUploader />
          </Section>
        </div>
      </aside>
    </>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="mb-6">
      <h3 className="text-[10px] uppercase tracking-widest text-gray-500 mb-3 font-semibold">{title}</h3>
      {children}
    </div>
  );
}

function ToggleButton({ active, onClick, label }: { active: boolean; onClick: () => void; label: string }) {
  return (
    <button
      onClick={onClick}
      className={`flex-1 py-2 px-3 rounded-lg text-xs font-medium transition-all ${
        active
          ? 'bg-[#00d4ff20] text-[#00d4ff] border border-[#00d4ff50] neon-glow'
          : 'bg-[#151d30] text-gray-400 border border-transparent hover:bg-[#1c2640]'
      }`}
    >
      {label}
    </button>
  );
}
