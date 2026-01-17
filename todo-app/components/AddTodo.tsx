'use client';

import { useState, useRef } from 'react';
import { TodoType, TYPE_CONFIG } from './TodoItem';

interface AddTodoProps {
  onAdd: (text: string, dueDate?: string, type?: TodoType) => void;
  isDark?: boolean;
}

export default function AddTodo({ onAdd, isDark = false }: AddTodoProps) {
  const [text, setText] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [todoType, setTodoType] = useState<TodoType>('personal');
  const [showTypeMenu, setShowTypeMenu] = useState(false);
  const dateInputRef = useRef<HTMLInputElement>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (text.trim()) {
      onAdd(text.trim(), dueDate || undefined, todoType);
      setText('');
      setDueDate('');
    }
  };

  const formatDateTime = (dateString: string) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  };

  const currentTypeConfig = TYPE_CONFIG[todoType];
  const CurrentIcon = currentTypeConfig.Icon;

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-3">
      {/* Main input row - all on one line */}
      <div className="flex items-center gap-2">
        {/* Type selector */}
        <div className="relative">
          <button
            type="button"
            onClick={() => setShowTypeMenu(!showTypeMenu)}
            className="flex items-center gap-1.5 px-3 py-3 rounded-xl text-sm font-medium text-white transition-all hover:opacity-90 active:scale-95"
            style={{ backgroundColor: currentTypeConfig.color }}
          >
            <CurrentIcon />
            <svg
              className={`w-3 h-3 transition-transform ${showTypeMenu ? 'rotate-180' : ''}`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>

          {showTypeMenu && (
            <div
              className={`absolute top-full mt-1 left-0 py-1 rounded-xl shadow-lg border z-10 min-w-[120px] ${
                isDark
                  ? 'bg-[#2d2d2d]/95 border-[#424245] backdrop-blur-xl'
                  : 'bg-white/95 border-[#d2d2d7] backdrop-blur-xl'
              }`}
            >
              {(Object.keys(TYPE_CONFIG) as TodoType[]).map((type) => {
                const config = TYPE_CONFIG[type];
                const Icon = config.Icon;
                return (
                  <button
                    key={type}
                    type="button"
                    onClick={() => {
                      setTodoType(type);
                      setShowTypeMenu(false);
                    }}
                    className={`w-full flex items-center gap-2 px-4 py-2 text-sm transition-colors ${
                      todoType === type
                        ? 'text-white'
                        : isDark
                          ? 'text-[#f5f5f7] hover:bg-[#3d3d3d]'
                          : 'text-[#1d1d1f] hover:bg-[#f5f5f7]'
                    }`}
                    style={todoType === type ? { backgroundColor: config.color } : {}}
                  >
                    <Icon />
                    {config.label}
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Text input */}
        <input
          type="text"
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="What needs to be done?"
          className={`flex-1 min-w-0 px-4 py-3 rounded-xl text-base transition-all outline-none ${
            isDark
              ? 'bg-[#1d1d1f]/80 text-[#f5f5f7] placeholder-[#86868b] border border-[#424245] focus:border-[#2997ff]'
              : 'bg-[#f5f5f7]/80 text-[#1d1d1f] placeholder-[#86868b] border border-transparent focus:border-[#0071e3] focus:bg-white/80'
          } backdrop-blur-sm`}
        />

        {/* Date picker button - wraps the actual input for iOS compatibility */}
        <div className="relative">
          <div
            className={`flex items-center gap-2 px-3 py-3 rounded-xl text-sm font-medium transition-all whitespace-nowrap cursor-pointer ${
              dueDate
                ? 'bg-[#0071e3] text-white'
                : isDark
                  ? 'bg-[#1d1d1f]/80 text-[#86868b] hover:text-[#f5f5f7] border border-[#424245]'
                  : 'bg-[#f5f5f7]/80 text-[#86868b] hover:text-[#1d1d1f] border border-transparent'
            } backdrop-blur-sm`}
          >
            <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <span className="hidden sm:inline">
              {dueDate ? formatDateTime(dueDate) : 'Due'}
            </span>
          </div>
          {/* Actual datetime input - positioned over button for touch/click */}
          <input
            ref={dateInputRef}
            type="datetime-local"
            value={dueDate}
            onChange={(e) => setDueDate(e.target.value)}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            style={{ colorScheme: isDark ? 'dark' : 'light' }}
          />
        </div>

        {/* Clear date button */}
        {dueDate && (
          <button
            type="button"
            onClick={() => setDueDate('')}
            className={`p-3 rounded-xl transition-all ${
              isDark
                ? 'text-[#86868b] hover:text-[#ff453a] hover:bg-[#1d1d1f]/80'
                : 'text-[#86868b] hover:text-[#ff3b30] hover:bg-[#f5f5f7]/80'
            } backdrop-blur-sm`}
            title="Clear due date"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        )}

        {/* Add button */}
        <button
          type="submit"
          disabled={!text.trim()}
          className={`px-5 py-3 rounded-xl font-medium text-base transition-all whitespace-nowrap ${
            text.trim()
              ? 'bg-[#0071e3] text-white hover:bg-[#0077ed] active:scale-95'
              : isDark
                ? 'bg-[#424245]/80 text-[#86868b] cursor-not-allowed'
                : 'bg-[#d2d2d7]/80 text-[#86868b] cursor-not-allowed'
          } backdrop-blur-sm`}
        >
          Add
        </button>
      </div>
    </form>
  );
}
