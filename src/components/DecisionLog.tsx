import { useState, useMemo, useCallback } from 'react';
import type { Decision, DecisionStatus, Project } from '../types';
import { Modal } from './Modal';
import { Badge } from './Badge';
import { EmptyState, FilterTabs, ConfirmDelete, icons, decisionStatusConfig } from './SharedUI';

interface DecisionLogProps {
  decisions: Decision[];
  projects: Project[];
  onAdd: (decision: Omit<Decision, 'id' | 'createdAt' | 'updatedAt'>) => void;
  onUpdate: (id: string, updates: Partial<Decision>) => void;
  onDelete: (id: string) => void;
  onToast?: (message: string, type: 'success' | 'error' | 'info') => void;
}

export function DecisionLog({ decisions, projects, onAdd, onUpdate, onDelete, onToast }: DecisionLogProps) {
  const [showForm, setShowForm] = useState(false);
  const [editingDecision, setEditingDecision] = useState<Decision | null>(null);
  const [deletingDecision, setDeletingDecision] = useState<Decision | null>(null);
  const [filterStatus, setFilterStatus] = useState<DecisionStatus | 'all'>('all');
  const [expandedDecision, setExpandedDecision] = useState<string | null>(null);
  const [formData, setFormData] = useState({ title: '', context: '', options: [''] as string[], chosenOption: '', rationale: '', status: 'pending' as DecisionStatus, projectId: null as string | null });

  const resetForm = useCallback(() => { setFormData({ title: '', context: '', options: [''], chosenOption: '', rationale: '', status: 'pending', projectId: null }); setEditingDecision(null); setShowForm(false); }, []);

  const handleSubmit = useCallback((e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title.trim() || !formData.context.trim()) return;
    const validOptions = formData.options.filter((o) => o.trim());
    if (editingDecision) { onUpdate(editingDecision.id, { ...formData, options: validOptions, updatedAt: new Date().toISOString() }); onToast?.('Decision updated', 'success'); }
    else { onAdd({ ...formData, options: validOptions }); onToast?.('Decision recorded', 'success'); }
    resetForm();
  }, [formData, editingDecision, onAdd, onUpdate, onToast, resetForm]);

  const handleEdit = useCallback((decision: Decision) => { setEditingDecision(decision); setFormData({ title: decision.title, context: decision.context, options: decision.options.length > 0 ? decision.options : [''], chosenOption: decision.chosenOption, rationale: decision.rationale, status: decision.status, projectId: decision.projectId }); setShowForm(true); }, []);

  const filteredDecisions = useMemo(() => {
    return decisions.filter((d) => filterStatus === 'all' || d.status === filterStatus).sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
  }, [decisions, filterStatus]);

  return (
    <div className="space-y-5 animate-fade-in">
      <div className="flex items-center justify-between">
        <header>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-50 tracking-tight">Decision Log</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">{decisions.length} decisions recorded</p>
        </header>
        <button onClick={() => { resetForm(); setShowForm(true); }} className="flex items-center gap-2 px-4 py-2.5 bg-primary-600 text-white rounded-xl hover:bg-primary-700 transition-base text-sm font-semibold shadow-sm shadow-primary-600/25">{icons.plus}<span className="hidden sm:inline">Record Decision</span></button>
      </div>

      <FilterTabs value={filterStatus} onChange={setFilterStatus} options={[{ value: 'all', label: 'All' }, ...(Object.keys(decisionStatusConfig) as DecisionStatus[]).map((s) => ({ value: s, label: decisionStatusConfig[s].label }))]} />

      {filteredDecisions.length === 0 ? (
        <EmptyState icon={icons.emptyDecisions} title={decisions.length === 0 ? 'No decisions yet' : 'No decisions match'} description={decisions.length === 0 ? 'Record decisions to capture context and rationale for future reference.' : 'No decisions match this filter.'} action={decisions.length === 0 ? <button onClick={() => setShowForm(true)} className="px-4 py-2 bg-primary-600 text-white rounded-xl hover:bg-primary-700 text-sm font-semibold transition-base shadow-sm">Record Decision</button> : undefined} />
      ) : (
        <div className="space-y-3">
          {filteredDecisions.map((decision) => {
            const project = projects.find((p) => p.id === decision.projectId);
            const statusCfg = decisionStatusConfig[decision.status];
            const isExpanded = expandedDecision === decision.id;

            return (
              <div key={decision.id} className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden hover:border-gray-300 dark:hover:border-gray-600 transition-all duration-200 hover:shadow-sm">
                <div className="px-4 sm:px-5 py-3.5 sm:py-4 cursor-pointer" onClick={() => setExpandedDecision(isExpanded ? null : decision.id)}>
                  <div className="flex items-start justify-between gap-3 sm:gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap mb-1">
                        <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100">{decision.title}</h3>
                        <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-md ring-1 ring-inset ${statusCfg.bg} ${statusCfg.text}`}>{statusCfg.label}</span>
                        {project && <Badge variant="purple">{project.name}</Badge>}
                      </div>
                      <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed">{decision.context.slice(0, 140)}{decision.context.length > 140 ? '...' : ''}</p>
                    </div>
                    <div className="flex items-center gap-0.5 shrink-0" onClick={(e) => e.stopPropagation()}>
                      <button onClick={() => handleEdit(decision)} className="p-1.5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-base" aria-label="Edit decision">{icons.edit}</button>
                      <button onClick={() => setDeletingDecision(decision)} className="p-1.5 text-gray-400 hover:text-red-600 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 transition-base" aria-label="Delete decision">{icons.trash}</button>
                    </div>
                  </div>
                </div>

                {isExpanded && (
                  <div className="border-t border-gray-100 dark:border-gray-700 px-4 sm:px-5 py-5 bg-gray-50 dark:bg-gray-900 space-y-4 animate-slide-down">
                    <div>
                      <h4 className="text-[11px] font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-1.5">Context</h4>
                      <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">{decision.context}</p>
                    </div>
                    <div>
                      <h4 className="text-[11px] font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-2">Options Considered</h4>
                      <div className="space-y-1.5">
                        {decision.options.map((option, i) => {
                          const isChosen = option === decision.chosenOption;
                          return (
                            <div key={i} className={`flex items-start gap-2.5 px-3.5 py-2.5 rounded-lg text-sm transition-base ${isChosen ? 'bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 ring-1 ring-emerald-100 dark:ring-emerald-900/40' : 'bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700'}`}>
                              {isChosen ? <span className="w-5 h-5 rounded-full bg-emerald-500 flex items-center justify-center shrink-0 mt-0.5"><svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg></span> : <span className="w-5 h-5 rounded-full border-2 border-gray-200 dark:border-gray-600 shrink-0 mt-0.5" />}
                              <span className={isChosen ? 'text-emerald-800 dark:text-emerald-300 font-medium' : 'text-gray-600 dark:text-gray-400'}>{option}</span>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                    {decision.rationale && (
                      <div>
                        <h4 className="text-[11px] font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-1.5">Rationale</h4>
                        <div className="px-3.5 py-2.5 bg-white dark:bg-gray-800 rounded-lg border border-gray-100 dark:border-gray-700 text-sm text-gray-700 dark:text-gray-300 leading-relaxed">{decision.rationale}</div>
                      </div>
                    )}
                    <div className="text-[11px] text-gray-400 dark:text-gray-500 pt-1">Recorded {new Date(decision.createdAt).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      <Modal isOpen={showForm} onClose={resetForm} title={editingDecision ? 'Edit Decision' : 'Record Decision'} maxWidth="max-w-2xl">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="dec-title" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Decision Title</label>
            <input id="dec-title" type="text" value={formData.title} onChange={(e) => setFormData((p) => ({ ...p, title: e.target.value }))} className="w-full px-3 py-2.5 border border-gray-200 dark:border-gray-600 rounded-xl text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-base" placeholder="What decision needs to be made?" required autoFocus />
          </div>
          <div>
            <label htmlFor="dec-context" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Context</label>
            <textarea id="dec-context" value={formData.context} onChange={(e) => setFormData((p) => ({ ...p, context: e.target.value }))} rows={3} className="w-full px-3 py-2.5 border border-gray-200 dark:border-gray-600 rounded-xl text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-none transition-base" placeholder="Background and why this decision matters..." required />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Options</label>
            <div className="space-y-2">
              {formData.options.map((option, i) => (
                <div key={i} className="flex items-center gap-2">
                  <input type="radio" name="chosenOption" checked={formData.chosenOption === option} onChange={() => setFormData((p) => ({ ...p, chosenOption: option }))} className="text-primary-600 shrink-0" disabled={!option.trim()} aria-label={`Select "${option}" as chosen option`} />
                  <input type="text" value={option} onChange={(e) => { const newOptions = [...formData.options]; newOptions[i] = e.target.value; setFormData((p) => ({ ...p, options: newOptions })); }} className="flex-1 px-3 py-2 border border-gray-200 dark:border-gray-600 rounded-xl text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-base" placeholder={`Option ${i + 1}`} />
                  {formData.options.length > 1 && <button type="button" onClick={() => setFormData((p) => ({ ...p, options: p.options.filter((_, j) => j !== i) }))} className="p-1.5 text-gray-400 hover:text-red-600 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 transition-base" aria-label="Remove option">{icons.close}</button>}
                </div>
              ))}
              <button type="button" onClick={() => setFormData((p) => ({ ...p, options: [...p.options, ''] }))} className="text-sm text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 font-medium flex items-center gap-1 transition-base">{icons.plus} Add option</button>
            </div>
            <p className="text-[11px] text-gray-400 dark:text-gray-500 mt-1.5">Select the radio button next to the chosen option</p>
          </div>
          <div>
            <label htmlFor="dec-rationale" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Rationale</label>
            <textarea id="dec-rationale" value={formData.rationale} onChange={(e) => setFormData((p) => ({ ...p, rationale: e.target.value }))} rows={3} className="w-full px-3 py-2.5 border border-gray-200 dark:border-gray-600 rounded-xl text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-none transition-base" placeholder="Why was this option chosen?" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label htmlFor="dec-status" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Status</label>
              <select id="dec-status" value={formData.status} onChange={(e) => setFormData((p) => ({ ...p, status: e.target.value as DecisionStatus }))} className="w-full px-3 py-2.5 border border-gray-200 dark:border-gray-600 rounded-xl text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-primary-500 transition-base">
                <option value="pending">Pending</option><option value="accepted">Accepted</option><option value="rejected">Rejected</option><option value="superseded">Superseded</option>
              </select>
            </div>
            <div>
              <label htmlFor="dec-project" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Project</label>
              <select id="dec-project" value={formData.projectId || ''} onChange={(e) => setFormData((p) => ({ ...p, projectId: e.target.value || null }))} className="w-full px-3 py-2.5 border border-gray-200 dark:border-gray-600 rounded-xl text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-primary-500 transition-base">
                <option value="">No project</option>
                {projects.map((p) => (<option key={p.id} value={p.id}>{p.name}</option>))}
              </select>
            </div>
          </div>
          <div className="flex justify-end gap-3 pt-3 border-t border-gray-100 dark:border-gray-700">
            <button type="button" onClick={resetForm} className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-xl transition-base">Cancel</button>
            <button type="submit" className="px-5 py-2 text-sm font-semibold text-white bg-primary-600 hover:bg-primary-700 rounded-xl transition-base shadow-sm shadow-primary-600/25">{editingDecision ? 'Update' : 'Record'} Decision</button>
          </div>
        </form>
      </Modal>

      <Modal isOpen={!!deletingDecision} onClose={() => setDeletingDecision(null)} title="Delete Decision">
        <ConfirmDelete itemName={deletingDecision?.title || ''} onConfirm={() => { if (deletingDecision) { onDelete(deletingDecision.id); setDeletingDecision(null); onToast?.('Decision deleted', 'info'); } }} onCancel={() => setDeletingDecision(null)} />
      </Modal>
    </div>
  );
}
