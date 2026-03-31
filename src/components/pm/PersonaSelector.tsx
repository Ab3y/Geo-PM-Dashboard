import { useState, useRef, useEffect } from 'react';
import {
  Briefcase,
  Shield,
  Code,
  Target,
  TestTube,
  BarChart3,
  Eye,
  Server,
  ChevronDown,
  Check,
} from 'lucide-react';
import { usePersonaState, usePersonaDispatch } from '../../context/PersonaContext';
import { PERSONAS } from '../../constants/pm';
import type { PersonaRole } from '../../types/pm';

const ICON_MAP: Record<string, React.ComponentType<{ size?: number; className?: string }>> = {
  Briefcase, Shield, Code, Target, TestTube, BarChart3, Eye, Server,
};

export default function PersonaSelector() {
  const { currentPersona } = usePersonaState();
  const dispatch = usePersonaDispatch();
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const current = PERSONAS.find(p => p.id === currentPersona)!;
  const CurrentIcon = ICON_MAP[current.icon] ?? Briefcase;

  // Close on outside click
  useEffect(() => {
    if (!open) return;
    function handleClick(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [open]);

  // Close on Escape
  useEffect(() => {
    if (!open) return;
    function handleKey(e: KeyboardEvent) {
      if (e.key === 'Escape') setOpen(false);
    }
    document.addEventListener('keydown', handleKey);
    return () => document.removeEventListener('keydown', handleKey);
  }, [open]);

  function selectPersona(id: PersonaRole) {
    dispatch({ type: 'SET_PERSONA', payload: id });
    setOpen(false);
  }

  return (
    <div ref={containerRef} className="relative">
      {/* Trigger button */}
      <button
        onClick={() => setOpen(prev => !prev)}
        className="flex items-center gap-2 px-3 py-2 rounded-lg bg-white/5 border border-white/10 hover:border-[#00d4ff]/40 hover:bg-white/8 transition-all cursor-pointer"
      >
        <CurrentIcon size={16} className="text-[#00d4ff]" />
        <span className="text-sm font-medium text-white hidden sm:inline">{current.label}</span>
        <ChevronDown
          size={14}
          className={`text-gray-400 transition-transform duration-200 ${open ? 'rotate-180' : ''}`}
        />
      </button>

      {/* Dropdown panel */}
      <div
        className={`absolute right-0 top-full mt-2 w-80 bg-[#0c1220] border border-white/10 rounded-xl shadow-2xl shadow-black/60 z-50 overflow-hidden transition-all duration-200 origin-top-right
          ${open ? 'opacity-100 scale-100 pointer-events-auto' : 'opacity-0 scale-95 pointer-events-none'}`}
      >
        <div className="px-4 py-3 border-b border-white/5">
          <p className="text-xs text-gray-500 uppercase tracking-wider font-semibold">Switch Persona</p>
        </div>
        <div className="py-1 max-h-96 overflow-y-auto">
          {PERSONAS.map(persona => {
            const Icon = ICON_MAP[persona.icon] ?? Briefcase;
            const isActive = persona.id === currentPersona;
            return (
              <button
                key={persona.id}
                onClick={() => selectPersona(persona.id)}
                className={`w-full flex items-start gap-3 px-4 py-3 text-left transition-colors cursor-pointer
                  ${isActive
                    ? 'bg-[#00d4ff]/10'
                    : 'hover:bg-white/5'
                  }`}
              >
                <div
                  className={`mt-0.5 p-1.5 rounded-lg shrink-0 ${
                    isActive ? 'bg-[#00d4ff]/20 text-[#00d4ff]' : 'bg-white/5 text-gray-400'
                  }`}
                >
                  <Icon size={16} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className={`text-sm font-medium ${isActive ? 'text-[#00d4ff]' : 'text-white'}`}>
                      {persona.label}
                    </span>
                    {isActive && <Check size={14} className="text-[#00d4ff]" />}
                  </div>
                  <p className="text-xs text-gray-500 mt-0.5 line-clamp-2">{persona.description}</p>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
