import { useState, useMemo } from 'react';
import {
  Search,
  Plus,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  Minus,
  AlertOctagon,
  BookOpen,
  Bug,
  CheckSquare,
  Zap,
  ChevronDown,
  ChevronUp,
  X,
} from 'lucide-react';
import { usePMState, usePMDispatch } from '../../context/PMContext';
import { PRIORITY_CONFIG, STORY_TYPE_CONFIG, KANBAN_COLUMNS } from '../../constants/pm';
import type { Story, Priority, StoryType, StoryStatus } from '../../types/pm';

const PRIORITY_ICONS: Record<string, React.ComponentType<{ size?: number; className?: string }>> = {
  AlertOctagon, ArrowUp, Minus, ArrowDown,
};

const TYPE_ICONS: Record<string, React.ComponentType<{ size?: number; className?: string }>> = {
  BookOpen, Bug, CheckSquare, Zap, Search,
};

type SortField = 'title' | 'type' | 'priority' | 'storyPoints' | 'status' | 'assignee';
type SortDir = 'asc' | 'desc';
type Density = 'default' | 'comfortable' | 'compact';

const PRIORITY_ORDER: Record<Priority, number> = { critical: 0, high: 1, medium: 2, low: 3 };
const STATUS_ORDER: Record<StoryStatus, number> = { backlog: 0, todo: 1, 'in-progress': 2, review: 3, testing: 4, done: 5 };
const DENSITY_STORAGE_KEY = 'abeops-backlog-density';
const ROW_PADDING: Record<Density, string> = {
  default: '20px',
  comfortable: '14px',
  compact: '8px',
};
const EXPANDED_PADDING: Record<Density, string> = {
  default: '24px 32px',
  comfortable: '16px 24px',
  compact: '12px 16px',
};

