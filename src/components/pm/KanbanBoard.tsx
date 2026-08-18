import { useState, useMemo, useCallback } from 'react';
import {
  DragDropContext,
  Droppable,
  Draggable,
  type DropResult,
} from '@hello-pangea/dnd';
import { v4 as uuidv4 } from 'uuid';
import {
  Plus,
  Search,
  X,
  Filter,
  GripVertical,
  Trash2,
  Edit3,
  Check,
  AlertOctagon,
  ArrowUp,
  Minus,
  ArrowDown,
  BookOpen,
  Bug,
  CheckSquare,
  Zap,
  ChevronDown,
  AlertTriangle,
  User,
} from 'lucide-react';
import { usePMState, usePMDispatch } from '../../context/PMContext';
import type { Story, StoryStatus, Priority, StoryType } from '../../types/pm';
import { KANBAN_COLUMNS, PRIORITY_CONFIG, STORY_TYPE_CONFIG } from '../../constants/pm';

// ─── Icon Maps ───────────────────────────────────────────────────────────────

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
  spike: Search,
};

// ─── Sub-Components ──────────────────────────────────────────────────────────

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

function TypeIcon({ type }: { type: StoryType }) {
  const config = STORY_TYPE_CONFIG[type];
  const Icon = TYPE_ICONS[type];
  return <Icon size={14} style={{ color: config.color }} />;
}

function StoryPointsBadge({ points }: { points: number | null }) {
  if (points === null) return null;
  return (
    <span className="flex h-5 w-5 items-center justify-center rounded-full bg-[#1e293b] text-[10px] font-bold text-[#00d4ff]">
      {points}
    </span>
  );
}

