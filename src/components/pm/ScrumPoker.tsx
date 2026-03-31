import { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import {
  Eye,
  RotateCcw,
  Check,
  Coffee,
  HelpCircle,
  Users,
  Award,
  BarChart3,
  XCircle,
  ChevronRight,
  Sparkles,
  Timer,
  Play,
  Pause,
  RotateCw,
} from 'lucide-react';
import { usePMState, usePMDispatch } from '../../context/PMContext';
import type { PokerCardValue } from '../../types/pm';
import { POKER_CARDS } from '../../constants/pm';

// ─── Numeric helpers ─────────────────────────────────────────────────────────

const NUMERIC_VALUES: Record<string, number> = {
  '0': 0, '1': 1, '2': 2, '3': 3, '5': 5, '8': 8,
  '13': 13, '21': 21, '34': 34, '55': 55, '89': 89,
};

function isNumericCard(v: PokerCardValue): boolean {
  return v in NUMERIC_VALUES;
}

function numericValue(v: PokerCardValue): number {
  return NUMERIC_VALUES[v] ?? 0;
}

// ─── AI vote generation ──────────────────────────────────────────────────────

function generateAIVote(userValue: PokerCardValue): PokerCardValue {
  const numericCards = POKER_CARDS.filter(isNumericCard);

  // Special cards: small chance AI picks one too
  if (!isNumericCard(userValue)) {
    return numericCards[Math.floor(Math.random() * numericCards.length)];
  }

  const userIdx = numericCards.indexOf(userValue);
  // Bias toward user's pick: gaussian-ish distribution centered on user choice
  const offsets = [-2, -1, -1, 0, 0, 0, 0, 0, 1, 1, 2];
  const offset = offsets[Math.floor(Math.random() * offsets.length)];
  const idx = Math.max(0, Math.min(numericCards.length - 1, userIdx + offset));
  return numericCards[idx];
}

// ─── Statistics ──────────────────────────────────────────────────────────────

interface VoteStats {
  numericVotes: number[];
  min: number;
  max: number;
  average: number;
  mode: number;
  agreement: 'unanimous' | 'close' | 'spread';
}

function computeStats(votes: Record<string, PokerCardValue>): VoteStats | null {
  const numericVotes = Object.values(votes)
    .filter(isNumericCard)
    .map(numericValue);

  if (numericVotes.length === 0) return null;

  const min = Math.min(...numericVotes);
  const max = Math.max(...numericVotes);
  const average = Math.round((numericVotes.reduce((a, b) => a + b, 0) / numericVotes.length) * 10) / 10;

  // Mode
  const freq: Record<number, number> = {};
  numericVotes.forEach((v) => { freq[v] = (freq[v] || 0) + 1; });
  const maxFreq = Math.max(...Object.values(freq));
  const mode = Number(Object.entries(freq).find(([, f]) => f === maxFreq)![0]);

  // Agreement
  const uniqueValues = new Set(numericVotes);
  let agreement: 'unanimous' | 'close' | 'spread';
  if (uniqueValues.size === 1) {
    agreement = 'unanimous';
  } else if (max - min <= 3) {
    agreement = 'close';
  } else {
    agreement = 'spread';
  }

  return { numericVotes, min, max, average, mode, agreement };
}

// ─── Timer hook ──────────────────────────────────────────────────────────────

function useTimer(initialSeconds: number) {
  const [seconds, setSeconds] = useState(initialSeconds);
  const [running, setRunning] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (running && seconds > 0) {
      intervalRef.current = setInterval(() => {
        setSeconds((s) => {
          if (s <= 1) {
            setRunning(false);
            return 0;
          }
          return s - 1;
        });
      }, 1000);
    }
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, [running, seconds]);

  const toggle = useCallback(() => setRunning((r) => !r), []);
  const reset = useCallback(() => { setRunning(false); setSeconds(initialSeconds); }, [initialSeconds]);

  return { seconds, running, toggle, reset };
}

function formatTime(secs: number) {
  const m = Math.floor(secs / 60);
  const s = secs % 60;
  return `${m}:${s.toString().padStart(2, '0')}`;
}

// ─── Card Component ──────────────────────────────────────────────────────────

