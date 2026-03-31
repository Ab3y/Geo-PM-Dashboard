import { useState, useMemo } from 'react';
import {
  Rocket,
  Map,
  Play,
  Activity,
  CheckCircle,
  Layers,
  Focus,
  Calendar,
  DollarSign,
  Award,
  Users,
  MessageSquare,
  AlertTriangle,
  ShoppingCart,
  UserCheck,
  ChevronRight,
  TrendingUp,
  TrendingDown,
  BarChart3,
  ListChecks,
  Loader2,
  Ban,
} from 'lucide-react';
import { usePMState } from '../../context/PMContext';
import { PMP_PROCESS_GROUPS, PMP_KNOWLEDGE_AREAS } from '../../constants/pm';
import type { PmpProcessGroup, PmpKnowledgeArea } from '../../types/pm';

const ICON_MAP: Record<string, React.ComponentType<{ size?: number; className?: string; style?: React.CSSProperties }>> = {
  Rocket, Map, Play, Activity, CheckCircle,
  Layers, Focus, Calendar, DollarSign, Award,
  Users, MessageSquare, AlertTriangle, ShoppingCart, UserCheck,
};

function getIcon(name: string) {
  return ICON_MAP[name] ?? Layers;
}

export default function PMPDashboard() {
  const { stories, sprints } = usePMState();
  const [selectedProcessGroup, setSelectedProcessGroup] = useState<PmpProcessGroup | null>(null);

  // Derive filtered stories
  const filteredStories = useMemo(() => {
    if (!selectedProcessGroup) return stories;
    return stories.filter(s => s.processGroup === selectedProcessGroup);
  }, [stories, selectedProcessGroup]);

  // Health summary stats
  const healthStats = useMemo(() => {
    const total = stories.length;
    const completed = stories.filter(s => s.status === 'done').length;
    const inProgress = stories.filter(s => s.status === 'in-progress').length;
    const blocked = stories.filter(s => s.status === 'review' || s.status === 'testing').length;
    const totalPoints = stories.reduce((sum, s) => sum + (s.storyPoints ?? 0), 0);
    const completedPoints = stories.filter(s => s.status === 'done').reduce((sum, s) => sum + (s.storyPoints ?? 0), 0);

    // Velocity trend from sprints
    const completedSprints = sprints.filter(s => s.status === 'completed' && s.velocity !== null);
    let velocityTrend: 'up' | 'down' | 'neutral' = 'neutral';
    if (completedSprints.length >= 2) {
      const last = completedSprints[completedSprints.length - 1].velocity!;
      const prev = completedSprints[completedSprints.length - 2].velocity!;
      velocityTrend = last > prev ? 'up' : last < prev ? 'down' : 'neutral';
    }
    const latestVelocity = completedSprints.length > 0
      ? completedSprints[completedSprints.length - 1].velocity!
      : 0;

    return { total, completed, inProgress, blocked, totalPoints, completedPoints, velocityTrend, latestVelocity };
  }, [stories, sprints]);

  // Process group counts
  const processGroupCounts = useMemo(() => {
    const counts: Record<PmpProcessGroup, { total: number; inProgress: number }> = {
      initiating: { total: 0, inProgress: 0 },
      planning: { total: 0, inProgress: 0 },
      executing: { total: 0, inProgress: 0 },
      'monitoring-controlling': { total: 0, inProgress: 0 },
      closing: { total: 0, inProgress: 0 },
    };
    for (const story of stories) {
      if (story.processGroup && counts[story.processGroup]) {
        counts[story.processGroup].total++;
        if (story.status === 'in-progress') {
          counts[story.processGroup].inProgress++;
        }
      }
    }
    return counts;
  }, [stories]);

  // Find the most active process group (most in-progress)
  const activeProcessGroup = useMemo(() => {
    let maxInProgress = 0;
    let activeGroup: PmpProcessGroup = 'executing';
    for (const [group, data] of Object.entries(processGroupCounts)) {
      if (data.inProgress > maxInProgress) {
        maxInProgress = data.inProgress;
        activeGroup = group as PmpProcessGroup;
      }
    }
    return activeGroup;
  }, [processGroupCounts]);

  // Knowledge area stats
  const knowledgeAreaStats = useMemo(() => {
    const stats: Record<PmpKnowledgeArea, { total: number; done: number; inProgress: number }> = {
      integration: { total: 0, done: 0, inProgress: 0 },
      scope: { total: 0, done: 0, inProgress: 0 },
      schedule: { total: 0, done: 0, inProgress: 0 },
      cost: { total: 0, done: 0, inProgress: 0 },
      quality: { total: 0, done: 0, inProgress: 0 },
      resource: { total: 0, done: 0, inProgress: 0 },
      communications: { total: 0, done: 0, inProgress: 0 },
      risk: { total: 0, done: 0, inProgress: 0 },
      procurement: { total: 0, done: 0, inProgress: 0 },
      stakeholder: { total: 0, done: 0, inProgress: 0 },
    };
    const src = selectedProcessGroup ? filteredStories : stories;
    for (const story of src) {
      if (story.knowledgeArea && stats[story.knowledgeArea]) {
        stats[story.knowledgeArea].total++;
        if (story.status === 'done') stats[story.knowledgeArea].done++;
        if (story.status === 'in-progress') stats[story.knowledgeArea].inProgress++;
      }
    }
    return stats;
  }, [stories, filteredStories, selectedProcessGroup]);

  // Matrix data: knowledge area × process group
  const matrixData = useMemo(() => {
    const matrix: Record<PmpKnowledgeArea, Record<PmpProcessGroup, number>> = {} as typeof matrix;
    for (const ka of PMP_KNOWLEDGE_AREAS) {
      matrix[ka.id] = {
        initiating: 0,
        planning: 0,
        executing: 0,
        'monitoring-controlling': 0,
        closing: 0,
      };
    }
    for (const story of stories) {
      if (story.knowledgeArea && story.processGroup && matrix[story.knowledgeArea]) {
        matrix[story.knowledgeArea][story.processGroup]++;
      }
    }
    return matrix;
  }, [stories]);

  const maxMatrixValue = useMemo(() => {
    let max = 1;
    for (const ka of PMP_KNOWLEDGE_AREAS) {
      for (const pg of PMP_PROCESS_GROUPS) {
        const v = matrixData[ka.id]?.[pg.id] ?? 0;
        if (v > max) max = v;
      }
    }
    return max;
  }, [matrixData]);

  // Burndown: simple bar-chart representation
  const burndownBars = useMemo(() => {
    const statuses: { label: string; count: number; color: string }[] = [
      { label: 'Backlog', count: stories.filter(s => s.status === 'backlog').length, color: '#6b7280' },
      { label: 'To Do', count: stories.filter(s => s.status === 'todo').length, color: '#3b82f6' },
      { label: 'In Prog', count: stories.filter(s => s.status === 'in-progress').length, color: '#f59e0b' },
      { label: 'Review', count: stories.filter(s => s.status === 'review').length, color: '#8b5cf6' },
      { label: 'Test', count: stories.filter(s => s.status === 'testing').length, color: '#ec4899' },
      { label: 'Done', count: stories.filter(s => s.status === 'done').length, color: '#10b981' },
    ];
    const maxCount = Math.max(1, ...statuses.map(s => s.count));
    return statuses.map(s => ({ ...s, pct: (s.count / maxCount) * 100 }));
  }, [stories]);

  function getHealthColor(total: number, done: number, inProgress: number): string {
    if (total === 0) return '#6b7280';
    const progress = done / total;
    if (progress >= 0.7 || (total <= 2 && done > 0)) return '#10b981';
    if (inProgress > 0 || progress >= 0.3) return '#eab308';
    return '#ef4444';
  }

  return (
    <div className="flex-1 overflow-y-auto p-6 space-y-6">
      {/* Top Row: Health Summary + Mini Burndown */}
      <div className="grid grid-cols-2 lg:grid-cols-6 gap-4">
        <HealthCard icon={<ListChecks size={20} />} label="Total Stories" value={healthStats.total} color="#00d4ff" />
        <HealthCard icon={<CheckCircle size={20} />} label="Completed" value={healthStats.completed} color="#10b981" />
        <HealthCard icon={<Loader2 size={20} />} label="In Progress" value={healthStats.inProgress} color="#f59e0b" />
        <HealthCard icon={<Ban size={20} />} label="Blocked / Review" value={healthStats.blocked} color="#ef4444" />
        <div className="bg-[#0f1525] border border-white/5 rounded-xl p-4 flex items-center gap-3">
          {healthStats.velocityTrend === 'up' ? (
            <TrendingUp size={20} className="text-emerald-400" />
          ) : healthStats.velocityTrend === 'down' ? (
            <TrendingDown size={20} className="text-red-400" />
          ) : (
            <BarChart3 size={20} className="text-gray-400" />
          )}
          <div>
            <p className="text-xs text-gray-500 uppercase tracking-wider">Velocity</p>
            <p className="text-lg font-bold text-white">{healthStats.latestVelocity} pts</p>
          </div>
        </div>
        {/* Mini burndown */}
        <div className="bg-[#0f1525] border border-white/5 rounded-xl p-4">
          <p className="text-xs text-gray-500 uppercase tracking-wider mb-2">Distribution</p>
          <div className="flex items-end gap-1 h-8">
            {burndownBars.map(bar => (
              <div key={bar.label} className="flex-1 flex flex-col items-center">
                <div
                  className="w-full rounded-sm min-h-[2px] transition-all"
                  style={{ height: `${bar.pct}%`, backgroundColor: bar.color }}
                  title={`${bar.label}: ${bar.count}`}
                />
              </div>
            ))}
          </div>
          <div className="flex gap-1 mt-1">
            {burndownBars.map(bar => (
              <span key={bar.label} className="flex-1 text-[8px] text-gray-600 text-center truncate">
                {bar.label}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Process Groups Pipeline */}
      <section>
        <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-3">
          Process Groups Pipeline
        </h2>
        <div className="flex items-center gap-0 overflow-x-auto pb-2">
          {PMP_PROCESS_GROUPS.map((pg, idx) => {
            const count = processGroupCounts[pg.id];
            const isActive = pg.id === activeProcessGroup;
            const isSelected = pg.id === selectedProcessGroup;
            const Icon = getIcon(pg.icon);
            return (
              <div key={pg.id} className="flex items-center shrink-0">
                <button
                  onClick={() => setSelectedProcessGroup(isSelected ? null : pg.id)}
                  className={`relative rounded-xl px-5 py-4 min-w-[160px] border transition-all duration-300 cursor-pointer
                    ${isSelected
                      ? 'border-[#00d4ff] bg-[#00d4ff]/10'
                      : isActive
                        ? 'border-white/20 bg-[#0f1525]'
                        : 'border-white/5 bg-[#0f1525] hover:border-white/15'
                    }`}
                  style={isActive && !isSelected ? { boxShadow: `0 0 20px ${pg.color}25` } : undefined}
                >
                  {isActive && (
                    <span
                      className="absolute -top-1 -right-1 w-3 h-3 rounded-full animate-pulse"
                      style={{ backgroundColor: pg.color }}
                    />
                  )}
                  <div className="flex items-center gap-2 mb-2">
                    <Icon size={18} style={{ color: pg.color }} />
                    <span className="text-sm font-semibold text-white">{pg.label}</span>
                  </div>
                  <p className="text-xs text-gray-500 mb-2 line-clamp-2">{pg.description}</p>
                  <div className="flex items-center justify-between">
                    <span className="text-lg font-bold" style={{ color: pg.color }}>
                      {count.total}
                    </span>
                    <span className="text-[10px] text-gray-500">
                      {count.inProgress} active
                    </span>
                  </div>
                </button>
                {idx < PMP_PROCESS_GROUPS.length - 1 && (
                  <ChevronRight size={16} className="text-gray-600 mx-1 shrink-0" />
                )}
              </div>
            );
          })}
        </div>
        {selectedProcessGroup && (
          <div className="mt-2 flex items-center gap-2">
            <span className="text-xs text-gray-500">
              Filtered by: <strong className="text-[#00d4ff]">
                {PMP_PROCESS_GROUPS.find(p => p.id === selectedProcessGroup)?.label}
              </strong>
            </span>
            <button
              onClick={() => setSelectedProcessGroup(null)}
              className="text-xs text-gray-500 hover:text-white underline cursor-pointer"
            >
              Clear
            </button>
          </div>
        )}
      </section>

      {/* Knowledge Areas Grid */}
      <section>
        <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-3">
          Knowledge Areas
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
          {PMP_KNOWLEDGE_AREAS.map(ka => {
            const stats = knowledgeAreaStats[ka.id];
            const Icon = getIcon(ka.icon);
            const healthColor = getHealthColor(stats.total, stats.done, stats.inProgress);
            const progress = stats.total > 0 ? (stats.done / stats.total) * 100 : 0;

            return (
              <div
                key={ka.id}
                className="bg-[#0f1525] border border-white/5 rounded-xl p-4 hover:border-white/15 transition-all"
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <Icon size={16} className="text-gray-400" />
                    <h3 className="text-sm font-medium text-white">{ka.label}</h3>
                  </div>
                  <span
                    className="w-2.5 h-2.5 rounded-full shrink-0 mt-1"
                    style={{ backgroundColor: healthColor }}
                    title={healthColor === '#10b981' ? 'On track' : healthColor === '#eab308' ? 'Needs attention' : healthColor === '#ef4444' ? 'At risk' : 'No data'}
                  />
                </div>
                <p className="text-xs text-gray-500 mb-3 line-clamp-2">{ka.description}</p>
                <div className="flex items-center justify-between text-xs text-gray-400 mb-1.5">
                  <span>{stats.done}/{stats.total} done</span>
                  <span>{Math.round(progress)}%</span>
                </div>
                <div className="w-full h-1.5 bg-white/5 rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-500"
                    style={{ width: `${progress}%`, backgroundColor: healthColor }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Process-Knowledge Matrix */}
      <section>
        <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-3">
          Process-Knowledge Matrix
        </h2>
        <div className="bg-[#0f1525] border border-white/5 rounded-xl overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr>
                <th className="text-left px-4 py-3 text-gray-500 font-medium border-b border-white/5 min-w-[180px]">
                  Knowledge Area
                </th>
                {PMP_PROCESS_GROUPS.map(pg => (
                  <th
                    key={pg.id}
                    className="text-center px-3 py-3 font-medium border-b border-white/5 min-w-[100px]"
                    style={{ color: pg.color }}
                  >
                    {pg.label}
                  </th>
                ))}
                <th className="text-center px-3 py-3 text-gray-500 font-medium border-b border-white/5">
                  Total
                </th>
              </tr>
            </thead>
            <tbody>
              {PMP_KNOWLEDGE_AREAS.map((ka, kaIdx) => {
                const rowTotal = PMP_PROCESS_GROUPS.reduce(
                  (sum, pg) => sum + (matrixData[ka.id]?.[pg.id] ?? 0),
                  0
                );
                return (
                  <tr
                    key={ka.id}
                    className={kaIdx % 2 === 0 ? 'bg-transparent' : 'bg-white/[0.02]'}
                  >
                    <td className="px-4 py-2.5 text-gray-300 border-b border-white/5">
                      <div className="flex items-center gap-2">
                        {(() => { const I = getIcon(ka.icon); return <I size={14} className="text-gray-500" />; })()}
                        {ka.label}
                      </div>
                    </td>
                    {PMP_PROCESS_GROUPS.map(pg => {
                      const value = matrixData[ka.id]?.[pg.id] ?? 0;
                      const intensity = value > 0 ? 0.15 + (value / maxMatrixValue) * 0.6 : 0;
                      return (
                        <td
                          key={pg.id}
                          className="text-center px-3 py-2.5 border-b border-white/5"
                        >
                          {value > 0 ? (
                            <span
                              className="inline-flex items-center justify-center w-8 h-8 rounded-lg text-white font-semibold text-sm"
                              style={{ backgroundColor: `${pg.color}${Math.round(intensity * 255).toString(16).padStart(2, '0')}` }}
                            >
                              {value}
                            </span>
                          ) : (
                            <span className="text-gray-700">—</span>
                          )}
                        </td>
                      );
                    })}
                    <td className="text-center px-3 py-2.5 border-b border-white/5 text-gray-400 font-semibold">
                      {rowTotal}
                    </td>
                  </tr>
                );
              })}
              {/* Totals row */}
              <tr className="bg-white/[0.03]">
                <td className="px-4 py-2.5 text-gray-400 font-semibold">Total</td>
                {PMP_PROCESS_GROUPS.map(pg => {
                  const colTotal = PMP_KNOWLEDGE_AREAS.reduce(
                    (sum, ka) => sum + (matrixData[ka.id]?.[pg.id] ?? 0),
                    0
                  );
                  return (
                    <td key={pg.id} className="text-center px-3 py-2.5 font-semibold" style={{ color: pg.color }}>
                      {colTotal}
                    </td>
                  );
                })}
                <td className="text-center px-3 py-2.5 text-[#00d4ff] font-bold">
                  {stories.filter(s => s.processGroup && s.knowledgeArea).length}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}

function HealthCard({
  icon,
  label,
  value,
  color,
}: {
  icon: React.ReactNode;
  label: string;
  value: number;
  color: string;
}) {
  return (
    <div className="bg-[#0f1525] border border-white/5 rounded-xl p-4 flex items-center gap-3">
      <div style={{ color }}>{icon}</div>
      <div>
        <p className="text-xs text-gray-500 uppercase tracking-wider">{label}</p>
        <p className="text-lg font-bold text-white">{value}</p>
      </div>
    </div>
  );
}
