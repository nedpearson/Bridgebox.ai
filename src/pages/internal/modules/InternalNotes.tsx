import { useState, useEffect } from 'react';
import { commandCenterApi, InternalNote } from '../../../lib/commandCenter';
import { useAuth } from '../../../contexts/AuthContext';
import { BookOpen, Plus, Tag, Calendar, Pin, Archive } from 'lucide-react';

export default function InternalNotes() {
  const { user } = useAuth();
  const [notes, setNotes] = useState<InternalNote[]>([]);
  const [loading, setLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [category, setCategory] = useState('build');

  useEffect(() => {
    loadNotes();
  }, []);

  const loadNotes = async () => {
    try {
      setLoading(true);
      const data = await commandCenterApi.listNotes(false);
      setNotes(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async () => {
    if (!title.trim() || !content.trim() || !user) return;
    try {
      setLoading(true);
      const newNote = await commandCenterApi.createNote({
        created_by: user.id,
        title,
        content,
        category,
        tags: ['manual_entry']
      });
      
      await commandCenterApi.logAuditEvent({
        event_type: 'create_note',
        module: 'InternalNotes',
        target_type: 'internal_note',
        target_id: newNote.id,
        metadata_summary: { category, title_preview: title.substring(0, 50) },
        ip_address: null,
        actor_user_id: user.id
      });
      
      setTitle('');
      setContent('');
      setIsCreating(false);
      await loadNotes();
    } catch (err) {
      alert('Failed to save journal entry');
      setLoading(false);
    }
  };

  const handleArchive = async (id: string) => {
    if (!user) return;
    try {
      await commandCenterApi.updateNote(id, { is_archived: true });
      
      await commandCenterApi.logAuditEvent({
        event_type: 'archive_note',
        module: 'InternalNotes',
        target_type: 'internal_note',
        target_id: id,
        metadata_summary: { action: 'archived' },
        ip_address: null,
        actor_user_id: user.id
      });
      
      setNotes(notes.filter(n => n.id !== id));
    } catch (err) {
      alert('Failed to archive');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <BookOpen className="w-6 h-6 text-amber-400" />
            Build Journal & Notes
          </h2>
          <p className="text-sm text-slate-400 mt-1">Super Admin operational scratchpad and architecture decisions.</p>
        </div>
        <button 
          onClick={() => setIsCreating(!isCreating)}
          className="px-4 py-2 bg-indigo-500 hover:bg-indigo-600 text-white text-sm rounded-lg transition-colors flex items-center gap-2"
        >
          <Plus className="w-4 h-4" /> New Entry
        </button>
      </div>

      {isCreating && (
        <div className="p-6 bg-slate-900 border border-indigo-500/30 rounded-xl space-y-4">
          <input
            type="text"
            placeholder="Journal Title"
            value={title}
            onChange={e => setTitle(e.target.value)}
            className="w-full bg-slate-950 border border-slate-700 rounded-lg px-4 py-2 text-white font-medium focus:border-indigo-500 outline-none"
          />
          <div className="flex gap-4">
             <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="bg-slate-950 border border-slate-700 rounded-lg px-4 py-2 text-slate-300 text-sm focus:border-indigo-500 outline-none"
              >
                <option value="build">Build Note</option>
                <option value="architecture">Architecture Decision</option>
                <option value="release">Release Note Draft</option>
                <option value="bug">Bug Report</option>
              </select>
          </div>
          <textarea
            placeholder="Document your findings, prompts, or thoughts..."
            value={content}
            onChange={e => setContent(e.target.value)}
            rows={5}
            className="w-full bg-slate-950 border border-slate-700 rounded-lg px-4 py-3 text-slate-300 text-sm focus:border-indigo-500 outline-none resize-none"
          />
          <div className="flex justify-end gap-3">
             <button 
              onClick={() => setIsCreating(false)}
              className="px-4 py-2 text-sm text-slate-400 hover:text-white"
            >
              Cancel
            </button>
            <button 
              onClick={handleCreate}
              disabled={loading || !title || !content}
              className="px-4 py-2 bg-indigo-500 hover:bg-indigo-600 disabled:opacity-50 text-white font-medium text-sm rounded-lg transition-colors"
            >
              Save Entry
            </button>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {notes.map(note => (
          <div key={note.id} className="p-6 bg-slate-900 border border-slate-800 rounded-xl group relative hover:border-slate-700 transition-colors flex flex-col">
            <div className="flex items-start justify-between mb-4">
              <h3 className="text-lg font-bold text-white pr-8">{note.title}</h3>
              {note.is_pinned && <Pin className="w-4 h-4 text-yellow-400 absolute top-6 right-6" />}
            </div>
            
            <div className="flex-1 text-slate-300 text-sm whitespace-pre-wrap mb-6">
              {note.content}
            </div>

            <div className="mt-auto pt-4 border-t border-slate-800/50 flex flex-wrap items-center justify-between gap-4">
              <div className="flex gap-2">
                 <span className="px-2 py-1 bg-amber-500/10 text-amber-500 text-xs rounded-md uppercase font-semibold">
                    {note.category || 'General'}
                 </span>
                 {note.tags.map(t => (
                    <span key={t} className="px-2 py-1 bg-slate-800 text-slate-400 text-xs rounded-md flex items-center gap-1">
                      <Tag className="w-3 h-3" /> {t}
                    </span>
                 ))}
              </div>
              <div className="flex items-center gap-4">
                <span className="text-xs text-slate-500 flex items-center gap-1">
                  <Calendar className="w-3 h-3" />
                  {new Date(note.created_at).toLocaleDateString()}
                </span>
                <button 
                  onClick={() => handleArchive(note.id)}
                  title="Archive Note"
                  className="text-slate-500 hover:text-amber-500 transition-colors"
                >
                  <Archive className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        ))}
        {notes.length === 0 && !loading && !isCreating && (
          <div className="col-span-full py-16 text-center border border-dashed border-slate-800 rounded-xl">
            <h3 className="text-lg font-medium text-slate-300 mb-2">Build Journal is Empty</h3>
            <p className="text-slate-500">Document architectural decisions and operational records here.</p>
          </div>
        )}
      </div>
    </div>
  );
}