function PokerCard({
  value,
  selected,
  onClick,
  index,
  total,
  disabled,
}: {
  value: PokerCardValue;
  selected: boolean;
  onClick: () => void;
  index: number;
  total: number;
  disabled: boolean;
}) {
  // Fan layout: slight rotation + offset
  const mid = (total - 1) / 2;
  const rotation = (index - mid) * 4;
  const translateY = Math.abs(index - mid) * 6;

  const isSpecial = value === '?' || value === '☕';

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className="group relative flex-shrink-0 transition-all duration-300 ease-out"
      style={{
        transform: `rotate(${rotation}deg) translateY(${selected ? -20 + translateY : translateY}px)`,
        zIndex: selected ? 50 : index,
      }}
    >
      <div
        className={[
          'relative flex h-28 w-20 flex-col items-center justify-between rounded-xl border-2 p-2 transition-all duration-300',
          'cursor-pointer select-none',
          selected
            ? 'border-[#00d4ff] bg-gradient-to-br from-[#0c2d48] to-[#0a1628] shadow-[0_0_20px_rgba(0,212,255,0.4),0_0_40px_rgba(0,212,255,0.15)]'
            : 'border-white/10 bg-gradient-to-br from-[#151d30] to-[#0f1525] hover:border-[#00d4ff]/40 hover:shadow-[0_0_12px_rgba(0,212,255,0.15)]',
          disabled && !selected ? 'opacity-40 cursor-not-allowed' : '',
          !selected ? 'group-hover:-translate-y-2' : '',
        ].join(' ')}
      >
        {/* Top-left value */}
        <span
          className={[
            'self-start text-[10px] font-bold',
            selected ? 'text-[#00d4ff]' : 'text-gray-400',
            isSpecial ? 'text-xs' : '',
          ].join(' ')}
        >
          {value}
        </span>

        {/* Center value */}
        <span
          className={[
            'font-bold transition-colors',
            selected ? 'text-[#00d4ff]' : 'text-gray-200',
            value.length <= 2 ? 'text-2xl' : 'text-xl',
            isSpecial ? 'text-2xl' : '',
          ].join(' ')}
        >
          {value === '☕' ? <Coffee size={24} className={selected ? 'text-[#00d4ff]' : 'text-gray-300'} /> : value === '?' ? <HelpCircle size={24} className={selected ? 'text-[#00d4ff]' : 'text-gray-300'} /> : value}
        </span>

        {/* Bottom-right value (rotated) */}
        <span
          className={[
            'self-end rotate-180 text-[10px] font-bold',
            selected ? 'text-[#00d4ff]' : 'text-gray-400',
            isSpecial ? 'text-xs' : '',
          ].join(' ')}
        >
          {value}
        </span>

        {/* Selected glow ring */}
        {selected && (
          <div className="absolute inset-0 rounded-xl ring-1 ring-[#00d4ff]/30 animate-pulse" />
        )}
      </div>
    </button>
  );
}

// ─── Card Back ───────────────────────────────────────────────────────────────

function CardBack({ small }: { small?: boolean }) {
  const size = small ? 'h-8 w-6' : 'h-10 w-7';
  return (
    <div
      className={`${size} rounded-md border border-[#00d4ff]/30 bg-gradient-to-br from-[#0c2d48] to-[#0a1628] flex items-center justify-center`}
    >
      <div className="text-[#00d4ff]/40 text-xs font-bold">✦</div>
    </div>
  );
}

// ─── Participant Row ─────────────────────────────────────────────────────────

function ParticipantRow({
  name,
  hasVoted,
  revealed,
  vote,
  isUser,
  isMin,
  isMax,
}: {
  name: string;
  hasVoted: boolean;
  revealed: boolean;
  vote?: PokerCardValue;
  isUser: boolean;
  isMin: boolean;
  isMax: boolean;
}) {
  const initials = name.slice(0, 2).toUpperCase();

  return (
    <div
      className={[
        'flex items-center gap-3 rounded-lg border px-3 py-2 transition-all',
        revealed && isMin ? 'border-blue-500/30 bg-blue-500/5' : '',
        revealed && isMax ? 'border-orange-500/30 bg-orange-500/5' : '',
        !isMin && !isMax ? 'border-white/5 bg-white/[0.02]' : '',
      ].join(' ')}
    >
      {/* Avatar */}
      <div
        className={[
          'flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold',
          isUser
            ? 'bg-[#00d4ff]/20 text-[#00d4ff]'
            : 'bg-white/10 text-gray-300',
        ].join(' ')}
      >
        {initials}
      </div>

      {/* Name */}
      <span className={`flex-1 text-sm font-medium ${isUser ? 'text-[#00d4ff]' : 'text-gray-200'}`}>
        {name}
        {isUser && <span className="ml-1 text-[10px] text-gray-500">(you)</span>}
      </span>

      {/* Vote status */}
      {!hasVoted && (
        <span className="text-xs text-gray-500 italic">Waiting…</span>
      )}
      {hasVoted && !revealed && (
        <div className="flex items-center gap-1.5">
          <CardBack small />
          <Check size={14} className="text-green-400" />
        </div>
      )}
      {hasVoted && revealed && vote && (
        <div className="flex items-center gap-1.5">
          <span
            className={[
              'flex h-8 w-8 items-center justify-center rounded-lg border font-bold text-sm',
              isMin ? 'border-blue-400/50 text-blue-400 bg-blue-500/10' : '',
              isMax ? 'border-orange-400/50 text-orange-400 bg-orange-500/10' : '',
              !isMin && !isMax ? 'border-[#00d4ff]/30 text-[#00d4ff] bg-[#00d4ff]/10' : '',
            ].join(' ')}
          >
            {vote === '☕' ? '☕' : vote === '?' ? '?' : vote}
          </span>
          {isMin && <span className="text-[10px] text-blue-400">LOW</span>}
          {isMax && <span className="text-[10px] text-orange-400">HIGH</span>}
        </div>
      )}
    </div>
  );
}

