"use client";
import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { 
  Sparkles, 
  Bug, 
  CheckCircle2, 
  PlusCircle, 
  Search, 
  Clock, 
  Filter, 
  Activity, 
  Layers, 
  RefreshCw, 
  Cpu, 
  Zap, 
  AlertCircle,
  HelpCircle,
  Check,
  ChevronRight,
  Database
} from 'lucide-react';
import TaskCard, { TaskItem } from '../components/TaskCard';
import { fetchTasks, addTask, predictTaskAI, updateTaskStatus, deleteTaskAPI } from '../services/api';

// Initial dataset matching dataset.csv so the UI is immediately alive & beautiful
const INITIAL_DEMO_TASKS: TaskItem[] = [
  {
    id: 1,
    title: "Payment Gateway Failure",
    description: "Payment gateway is not working and shows error 500 during checkout",
    type: "Bug",
    status: "todo",
    estimated_time: "2 Hours",
    created_at: new Date(Date.now() - 1000 * 60 * 45).toISOString()
  },
  {
    id: 2,
    title: "Implement Dark Mode Theme",
    description: "Add a dark mode button to the dashboard with local preference persistence",
    type: "Feature",
    status: "in_progress",
    estimated_time: "5 Hours",
    created_at: new Date(Date.now() - 1000 * 60 * 120).toISOString()
  },
  {
    id: 3,
    title: "Crash on Android 12",
    description: "The app closes unexpectedly on Android 12 when switching tabs",
    type: "Bug",
    status: "todo",
    estimated_time: "3 Hours",
    created_at: new Date(Date.now() - 1000 * 60 * 200).toISOString()
  },
  {
    id: 4,
    title: "User Profile Avatars",
    description: "Allow users to upload profile pictures with crop and compression tools",
    type: "Feature",
    status: "done",
    estimated_time: "1 - 2 Days",
    created_at: new Date(Date.now() - 1000 * 60 * 360).toISOString()
  }
];

