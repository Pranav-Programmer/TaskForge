import { useState, useMemo, useCallback } from 'react';
import type { Task, TaskStatus, TaskPriority, Project } from '../types';
import { Modal } from './Modal';
import { Badge } from './Badge';
import { EmptyState, SearchInput, FilterTabs, ConfirmDelete, icons, priorityConfig, statusConfig } from './SharedUI';

interface TaskManagerProps {
  tasks: Task[];
  projects: Project[];
  onAdd: (task: Omit<Task, 'id' | 'createdAt' | 'updatedAt'>) => void;
  onUpdate: (id: string, updates: Partial<Task>) => void;
  onDelete: (id: string) => void;
  onToast?: (message: string, type: 'success' | 'error' | 'info') => void;
}

const allTags = ['frontend', 'backend', 'devops', 'testing', 'design', 'security', 'auth', 'ux', 'accessibility'];
const defaultForm = { title: '', description: '', status: 'todo' as TaskStatus, priority: 'medium' as TaskPriority, dueDate: '', tags: [] as string[], projectId: null as string | null };

export function TaskManager({ tasks, projects, onAdd, onUpdate, onDelete, onToast }: TaskManagerProps) {
  const [showForm, setShowForm] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [deletingTask, setDeletingTask] = useState<Task | null>(null);
  const [filterStatus, setFilterStatus] = useState<TaskStatus | 'all'>('all');
  const [filterPriority, setFilterPriority] = useState<TaskPriority | 'all'>('all');
  const [filterProject, setFilterProject] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'dueDate' | 'priority' | 'createdAt'>('dueDate');
  const [formData, setFormData] = useState(defaultForm);

  const resetForm = useCallback(() => { setFormData(defaultForm); setEditingTask(null); setShowForm(false); }, []);

  const handleSubmit = useCallback((e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title.trim()) return;
    if (editingTask) { onUpdate(editingTask.id, { ...formData, updatedAt: new Date().toISOString() }); onToast?.('Task updated', 'success'); }
    else { onAdd(formData); onToast?.('Task created', 'success'); }
    resetForm();
  }, [formData, editingTask, onAdd, onUpdate, onToast, resetForm]);

  const handleEdit = useCallback((task: Task) => {
    setEditingTask(task);
    setFormData({ title: task.title, description: task.description, status: task.status, priority: task.priority, dueDate: task.dueDate, tags: task.tags, projectId: task.projectId });
    setShowForm(true);
  }, []);

  const handleDeleteConfirm = useCallback(() => { if (!deletingTask) return; onDelete(deletingTask.id); setDeletingTask(null); onToast?.('Task deleted', 'info'); }, [deletingTask, onDelete, onToast]);
  const cycleStatus = useCallback((task: Task) => {
    const next: TaskStatus = task.status === 'todo' ? 'in_progress' : task.status === 'in_progress' ? 'done' : 'todo';
    onUpdate(task.id, { status: next, updatedAt: new Date().toISOString() });
  }, [onUpdate]);
  const toggleTag = useCallback((tag: string) => { setFormData((prev) => ({ ...prev, tags: prev.tags.includes(tag) ? prev.tags.filter((t) => t !== tag) : [...prev.tags, tag] })); }, []);

  const priorityOrder: Record<TaskPriority, number> = { urgent: 0, high: 1, medium: 2, low: 3 };
  const filteredTasks = useMemo(() => {
    return tasks.filter((t) => {
      if (filterStatus !== 'all' && t.status !== filterStatus) return false;
      if (filterPriority !== 'all' && t.priority !== filterPriority) return false;
      if (filterProject !== 'all' && t.projectId !== filterProject) return false;
      if (searchQuery && !t.title.toLowerCase().includes(searchQuery.toLowerCase()) && !t.description.toLowerCase().includes(searchQuery.toLowerCase())) return false;
      return true;
    }).sort((a, b) => {
      if (sortBy === 'priority') return priorityOrder[a.priority] - priorityOrder[b.priority];
      if (sortBy === 'dueDate') return (a.dueDate || 'z').localeCompare(b.dueDate || 'z');
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });
  }, [tasks, filterStatus, filterPriority, filterProject, searchQuery, sortBy]);

  return (
    <div className="space-y-5 animate-fade-in">
      <div className="flex items-center justify-between">
        <header>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-50 tracking-tight">Tasks</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
            {filteredTasks.length === tasks.length ? `${tasks.length} tasks` : `${filteredTasks.length} of ${tasks.length} tasks`}
          </p>
        </header>
        <button onClick={() => { resetForm(); setShowForm(true); }} className="flex items-center gap-2 px-4 py-2.5 bg-primary-600 text-white rounded-xl hover:bg-primary-700 transition-base text-sm font-semibold shadow-sm shadow-primary-600/25">
          {icons.plus}<span className="hidden sm:inline">New Task</span>
        </button>
      </div>

      <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center">
        <SearchInput value={searchQuery} onChange={setSearchQuery} placeholder="Search tasks..." />
        <FilterTabs value={filterStatus} onChange={setFilterStatus} options={[{ value: 'all', label: 'All' }, { value: 'todo', label: 'To Do' }, { value: 'in_progress', label: 'Active' }, { value: 'done', label: 'Done' }]} />
        <div className="flex gap-2 w-full sm:w-auto">
          <select value={filterPriority} onChange={(e) => setFilterPriority(e.target.value as TaskPriority | 'all')} className="flex-1 sm:flex-none px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-lg text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-primary-500 transition-base" aria-label="Filter by priority">
            <option value="all">Priority</option><option value="urgent">Urgent</option><option value="high">High</option><option value="medium">Medium</option><option value="low">Low</option>
          </select>
          <select value={filterProject} onChange={(e) => setFilterProject(e.target.value)} className="flex-1 w-1 md:w-max sm:flex-none px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-lg text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-primary-500 transition-base" aria-label="Filter by project">
            <option value="all">Projects</option>
            {projects.map((p) => (<option key={p.id} value={p.id}>{p.name}</option>))}
          </select>
          <select value={sortBy} onChange={(e) => setSortBy(e.target.value as typeof sortBy)} className="flex-1 sm:flex-none px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-lg text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-primary-500 transition-base" aria-label="Sort by">
            <option value="dueDate">Due Date</option><option value="priority">Priority</option><option value="createdAt">Created</option>
          </select>
        </div>
      </div>

      {filteredTasks.length === 0 ? (
        <EmptyState icon={icons.emptyTasks} title={tasks.length === 0 ? 'No tasks yet' : 'No tasks match your filters'} description={tasks.length === 0 ? 'Create your first task to start tracking your work.' : 'Try adjusting your search or filters.'}
          action={tasks.length === 0 ? <button onClick={() => setShowForm(true)} className="px-4 py-2 bg-primary-600 text-white rounded-xl hover:bg-primary-700 text-sm font-semibold transition-base shadow-sm">Create Task</button> : <button onClick={() => { setSearchQuery(''); setFilterStatus('all'); setFilterPriority('all'); setFilterProject('all'); }} className="px-4 py-2 text-sm font-medium text-primary-600 dark:text-primary-400 hover:bg-primary-50 dark:hover:bg-primary-900/20 rounded-xl transition-base">Clear all filters</button>} />
      ) : (
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden divide-y divide-gray-100 dark:divide-gray-700/50">
          {filteredTasks.map((task) => {
            const project = projects.find((p) => p.id === task.projectId);
            const isOverdue = task.dueDate && new Date(task.dueDate) < new Date() && task.status !== 'done';
            const isDueSoon = task.dueDate && !isOverdue && (new Date(task.dueDate).getTime() - Date.now()) < 3 * 86400000;
            return (
              <div key={task.id} className="px-4 sm:px-5 py-3.5 sm:py-4 flex items-start gap-3 sm:gap-4 hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-base group">
                <button onClick={() => cycleStatus(task)} className={`mt-0.5 w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 transition-base focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2 dark:focus-visible:ring-offset-gray-800 ${task.status === 'done' ? 'bg-emerald-500 border-emerald-500' : task.status === 'in_progress' ? 'bg-blue-500 border-blue-500' : 'border-gray-300 dark:border-gray-600 hover:border-primary-400 hover:bg-primary-50 dark:hover:bg-primary-900/20'}`} aria-label={`Mark as ${task.status === 'todo' ? 'in progress' : task.status === 'in_progress' ? 'done' : 'to do'}`}>
                  {task.status === 'done' && icons.check}
                  {task.status === 'in_progress' && <div className="w-1.5 h-1.5 bg-white rounded-full" />}
                </button>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className={`text-sm font-medium ${task.status === 'done' ? 'text-gray-400 dark:text-gray-500 line-through' : 'text-gray-900 dark:text-gray-100'}`}>{task.title}</span>
                    <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${priorityConfig[task.priority].dot}`} title={`${priorityConfig[task.priority].label} priority`} />
                  </div>
                  {task.description && <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 line-clamp-2 leading-relaxed">{task.description}</p>}
                  <div className="flex items-center gap-1.5 mt-2 flex-wrap">
                    {project && <Badge variant="purple">{project.name}</Badge>}
                    {task.dueDate && <Badge variant={isOverdue ? 'danger' : isDueSoon ? 'warning' : 'default'}>{new Date(task.dueDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</Badge>}
                    {task.tags.map((tag) => (<Badge key={tag}>{tag}</Badge>))}
                  </div>
                </div>
                <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 focus-within:opacity-100 transition-base shrink-0">
                  <button onClick={() => handleEdit(task)} className="p-1.5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-base" aria-label="Edit task">{icons.edit}</button>
                  <button onClick={() => setDeletingTask(task)} className="p-1.5 text-gray-400 hover:text-red-600 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 transition-base" aria-label="Delete task">{icons.trash}</button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <Modal isOpen={showForm} onClose={resetForm} title={editingTask ? 'Edit Task' : 'New Task'}>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="task-title" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Title</label>
            <input id="task-title" type="text" value={formData.title} onChange={(e) => setFormData((p) => ({ ...p, title: e.target.value }))} className="w-full px-3 py-2.5 border border-gray-200 dark:border-gray-600 rounded-xl text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-base" placeholder="What needs to be done?" required autoFocus />
          </div>
          <div>
            <label htmlFor="task-desc" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Description</label>
            <textarea id="task-desc" value={formData.description} onChange={(e) => setFormData((p) => ({ ...p, description: e.target.value }))} rows={3} className="w-full px-3 py-2.5 border border-gray-200 dark:border-gray-600 rounded-xl text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-none transition-base" placeholder="Add details..." />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label htmlFor="task-status" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Status</label>
              <select id="task-status" value={formData.status} onChange={(e) => setFormData((p) => ({ ...p, status: e.target.value as TaskStatus }))} className="w-full px-3 py-2.5 border border-gray-200 dark:border-gray-600 rounded-xl text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-primary-500 transition-base">
                <option value="todo">To Do</option><option value="in_progress">In Progress</option><option value="done">Done</option>
              </select>
            </div>
            <div>
              <label htmlFor="task-priority" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Priority</label>
              <select id="task-priority" value={formData.priority} onChange={(e) => setFormData((p) => ({ ...p, priority: e.target.value as TaskPriority }))} className="w-full px-3 py-2.5 border border-gray-200 dark:border-gray-600 rounded-xl text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-primary-500 transition-base">
                <option value="low">Low</option><option value="medium">Medium</option><option value="high">High</option><option value="urgent">Urgent</option>
              </select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label htmlFor="task-due" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Due Date</label>
              <input id="task-due" type="date" value={formData.dueDate} onChange={(e) => setFormData((p) => ({ ...p, dueDate: e.target.value }))} className="w-full px-3 py-2.5 border border-gray-200 dark:border-gray-600 rounded-xl text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-primary-500 transition-base" />
            </div>
            <div>
              <label htmlFor="task-project" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Project</label>
              <select id="task-project" value={formData.projectId || ''} onChange={(e) => setFormData((p) => ({ ...p, projectId: e.target.value || null }))} className="w-full px-3 py-2.5 border border-gray-200 dark:border-gray-600 rounded-xl text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-primary-500 transition-base">
                <option value="">No project</option>
                {projects.map((p) => (<option key={p.id} value={p.id}>{p.name}</option>))}
              </select>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Tags</label>
            <div className="flex flex-wrap gap-1.5" role="group" aria-label="Task tags">
              {allTags.map((tag) => (
                <button key={tag} type="button" onClick={() => toggleTag(tag)} aria-pressed={formData.tags.includes(tag)} className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-base ring-1 ring-inset ${formData.tags.includes(tag) ? 'bg-primary-50 dark:bg-primary-900/30 text-primary-700 dark:text-primary-400 ring-primary-300 dark:ring-primary-700' : 'bg-white dark:bg-gray-700 text-gray-500 dark:text-gray-400 ring-gray-200 dark:ring-gray-600 hover:bg-gray-50 dark:hover:bg-gray-600'}`}>{tag}</button>
              ))}
            </div>
          </div>
          <div className="flex justify-end gap-3 pt-3 border-t border-gray-100 dark:border-gray-700">
            <button type="button" onClick={resetForm} className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-xl transition-base">Cancel</button>
            <button type="submit" className="px-5 py-2 text-sm font-semibold text-white bg-primary-600 hover:bg-primary-700 rounded-xl transition-base shadow-sm shadow-primary-600/25">{editingTask ? 'Update' : 'Create'} Task</button>
          </div>
        </form>
      </Modal>

      <Modal isOpen={!!deletingTask} onClose={() => setDeletingTask(null)} title="Delete Task">
        <ConfirmDelete itemName={deletingTask?.title || ''} onConfirm={handleDeleteConfirm} onCancel={() => setDeletingTask(null)} />
      </Modal>
    </div>
  );
}
