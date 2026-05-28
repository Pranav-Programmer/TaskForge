import type { JSX } from 'react';
import type { Task, Note, Project, Decision, Prompt, View } from '../types';
import { priorityConfig, statusConfig, projectStatusConfig } from './SharedUI';

interface DashboardProps {
  tasks: Task[];
  notes: Note[];
  projects: Project[];
  decisions: Decision[];
  prompts: Prompt[];
  onNavigate: (view: string) => void;
}

function SectionHeader({ title, onAction, actionLabel }: { title: string; onAction?: () => void; actionLabel?: string }) {
  return (
    <div className="flex items-center justify-between px-5 py-3.5 border-b border-gray-100 dark:border-gray-700/50">
      <h2 className="text-sm font-semibold text-gray-900 dark:text-gray-100">{title}</h2>
      {onAction && actionLabel && (
        <button onClick={onAction} className="text-xs font-medium text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 transition-base">
          {actionLabel}
        </button>
      )}
    </div>
  );
}

function StatCard({ label, value, icon }: { label: string; value: number; icon: JSX.Element }) {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-5 hover:shadow-sm transition-base">
      <div className="flex items-center justify-between mb-3">
        <div className="w-9 h-9 rounded-lg bg-gray-50 dark:bg-gray-700 flex items-center justify-center text-gray-500 dark:text-gray-400">
          {icon}
        </div>
      </div>
      <div className="text-2xl font-bold text-gray-900 dark:text-gray-100 tabular-nums">{value}</div>
      <div className="text-xs text-gray-500 dark:text-gray-400 mt-0.5 font-medium">{label}</div>
    </div>
  );
}

