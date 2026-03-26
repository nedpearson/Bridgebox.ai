import React, { useState, useEffect } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import { Bold, Italic, Strikethrough, Heading1, Heading2, List, ListOrdered, Sparkles, Save, Loader2 } from 'lucide-react';
import { copilotEngine } from '../../lib/ai/services/copilotEngine';
import Button from '../Button';

interface GenerativeDraftingStudioProps {
  initialContent?: string;
  onSave?: (html: string) => Promise<void>;
  documentId: string;
}

export default function GenerativeDraftingStudio({ initialContent = '<p>Start drafting your document...</p>', onSave, documentId }: GenerativeDraftingStudioProps) {
  const [isSaving, setIsSaving] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [aiPrompt, setAiPrompt] = useState('');
  const [showAiToolbar, setShowAiToolbar] = useState(false);

  const editor = useEditor({
    extensions: [StarterKit],
    content: initialContent,
    editorProps: {
      attributes: {
        class: 'prose prose-invert max-w-none focus:outline-none min-h-[500px] p-6 text-slate-300',
      },
    },
  });

  const handleSave = async () => {
    if (!editor || !onSave) return;
    try {
      setIsSaving(true);
      await onSave(editor.getHTML());
    } finally {
      setIsSaving(false);
    }
  };

  const handleGenerate = async () => {
    if (!editor || !aiPrompt.trim()) return;
    try {
      setIsGenerating(true);
      // Simulate generative text payload from AI Copilot
      const result = await copilotEngine.generateReasonedResponse(
        `Draft the following content for an enterprise document. ONLY return the drafted text without pleasantries: ${aiPrompt}`,
        { role: 'admin', organizationId: null, userId: 'system' },
        { activeModule: 'drafting_studio' }
      );
      
      const responseText = result.text || '';
      // Inject AI response natively at cursor
      editor.commands.insertContent(`<blockquote><strong>AI Draft:</strong><br/>${responseText}</blockquote><p></p>`);
      setAiPrompt('');
      setShowAiToolbar(false);
    } catch (e) {
      console.error('AI Generation Failed:', e);
    } finally {
      setIsGenerating(false);
    }
  };

  if (!editor) return <div className="p-8 flex justify-center"><Loader2 className="animate-spin w-8 h-8 text-indigo-500"/></div>;

  return (
    <div className="flex flex-col h-full bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-2xl">
      {/* Editor Main Toolbar */}
      <div className="flex items-center justify-between p-3 border-b border-slate-800 bg-slate-950/50">
        <div className="flex items-center space-x-1">
          <button onClick={() => editor.chain().focus().toggleBold().run()} className={`p-2 rounded hover:bg-slate-800 transition-colors ${editor.isActive('bold') ? 'bg-slate-800 text-white' : 'text-slate-400'}`}>
            <Bold className="w-4 h-4" />
          </button>
          <button onClick={() => editor.chain().focus().toggleItalic().run()} className={`p-2 rounded hover:bg-slate-800 transition-colors ${editor.isActive('italic') ? 'bg-slate-800 text-white' : 'text-slate-400'}`}>
            <Italic className="w-4 h-4" />
          </button>
          <button onClick={() => editor.chain().focus().toggleStrike().run()} className={`p-2 rounded hover:bg-slate-800 transition-colors ${editor.isActive('strike') ? 'bg-slate-800 text-white' : 'text-slate-400'}`}>
            <Strikethrough className="w-4 h-4" />
          </button>
          <div className="w-px h-5 bg-slate-700 mx-2" />
          <button onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()} className={`p-2 rounded hover:bg-slate-800 transition-colors ${editor.isActive('heading', { level: 1 }) ? 'bg-slate-800 text-white' : 'text-slate-400'}`}>
            <Heading1 className="w-4 h-4" />
          </button>
          <button onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()} className={`p-2 rounded hover:bg-slate-800 transition-colors ${editor.isActive('heading', { level: 2 }) ? 'bg-slate-800 text-white' : 'text-slate-400'}`}>
            <Heading2 className="w-4 h-4" />
          </button>
          <div className="w-px h-5 bg-slate-700 mx-2" />
          <button onClick={() => editor.chain().focus().toggleBulletList().run()} className={`p-2 rounded hover:bg-slate-800 transition-colors ${editor.isActive('bulletList') ? 'bg-slate-800 text-white' : 'text-slate-400'}`}>
            <List className="w-4 h-4" />
          </button>
          <button onClick={() => editor.chain().focus().toggleOrderedList().run()} className={`p-2 rounded hover:bg-slate-800 transition-colors ${editor.isActive('orderedList') ? 'bg-slate-800 text-white' : 'text-slate-400'}`}>
            <ListOrdered className="w-4 h-4" />
          </button>
        </div>
        
        <div className="flex items-center space-x-3">
          <button 
            onClick={() => setShowAiToolbar(!showAiToolbar)}
            className={`flex items-center space-x-2 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${showAiToolbar ? 'bg-indigo-500/20 text-indigo-400 border border-indigo-500/30' : 'bg-slate-800/50 text-slate-300 hover:text-white border border-transparent'}`}
          >
            <Sparkles className="w-4 h-4" />
            <span>AI Draft</span>
          </button>
          <Button onClick={handleSave} disabled={isSaving || !onSave} size="sm">
            {isSaving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
            Save Draft
          </Button>
        </div>
      </div>

      {/* Embedded AI Copilot Prompt */}
      {showAiToolbar && (
        <div className="flex animate-in slide-in-from-top-2 p-3 bg-indigo-950/30 border-b border-indigo-500/20 items-center space-x-3">
          <Sparkles className="w-5 h-5 text-indigo-400 flex-shrink-0" />
          <input 
            autoFocus
            type="text"
            value={aiPrompt}
            onChange={(e) => setAiPrompt(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleGenerate()}
            placeholder="Instruct the AI Copilot what to draft at the cursor... e.g. 'Write a polite rejection letter'"
            className="flex-1 bg-transparent border-none text-sm text-white placeholder-indigo-300/50 focus:outline-none focus:ring-0"
          />
          <Button onClick={handleGenerate} disabled={isGenerating || !aiPrompt.trim()} size="sm" variant="primary">
            {isGenerating ? 'Drafting...' : 'Generate'}
          </Button>
        </div>
      )}

      {/* Editor Canvas Container */}
      <div className="flex-1 overflow-y-auto bg-slate-900 cursor-text" onClick={() => editor.commands.focus()}>
        <EditorContent editor={editor} />
      </div>
    </div>
  );
}
