import { useState, useMemo, useCallback } from 'react';
import type { Note, Project } from '../types';
import { Modal } from './Modal';
import { Badge } from './Badge';
import { EmptyState, SearchInput, FilterTabs, ConfirmDelete, icons } from './SharedUI';

interface NotesProps {
  notes: Note[];
  projects: Project[];
  onAdd: (note: Omit<Note, 'id' | 'createdAt' | 'updatedAt'>) => void;
  onUpdate: (id: string, updates: Partial<Note>) => void;
  onDelete: (id: string) => void;
  onToast?: (message: string, type: 'success' | 'error' | 'info') => void;
}

const categories = ['Engineering', 'Team', 'Personal', 'Research', 'Ideas'];

function renderMarkdown(text: string): string {
  return text
    .replace(/^### (.+)$/gm, '<h3 class="text-sm font-bold text-gray-900 dark:text-gray-100 mt-4 mb-1.5">$1</h3>')
    .replace(/^## (.+)$/gm, '<h2 class="text-base font-bold text-gray-900 dark:text-gray-100 mt-5 mb-2">$1</h2>')
    .replace(/^# (.+)$/gm, '<h1 class="text-lg font-bold text-gray-900 dark:text-gray-100 mt-5 mb-2">$1</h1>')
    .replace(/\*\*(.+?)\*\*/g, '<strong class="font-semibold text-gray-900 dark:text-gray-100">$1</strong>')
    .replace(/`([^`]+)`/g, '<code class="px-1.5 py-0.5 bg-gray-100 dark:bg-gray-700 rounded text-[13px] font-mono text-pink-600 dark:text-pink-400">$1</code>')
    .replace(/^- \[x\] (.+)$/gm, '<div class="flex items-center gap-2 my-0.5"><span class="w-4 h-4 rounded border-2 border-emerald-500 bg-emerald-500 flex items-center justify-center"><svg class="w-2.5 h-2.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="3"><path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7"/></svg></span><span class="text-sm text-gray-700 dark:text-gray-300">$1</span></div>')
    .replace(/^- \[ \] (.+)$/gm, '<div class="flex items-center gap-2 my-0.5"><span class="w-4 h-4 rounded border-2 border-gray-300 dark:border-gray-600"></span><span class="text-sm text-gray-700 dark:text-gray-300">$1</span></div>')
    .replace(/^1\. (.+)$/gm, '<div class="flex items-start gap-2 my-0.5"><span class="text-xs font-bold text-primary-600 dark:text-primary-400 mt-0.5">1.</span><span class="text-sm text-gray-700 dark:text-gray-300">$1</span></div>')
    .replace(/^2\. (.+)$/gm, '<div class="flex items-start gap-2 my-0.5"><span class="text-xs font-bold text-primary-600 dark:text-primary-400 mt-0.5">2.</span><span class="text-sm text-gray-700 dark:text-gray-300">$1</span></div>')
    .replace(/^3\. (.+)$/gm, '<div class="flex items-start gap-2 my-0.5"><span class="text-xs font-bold text-primary-600 dark:text-primary-400 mt-0.5">3.</span><span class="text-sm text-gray-700 dark:text-gray-300">$1</span></div>')
    .replace(/^- (.+)$/gm, '<div class="flex items-start gap-2 my-0.5"><span class="text-gray-300 dark:text-gray-600 mt-1">•</span><span class="text-sm text-gray-700 dark:text-gray-300">$1</span></div>')
    .replace(/\n\n/g, '<br/><br/>').replace(/\n/g, ' ');
}

export function Notes({ notes, projects, onAdd, onUpdate, onDelete, onToast }: NotesProps) {
  const [showForm, setShowForm] = useState(false);
  const [editingNote, setEditingNote] = useState<Note | null>(null);
  const [deletingNote, setDeletingNote] = useState<Note | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [viewingNote, setViewingNote] = useState<Note | null>(null);
  const [formData, setFormData] = useState({ title: '', content: '', category: 'Engineering', pinned: false, projectId: null as string | null });

  const resetForm = useCallback(() => { setFormData({ title: '', content: '', category: 'Engineering', pinned: false, projectId: null }); setEditingNote(null); setShowForm(false); }, []);

  const handleSubmit = useCallback((e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title.trim() || !formData.content.trim()) return;
    if (editingNote) { onUpdate(editingNote.id, { ...formData, updatedAt: new Date().toISOString() }); onToast?.('Note updated', 'success'); }
    else { onAdd(formData); onToast?.('Note created', 'success'); }
    resetForm();
  }, [formData, editingNote, onAdd, onUpdate, onToast, resetForm]);

  const handleEdit = useCallback((note: Note) => { setEditingNote(note); setFormData({ title: note.title, content: note.content, category: note.category, pinned: note.pinned, projectId: note.projectId }); setShowForm(true); }, []);

  const filteredNotes = useMemo(() => {
    return notes.filter((n) => {
      if (filterCategory !== 'all' && n.category !== filterCategory) return false;
      if (searchQuery) { const q = searchQuery.toLowerCase(); return n.title.toLowerCase().includes(q) || n.content.toLowerCase().includes(q); }
      return true;
    }).sort((a, b) => { if (a.pinned && !b.pinned) return -1; if (!a.pinned && b.pinned) return 1; return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime(); });
  }, [notes, filterCategory, searchQuery]);

  return (
    <div className="space-y-5 animate-fade-in">
      <div className="flex items-center justify-between">
        <header>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-50 tracking-tight">Notes</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">{notes.length} notes</p>
        </header>
        <button onClick={() => { resetForm(); setShowForm(true); }} className="flex items-center gap-2 px-4 py-2.5 bg-primary-600 text-white rounded-xl hover:bg-primary-700 transition-base text-sm font-semibold shadow-sm shadow-primary-600/25">{icons.plus}<span className="hidden sm:inline">New Note</span></button>
      </div>

      <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center">
        <SearchInput value={searchQuery} onChange={setSearchQuery} placeholder="Search notes..." />
        <FilterTabs value={filterCategory} onChange={setFilterCategory} options={[{ value: 'all', label: 'All' }, ...categories.map((c) => ({ value: c, label: c }))]} />
        {/* <FilterTabs value={filterStatus} onChange={setFilterStatus} options={[{ value: 'all', label: 'All' }, ...(Object.keys(projectStatusConfig) as ProjectStatus[]).map((s) => ({ value: s, label: projectStatusConfig[s].label }))]} /> */}
      </div>

      {filteredNotes.length === 0 ? (
        <EmptyState icon={icons.emptyNotes} title={notes.length === 0 ? 'No notes yet' : 'No notes match your search'} description={notes.length === 0 ? 'Capture your first note — ideas, docs, anything.' : 'Try adjusting your search or filters.'}
          action={notes.length === 0 ? <button onClick={() => setShowForm(true)} className="px-4 py-2 bg-primary-600 text-white rounded-xl hover:bg-primary-700 text-sm font-semibold transition-base shadow-sm">Create Note</button> : <button onClick={() => { setSearchQuery(''); setFilterCategory('all'); }} className="px-4 py-2 text-sm font-medium text-primary-600 dark:text-primary-400 hover:bg-primary-50 dark:hover:bg-primary-900/20 rounded-xl transition-base">Clear filters</button>} />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3 sm:gap-4">
          {filteredNotes.map((note) => {
            const project = projects.find((p) => p.id === note.projectId);
            return (
              <div key={note.id} className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 hover:shadow-md transition-all duration-200 cursor-pointer flex flex-col group" onClick={() => setViewingNote(note)}>
                <div className="p-4 sm:p-5 flex flex-col flex-1">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-2 min-w-0">
                      {note.pinned && <svg className="w-3.5 h-3.5 text-amber-500 shrink-0" fill="currentColor" viewBox="0 0 24 24"><path d="M16 12V4h1V2H7v2h1v8l-2 2v2h5.2v6h1.6v-6H18v-2l-2-2z" /></svg>}
                      <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100 truncate">{note.title}</h3>
                    </div>
                    <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 focus-within:opacity-100 transition-base shrink-0 -mr-1 -mt-1" onClick={(e) => e.stopPropagation()}>
                      <button onClick={() => handleEdit(note)} className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 transition-base" aria-label="Edit note">{icons.edit}</button>
                      <button onClick={() => setDeletingNote(note)} className="p-1 text-gray-400 hover:text-red-600 rounded-md hover:bg-red-50 dark:hover:bg-red-900/20 transition-base" aria-label="Delete note">{icons.trash}</button>
                    </div>
                  </div>
                  <p className="text-xs text-gray-500 dark:text-gray-400 line-clamp-3 flex-1 leading-relaxed mb-3">{note.content.replace(/[#*\-\[\]]/g, '').slice(0, 160)}</p>
                  <div className="flex items-center gap-1.5 flex-wrap mt-auto">
                    <Badge variant="primary">{note.category}</Badge>
                    {project && <Badge variant="purple">{project.name}</Badge>}
                  </div>
                </div>
                <div className="px-4 sm:px-5 py-2.5 border-t border-gray-50 dark:border-gray-700/50 text-[11px] text-gray-400 dark:text-gray-500 bg-gray-50 dark:bg-gray-900 rounded-b-xl">Updated {new Date(note.updatedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</div>
              </div>
            );
          })}
        </div>
      )}

      <Modal isOpen={showForm} onClose={resetForm} title={editingNote ? 'Edit Note' : 'New Note'} maxWidth="max-w-2xl">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="note-title" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Title</label>
            <input id="note-title" type="text" value={formData.title} onChange={(e) => setFormData((p) => ({ ...p, title: e.target.value }))} className="w-full px-3 py-2.5 border border-gray-200 dark:border-gray-600 rounded-xl text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-base" placeholder="Note title" required autoFocus />
          </div>
          <div>
            <label htmlFor="note-content" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Content <span className="text-gray-400 dark:text-gray-500 font-normal">(Markdown supported)</span></label>
            <textarea id="note-content" value={formData.content} onChange={(e) => setFormData((p) => ({ ...p, content: e.target.value }))} rows={14} className="w-full px-3 py-2.5 border border-gray-200 dark:border-gray-600 rounded-xl text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-none font-mono leading-relaxed transition-base" placeholder="# Heading\n\nWrite your note..." required />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label htmlFor="note-cat" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Category</label>
              <select id="note-cat" value={formData.category} onChange={(e) => setFormData((p) => ({ ...p, category: e.target.value }))} className="w-full px-3 py-2.5 border border-gray-200 dark:border-gray-600 rounded-xl text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-primary-500 transition-base">
                {categories.map((cat) => (<option key={cat} value={cat}>{cat}</option>))}
              </select>
            </div>
            <div>
              <label htmlFor="note-project" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Project</label>
              <select id="note-project" value={formData.projectId || ''} onChange={(e) => setFormData((p) => ({ ...p, projectId: e.target.value || null }))} className="w-full px-3 py-2.5 border border-gray-200 dark:border-gray-600 rounded-xl text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-primary-500 transition-base">
                <option value="">None</option>
                {projects.map((p) => (<option key={p.id} value={p.id}>{p.name}</option>))}
              </select>
            </div>
            <div className="flex items-end">
              <label className="flex items-center gap-2 px-3 py-2.5 border border-gray-200 dark:border-gray-600 rounded-xl text-sm cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 w-full transition-base has-[:checked]:bg-amber-50 dark:has-[:checked]:bg-amber-900/20 has-[:checked]:border-amber-200 dark:has-[:checked]:border-amber-700 has-[:checked]:ring-1 has-[:checked]:ring-amber-300 dark:has-[:checked]:ring-amber-700">
                <input type="checkbox" checked={formData.pinned} onChange={(e) => setFormData((p) => ({ ...p, pinned: e.target.checked }))} className="rounded text-primary-600" />
                <span className="text-gray-700 dark:text-gray-300 text-xs font-medium">Pin note</span>
              </label>
            </div>
          </div>
          <div className="flex justify-end gap-3 pt-3 border-t border-gray-100 dark:border-gray-700">
            <button type="button" onClick={resetForm} className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-xl transition-base">Cancel</button>
            <button type="submit" className="px-5 py-2 text-sm font-semibold text-white bg-primary-600 hover:bg-primary-700 rounded-xl transition-base shadow-sm shadow-primary-600/25">{editingNote ? 'Update' : 'Create'} Note</button>
          </div>
        </form>
      </Modal>

      <Modal isOpen={!!viewingNote} onClose={() => setViewingNote(null)} title={viewingNote?.title || ''} maxWidth="max-w-2xl">
        {viewingNote && (
          <div>
            <div className="flex items-center gap-2 mb-5 flex-wrap">
              <Badge variant="primary">{viewingNote.category}</Badge>
              {viewingNote.pinned && <Badge variant="warning">Pinned</Badge>}
              <span className="text-xs text-gray-400 dark:text-gray-500 ml-auto">Updated {new Date(viewingNote.updatedAt).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</span>
            </div>
            <div className="prose prose-sm max-w-none text-gray-700 dark:text-gray-300 leading-relaxed" dangerouslySetInnerHTML={{ __html: renderMarkdown(viewingNote.content) }} />
            <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-gray-100 dark:border-gray-700">
              <button onClick={() => { setViewingNote(null); handleEdit(viewingNote); }} className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-xl transition-base">Edit</button>
              <button onClick={() => { onUpdate(viewingNote.id, { pinned: !viewingNote.pinned, updatedAt: new Date().toISOString() }); setViewingNote({ ...viewingNote, pinned: !viewingNote.pinned }); onToast?.(viewingNote.pinned ? 'Note unpinned' : 'Note pinned', 'info'); }} className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-xl transition-base flex items-center gap-1.5">
                <svg className="w-3.5 h-3.5" fill={viewingNote.pinned ? 'currentColor' : 'none'} viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M16 12V4h1V2H7v2h1v8l-2 2v2h5.2v6h1.6v-6H18v-2l-2-2z" /></svg>
                {viewingNote.pinned ? 'Unpin' : 'Pin'}
              </button>
            </div>
          </div>
        )}
      </Modal>

      <Modal isOpen={!!deletingNote} onClose={() => setDeletingNote(null)} title="Delete Note">
        <ConfirmDelete itemName={deletingNote?.title || ''} onConfirm={() => { if (deletingNote) { onDelete(deletingNote.id); setDeletingNote(null); onToast?.('Note deleted', 'info'); } }} onCancel={() => setDeletingNote(null)} />
      </Modal>
    </div>
  );
}
