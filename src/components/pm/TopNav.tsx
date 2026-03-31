import { useRef, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  Columns3,
  List,
  Timer,
  Layers,
  Zap,
  Download,
  Upload,
  MoreVertical,
} from 'lucide-react';
import { useCurrentPersona } from '../../context/PersonaContext';
import { usePMState, usePMDispatch } from '../../context/PMContext';
import PersonaSelector from './PersonaSelector';

interface NavTab {
  path: string;
  label: string;
  icon: React.ComponentType<{ size?: number; className?: string }>;
}

const ALL_TABS: NavTab[] = [
  { path: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { path: '/kanban', label: 'Kanban', icon: Columns3 },
  { path: '/backlog', label: 'Backlog', icon: List },
  { path: '/sprint-planning', label: 'Sprints', icon: Timer },
  { path: '/pmp', label: 'PMP', icon: Layers },
];

export default function TopNav() {
  const location = useLocation();
  const navigate = useNavigate();
  const { config } = useCurrentPersona();
  const pmState = usePMState();
  const dispatch = usePMDispatch();
  const [menuOpen, setMenuOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const visibleTabs = ALL_TABS.filter(tab => config.visibleViews.includes(tab.path));

  const handleExport = () => {
    const exportData = {
      version: 1,
      exportedAt: new Date().toISOString(),
      stories: pmState.stories,
      sprints: pmState.sprints,
    };
    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `abeops-export-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
    setMenuOpen(false);
  };

  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const data = JSON.parse(reader.result as string);
        if (data.stories && data.sprints) {
          dispatch({ type: 'LOAD_STATE', payload: { stories: data.stories, sprints: data.sprints, pokerSession: null } });
        }
      } catch { /* ignore invalid files */ }
    };
    reader.readAsText(file);
    e.target.value = '';
    setMenuOpen(false);
  };

  return (
    <header className="h-14 shrink-0 flex items-center justify-between px-4 bg-[#0c1220] border-b border-white/5 z-40">
      {/* Left: Logo + Tabs */}
      <div className="flex items-center gap-6 min-w-0">
        {/* Logo */}
        <button
          onClick={() => navigate(config.defaultView)}
          className="flex items-center gap-2 shrink-0 cursor-pointer"
        >
          <Zap size={20} className="text-[#00d4ff]" />
          <span className="text-base font-bold text-white tracking-tight">
            Abe<span className="text-[#00d4ff]">Ops</span>
          </span>
        </button>

        {/* Navigation Tabs */}
        <nav className="flex items-center gap-1 overflow-x-auto">
          {visibleTabs.map(tab => {
            const isActive = location.pathname === tab.path;
            const Icon = tab.icon;
            return (
              <button
                key={tab.path}
                onClick={() => navigate(tab.path)}
                className={`relative flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-colors cursor-pointer whitespace-nowrap
                  ${isActive
                    ? 'text-[#00d4ff] bg-[#00d4ff]/10'
                    : 'text-gray-400 hover:text-white hover:bg-white/5'
                  }`}
              >
                <Icon size={16} />
                <span className="hidden md:inline">{tab.label}</span>
                {/* Active underline accent */}
                {isActive && (
                  <span className="absolute bottom-0 left-2 right-2 h-0.5 bg-[#00d4ff] rounded-full" />
                )}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Right: Data Menu + Persona Selector */}
      <div className="flex items-center gap-2 shrink-0 ml-4">
        {/* Data Menu */}
        <div className="relative">
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="flex items-center gap-1 px-2 py-1.5 rounded-lg text-gray-400 hover:text-white hover:bg-white/5 transition-colors cursor-pointer"
            title="Data options"
          >
            <MoreVertical size={16} />
          </button>
          {menuOpen && (
            <>
              <div className="fixed inset-0 z-50" onClick={() => setMenuOpen(false)} />
              <div className="absolute right-0 top-full mt-1 w-48 bg-[#0f1a2e] border border-white/10 rounded-lg shadow-xl z-50 py-1">
                <button
                  onClick={handleExport}
                  className="w-full flex items-center gap-2 px-3 py-2 text-sm text-gray-300 hover:text-white hover:bg-white/5 cursor-pointer"
                >
                  <Download size={14} />
                  Export Data (JSON)
                </button>
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full flex items-center gap-2 px-3 py-2 text-sm text-gray-300 hover:text-white hover:bg-white/5 cursor-pointer"
                >
                  <Upload size={14} />
                  Import Data
                </button>
              </div>
            </>
          )}
          <input
            ref={fileInputRef}
            type="file"
            accept=".json"
            onChange={handleImport}
            className="hidden"
          />
        </div>
        <PersonaSelector />
      </div>
    </header>
  );
}