// ─── Results Panel ───────────────────────────────────────────────────────────

function ResultsPanel({
  stats,
  onAccept,
  onRevote,
}: {
  stats: VoteStats;
  onAccept: (pts: number) => void;
  onRevote: () => void;
}) {
  const agreementConfig = {
    unanimous: { label: 'Unanimous!', color: '#22c55e', icon: Sparkles, bg: 'bg-green-500/10', border: 'border-green-500/30' },
    close: { label: 'Close Consensus', color: '#eab308', icon: Award, bg: 'bg-yellow-500/10', border: 'border-yellow-500/30' },
    spread: { label: 'Discussion Needed', color: '#ef4444', icon: BarChart3, bg: 'bg-red-500/10', border: 'border-red-500/30' },
  };

  const ac = agreementConfig[stats.agreement];
  const AcIcon = ac.icon;

  // Suggested estimate: use mode
  const suggested = stats.mode;

  return (
    <div className="space-y-4">
      {/* Agreement banner */}
      <div className={`flex items-center gap-3 rounded-xl border ${ac.border} ${ac.bg} px-4 py-3`}>
        <AcIcon size={20} style={{ color: ac.color }} />
        <span className="text-sm font-semibold" style={{ color: ac.color }}>
          {ac.label}
        </span>
      </div>

      {/* Stat pills */}
      <div className="grid grid-cols-4 gap-2">
        {[
          { label: 'Min', value: stats.min, color: '#3b82f6' },
          { label: 'Max', value: stats.max, color: '#f97316' },
          { label: 'Average', value: stats.average, color: '#a855f7' },
          { label: 'Mode', value: stats.mode, color: '#00d4ff' },
        ].map((s) => (
          <div
            key={s.label}
            className="flex flex-col items-center rounded-lg border border-white/5 bg-white/[0.02] py-2"
          >
            <span className="text-[10px] uppercase tracking-wider text-gray-500">{s.label}</span>
            <span className="text-lg font-bold" style={{ color: s.color }}>{s.value}</span>
          </div>
        ))}
      </div>

      {/* Actions */}
      <div className="flex gap-2">
        <button
          onClick={() => onAccept(suggested)}
          className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-[#00d4ff] px-4 py-2.5 text-sm font-bold text-[#0a0e17] transition hover:bg-[#00bde0] hover:shadow-[0_0_20px_rgba(0,212,255,0.3)]"
        >
          <Check size={16} />
          Accept {suggested} pts
        </button>
        <button
          onClick={onRevote}
          className="flex items-center gap-2 rounded-lg border border-white/10 bg-white/5 px-4 py-2.5 text-sm font-medium text-gray-300 transition hover:border-[#00d4ff]/30 hover:text-white"
        >
          <RotateCcw size={16} />
          Re-vote
        </button>
      </div>
    </div>
  );
}

// ─── Main Component ──────────────────────────────────────────────────────────

export default function ScrumPoker(){
  const { stories, pokerSession } = usePMState();
  const dispatch = usePMDispatch();

  const [selectedCard, setSelectedCard] = useState<PokerCardValue | null>(null);
  const [aiVoting, setAiVoting] = useState(false);
  const timer = useTimer(120); // 2 min discussion timer

  // Current story being estimated
  const story = useMemo(() => {
    if (!pokerSession) return null;
    return stories.find((s) => s.id === pokerSession.storyId) ?? null;
  }, [stories, pokerSession]);

  // AI participants (everyone except "You")
  const aiParticipants = useMemo(() => {
    if (!pokerSession) return [];
    return pokerSession.participants.filter((p) => p !== 'You');
  }, [pokerSession]);

  // Stats after reveal
  const stats = useMemo(() => {
    if (!pokerSession?.revealed) return null;
    return computeStats(pokerSession.votes);
  }, [pokerSession]);

  // Min/max values for highlighting
  const minMax = useMemo(() => {
    if (!stats || !pokerSession?.revealed) return { minNames: new Set<string>(), maxNames: new Set<string>() };
    const minNames = new Set<string>();
    const maxNames = new Set<string>();
    Object.entries(pokerSession.votes).forEach(([name, v]) => {
      if (isNumericCard(v)) {
        if (numericValue(v) === stats.min) minNames.add(name);
        if (numericValue(v) === stats.max) maxNames.add(name);
      }
    });
    return { minNames, maxNames };
  }, [pokerSession, stats]);

  // Handle user card selection
  const handleSelectCard = useCallback(
    (value: PokerCardValue) => {
      if (!pokerSession || pokerSession.revealed || aiVoting) return;

      setSelectedCard(value);
      dispatch({ type: 'CAST_VOTE', payload: { participant: 'You', value } });

      // Generate AI votes with staggered delays
      setAiVoting(true);
      aiParticipants.forEach((name, i) => {
        setTimeout(() => {
          const aiVote = generateAIVote(value);
          dispatch({ type: 'CAST_VOTE', payload: { participant: name, value: aiVote } });

          // All done
          if (i === aiParticipants.length - 1) {
            setAiVoting(false);
          }
        }, 400 + i * (300 + Math.random() * 500));
      });
    },
    [pokerSession, aiVoting, dispatch, aiParticipants],
  );

  // Reveal
  const handleReveal = useCallback(() => {
    dispatch({ type: 'REVEAL_VOTES' });
  }, [dispatch]);

  // Accept estimate
  const handleAccept = useCallback(
    (pts: number) => {
      dispatch({ type: 'SET_FINAL_ESTIMATE', payload: pts });
      dispatch({ type: 'END_POKER' });
    },
    [dispatch],
  );

  // Re-vote
  const handleRevote = useCallback(() => {
    if (!pokerSession) return;
    setSelectedCard(null);
    dispatch({
      type: 'START_POKER',
      payload: { storyId: pokerSession.storyId, participants: pokerSession.participants },
    });
  }, [dispatch, pokerSession]);

  // End session
  const handleEnd = useCallback(() => {
    dispatch({ type: 'END_POKER' });
  }, [dispatch]);

  // All participants voted?
  const allVoted = useMemo(() => {
    if (!pokerSession) return false;
    return pokerSession.participants.every((p) => p in pokerSession.votes);
  }, [pokerSession]);

  // ── No active session ────────────────────────────────────────────────────

  if (!pokerSession || !story) {
    return (
      <div className="flex flex-col items-center justify-center rounded-2xl border border-white/5 bg-[#0d1320] p-12 text-center">
        <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-[#00d4ff]/10">
          <Users size={28} className="text-[#00d4ff]" />
        </div>
        <h3 className="mb-2 text-lg font-semibold text-gray-200">No Active Poker Session</h3>
        <p className="max-w-sm text-sm text-gray-500">
          Select a story from the backlog and click <strong>"Estimate"</strong> to start a Planning Poker session.
        </p>
      </div>
    );
  }

  // ── Active session ───────────────────────────────────────────────────────

  return (
    <div className="space-y-6">
      {/* Header row */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#00d4ff]/10">
            <Users size={18} className="text-[#00d4ff]" />
          </div>
          <h2 className="text-lg font-bold text-gray-100">Planning Poker</h2>
        </div>
        <button
          onClick={handleEnd}
          className="flex items-center gap-1.5 rounded-lg border border-white/10 px-3 py-1.5 text-xs text-gray-400 transition hover:border-red-500/30 hover:text-red-400"
        >
          <XCircle size={14} />
          End Session
        </button>
      </div>

      {/* Story card */}
      <div className="rounded-xl border border-white/5 bg-[#0d1320] p-5">
        <div className="mb-1 flex items-center gap-2 text-xs text-gray-500 uppercase tracking-wider">
          <ChevronRight size={12} />
          Estimating Story
        </div>
        <h3 className="mb-2 text-base font-semibold text-gray-100">{story.title}</h3>
        {story.description && (
          <p className="mb-3 text-sm leading-relaxed text-gray-400">{story.description}</p>
        )}
        {story.acceptanceCriteria.length > 0 && (
          <div className="space-y-1">
            <span className="text-[10px] uppercase tracking-wider text-gray-500">Acceptance Criteria</span>
            <ul className="space-y-1">
              {story.acceptanceCriteria.map((ac, i) => (
                <li key={i} className="flex items-start gap-2 text-sm text-gray-300">
                  <Check size={12} className="mt-0.5 flex-shrink-0 text-green-400/60" />
                  {ac}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      {/* Main layout: Cards + Participants */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_280px]">
        {/* Left: Cards & results */}
        <div className="space-y-6">
          {/* Card fan */}
          <div className="rounded-xl border border-white/5 bg-[#0d1320] p-6">
            <div className="mb-4 flex items-center justify-between">
              <span className="text-xs uppercase tracking-wider text-gray-500">
                {pokerSession.revealed ? 'Your Selection' : 'Select Your Estimate'}
              </span>
              {/* Discussion timer */}
              <div className="flex items-center gap-2">
                <Timer size={14} className="text-gray-500" />
                <span
                  className={`font-mono text-sm ${
                    timer.seconds <= 10 && timer.running ? 'text-red-400 animate-pulse' : 'text-gray-400'
                  }`}
                >
                  {formatTime(timer.seconds)}
                </span>
                <button
                  onClick={timer.toggle}
                  className="rounded-md p-1 text-gray-500 transition hover:bg-white/5 hover:text-gray-300"
                  title={timer.running ? 'Pause' : 'Start'}
                >
                  {timer.running ? <Pause size={12} /> : <Play size={12} />}
                </button>
                <button
                  onClick={timer.reset}
                  className="rounded-md p-1 text-gray-500 transition hover:bg-white/5 hover:text-gray-300"
                  title="Reset timer"
                >
                  <RotateCw size={12} />
                </button>
              </div>
            </div>

            {/* The card fan */}
            <div className="flex items-end justify-center gap-1 pb-4 pt-2 overflow-x-auto">
              {POKER_CARDS.map((card, i) => (
                <PokerCard
                  key={card}
                  value={card}
                  selected={selectedCard === card}
                  onClick={() => handleSelectCard(card)}
                  index={i}
                  total={POKER_CARDS.length}
                  disabled={pokerSession.revealed || aiVoting}
                />
              ))}
            </div>
          </div>

          {/* Reveal / Results */}
          {!pokerSession.revealed ? (
            <div className="flex justify-center">
              <button
                onClick={handleReveal}
                disabled={!allVoted && !selectedCard}
                className={[
                  'flex items-center gap-2 rounded-xl px-8 py-3 text-sm font-bold transition-all',
                  allVoted
                    ? 'bg-[#00d4ff] text-[#0a0e17] shadow-[0_0_24px_rgba(0,212,255,0.3)] hover:bg-[#00bde0]'
                    : selectedCard
                      ? 'border border-[#00d4ff]/30 bg-[#00d4ff]/10 text-[#00d4ff] hover:bg-[#00d4ff]/20'
                      : 'border border-white/10 bg-white/5 text-gray-500 cursor-not-allowed',
                ].join(' ')}
              >
                <Eye size={18} />
                {allVoted ? 'Reveal Cards' : selectedCard ? 'Force Reveal' : 'Waiting for votes…'}
              </button>
            </div>
          ) : (
            stats && <ResultsPanel stats={stats} onAccept={handleAccept} onRevote={handleRevote} />
          )}
        </div>

        {/* Right: Participants */}
        <div className="rounded-xl border border-white/5 bg-[#0d1320] p-4">
          <div className="mb-3 flex items-center gap-2 text-xs uppercase tracking-wider text-gray-500">
            <Users size={12} />
            Participants ({pokerSession.participants.length})
          </div>
          <div className="space-y-2">
            {pokerSession.participants.map((name) => (
              <ParticipantRow
                key={name}
                name={name}
                hasVoted={name in pokerSession.votes}
                revealed={pokerSession.revealed}
                vote={pokerSession.votes[name]}
                isUser={name === 'You'}
                isMin={minMax.minNames.has(name)}
                isMax={minMax.maxNames.has(name)}
              />
            ))}
          </div>

          {/* Vote progress */}
          <div className="mt-4 rounded-lg border border-white/5 bg-white/[0.02] p-3">
            <div className="mb-1.5 flex items-center justify-between text-[10px] uppercase tracking-wider text-gray-500">
              <span>Votes cast</span>
              <span>
                {Object.keys(pokerSession.votes).length}/{pokerSession.participants.length}
              </span>
            </div>
            <div className="h-1.5 overflow-hidden rounded-full bg-white/5">
              <div
                className="h-full rounded-full bg-gradient-to-r from-[#00d4ff] to-[#00d4ff]/60 transition-all duration-500"
                style={{
                  width: `${(Object.keys(pokerSession.votes).length / pokerSession.participants.length) * 100}%`,
                }}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
