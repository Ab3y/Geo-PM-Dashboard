import { useState, useMemo, useCallback } from 'react';
import {
  Calendar,
  Target,
  Plus,
  Play,
  CheckCircle,
  XCircle,
  ArrowRight,
  ArrowLeft,
  Gauge,
  TrendingUp,
  Clock,
  AlertOctagon,
  ArrowUp,
  Minus,
  ArrowDown,
  ChevronDown,
  Layers,
  ListChecks,
  BookOpen,
  Bug,
  CheckSquare,
  Zap,
  Search as SearchIcon,
  Users,
  X,
} from 'lucide-react';
import { usePMState, usePMDispatch } from '../../context/PMContext';
import type { Story, SprintStatus, Priority, StoryType } from '../../types/pm';
import { PRIORITY_CONFIG, STORY_TYPE_CONFIG } from '../../constants/pm';
import ScrumPoker from './ScrumPoker';

// ─── Constants ───────────────────────────────────────────────────────────────

const DEFAULT_PARTICIPANTS = ['You', 'Trinity', 'Neo', 'Tank', 'Morpheus', 'Dozer'];

const SPRINT_STATUS_CONFIG: Record<SprintStatus, { label: string; color: string; bg: string; border: string }> = {
  planning: { label: 'Planning', color: '#3b82f6', bg: 'bg-blue-500/10', border: 'border-blue-500/30' },
  active: { label: 'Active', color: '#22c55e', bg: 'bg-green-500/10', border: 'border-green-500/30' },
  review: { label: 'In Review', color: '#a855f7', bg: 'bg-purple-500/10', border: 'border-purple-500/30' },
  completed: { label: 'Completed', color: '#64748b', bg: 'bg-gray-500/10', border: 'border-gray-500/30' },
  cancelled: { label: 'Cancelled', color: '#ef4444', bg: 'bg-red-500/10', border: 'border-red-500/30' },
};

const PRIORITY_ICONS: Record<Priority, React.ElementType> = {
  critical: AlertOctagon,
  high: ArrowUp,
  medium: Minus,
  low: ArrowDown,
};

const TYPE_ICONS: Record<StoryType, React.ElementType> = {
  story: BookOpen,
  bug: Bug,
  task: CheckSquare,
  epic: Zap,
  spike: SearchIcon,
};

// ─── Sub-components ──────────────────────────────────────────────────────────

