'use client';

import { useState, useEffect, useRef } from 'react';
import AddTodo from '@/components/AddTodo';
import TodoList from '@/components/TodoList';
import { Todo, TodoType } from '@/components/TodoItem';

const STORAGE_KEY = 'todos';
const BG_KEY = 'background';
const USERS_KEY = 'users';

type BackgroundType = 'color' | 'gradient' | 'pattern' | 'image';

interface Background {
  type: BackgroundType;
  value: string;
  name: string;
  dark: boolean;
}

const SOLID_COLORS: Background[] = [
  // Vibrant
  { type: 'color', name: 'Coral', value: '#FF6B6B', dark: false },
  { type: 'color', name: 'Orange', value: '#FF9F43', dark: false },
  { type: 'color', name: 'Sunflower', value: '#FECA57', dark: false },
  { type: 'color', name: 'Lime', value: '#5CD85A', dark: false },
  { type: 'color', name: 'Teal', value: '#00D2D3', dark: false },
  { type: 'color', name: 'Sky', value: '#54A0FF', dark: false },
  { type: 'color', name: 'Purple', value: '#9B59B6', dark: true },
  { type: 'color', name: 'Pink', value: '#FF6B9D', dark: false },
  // Pastels
  { type: 'color', name: 'Blush', value: '#FFE4E8', dark: false },
  { type: 'color', name: 'Peach', value: '#FFE5D0', dark: false },
  { type: 'color', name: 'Cream', value: '#FFF8E7', dark: false },
  { type: 'color', name: 'Mint', value: '#D0F5E8', dark: false },
  { type: 'color', name: 'Ice', value: '#E0F7FA', dark: false },
  { type: 'color', name: 'Lavender', value: '#E8E0F0', dark: false },
  { type: 'color', name: 'Periwinkle', value: '#D4E4FF', dark: false },
  { type: 'color', name: 'Rose', value: '#FCE4EC', dark: false },
  // Neutrals
  { type: 'color', name: 'White', value: '#FFFFFF', dark: false },
  { type: 'color', name: 'Snow', value: '#F8F9FA', dark: false },
  { type: 'color', name: 'Silver', value: '#E9ECEF', dark: false },
  { type: 'color', name: 'Slate', value: '#64748B', dark: true },
  { type: 'color', name: 'Charcoal', value: '#374151', dark: true },
  { type: 'color', name: 'Navy', value: '#1E3A5F', dark: true },
  { type: 'color', name: 'Midnight', value: '#1d1d1f', dark: true },
  { type: 'color', name: 'Black', value: '#000000', dark: true },
];

