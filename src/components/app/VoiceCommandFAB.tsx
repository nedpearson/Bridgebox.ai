import { useState, useRef, useEffect } from 'react';
import { Mic, Loader2, Target, CheckCircle, XCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { aiService } from '../../lib/ai/services/aiService';
import { useAuth } from '../../contexts/AuthContext';
import { globalTasksService } from '../../lib/db/globalTasks';
import { projectsService } from '../../lib/db/projects';
import Card from '../Card';

export default function VoiceCommandFAB() {
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [showModal, setShowModal] = useState(false);
  const { currentOrganization } = useAuth();
  
  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    // Initialize SpeechRecognition if natively available
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRecognition) {
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = true;
      recognitionRef.current.interimResults = true;
      recognitionRef.current.lang = 'en-US';

      recognitionRef.current.onresult = (event: any) => {
        let finalTranscript = '';
        const currentResultIndex = event.resultIndex;
        // Merge chunks
        for (let i = currentResultIndex; i < event.results.length; i++) {
          finalTranscript += event.results[i][0].transcript;
        }
        setTranscript((prev) => prev ? prev + ' ' + finalTranscript.trim() : finalTranscript.trim());
      };

      recognitionRef.current.onerror = (event: any) => {
        console.error('Speech recognition error', event.error);
        setError('Microphone error: ' + event.error);
        stopRecording();
      };
    }
    
    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    };
  }, []);

  const startRecording = () => {
    if (!recognitionRef.current) {
      setError('Native Voice Recognition is not supported by your browser.');
      setShowModal(true);
      return;
    }
    setError('');
    setSuccessMsg('');
    setTranscript('');
    setIsRecording(true);
    setShowModal(true);
    try {
      recognitionRef.current.start();
    } catch (e: any) {
      console.warn('Speech Engine Restart Fault:', e);
    }
  };

  const stopRecording = async () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }
    setIsRecording(false);
    
    if (!transcript.trim()) {
      setTimeout(() => setShowModal(false), 2000);
      return;
    }
    
    await processVoiceCommand();
  };

  const processVoiceCommand = async () => {
    setIsProcessing(true);
    try {
      const response = await aiService.processVoiceCommand(transcript);
      if (response.success && response.data) {
        let executionSummary = '';
        const { projects, tasks } = response.data;
        
        // Execute Projects
        if (projects && projects.length > 0 && currentOrganization) {
          for (const proj of projects) {
            await projectsService.createProject({
              name: proj.name,
              description: proj.description,
              organization_id: currentOrganization.id,
              status: 'planning',
              type: 'custom_software'
            });
          }
          executionSummary += `Created ${projects.length} Project(s). `;
        }
        
        // Execute Tasks
        if (tasks && tasks.length > 0 && currentOrganization) {
          for (const tsk of tasks) {
            await globalTasksService.createTask({
              title: tsk.title,
              description: tsk.description,
              tenant_id: currentOrganization.id,
              priority: tsk.priority || 'medium',
              status: 'todo'
            });
          }
          executionSummary += `Created ${tasks.length} Task(s). `;
        }
        
        setSuccessMsg(executionSummary || 'Processed audio but found no actionable items.');
      } else {
        throw new Error(response.error?.message || 'Failed to parse dictates.');
      }
    } catch (err: any) {
      setError(err.message || 'Error processing command');
    } finally {
      setIsProcessing(false);
      setTimeout(() => {
        setShowModal(false);
        setSuccessMsg('');
        setTranscript('');
      }, 4000);
    }
  };

  return (
    <>
      <button
        onClick={isRecording ? stopRecording : startRecording}
        className={`fixed bottom-[5.5rem] right-6 z-40 p-4 rounded-full shadow-2xl shadow-indigo-500/30 transition-all hover:scale-105 group border ${
          isRecording 
            ? 'bg-red-500 border-red-400 animate-pulse' 
            : 'bg-gradient-to-r from-indigo-500 to-purple-500 border-indigo-400'
        }`}
      >
        <Mic className={`w-6 h-6 text-white ${isRecording ? 'animate-bounce' : ''}`} />
      </button>

      <AnimatePresence>
        {showModal && (
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 50, scale: 0.9 }}
            className="fixed bottom-[10.5rem] right-6 z-50 w-80 max-w-[calc(100vw-3rem)]"
          >
            <Card glass className="p-4 shadow-2xl border-indigo-500/30">
              <div className="flex items-center gap-3 mb-3 border-b border-slate-700/50 pb-3">
                <Target className="w-5 h-5 text-indigo-400" />
                <h3 className="text-sm font-semibold text-white">Voice Command Agent</h3>
              </div>
              
              <div className="min-h-[60px] max-h-40 overflow-y-auto mb-3">
                {isRecording && !transcript && (
                  <p className="text-sm text-slate-400 animate-pulse italic">Listening closely...</p>
                )}
                {transcript && (
                  <p className="text-sm text-slate-200 leading-relaxed">"{transcript}"</p>
                )}
                {isProcessing && (
                  <div className="flex items-center gap-2 text-indigo-400 text-sm mt-3">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Executing commands...
                  </div>
                )}
              </div>

              {error && (
                <div className="flex items-start gap-2 text-red-400 bg-red-500/10 p-2 rounded text-xs mt-2">
                  <XCircle className="w-4 h-4 shrink-0" />
                  <p>{error}</p>
                </div>
              )}

              {successMsg && (
                <div className="flex items-start gap-2 text-emerald-400 bg-emerald-500/10 p-2 rounded text-xs mt-2">
                  <CheckCircle className="w-4 h-4 shrink-0" />
                  <p>{successMsg}</p>
                </div>
              )}
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
