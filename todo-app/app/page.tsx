'use client';

import { useState, useEffect, useRef } from 'react';
import AddTodo from '@/components/AddTodo';
import TodoList from '@/components/TodoList';
import { Todo, TodoType } from '@/components/TodoItem';

const STORAGE_KEY = 'todos';
const BG_COLOR_KEY = 'bgColor';
const BG_IMAGE_KEY = 'bgImage';

const BACKGROUND_COLORS = [
  // Row 1: Vibrant colors
  { name: 'Coral', value: '#FF6B6B', dark: false },
  { name: 'Orange', value: '#FF9F43', dark: false },
  { name: 'Sunflower', value: '#FECA57', dark: false },
  { name: 'Lime', value: '#5CD85A', dark: false },
  { name: 'Teal', value: '#00D2D3', dark: false },
  { name: 'Sky', value: '#54A0FF', dark: false },
  { name: 'Purple', value: '#9B59B6', dark: true },
  { name: 'Pink', value: '#FF6B9D', dark: false },
  // Row 2: Pastel colors
  { name: 'Blush', value: '#FFE4E8', dark: false },
  { name: 'Peach', value: '#FFE5D0', dark: false },
  { name: 'Cream', value: '#FFF8E7', dark: false },
  { name: 'Mint', value: '#D0F5E8', dark: false },
  { name: 'Ice', value: '#E0F7FA', dark: false },
  { name: 'Lavender', value: '#E8E0F0', dark: false },
  { name: 'Periwinkle', value: '#D4E4FF', dark: false },
  { name: 'Rose', value: '#FCE4EC', dark: false },
  // Row 3: Neutrals & darks
  { name: 'White', value: '#FFFFFF', dark: false },
  { name: 'Snow', value: '#F8F9FA', dark: false },
  { name: 'Silver', value: '#E9ECEF', dark: false },
  { name: 'Slate', value: '#64748B', dark: true },
  { name: 'Charcoal', value: '#374151', dark: true },
  { name: 'Navy', value: '#1E3A5F', dark: true },
  { name: 'Midnight', value: '#1d1d1f', dark: true },
  { name: 'Black', value: '#000000', dark: true },
];

