import { useEffect, useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import {
  Send,
  Plus,
  MessageSquare,
  Sparkles,
  Lightbulb,
  Archive,
  Brain,
  Zap,
  Mic,
  StopCircle
} from 'lucide-react';
import AppHeader from '../../components/app/AppHeader';
import Card from '../../components/Card';
import Button from '../../components/Button';
import LoadingSpinner from '../../components/LoadingSpinner';
import EmptyState from '../../components/EmptyState';
import ChatMessage from '../../components/copilot/ChatMessage';
import SuggestionCard from '../../components/copilot/SuggestionCard';
import { InsightList } from '../../components/ai/InsightCard';
import {
  copilotService,
  CONTEXT_TYPE_LABELS,
  type CopilotConversation,
  type CopilotMessage,
  type CopilotSuggestion,
  type ContextType,
} from '../../lib/db/copilot';
import { aiDecisionEngine, type AIInsight } from '../../lib/aiDecisionEngine';
import { actionReviewer } from '../../lib/agents';
import { globalTasksService } from '../../lib/db/globalTasks';
import { projectsService } from '../../lib/db/projects';
import { toast } from 'react-hot-toast';
import type { AgentAction } from '../../lib/agents/types';
import { useAuth } from '../../contexts/AuthContext';
import { useCopilotContext } from '../../contexts/CopilotContext';
import { copilotEngine } from '../../lib/ai/services/copilotEngine';
import { supabase } from '../../supabase';

export default function Copilot() {
  const { user, currentOrganization } = useAuth();
  const { domContext } = useCopilotContext();
  const [conversations, setConversations] = useState<CopilotConversation[]>([]);
  const [currentConversation, setCurrentConversation] = useState<CopilotConversation | null>(null);
  const [messages, setMessages] = useState<CopilotMessage[]>([]);
  const [suggestions, setSuggestions] = useState<CopilotSuggestion[]>([]);
  const [aiInsights, setAiInsights] = useState<AIInsight[]>([]);
  const [pendingActions, setPendingActions] = useState<AgentAction[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [selectedContext, setSelectedContext] = useState<ContextType>('general');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [showInsights, setShowInsights] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Voice Recording State
  const [isRecording, setIsRecording] = useState(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

  const toggleRecording = async () => {
    if (isRecording) {
      mediaRecorderRef.current?.stop();
      setIsRecording(false);
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream, { mimeType: 'audio/webm' });
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        const reader = new FileReader();
        reader.readAsDataURL(audioBlob);
        reader.onloadend = async () => {
          const base64Audio = reader.result as string;
          const toastId = toast.loading("Transcribing Voice Audio intelligently via Edge...");
          
          try {
             const { data, error } = await supabase.functions.invoke('transcribe-audio', {
                body: { audio_base64: base64Audio }
             });
             
             if (error) throw new Error(error.message);
             if (data?.text) {
                toast.success("Transcription accurate!", { id: toastId });
                setInputValue(prev => (prev + " " + data.text).trim());
             } else {
                toast.error("Audio undecipherable natively.", { id: toastId });
             }
          } catch (e: any) {
             toast.error(`Whisper Failed: ${e.message}`, { id: toastId });
          }
        };
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);
    } catch (err) {
      toast.error("Microphone access logically restricted natively.");
      console.error(err);
    }
  };

  useEffect(() => {
    (window as any).executeCopilotTool = async (name: string, args: any) => {
      if (!user || !currentOrganization?.id) {
         toast.error("Missing contextual authorization limits.");
         return;
      }
      try {
        if (name === 'create_global_task') {
            await globalTasksService.createTask({
               tenant_id: currentOrganization.id,
               title: args.title,
               description: args.description,
               priority: args.priority,
               status: 'todo',
               assignee_id: user.id
            });
            toast.success("Action Executed Successfully: Task Created");
        } else if (name === 'update_project_target_date') {
            await projectsService.updateProject(args.project_id, {
               target_launch_date: args.new_target_date
            });
            toast.success("Action Executed Successfully: Project Date Adjusted");
        } else if (name === 'draft_autonomous_email') {
            const toastId = toast.loading("Formulating unblocking email natively via Deno Edge Nodes...");
            const { data, error } = await supabase.functions.invoke('autonomous-outreach', {
               body: { task_id: args.task_id, context_data: args }
            });
            if (error || !data?.draft) throw new Error(error?.message || "Incomplete Edge payload returned.");
            toast.success("Draft Generated!", { id: toastId });
            
            // Pop native mailto
            const { subject, body } = data.draft;
            const link = `mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
            window.location.href = link;
        }

        // Automatic re-prompt loop for natural conversational continuity
        setTimeout(() => {
            const authPrompt = `I have successfully authorized and executed the action: ${name}. Please refresh your context and verify.`;
            setInputValue(authPrompt);
        }, 500);

      } catch(e: any) {
        toast.error(`Execution Fault: ${e.message}`);
      }
    };

    return () => {
      delete (window as any).executeCopilotTool;
    };
  }, [user, currentOrganization]);

  useEffect(() => {
    if (user) {
      loadData();
    }
  }, [user]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const loadData = async () => {
    if (!user || !currentOrganization?.id) return;

    try {
      setLoading(true);
      const [convos, suggs, insights, actionsData] = await Promise.all([
        copilotService.getConversations(user.id),
        copilotService.getSuggestions(user.id, { status: 'pending' }),
        aiDecisionEngine.getDashboardInsights(currentOrganization.id, 10),
        actionReviewer.getPendingReviewActions(currentOrganization.id),
      ]);
      setConversations(convos);
      setSuggestions(suggs);
      setAiInsights(insights);
      setPendingActions(actionsData.actions || []);

      if (convos.length > 0) {
        await selectConversation(convos[0]);
      }
    } catch (error) {
      console.error('Failed to load copilot data:', error);
    } finally {
      setLoading(false);
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const selectConversation = async (conversation: CopilotConversation) => {
    setCurrentConversation(conversation);
    setSelectedContext(conversation.context_type);

    try {
      const msgs = await copilotService.getMessages(conversation.id);
      setMessages(msgs);
    } catch (error) {
      console.error('Failed to load messages:', error);
    }
  };

  const startNewConversation = async () => {
    if (!user) return;

    try {
      const newConvo = await copilotService.createConversation(
        user.id,
        currentOrganization?.id || null,
        selectedContext
      );
      setConversations([newConvo, ...conversations]);
      setCurrentConversation(newConvo);
      setMessages([]);
    } catch (error) {
      console.error('Failed to create conversation:', error);
    }
  };

  const sendMessage = async () => {
    if (!inputValue.trim() || !user || sending) return;

    try {
      setSending(true);

      let convo = currentConversation;
      if (!convo) {
        convo = await copilotService.createConversation(user.id, currentOrganization?.id || null, selectedContext);
        setCurrentConversation(convo);
        setConversations([convo, ...conversations]);
      }

      const userMessage = await copilotService.createMessage(
        convo.id,
        'user',
        inputValue.trim()
      );
      setMessages([...messages, userMessage]);
      setInputValue('');

      const response = await copilotEngine.generateReasonedResponse(
        inputValue.trim(),
        {
          role: (user as any).role || 'manager',
          organizationId: currentOrganization?.id || null,
          userId: user.id
        },
        domContext
      );

      const assistantMessage = await copilotService.createMessage(
        convo.id,
        'assistant',
        response.text,
        { 
          provenance: response.provenance,
          execution_time_ms: response.execution_time_ms 
        }
      );
      setMessages((prev) => [...prev, assistantMessage]);

      const allMessages = await copilotService.getMessages(convo.id);
      const title = await copilotService.generateConversationTitle(allMessages);
      await copilotService.updateConversation(convo.id, { title });

      const updatedConvo = await copilotService.getConversationById(convo.id);
      if (updatedConvo) {
        setCurrentConversation(updatedConvo);
        setConversations((prev) =>
          prev.map((c) => (c.id === updatedConvo.id ? updatedConvo : c))
        );
      }
    } catch (error) {
      console.error('Failed to send message:', error);
    } finally {
      setSending(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const handleAcceptSuggestion = async (id: string) => {
    try {
      await copilotService.updateSuggestionStatus(id, 'accepted');
      setSuggestions(suggestions.filter((s) => s.id !== id));
    } catch (error) {
      console.error('Failed to accept suggestion:', error);
    }
  };

  const handleDismissSuggestion = async (id: string) => {
    try {
      await copilotService.updateSuggestionStatus(id, 'dismissed');
      setSuggestions(suggestions.filter((s) => s.id !== id));
    } catch (error) {
      console.error('Failed to dismiss suggestion:', error);
    }
  };

  const archiveConversation = async (id: string) => {
    try {
      await copilotService.archiveConversation(id);
      setConversations(conversations.filter((c) => c.id !== id));
      if (currentConversation?.id === id) {
        setCurrentConversation(null);
        setMessages([]);
      }
    } catch (error) {
      console.error('Failed to archive conversation:', error);
    }
  };

  if (loading) {
    return (
      <>
        <AppHeader title="AI Copilot" />
        <div className="flex items-center justify-center h-96">
          <LoadingSpinner size="lg" />
        </div>
      </>
    );
  }

  return (
    <>
      <AppHeader title="AI Copilot" />

      <div className="h-[calc(100vh-5rem)] flex gap-6 p-8">
        <div className="w-80 flex flex-col gap-4">
          <Button variant="primary" onClick={startNewConversation} className="w-full">
            <Plus className="w-5 h-5" />
            New Conversation
          </Button>

          <Card className="flex-1 overflow-hidden flex flex-col">
            <div className="flex items-center gap-2 mb-4 pb-4 border-b border-white/10">
              <MessageSquare className="w-5 h-5 text-blue-400" />
              <h3 className="font-semibold text-white">Conversations</h3>
            </div>

            <div className="flex-1 overflow-y-auto space-y-2">
              {conversations.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-sm text-slate-400">No conversations yet</p>
                </div>
              ) : (
                conversations.map((convo) => (
                  <motion.button
                    key={convo.id}
                    whileHover={{ x: 4 }}
                    onClick={() => selectConversation(convo)}
                    className={`w-full text-left p-3 rounded-lg transition-colors group ${
                      currentConversation?.id === convo.id
                        ? 'bg-blue-500/20 border border-blue-500/50'
                        : 'bg-white/5 border border-white/10 hover:border-white/20'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-white truncate mb-1">
                          {convo.title}
                        </p>
                        <p className="text-xs text-slate-400">
                          {CONTEXT_TYPE_LABELS[convo.context_type]}
                        </p>
                      </div>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          archiveConversation(convo.id);
                        }}
                        className="opacity-0 group-hover:opacity-100 p-1 hover:bg-white/10 rounded transition-opacity"
                      >
                        <Archive className="w-4 h-4 text-slate-400" />
                      </button>
                    </div>
                  </motion.button>
                ))
              )}
            </div>
          </Card>

          {suggestions.length > 0 && (
            <Card>
              <div className="flex items-center gap-2 mb-4">
                <Lightbulb className="w-5 h-5 text-amber-400" />
                <h3 className="font-semibold text-white">Suggestions</h3>
                <span className="ml-auto px-2 py-0.5 bg-amber-500/20 text-amber-400 text-xs rounded-full">
                  {suggestions.length}
                </span>
              </div>

              <div className="space-y-3 max-h-64 overflow-y-auto">
                {suggestions.slice(0, 3).map((suggestion) => (
                  <SuggestionCard
                    key={suggestion.id}
                    suggestion={suggestion}
                    onAccept={handleAcceptSuggestion}
                    onDismiss={handleDismissSuggestion}
                  />
                ))}
              </div>
            </Card>
          )}

          {pendingActions.length > 0 && (
            <Card>
              <div className="flex items-center gap-2 mb-4">
                <Zap className="w-5 h-5 text-purple-400" />
                <h3 className="font-semibold text-white">Pending Actions</h3>
                <span className="ml-auto px-2 py-0.5 bg-purple-500/20 text-purple-400 text-xs rounded-full">
                  {pendingActions.length}
                </span>
              </div>

              <div className="space-y-3 max-h-96 overflow-y-auto">
                {pendingActions.slice(0, 3).map((action) => (
                  <div key={action.id} className="p-3 bg-white/5 rounded-lg border border-white/10">
                    <p className="text-sm font-medium text-white mb-1">{action.title}</p>
                    <p className="text-xs text-slate-400 mb-2">{action.description}</p>
                    <div className="flex items-center gap-2">
                      <span className={`px-2 py-0.5 rounded text-xs ${
                        action.priority === 'high' ? 'bg-red-500/20 text-red-400' :
                        action.priority === 'medium' ? 'bg-amber-500/20 text-amber-400' :
                        'bg-gray-500/20 text-gray-400'
                      }`}>
                        {action.priority}
                      </span>
                      <span className="text-xs text-slate-500">
                        {action.confidence_score}% confident
                      </span>
                    </div>
                  </div>
                ))}
              </div>

              {pendingActions.length > 3 && (
                <Link
                  to="/app/agent-actions"
                  className="block mt-3 text-xs text-center text-purple-400 hover:text-purple-300"
                >
                  View all {pendingActions.length} actions →
                </Link>
              )}
            </Card>
          )}

          {aiInsights.length > 0 && (
            <Card>
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <Brain className="w-5 h-5 text-blue-400" />
                  <h3 className="font-semibold text-white">AI Insights</h3>
                  <span className="ml-2 px-2 py-0.5 bg-blue-500/20 text-blue-400 text-xs rounded-full">
                    {aiInsights.length}
                  </span>
                </div>
                <button
                  onClick={() => setShowInsights(!showInsights)}
                  className="text-xs text-blue-400 hover:text-blue-300"
                >
                  {showInsights ? 'Hide' : 'Show'}
                </button>
              </div>

              {showInsights && (
                <div className="space-y-3 max-h-96 overflow-y-auto">
                  <InsightList insights={aiInsights.slice(0, 5)} compact={true} />
                </div>
              )}
            </Card>
          )}
        </div>

        <Card className="flex-1 flex flex-col overflow-hidden">
          {!currentConversation ? (
            <div className="flex-1 flex items-center justify-center">
              <EmptyState
                icon={Sparkles}
                title="Welcome to Bridgebox AI Copilot"
                description="Start a new conversation or select an existing one to get intelligent assistance with your business operations."
              />
            </div>
          ) : (
            <>
              <div className="flex items-center justify-between mb-4 pb-4 border-b border-white/10">
                <div>
                  <h3 className="font-semibold text-white mb-1">{currentConversation.title}</h3>
                  <p className="text-sm text-slate-400">
                    {CONTEXT_TYPE_LABELS[currentConversation.context_type]}
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <select
                    value={selectedContext}
                    onChange={(e) => setSelectedContext(e.target.value as ContextType)}
                    className="px-3 py-1.5 bg-white/5 border border-white/10 rounded-lg text-sm text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    {Object.entries(CONTEXT_TYPE_LABELS).map(([value, label]) => (
                      <option key={value} value={value}>
                        {label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="flex-1 overflow-y-auto space-y-4 mb-4">
                {messages.length === 0 ? (
                  <div className="flex items-center justify-center h-full">
                    <div className="text-center">
                      <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Sparkles className="w-8 h-8 text-white" />
                      </div>
                      <h3 className="text-lg font-semibold text-white mb-2">
                        How can I help you today?
                      </h3>
                      <p className="text-sm text-slate-400">
                        Ask me about leads, projects, support tickets, or anything else!
                      </p>

                      {domContext.activeModule && (
                        <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
                          <button
                            onClick={() => setInputValue(`Explain the layout, capabilities, and data meaning of the page I am currently looking at.`)}
                            className="text-xs px-4 py-2 bg-purple-500/10 text-purple-400 border border-purple-500/20 rounded-full hover:bg-purple-500/20 transition-colors"
                          >
                            Explain this page
                          </button>
                          {domContext.activeRecordId && (
                            <button
                              onClick={() => setInputValue(`Analyze the record I currently have open and extract its key meaning or next risk steps.`)}
                              className="text-xs px-4 py-2 bg-blue-500/10 text-blue-400 border border-blue-500/20 rounded-full hover:bg-blue-500/20 transition-colors"
                            >
                              Analyze attached record
                            </button>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                ) : (
                  <>
                    {messages.map((message) => (
                      <ChatMessage key={message.id} message={message} />
                    ))}
                    {sending && (
                      <div className="flex gap-3">
                        <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                          <LoadingSpinner size="sm" />
                        </div>
                        <div className="flex-1">
                          <div className="px-4 py-3 bg-white/5 border border-white/10 rounded-2xl rounded-tl-sm">
                            <p className="text-sm text-slate-400 italic">Thinking...</p>
                          </div>
                        </div>
                      </div>
                    )}
                    <div ref={messagesEndRef} />
                  </>
                )}
              </div>

              <div className="flex gap-3">
                <input
                  type="text"
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Ask me anything..."
                  disabled={sending}
                  className="flex-1 px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
                />
                <Button
                  variant={isRecording ? "primary" : "secondary"}
                  onClick={toggleRecording}
                  disabled={sending}
                  className={isRecording ? "animate-pulse bg-red-500 hover:bg-red-600 outline-red-500 overflow-hidden text-white" : ""}
                >
                  {isRecording ? <StopCircle className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
                </Button>
                <Button
                  variant="primary"
                  onClick={sendMessage}
                  disabled={!inputValue.trim() || sending}
                >
                  <Send className="w-5 h-5" />
                </Button>
              </div>
            </>
          )}
        </Card>
      </div>
    </>
  );
}
