'use client';

import { useState } from 'react';
import TodoItem, { Todo } from './TodoItem';

interface TodoListProps {
  todos: Todo[];
  onToggle: (id: string) => void;
  onDelete: (id: string) => void;
  onEdit: (id: string, text: string, dueDate?: string) => void;
  onReorder: (todos: Todo[]) => void;
  isDark?: boolean;
}

export default function TodoList({ todos, onToggle, onDelete, onEdit, onReorder, isDark = false }: TodoListProps) {
  const [draggedId, setDraggedId] = useState<string | null>(null);
  const [dragOverId, setDragOverId] = useState<string | null>(null);

  const handleDragStart = (e: React.DragEvent, id: string) => {
    setDraggedId(id);
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', id);
  };

  const handleDragOver = (e: React.DragEvent, id: string) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    if (id !== draggedId) {
      setDragOverId(id);
    }
  };

  const handleDragLeave = () => {
    setDragOverId(null);
  };

  const handleDrop = (e: React.DragEvent, targetId: string) => {
    e.preventDefault();

    if (!draggedId || draggedId === targetId) {
      setDraggedId(null);
      setDragOverId(null);
      return;
    }

    const draggedIndex = todos.findIndex(t => t.id === draggedId);
    const targetIndex = todos.findIndex(t => t.id === targetId);

    if (draggedIndex === -1 || targetIndex === -1) {
      setDraggedId(null);
      setDragOverId(null);
      return;
    }

    const newTodos = [...todos];
    const [draggedItem] = newTodos.splice(draggedIndex, 1);
    newTodos.splice(targetIndex, 0, draggedItem);

    onReorder(newTodos);
    setDraggedId(null);
    setDragOverId(null);
  };

  const handleDragEnd = () => {
    setDraggedId(null);
    setDragOverId(null);
  };

  if (todos.length === 0) {
    return (
      <div className="text-center py-16">
        <div className={`w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center ${
          isDark ? 'bg-[#1d1d1f]' : 'bg-[#f5f5f7]'
        }`}>
          <svg className="w-8 h-8 text-[#86868b]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
          </svg>
        </div>
        <p className={`text-lg font-medium ${isDark ? 'text-[#f5f5f7]' : 'text-[#1d1d1f]'}`}>
          No tasks yet
        </p>
        <p className="text-[#86868b] mt-1">
          Add your first task above to get started
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-1">
      {todos.map((todo) => (
        <div
          key={todo.id}
          draggable
          onDragStart={(e) => handleDragStart(e, todo.id)}
          onDragOver={(e) => handleDragOver(e, todo.id)}
          onDragLeave={handleDragLeave}
          onDrop={(e) => handleDrop(e, todo.id)}
          onDragEnd={handleDragEnd}
          className={`transition-all duration-150 ${
            draggedId === todo.id ? 'opacity-50 scale-95' : ''
          } ${
            dragOverId === todo.id ? 'transform translate-y-1' : ''
          }`}
        >
          {dragOverId === todo.id && draggedId !== todo.id && (
            <div className={`h-1 rounded-full mb-1 ${isDark ? 'bg-[#2997ff]' : 'bg-[#0071e3]'}`} />
          )}
          <TodoItem
            todo={todo}
            onToggle={onToggle}
            onDelete={onDelete}
            onEdit={onEdit}
            isDark={isDark}
          />
        </div>
      ))}
    </div>
  );
}