export default function Dashboard() {
  const [tasks, setTasks] = useState<TaskItem[]>([]);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState<'all' | 'bug' | 'feature' | 'done'>('all');
  
  // Real-time AI preview state
  const [aiPreview, setAiPreview] = useState<{ type: string; estimated_time: string } | null>(null);
  const [aiAnalyzing, setAiAnalyzing] = useState(false);
  const [backendStatus, setBackendStatus] = useState<'checking' | 'connected' | 'offline'>('checking');
  const [notification, setNotification] = useState<string | null>(null);

  // Load tasks on mount
  useEffect(() => {
    loadTasks();
  }, []);

  const showToast = (msg: string) => {
    setNotification(msg);
    setTimeout(() => setNotification(null), 4000);
  };

  const loadTasks = async () => {
    try {
      const data = await fetchTasks();
      if (Array.isArray(data) && data.length > 0) {
        setTasks(data);
        setBackendStatus('connected');
      } else {
        // Fallback to demo items if database is empty
        setTasks(INITIAL_DEMO_TASKS);
        setBackendStatus('connected');
      }
    } catch (error) {
      console.warn("Backend unavailable, using interactive client state:", error);
      setBackendStatus('offline');
      // If no tasks loaded yet, initialize with demo tasks
      setTasks((prev) => (prev.length > 0 ? prev : INITIAL_DEMO_TASKS));
    }
  };

  // Real-time AI prediction as the user enters a description
  useEffect(() => {
    if (!description.trim() || description.trim().length < 5) {
      setAiPreview(null);
      return;
    }

    const timer = setTimeout(async () => {
      setAiAnalyzing(true);
      try {
        const prediction = await predictTaskAI(description);
        setAiPreview({
          type: prediction.predicted_type || 'Feature',
          estimated_time: prediction.estimated_time || '2 - 4 Hours'
        });
      } catch (err) {
        console.error(err);
      } finally {
        setAiAnalyzing(false);
      }
    }, 400);

    return () => clearTimeout(timer);
  }, [description]);

  // Handle Form Submit
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !description.trim()) return;

    setLoading(true);

    try {
      // 1. Attempt to post to backend
      const res = await addTask({ title, description });
      showToast("✨ Task created and classified by AI successfully!");
      setTitle('');
      setDescription('');
      setAiPreview(null);
      await loadTasks();
    } catch (error) {
      console.warn("Could not save to backend database, adding to interactive local board:", error);
      
      // Fallback: Use direct AI prediction for local board
      const prediction = await predictTaskAI(description);
      const newTask: TaskItem = {
        id: Date.now(),
        title,
        description,
        type: prediction.predicted_type || 'Bug',
        estimated_time: prediction.estimated_time || '2 Hours',
        status: 'todo',
        created_at: new Date().toISOString()
      };
      
      setTasks((prev) => [newTask, ...prev]);
      showToast(`🤖 AI classified task as [${newTask.type}]: Saved to board!`);
      setTitle('');
      setDescription('');
      setAiPreview(null);
    } finally {
      setLoading(false);
    }
  };

  // Toggle task status
  const handleStatusToggle = async (id: number | string) => {
    const current = tasks.find((t) => t.id === id || t._id === id);
    const newStatus = current?.status === 'done' ? 'todo' : 'done';

    setTasks((prev) =>
      prev.map((t) =>
        t.id === id || t._id === id ? { ...t, status: newStatus } : t
      )
    );

    try {
      await updateTaskStatus(id, newStatus);
    } catch {
      // client update is already active
    }
  };

  // Delete task
  const handleDeleteTask = async (id: number | string) => {
    setTasks((prev) => prev.filter((t) => t.id !== id && t._id !== id));
    showToast("Task removed from board");

    try {
      await deleteTaskAPI(id);
    } catch {
      // client update is already active
    }
  };

  // Quick fill samples
  const handleQuickFill = (sampleTitle: string, sampleDesc: string) => {
    setTitle(sampleTitle);
    setDescription(sampleDesc);
  };

  // Compute metrics
  const stats = useMemo(() => {
    const total = tasks.length;
    const bugs = tasks.filter((t) => (t.type || '').toLowerCase() === 'bug').length;
    const features = tasks.filter((t) => (t.type || '').toLowerCase() === 'feature').length;
    const resolved = tasks.filter((t) => t.status === 'done').length;
    return { total, bugs, features, resolved };
  }, [tasks]);

  // Filter tasks
  const filteredTasks = useMemo(() => {
    return tasks.filter((task) => {
      const matchesSearch =
        task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        task.description.toLowerCase().includes(searchQuery.toLowerCase());

      if (!matchesSearch) return false;

      if (activeFilter === 'bug') return (task.type || '').toLowerCase() === 'bug';
      if (activeFilter === 'feature') return (task.type || '').toLowerCase() === 'feature';
      if (activeFilter === 'done') return task.status === 'done';
      return true;
    });
  }, [tasks, searchQuery, activeFilter]);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-indigo-500 selection:text-white">
      {/* Background Ambient Glows */}
      <div className="fixed top-0 left-1/4 w-96 h-96 bg-indigo-600/15 rounded-full blur-[120px] pointer-events-none" />
      <div className="fixed bottom-0 right-1/4 w-96 h-96 bg-violet-600/15 rounded-full blur-[120px] pointer-events-none" />

      {/* Toast Notification */}
      {notification && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2.5 bg-slate-900 border border-indigo-500/50 text-white px-4 py-3 rounded-2xl shadow-2xl shadow-indigo-500/20 animate-bounce">
          <Sparkles className="w-4 h-4 text-indigo-400" />
          <span className="text-sm font-medium">{notification}</span>
        </div>
      )}

      {/* Top Navigation Bar */}
      <header className="sticky top-0 z-40 backdrop-blur-xl bg-slate-950/80 border-b border-slate-800/80 px-6 py-3.5">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
          {/* Brand */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 to-violet-600 flex items-center justify-center shadow-lg shadow-indigo-600/30">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-lg tracking-tight text-white">
                  Neural<span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-violet-400">Track</span>
                </span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                  AI v2.0
                </span>
              </div>
              <p className="text-[11px] text-slate-400">Automated Bug & Feature Classifier</p>
            </div>
          </div>

          {/* System Status Indicators */}
          <div className="hidden sm:flex items-center gap-3">
            <div className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs bg-slate-900 border border-slate-800 text-slate-300">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>AI Service (Port 5001)</span>
            </div>

            <div className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs bg-slate-900 border border-slate-800 text-slate-300">
              <span className={`w-2 h-2 rounded-full ${backendStatus === 'connected' ? 'bg-emerald-500' : 'bg-amber-500'}`} />
              <span>Backend (Port 5000)</span>
            </div>

            <Link
              href="/login"
              className="text-xs font-semibold px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-colors"
            >
              Sign In
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-8 space-y-8">
        
        {/* Metric Summary Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-slate-900/60 border border-slate-800/80 rounded-2xl p-5 backdrop-blur-sm relative overflow-hidden group hover:border-slate-700 transition-all">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Total Tasks</span>
              <Layers className="w-4 h-4 text-indigo-400" />
            </div>
            <div className="mt-3 flex items-baseline gap-2">
              <span className="text-3xl font-extrabold text-white">{stats.total}</span>
              <span className="text-xs text-slate-500">tracked</span>
            </div>
            <div className="mt-3 h-1 w-full bg-slate-800 rounded-full overflow-hidden">
              <div className="h-full bg-indigo-500 rounded-full" style={{ width: '100%' }} />
            </div>
          </div>

          <div className="bg-slate-900/60 border border-rose-900/40 rounded-2xl p-5 backdrop-blur-sm relative overflow-hidden group hover:border-rose-700/60 transition-all">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-rose-400 uppercase tracking-wider">Bugs Identified</span>
              <Bug className="w-4 h-4 text-rose-400" />
            </div>
            <div className="mt-3 flex items-baseline gap-2">
              <span className="text-3xl font-extrabold text-rose-300">{stats.bugs}</span>
              <span className="text-xs text-rose-400/70">AI Classified</span>
            </div>
            <div className="mt-3 h-1 w-full bg-slate-800 rounded-full overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-rose-500 to-amber-500 rounded-full" 
                style={{ width: `${stats.total > 0 ? (stats.bugs / stats.total) * 100 : 0}%` }} 
              />
            </div>
          </div>

          <div className="bg-slate-900/60 border border-violet-900/40 rounded-2xl p-5 backdrop-blur-sm relative overflow-hidden group hover:border-violet-700/60 transition-all">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-violet-400 uppercase tracking-wider">Features</span>
              <Sparkles className="w-4 h-4 text-violet-400" />
            </div>
            <div className="mt-3 flex items-baseline gap-2">
              <span className="text-3xl font-extrabold text-violet-300">{stats.features}</span>
              <span className="text-xs text-violet-400/70">Planned</span>
            </div>
            <div className="mt-3 h-1 w-full bg-slate-800 rounded-full overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-violet-500 to-indigo-500 rounded-full" 
                style={{ width: `${stats.total > 0 ? (stats.features / stats.total) * 100 : 0}%` }} 
              />
            </div>
          </div>

          <div className="bg-slate-900/60 border border-emerald-900/40 rounded-2xl p-5 backdrop-blur-sm relative overflow-hidden group hover:border-emerald-700/60 transition-all">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-emerald-400 uppercase tracking-wider">Completed</span>
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            </div>
            <div className="mt-3 flex items-baseline gap-2">
              <span className="text-3xl font-extrabold text-emerald-300">{stats.resolved}</span>
              <span className="text-xs text-emerald-400/70">
                {stats.total > 0 ? Math.round((stats.resolved / stats.total) * 100) : 0}% Done
              </span>
            </div>
            <div className="mt-3 h-1 w-full bg-slate-800 rounded-full overflow-hidden">
              <div 
                className="h-full bg-emerald-500 rounded-full" 
                style={{ width: `${stats.total > 0 ? (stats.resolved / stats.total) * 100 : 0}%` }} 
              />
            </div>
          </div>
        </div>

        {/* Task Creation & AI Analysis Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Left Column: Task Creator with Real-time AI Assistant */}
          <div className="lg:col-span-5 bg-slate-900/80 border border-slate-800/90 rounded-3xl p-6 backdrop-blur-md shadow-2xl relative">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                  <PlusCircle className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-white">Create New Task</h2>
                  <p className="text-xs text-slate-400">AI auto-determines Type & Estimated Time</p>
                </div>
              </div>
            </div>

            {/* Quick Demo Fill Buttons */}
            <div className="mb-4">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-500 block mb-2">
                Test with Quick Samples:
              </span>
              <div className="flex flex-wrap gap-1.5">
                <button
                  type="button"
                  onClick={() =>
                    handleQuickFill(
                      "Login Crash on Submit",
                      "The login page is crashing when I click submit and throws error 500"
                    )
                  }
                  className="px-2.5 py-1 rounded-lg text-xs bg-slate-800 hover:bg-slate-700 text-rose-300 border border-rose-900/40 transition-colors flex items-center gap-1"
                >
                  <Bug className="w-3 h-3 text-rose-400" />
                  Bug Sample
                </button>
                <button
                  type="button"
                  onClick={() =>
                    handleQuickFill(
                      "Add Social Sharing",
                      "Add social media sharing buttons to the blog posts with analytics"
                    )
                  }
                  className="px-2.5 py-1 rounded-lg text-xs bg-slate-800 hover:bg-slate-700 text-violet-300 border border-violet-900/40 transition-colors flex items-center gap-1"
                >
                  <Sparkles className="w-3 h-3 text-violet-400" />
                  Feature Sample
                </button>
              </div>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
                  Task Title
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Database connection timeout error"
                  required
                  className="w-full bg-slate-950/80 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
                  Task Description
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Describe the issue or feature requirement in detail..."
                  required
                  rows={4}
                  className="w-full bg-slate-950/80 border border-slate-800 rounded-xl p-4 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all resize-none"
                />
              </div>

              {/* Real-time AI Classification Preview Box */}
              <div className="rounded-2xl border border-indigo-500/20 bg-gradient-to-br from-indigo-950/30 via-slate-900/50 to-purple-950/30 p-4 transition-all">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold text-indigo-300 flex items-center gap-1.5">
                    <Cpu className="w-3.5 h-3.5 text-indigo-400" />
                    Live ML Prediction Preview
                  </span>
                  {aiAnalyzing && (
                    <span className="text-[11px] text-slate-400 flex items-center gap-1">
                      <RefreshCw className="w-3 h-3 animate-spin text-indigo-400" />
                      Analyzing...
                    </span>
                  )}
                </div>

                {aiPreview ? (
                  <div className="flex items-center justify-between pt-1">
                    <div className="flex items-center gap-2">
                      <span
                        className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold ${
                          aiPreview.type.toLowerCase() === 'bug'
                            ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                            : 'bg-violet-500/20 text-violet-300 border border-violet-500/30'
                        }`}
                      >
                        {aiPreview.type.toLowerCase() === 'bug' ? (
                          <Bug className="w-3.5 h-3.5 text-rose-400" />
                        ) : (
                          <Sparkles className="w-3.5 h-3.5 text-violet-400" />
                        )}
                        {aiPreview.type}
                      </span>

                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs bg-slate-800 text-slate-300 border border-slate-700">
                        <Clock className="w-3 h-3 text-slate-400" />
                        {aiPreview.estimated_time}
                      </span>
                    </div>

                    <span className="text-[10px] text-emerald-400 font-mono bg-emerald-950/50 px-2 py-0.5 rounded border border-emerald-800/50">
                      Trained Model ✓
                    </span>
                  </div>
                ) : (
                  <p className="text-xs text-slate-500 italic">
                    Type a description above to see live classification by your Scikit-Learn model.
                  </p>
                )}
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full inline-flex items-center justify-center gap-2 py-3 px-4 rounded-xl font-bold text-sm text-white bg-gradient-to-r from-indigo-600 via-indigo-500 to-violet-600 hover:from-indigo-500 hover:to-violet-500 shadow-xl shadow-indigo-600/30 transition-all hover:scale-[1.01] active:scale-[0.99] disabled:opacity-50"
              >
                {loading ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>AI Engine Processing...</span>
                  </>
                ) : (
                  <>
                    <Zap className="w-4 h-4 text-amber-300" />
                    <span>Save & Classify Task</span>
                  </>
                )}
              </button>
            </form>
          </div>

          {/* Right Column: Task List, Search & Filters */}
          <div className="lg:col-span-7 space-y-6">
            
            {/* Filter and Search Bar */}
            <div className="bg-slate-900/60 border border-slate-800/80 rounded-2xl p-4 backdrop-blur-md flex flex-col sm:flex-row gap-4 items-center justify-between">
              
              {/* Search Bar */}
              <div className="relative w-full sm:w-72">
                <Search className="absolute left-3.5 top-3 w-4 h-4 text-slate-500" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search tasks..."
                  className="w-full bg-slate-950/80 border border-slate-800 rounded-xl pl-10 pr-4 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                />
              </div>

              {/* Filter Tabs */}
              <div className="flex items-center gap-1.5 p-1 bg-slate-950/80 border border-slate-800 rounded-xl w-full sm:w-auto overflow-x-auto">
                <button
                  onClick={() => setActiveFilter('all')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                    activeFilter === 'all'
                      ? 'bg-indigo-600 text-white shadow'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  All ({stats.total})
                </button>
                <button
                  onClick={() => setActiveFilter('bug')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1 transition-all ${
                    activeFilter === 'bug'
                      ? 'bg-rose-600 text-white shadow'
                      : 'text-slate-400 hover:text-rose-300'
                  }`}
                >
                  <Bug className="w-3 h-3" />
                  Bugs ({stats.bugs})
                </button>
                <button
                  onClick={() => setActiveFilter('feature')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1 transition-all ${
                    activeFilter === 'feature'
                      ? 'bg-violet-600 text-white shadow'
                      : 'text-slate-400 hover:text-violet-300'
                  }`}
                >
                  <Sparkles className="w-3 h-3" />
                  Features ({stats.features})
                </button>
                <button
                  onClick={() => setActiveFilter('done')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1 transition-all ${
                    activeFilter === 'done'
                      ? 'bg-emerald-600 text-white shadow'
                      : 'text-slate-400 hover:text-emerald-300'
                  }`}
                >
                  <CheckCircle2 className="w-3 h-3" />
                  Done ({stats.resolved})
                </button>
              </div>
            </div>

            {/* Task Cards Grid */}
            <div className="space-y-4">
              {filteredTasks.length > 0 ? (
                filteredTasks.map((task) => (
                  <TaskCard
                    key={task.id || task._id}
                    task={task}
                    onStatusToggle={handleStatusToggle}
                    onDelete={handleDeleteTask}
                  />
                ))
              ) : (
                <div className="text-center py-16 bg-slate-900/40 border border-dashed border-slate-800 rounded-3xl p-8">
                  <div className="w-12 h-12 rounded-2xl bg-slate-800 text-slate-400 mx-auto flex items-center justify-center mb-3">
                    <Filter className="w-6 h-6" />
                  </div>
                  <h3 className="text-base font-bold text-slate-300">No tasks found</h3>
                  <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                    {searchQuery
                      ? `No tasks matching "${searchQuery}". Try clearing the search query.`
                      : 'No tasks under this filter yet. Create a new task on the left!'}
                  </p>
                </div>
              )}
            </div>

          </div>
        </div>

      </main>

      {/* Footer */}
      <footer className="border-t border-slate-800/80 py-6 px-6 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
          <p>
            AI-Powered Task Management & Bug Tracking System • Built with Next.js, Express & Scikit-Learn
          </p>
          <div className="flex items-center gap-4 text-slate-400">
            <span>Model: Naive Bayes TF-IDF</span>
            <span>•</span>
            <span>Port: 5001</span>
          </div>
        </div>
      </footer>
    </div>
  );
}