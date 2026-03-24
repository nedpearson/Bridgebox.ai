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
import type { AgentAction } from '../../lib/agents/types';
import { useAuth } from '../../contexts/AuthContext';

export default function Copilot() {
  const { user, currentOrganization } = useAuth();
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
        aiDecisionEngine.getDashboardInsights(10),
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

      const response = await copilotService.generateResponse(
        inputValue.trim(),
        convo.id,
        convo.context_type
      );

      const assistantMessage = await copilotService.createMessage(
        convo.id,
        'assistant',
        response
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
