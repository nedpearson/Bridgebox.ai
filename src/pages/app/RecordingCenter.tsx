import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Video, Mic, StopCircle, UploadCloud, Save, 
  PlayCircle, Sparkles, Terminal
} from "lucide-react";
import Card from "../../components/Card";
import Button from "../../components/Button";

type RecordingState = 'idle' | 'recording_screen' | 'recording_voice' | 'reviewing';

export default function RecordingCenter() {
  const [state, setState] = useState<RecordingState>('idle');
  const [notes, setNotes] = useState("");
  const [mediaBlobUrl, setMediaBlobUrl] = useState<string | null>(null);
  
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const videoPreviewRef = useRef<HTMLVideoElement>(null);

  const [recordings, setRecordings] = useState([
    { id: 1, title: 'Workflow Automation Review', type: 'screen', date: '2 hours ago', duration: '04:15', status: 'build_request' },
    { id: 2, title: 'Client Intake Voice Memo', type: 'voice', date: 'Yesterday', duration: '01:30', status: 'saved' }
  ]);

  // Cleanup effect
  useEffect(() => {
    return () => {
      stopMediaTracks();
      if (mediaBlobUrl) URL.revokeObjectURL(mediaBlobUrl);
    };
  }, []);

  const stopMediaTracks = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
  };

  const startRecording = async (type: 'screen' | 'voice') => {
    try {
      chunksRef.current = [];
      let stream: MediaStream;

      if (type === 'screen') {
        stream = await navigator.mediaDevices.getDisplayMedia({ video: true, audio: true });
      } else {
        stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      }

      streamRef.current = stream;
      
      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: type === 'screen' ? 'video/webm' : 'audio/webm'
      });

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data);
      };

      mediaRecorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: type === 'screen' ? 'video/webm' : 'audio/webm' });
        const url = URL.createObjectURL(blob);
        setMediaBlobUrl(url);
      };

      // If user clicks native "Stop sharing" button
      stream.getVideoTracks()[0]?.addEventListener('ended', () => {
        if (mediaRecorder.state === 'recording') {
          mediaRecorder.stop();
          setState('reviewing');
          stopMediaTracks();
        }
      });

      mediaRecorderRef.current = mediaRecorder;
      mediaRecorder.start();
      setState(type === 'screen' ? 'recording_screen' : 'recording_voice');

    } catch (err) {
      console.error("Recording failed to start:", err);
      setState('idle');
    }
  };

  const handleStop = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
      mediaRecorderRef.current.stop();
    }
    stopMediaTracks();
    setState('reviewing');
  };

  const handleCancel = () => {
    stopMediaTracks();
    if (mediaBlobUrl) URL.revokeObjectURL(mediaBlobUrl);
    setMediaBlobUrl(null);
    setState('idle'); 
    setNotes(""); 
  };

  return (
    <div className="flex-1 overflow-y-auto w-full mb-24 lg:mb-0 pb-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-extrabold text-white tracking-tight flex items-center gap-3">
              <Video className="w-8 h-8 text-indigo-500" />
              Recording Center
            </h1>
            <p className="text-slate-400 mt-2 text-lg">
              Capture screen workflows or voice commands to automatically generate intelligent enterprise software.
            </p>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          <Card glass className="p-8 border-indigo-500/20 hover:border-indigo-500/40 transition-all group overflow-hidden relative">
            <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/5 to-transparent z-0"></div>
            <div className="relative z-10 flex flex-col items-center justify-center text-center space-y-6">
              <div className="w-20 h-20 rounded-full bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center group-hover:scale-110 transition-transform">
                <Video className="w-10 h-10 text-indigo-400" />
              </div>
              <div>
                <h3 className="text-2xl font-bold text-white mb-2">Screen Recording</h3>
                <p className="text-slate-400 text-sm max-w-sm mx-auto">Record your operational flow. Our AI will map exactly how you work and convert it into a scalable app.</p>
              </div>
              <Button 
                variant="primary" 
                size="lg" 
                className="w-full sm:w-auto shadow-lg shadow-indigo-500/25 glow-effect"
                onClick={() => startRecording('screen')}
                disabled={state !== 'idle'}
              >
                Start Capture
              </Button>
            </div>
          </Card>

          <Card glass className="p-8 border-emerald-500/20 hover:border-emerald-500/40 transition-all group overflow-hidden relative">
            <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 to-transparent z-0"></div>
            <div className="relative z-10 flex flex-col items-center justify-center text-center space-y-6">
              <div className="w-20 h-20 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center group-hover:scale-110 transition-transform">
                <Mic className="w-10 h-10 text-emerald-400" />
              </div>
              <div>
                <h3 className="text-2xl font-bold text-white mb-2">Voice Command</h3>
                <p className="text-slate-400 text-sm max-w-sm mx-auto">Dictate an idea intuitively or outline an internal process verbally. We will parse the transcription logic securely.</p>
              </div>
              <Button 
                variant="primary" 
                size="lg" 
                className="w-full sm:w-auto !bg-emerald-600 hover:!bg-emerald-500 shadow-lg shadow-emerald-500/25"
                onClick={() => startRecording('voice')}
                disabled={state !== 'idle'}
              >
                Start Dictation
              </Button>
            </div>
          </Card>
        </div>

        <AnimatePresence>
          {(state === 'recording_screen' || state === 'recording_voice') && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="overflow-hidden"
            >
              <Card glass className="p-8 border-red-500/30 bg-red-500/5 flex flex-col md:flex-row items-center justify-between gap-6">
                <div className="flex items-center gap-4">
                  <div className="w-4 h-4 rounded-full bg-red-500 animate-pulse shadow-[0_0_15px_rgba(239,68,68,0.7)]" />
                  <div>
                    <h3 className="text-lg font-bold text-red-100">
                      {state === 'recording_screen' ? 'Capturing Screen Target...' : 'Listening to Audio...'}
                    </h3>
                    <p className="text-red-300 text-sm">Recording in progress. Press stop when completed.</p>
                  </div>
                </div>
                <Button 
                  className="!bg-red-500/20 !text-red-400 border border-red-500/50 hover:!bg-red-500 hover:!text-white transition-all w-full md:w-auto"
                  onClick={handleStop}
                >
                  <StopCircle className="w-5 h-5 mr-2" />
                  End Recording
                </Button>
              </Card>
            </motion.div>
          )}

          {state === 'reviewing' && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
            >
              <Card glass className="p-8 border-indigo-500/30 shadow-2xl space-y-6">
                <div className="flex items-start justify-between">
                  <h3 className="text-2xl font-bold text-white flex items-center gap-2">
                    <Sparkles className="w-6 h-6 text-indigo-400" />
                    Review & Send
                  </h3>
                  <button onClick={handleCancel} className="text-slate-400 hover:text-white transition-colors">Close</button>
                </div>

                <div className="grid md:grid-cols-2 gap-8">
                  <div className="aspect-video bg-slate-900 rounded-xl border border-slate-800 flex items-center justify-center shadow-inner relative overflow-hidden group hover:border-indigo-500/50 transition-colors">
                    {mediaBlobUrl ? (
                      <video 
                        ref={videoPreviewRef}
                        src={mediaBlobUrl} 
                        controls 
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="flex flex-col items-center">
                        <PlayCircle className="w-16 h-16 text-indigo-500/50 group-hover:scale-110 group-hover:text-indigo-400 transition-all" />
                        <span className="text-slate-500 text-sm mt-4">Processing media buffer...</span>
                      </div>
                    )}
                  </div>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-300 mb-2">Attach Technical Notes</label>
                      <textarea 
                        rows={4} 
                        className="w-full" 
                        placeholder="Add any specific context, software interactions, or desired logic handling here..."
                        value={notes}
                        onChange={(e) => setNotes(e.target.value)}
                      />
                    </div>
                    <div className="flex flex-col gap-3 pt-2">
                       <Button variant="primary" className="w-full flex justify-center !bg-indigo-600 hover:!bg-indigo-500 shadow-md glow-effect" onClick={handleCancel}>
                         <Terminal className="w-4 h-4 mr-2" /> Submit Build Request
                       </Button>
                       <div className="grid grid-cols-2 gap-3">
                         <Button variant="outline" className="flex justify-center" onClick={handleCancel}>
                           <Save className="w-4 h-4 mr-2" /> Save Draft
                         </Button>
                         <Button variant="outline" className="flex justify-center" onClick={handleCancel}>
                           <UploadCloud className="w-4 h-4 mr-2" /> Download File
                         </Button>
                       </div>
                    </div>
                  </div>
                </div>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>

        <div>
          <h2 className="text-xl font-bold text-white mb-4">Historical Recordings</h2>
          <Card glass className="overflow-hidden p-0 border-slate-800/80">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr>
                     <th>Type</th>
                     <th>Title</th>
                     <th>Duration</th>
                     <th>Captured</th>
                     <th>Status</th>
                     <th>Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/50">
                   {recordings.map((rec, i) => (
                     <tr key={i} className="hover:bg-slate-800/30 transition-colors group">
                       <td className="w-16">
                         {rec.type === 'screen' ? <Video className="w-5 h-5 text-indigo-400" /> : <Mic className="w-5 h-5 text-emerald-400" />}
                       </td>
                       <td className="font-medium text-white">{rec.title}</td>
                       <td className="text-slate-400">{rec.duration}</td>
                       <td className="text-slate-400">{rec.date}</td>
                       <td>
                          <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${
                            rec.status === 'build_request' 
                            ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20' 
                            : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                          }`}>
                            {rec.status === 'build_request' ? 'Pending Build' : 'Saved Draft'}
                          </span>
                       </td>
                       <td>
                         <Button variant="ghost" size="sm" className="opacity-0 group-hover:opacity-100 transition-opacity">
                            View <PlayCircle className="w-4 h-4 ml-1" />
                         </Button>
                       </td>
                     </tr>
                   ))}
                </tbody>
              </table>
            </div>
          </Card>
        </div>

      </div>
    </div>
  );
}
