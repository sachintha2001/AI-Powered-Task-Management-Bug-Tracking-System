"use client";
import React from 'react';
import { Bug, Sparkles, Clock, CheckCircle2, Circle, Trash2, Tag } from 'lucide-react';

export interface TaskItem {
  id?: number | string;
  _id?: string;
  title: string;
  description: string;
  type: 'Bug' | 'Feature' | string;
  status?: 'todo' | 'in_progress' | 'done';
  estimated_time?: string;
  created_at?: string;
}

interface TaskCardProps {
  task: TaskItem;
  onStatusToggle?: (id: number | string) => void;
  onDelete?: (id: number | string) => void;
}

export default function TaskCard({ task, onStatusToggle, onDelete }: TaskCardProps) {
  const isBug = (task.type || '').toLowerCase() === 'bug';
  const taskId = task.id || task._id || 'temp';
  const isDone = task.status === 'done';

  const defaultEstimate = isBug ? '1 - 3 Hours' : '1 - 2 Days';
  const estimate = task.estimated_time || defaultEstimate;

  return (
    <div
      className={`group relative overflow-hidden rounded-2xl border transition-all duration-300 ${
        isDone
          ? 'bg-slate-50/70 border-slate-200 opacity-60'
          : isBug
          ? 'bg-gradient-to-br from-white via-rose-50/20 to-white border-rose-200/80 hover:border-rose-400 hover:shadow-xl hover:shadow-rose-500/10'
          : 'bg-gradient-to-br from-white via-violet-50/20 to-white border-violet-200/80 hover:border-violet-400 hover:shadow-xl hover:shadow-violet-500/10'
      } p-5 hover:-translate-y-0.5`}
    >
      {/* Accent Top Bar */}
      <div
        className={`absolute top-0 left-0 right-0 h-1 ${
          isDone
            ? 'bg-slate-300'
            : isBug
            ? 'bg-gradient-to-r from-rose-500 to-amber-500'
            : 'bg-gradient-to-r from-violet-600 to-indigo-500'
        }`}
      />

      <div className="flex items-start justify-between gap-3">
        <div className="flex-1">
          {/* Header row: Badges */}
          <div className="flex flex-wrap items-center gap-2 mb-2.5">
            {/* AI Type Badge */}
            <span
              className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold tracking-wide uppercase ${
                isBug
                  ? 'bg-rose-100 text-rose-700 border border-rose-200 shadow-sm shadow-rose-100'
                  : 'bg-violet-100 text-violet-700 border border-violet-200 shadow-sm shadow-violet-100'
              }`}
            >
              {isBug ? (
                <Bug className="w-3.5 h-3.5 text-rose-600 animate-pulse" />
              ) : (
                <Sparkles className="w-3.5 h-3.5 text-violet-600" />
              )}
              {task.type || 'Task'}
            </span>

            {/* Estimated Time Badge */}
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-slate-100 text-slate-700 border border-slate-200">
              <Clock className="w-3 h-3 text-slate-500" />
              {estimate}
            </span>

            {/* Status Indicator */}
            {task.status && (
              <span
                className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium ${
                  isDone
                    ? 'bg-emerald-100 text-emerald-700 border border-emerald-200'
                    : 'bg-amber-100 text-amber-700 border border-amber-200'
                }`}
              >
                {isDone ? 'Resolved' : 'Active'}
              </span>
            )}
          </div>

          {/* Title */}
          <h3
            className={`text-lg font-bold tracking-tight text-slate-900 group-hover:text-slate-950 transition-colors ${
              isDone ? 'line-through text-slate-500' : ''
            }`}
          >
            {task.title}
          </h3>

          {/* Description */}
          <p
            className={`mt-1.5 text-sm text-slate-600 leading-relaxed ${
              isDone ? 'text-slate-400' : ''
            }`}
          >
            {task.description}
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-1 shrink-0">
          {onStatusToggle && (
            <button
              onClick={() => onStatusToggle(taskId)}
              title={isDone ? 'Mark as Open' : 'Mark as Resolved'}
              className="p-1.5 rounded-lg text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 transition-colors"
            >
              {isDone ? (
                <CheckCircle2 className="w-5 h-5 text-emerald-600" />
              ) : (
                <Circle className="w-5 h-5" />
              )}
            </button>
          )}

          {onDelete && (
            <button
              onClick={() => onDelete(taskId)}
              title="Delete task"
              className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Footer info */}
      <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-400">
        <span className="flex items-center gap-1">
          <Tag className="w-3 h-3" />
          Task #{String(taskId).padStart(3, '0')}
        </span>
        <span>
          {task.created_at
            ? new Date(task.created_at).toLocaleDateString(undefined, {
                month: 'short',
                day: 'numeric',
              })
            : 'AI Analyzed'}
        </span>
      </div>
    </div>
  );
}