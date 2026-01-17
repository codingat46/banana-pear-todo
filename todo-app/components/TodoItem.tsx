'use client';

import { useState, useRef, useEffect } from 'react';
import confetti from 'canvas-confetti';

export type TodoType = 'personal' | 'work';

export interface Todo {
  id: string;
  text: string;
  completed: boolean;
  dueDate?: string;
  type: TodoType;
}

interface TodoItemProps {
  todo: Todo;
  onToggle: (id: string) => void;
  onDelete: (id: string) => void;
  onEdit: (id: string, text: string, dueDate?: string, type?: TodoType) => void;
  isDark?: boolean;
}

// Modern SVG icons for types
const PersonalIcon = () => (
  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25" />
  </svg>
);

const WorkIcon = () => (
  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 14.15v4.25c0 1.094-.787 2.036-1.872 2.18-2.087.277-4.216.42-6.378.42s-4.291-.143-6.378-.42c-1.085-.144-1.872-1.086-1.872-2.18v-4.25m16.5 0a2.18 2.18 0 00.75-1.661V8.706c0-1.081-.768-2.015-1.837-2.175a48.114 48.114 0 00-3.413-.387m4.5 8.006c-.194.165-.42.295-.673.38A23.978 23.978 0 0112 15.75c-2.648 0-5.195-.429-7.577-1.22a2.016 2.016 0 01-.673-.38m0 0A2.18 2.18 0 013 12.489V8.706c0-1.081.768-2.015 1.837-2.175a48.111 48.111 0 013.413-.387m7.5 0V5.25A2.25 2.25 0 0013.5 3h-3a2.25 2.25 0 00-2.25 2.25v.894m7.5 0a48.667 48.667 0 00-7.5 0M12 12.75h.008v.008H12v-.008z" />
  </svg>
);

export const TYPE_CONFIG = {
  personal: { label: 'Personal', color: '#8B5CF6', Icon: PersonalIcon },
  work: { label: 'Work', color: '#0EA5E9', Icon: WorkIcon },
};

function TodoIcon({ completed }: { completed: boolean }) {
  if (completed) {
    return (
      <div className="w-6 h-6 rounded-full bg-[#34c759] flex items-center justify-center">
        <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
        </svg>
      </div>
    );
  }
  return null;
}