function AvatarBadge({ name }: { name: string | null }) {
  if (!name) return null;
  const initials = name
    .split(' ')
    .map((w) => w[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
  return (
    <span className="flex h-6 w-6 items-center justify-center rounded-full bg-[#00d4ff]/20 text-[10px] font-bold text-[#00d4ff]">
      {initials}
    </span>
  );
}

// ─── Filters Bar ─────────────────────────────────────────────────────────────

interface Filters {
  search: string;
  priority: Priority | '';
  assignee: string;
  type: StoryType | '';
  sprint: string;
}

const emptyFilters: Filters = { search: '', priority: '', assignee: '', type: '', sprint: '' };

function FiltersBar({
  filters,
  onChange,
  assignees,
  sprintOptions,
}: {
  filters: Filters;
  onChange: (f: Filters) => void;
  assignees: string[];
  sprintOptions: { id: string; label: string }[];
}) {
  const hasFilters = Object.values(filters).some(Boolean);

  return (
    <div className="mb-4 flex flex-wrap items-center gap-3 rounded-lg border border-white/5 bg-[#0d1320] px-4 py-3">
      {/* Search */}
      <div className="relative min-w-[200px] flex-1">
        <Search size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-500" />
        <input
          type="text"
          placeholder="Search cards…"
          value={filters.search}
          onChange={(e) => onChange({ ...filters, search: e.target.value })}
          className="w-full rounded-md border border-white/10 bg-[#151d30] py-1.5 pl-8 pr-3 text-sm text-gray-200 placeholder-gray-500 outline-none transition focus:border-[#00d4ff]/50 focus:ring-1 focus:ring-[#00d4ff]/30"
        />
      </div>

      {/* Priority */}
      <SelectFilter
        icon={<Filter size={13} />}
        value={filters.priority}
        onChange={(v) => onChange({ ...filters, priority: v as Priority | '' })}
        options={[
          { value: '', label: 'All Priorities' },
          ...Object.entries(PRIORITY_CONFIG).map(([k, v]) => ({ value: k, label: v.label })),
        ]}
      />

      {/* Type */}
      <SelectFilter
        icon={<BookOpen size={13} />}
        value={filters.type}
        onChange={(v) => onChange({ ...filters, type: v as StoryType | '' })}
        options={[
          { value: '', label: 'All Types' },
          ...Object.entries(STORY_TYPE_CONFIG).map(([k, v]) => ({ value: k, label: v.label })),
        ]}
      />

      {/* Assignee */}
      <SelectFilter
        icon={<User size={13} />}
        value={filters.assignee}
        onChange={(v) => onChange({ ...filters, assignee: v })}
        options={[
          { value: '', label: 'All Assignees' },
          ...assignees.map((a) => ({ value: a, label: a })),
        ]}
      />

      {/* Sprint */}
      <SelectFilter
        icon={<Zap size={13} />}
        value={filters.sprint}
        onChange={(v) => onChange({ ...filters, sprint: v })}
        options={[
          { value: '', label: 'All Sprints' },
          ...sprintOptions.map((s) => ({ value: s.id, label: s.label })),
        ]}
      />

      {/* Clear */}
      {hasFilters && (
        <button
          onClick={() => onChange(emptyFilters)}
          className="flex items-center gap-1 rounded-md border border-white/10 px-2.5 py-1.5 text-xs text-gray-400 transition hover:border-red-500/30 hover:text-red-400"
        >
          <X size={12} /> Clear
        </button>
      )}
    </div>
  );
}

function SelectFilter({
  icon,
  value,
  onChange,
  options,
}: {
  icon: React.ReactNode;
  value: string;
  onChange: (v: string) => void;
  options: { value: string; label: string }[];
}) {
  return (
    <div className="relative">
      <span className="pointer-events-none absolute left-2 top-1/2 -translate-y-1/2 text-gray-500">
        {icon}
      </span>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="appearance-none rounded-md border border-white/10 bg-[#151d30] py-1.5 pl-7 pr-7 text-xs text-gray-300 outline-none transition focus:border-[#00d4ff]/50"
      >
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
      <ChevronDown
        size={12}
        className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 text-gray-500"
      />
    </div>
  );
}

// ─── Kanban Card ─────────────────────────────────────────────────────────────

function KanbanCard({
  story,
  index,
  onEdit,
  onDelete,
}: {
  story: Story;
  index: number;
  onEdit: (story: Story) => void;
  onDelete: (id: string) => void;
}) {
  const typeConfig = STORY_TYPE_CONFIG[story.type];

  return (
    <Draggable draggableId={story.id} index={index}>
      {(provided, snapshot) => (
        <div
          ref={provided.innerRef}
          {...provided.draggableProps}
          {...provided.dragHandleProps}
          onClick={() => onEdit(story)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              onEdit(story);
            }
          }}
          role="button"
          tabIndex={0}
          aria-label={`Open ${story.title}`}
          className={`group relative mb-2 rounded-lg border transition-all duration-200 ${
            snapshot.isDragging
              ? 'border-[#00d4ff]/40 shadow-lg shadow-[#00d4ff]/10'
              : 'cursor-grab border-white/5 hover:border-white/15 hover:shadow-md hover:shadow-black/30'
          }`}
          style={{
            ...provided.draggableProps.style,
            backgroundColor: snapshot.isDragging ? '#1a2540' : '#151d30',
          }}
        >
          {/* Left type border strip */}
          <div
            className="absolute left-0 top-0 h-full w-1 rounded-l-lg"
            style={{ backgroundColor: typeConfig.color }}
          />

          <div className="p-3 pl-4">
            {/* Top row: grip + type icon + title */}
            <div className="mb-2 flex items-start gap-2">
              <span
                className="mt-0.5 flex-shrink-0 cursor-grab text-gray-600 opacity-0 transition group-hover:opacity-100"
              >
                <GripVertical size={14} />
              </span>
              <TypeIcon type={story.type} />
              <p className="flex-1 text-sm font-medium leading-snug text-gray-200">{story.title}</p>
            </div>

            {/* Tags */}
            {story.tags.length > 0 && (
              <div className="mb-2 flex flex-wrap gap-1">
                {story.tags.slice(0, 3).map((tag) => (
                  <span
                    key={tag}
                    className="rounded bg-[#1e293b] px-1.5 py-0.5 text-[10px] text-gray-400"
                  >
                    {tag}
                  </span>
                ))}
                {story.tags.length > 3 && (
                  <span className="text-[10px] text-gray-500">+{story.tags.length - 3}</span>
                )}
              </div>
            )}

            {/* Bottom row: priority, points, assignee, actions */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <PriorityBadge priority={story.priority} />
                <StoryPointsBadge points={story.storyPoints} />
              </div>
              <div className="flex items-center gap-2">
                {/* Edit / Delete — visible on hover */}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onEdit(story);
                  }}
                  className="rounded p-0.5 text-gray-600 opacity-0 transition hover:text-[#00d4ff] group-hover:opacity-100"
                  title="Edit"
                >
                  <Edit3 size={12} />
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onDelete(story.id);
                  }}
                  className="rounded p-0.5 text-gray-600 opacity-0 transition hover:text-red-400 group-hover:opacity-100"
                  title="Delete"
                >
                  <Trash2 size={12} />
                </button>
                <AvatarBadge name={story.assignee} />
              </div>
            </div>
          </div>
        </div>
      )}
    </Draggable>
  );
}

