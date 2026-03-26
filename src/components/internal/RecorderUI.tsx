import { useState } from 'react';
import { useScreenRecorder } from '../../hooks/useScreenRecorder';
import { internalRecordingsApi } from '../../lib/internalRecordings';
import { Play, Square, Pause, Save, X, Upload, Sparkles, Video, Mic, Monitor } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { copilotEngine } from '../../lib/ai/services/copilotEngine';

export default function RecorderUI() {
  const { user } = useAuth();
  const {
    status,
    error,
    mediaBlob,
    elapsedTime,
    startRecording,
    pauseRecording,
    resumeRecording,
    stopRecording,
    clearBlob
  } = useScreenRecorder();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('bug');
  const [notes, setNotes] = useState('');
  const [recordingMode, setRecordingMode] = useState<'standard' | 'development'>('standard');
  const [buildNotes, setBuildNotes] = useState('');
  const [featureNotes, setFeatureNotes] = useState('');
  const [intendedUse, setIntendedUse] = useState('');
  const [uploading, setUploading] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const [isInterpreting, setIsInterpreting] = useState(false);

  const handleInterpretVideo = async () => {
    if (!title.trim()) {
      alert('Please provide a basic title first so the AI has context to interpret the recording.');
      return;
    }
    try {
      setIsInterpreting(true);
      const isDev = recordingMode === 'development';

      const prompt = isDev
        ? `Act as an expert level Prompt Engineer and Software Architect. The user recorded a screen session titled "${title}" in the category "${category}" intended to instruct an advanced AI coding agent named "Antigravity" to build a feature or entire program.
           Please write:
           1. A highly descriptive summary of the recording.
           2. Internal technical context.
           3. The absolute BEST text prompt to input into Antigravity to achieve the desired build autonomously. Make it highly detailed and action-oriented.
           4. Any necessary architectural constraints.
           5. Feature request clarifications.
           
           Format your response strictly using these exact tokens:
           DESCRIPTION: [summary]
           NOTES: [context]
           PROMPT: [The ultimate prompt for Antigravity]
           ARCHITECTURE: [Architectural constraints]
           CLARIFICATIONS: [Clarifications]`
        : `Act as an expert software diagnostician. The user just recorded a screen session titled "${title}" in the category "${category}". 
           Please write a highly descriptive and professional summary of this recording. Also, provide a list of likely reproduction steps or internal technical notes based strictly on the context of the title and the fact that it is a screen capture payload.
           Format your response exactly as:
           DESCRIPTION: [Your description here]
           NOTES: [Your notes here]`;
      
      const result = await copilotEngine.generateReasonedResponse(
        prompt,
        { role: 'super_admin', organizationId: null, userId: user?.id || 'system' },
        { activeModule: 'recording_center' }
      );
      
      const text = result.text || '';
      
      const extract = (key: string, nextKeyPatt: string) => {
        const regex = new RegExp(`${key}:\\s*(.*?)(?=${nextKeyPatt}|$)`, 's');
        const match = text.match(regex);
        return match && match[1] ? match[1].trim() : '';
      };

      const parsedDesc = extract('DESCRIPTION', 'NOTES:|PROMPT:|ARCHITECTURE:|CLARIFICATIONS:');
      const parsedNotes = extract('NOTES', 'PROMPT:|ARCHITECTURE:|CLARIFICATIONS:');
      
      if (parsedDesc) setDescription(parsedDesc);
      if (parsedNotes) setNotes(parsedNotes);

      if (isDev) {
        const parsedPrompt = extract('PROMPT', 'ARCHITECTURE:|CLARIFICATIONS:');
        const parsedArch = extract('ARCHITECTURE', 'CLARIFICATIONS:');
        const parsedClarifications = extract('CLARIFICATIONS', 'END_OF_RESPONSE');

        if (parsedPrompt) setIntendedUse(parsedPrompt);
        if (parsedArch) setBuildNotes(parsedArch);
        if (parsedClarifications) setFeatureNotes(parsedClarifications);
      }
      
    } catch (err: any) {
      alert('AI interpretation failed: ' + err.message);
    } finally {
      setIsInterpreting(false);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleUpload = async () => {
    if (!mediaBlob || !user) return;
    if (!title.trim()) {
      alert('Please enter a title');
      return;
    }

    try {
      setUploading(true);
      
      const fileName = `${Date.now()}_${title.replace(/\s+/g, '-')}.webm`;
      const path = await internalRecordingsApi.uploadRecordingFile(
        fileName,
        mediaBlob,
        'video/webm'
      );

      await internalRecordingsApi.createRecording({
        created_by: user.id,
        title,
        description,
        category,
        notes,
        recording_mode: recordingMode,
        build_notes: recordingMode === 'development' ? buildNotes : null,
        feature_request_notes: recordingMode === 'development' ? featureNotes : null,
        intended_use: recordingMode === 'development' ? intendedUse : null,
        tags: ['internal_tools'],
        duration: elapsedTime,
        size: mediaBlob.size,
        mime_type: 'video/webm',
        storage_path: path,
        status: 'saved'
      });

      setUploadSuccess(true);
      setTimeout(() => {
        setUploadSuccess(false);
        clearBlob();
        setTitle('');
        setDescription('');
        setNotes('');
        setBuildNotes('');
        setFeatureNotes('');
        setIntendedUse('');
      }, 3000);

    } catch (err: any) {
      alert(err.message || 'Upload failed');
    } finally {
      setUploading(false);
    }
  };

  if (uploadSuccess) {
    return (
      <div className="p-6 bg-green-500/10 border border-green-500/30 rounded-xl text-center">
        <h3 className="text-xl font-bold text-green-400 mb-2">Upload Complete!</h3>
        <p className="text-slate-400">Recording has been safely stored in the internal bucket.</p>
      </div>
    );
  }

  return (
    <div className="bg-slate-900 rounded-xl border border-slate-800 p-6 overflow-hidden relative">
      <div className="absolute top-0 right-0 p-2 opacity-50 pointer-events-none">
        <span className="text-xs font-mono text-purple-400 tracking-widest uppercase">Internal Use Only</span>
      </div>

      <div className="mb-6 flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-white">Capture Session</h2>
          <p className="text-sm text-slate-400">Record screens, walkthroughs, or bugs for internal review.</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="text-2xl font-mono text-white">
            {formatTime(elapsedTime)}
          </div>
          <div className="flex gap-2">
            {status === 'idle' && !mediaBlob && (
              <div className="flex bg-slate-800 rounded-lg overflow-hidden border border-slate-700">
                <button
                  onClick={() => startRecording('screen')}
                  className="flex items-center gap-2 hover:bg-slate-700/80 text-white px-3 py-2 text-sm transition-colors border-r border-slate-700"
                  title="Record Screen"
                >
                  <Monitor className="w-4 h-4 text-indigo-400" />
                  Screen
                </button>
                <button
                  onClick={() => startRecording('camera')}
                  className="flex items-center gap-2 hover:bg-slate-700/80 text-white px-3 py-2 text-sm transition-colors border-r border-slate-700"
                  title="Record Camera"
                >
                  <Video className="w-4 h-4 text-emerald-400" />
                  Camera
                </button>
                <button
                  onClick={() => startRecording('audio')}
                  className="flex items-center gap-2 hover:bg-slate-700/80 text-white px-3 py-2 text-sm transition-colors"
                  title="Record Audio"
                >
                  <Mic className="w-4 h-4 text-rose-400" />
                  Audio
                </button>
              </div>
            )}

            {status === 'recording' && (
              <>
                <button
                  onClick={pauseRecording}
                  className="p-2 bg-slate-800 hover:bg-slate-700 text-white rounded-lg transition-colors"
                >
                  <Pause className="w-5 h-5" />
                </button>
                <button
                  onClick={stopRecording}
                  className="flex items-center gap-2 bg-slate-800 hover:bg-slate-700 text-red-500 px-4 py-2 rounded-lg transition-colors"
                >
                  <Square className="w-5 h-5 fill-current" />
                  Stop
                </button>
              </>
            )}

            {status === 'paused' && (
              <button
                onClick={resumeRecording}
                className="p-2 bg-slate-800 hover:bg-slate-700 text-white rounded-lg transition-colors"
              >
                <Play className="w-5 h-5 fill-current" />
              </button>
            )}
          </div>
        </div>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400">
          {error}
        </div>
      )}

      {mediaBlob && (
        <div className="space-y-6 border-t border-slate-800 pt-6">
          <div className="aspect-video bg-black rounded-lg overflow-hidden border border-slate-800 relative">
            <video
              src={URL.createObjectURL(mediaBlob)}
              controls
              className="w-full h-full object-contain"
            />
          </div>

          <div className="bg-slate-900 border border-slate-700/50 p-1 rounded-lg inline-flex mb-2">
            <button
               onClick={() => setRecordingMode('standard')}
               className={`px-4 py-1.5 rounded-md text-sm font-medium transition-colors ${recordingMode === 'standard' ? 'bg-slate-800 text-white shadow-sm' : 'text-slate-400 hover:text-white'}`}
            >Standard Recording</button>
            <button
               onClick={() => setRecordingMode('development')}
               className={`px-4 py-1.5 rounded-md text-sm font-medium transition-colors flex items-center gap-2 ${recordingMode === 'development' ? 'bg-indigo-500 text-white shadow-sm' : 'text-slate-400 hover:text-white'}`}
            >Record for App Development</button>
          </div>

          <div className="flex justify-between items-end mb-1">
             <h3 className="text-lg font-semibold text-white">Recording Details</h3>
             <button
               onClick={handleInterpretVideo}
               disabled={isInterpreting || !title.trim()}
               className="flex items-center gap-2 px-3 py-1.5 bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-400 border border-indigo-500/30 rounded-lg text-sm transition-colors disabled:opacity-50"
             >
               <Sparkles className="w-4 h-4" />
               {isInterpreting ? 'Interpreting Video...' : 'Interpret with AI'}
             </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-400 mb-1">Recording Title</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-indigo-500"
                placeholder="e.g., Bug: Dashboard Crashing"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-400 mb-1">Category</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-indigo-500"
              >
                <option value="bug">Bug Report</option>
                <option value="walkthrough">Walkthrough</option>
                <option value="demo">Demo</option>
                <option value="release_testing">Release Testing</option>
                <option value="product_idea">Product Idea</option>
                <option value="other">Other</option>
              </select>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-400 mb-1">Description (Optional)</label>
              <input
                type="text"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-indigo-500"
                placeholder="Short summary of this recording"
              />
            </div>
             <div>
              <label className="block text-sm font-medium text-slate-400 mb-1">Internal Notes</label>
              <input
                type="text"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-indigo-500"
                placeholder="Detailed reproduction steps or thoughts"
              />
            </div>
          </div>

          {recordingMode === 'development' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-5 border border-indigo-500/30 bg-indigo-500/5 rounded-lg border-dashed">
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-indigo-500 mb-1">Intended Outcome / Goal</label>
                <input 
                  type="text" 
                  value={intendedUse} 
                  onChange={e => setIntendedUse(e.target.value)} 
                  placeholder="e.g. Provide the AI with workflow steps so it can automate this." 
                  className="w-full bg-slate-950/80 border border-indigo-500/20 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-indigo-500" 
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-indigo-500 mb-1">Architecture / Build Notes</label>
                <textarea 
                  value={buildNotes} 
                  onChange={e => setBuildNotes(e.target.value)} 
                  rows={3} 
                  placeholder="Technical details, file paths, or architectural constraints..." 
                  className="w-full bg-slate-950/80 border border-indigo-500/20 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-indigo-500 resize-none" 
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-indigo-500 mb-1">Feature Request Clarifications</label>
                <textarea 
                  value={featureNotes} 
                  onChange={e => setFeatureNotes(e.target.value)} 
                  rows={3} 
                  placeholder="What specifically needs to happen instead of current behavior?" 
                  className="w-full bg-slate-950/80 border border-indigo-500/20 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-indigo-500 resize-none" 
                />
              </div>
            </div>
          )}

          <div className="flex gap-4">
            <button
              onClick={handleUpload}
              disabled={uploading || !title.trim()}
              className="flex-1 flex items-center justify-center gap-2 bg-indigo-500 hover:bg-indigo-600 disabled:opacity-50 disabled:cursor-not-allowed text-white py-3 rounded-lg font-medium transition-colors"
            >
              <Upload className="w-5 h-5" />
              {uploading ? 'Uploading...' : 'Save Recording'}
            </button>
            <button
              onClick={clearBlob}
              disabled={uploading}
              className="flex items-center gap-2 bg-slate-800 hover:bg-slate-700 disabled:opacity-50 text-white px-6 rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
              Discard
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