const GRADIENTS: Background[] = [
  { type: 'gradient', name: 'Sunset', value: 'linear-gradient(135deg, #ff9a9e 0%, #fecfef 50%, #fecfef 100%)', dark: false },
  { type: 'gradient', name: 'Ocean', value: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', dark: true },
  { type: 'gradient', name: 'Forest', value: 'linear-gradient(135deg, #11998e 0%, #38ef7d 100%)', dark: false },
  { type: 'gradient', name: 'Peach', value: 'linear-gradient(135deg, #ee9ca7 0%, #ffdde1 100%)', dark: false },
  { type: 'gradient', name: 'Sky Blue', value: 'linear-gradient(135deg, #2af598 0%, #009efd 100%)', dark: false },
  { type: 'gradient', name: 'Purple Haze', value: 'linear-gradient(135deg, #7028e4 0%, #e5b2ca 100%)', dark: true },
  { type: 'gradient', name: 'Mango', value: 'linear-gradient(135deg, #ffe259 0%, #ffa751 100%)', dark: false },
  { type: 'gradient', name: 'Berry', value: 'linear-gradient(135deg, #8E2DE2 0%, #4A00E0 100%)', dark: true },
  { type: 'gradient', name: 'Aurora', value: 'linear-gradient(135deg, #00c6fb 0%, #005bea 100%)', dark: true },
  { type: 'gradient', name: 'Flamingo', value: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)', dark: false },
  { type: 'gradient', name: 'Mint Fresh', value: 'linear-gradient(135deg, #0ba360 0%, #3cba92 100%)', dark: false },
  { type: 'gradient', name: 'Cotton Candy', value: 'linear-gradient(135deg, #ffecd2 0%, #fcb69f 100%)', dark: false },
  { type: 'gradient', name: 'Night Sky', value: 'linear-gradient(135deg, #0f0c29 0%, #302b63 50%, #24243e 100%)', dark: true },
  { type: 'gradient', name: 'Warm Sunset', value: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)', dark: false },
  { type: 'gradient', name: 'Cool Blues', value: 'linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)', dark: false },
  { type: 'gradient', name: 'Deep Space', value: 'linear-gradient(135deg, #000428 0%, #004e92 100%)', dark: true },
];

const PATTERNS: Background[] = [
  { type: 'pattern', name: 'Geometric', value: 'url("data:image/svg+xml,%3Csvg width=\'60\' height=\'60\' viewBox=\'0 0 60 60\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cg fill=\'none\' fill-rule=\'evenodd\'%3E%3Cg fill=\'%23ffffff\' fill-opacity=\'0.2\'%3E%3Cpath d=\'M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z\'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E"), linear-gradient(135deg, #667eea 0%, #764ba2 100%)', dark: true },
  { type: 'pattern', name: 'Diamonds', value: 'url("data:image/svg+xml,%3Csvg width=\'24\' height=\'24\' viewBox=\'0 0 24 24\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cpath d=\'M12 2L2 12l10 10 10-10L12 2zm0 4l6 6-6 6-6-6 6-6z\' fill=\'%23ffffff\' fill-opacity=\'0.25\'/%3E%3C/svg%3E"), linear-gradient(135deg, #f093fb 0%, #f5576c 100%)', dark: true },
  { type: 'pattern', name: 'Waves', value: 'url("data:image/svg+xml,%3Csvg width=\'100\' height=\'20\' viewBox=\'0 0 100 20\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cpath d=\'M21.184 20c.357-.13.72-.264 1.088-.402l1.768-.661C33.64 15.347 39.647 14 50 14c10.271 0 15.362 1.222 24.629 4.928.955.383 1.869.74 2.75 1.072h6.225c-2.51-.73-5.139-1.691-8.233-2.928C65.888 13.278 60.562 12 50 12c-10.626 0-16.855 1.397-26.66 5.063l-1.767.662c-2.475.923-4.66 1.674-6.724 2.275h6.335zm0-20C13.258 2.892 8.077 4 0 4V2c5.744 0 9.951-.574 14.85-2h6.334zM77.38 0C85.239 2.966 90.502 4 100 4V2c-6.842 0-11.386-.542-16.396-2h-6.225zM0 14c8.44 0 13.718-1.21 22.272-4.402l1.768-.661C33.64 5.347 39.647 4 50 4c10.271 0 15.362 1.222 24.629 4.928C84.112 12.722 89.438 14 100 14v-2c-10.271 0-15.362-1.222-24.629-4.928C65.888 3.278 60.562 2 50 2 39.374 2 33.145 3.397 23.34 7.063l-1.767.662C13.223 10.84 8.163 12 0 12v2z\' fill=\'%23ffffff\' fill-opacity=\'0.3\' fill-rule=\'evenodd\'/%3E%3C/svg%3E"), linear-gradient(180deg, #11998e 0%, #38ef7d 100%)', dark: true },
  { type: 'pattern', name: 'Triangles', value: 'url("data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' width=\'36\' height=\'72\' viewBox=\'0 0 36 72\'%3E%3Cg fill-rule=\'evenodd\'%3E%3Cg fill=\'%23ffffff\' fill-opacity=\'0.2\'%3E%3Cpath d=\'M2 6h12L8 18 2 6zm18 36h12l-6 12-6-12z\'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E"), linear-gradient(135deg, #ff9a9e 0%, #fad0c4 100%)', dark: false },
  { type: 'pattern', name: 'Zigzag', value: 'url("data:image/svg+xml,%3Csvg width=\'40\' height=\'12\' viewBox=\'0 0 40 12\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cpath d=\'M0 6.172L6.172 0h5.656L0 11.828V6.172zm40 5.656L28.172 0h5.656L40 6.172v5.656zM6.172 12l12-12h3.656l12 12h-5.656L20 3.828 11.828 12H6.172zm12 0L40 .172V0h-2.172L20 8.172 2.172 0H0v.172L18.172 12h-4z\' fill=\'%23ffffff\' fill-opacity=\'0.2\' fill-rule=\'evenodd\'/%3E%3C/svg%3E"), linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)', dark: false },
  { type: 'pattern', name: 'Hexagons', value: 'url("data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' width=\'28\' height=\'49\' viewBox=\'0 0 28 49\'%3E%3Cg fill-rule=\'evenodd\'%3E%3Cg fill=\'%23ffffff\' fill-opacity=\'0.15\'%3E%3Cpath d=\'M13.99 9.25l13 7.5v15l-13 7.5L1 31.75v-15l12.99-7.5zM3 17.9v12.7l10.99 6.34 11-6.35V17.9l-11-6.34L3 17.9zM0 15l12.98-7.5V0h-2v6.35L0 12.69v2.3zm0 18.5L12.98 41v8h-2v-6.85L0 35.81v-2.3zM15 0v7.5L27.99 15H28v-2.31h-.01L17 6.35V0h-2zm0 49v-8l12.99-7.5H28v2.31h-.01L17 42.15V49h-2z\'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E"), linear-gradient(135deg, #5ee7df 0%, #b490ca 100%)', dark: true },
  { type: 'pattern', name: 'Circles', value: 'url("data:image/svg+xml,%3Csvg width=\'40\' height=\'40\' viewBox=\'0 0 40 40\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Ccircle cx=\'20\' cy=\'20\' r=\'8\' fill=\'none\' stroke=\'%23ffffff\' stroke-opacity=\'0.3\' stroke-width=\'2\'/%3E%3C/svg%3E"), linear-gradient(135deg, #fa709a 0%, #fee140 100%)', dark: false },
  { type: 'pattern', name: 'Stars', value: 'url("data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' width=\'50\' height=\'50\' viewBox=\'0 0 50 50\'%3E%3Cg fill=\'%23FFD700\' fill-opacity=\'0.4\'%3E%3Cpath d=\'M25 1l3 9h9l-7 5 3 9-8-6-8 6 3-9-7-5h9z\'/%3E%3C/g%3E%3C/svg%3E"), linear-gradient(135deg, #0f0c29 0%, #302b63 50%, #24243e 100%)', dark: true },
];

const IMAGES: Background[] = [
  { type: 'image', name: 'Mountains', value: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1920&q=80', dark: true },
  { type: 'image', name: 'Beach', value: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=1920&q=80', dark: false },
  { type: 'image', name: 'Forest', value: 'https://images.unsplash.com/photo-1448375240586-882707db888b?w=1920&q=80', dark: true },
  { type: 'image', name: 'City Night', value: 'https://images.unsplash.com/photo-1519501025264-65ba15a82390?w=1920&q=80', dark: true },
  { type: 'image', name: 'Northern Lights', value: 'https://images.unsplash.com/photo-1531366936337-7c912a4589a7?w=1920&q=80', dark: true },
  { type: 'image', name: 'Cherry Blossoms', value: 'https://images.unsplash.com/photo-1522383225653-ed111181a951?w=1920&q=80', dark: false },
  { type: 'image', name: 'Desert', value: 'https://images.unsplash.com/photo-1509316785289-025f5b846b35?w=1920&q=80', dark: false },
  { type: 'image', name: 'Starry Sky', value: 'https://images.unsplash.com/photo-1419242902214-272b3f66ee7a?w=1920&q=80', dark: true },
];

type TabType = 'colors' | 'gradients' | 'patterns' | 'images';

export default function Home() {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);
  const [background, setBackground] = useState<Background>(SOLID_COLORS[16]); // White
  const [customImage, setCustomImage] = useState<string | null>(null);
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [activeTab, setActiveTab] = useState<TabType>('colors');
  const [users, setUsers] = useState<string[]>([]);
  const [showUserManager, setShowUserManager] = useState(false);
  const [newUserName, setNewUserName] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const isDark = customImage ? true : background.dark;

  // Load data from localStorage on mount
  useEffect(() => {
    const storedTodos = localStorage.getItem(STORAGE_KEY);
    const storedBg = localStorage.getItem(BG_KEY);

    if (storedTodos) {
      try {
        const parsed = JSON.parse(storedTodos);
        const migrated = parsed.map((todo: Todo) => ({
          ...todo,
          type: todo.type || 'personal',
        }));
        setTodos(migrated);
      } catch (e) {
        console.error('Failed to parse stored todos:', e);
      }
    }

    if (storedBg) {
      try {
        const parsed = JSON.parse(storedBg);
        if (parsed.customImage) {
          setCustomImage(parsed.customImage);
        } else if (parsed.background) {
          setBackground(parsed.background);
        }
      } catch (e) {
        console.error('Failed to parse stored background:', e);
      }
    }

    const storedUsers = localStorage.getItem(USERS_KEY);
    if (storedUsers) {
      try {
        setUsers(JSON.parse(storedUsers));
      } catch (e) {
        console.error('Failed to parse stored users:', e);
      }
    }

    setIsLoaded(true);
  }, []);

  // Save todos to localStorage
  useEffect(() => {
    if (isLoaded) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(todos));
    }
  }, [todos, isLoaded]);

  // Save background to localStorage
  useEffect(() => {
    if (isLoaded) {
      localStorage.setItem(BG_KEY, JSON.stringify({ background, customImage }));
    }
  }, [background, customImage, isLoaded]);

  // Save users to localStorage
  useEffect(() => {
    if (isLoaded) {
      localStorage.setItem(USERS_KEY, JSON.stringify(users));
    }
  }, [users, isLoaded]);

  const addTodo = (text: string, dueDate?: string, type: TodoType = 'personal', assignee?: string) => {
    const newTodo: Todo = {
      id: Date.now().toString(),
      text,
      completed: false,
      dueDate,
      type,
      assignee,
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

  const editTodo = (id: string, text: string, dueDate?: string, type?: TodoType, assignee?: string) => {
    setTodos((prev) =>
      prev.map((todo) =>
        todo.id === id ? { ...todo, text, dueDate, type: type ?? todo.type, assignee } : todo
      )
    );
  };

  const addUser = (name: string) => {
    const trimmedName = name.trim();
    if (trimmedName && !users.includes(trimmedName)) {
      setUsers((prev) => [...prev, trimmedName]);
    }
  };

  const removeUser = (name: string) => {
    setUsers((prev) => prev.filter((u) => u !== name));
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
        setCustomImage(result);
        setShowColorPicker(false);
      };
      reader.readAsDataURL(file);
    }
  };

  const selectBackground = (bg: Background) => {
    setBackground(bg);
    setCustomImage(null);
    setShowColorPicker(false);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const removeCustomImage = () => {
    setCustomImage(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const getBackgroundStyle = () => {
    if (customImage) {
      return {
        backgroundImage: `url(${customImage})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundAttachment: 'fixed',
      };
    }

    if (background.type === 'color') {
      return { backgroundColor: background.value };
    }

    if (background.type === 'gradient' || background.type === 'pattern') {
      return {
        backgroundImage: background.value,
        backgroundSize: background.type === 'pattern' ? 'auto' : 'cover',
      };
    }

    if (background.type === 'image') {
      return {
        backgroundImage: `url(${background.value})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundAttachment: 'fixed',
      };
    }

    return { backgroundColor: '#FFFFFF' };
  };

  const getPreviewStyle = (bg: Background) => {
    if (bg.type === 'color') {
      return { backgroundColor: bg.value };
    }
    if (bg.type === 'gradient' || bg.type === 'pattern') {
      return { backgroundImage: bg.value, backgroundSize: bg.type === 'pattern' ? '20px' : 'cover' };
    }
    if (bg.type === 'image') {
      return { backgroundImage: `url(${bg.value})`, backgroundSize: 'cover', backgroundPosition: 'center' };
    }
    return {};
  };

  if (!isLoaded) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="text-[#86868b]">Loading...</div>
      </div>
    );
  }

  const tabs: { id: TabType; label: string; icon: React.ReactNode }[] = [
    { id: 'colors', label: 'Colors', icon: <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><circle cx="10" cy="10" r="8"/></svg> },
    { id: 'gradients', label: 'Gradients', icon: <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" /></svg> },
    { id: 'patterns', label: 'Patterns', icon: <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z" /></svg> },
    { id: 'images', label: 'Photos', icon: <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg> },
  ];

  const getCurrentItems = () => {
    switch (activeTab) {
      case 'colors': return SOLID_COLORS;
      case 'gradients': return GRADIENTS;
      case 'patterns': return PATTERNS;
      case 'images': return IMAGES;
      default: return SOLID_COLORS;
    }
  };

  return (
    <div
      className="min-h-screen py-12 px-4 transition-all duration-500"
      style={getBackgroundStyle()}
    >
      {/* Overlay for better readability */}
      {(customImage || background.type === 'image') && (
        <div className="fixed inset-0 bg-black/30 pointer-events-none" />
      )}

      <div className="max-w-2xl mx-auto relative">
        {/* Header */}
        <header className="text-center mb-12">
          <h1
            className={`text-4xl sm:text-5xl font-semibold tracking-tight mb-3 ${
              isDark ? 'text-white' : 'text-[#1d1d1f]'
            }`}
            style={{
              textShadow: isDark
                ? '0 2px 10px rgba(0,0,0,0.5), 0 1px 3px rgba(0,0,0,0.3)'
                : '0 1px 2px rgba(255,255,255,0.8)'
            }}
          >
            🍌 Banana & Pear 🍐
          </h1>
          <p
            className={`text-lg font-medium ${isDark ? 'text-white/90' : 'text-[#1d1d1f]/70'}`}
            style={{
              textShadow: isDark
                ? '0 1px 4px rgba(0,0,0,0.5)'
                : '0 1px 2px rgba(255,255,255,0.5)'
            }}
          >
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
            <AddTodo onAdd={addTodo} users={users} isDark={isDark} />
          </div>

          <div className={`border-t ${isDark ? 'border-[#424245]' : 'border-[#d2d2d7]'}`}>
            <div className="p-6">
              <TodoList
                todos={todos}
                onToggle={toggleTodo}
                onDelete={deleteTodo}
                onEdit={editTodo}
                onReorder={reorderTodos}
                users={users}
                isDark={isDark}
              />
            </div>
          </div>
        </div>

        {/* Top right controls */}
        <div className="fixed top-4 right-4 z-50 flex items-center gap-2">
          {/* User Manager */}
          <div className="relative">
            <button
              onClick={() => setShowUserManager(!showUserManager)}
              className={`flex items-center gap-2 px-3 py-2 rounded-full text-sm font-medium transition-all shadow-md ${
                isDark
                  ? 'bg-[#2d2d2d]/90 text-white hover:bg-[#3d3d3d]/90 border border-[#424245]'
                  : 'bg-white/95 text-[#1d1d1f] hover:bg-white border border-[#d2d2d7]'
              } backdrop-blur-xl`}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" />
              </svg>
              <span className="hidden sm:inline">Users</span>
              {users.length > 0 && (
                <span className={`px-1.5 py-0.5 text-xs rounded-full ${
                  isDark ? 'bg-[#0071e3] text-white' : 'bg-[#0071e3] text-white'
                }`}>
                  {users.length}
                </span>
              )}
            </button>

            {showUserManager && (
              <div
                className={`absolute top-full mt-2 right-0 p-4 rounded-2xl shadow-xl border backdrop-blur-xl w-72 ${
                  isDark
                    ? 'bg-[#2d2d2d]/95 border-[#424245]'
                    : 'bg-white/98 border-[#d2d2d7]'
                }`}
              >
                <h3 className={`text-sm font-semibold mb-3 ${isDark ? 'text-white' : 'text-[#1d1d1f]'}`}>
                  Manage Users
                </h3>

                {/* Add user form */}
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    addUser(newUserName);
                    setNewUserName('');
                  }}
                  className="flex gap-2 mb-3"
                >
                  <input
                    type="text"
                    value={newUserName}
                    onChange={(e) => setNewUserName(e.target.value)}
                    placeholder="Add a user..."
                    className={`flex-1 px-3 py-2 rounded-lg text-sm outline-none ${
                      isDark
                        ? 'bg-[#1d1d1f] text-white placeholder-[#86868b] border border-[#424245] focus:border-[#2997ff]'
                        : 'bg-[#f5f5f7] text-[#1d1d1f] placeholder-[#86868b] border border-transparent focus:border-[#0071e3]'
                    }`}
                  />
                  <button
                    type="submit"
                    disabled={!newUserName.trim()}
                    className={`px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                      newUserName.trim()
                        ? 'bg-[#0071e3] text-white hover:bg-[#0077ed]'
                        : isDark
                          ? 'bg-[#424245] text-[#86868b] cursor-not-allowed'
                          : 'bg-[#d2d2d7] text-[#86868b] cursor-not-allowed'
                    }`}
                  >
                    Add
                  </button>
                </form>

                {/* User list */}
                {users.length === 0 ? (
                  <p className="text-sm text-[#86868b] text-center py-4">
                    No users yet. Add one above.
                  </p>
                ) : (
                  <div className="flex flex-col gap-1 max-h-48 overflow-y-auto">
                    {users.map((user) => (
                      <div
                        key={user}
                        className={`flex items-center justify-between px-3 py-2 rounded-lg ${
                          isDark ? 'bg-[#1d1d1f]' : 'bg-[#f5f5f7]'
                        }`}
                      >
                        <span className={`text-sm ${isDark ? 'text-white' : 'text-[#1d1d1f]'}`}>
                          {user}
                        </span>
                        <button
                          onClick={() => removeUser(user)}
                          className={`p-1 rounded transition-colors ${
                            isDark
                              ? 'text-[#86868b] hover:text-[#ff453a]'
                              : 'text-[#86868b] hover:text-[#ff3b30]'
                          }`}
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Background Picker */}
          <div className="relative">
            <button
              onClick={() => setShowColorPicker(!showColorPicker)}
              className={`flex items-center gap-2 px-3 py-2 rounded-full text-sm font-medium transition-all shadow-md ${
                isDark
                  ? 'bg-[#2d2d2d]/90 text-white hover:bg-[#3d3d3d]/90 border border-[#424245]'
                  : 'bg-white/95 text-[#1d1d1f] hover:bg-white border border-[#d2d2d7]'
              } backdrop-blur-xl`}
            >
              <span
                className="w-5 h-5 rounded-full border border-white/50 overflow-hidden"
                style={customImage ? {
                  backgroundImage: `url(${customImage})`,
                  backgroundSize: 'cover',
                  backgroundPosition: 'center',
                } : getPreviewStyle(background)}
              />
              <span className="hidden sm:inline">Background</span>
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
                className={`absolute top-full mt-2 right-0 p-5 rounded-2xl shadow-xl border backdrop-blur-xl overflow-hidden w-[420px] max-w-[calc(100vw-2rem)] ${
                  isDark
                    ? 'bg-[#2d2d2d]/95 border-[#424245]'
                    : 'bg-white/98 border-[#d2d2d7]'
                }`}
              >
                {/* Tabs */}
                <div className="flex gap-1 mb-4 p-1.5 rounded-xl bg-black/5">
                  {tabs.map((tab) => (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`flex-1 flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
                        activeTab === tab.id
                          ? isDark
                            ? 'bg-[#3d3d3d] text-white shadow-sm'
                            : 'bg-white text-[#1d1d1f] shadow-sm'
                          : isDark
                            ? 'text-[#86868b] hover:text-white'
                            : 'text-[#86868b] hover:text-[#1d1d1f]'
                      }`}
                    >
                      {tab.icon}
                      <span>{tab.label}</span>
                    </button>
                  ))}
                </div>

                {/* Grid */}
                <div className={`grid gap-2 mb-4 ${activeTab === 'images' ? 'grid-cols-4' : 'grid-cols-8'}`}>
                  {getCurrentItems().map((item, index) => (
                    <button
                      key={`${item.type}-${index}`}
                      onClick={() => selectBackground(item)}
                      className={`${activeTab === 'images' ? 'aspect-[4/3]' : 'w-8 h-8'} rounded-lg transition-all hover:scale-105 active:scale-95 overflow-hidden ${
                        background.value === item.value && !customImage
                          ? 'ring-2 ring-offset-2 ring-[#0071e3] scale-105'
                          : 'hover:ring-2 hover:ring-offset-1 hover:ring-[#86868b]'
                      }`}
                      style={{
                        ...getPreviewStyle(item),
                        boxShadow: 'inset 0 0 0 1px rgba(0,0,0,0.1)',
                      }}
                      title={item.name}
                    />
                  ))}
                </div>

                {/* Divider */}
                <div className={`border-t my-3 ${isDark ? 'border-[#424245]' : 'border-[#e5e5e5]'}`} />

                {/* Custom Image Upload */}
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
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                    </svg>
                    Upload Your Photo
                  </button>

                  {customImage && (
                    <button
                      onClick={removeCustomImage}
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