// ─── Quick-Add Form ──────────────────────────────────────────────────────────

function QuickAddForm({
  status,
  onAdd,
  onCancel,
}: {
  status: StoryStatus;
  onAdd: (story: Story) => void;
  onCancel: () => void;
}) {
  const [title, setTitle] = useState('');
  const [expanded, setExpanded] = useState(false);
  const [type, setType] = useState<StoryType>('story');
  const [priority, setPriority] = useState<Priority>('medium');
  const [points, setPoints] = useState<string>('');
  const [assignee, setAssignee] = useState('');
  const [tags, setTags] = useState('');

  const handleSubmit = () => {
    if (!title.trim()) return;
    const now = new Date().toISOString();
    onAdd({
      id: uuidv4(),
      title: title.trim(),
      description: '',
      type,
      status,
      priority,
      storyPoints: points ? parseInt(points, 10) : null,
      assignee: assignee.trim() || null,
      tags: tags
        .split(',')
        .map((t) => t.trim())
        .filter(Boolean),
      sprintId: null,
      epicId: null,
      createdAt: now,
      updatedAt: now,
      acceptanceCriteria: [],
      processGroup: null,
      knowledgeArea: null,
    });
  };

  return (
    <div className="mt-2 rounded-lg border border-[#00d4ff]/20 bg-[#111827] p-3">
      <input
        autoFocus
        type="text"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        onKeyDown={(e) => e.key === 'Enter' && !expanded && handleSubmit()}
        placeholder="Card title…"
        className="w-full rounded border border-white/10 bg-[#151d30] px-2.5 py-1.5 text-sm text-gray-200 placeholder-gray-500 outline-none focus:border-[#00d4ff]/50"
      />

      {expanded && (
        <div className="mt-2 grid grid-cols-2 gap-2">
          <select
            value={type}
            onChange={(e) => setType(e.target.value as StoryType)}
            className="rounded border border-white/10 bg-[#151d30] px-2 py-1 text-xs text-gray-300 outline-none"
          >
            {Object.entries(STORY_TYPE_CONFIG).map(([k, v]) => (
              <option key={k} value={k}>
                {v.label}
              </option>
            ))}
          </select>
          <select
            value={priority}
            onChange={(e) => setPriority(e.target.value as Priority)}
            className="rounded border border-white/10 bg-[#151d30] px-2 py-1 text-xs text-gray-300 outline-none"
          >
            {Object.entries(PRIORITY_CONFIG).map(([k, v]) => (
              <option key={k} value={k}>
                {v.label}
              </option>
            ))}
          </select>
          <input
            type="number"
            min={0}
            value={points}
            onChange={(e) => setPoints(e.target.value)}
            placeholder="Points"
            className="rounded border border-white/10 bg-[#151d30] px-2 py-1 text-xs text-gray-300 outline-none"
          />
          <input
            type="text"
            value={assignee}
            onChange={(e) => setAssignee(e.target.value)}
            placeholder="Assignee"
            className="rounded border border-white/10 bg-[#151d30] px-2 py-1 text-xs text-gray-300 outline-none"
          />
          <input
            type="text"
            value={tags}
            onChange={(e) => setTags(e.target.value)}
            placeholder="Tags (comma separated)"
            className="col-span-2 rounded border border-white/10 bg-[#151d30] px-2 py-1 text-xs text-gray-300 outline-none"
          />
        </div>
      )}

      <div className="mt-2 flex items-center justify-between">
        <button
          type="button"
          onClick={() => setExpanded(!expanded)}
          className="text-[11px] text-gray-500 transition hover:text-[#00d4ff]"
        >
          {expanded ? 'Less options' : 'More options'}
        </button>
        <div className="flex gap-2">
          <button
            onClick={onCancel}
            className="rounded px-2.5 py-1 text-xs text-gray-400 transition hover:text-gray-200"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={!title.trim()}
            className="rounded bg-[#00d4ff] px-2.5 py-1 text-xs font-semibold text-[#0a0e17] transition hover:bg-[#00bde6] disabled:opacity-40"
          >
            Add
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Edit Story Modal ────────────────────────────────────────────────────────

function EditStoryModal({
  story,
  onSave,
  onDelete,
  onClose,
}: {
  story: Story;
  onSave: (story: Story) => void;
  onDelete: (id: string) => void;
  onClose: () => void;
}) {
  const [form, setForm] = useState({ ...story });
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [tagInput, setTagInput] = useState(story.tags.join(', '));

  const patch = (partial: Partial<Story>) => setForm((prev) => ({ ...prev, ...partial }));

  const handleSave = () => {
    onSave({
      ...form,
      tags: tagInput
        .split(',')
        .map((t) => t.trim())
        .filter(Boolean),
      updatedAt: new Date().toISOString(),
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="relative w-full max-w-lg rounded-xl border border-white/10 bg-[#0d1320] p-6 shadow-2xl">
        <button
          onClick={onClose}
          className="absolute right-4 top-4 text-gray-500 transition hover:text-gray-300"
        >
          <X size={18} />
        </button>
        <h2 className="mb-4 text-lg font-bold text-gray-100">Edit Story</h2>

        <div className="space-y-3">
          {/* Title */}
          <input
            type="text"
            value={form.title}
            onChange={(e) => patch({ title: e.target.value })}
            className="w-full rounded-md border border-white/10 bg-[#151d30] px-3 py-2 text-sm text-gray-200 outline-none focus:border-[#00d4ff]/50"
            placeholder="Title"
          />

          {/* Description */}
          <textarea
            value={form.description}
            onChange={(e) => patch({ description: e.target.value })}
            rows={3}
            className="w-full resize-none rounded-md border border-white/10 bg-[#151d30] px-3 py-2 text-sm text-gray-200 outline-none focus:border-[#00d4ff]/50"
            placeholder="Description"
          />

          {/* Type + Priority */}
          <div className="grid grid-cols-2 gap-3">
            <label className="space-y-1">
              <span className="text-[11px] font-medium uppercase tracking-wider text-gray-500">
                Type
              </span>
              <select
                value={form.type}
                onChange={(e) => patch({ type: e.target.value as StoryType })}
                className="w-full rounded-md border border-white/10 bg-[#151d30] px-2 py-1.5 text-sm text-gray-300 outline-none"
              >
                {Object.entries(STORY_TYPE_CONFIG).map(([k, v]) => (
                  <option key={k} value={k}>
                    {v.label}
                  </option>
                ))}
              </select>
            </label>
            <label className="space-y-1">
              <span className="text-[11px] font-medium uppercase tracking-wider text-gray-500">
                Priority
              </span>
              <select
                value={form.priority}
                onChange={(e) => patch({ priority: e.target.value as Priority })}
                className="w-full rounded-md border border-white/10 bg-[#151d30] px-2 py-1.5 text-sm text-gray-300 outline-none"
              >
                {Object.entries(PRIORITY_CONFIG).map(([k, v]) => (
                  <option key={k} value={k}>
                    {v.label}
                  </option>
                ))}
              </select>
            </label>
          </div>

          {/* Points + Assignee */}
          <div className="grid grid-cols-2 gap-3">
            <label className="space-y-1">
              <span className="text-[11px] font-medium uppercase tracking-wider text-gray-500">
                Story Points
              </span>
              <input
                type="number"
                min={0}
                value={form.storyPoints ?? ''}
                onChange={(e) =>
                  patch({ storyPoints: e.target.value ? parseInt(e.target.value, 10) : null })
                }
                className="w-full rounded-md border border-white/10 bg-[#151d30] px-2 py-1.5 text-sm text-gray-300 outline-none"
                placeholder="Points"
              />
            </label>
            <label className="space-y-1">
              <span className="text-[11px] font-medium uppercase tracking-wider text-gray-500">
                Assignee
              </span>
              <input
                type="text"
                value={form.assignee ?? ''}
                onChange={(e) => patch({ assignee: e.target.value || null })}
                className="w-full rounded-md border border-white/10 bg-[#151d30] px-2 py-1.5 text-sm text-gray-300 outline-none"
                placeholder="Assignee name"
              />
            </label>
          </div>

          {/* Tags */}
          <label className="space-y-1">
            <span className="text-[11px] font-medium uppercase tracking-wider text-gray-500">
              Tags
            </span>
            <input
              type="text"
              value={tagInput}
              onChange={(e) => setTagInput(e.target.value)}
              className="w-full rounded-md border border-white/10 bg-[#151d30] px-2 py-1.5 text-sm text-gray-300 outline-none"
              placeholder="Comma-separated tags"
            />
          </label>
        </div>

        {/* Footer */}
        <div className="mt-5 flex items-center justify-between border-t border-white/5 pt-4">
          {confirmDelete ? (
            <div className="flex items-center gap-2 text-xs text-red-400">
              <AlertTriangle size={14} />
              <span>Confirm delete?</span>
              <button
                onClick={() => onDelete(story.id)}
                className="rounded bg-red-500/20 px-2 py-0.5 font-semibold text-red-400 transition hover:bg-red-500/30"
              >
                Yes, delete
              </button>
              <button
                onClick={() => setConfirmDelete(false)}
                className="text-gray-500 hover:text-gray-300"
              >
                Cancel
              </button>
            </div>
          ) : (
            <button
              onClick={() => setConfirmDelete(true)}
              className="flex items-center gap-1 text-xs text-gray-500 transition hover:text-red-400"
            >
              <Trash2 size={12} /> Delete
            </button>
          )}
          <div className="flex gap-2">
            <button
              onClick={onClose}
              className="rounded-md px-3 py-1.5 text-sm text-gray-400 transition hover:text-gray-200"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              className="rounded-md bg-[#00d4ff] px-4 py-1.5 text-sm font-semibold text-[#0a0e17] transition hover:bg-[#00bde6]"
            >
              <span className="flex items-center gap-1.5">
                <Check size={14} /> Save
              </span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Column Component ────────────────────────────────────────────────────────

function Column({
  column,
  stories,
  onAddStory,
  onEditStory,
  onDeleteStory,
}: {
  column: (typeof KANBAN_COLUMNS)[number];
  stories: Story[];
  onAddStory: (story: Story) => void;
  onEditStory: (story: Story) => void;
  onDeleteStory: (id: string) => void;
}) {
  const [showAdd, setShowAdd] = useState(false);
  const count = stories.length;
  const isOverWip = column.wipLimit !== null && count >= column.wipLimit;
  const isAtWip = column.wipLimit !== null && count === column.wipLimit;

  return (
    <div className="flex w-72 flex-shrink-0 flex-col rounded-xl border border-white/5 bg-[#0d1320]">
      {/* Header */}
      <div
        className={`flex items-center justify-between rounded-t-xl border-b px-3 py-2.5 ${
          isOverWip && !isAtWip
            ? 'border-red-500/30 bg-red-500/10'
            : isAtWip
              ? 'border-amber-500/30 bg-amber-500/10'
              : 'border-white/5 bg-[#0d1320]'
        }`}
      >
        <div className="flex items-center gap-2">
          <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: column.color }} />
          <span className="text-sm font-semibold text-gray-200">{column.title}</span>
          <span className="rounded-full bg-white/5 px-1.5 py-0.5 text-[10px] font-bold text-gray-400">
            {count}
          </span>
        </div>
        {column.wipLimit !== null && (
          <span
            className={`text-[10px] font-medium ${
              isOverWip ? 'text-red-400' : isAtWip ? 'text-amber-400' : 'text-gray-600'
            }`}
          >
            WIP {count}/{column.wipLimit}
          </span>
        )}
      </div>

      {/* Cards */}
      <Droppable droppableId={column.id}>
        {(provided, snapshot) => (
          <div
            ref={provided.innerRef}
            {...provided.droppableProps}
            className={`flex-1 overflow-y-auto p-2 transition-colors ${
              snapshot.isDraggingOver ? 'bg-[#00d4ff]/[0.03]' : ''
            }`}
            style={{ minHeight: 80 }}
          >
            {stories.map((story, idx) => (
              <KanbanCard
                key={story.id}
                story={story}
                index={idx}
                onEdit={onEditStory}
                onDelete={onDeleteStory}
              />
            ))}
            {provided.placeholder}

            {/* Quick add form */}
            {showAdd && (
              <QuickAddForm
                status={column.id}
                onAdd={(story) => {
                  onAddStory(story);
                  setShowAdd(false);
                }}
                onCancel={() => setShowAdd(false)}
              />
            )}
          </div>
        )}
      </Droppable>

      {/* Add button */}
      {!showAdd && (
        <button
          onClick={() => setShowAdd(true)}
          className="m-2 flex items-center justify-center gap-1.5 rounded-lg border border-dashed border-white/10 py-2 text-xs text-gray-500 transition hover:border-[#00d4ff]/30 hover:text-[#00d4ff]"
        >
          <Plus size={14} /> Add card
        </button>
      )}
    </div>
  );
}

// ─── Main KanbanBoard Component ──────────────────────────────────────────────

export default function KanbanBoard() {
  const { stories, sprints } = usePMState();
  const dispatch = usePMDispatch();

  const [filters, setFilters] = useState<Filters>(emptyFilters);
  const [editingStory, setEditingStory] = useState<Story | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  // Derived data
  const assignees = useMemo(() => {
    const set = new Set<string>();
    stories.forEach((s) => s.assignee && set.add(s.assignee));
    return Array.from(set).sort();
  }, [stories]);

  const sprintOptions = useMemo(
    () => sprints.map((s) => ({ id: s.id, label: s.name ?? s.id })),
    [sprints],
  );

  // Filter stories
  const filteredStories = useMemo(() => {
    return stories.filter((s) => {
      if (filters.search && !s.title.toLowerCase().includes(filters.search.toLowerCase()))
        return false;
      if (filters.priority && s.priority !== filters.priority) return false;
      if (filters.type && s.type !== filters.type) return false;
      if (filters.assignee && s.assignee !== filters.assignee) return false;
      if (filters.sprint && s.sprintId !== filters.sprint) return false;
      return true;
    });
  }, [stories, filters]);

  // Group stories by status
  const storiesByStatus = useMemo(() => {
    const map: Record<StoryStatus, Story[]> = {
      backlog: [],
      todo: [],
      'in-progress': [],
      review: [],
      testing: [],
      done: [],
    };
    filteredStories.forEach((s) => {
      if (map[s.status]) map[s.status].push(s);
    });
    return map;
  }, [filteredStories]);

  // Drag-and-drop handler
  const handleDragEnd = useCallback(
    (result: DropResult) => {
      const { source, destination, draggableId } = result;
      if (!destination) return;

      const sameColumn = source.droppableId === destination.droppableId;
      const sameIndex = source.index === destination.index;

      if (sameColumn && sameIndex) return;

      if (!sameColumn) {
        dispatch({
          type: 'MOVE_STORY',
          payload: {
            storyId: draggableId,
            newStatus: destination.droppableId as StoryStatus,
            newIndex: destination.index,
          },
        });
      } else {
        const columnStories = [...storiesByStatus[source.droppableId as StoryStatus]];
        const [moved] = columnStories.splice(source.index, 1);
        columnStories.splice(destination.index, 0, moved);

        dispatch({
          type: 'REORDER_STORIES',
          payload: { status: source.droppableId as StoryStatus, storyIds: columnStories.map((s) => s.id) },
        });
      }
    },
    [dispatch, storiesByStatus],
  );

  // CRUD handlers
  const handleAddStory = useCallback(
    (story: Story) => {
      dispatch({ type: 'ADD_STORY', payload: story });
    },
    [dispatch],
  );

  const handleUpdateStory = useCallback(
    (story: Story) => {
      dispatch({ type: 'UPDATE_STORY', payload: { id: story.id, changes: story } });
      setEditingStory(null);
    },
    [dispatch],
  );

  const handleDeleteStory = useCallback(
    (id: string) => {
      if (deleteConfirm === id) {
        dispatch({ type: 'DELETE_STORY', payload: id });
        setDeleteConfirm(null);
        setEditingStory(null);
      } else {
        setDeleteConfirm(id);
        setTimeout(() => setDeleteConfirm(null), 3000);
      }
    },
    [dispatch, deleteConfirm],
  );

  const handleDeleteFromModal = useCallback(
    (id: string) => {
      dispatch({ type: 'DELETE_STORY', payload: id });
      setEditingStory(null);
    },
    [dispatch],
  );

  return (
    <div className="flex h-full flex-col">
      {/* Filters */}
      <FiltersBar
        filters={filters}
        onChange={setFilters}
        assignees={assignees}
        sprintOptions={sprintOptions}
      />

      {/* Board */}
      <DragDropContext onDragEnd={handleDragEnd}>
        <div className="flex flex-1 gap-4 overflow-x-auto pb-4">
          {KANBAN_COLUMNS.map((col) => (
            <Column
              key={col.id}
              column={col}
              stories={storiesByStatus[col.id]}
              onAddStory={handleAddStory}
              onEditStory={setEditingStory}
              onDeleteStory={handleDeleteStory}
            />
          ))}
        </div>
      </DragDropContext>

      {/* Edit Modal */}
      {editingStory && (
        <EditStoryModal
          story={editingStory}
          onSave={handleUpdateStory}
          onDelete={handleDeleteFromModal}
          onClose={() => setEditingStory(null)}
        />
      )}
    </div>
  );
}