export default function Home() {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);
  const [bgColor, setBgColor] = useState('#FFFFFF');
  const [bgImage, setBgImage] = useState<string | null>(null);
  const [showColorPicker, setShowColorPicker] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const currentBg = BACKGROUND_COLORS.find(c => c.value === bgColor);
  const isDark = bgImage ? true : (currentBg?.dark ?? false);

  // Load data from localStorage on mount
  useEffect(() => {
    const storedTodos = localStorage.getItem(STORAGE_KEY);
    const storedBgColor = localStorage.getItem(BG_COLOR_KEY);
    const storedBgImage = localStorage.getItem(BG_IMAGE_KEY);

    if (storedTodos) {
      try {
        const parsed = JSON.parse(storedTodos);
        // Migrate old todos that don't have a type field
        const migrated = parsed.map((todo: Todo) => ({
          ...todo,
          type: todo.type || 'personal',
        }));
        setTodos(migrated);
      } catch (e) {
        console.error('Failed to parse stored todos:', e);
      }
    }

    if (storedBgColor) {
      setBgColor(storedBgColor);
    }

    if (storedBgImage) {
      setBgImage(storedBgImage);
    }

    setIsLoaded(true);
  }, []);

  // Save todos to localStorage
  useEffect(() => {
    if (isLoaded) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(todos));
    }
  }, [todos, isLoaded]);

  // Save background color to localStorage
  useEffect(() => {
    if (isLoaded) {
      localStorage.setItem(BG_COLOR_KEY, bgColor);
    }
  }, [bgColor, isLoaded]);

  // Save background image to localStorage
  useEffect(() => {
    if (isLoaded) {
      if (bgImage) {
        localStorage.setItem(BG_IMAGE_KEY, bgImage);
      } else {
        localStorage.removeItem(BG_IMAGE_KEY);
      }
    }
  }, [bgImage, isLoaded]);

  const addTodo = (text: string, dueDate?: string, type: TodoType = 'personal') => {
    const newTodo: Todo = {
      id: Date.now().toString(),
      text,
      completed: false,
      dueDate,
      type,
    };
    setTodos((prev) => [newTodo, ...prev]);
  };

  const toggleTodo = (id: string) => {
    setTodos((prev) =>
      prev.map((todo) =>
        todo.id === id ? { ...todo, completed: !todo.completed } : todo
      )
    );
  };

  const deleteTodo = (id: string) => {
    setTodos((prev) => prev.filter((todo) => todo.id !== id));
  };

  const editTodo = (id: string, text: string, dueDate?: string, type?: TodoType) => {
    setTodos((prev) =>
      prev.map((todo) =>
        todo.id === id ? { ...todo, text, dueDate, type: type ?? todo.type } : todo
      )
    );
  };

  const reorderTodos = (newTodos: Todo[]) => {
    setTodos(newTodos);
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const result = event.target?.result as string;
        setBgImage(result);
        setShowColorPicker(false);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeBackgroundImage = () => {
    setBgImage(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const selectColor = (color: string) => {
    setBgColor(color);
    setBgImage(null);
    setShowColorPicker(false);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  if (!isLoaded) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: bgColor }}>
        <div className="text-[#86868b]">Loading...</div>
      </div>
    );
  }

  return (
    <div
      className="min-h-screen py-12 px-4 transition-all duration-300"
      style={{
        backgroundColor: bgColor,
        backgroundImage: bgImage ? `url(${bgImage})` : undefined,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundAttachment: 'fixed',
      }}
    >
      {/* Overlay for better readability when using image background */}
      {bgImage && (
        <div className="fixed inset-0 bg-black/30 pointer-events-none" />
      )}

      <div className="max-w-2xl mx-auto relative">
        {/* Header */}
        <header className="text-center mb-12">
          <h1 className={`text-4xl sm:text-5xl font-semibold tracking-tight mb-3 ${
            isDark ? 'text-white drop-shadow-lg' : 'text-[#1d1d1f]'
          }`}>
            🍌 Banana & Pear 🍐
          </h1>
          <p className={`text-lg ${isDark ? 'text-white/80' : 'text-[#86868b]'}`}>
            {todos.length === 0
              ? 'Start by adding a task'
              : `${todos.filter((t) => !t.completed).length} of ${todos.length} remaining`}
          </p>
        </header>

        {/* Main Card */}
        <div
          className={`rounded-2xl shadow-lg border backdrop-blur-2xl transition-colors duration-300 ${
            isDark
              ? 'bg-[#2d2d2d]/70 border-[#424245]/50'
              : 'bg-white/70 border-[#d2d2d7]/50'
          }`}
        >
          <div className="p-6">
            <AddTodo onAdd={addTodo} isDark={isDark} />
          </div>

          <div className={`border-t ${isDark ? 'border-[#424245]' : 'border-[#d2d2d7]'}`}>
            <div className="p-6">
              <TodoList
                todos={todos}
                onToggle={toggleTodo}
                onDelete={deleteTodo}
                onEdit={editTodo}
                onReorder={reorderTodos}
                isDark={isDark}
              />
            </div>
          </div>
        </div>

        {/* Background Picker */}
        <div className="mt-8 flex justify-center">
          <div className="relative">
            <button
              onClick={() => setShowColorPicker(!showColorPicker)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-full text-sm font-medium transition-all shadow-md ${
                isDark
                  ? 'bg-[#2d2d2d]/90 text-white hover:bg-[#3d3d3d]/90 border border-[#424245]'
                  : 'bg-white/95 text-[#1d1d1f] hover:bg-white border border-[#d2d2d7]'
              } backdrop-blur-xl`}
            >
              {bgImage ? (
                <span
                  className="w-5 h-5 rounded-full border border-white/50"
                  style={{
                    backgroundImage: `url(${bgImage})`,
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                  }}
                />
              ) : (
                <span
                  className="w-5 h-5 rounded-full border border-[#d2d2d7]"
                  style={{ backgroundColor: bgColor }}
                />
              )}
              Background
              <svg
                className={`w-4 h-4 transition-transform ${showColorPicker ? 'rotate-180' : ''}`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>

            {showColorPicker && (
              <div
                className={`absolute bottom-full mb-3 left-1/2 -translate-x-1/2 p-4 rounded-2xl shadow-xl border backdrop-blur-xl ${
                  isDark
                    ? 'bg-[#2d2d2d]/95 border-[#424245]'
                    : 'bg-white/98 border-[#d2d2d7]'
                }`}
                style={{ width: '320px' }}
              >
                {/* Color Grid */}
                <div className="grid grid-cols-8 gap-2 mb-4">
                  {BACKGROUND_COLORS.map((color) => (
                    <button
                      key={color.value}
                      onClick={() => selectColor(color.value)}
                      className={`w-8 h-8 rounded-full transition-all hover:scale-110 active:scale-95 ${
                        bgColor === color.value && !bgImage
                          ? 'ring-2 ring-offset-2 ring-[#0071e3] scale-110'
                          : 'hover:ring-2 hover:ring-offset-1 hover:ring-[#86868b]'
                      }`}
                      style={{
                        backgroundColor: color.value,
                        boxShadow: 'inset 0 0 0 1px rgba(0,0,0,0.1)',
                      }}
                      title={color.name}
                    />
                  ))}
                </div>

                {/* Divider */}
                <div className={`border-t my-3 ${isDark ? 'border-[#424245]' : 'border-[#e5e5e5]'}`} />

                {/* Image Upload */}
                <div className="flex gap-2">
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className={`flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all ${
                      isDark
                        ? 'bg-[#1d1d1f] text-white hover:bg-[#3d3d3d]'
                        : 'bg-[#f5f5f7] text-[#1d1d1f] hover:bg-[#e8e8ed]'
                    }`}
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    Upload Photo
                  </button>

                  {bgImage && (
                    <button
                      onClick={removeBackgroundImage}
                      className={`px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                        isDark
                          ? 'bg-[#ff453a]/20 text-[#ff453a] hover:bg-[#ff453a]/30'
                          : 'bg-[#ff3b30]/10 text-[#ff3b30] hover:bg-[#ff3b30]/20'
                      }`}
                      title="Remove photo"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  )}
                </div>

                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
