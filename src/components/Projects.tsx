import { useState, useCallback } from 'react';
import type { Project, ProjectStatus, Task } from '../types';
import { Modal } from './Modal';
import { EmptyState, FilterTabs, ConfirmDelete, icons, statusConfig, priorityConfig, projectStatusConfig } from './SharedUI';

interface ProjectsProps {
  projects: Project[];
  tasks: Task[];
  onAdd: (project: Omit<Project, 'id' | 'createdAt' | 'updatedAt'>) => void;
  onUpdate: (id: string, updates: Partial<Project>) => void;
  onDelete: (id: string) => void;
  onToast?: (message: string, type: 'success' | 'error' | 'info') => void;
}

const colors = ['#3b82f6', '#8b5cf6', '#10b981', '#f59e0b', '#ef4444', '#06b6d4', '#ec4899', '#84cc16'];

export function Projects({ projects, tasks, onAdd, onUpdate, onDelete, onToast }: ProjectsProps) {
  const [showForm, setShowForm] = useState(false);
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [deletingProject, setDeletingProject] = useState<Project | null>(null);
  const [expandedProject, setExpandedProject] = useState<string | null>(null);
  const [filterStatus, setFilterStatus] = useState<ProjectStatus | 'all'>('all');
  const [formData, setFormData] = useState({ name: '', description: '', status: 'planning' as ProjectStatus, color: '#3b82f6' });

  const resetForm = useCallback(() => { setFormData({ name: '', description: '', status: 'planning', color: '#3b82f6' }); setEditingProject(null); setShowForm(false); }, []);

  const handleSubmit = useCallback((e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) return;
    if (editingProject) { onUpdate(editingProject.id, { ...formData, updatedAt: new Date().toISOString() }); onToast?.('Project updated', 'success'); }
    else { onAdd(formData); onToast?.('Project created', 'success'); }
    resetForm();
  }, [formData, editingProject, onAdd, onUpdate, onToast, resetForm]);

  const handleEdit = useCallback((project: Project) => { setEditingProject(project); setFormData({ name: project.name, description: project.description, status: project.status, color: project.color }); setShowForm(true); }, []);
  const filteredProjects = projects.filter((p) => filterStatus === 'all' || p.status === filterStatus);

  return (
    <div className="space-y-5 animate-fade-in">
      <div className="flex items-center justify-between">
        <header>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-50 tracking-tight">Projects</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">{projects.length} projects</p>
        </header>
        <button onClick={() => { resetForm(); setShowForm(true); }} className="flex items-center gap-2 px-4 py-2.5 bg-primary-600 text-white rounded-xl hover:bg-primary-700 transition-base text-sm font-semibold shadow-sm shadow-primary-600/25">{icons.plus}<span className="hidden sm:inline">New Project</span></button>
      </div>

      <FilterTabs value={filterStatus} onChange={setFilterStatus} options={[{ value: 'all', label: 'All' }, ...(Object.keys(projectStatusConfig) as ProjectStatus[]).map((s) => ({ value: s, label: projectStatusConfig[s].label }))]} />

      {filteredProjects.length === 0 ? (
        <EmptyState icon={icons.emptyProjects} title={projects.length === 0 ? 'No projects yet' : 'No projects match'} description={projects.length === 0 ? 'Create a project to group related tasks together.' : 'No projects match this filter.'} action={projects.length === 0 ? <button onClick={() => setShowForm(true)} className="px-4 py-2 bg-primary-600 text-white rounded-xl hover:bg-primary-700 text-sm font-semibold transition-base shadow-sm">Create Project</button> : undefined} />
      ) : (
        <div className="space-y-3 sm:space-y-4">
          {filteredProjects.map((project) => {
            const projectTasks = tasks.filter((t) => t.projectId === project.id);
            const doneTasks = projectTasks.filter((t) => t.status === 'done').length;
            const progress = projectTasks.length > 0 ? Math.round((doneTasks / projectTasks.length) * 100) : 0;
            const isExpanded = expandedProject === project.id;
            const statusCfg = projectStatusConfig[project.status];

            return (
              <div key={project.id} className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden hover:border-gray-300 dark:hover:border-gray-600 transition-all duration-200 hover:shadow-sm">
                <div className="px-4 sm:px-5 py-3.5 sm:py-4 flex items-center gap-3 sm:gap-4 cursor-pointer" onClick={() => setExpandedProject(isExpanded ? null : project.id)}>
                  <div className="w-3.5 h-3.5 rounded-full shrink-0 shadow-inner" style={{ backgroundColor: project.color }} />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100">{project.name}</h3>
                      <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-md ring-1 ring-inset ${statusCfg.bg} ${statusCfg.text}`}>{statusCfg.label}</span>
                    </div>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5 leading-relaxed line-clamp-1">{project.description}</p>
                  </div>
                  <div className="flex items-center gap-2 sm:gap-4 shrink-0">
                    <div className="text-right hidden sm:block">
                      <div className="text-sm font-bold text-gray-900 dark:text-gray-100 tabular-nums">{progress}%</div>
                      <div className="text-[11px] text-gray-400 dark:text-gray-500">{doneTasks}/{projectTasks.length}</div>
                    </div>
                    <div className="w-24 hidden md:block">
                      <div className="w-full bg-gray-100 dark:bg-gray-700 rounded-full h-2">
                        <div className="h-2 rounded-full transition-all duration-500" style={{ width: `${progress}%`, backgroundColor: project.color }} />
                      </div>
                    </div>
                    <div className="flex items-center gap-0.5" onClick={(e) => e.stopPropagation()}>
                      <button onClick={() => handleEdit(project)} className="p-1.5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-base" aria-label="Edit project">{icons.edit}</button>
                      <button onClick={() => setDeletingProject(project)} className="p-1.5 text-gray-400 hover:text-red-600 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 transition-base" aria-label="Delete project">{icons.trash}</button>
                    </div>
                    <span className={`transition-transform duration-200 text-gray-400 dark:text-gray-500 ${isExpanded ? 'rotate-180' : ''}`}>{icons.chevronDown}</span>
                  </div>
                </div>

                {isExpanded && (
                  <div className="border-t border-gray-100 dark:border-gray-700 px-5 py-4 bg-gray-50 dark:bg-gray-900 animate-slide-down">
                    {projectTasks.length === 0 ? <div className="text-center py-6"><p className="text-sm text-gray-400 dark:text-gray-500">No tasks linked to this project yet</p></div> : (
                      <div>
                        <h4 className="text-[11px] font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-3">Linked Tasks</h4>
                        <div className="space-y-1.5">
                          {projectTasks.map((task) => (
                            <div key={task.id} className="flex items-center gap-3 px-3 py-2.5 bg-white dark:bg-gray-800 rounded-lg border border-gray-100 dark:border-gray-700 hover:border-gray-200 dark:hover:border-gray-600 transition-base">
                              <span className={`w-2 h-2 rounded-full shrink-0 ${priorityConfig[task.priority].dot}`} />
                              <span className={`text-sm flex-1 ${task.status === 'done' ? 'text-gray-400 dark:text-gray-500 line-through' : 'text-gray-900 dark:text-gray-100'}`}>{task.title}</span>
                              <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-md ring-1 ring-inset ${statusConfig[task.status].bg} ${statusConfig[task.status].text}`}>{statusConfig[task.status].label}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      <Modal isOpen={showForm} onClose={resetForm} title={editingProject ? 'Edit Project' : 'New Project'}>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="proj-name" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Name</label>
            <input id="proj-name" type="text" value={formData.name} onChange={(e) => setFormData((p) => ({ ...p, name: e.target.value }))} className="w-full px-3 py-2.5 border border-gray-200 dark:border-gray-600 rounded-xl text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-base" placeholder="Project name" required autoFocus />
          </div>
          <div>
            <label htmlFor="proj-desc" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Description</label>
            <textarea id="proj-desc" value={formData.description} onChange={(e) => setFormData((p) => ({ ...p, description: e.target.value }))} rows={3} className="w-full px-3 py-2.5 border border-gray-200 dark:border-gray-600 rounded-xl text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-none transition-base" placeholder="What is this project about?" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label htmlFor="proj-status" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Status</label>
              <select id="proj-status" value={formData.status} onChange={(e) => setFormData((p) => ({ ...p, status: e.target.value as ProjectStatus }))} className="w-full px-3 py-2.5 border border-gray-200 dark:border-gray-600 rounded-xl text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-primary-500 transition-base">
                <option value="planning">Planning</option><option value="active">Active</option><option value="on_hold">On Hold</option><option value="completed">Completed</option><option value="archived">Archived</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Color</label>
              <div className="flex gap-2 items-center h-[42px]">
                {colors.map((c) => (<button key={c} type="button" onClick={() => setFormData((p) => ({ ...p, color: c }))} className={`w-7 h-7 rounded-full transition-base ${formData.color === c ? 'ring-2 ring-offset-2 dark:ring-offset-gray-800 ring-gray-400 scale-110' : 'hover:scale-105'}`} style={{ backgroundColor: c }} aria-label={`Color ${c}`} />))}
              </div>
            </div>
          </div>
          <div className="flex justify-end gap-3 pt-3 border-t border-gray-100 dark:border-gray-700">
            <button type="button" onClick={resetForm} className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-xl transition-base">Cancel</button>
            <button type="submit" className="px-5 py-2 text-sm font-semibold text-white bg-primary-600 hover:bg-primary-700 rounded-xl transition-base shadow-sm shadow-primary-600/25">{editingProject ? 'Update' : 'Create'} Project</button>
          </div>
        </form>
      </Modal>

      <Modal isOpen={!!deletingProject} onClose={() => setDeletingProject(null)} title="Delete Project">
        <ConfirmDelete itemName={deletingProject?.name || ''} onConfirm={() => { if (deletingProject) { onDelete(deletingProject.id); setDeletingProject(null); onToast?.('Project deleted', 'info'); } }} onCancel={() => setDeletingProject(null)} />
      </Modal>
    </div>
  );
}
