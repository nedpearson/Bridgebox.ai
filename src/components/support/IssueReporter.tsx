import React, { useState, useRef, useEffect } from 'react';
import { HelpCircle, X, Video, Send, Loader2, Monitor, Wifi, Shield } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase';
import { supportTicketsApi } from '../../lib/supportTickets';
import { SupportSessionProtocol } from '../../lib/webrtc/SupportSessionProtocol';

type Mode = 'menu' | 'record_issue' | 'live_assist';

export default function IssueReporter() {
  const { currentOrganization } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [mode, setMode] = useState<Mode>('menu');

  // Recording State
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('bug');
  const [isRecording, setIsRecording] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  // Live Session State
  const [sessionCode, setSessionCode] = useState('');
  const [connectionState, setConnectionState] = useState<RTCPeerConnectionState | 'disconnected'>('disconnected');
  const sessionProtocolRef = useRef<SupportSessionProtocol | null>(null);
  const liveTicketIdRef = useRef<string | null>(null);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<BlobPart[]>([]);
  const streamRef = useRef<MediaStream | null>(null);

  // Auto-close success message after 3 seconds
  useEffect(() => {
    if (success) {
      const timer = setTimeout(() => {
        setIsOpen(false);
        resetState();
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [success]);

  // Global destruction listener for WebRTC streams crossing viewport unmount boundaries
  useEffect(() => {
    return () => {
      if (sessionProtocolRef.current) {
        sessionProtocolRef.current.disconnect();
      }
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(t => t.stop());
      }
    };
  }, []);

  const resetState = () => {
    setMode('menu');
    setTitle('');
    setDescription('');
    setCategory('bug');
    setIsRecording(false);
    setIsSubmitting(false);
    setError('');
    setSuccess(false);
    setSessionCode('');
    setConnectionState('disconnected');
    chunksRef.current = [];
    stopMediaStream();
    
    if (sessionProtocolRef.current) {
      sessionProtocolRef.current.disconnect();
      sessionProtocolRef.current = null;
    }
    if (liveTicketIdRef.current) {
      supportTicketsApi.revokeSession(liveTicketIdRef.current).catch(console.error);
      liveTicketIdRef.current = null;
    }
  };

  const stopMediaStream = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
  };

  const handleStartRecording = async () => {
    try {
      setError('');
      chunksRef.current = [];
      const stream = await navigator.mediaDevices.getDisplayMedia({
        video: { displaySurface: 'browser' },
        audio: true
      });
      
      streamRef.current = stream;

      // Handle user terminating the stream manually via browser UI
      stream.getVideoTracks()[0].onended = () => {
        if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
          mediaRecorderRef.current.stop();
        }
      };

      const mediaRecorder = new MediaRecorder(stream, { mimeType: 'video/webm' });
      mediaRecorderRef.current = mediaRecorder;

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          chunksRef.current.push(e.data);
        }
      };

      mediaRecorder.onstop = async () => {
        await handleSubmitIssue();
        stopMediaStream();
      };

      mediaRecorder.start();
      setIsRecording(true);
    } catch (err: any) {
      console.error('Failed to start recording:', err);
      setError('Screen recording permission denied or unsupported.');
      setIsRecording(false);
    }
  };

  const handleStopRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
      mediaRecorderRef.current.stop(); // Triggers onstop -> handleSubmitIssue
    }
  };

  const handleSubmitIssue = async () => {
    if (!currentOrganization) {
      setError('You must be in an active organization to submit an issue.');
      return;
    }
    
    setIsSubmitting(true);
    setError('');

    try {
      const blob = new Blob(chunksRef.current, { type: 'video/webm' });
      const sizeBytes = blob.size;
      const fileName = `${currentOrganization.id}/${Date.now()}_support_issue.webm`;

      // 1. Upload the local WebM chunk
      const { error: uploadError } = await supabase.storage
        .from('bb_support_recordings')
        .upload(fileName, blob, { 
          contentType: 'video/webm',
          cacheControl: '3600',
          upsert: false 
        });

      if (uploadError) throw new Error('Failed to upload recording layer.');

      // 2. Insert the actual Ticket Record mapping the evidence
      await supportTicketsApi.createTicket({
        organization_id: currentOrganization.id,
        title: title || 'Reported Issue (No Title)',
        description,
        category,
        priority: 'medium', // Default
        recording_path: fileName,
        recording_size: sizeBytes
      });

      setSuccess(true);
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Failed to submit issue.');
    } finally {
      setIsSubmitting(false);
      setIsRecording(false);
    }
  };

  const handleStartLiveSession = async () => {
    if (!currentOrganization) return;
    try {
      setIsSubmitting(true);
      setError('');
      
      const stream = await navigator.mediaDevices.getDisplayMedia({
        video: { displaySurface: 'browser' },
        audio: false // View-only security constraint
      });
      streamRef.current = stream;

      // Create a tracking ticket
      const ticket = await supportTicketsApi.createTicket({
        organization_id: currentOrganization.id,
        title: 'Live Screen Assist Request',
        category: 'live_assist',
        priority: 'high'
      });
      liveTicketIdRef.current = ticket.id;

      // Allocate Session String
      const { session_code } = await supportTicketsApi.requestLiveSession(ticket.id);
      setSessionCode(session_code);

      // Bind WebRTC Channel
      const protocol = new SupportSessionProtocol(session_code, 'tenant');
      sessionProtocolRef.current = protocol;
      
      protocol.onConnectionStateChange = (state) => {
        setConnectionState(state);
      };

      await protocol.initialize(stream);
      
      stream.getVideoTracks()[0].onended = () => {
         resetState(); // Force-kill if user revokes browser share permission
      };

    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Failed to initialize secure peer session.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderContent = () => {
    if (success) {
      return (
        <div className="p-6 text-center">
          <div className="w-16 h-16 bg-emerald-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <Send className="w-8 h-8 text-emerald-400" />
          </div>
          <h3 className="text-xl font-bold text-white mb-2">Issue Submitted!</h3>
          <p className="text-slate-400">Our support team has successfully received your securely encrypted recording.</p>
        </div>
      );
    }

    if (mode === 'menu') {
      return (
        <div className="p-4 space-y-3">
          <div className="text-center mb-6">
            <h3 className="text-xl font-bold text-white">Need Help?</h3>
            <p className="text-sm text-slate-400">Choose how you'd like to get support</p>
          </div>
          
          <button
            onClick={() => setMode('record_issue')}
            className="w-full flex items-center p-4 bg-slate-800/80 hover:bg-slate-700/80 border border-slate-700 rounded-xl transition-all group"
          >
            <div className="w-10 h-10 rounded-full bg-blue-500/20 flex items-center justify-center mr-4 group-hover:bg-blue-500/30 transition-colors">
              <Video className="w-5 h-5 text-blue-400" />
            </div>
            <div className="text-left">
              <div className="text-white font-medium">Record an Issue</div>
              <div className="text-slate-400 text-xs">Capture a quick 5-min bug report video</div>
            </div>
          </button>

          <button
            onClick={() => setMode('live_assist')}
            className="w-full flex items-center p-4 bg-slate-800/80 hover:bg-slate-700/80 border border-slate-700 rounded-xl transition-all group"
          >
            <div className="w-10 h-10 rounded-full bg-emerald-500/20 flex items-center justify-center mr-4 group-hover:bg-emerald-500/30 transition-colors">
              <Monitor className="w-5 h-5 text-emerald-400" />
            </div>
            <div className="text-left">
              <div className="text-white font-medium">Live Screen Assist</div>
              <div className="text-slate-400 text-xs">Generate a temporary View-Only session code</div>
            </div>
          </button>
        </div>
      );
    }

    if (mode === 'record_issue') {
      return (
        <div className="p-4 flex flex-col h-full">
          <div className="flex items-center space-x-3 mb-6">
            <button onClick={() => resetState()} className="text-slate-400 hover:text-white transition-colors">
              ← Back
            </button>
            <h3 className="text-lg font-bold text-white flex-1 text-center pr-8">Record Issue</h3>
          </div>

          <div className="space-y-4 flex-1">
            <div>
              <label className="block text-sm font-medium text-slate-400 mb-1">Issue Title</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Cannot save my updated profile"
                disabled={isRecording || isSubmitting}
                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-2 text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-400 mb-1">Category</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                disabled={isRecording || isSubmitting}
                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-blue-500"
              >
                <option value="bug">Bug Report</option>
                <option value="billing">Billing Problem</option>
                <option value="workflow">Workflow Question</option>
                <option value="feature_request">Feature Request</option>
                <option value="other">Other</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-400 mb-1">Description (Optional)</label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Any additional context?"
                disabled={isRecording || isSubmitting}
                rows={3}
                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-2 text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 resize-none"
              />
            </div>

            {error && (
              <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 text-sm">
                {error}
              </div>
            )}
          </div>

          <div className="pt-4 mt-auto">
            {isRecording ? (
              <button
                onClick={handleStopRecording}
                disabled={isSubmitting}
                className="w-full py-3 bg-red-500 hover:bg-red-600 text-white rounded-lg font-medium transition-colors flex items-center justify-center space-x-2"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    <span>Uploading Evidence...</span>
                  </>
                ) : (
                  <>
                    <div className="w-3 h-3 bg-white rounded-sm" />
                    <span>Stop Recording & Submit</span>
                  </>
                )}
              </button>
            ) : (
              <button
                onClick={handleStartRecording}
                disabled={!title.trim() || isSubmitting}
                className={`w-full py-3 rounded-lg font-medium transition-colors flex items-center justify-center space-x-2 ${
                  !title.trim() ? 'bg-slate-800 text-slate-500 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700 text-white'
                }`}
              >
                <Video className="w-5 h-5" />
                <span>Start Browser Recording</span>
              </button>
            )}
            
            {isRecording && !isSubmitting && (
              <p className="text-center text-xs text-slate-500 mt-3 animate-pulse">
                Recording in progress... Limit 5 minutes.
              </p>
            )}
          </div>
        </div>
      );
    }

    if (mode === 'live_assist') {
      return (
        <div className="p-4 flex flex-col h-full items-center justify-center text-center">
          {sessionCode ? (
            <div className="w-full flex flex-col items-center">
               <div className="w-16 h-16 rounded-full bg-emerald-500/20 flex items-center justify-center mb-4">
                  <Shield className="w-8 h-8 text-emerald-400" />
               </div>
               <h3 className="text-2xl font-bold text-white mb-2 tracking-wider">{sessionCode}</h3>
               <p className="text-slate-400 text-sm mb-6 max-w-[250px]">
                 Share this ephemeral 6-digit code with the Super Admin to grant view-only access.
               </p>

               <div className="bg-slate-800/80 border border-slate-700 w-full p-4 rounded-xl mb-6 flex flex-col items-center">
                  <span className={`px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider ${
                    connectionState === 'connected' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 
                    connectionState === 'connecting' ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30 animate-pulse' : 
                    'bg-slate-700 text-slate-400 border border-slate-600'
                  }`}>
                    {connectionState === 'disconnected' ? 'Waiting for Admin...' : connectionState}
                  </span>
                  
                  {connectionState === 'connected' && (
                    <div className="mt-3 text-emerald-400 text-xs font-medium flex items-center space-x-2">
                       <Wifi className="w-4 h-4" />
                       <span>You are actively sharing your screen</span>
                    </div>
                  )}
               </div>

               <button 
                 onClick={() => resetState()} 
                 className="w-full py-3 bg-red-500 hover:bg-red-600 text-white rounded-lg font-medium transition-colors"
               >
                 Revoke & Stop Sharing
               </button>
            </div>
          ) : (
            <>
              <Monitor className="w-12 h-12 text-slate-500 mb-4" />
              <h3 className="text-xl font-bold text-white mb-2">Live Screen Assist</h3>
              <p className="text-slate-400 text-sm mb-6 px-4">
                Securely stream your active browser tab to the Super Admin via an end-to-end encrypted peer connection. No permanent recordings are stored.
              </p>
              
              {error && (
                <div className="w-full p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 text-sm mb-4">
                  {error}
                </div>
              )}

              <button 
                onClick={handleStartLiveSession} 
                disabled={isSubmitting}
                className="w-full py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-lg font-medium transition-colors flex items-center justify-center space-x-2"
              >
                {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin" /> : <Wifi className="w-5 h-5" />}
                <span>Generate Session Code</span>
              </button>

              <button onClick={() => setMode('menu')} className="mt-6 text-sm text-slate-400 hover:text-white transition-colors" disabled={isSubmitting}>
                Cancel
              </button>
            </>
          )}
        </div>
      );
    }
  };

  // Only render if within an active tenant organization context (safety guard)
  if (!currentOrganization) return null;

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 w-14 h-14 bg-blue-600 hover:bg-blue-500 text-white rounded-full shadow-[0_0_25px_rgba(37,99,235,0.3)] flex items-center justify-center z-50 transition-all hover:scale-105 active:scale-95"
      >
        <HelpCircle className="w-6 h-6" />
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="fixed bottom-24 right-6 w-[380px] min-h-[450px] bg-slate-900/95 backdrop-blur-xl border border-slate-700 rounded-2xl shadow-2xl z-50 overflow-hidden flex flex-col"
          >
            {/* Header */}
            <div className="h-14 border-b border-slate-800 flex items-center justify-between px-4 bg-slate-900">
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-sm font-medium text-slate-300">Support Center</span>
              </div>
              <button
                onClick={() => {
                  if (sessionCode || isRecording) {
                    resetState();
                  }
                  setIsOpen(false);
                }}
                className="p-1 hover:bg-slate-800 rounded-md text-slate-400 hover:text-white transition-colors"
                disabled={isSubmitting}
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Dynamic Content Body */}
            <div className="flex-1 overflow-y-auto w-full">
              {renderContent()}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