export function Dashboard({ tasks, notes, projects, decisions, prompts, onNavigate }: DashboardProps) {
  const urgentTasks = tasks.filter((t) => t.priority === 'urgent' && t.status !== 'done');
  const dueSoon = tasks.filter((t) => {
    if (t.status === 'done' || !t.dueDate) return false;
    const diff = (new Date(t.dueDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24);
    return diff >= 0 && diff <= 3;
  });
  const pendingDecisions = decisions.filter((d) => d.status === 'pending');
  const pinnedNotes = notes.filter((n) => n.pinned);
  const activeTasks = tasks.filter((t) => t.status === 'in_progress');
  const totalPrompts = prompts.reduce((acc, p) => acc + p.usageCount, 0);

  return (
    <div className="space-y-6 animate-fade-in">
      <header>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-50 tracking-tight">Dashboard</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Your personal work command center</p>
      </header>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <StatCard label="In Progress" value={activeTasks.length} icon={<svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>} />
        <StatCard label="Active Projects" value={projects.filter((p) => p.status === 'active').length} icon={<svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" /></svg>} />
        <StatCard label="Pending Decisions" value={pendingDecisions.length} icon={<svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" /></svg>} />
        <StatCard label="Prompt Uses" value={totalPrompts} icon={<svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-5">
        {(urgentTasks.length > 0 || dueSoon.length > 0) && (
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
            <SectionHeader title="Needs Attention" onAction={() => onNavigate('tasks')} actionLabel="View all" />
            <div className="divide-y divide-gray-100 dark:divide-gray-700/50">
              {urgentTasks.map((task) => (
                <div key={task.id} className="px-5 py-3.5 flex items-center gap-3 hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-base group">
                  <span className={`w-2 h-2 rounded-full shrink-0 ${priorityConfig[task.priority].dot}`} />
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">{task.title}</div>
                    <div className="text-xs text-red-600 dark:text-red-400 font-medium mt-0.5">
                      Overdue — due {new Date(task.dueDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                    </div>
                  </div>
                  <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-md ring-1 ring-inset ${priorityConfig[task.priority].bg}`}>
                    {priorityConfig[task.priority].label}
                  </span>
                </div>
              ))}
              {dueSoon.filter((d) => d.priority !== 'urgent').slice(0, 3).map((task) => {
                const days = Math.ceil((new Date(task.dueDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
                return (
                  <div key={task.id} className="px-5 py-3.5 flex items-center gap-3 hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-base">
                    <span className={`w-2 h-2 rounded-full shrink-0 ${priorityConfig[task.priority].dot}`} />
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">{task.title}</div>
                      <div className="text-xs text-amber-600 dark:text-amber-400 font-medium mt-0.5">
                        Due {days === 0 ? 'today' : `in ${days} day${days > 1 ? 's' : ''}`}
                      </div>
                    </div>
                    <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-md ring-1 ring-inset ${statusConfig[task.status].bg} ${statusConfig[task.status].text}`}>
                      {statusConfig[task.status].label}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
          <SectionHeader title="Projects" onAction={() => onNavigate('projects')} actionLabel="View all" />
          <div className="p-4 space-y-3">
            {projects.map((project) => {
              const projectTasks = tasks.filter((t) => t.projectId === project.id);
              const doneTasks = projectTasks.filter((t) => t.status === 'done').length;
              const progress = projectTasks.length > 0 ? Math.round((doneTasks / projectTasks.length) * 100) : 0;
              const statusCfg = projectStatusConfig[project.status];
              return (
                <div key={project.id} className="p-3.5 rounded-xl border border-gray-100 dark:border-gray-700 hover:border-gray-200 dark:hover:border-gray-600 hover:shadow-sm transition-base cursor-pointer" onClick={() => onNavigate('projects')}>
                  <div className="flex items-center justify-between mb-2.5">
                    <div className="flex items-center gap-2.5">
                      <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: project.color }} />
                      <span className="text-sm font-medium text-gray-900 dark:text-gray-100">{project.name}</span>
                    </div>
                    <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-md ring-1 ring-inset ${statusCfg.bg} ${statusCfg.text}`}>
                      {statusCfg.label}
                    </span>
                  </div>
                  <div className="w-full bg-gray-100 dark:bg-gray-700 rounded-full h-1.5 mb-2">
                    <div className="h-1.5 rounded-full transition-all duration-500" style={{ width: `${progress}%`, backgroundColor: project.color }} />
                  </div>
                  <div className="text-[11px] text-gray-500 dark:text-gray-400 font-medium">{doneTasks}/{projectTasks.length} tasks · {progress}% complete</div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
          <SectionHeader title="Pinned Notes" onAction={() => onNavigate('notes')} actionLabel="View all" />
          <div className="divide-y divide-gray-100 dark:divide-gray-700/50">
            {pinnedNotes.map((note) => (
              <button key={note.id} className="w-full px-5 py-3.5 text-left hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-base group" onClick={() => onNavigate('notes')}>
                <div className="flex items-center gap-2 mb-1">
                  <svg className="w-3.5 h-3.5 text-amber-500 shrink-0" fill="currentColor" viewBox="0 0 24 24"><path d="M16 12V4h1V2H7v2h1v8l-2 2v2h5.2v6h1.6v-6H18v-2l-2-2z" /></svg>
                  <span className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">{note.title}</span>
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-400 line-clamp-2 ml-5 leading-relaxed">
                  {note.content.replace(/[#*\-\[\]]/g, '').slice(0, 120)}
                </p>
              </button>
            ))}
            {pinnedNotes.length === 0 && (
              <div className="px-5 py-10 text-center">
                <svg className="w-8 h-8 text-gray-300 dark:text-gray-600 mx-auto mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                <p className="text-xs text-gray-400 dark:text-gray-500">No pinned notes</p>
              </div>
            )}
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
          <SectionHeader title="Top Prompts" onAction={() => onNavigate('prompts')} actionLabel="View all" />
          <div className="divide-y divide-gray-100 dark:divide-gray-700/50">
            {[...prompts].sort((a, b) => b.usageCount - a.usageCount).slice(0, 4).map((prompt, i) => (
              <div key={prompt.id} className="px-5 py-3.5 hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-base">
                <div className="flex items-center gap-3">
                  <span className="w-6 h-6 rounded-md bg-gray-100 dark:bg-gray-700 flex items-center justify-center text-[10px] font-bold text-gray-400 dark:text-gray-500 shrink-0">
                    {i + 1}
                  </span>
                  <div className="flex-1 min-w-0">
                    <span className="text-sm font-medium text-gray-900 dark:text-gray-100 block truncate">{prompt.title}</span>
                    <span className="text-[11px] text-gray-500 dark:text-gray-400">{prompt.category}</span>
                  </div>
                  <span className="text-[11px] font-mono text-gray-400 dark:text-gray-500 tabular-nums">{prompt.usageCount}×</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
