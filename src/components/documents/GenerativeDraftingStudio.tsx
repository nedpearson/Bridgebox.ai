import React, { useState, useEffect, useRef } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import { Bold, Italic, Strikethrough, Heading1, Heading2, List, ListOrdered, Sparkles, Save, Loader2, Play, CheckCircle } from 'lucide-react';
import { copilotEngine } from '../../lib/ai/services/copilotEngine';
import Button from '../Button';
import { useAuth } from '../../contexts/AuthContext';
import { BuildOrchestratorAgent } from '../../lib/ai/agents/BuildOrchestratorAgent';
import { supabase } from '../../lib/supabase';

interface GenerativeDraftingStudioProps {
  initialContent?: string;
  onSave?: (html: string) => Promise<void>;
  onApprove?: () => Promise<void>;
  documentId: string;
  contextPayload?: string;
}

export default function GenerativeDraftingStudio({ initialContent = '<p>Start drafting your document...</p>', onSave, onApprove, documentId, contextPayload }: GenerativeDraftingStudioProps) {
  const [isSaving, setIsSaving] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [aiPrompt, setAiPrompt] = useState('');
  const [showAiToolbar, setShowAiToolbar] = useState(false);
  const [isImplementing, setIsImplementing] = useState(false);
  const [implementSuccess, setImplementSuccess] = useState(false);
  const { currentOrganization, user } = useAuth();

  const editor = useEditor({
    extensions: [StarterKit],
    content: initialContent,
    editorProps: {
      attributes: {
        class: 'prose prose-invert max-w-none focus:outline-none min-h-[500px] p-6 text-slate-300',
      },
    },
  });

  const hasAutoDrafted = useRef(false);

  useEffect(() => {
    if (!editor || !contextPayload) return;
    
    // Immediately auto-draft upon opening the project if the editor scope is empty
    if (!hasAutoDrafted.current && editor.getText().trim() === 'Start drafting your document...') {
       hasAutoDrafted.current = true;
       // Execute generation explicitly on mount
       handleGenerate();
    }
  }, [editor, contextPayload]);

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
    if (!editor) return;
    if (!aiPrompt.trim() && !contextPayload) return;
    
    try {
      setIsGenerating(true);
      
      const generationPrompt = aiPrompt.trim() 
         ? `You are a real-time AI document editor.
The user has provided a short steering phrase or instruction: "${aiPrompt.trim()}"

Here is the current HTML document:
${editor.getHTML()}

Task: Apply this instruction seamlessly to the document. Add, delete, or modify the content to perfectly match the user's direction while preserving the professional tone and formatting of the rest of the document.
CRITICAL: You MUST return the ENTIRE updated HTML document from start to finish. Do NOT just return a summary of changes, and do NOT truncate the rest of the document.
Return ONLY the raw updated HTML. No markdown wrappers (\`\`\`html), no pleasantries, and no explanations.`
         : `Based entirely on this context: ${contextPayload} 
Draft a comprehensive and professional Project Charter heavily focused on WHAT IS EXPECTED from this deployment. 
Include bold HTML headings for <h1>Project Objective</h1>, <h2>Expected Scope & Deliverables</h2>, <h2>Integration Architecture Strategy</h2>, <h2>Acceptance Criteria</h2>, and <h2>Next Steps</h2>. 
Make sure it clearly dictates the exact expectations of the project natively based on the context provided.
ONLY return the HTML-formatted drafted text without pleasantries or introductory chat, starting directly with the document body.`;

      // Simulate generative text payload from AI Copilot
      const result = await copilotEngine.generateReasonedResponse(
        generationPrompt,
        { role: 'admin', organizationId: null, userId: 'system' },
        { activeModule: 'drafting_studio' }
      );
      
      let responseText = result.text || '';
      responseText = responseText.replace(/```html/g, '').replace(/```/g, '').trim();
      
      // We always overwrite the content. If it was a blank project, we write the charter. If it was an edit instruction, we rewrite it natively.
      editor.commands.setContent(responseText);
      
      setAiPrompt('');
      
      if (onSave) {
          await onSave(responseText);
      }



    } catch (e) {
      console.error('AI Generation Failed:', e);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleImplementNextSteps = async () => {
    if (!editor || !currentOrganization || !user) return;
    try {
      setIsImplementing(true);
      setImplementSuccess(false);
      const textContent = editor.getText();
      
      if (onSave) {
          await onSave(editor.getHTML());
      }

      // Generate a valid Onboarding Session natively to satisfy relational FKs
      const { data: sessionData, error: sessionError } = await supabase.from('bb_onboarding_sessions').insert({
          organization_id: currentOrganization.id,
          client_id: user.id,
          session_title: `Generated Charter: ${documentId}`,
          raw_input: { text: textContent },
          status: 'approved'
      }).select('id').single();
      
      if (sessionError) throw sessionError;

      await BuildOrchestratorAgent.extractTasksFromSession(sessionData.id, currentOrganization.id, textContent);
      await BuildOrchestratorAgent.executeBuildQueue(sessionData.id, currentOrganization.id, user.id, documentId);
      
      if (onApprove) {
          await onApprove();
      }

      setImplementSuccess(true);
      
      // Auto-navigate user directly to the linked Tasks screen
      window.dispatchEvent(new CustomEvent('command-center-tab', { detail: 'tasks' }));
      
      setTimeout(() => setImplementSuccess(false), 5000);
    } catch (e: any) {
      console.error('Failed to implement next steps:', e);
      alert('Implementation Exception: ' + (e.message || 'Unknown database or AI parsing error occurred.'));
    } finally {
      setIsImplementing(false);
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
          <Button onClick={handleImplementNextSteps} disabled={isImplementing || !editor.getText().trim() || editor.getText() === 'Start drafting your document...'} size="sm" className={`bg-emerald-600 hover:bg-emerald-700 text-white border-none shadow-lg shadow-emerald-500/20 px-4 transition-all ${implementSuccess ? 'bg-emerald-500 hover:bg-emerald-500' : ''}`}>
            {isImplementing ? (
               <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Extracting Tasks (~10s)...</>
            ) : implementSuccess ? (
               <><CheckCircle className="w-4 h-4 mr-2" /> Actioned!</>
            ) : (
               <><Play className="w-4 h-4 mr-2" /> Implement Next Steps</>
            )}
          </Button>

          <Button onClick={handleSave} disabled={isSaving || !onSave} size="sm">
            {isSaving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
            Save Draft
          </Button>
        </div>
      </div>

      {/* Persistent Embedded AI Editor Toolbar */}
      <div className="flex p-3 bg-indigo-950/30 border-b border-indigo-500/20 items-center space-x-3">
        <Sparkles className="w-5 h-5 text-indigo-400 flex-shrink-0" />
        <input 
          type="text"
          value={aiPrompt}
          onChange={(e) => setAiPrompt(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleGenerate()}
          placeholder="Tell the AI to edit this charter (e.g. 'Make it shorter', 'Add an acceptance criteria')..."
          className="flex-1 bg-transparent border-none text-sm text-white placeholder-indigo-300/50 focus:outline-none focus:ring-0"
        />
        <Button onClick={handleGenerate} disabled={isGenerating || (!aiPrompt.trim() && !contextPayload)} size="sm" variant="primary">
          {isGenerating ? 'Applying Edit...' : 'AI Edit'}
        </Button>
      </div>

      {/* Editor Canvas Container */}
      <div className="flex-1 overflow-y-auto bg-slate-900 cursor-text" onClick={() => editor.commands.focus()}>
        <EditorContent editor={editor} />
      </div>
    </div>
  );
}
