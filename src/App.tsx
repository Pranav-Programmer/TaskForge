import { useState, useCallback, useEffect, useRef } from 'react';
import type { Task, Note, Project, Decision, Prompt, Toast, View } from './types';
import { useLocalStorage } from './hooks/useLocalStorage';
import { useDarkMode } from './hooks/useDarkMode';
import { seedTasks, seedNotes, seedProjects, seedDecisions, seedPrompts } from './data/seed';
import { Sidebar } from './components/Sidebar';
import { Dashboard } from './components/Dashboard';
import { TaskManager } from './components/TaskManager';
import { Notes } from './components/Notes';
import { Projects } from './components/Projects';
import { DecisionLog } from './components/DecisionLog';
import { PromptVault } from './components/PromptVault';
import { ToastContainer } from './components/Toast';

function genId() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 9);
}

export default function App() {
  const [currentView, setCurrentView] = useState<View>('dashboard');
  const [tasks, setTasks] = useLocalStorage<Task[]>('tf_tasks', seedTasks);
  const [notes, setNotes] = useLocalStorage<Note[]>('tf_notes', seedNotes);
  const [projects, setProjects] = useLocalStorage<Project[]>('tf_projects', seedProjects);
  const [decisions, setDecisions] = useLocalStorage<Decision[]>('tf_decisions', seedDecisions);
  const [prompts, setPrompts] = useLocalStorage<Prompt[]>('tf_prompts', seedPrompts);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [isDark, toggleDark] = useDarkMode();
  const mainRef = useRef<HTMLDivElement>(null);

  const addToast = useCallback((message: string, type: Toast['type'] = 'info') => {
    const id = genId();
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => { setToasts((prev) => prev.filter((t) => t.id !== id)); }, 3000);
  }, []);

  const dismissToast = useCallback((id: string) => { setToasts((prev) => prev.filter((t) => t.id !== id)); }, []);

  useEffect(() => {
    if (mainRef.current) { mainRef.current.scrollTo({ top: 0, behavior: 'smooth' }); }
    window.scrollTo({ top: 0 });
  }, [currentView]);

  useEffect(() => {
    if (mobileMenuOpen) { document.body.style.overflow = 'hidden'; } else { document.body.style.overflow = ''; }
    return () => { document.body.style.overflow = ''; };
  }, [mobileMenuOpen]);

  const now = () => new Date().toISOString();

  const taskHandlers = {
    onAdd: useCallback((data: Omit<Task, 'id' | 'createdAt' | 'updatedAt'>) => { setTasks((prev) => [...prev, { ...data, id: genId(), createdAt: now(), updatedAt: now() }]); }, [setTasks]),
    onUpdate: useCallback((id: string, updates: Partial<Task>) => { setTasks((prev) => prev.map((t) => (t.id === id ? { ...t, ...updates } : t))); }, [setTasks]),
    onDelete: useCallback((id: string) => { setTasks((prev) => prev.filter((t) => t.id !== id)); }, [setTasks]),
  };

  const noteHandlers = {
    onAdd: useCallback((data: Omit<Note, 'id' | 'createdAt' | 'updatedAt'>) => { setNotes((prev) => [...prev, { ...data, id: genId(), createdAt: now(), updatedAt: now() }]); }, [setNotes]),
    onUpdate: useCallback((id: string, updates: Partial<Note>) => { setNotes((prev) => prev.map((n) => (n.id === id ? { ...n, ...updates } : n))); }, [setNotes]),
    onDelete: useCallback((id: string) => { setNotes((prev) => prev.filter((n) => n.id !== id)); }, [setNotes]),
  };

  const projectHandlers = {
    onAdd: useCallback((data: Omit<Project, 'id' | 'createdAt' | 'updatedAt'>) => { setProjects((prev) => [...prev, { ...data, id: genId(), createdAt: now(), updatedAt: now() }]); }, [setProjects]),
    onUpdate: useCallback((id: string, updates: Partial<Project>) => { setProjects((prev) => prev.map((p) => (p.id === id ? { ...p, ...updates } : p))); }, [setProjects]),
    onDelete: useCallback((id: string) => {
      setProjects((prev) => prev.filter((p) => p.id !== id));
      setTasks((prev) => prev.map((t) => (t.projectId === id ? { ...t, projectId: null } : t)));
      setNotes((prev) => prev.map((n) => (n.projectId === id ? { ...n, projectId: null } : n)));
      setDecisions((prev) => prev.map((d) => (d.projectId === id ? { ...d, projectId: null } : d)));
    }, [setProjects, setTasks, setNotes, setDecisions]),
  };

  const decisionHandlers = {
    onAdd: useCallback((data: Omit<Decision, 'id' | 'createdAt' | 'updatedAt'>) => { setDecisions((prev) => [...prev, { ...data, id: genId(), createdAt: now(), updatedAt: now() }]); }, [setDecisions]),
    onUpdate: useCallback((id: string, updates: Partial<Decision>) => { setDecisions((prev) => prev.map((d) => (d.id === id ? { ...d, ...updates } : d))); }, [setDecisions]),
    onDelete: useCallback((id: string) => { setDecisions((prev) => prev.filter((d) => d.id !== id)); }, [setDecisions]),
  };

  const promptHandlers = {
    onAdd: useCallback((data: Omit<Prompt, 'id' | 'createdAt' | 'updatedAt' | 'usageCount'>) => { setPrompts((prev) => [...prev, { ...data, id: genId(), usageCount: 0, createdAt: now(), updatedAt: now() }]); }, [setPrompts]),
    onUpdate: useCallback((id: string, updates: Partial<Prompt>) => { setPrompts((prev) => prev.map((p) => (p.id === id ? { ...p, ...updates } : p))); }, [setPrompts]),
    onDelete: useCallback((id: string) => { setPrompts((prev) => prev.filter((p) => p.id !== id)); }, [setPrompts]),
  };

  const taskCounts = {
    todo: tasks.filter((t) => t.status === 'todo').length,
    in_progress: tasks.filter((t) => t.status === 'in_progress').length,
    done: tasks.filter((t) => t.status === 'done').length,
  };

  const handleViewChange = (view: View) => { setCurrentView(view); setMobileMenuOpen(false); };
  const toastProps = { onToast: addToast };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-200">
      {/* Mobile header */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-10 bg-sidebar-bg/95 dark:bg-gray-950/95 backdrop-blur-md px-4 py-3 flex items-center justify-between border-b border-white/5">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-lg bg-primary-500 flex items-center justify-center shadow-lg shadow-primary-500/20">
            <svg className="w-3.5 h-3.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          </div>
          <span className="text-white font-bold text-sm">TaskForge</span>
        </div>
        <div className="flex items-center gap-1">
          {/* <button onClick={toggleDark} className="text-white/70 hover:text-white p-2 rounded-lg hover:bg-white/10 transition-base" aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}>
            {isDark ? (
              <svg className="w-4.5 h-4.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
            ) : (
              <svg className="w-4.5 h-4.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
              </svg>
            )}
          </button> */}
          <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="text-white p-2 rounded-lg hover:bg-white/10 transition-base" aria-label={mobileMenuOpen ? 'Close menu' : 'Open menu'} aria-expanded={mobileMenuOpen}>
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              {mobileMenuOpen ? <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /> : <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />}
            </svg>
          </button>
        </div>
      </div>

      {/* Mobile overlay */}
      {mobileMenuOpen && (
        <div className="lg:hidden fixed inset-0 z-30 bg-black/40 dark:bg-black/60 backdrop-blur-sm animate-fade-in" onClick={() => setMobileMenuOpen(false)}>
          <div className="w-64 h-full animate-slide-up" onClick={(e) => e.stopPropagation()}>
            <Sidebar currentView={currentView} onViewChange={handleViewChange} taskCounts={taskCounts} isDark={isDark} onToggleTheme={toggleDark} />
          </div>
        </div>
      )}

      {/* Desktop sidebar */}
      <div className="hidden lg:block">
        <Sidebar currentView={currentView} onViewChange={handleViewChange} taskCounts={taskCounts} isDark={isDark} onToggleTheme={toggleDark} />
      </div>

      {/* Main content */}
      <main ref={mainRef} className="lg:ml-64 min-h-screen">
        <div className="p-4 sm:p-6 lg:p-8 pt-16 lg:pt-8 max-w-7xl mx-auto">
          {currentView === 'dashboard' && <Dashboard tasks={tasks} notes={notes} projects={projects} decisions={decisions} prompts={prompts} onNavigate={(v) => setCurrentView(v as View)} />}
          {currentView === 'tasks' && <TaskManager tasks={tasks} projects={projects} {...taskHandlers} {...toastProps} />}
          {currentView === 'notes' && <Notes notes={notes} projects={projects} {...noteHandlers} {...toastProps} />}
          {currentView === 'projects' && <Projects projects={projects} tasks={tasks} {...projectHandlers} {...toastProps} />}
          {currentView === 'decisions' && <DecisionLog decisions={decisions} projects={projects} {...decisionHandlers} {...toastProps} />}
          {currentView === 'prompts' && <PromptVault prompts={prompts} {...promptHandlers} {...toastProps} />}
        </div>
      </main>

      <ToastContainer toasts={toasts} onDismiss={dismissToast} />
    </div>
  );
}