export default function TodoItem({ todo, onToggle, onDelete, onEdit, isDark = false }: TodoItemProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editText, setEditText] = useState(todo.text);
  const [editDueDate, setEditDueDate] = useState(todo.dueDate || '');
  const [editType, setEditType] = useState<TodoType>(todo.type || 'personal');
  const [wasCompleted, setWasCompleted] = useState(todo.completed);
  const inputRef = useRef<HTMLInputElement>(null);
  const dateInputRef = useRef<HTMLInputElement>(null);
  const itemRef = useRef<HTMLDivElement>(null);

  const isOverdue = todo.dueDate && !todo.completed && new Date(todo.dueDate) < new Date();
  const todoType = todo.type || 'personal';
  const typeConfig = TYPE_CONFIG[todoType];
  const TypeIcon = typeConfig.Icon;

  // Play sad minor melody when uncompleting (like a disappointed sigh)
  const playSadMelody = () => {
    const audioContext = new (window.AudioContext || (window as typeof window & { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();

    // Descending G minor notes: D5 -> Bb4 -> G4 (sad descending minor)
    const notes = [587.33, 466.16, 392.00]; // D5, Bb4, G4
    const noteDuration = 0.18;
    const noteGap = 0.02;

    notes.forEach((freq, index) => {
      const startTime = audioContext.currentTime + index * (noteDuration + noteGap);

      // Main tone (sine for pure, piano-like sound)
      const osc = audioContext.createOscillator();
      const gain = audioContext.createGain();

      // Add a subtle second harmonic for richness
      const osc2 = audioContext.createOscillator();
      const gain2 = audioContext.createGain();

      osc.type = 'sine';
      osc.frequency.value = freq;
      osc2.type = 'sine';
      osc2.frequency.value = freq * 2; // octave up, quieter

      osc.connect(gain);
      osc2.connect(gain2);
      gain.connect(audioContext.destination);
      gain2.connect(audioContext.destination);

      // Piano-like envelope: quick attack, gentle decay
      gain.gain.setValueAtTime(0, startTime);
      gain.gain.linearRampToValueAtTime(0.25, startTime + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.01, startTime + noteDuration);

      gain2.gain.setValueAtTime(0, startTime);
      gain2.gain.linearRampToValueAtTime(0.08, startTime + 0.02);
      gain2.gain.exponentialRampToValueAtTime(0.01, startTime + noteDuration);

      osc.start(startTime);
      osc.stop(startTime + noteDuration);
      osc2.start(startTime);
      osc2.stop(startTime + noteDuration);
    });
  };

  // Trigger confetti when todo becomes completed, groan when uncompleted
  useEffect(() => {
    if (todo.completed && !wasCompleted && itemRef.current) {
      const rect = itemRef.current.getBoundingClientRect();
      const x = (rect.left + rect.width / 2) / window.innerWidth;
      const y = (rect.top + rect.height / 2) / window.innerHeight;

      confetti({
        particleCount: 50,
        spread: 60,
        origin: { x, y },
        colors: ['#34c759', '#5CD85A', '#FECA57', '#FF6B6B', '#54A0FF', '#9B59B6'],
        ticks: 100,
        gravity: 1.2,
        scalar: 0.8,
      });
    } else if (!todo.completed && wasCompleted) {
      // Play sad melody when unchecking
      playSadMelody();
    }
    setWasCompleted(todo.completed);
  }, [todo.completed, wasCompleted]);

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [isEditing]);

  const handleSave = () => {
    if (editText.trim()) {
      onEdit(todo.id, editText.trim(), editDueDate || undefined, editType);
      setIsEditing(false);
    }
  };

  const handleCancel = () => {
    setEditText(todo.text);
    setEditDueDate(todo.dueDate || '');
    setEditType(todo.type || 'personal');
    setIsEditing(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSave();
    } else if (e.key === 'Escape') {
      handleCancel();
    }
  };

  const handleTextClick = () => {
    if (!todo.completed) {
      setIsEditing(true);
    }
  };

  const formatDateTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  };

  if (isEditing) {
    return (
      <div className={`p-4 rounded-xl transition-colors ${
        isDark ? 'bg-[#1d1d1f]/80' : 'bg-[#f5f5f7]/80'
      } backdrop-blur-sm`}>
        <input
          ref={inputRef}
          type="text"
          value={editText}
          onChange={(e) => setEditText(e.target.value)}
          onKeyDown={handleKeyDown}
          className={`w-full px-4 py-3 rounded-xl text-base outline-none ${
            isDark
              ? 'bg-[#2d2d2d] text-[#f5f5f7] border border-[#424245] focus:border-[#2997ff]'
              : 'bg-white text-[#1d1d1f] border border-[#d2d2d7] focus:border-[#0071e3]'
          }`}
        />
        <div className="flex flex-wrap items-center gap-2 mt-3">
          {/* Type selector */}
          <div className="flex gap-1">
            {(Object.keys(TYPE_CONFIG) as TodoType[]).map((type) => {
              const config = TYPE_CONFIG[type];
              const Icon = config.Icon;
              return (
                <button
                  key={type}
                  type="button"
                  onClick={() => setEditType(type)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                    editType === type
                      ? 'text-white'
                      : isDark
                        ? 'bg-[#2d2d2d] text-[#86868b] hover:text-[#f5f5f7]'
                        : 'bg-white text-[#86868b] hover:text-[#1d1d1f]'
                  }`}
                  style={editType === type ? { backgroundColor: config.color } : {}}
                >
                  <Icon />
                  {config.label}
                </button>
              );
            })}
          </div>

          {/* Date picker - with overlay input for iOS compatibility */}
          <div className="relative">
            <div
              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium transition-all cursor-pointer ${
                isDark
                  ? 'bg-[#2d2d2d] text-[#f5f5f7] hover:bg-[#3d3d3d]'
                  : 'bg-white text-[#1d1d1f] hover:bg-[#e8e8ed]'
              }`}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              {editDueDate ? formatDateTime(editDueDate) : 'Due date'}
            </div>
            <input
              ref={dateInputRef}
              type="datetime-local"
              value={editDueDate}
              onChange={(e) => setEditDueDate(e.target.value)}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              style={{ colorScheme: isDark ? 'dark' : 'light' }}
            />
          </div>

          {editDueDate && (
            <button
              type="button"
              onClick={() => setEditDueDate('')}
              className={`p-1.5 rounded-lg transition-all ${
                isDark
                  ? 'text-[#86868b] hover:text-[#ff453a] hover:bg-[#2d2d2d]'
                  : 'text-[#86868b] hover:text-[#ff3b30] hover:bg-white'
              }`}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}

          <div className="flex gap-2 ml-auto">
            <button
              onClick={handleSave}
              className="px-4 py-1.5 rounded-lg text-sm font-medium bg-[#34c759] text-white hover:bg-[#30d158] transition-all active:scale-95"
            >
              Save
            </button>
            <button
              onClick={handleCancel}
              className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-all active:scale-95 ${
                isDark
                  ? 'bg-[#424245] text-[#f5f5f7] hover:bg-[#555555]'
                  : 'bg-[#e8e8ed] text-[#1d1d1f] hover:bg-[#d2d2d7]'
              }`}
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      ref={itemRef}
      className={`group flex items-center gap-3 p-4 rounded-xl transition-all cursor-grab active:cursor-grabbing ${
        isDark
          ? 'hover:bg-[#1d1d1f]/60'
          : 'hover:bg-[#f5f5f7]/60'
      } ${isOverdue ? 'ring-2 ring-[#ff3b30] ring-inset' : ''}`}
    >
      {/* Drag Handle - always visible */}
      <div className={`flex-shrink-0 opacity-30 group-hover:opacity-60 transition-opacity ${
        isDark ? 'text-[#666]' : 'text-[#aaa]'
      }`}>
        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
          <circle cx="9" cy="6" r="1.5" />
          <circle cx="15" cy="6" r="1.5" />
          <circle cx="9" cy="12" r="1.5" />
          <circle cx="15" cy="12" r="1.5" />
          <circle cx="9" cy="18" r="1.5" />
          <circle cx="15" cy="18" r="1.5" />
        </svg>
      </div>

      {/* Checkbox */}
      <button
        onClick={() => onToggle(todo.id)}
        className="flex-shrink-0 transition-transform active:scale-90"
      >
        {todo.completed ? (
          <TodoIcon completed={true} />
        ) : (
          <div
            className="w-6 h-6 rounded-full border-2 transition-colors hover:border-[#86868b]"
            style={{ borderColor: typeConfig.color }}
          />
        )}
      </button>

      {/* Type Badge */}
      <span
        className="flex-shrink-0 flex items-center gap-1 text-xs px-2 py-1 rounded-full text-white font-medium"
        style={{ backgroundColor: typeConfig.color }}
      >
        <TypeIcon />
      </span>

      {/* Content */}
      <div
        className={`flex-1 min-w-0 ${!todo.completed ? 'cursor-text' : ''}`}
        onClick={handleTextClick}
      >
        <p className={`text-base transition-colors ${
          todo.completed
            ? 'line-through text-[#86868b]'
            : isDark
              ? 'text-[#f5f5f7] hover:text-[#2997ff]'
              : 'text-[#1d1d1f] hover:text-[#0071e3]'
        }`}>
          {todo.text}
        </p>
        {todo.dueDate && (
          <p className={`text-sm mt-1 flex items-center gap-1 ${
            isOverdue ? 'text-[#ff3b30] font-medium' : 'text-[#86868b]'
          }`}>
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            {formatDateTime(todo.dueDate)}
            {isOverdue && ' — Overdue'}
          </p>
        )}
      </div>

      {/* Delete button - always visible */}
      <button
        onClick={() => onDelete(todo.id)}
        className={`flex-shrink-0 p-2 rounded-lg opacity-50 hover:opacity-100 transition-all ${
          isDark
            ? 'text-[#86868b] hover:text-[#ff453a] hover:bg-[#2d2d2d] active:text-[#ff453a]'
            : 'text-[#86868b] hover:text-[#ff3b30] hover:bg-[#f5f5f7] active:text-[#ff3b30]'
        }`}
        title="Delete"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
        </svg>
      </button>
    </div>
  );
}