export default function BacklogView() {
  const { stories, sprints } = usePMState();
  const dispatch = usePMDispatch();

  const [search, setSearch] = useState('');
  const [filterPriority, setFilterPriority] = useState<Priority | ''>('');
  const [filterType, setFilterType] = useState<StoryType | ''>('');
  const [filterAssignee, setFilterAssignee] = useState('');
  const [sortField, setSortField] = useState<SortField>('priority');
  const [sortDir, setSortDir] = useState<SortDir>('asc');
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [density, setDensity] = useState<Density>(() => {
    const saved = localStorage.getItem(DENSITY_STORAGE_KEY);
    return saved === 'comfortable' || saved === 'compact' ? saved : 'default';
  });

  function updateDensity(next: Density) {
    setDensity(next);
    localStorage.setItem(DENSITY_STORAGE_KEY, next);
  }

  // Unique assignees for filter
  const assignees = useMemo(
    () => [...new Set(stories.map(s => s.assignee).filter((a): a is string => a !== null))].sort(),
    [stories]
  );

  // Summary stats
  const stats = useMemo(() => {
    const total = stories.length;
    const totalPoints = stories.reduce((sum, s) => sum + (s.storyPoints ?? 0), 0);
    const byStatus: Record<string, number> = {};
    for (const s of stories) {
      byStatus[s.status] = (byStatus[s.status] ?? 0) + 1;
    }
    return { total, totalPoints, byStatus };
  }, [stories]);

  // Filter & sort
  const filteredStories = useMemo(() => {
    let result = [...stories];
    if (search) {
      const q = search.toLowerCase();
      result = result.filter(
        s => s.title.toLowerCase().includes(q) || s.description.toLowerCase().includes(q) || s.tags.some(t => t.toLowerCase().includes(q))
      );
    }
    if (filterPriority) result = result.filter(s => s.priority === filterPriority);
    if (filterType) result = result.filter(s => s.type === filterType);
    if (filterAssignee) result = result.filter(s => s.assignee === filterAssignee);

    result.sort((a, b) => {
      let cmp = 0;
      switch (sortField) {
        case 'title':
          cmp = a.title.localeCompare(b.title);
          break;
        case 'type':
          cmp = a.type.localeCompare(b.type);
          break;
        case 'priority':
          cmp = PRIORITY_ORDER[a.priority] - PRIORITY_ORDER[b.priority];
          break;
        case 'storyPoints':
          cmp = (a.storyPoints ?? 0) - (b.storyPoints ?? 0);
          break;
        case 'status':
          cmp = STATUS_ORDER[a.status] - STATUS_ORDER[b.status];
          break;
        case 'assignee':
          cmp = (a.assignee ?? '').localeCompare(b.assignee ?? '');
          break;
      }
      return sortDir === 'asc' ? cmp : -cmp;
    });

    return result;
  }, [stories, search, filterPriority, filterType, filterAssignee, sortField, sortDir]);

  function toggleSort(field: SortField) {
    if (sortField === field) {
      setSortDir(d => (d === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortField(field);
      setSortDir('asc');
    }
  }

  function moveStory(story: Story, direction: 'up' | 'down') {
    const idx = filteredStories.findIndex(s => s.id === story.id);
    const swapIdx = direction === 'up' ? idx - 1 : idx + 1;
    if (swapIdx < 0 || swapIdx >= filteredStories.length) return;

    const swap = filteredStories[swapIdx];
    // Swap priorities
    dispatch({ type: 'UPDATE_STORY', payload: { id: story.id, changes: { priority: swap.priority } } });
    dispatch({ type: 'UPDATE_STORY', payload: { id: swap.id, changes: { priority: story.priority } } });
  }

  function getSprintName(sprintId: string | null) {
    if (!sprintId) return '—';
    return sprints.find(s => s.id === sprintId)?.name ?? '—';
  }

  function SortHeader({ field, label }: { field: SortField; label: string }) {
    const isActive = sortField === field;
    return (
      <button
        onClick={() => toggleSort(field)}
        className="flex items-center gap-1 text-xs font-medium uppercase tracking-wider cursor-pointer group"
      >
        <span className={isActive ? 'text-[#00d4ff]' : 'text-gray-500 group-hover:text-gray-300'}>
          {label}
        </span>
        {isActive ? (
          sortDir === 'asc' ? <ChevronUp size={12} className="text-[#00d4ff]" /> : <ChevronDown size={12} className="text-[#00d4ff]" />
        ) : (
          <ArrowUpDown size={12} className="text-gray-600 group-hover:text-gray-400" />
        )}
      </button>
    );
  }

  const hasFilters = search || filterPriority || filterType || filterAssignee;

  return (
    <div className="flex-1 overflow-y-auto p-6 space-y-4">
      {/* Summary Stats */}
      <div className="flex flex-wrap items-center gap-4">
        <div className="flex items-center gap-2 text-sm">
          <span className="text-gray-500">Stories:</span>
          <span className="text-white font-bold">{stats.total}</span>
        </div>
        <div className="flex items-center gap-2 text-sm">
          <span className="text-gray-500">Points:</span>
          <span className="text-white font-bold">{stats.totalPoints}</span>
        </div>
        {KANBAN_COLUMNS.map(col => {
          const count = stats.byStatus[col.id] ?? 0;
          if (count === 0) return null;
          return (
            <div key={col.id} className="flex items-center gap-1.5 text-sm">
              <span className="w-2 h-2 rounded-full" style={{ backgroundColor: col.color }} />
              <span className="text-gray-400">{col.title}:</span>
              <span className="text-white font-semibold">{count}</span>
            </div>
          );
        })}
      </div>

      {/* Toolbar: Search + Filters + New Story button */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[200px] max-w-md">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
          <input
            type="text"
            placeholder="Search stories..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2 bg-white/5 border border-white/10 rounded-lg text-sm text-white placeholder-gray-500 focus:outline-none focus:border-[#00d4ff]/50"
          />
        </div>

        <select
          value={filterPriority}
          onChange={e => setFilterPriority(e.target.value as Priority | '')}
          className="px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-sm text-gray-300 focus:outline-none focus:border-[#00d4ff]/50 cursor-pointer"
        >
          <option value="">All Priorities</option>
          {(Object.keys(PRIORITY_CONFIG) as Priority[]).map(p => (
            <option key={p} value={p}>{PRIORITY_CONFIG[p].label}</option>
          ))}
        </select>

        <select
          value={filterType}
          onChange={e => setFilterType(e.target.value as StoryType | '')}
          className="px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-sm text-gray-300 focus:outline-none focus:border-[#00d4ff]/50 cursor-pointer"
        >
          <option value="">All Types</option>
          {(Object.keys(STORY_TYPE_CONFIG) as StoryType[]).map(t => (
            <option key={t} value={t}>{STORY_TYPE_CONFIG[t].label}</option>
          ))}
        </select>

        <select
          value={filterAssignee}
          onChange={e => setFilterAssignee(e.target.value)}
          className="px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-sm text-gray-300 focus:outline-none focus:border-[#00d4ff]/50 cursor-pointer"
        >
          <option value="">All Assignees</option>
          {assignees.map(a => (
            <option key={a} value={a}>{a}</option>
          ))}
        </select>

        {hasFilters && (
          <button
            onClick={() => { setSearch(''); setFilterPriority(''); setFilterType(''); setFilterAssignee(''); }}
            className="flex items-center gap-1 px-2 py-2 text-xs text-gray-400 hover:text-white cursor-pointer"
          >
            <X size={14} /> Clear
          </button>
        )}

        <label className="flex items-center gap-2 text-xs text-gray-500">
          Density
          <select
            value={density}
            onChange={e => updateDensity(e.target.value as Density)}
            aria-label="Backlog density"
            className="cursor-pointer rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-gray-300 focus:border-[#00d4ff]/50 focus:outline-none"
          >
            <option value="default">Default</option>
            <option value="comfortable">Comfortable</option>
            <option value="compact">Compact</option>
          </select>
        </label>

        <button
          onClick={() =>
            dispatch({
              type: 'ADD_STORY',
              payload: {
                title: 'New Story',
                description: '',
                type: 'story',
                status: 'backlog',
                priority: 'medium',
                storyPoints: null,
                assignee: null,
                tags: [],
                sprintId: null,
                epicId: null,
                acceptanceCriteria: [],
                processGroup: null,
                knowledgeArea: null,
              },
            })
          }
          className="flex items-center gap-1.5 px-4 py-2 bg-[#00d4ff] text-[#0a0e17] font-semibold text-sm rounded-lg hover:bg-[#00d4ff]/90 transition-colors cursor-pointer ml-auto shrink-0"
        >
          <Plus size={16} /> New Story
        </button>
      </div>

      {/* Table */}
      <div className="bg-[#0f1525] border border-white/5 rounded-xl overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-white/5">
              <th className="w-10 px-2 py-3" />
              <th className="text-left px-4 py-3"><SortHeader field="title" label="Title" /></th>
              <th className="text-left px-3 py-3 hidden md:table-cell"><SortHeader field="type" label="Type" /></th>
              <th className="text-left px-3 py-3"><SortHeader field="priority" label="Priority" /></th>
              <th className="text-center px-3 py-3 hidden sm:table-cell"><SortHeader field="storyPoints" label="Points" /></th>
              <th className="text-left px-3 py-3 hidden lg:table-cell"><SortHeader field="status" label="Status" /></th>
              <th className="text-left px-3 py-3 hidden xl:table-cell"><SortHeader field="assignee" label="Assignee" /></th>
              <th className="text-left px-3 py-3 hidden xl:table-cell">Sprint</th>
              <th className="w-20 px-2 py-3" />
            </tr>
          </thead>
          <tbody>
            {filteredStories.map((story, idx) => {
              const priConfig = PRIORITY_CONFIG[story.priority];
              const typeConfig = STORY_TYPE_CONFIG[story.type];
              const PriIcon = PRIORITY_ICONS[priConfig.icon] ?? Minus;
              const TypeIcon = TYPE_ICONS[typeConfig.icon] ?? BookOpen;
              const statusCol = KANBAN_COLUMNS.find(c => c.id === story.status);
              const isExpanded = expandedId === story.id;

              return (
                <tr key={story.id} className="group">
                  <td
                    colSpan={9}
                    className="p-0"
                  >
                    {/* Main row */}
                    <div
                      className={`flex items-center cursor-pointer transition-colors ${
                        idx % 2 === 0 ? 'bg-[#0f1525]' : 'bg-[#151d30]'
                      } hover:bg-white/5 ${isExpanded ? 'bg-white/5' : ''}`}
                      onClick={() => setExpandedId(isExpanded ? null : story.id)}
                      style={{ paddingBlock: ROW_PADDING[density] }}
                    >
                      {/* Expand indicator */}
                      <div className="w-10 flex items-center justify-center px-2">
                        <ChevronDown
                          size={14}
                          className={`text-gray-600 transition-transform ${isExpanded ? 'rotate-180' : ''}`}
                        />
                      </div>
                      {/* Title */}
                      <div className="flex-1 px-4 min-w-0">
                        <span className="text-white truncate block">{story.title}</span>
                      </div>
                      {/* Type */}
                      <div className="px-3 hidden md:block">
                        <span
                          className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium"
                          style={{ backgroundColor: `${typeConfig.color}20`, color: typeConfig.color }}
                        >
                          <TypeIcon size={12} />
                          {typeConfig.label}
                        </span>
                      </div>
                      {/* Priority */}
                      <div className="px-3">
                        <span
                          className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium"
                          style={{ backgroundColor: `${priConfig.color}20`, color: priConfig.color }}
                        >
                          <PriIcon size={12} />
                          {priConfig.label}
                        </span>
                      </div>
                      {/* Points */}
                      <div className="px-3 text-center hidden sm:block">
                        <span className="text-gray-300 font-mono">
                          {story.storyPoints ?? '—'}
                        </span>
                      </div>
                      {/* Status */}
                      <div className="px-3 hidden lg:block">
                        <span
                          className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-xs font-medium"
                          style={{ backgroundColor: `${statusCol?.color ?? '#6b7280'}20`, color: statusCol?.color ?? '#6b7280' }}
                        >
                          <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: statusCol?.color }} />
                          {statusCol?.title ?? story.status}
                        </span>
                      </div>
                      {/* Assignee */}
                      <div className="px-3 hidden xl:block">
                        <span className="text-gray-400 text-xs">{story.assignee ?? '—'}</span>
                      </div>
                      {/* Sprint */}
                      <div className="px-3 hidden xl:block">
                        <span className="text-gray-500 text-xs truncate block max-w-[120px]">
                          {getSprintName(story.sprintId)}
                        </span>
                      </div>
                      {/* Reorder buttons */}
                      <div className="w-20 px-2 flex items-center gap-1" onClick={e => e.stopPropagation()}>
                        <button
                          onClick={() => moveStory(story, 'up')}
                          disabled={idx === 0}
                          className="p-1 rounded hover:bg-white/10 disabled:opacity-20 cursor-pointer disabled:cursor-not-allowed text-gray-400"
                        >
                          <ArrowUp size={14} />
                        </button>
                        <button
                          onClick={() => moveStory(story, 'down')}
                          disabled={idx === filteredStories.length - 1}
                          className="p-1 rounded hover:bg-white/10 disabled:opacity-20 cursor-pointer disabled:cursor-not-allowed text-gray-400"
                        >
                          <ArrowDown size={14} />
                        </button>
                      </div>
                    </div>

                    {/* Expanded details */}
                    {isExpanded && (
                      <ExpandedRow story={story} sprintName={getSprintName(story.sprintId)} density={density} />
                    )}
                  </td>
                </tr>
              );
            })}
            {filteredStories.length === 0 && (
              <tr>
                <td colSpan={9} className="text-center py-12 text-gray-500">
                  {hasFilters ? 'No stories match the current filters.' : 'No stories yet. Click "New Story" to create one.'}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function ExpandedRow({ story, sprintName, density }: { story: Story; sprintName: string; density: Density }) {
  const dispatch = usePMDispatch();
  const [title, setTitle] = useState(story.title);
  const [description, setDescription] = useState(story.description);

  function save() {
    dispatch({ type: 'UPDATE_STORY', payload: { id: story.id, changes: { title, description } } });
  }

  return (
    <div
      className="bg-[#0b1020] border-t border-white/5 space-y-3"
      style={{ padding: EXPANDED_PADDING[density] }}
    >
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="text-xs text-gray-500 uppercase tracking-wider block mb-1">Title</label>
          <input
            value={title}
            onChange={e => setTitle(e.target.value)}
            onBlur={save}
            className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-sm text-white focus:outline-none focus:border-[#00d4ff]/50"
          />
        </div>
        <div className="grid grid-cols-3 gap-3">
          <div>
            <label className="text-xs text-gray-500 uppercase tracking-wider block mb-1">Points</label>
            <span className="text-white font-mono text-sm">{story.storyPoints ?? '—'}</span>
          </div>
          <div>
            <label className="text-xs text-gray-500 uppercase tracking-wider block mb-1">Assignee</label>
            <span className="text-gray-300 text-sm">{story.assignee ?? 'Unassigned'}</span>
          </div>
          <div>
            <label className="text-xs text-gray-500 uppercase tracking-wider block mb-1">Sprint</label>
            <span className="text-gray-300 text-sm">{sprintName}</span>
          </div>
        </div>
      </div>
      <div>
        <label className="text-xs text-gray-500 uppercase tracking-wider block mb-1">Description</label>
        <textarea
          value={description}
          onChange={e => setDescription(e.target.value)}
          onBlur={save}
          rows={3}
          className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-sm text-white focus:outline-none focus:border-[#00d4ff]/50 resize-none"
        />
      </div>
      {story.acceptanceCriteria.length > 0 && (
        <div>
          <label className="text-xs text-gray-500 uppercase tracking-wider block mb-1">Acceptance Criteria</label>
          <ul className="space-y-1">
            {story.acceptanceCriteria.map((ac, i) => (
              <li key={i} className="flex items-start gap-2 text-xs text-gray-400">
                <span className="text-[#00d4ff] mt-0.5">•</span>
                {ac}
              </li>
            ))}
          </ul>
        </div>
      )}
      {story.tags.length > 0 && (
        <div className="flex items-center gap-2 flex-wrap">
          {story.tags.map(tag => (
            <span key={tag} className="px-2 py-0.5 bg-white/5 border border-white/10 rounded text-xs text-gray-400">
              {tag}
            </span>
          ))}
        </div>
      )}
      <div className="flex items-center gap-3 pt-1">
        <button
          onClick={() => dispatch({ type: 'DELETE_STORY', payload: story.id })}
          className="text-xs text-red-400 hover:text-red-300 cursor-pointer"
        >
          Delete Story
        </button>
      </div>
    </div>
  );
}
