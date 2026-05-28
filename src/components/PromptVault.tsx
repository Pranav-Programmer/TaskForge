import { useState, useMemo, useCallback } from 'react';
import type { Prompt } from '../types';
import { Modal } from './Modal';
import { Badge } from './Badge';
import { EmptyState, SearchInput, FilterTabs, ConfirmDelete, icons } from './SharedUI';

interface PromptVaultProps {
  prompts: Prompt[];
  onAdd: (prompt: Omit<Prompt, 'id' | 'createdAt' | 'updatedAt' | 'usageCount'>) => void;
  onUpdate: (id: string, updates: Partial<Prompt>) => void;
  onDelete: (id: string) => void;
  onToast?: (message: string, type: 'success' | 'error' | 'info') => void;
}

const promptCategories = ['Development', 'Writing', 'Productivity', 'Design', 'DevOps', 'Other'];
function extractVariables(content: string): string[] { const matches = content.match(/\{\{(\w+)\}\}/g); if (!matches) return []; return [...new Set(matches.map((m) => m.replace(/[{}]/g, '')))]; }

export function PromptVault({ prompts, onAdd, onUpdate, onDelete, onToast }: PromptVaultProps) {
  const [showForm, setShowForm] = useState(false);
  const [editingPrompt, setEditingPrompt] = useState<Prompt | null>(null);
  const [deletingPrompt, setDeletingPrompt] = useState<Prompt | null>(null);
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedPrompt, setExpandedPrompt] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [fillingPrompt, setFillingPrompt] = useState<Prompt | null>(null);
  const [variableValues, setVariableValues] = useState<Record<string, string>>({});
  const [formData, setFormData] = useState({ title: '', content: '', category: 'Development', variables: [] as string[] });

  const resetForm = useCallback(() => { setFormData({ title: '', content: '', category: 'Development', variables: [] }); setEditingPrompt(null); setShowForm(false); }, []);

  const handleSubmit = useCallback((e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title.trim() || !formData.content.trim()) return;
    const autoVars = extractVariables(formData.content);
    if (editingPrompt) { onUpdate(editingPrompt.id, { ...formData, variables: autoVars, updatedAt: new Date().toISOString() }); onToast?.('Prompt updated', 'success'); }
    else { onAdd({ ...formData, variables: autoVars }); onToast?.('Prompt created', 'success'); }
    resetForm();
  }, [formData, editingPrompt, onAdd, onUpdate, onToast, resetForm]);

  const handleEdit = useCallback((prompt: Prompt) => { setEditingPrompt(prompt); setFormData({ title: prompt.title, content: prompt.content, category: prompt.category, variables: prompt.variables }); setShowForm(true); }, []);

  const handleCopy = useCallback(async (prompt: Prompt) => {
    let text = prompt.content;
    if (fillingPrompt?.id === prompt.id && prompt.variables.length > 0) { prompt.variables.forEach((v) => { text = text.replaceAll(`{{${v}}}`, variableValues[v] || `{{${v}}}`); }); onUpdate(prompt.id, { usageCount: prompt.usageCount + 1, updatedAt: new Date().toISOString() }); }
    try { await navigator.clipboard.writeText(text); setCopiedId(prompt.id); onToast?.('Copied to clipboard', 'success'); setTimeout(() => setCopiedId(null), 2000); } catch { onToast?.('Failed to copy', 'error'); }
  }, [fillingPrompt, variableValues, onUpdate, onToast]);

  const filteredPrompts = useMemo(() => {
    return prompts.filter((p) => {
      if (filterCategory !== 'all' && p.category !== filterCategory) return false;
      if (searchQuery) { const q = searchQuery.toLowerCase(); return p.title.toLowerCase().includes(q) || p.content.toLowerCase().includes(q); }
      return true;
    }).sort((a, b) => b.usageCount - a.usageCount);
  }, [prompts, filterCategory, searchQuery]);

  const totalUses = prompts.reduce((a, p) => a + p.usageCount, 0);

  return (
    <div className="space-y-5 animate-fade-in">
      <div className="flex items-center justify-between">
        <header>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-50 tracking-tight">Prompt Vault</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">{prompts.length} prompts · {totalUses} total uses</p>
        </header>
        <button onClick={() => { resetForm(); setShowForm(true); }} className="flex items-center gap-2 px-4 py-2.5 bg-primary-600 text-white rounded-xl hover:bg-primary-700 transition-base text-sm font-semibold shadow-sm shadow-primary-600/25">{icons.plus}<span className="hidden sm:inline">New Prompt</span></button>
      </div>

      <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center">
        <SearchInput value={searchQuery} onChange={setSearchQuery} placeholder="Search prompts..." />
        <FilterTabs value={filterCategory} onChange={setFilterCategory} options={[{ value: 'all', label: 'All' }, ...promptCategories.map((c) => ({ value: c, label: c }))]} />
      </div>

      {filteredPrompts.length === 0 ? (
        <EmptyState icon={icons.emptyPrompts} title={prompts.length === 0 ? 'No prompts yet' : 'No prompts match'} description={prompts.length === 0 ? 'Save reusable prompts with variables for quick access.' : 'Try adjusting your search.'}
          action={prompts.length === 0 ? <button onClick={() => setShowForm(true)} className="px-4 py-2 bg-primary-600 text-white rounded-xl hover:bg-primary-700 text-sm font-semibold transition-base shadow-sm">Create Prompt</button> : <button onClick={() => { setSearchQuery(''); setFilterCategory('all'); }} className="px-4 py-2 text-sm font-medium text-primary-600 dark:text-primary-400 hover:bg-primary-50 dark:hover:bg-primary-900/20 rounded-xl transition-base">Clear filters</button>} />
      ) : (
        <div className="space-y-2.5">
          {filteredPrompts.map((prompt) => {
            const isExpanded = expandedPrompt === prompt.id;
            const isFilling = fillingPrompt?.id === prompt.id;
            const isCopied = copiedId === prompt.id;

            return (
              <div key={prompt.id} className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden hover:border-gray-300 dark:hover:border-gray-600 transition-all duration-200 hover:shadow-sm">
                <div className="px-4 sm:px-5 py-3.5 sm:py-4">
                  <div className="flex items-start justify-between gap-3 sm:gap-4">
                    <div className="flex-1 min-w-0 cursor-pointer" onClick={() => setExpandedPrompt(isExpanded ? null : prompt.id)}>
                      <div className="flex items-center gap-2 flex-wrap mb-1">
                        <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100">{prompt.title}</h3>
                        <Badge variant="primary">{prompt.category}</Badge>
                        {prompt.variables.length > 0 && <Badge variant="default">{prompt.variables.length} var{prompt.variables.length > 1 ? 's' : ''}</Badge>}
                      </div>
                      <p className="text-xs text-gray-500 dark:text-gray-400 line-clamp-1 leading-relaxed">{prompt.content.slice(0, 120)}</p>
                    </div>
                    <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
                      <span className="text-[11px] font-mono text-gray-400 dark:text-gray-500 tabular-nums">{prompt.usageCount}×</span>
                      <button onClick={() => { if (prompt.variables.length > 0) { if (isFilling) { handleCopy(prompt); } else { setFillingPrompt(prompt); setVariableValues({}); } } else { handleCopy(prompt); } }} className={`px-2.5 sm:px-3 py-1.5 rounded-lg text-xs font-semibold transition-base ${isCopied ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 ring-1 ring-emerald-200 dark:ring-emerald-800' : isFilling ? 'bg-primary-600 text-white shadow-sm' : 'bg-primary-50 dark:bg-primary-900/20 text-primary-700 dark:text-primary-400 hover:bg-primary-100 dark:hover:bg-primary-900/30 ring-1 ring-primary-200 dark:ring-primary-800'}`}>
                        {isCopied ? '✓ Copied' : isFilling ? 'Fill & Copy' : 'Copy'}
                      </button>
                      <button onClick={() => handleEdit(prompt)} className="p-1.5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-base hidden sm:block" aria-label="Edit prompt">{icons.edit}</button>
                      <button onClick={() => setDeletingPrompt(prompt)} className="p-1.5 text-gray-400 hover:text-red-600 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 transition-base hidden sm:block" aria-label="Delete prompt">{icons.trash}</button>
                    </div>
                  </div>

                  {isFilling && prompt.variables.length > 0 && (
                    <div className="mt-3 p-3.5 bg-gray-50 dark:bg-gray-900 rounded-xl border border-gray-100 dark:border-gray-700 animate-slide-down">
                      <p className="text-[11px] font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-2.5">Fill in variables</p>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                        {prompt.variables.map((v) => (
                          <div key={v}>
                            <label className="text-xs text-gray-500 dark:text-gray-400 font-mono">{`{{${v}}}`}</label>
                            <input type="text" value={variableValues[v] || ''} onChange={(e) => setVariableValues((p) => ({ ...p, [v]: e.target.value }))} className="w-full px-2.5 py-1.5 border border-gray-200 dark:border-gray-600 rounded-lg text-xs bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:outline-none focus:ring-1 focus:ring-primary-500 transition-base mt-0.5" placeholder={`Enter ${v}`} />
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {isExpanded && (
                    <div className="mt-3 p-4 bg-gray-50 dark:bg-gray-900 rounded-xl border border-gray-100 dark:border-gray-700 animate-slide-down">
                      <pre className="text-xs text-gray-700 dark:text-gray-300 whitespace-pre-wrap font-mono leading-relaxed">{prompt.content}</pre>
                      {prompt.variables.length > 0 && <div className="flex flex-wrap gap-1.5 mt-3 pt-3 border-t border-gray-200 dark:border-gray-700">{prompt.variables.map((v) => (<Badge key={v} variant="primary">{`{{${v}}}`}</Badge>))}</div>}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      <Modal isOpen={showForm} onClose={resetForm} title={editingPrompt ? 'Edit Prompt' : 'New Prompt'} maxWidth="max-w-2xl">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="prompt-title" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Title</label>
            <input id="prompt-title" type="text" value={formData.title} onChange={(e) => setFormData((p) => ({ ...p, title: e.target.value }))} className="w-full px-3 py-2.5 border border-gray-200 dark:border-gray-600 rounded-xl text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-base" placeholder="Give your prompt a name" required autoFocus />
          </div>
          <div>
            <label htmlFor="prompt-content" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Content</label>
            <textarea id="prompt-content" value={formData.content} onChange={(e) => { const content = e.target.value; setFormData((p) => ({ ...p, content, variables: extractVariables(content) })); }} rows={12} className="w-full px-3 py-2.5 border border-gray-200 dark:border-gray-600 rounded-xl text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-none font-mono leading-relaxed transition-base" placeholder="Write your prompt. Use {{variable}} for placeholders." required />
            <p className="text-[11px] text-gray-400 dark:text-gray-500 mt-1.5">Use {'{{variableName}}'} syntax for dynamic placeholders. Variables are auto-detected.</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label htmlFor="prompt-cat" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Category</label>
              <select id="prompt-cat" value={formData.category} onChange={(e) => setFormData((p) => ({ ...p, category: e.target.value }))} className="w-full px-3 py-2.5 border border-gray-200 dark:border-gray-600 rounded-xl text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-primary-500 transition-base">
                {promptCategories.map((cat) => (<option key={cat} value={cat}>{cat}</option>))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Detected Variables</label>
              <div className="flex flex-wrap gap-1.5 min-h-[42px] px-3 py-2 border border-gray-100 dark:border-gray-700 rounded-xl bg-gray-50 dark:bg-gray-900 items-center">
                {formData.variables.length === 0 ? <span className="text-[11px] text-gray-400 dark:text-gray-500">None detected</span> : formData.variables.map((v) => (<Badge key={v} variant="primary">{`{{${v}}}`}</Badge>))}
              </div>
            </div>
          </div>
          <div className="flex justify-end gap-3 pt-3 border-t border-gray-100 dark:border-gray-700">
            <button type="button" onClick={resetForm} className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-xl transition-base">Cancel</button>
            <button type="submit" className="px-5 py-2 text-sm font-semibold text-white bg-primary-600 hover:bg-primary-700 rounded-xl transition-base shadow-sm shadow-primary-600/25">{editingPrompt ? 'Update' : 'Create'} Prompt</button>
          </div>
        </form>
      </Modal>

      <Modal isOpen={!!deletingPrompt} onClose={() => setDeletingPrompt(null)} title="Delete Prompt">
        <ConfirmDelete itemName={deletingPrompt?.title || ''} onConfirm={() => { if (deletingPrompt) { onDelete(deletingPrompt.id); setDeletingPrompt(null); onToast?.('Prompt deleted', 'info'); } }} onCancel={() => setDeletingPrompt(null)} />
      </Modal>
    </div>
  );
}