function StatusBadge({ status }: { status: SprintStatus }) {
  const cfg = SPRINT_STATUS_CONFIG[status];
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-wide border ${cfg.bg} ${cfg.border}`}
      style={{ color: cfg.color }}
    >
      <span className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: cfg.color }} />
      {cfg.label}
    </span>
  );
}

function PriorityBadge({ priority }: { priority: Priority }) {
  const config = PRIORITY_CONFIG[priority];
  const Icon = PRIORITY_ICONS[priority];
  return (
    <span
      className="inline-flex items-center gap-1 rounded px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide"
      style={{ color: config.color, backgroundColor: `${config.color}18` }}
    >
      <Icon size={10} />
      {config.label}
    </span>
  );
}

function StoryCard({
  story,
  action,
  onEstimate,
}: {
  story: Story;
  action?: { label: string; icon: React.ElementType; onClick: () => void; color?: string };
  onEstimate?: () => void;
}) {
  const TypeIcon = TYPE_ICONS[story.type] ?? BookOpen;
  const typeConfig = STORY_TYPE_CONFIG[story.type];

  return (
    <div className="group rounded-lg border border-white/5 bg-white/[0.02] p-3 transition hover:border-[#00d4ff]/20 hover:bg-white/[0.04]">
      <div className="mb-2 flex items-start justify-between gap-2">
        <div className="flex items-center gap-2">
          <TypeIcon size={14} style={{ color: typeConfig.color }} />
          <span className="text-sm font-medium text-gray-200 leading-snug">{story.title}</span>
        </div>
        {story.storyPoints !== null && (
          <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-[#1e293b] px-1 text-[10px] font-bold text-[#00d4ff]">
            {story.storyPoints}
          </span>
        )}
      </div>

      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <PriorityBadge priority={story.priority} />
          {story.assignee && (
            <span className="text-[10px] text-gray-500">{story.assignee}</span>
          )}
        </div>

        <div className="flex items-center gap-1 opacity-0 transition group-hover:opacity-100">
          {onEstimate && story.storyPoints === null && (
            <button
              onClick={onEstimate}
              className="rounded-md border border-[#00d4ff]/20 bg-[#00d4ff]/10 px-2 py-0.5 text-[10px] font-semibold text-[#00d4ff] transition hover:bg-[#00d4ff]/20"
            >
              Estimate
            </button>
          )}
          {action && (
            <button
              onClick={action.onClick}
              className="rounded-md border border-white/10 bg-white/5 p-1 text-gray-400 transition hover:border-[#00d4ff]/30 hover:text-[#00d4ff]"
              title={action.label}
            >
              <action.icon size={12} />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Sprint Creation Form ────────────────────────────────────────────────────

function SprintForm({ onClose }: { onClose: () => void }) {
  const dispatch = usePMDispatch();
  const [name, setName] = useState('');
  const [goal, setGoal] = useState('');
  const [startDate, setStartDate] = useState(new Date().toISOString().slice(0, 10));
  const [endDate, setEndDate] = useState(
    new Date(Date.now() + 14 * 86400000).toISOString().slice(0, 10),
  );

  const handleSubmit = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      if (!name.trim()) return;
      dispatch({
        type: 'ADD_SPRINT',
        payload: {
          name: name.trim(),
          goal: goal.trim(),
          startDate,
          endDate,
          status: 'planning',
          velocity: null,
          storyIds: [],
        },
      });
      onClose();
    },
    [dispatch, name, goal, startDate, endDate, onClose],
  );

  return (
    <form onSubmit={handleSubmit} className="rounded-xl border border-[#00d4ff]/20 bg-[#0d1320] p-5 space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-bold text-gray-100">New Sprint</h3>
        <button type="button" onClick={onClose} className="text-gray-500 hover:text-gray-300">
          <X size={16} />
        </button>
      </div>

      <div className="space-y-3">
        <div>
          <label className="mb-1 block text-[10px] uppercase tracking-wider text-gray-500">Sprint Name</label>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Sprint 3 — Feature Release"
            className="w-full rounded-lg border border-white/10 bg-[#151d30] px-3 py-2 text-sm text-gray-200 placeholder-gray-600 outline-none focus:border-[#00d4ff]/50"
            autoFocus
          />
        </div>
        <div>
          <label className="mb-1 block text-[10px] uppercase tracking-wider text-gray-500">Sprint Goal</label>
          <textarea
            value={goal}
            onChange={(e) => setGoal(e.target.value)}
            placeholder="What do we want to achieve?"
            rows={2}
            className="w-full rounded-lg border border-white/10 bg-[#151d30] px-3 py-2 text-sm text-gray-200 placeholder-gray-600 outline-none focus:border-[#00d4ff]/50 resize-none"
          />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="mb-1 block text-[10px] uppercase tracking-wider text-gray-500">Start Date</label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="w-full rounded-lg border border-white/10 bg-[#151d30] px-3 py-2 text-sm text-gray-200 outline-none focus:border-[#00d4ff]/50"
            />
          </div>
          <div>
            <label className="mb-1 block text-[10px] uppercase tracking-wider text-gray-500">End Date</label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="w-full rounded-lg border border-white/10 bg-[#151d30] px-3 py-2 text-sm text-gray-200 outline-none focus:border-[#00d4ff]/50"
            />
          </div>
        </div>
      </div>

      <div className="flex justify-end gap-2">
        <button
          type="button"
          onClick={onClose}
          className="rounded-lg border border-white/10 px-4 py-2 text-sm text-gray-400 transition hover:text-gray-200"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={!name.trim()}
          className="flex items-center gap-1.5 rounded-lg bg-[#00d4ff] px-4 py-2 text-sm font-bold text-[#0a0e17] transition hover:bg-[#00bde0] disabled:opacity-40"
        >
          <Plus size={14} />
          Create Sprint
        </button>
      </div>
    </form>
  );
}

// ─── Main Component ──────────────────────────────────────────────────────────

export default function SprintPlanning() {
  const { stories, sprints, pokerSession } = usePMState();
  const dispatch = usePMDispatch();

  const [selectedSprintId, setSelectedSprintId] = useState<string | null>(() =>
    sprints.length > 0 ? sprints[sprints.length - 1].id : null,
  );
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [backlogSearch, setBacklogSearch] = useState('');
  const [sprintBacklogSearch, setSprintBacklogSearch] = useState('');
  const [showPoker, setShowPoker] = useState(false);
  const [sprintListOpen, setSprintListOpen] = useState(false);

  const selectedSprint = useMemo(
    () => sprints.find((s) => s.id === selectedSprintId) ?? null,
    [sprints, selectedSprintId],
  );

  // Stories in this sprint
  const sprintStories = useMemo(() => {
    if (!selectedSprint) return [];
    return stories.filter((s) => selectedSprint.storyIds.includes(s.id));
  }, [stories, selectedSprint]);

  // Filtered sprint backlog
  const filteredSprintStories = useMemo(() => {
    if (!sprintBacklogSearch) return sprintStories;
    const q = sprintBacklogSearch.toLowerCase();
    return sprintStories.filter(
      (s) => s.title.toLowerCase().includes(q) || s.description.toLowerCase().includes(q),
    );
  }, [sprintStories, sprintBacklogSearch]);

  // Unassigned stories (product backlog)
  const backlogStories = useMemo(() => {
    const assignedIds = new Set(sprints.flatMap((sp) => sp.storyIds));
    return stories.filter((s) => !assignedIds.has(s.id));
  }, [stories, sprints]);

  // Filtered product backlog
  const filteredBacklog = useMemo(() => {
    if (!backlogSearch) return backlogStories;
    const q = backlogSearch.toLowerCase();
    return backlogStories.filter(
      (s) => s.title.toLowerCase().includes(q) || s.description.toLowerCase().includes(q),
    );
  }, [backlogStories, backlogSearch]);

  // Sprint metrics
  const metrics = useMemo(() => {
    const totalPoints = sprintStories.reduce((sum, s) => sum + (s.storyPoints ?? 0), 0);
    const estimatedCount = sprintStories.filter((s) => s.storyPoints !== null).length;
    const unestimatedCount = sprintStories.length - estimatedCount;

    // Past sprint velocities
    const completedSprints = sprints.filter((sp) => sp.status === 'completed' && sp.velocity !== null);
    const avgVelocity =
      completedSprints.length > 0
        ? Math.round(completedSprints.reduce((s, sp) => s + (sp.velocity ?? 0), 0) / completedSprints.length)
        : null;

    const capacityPct = avgVelocity ? Math.round((totalPoints / avgVelocity) * 100) : null;

    return { totalPoints, estimatedCount, unestimatedCount, avgVelocity, capacityPct };
  }, [sprintStories, sprints]);

  // Add story to sprint
  const handleAddToSprint = useCallback(
    (storyId: string) => {
      if (!selectedSprint) return;
      dispatch({
        type: 'UPDATE_STORY',
        payload: { id: storyId, changes: { sprintId: selectedSprint.id } },
      });
      dispatch({
        type: 'UPDATE_SPRINT',
        payload: {
          id: selectedSprint.id,
          changes: { storyIds: [...selectedSprint.storyIds, storyId] },
        },
      });
    },
    [dispatch, selectedSprint],
  );

  // Remove story from sprint
  const handleRemoveFromSprint = useCallback(
    (storyId: string) => {
      if (!selectedSprint) return;
      dispatch({
        type: 'UPDATE_STORY',
        payload: { id: storyId, changes: { sprintId: null } },
      });
      dispatch({
        type: 'UPDATE_SPRINT',
        payload: {
          id: selectedSprint.id,
          changes: { storyIds: selectedSprint.storyIds.filter((id) => id !== storyId) },
        },
      });
    },
    [dispatch, selectedSprint],
  );

  // Start poker for a story
  const handleStartPoker = useCallback(
    (storyId: string) => {
      dispatch({
        type: 'START_POKER',
        payload: { storyId, participants: DEFAULT_PARTICIPANTS },
      });
      setShowPoker(true);
    },
    [dispatch],
  );

  // Sprint lifecycle
  const handleStartSprint = useCallback(() => {
    if (!selectedSprint) return;
    dispatch({ type: 'UPDATE_SPRINT', payload: { id: selectedSprint.id, changes: { status: 'active' } } });
  }, [dispatch, selectedSprint]);

  const handleCompleteSprint = useCallback(() => {
    if (!selectedSprint) return;
    const velocity = sprintStories
      .filter((s) => s.status === 'done')
      .reduce((sum, s) => sum + (s.storyPoints ?? 0), 0);
    dispatch({
      type: 'UPDATE_SPRINT',
      payload: { id: selectedSprint.id, changes: { status: 'completed', velocity } },
    });
  }, [dispatch, selectedSprint, sprintStories]);

  const handleCancelSprint = useCallback(() => {
    if (!selectedSprint) return;
    dispatch({ type: 'UPDATE_SPRINT', payload: { id: selectedSprint.id, changes: { status: 'cancelled' } } });
  }, [dispatch, selectedSprint]);

  // Close poker when session ends
  const pokerActive = pokerSession !== null;
  const effectiveShowPoker = showPoker && pokerActive;

  // Days in sprint
  const sprintDays = useMemo(() => {
    if (!selectedSprint) return null;
    const start = new Date(selectedSprint.startDate);
    const end = new Date(selectedSprint.endDate);
    const total = Math.ceil((end.getTime() - start.getTime()) / 86400000);
    const elapsed = Math.ceil((Date.now() - start.getTime()) / 86400000);
    return { total, elapsed: Math.max(0, Math.min(total, elapsed)), remaining: Math.max(0, total - elapsed) };
  }, [selectedSprint]);

  // ── Render ─────────────────────────────────────────────────────────────

  return (
    <div className="space-y-6">
      {/* ─── Sprint Selector + New Sprint ─────────────────────────────────── */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#00d4ff]/10">
            <Layers size={18} className="text-[#00d4ff]" />
          </div>
          <h1 className="text-xl font-bold text-gray-100">Sprint Planning</h1>
        </div>

        <div className="flex items-center gap-2">
          {/* Sprint dropdown */}
          <div className="relative">
            <button
              onClick={() => setSprintListOpen(!sprintListOpen)}
              className="flex items-center gap-2 rounded-lg border border-white/10 bg-[#151d30] px-3 py-2 text-sm text-gray-200 transition hover:border-[#00d4ff]/30"
            >
              <Calendar size={14} className="text-gray-400" />
              {selectedSprint ? selectedSprint.name : 'Select Sprint'}
              <ChevronDown size={14} className="text-gray-500" />
            </button>
            {sprintListOpen && (
              <div className="absolute right-0 top-full z-50 mt-1 w-72 rounded-xl border border-white/10 bg-[#0d1320] p-1 shadow-xl">
                {sprints.map((sp) => (
                  <button
                    key={sp.id}
                    onClick={() => { setSelectedSprintId(sp.id); setSprintListOpen(false); }}
                    className={[
                      'flex w-full items-center justify-between rounded-lg px-3 py-2 text-left text-sm transition',
                      sp.id === selectedSprintId
                        ? 'bg-[#00d4ff]/10 text-[#00d4ff]'
                        : 'text-gray-300 hover:bg-white/5',
                    ].join(' ')}
                  >
                    <span className="truncate">{sp.name}</span>
                    <StatusBadge status={sp.status} />
                  </button>
                ))}
                {sprints.length === 0 && (
                  <div className="px-3 py-4 text-center text-sm text-gray-500">No sprints yet</div>
                )}
              </div>
            )}
          </div>

          <button
            onClick={() => setShowCreateForm(true)}
            className="flex items-center gap-1.5 rounded-lg bg-[#00d4ff] px-3 py-2 text-sm font-bold text-[#0a0e17] transition hover:bg-[#00bde0]"
          >
            <Plus size={14} />
            New Sprint
          </button>
        </div>
      </div>

      {/* ─── Sprint Creation Form ─────────────────────────────────────────── */}
      {showCreateForm && <SprintForm onClose={() => setShowCreateForm(false)} />}

      {/* ─── Sprint Header ────────────────────────────────────────────────── */}
      {selectedSprint && (
        <div className="rounded-xl border border-white/5 bg-[#0d1320] p-5">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div className="space-y-2 flex-1">
              <div className="flex items-center gap-3">
                <h2 className="text-lg font-bold text-gray-100">{selectedSprint.name}</h2>
                <StatusBadge status={selectedSprint.status} />
              </div>
              {selectedSprint.goal && (
                <div className="flex items-start gap-2">
                  <Target size={14} className="mt-0.5 flex-shrink-0 text-[#00d4ff]/60" />
                  <p className="text-sm text-gray-400">{selectedSprint.goal}</p>
                </div>
              )}
              <div className="flex items-center gap-4 text-xs text-gray-500">
                <span className="flex items-center gap-1">
                  <Calendar size={12} />
                  {selectedSprint.startDate} → {selectedSprint.endDate}
                </span>
                {sprintDays && (
                  <span className="flex items-center gap-1">
                    <Clock size={12} />
                    {sprintDays.remaining} days remaining
                  </span>
                )}
              </div>
            </div>

            {/* Lifecycle buttons */}
            <div className="flex items-center gap-2">
              {selectedSprint.status === 'planning' && (
                <button
                  onClick={handleStartSprint}
                  disabled={sprintStories.length === 0}
                  className="flex items-center gap-1.5 rounded-lg bg-green-600 px-3 py-2 text-sm font-semibold text-white transition hover:bg-green-500 disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  <Play size={14} />
                  Start Sprint
                </button>
              )}
              {selectedSprint.status === 'active' && (
                <button
                  onClick={handleCompleteSprint}
                  className="flex items-center gap-1.5 rounded-lg bg-[#00d4ff] px-3 py-2 text-sm font-bold text-[#0a0e17] transition hover:bg-[#00bde0]"
                >
                  <CheckCircle size={14} />
                  Complete Sprint
                </button>
              )}
              {(selectedSprint.status === 'planning' || selectedSprint.status === 'active') && (
                <button
                  onClick={handleCancelSprint}
                  className="flex items-center gap-1.5 rounded-lg border border-red-500/20 bg-red-500/10 px-3 py-2 text-sm font-medium text-red-400 transition hover:bg-red-500/20"
                >
                  <XCircle size={14} />
                  Cancel
                </button>
              )}
            </div>
          </div>

          {/* Sprint progress bar */}
          {sprintDays && selectedSprint.status === 'active' && (
            <div className="mt-4">
              <div className="mb-1 flex justify-between text-[10px] uppercase tracking-wider text-gray-500">
                <span>Sprint Progress</span>
                <span>{Math.round((sprintDays.elapsed / sprintDays.total) * 100)}%</span>
              </div>
              <div className="h-1.5 overflow-hidden rounded-full bg-white/5">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-[#00d4ff] to-[#00d4ff]/60 transition-all"
                  style={{ width: `${(sprintDays.elapsed / sprintDays.total) * 100}%` }}
                />
              </div>
            </div>
          )}
        </div>
      )}

      {/* ─── Metrics Row ──────────────────────────────────────────────────── */}
      {selectedSprint && (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          <MetricCard
            icon={ListChecks}
            label="Total Points"
            value={metrics.totalPoints}
            sub={`${sprintStories.length} stories`}
            color="#00d4ff"
          />
          <MetricCard
            icon={TrendingUp}
            label="Avg Velocity"
            value={metrics.avgVelocity ?? '—'}
            sub="past sprints"
            color="#22c55e"
          />
          <MetricCard
            icon={Gauge}
            label="Capacity"
            value={metrics.capacityPct !== null ? `${metrics.capacityPct}%` : '—'}
            sub={metrics.capacityPct !== null ? (metrics.capacityPct > 100 ? 'Over capacity!' : 'Within range') : 'No history'}
            color={metrics.capacityPct !== null && metrics.capacityPct > 100 ? '#ef4444' : '#a855f7'}
          />
          <MetricCard
            icon={Target}
            label="Unestimated"
            value={metrics.unestimatedCount}
            sub={`${metrics.estimatedCount} estimated`}
            color={metrics.unestimatedCount > 0 ? '#eab308' : '#22c55e'}
          />
        </div>
      )}

      {/* ─── Backlogs: Sprint + Product ───────────────────────────────────── */}
      {selectedSprint && (
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          {/* Sprint Backlog */}
          <div className="rounded-xl border border-white/5 bg-[#0d1320] p-4">
            <div className="mb-3 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Layers size={14} className="text-[#00d4ff]" />
                <h3 className="text-sm font-bold text-gray-200">Sprint Backlog</h3>
                <span className="rounded-full bg-[#00d4ff]/10 px-2 py-0.5 text-[10px] font-bold text-[#00d4ff]">
                  {sprintStories.length}
                </span>
              </div>
              <span className="text-xs text-gray-500">{metrics.totalPoints} pts</span>
            </div>

            {/* Search */}
            {sprintStories.length > 3 && (
              <div className="relative mb-3">
                <SearchIcon size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-500" />
                <input
                  value={sprintBacklogSearch}
                  onChange={(e) => setSprintBacklogSearch(e.target.value)}
                  placeholder="Search sprint stories…"
                  className="w-full rounded-lg border border-white/10 bg-[#151d30] py-1.5 pl-8 pr-3 text-xs text-gray-200 placeholder-gray-600 outline-none focus:border-[#00d4ff]/50"
                />
              </div>
            )}

            <div className="space-y-2 max-h-[400px] overflow-y-auto pr-1">
              {filteredSprintStories.length === 0 ? (
                <div className="py-8 text-center text-sm text-gray-500">
                  {sprintStories.length === 0
                    ? 'No stories yet. Add from the product backlog →'
                    : 'No matching stories'}
                </div>
              ) : (
                filteredSprintStories.map((s) => (
                  <StoryCard
                    key={s.id}
                    story={s}
                    onEstimate={
                      selectedSprint.status === 'planning' || selectedSprint.status === 'active'
                        ? () => handleStartPoker(s.id)
                        : undefined
                    }
                    action={
                      selectedSprint.status === 'planning'
                        ? { label: 'Remove from sprint', icon: ArrowRight, onClick: () => handleRemoveFromSprint(s.id) }
                        : undefined
                    }
                  />
                ))
              )}
            </div>
          </div>

          {/* Product Backlog */}
          <div className="rounded-xl border border-white/5 bg-[#0d1320] p-4">
            <div className="mb-3 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <ListChecks size={14} className="text-gray-400" />
                <h3 className="text-sm font-bold text-gray-200">Product Backlog</h3>
                <span className="rounded-full bg-white/5 px-2 py-0.5 text-[10px] font-bold text-gray-400">
                  {backlogStories.length}
                </span>
              </div>
            </div>

            {/* Search */}
            {backlogStories.length > 3 && (
              <div className="relative mb-3">
                <SearchIcon size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-500" />
                <input
                  value={backlogSearch}
                  onChange={(e) => setBacklogSearch(e.target.value)}
                  placeholder="Search backlog…"
                  className="w-full rounded-lg border border-white/10 bg-[#151d30] py-1.5 pl-8 pr-3 text-xs text-gray-200 placeholder-gray-600 outline-none focus:border-[#00d4ff]/50"
                />
              </div>
            )}

            <div className="space-y-2 max-h-[400px] overflow-y-auto pr-1">
              {filteredBacklog.length === 0 ? (
                <div className="py-8 text-center text-sm text-gray-500">
                  {backlogStories.length === 0
                    ? 'All stories are assigned to sprints'
                    : 'No matching stories'}
                </div>
              ) : (
                filteredBacklog.map((s) => (
                  <StoryCard
                    key={s.id}
                    story={s}
                    onEstimate={() => handleStartPoker(s.id)}
                    action={
                      selectedSprint.status === 'planning'
                        ? { label: 'Add to sprint', icon: ArrowLeft, onClick: () => handleAddToSprint(s.id), color: '#00d4ff' }
                        : undefined
                    }
                  />
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* ─── Scrum Poker Section ──────────────────────────────────────────── */}
      {effectiveShowPoker && (
        <div className="rounded-xl border border-[#00d4ff]/20 bg-[#080c15] p-5 shadow-[0_0_40px_rgba(0,212,255,0.05)]">
          <ScrumPoker />
        </div>
      )}

      {/* Show poker inline if session active but not from sprint planning */}
      {pokerActive && !showPoker && (
        <div className="flex justify-center">
          <button
            onClick={() => setShowPoker(true)}
            className="flex items-center gap-2 rounded-lg border border-[#00d4ff]/30 bg-[#00d4ff]/10 px-4 py-2 text-sm font-medium text-[#00d4ff] transition hover:bg-[#00d4ff]/20"
          >
            <Users size={16} />
            Show Active Poker Session
          </button>
        </div>
      )}

      {/* ─── Empty State ──────────────────────────────────────────────────── */}
      {!selectedSprint && !showCreateForm && (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-white/5 bg-[#0d1320] p-16 text-center">
          <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-[#00d4ff]/10">
            <Layers size={28} className="text-[#00d4ff]" />
          </div>
          <h3 className="mb-2 text-lg font-semibold text-gray-200">No Sprint Selected</h3>
          <p className="mb-6 max-w-sm text-sm text-gray-500">
            Create a new sprint or select an existing one to start planning.
          </p>
          <button
            onClick={() => setShowCreateForm(true)}
            className="flex items-center gap-2 rounded-lg bg-[#00d4ff] px-5 py-2.5 text-sm font-bold text-[#0a0e17] transition hover:bg-[#00bde0]"
          >
            <Plus size={16} />
            Create First Sprint
          </button>
        </div>
      )}
    </div>
  );
}

// ─── Metric Card ─────────────────────────────────────────────────────────────

function MetricCard({
  icon: Icon,
  label,
  value,
  sub,
  color,
}: {
  icon: React.ElementType;
  label: string;
  value: string | number;
  sub: string;
  color: string;
}) {
  return (
    <div className="rounded-xl border border-white/5 bg-[#0d1320] p-4">
      <div className="mb-2 flex items-center gap-2">
        <Icon size={14} style={{ color }} />
        <span className="text-[10px] uppercase tracking-wider text-gray-500">{label}</span>
      </div>
      <div className="text-2xl font-bold" style={{ color }}>{value}</div>
      <div className="mt-1 text-[10px] text-gray-500">{sub}</div>
    </div>
  );
}
