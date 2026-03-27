import { motion } from 'framer-motion';
import { Bot, User, Zap } from 'lucide-react';
import type { CopilotMessage } from '../../lib/db/copilot';
import { useCopilotContext } from '../../contexts/CopilotContext';

interface ChatMessageProps {
  message: CopilotMessage;
}

export default function ChatMessage({ message }: ChatMessageProps) {
  const isUser = message.role === 'user';
  const isSystem = message.role === 'system';
  const { executeAction, actionHandlers } = useCopilotContext();

  const renderContentWithActions = (content: string) => {
    // Regex matches [Action:action_id|Button Label]
    const parts = content.split(/(\[Action:[^|]+\|[^\]]+\])/g);

    return parts.map((part, i) => {
      const match = part.match(/\[Action:([^|]+)\|([^\]]+)\]/);
      if (match) {
        const actionId = match[1];
        const label = match[2];
        const canExecute = !!actionHandlers[actionId];

        return (
          <button
            key={i}
            onClick={() => executeAction(actionId)}
            disabled={!canExecute}
            className={`mt-2 mb-2 w-full text-left px-4 py-2 rounded-lg border transition-all flex items-center gap-2 ${
              canExecute 
                ? 'bg-purple-500/10 border-purple-500/30 text-purple-400 hover:bg-purple-500/20' 
                : 'bg-slate-800/50 border-slate-700/50 text-slate-500 cursor-not-allowed hidden'
            }`}
          >
            <Zap className="w-4 h-4" />
            <span className="font-medium text-sm">{label}</span>
          </button>
        );
      }
      return <span key={i}>{part}</span>;
    });
  };

  const renderToolCalls = () => {
    if (!message.metadata?.tool_calls || !Array.isArray(message.metadata.tool_calls)) return null;

    return message.metadata.tool_calls.map((tool: any, idx: number) => {
      if (tool.type !== 'function') return null;
      
      let params = tool.function.arguments;
      // eslint-disable-next-line no-empty
      try { params = typeof params === 'string' ? JSON.parse(params) : params; } catch (e) {}
      
      return (
        <div key={idx} className="mt-3 p-3 bg-slate-900 border border-purple-500/30 rounded-lg">
          <div className="flex items-center gap-2 mb-2 text-purple-400">
            <Zap className="w-4 h-4" />
            <span className="font-semibold text-sm">Action Proposed: {tool.function.name}</span>
          </div>
          <div className="bg-black/50 p-2 rounded text-xs font-mono text-slate-300 overflow-x-auto mb-3">
            {JSON.stringify(params, null, 2)}
          </div>
          <div className="flex gap-2">
            <button 
              onClick={() => {
                if ((window as any).executeCopilotTool) {
                   (window as any).executeCopilotTool(tool.function.name, params);
                } else {
                   alert('Tool executor is currently initializing.');
                }
              }}
              className="flex-1 py-1.5 bg-purple-500 text-white rounded text-xs font-semibold hover:bg-purple-600 transition"
            >
              Approve & Execute
            </button>
            <button className="flex-1 py-1.5 bg-slate-800 text-slate-300 rounded text-xs font-semibold hover:bg-slate-700 transition">
              Reject
            </button>
          </div>
        </div>
      );
    });
  };

  if (isSystem) {
    return (
      <div className="flex justify-center py-2">
        <span className="text-xs text-slate-500 italic">{message.content}</span>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={`flex gap-3 ${isUser ? 'flex-row-reverse' : 'flex-row'}`}
    >
      <div
        className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
          isUser ? 'bg-blue-500' : 'bg-gradient-to-br from-purple-500 to-pink-500'
        }`}
      >
        {isUser ? <User className="w-4 h-4 text-white" /> : <Bot className="w-4 h-4 text-white" />}
      </div>

      <div
        className={`flex-1 max-w-[80%] ${
          isUser ? 'flex flex-col items-end' : 'flex flex-col items-start'
        }`}
      >
        <div
          className={`px-4 py-3 rounded-2xl ${
            isUser
              ? 'bg-blue-500 text-white rounded-tr-sm'
              : 'bg-white/5 border border-white/10 text-slate-200 rounded-tl-sm'
          }`}
        >
          <div className="text-sm leading-relaxed whitespace-pre-wrap">
            {renderContentWithActions(message.content)}
          </div>
        </div>

        <span className="text-xs text-slate-500 mt-1 px-2">
          {new Date(message.created_at).toLocaleTimeString('en-US', {
            hour: 'numeric',
            minute: '2-digit',
          })}
        </span>

        {!isUser && message.metadata?.provenance && message.metadata.provenance.length > 0 && (
          <div className="mt-2 ml-2 flex flex-wrap gap-1">
            <span className="text-[10px] text-slate-500 flex items-center mr-1">
              Grounded in:
            </span>
            {message.metadata.provenance.map((node: any) => (
              <span 
                key={node.id} 
                className="text-[10px] bg-slate-800 border border-slate-700 text-slate-400 px-1.5 py-0.5 rounded cursor-help"
                title={node.description}
              >
                {node.name}
              </span>
            ))}
          </div>
        )}
      </div>
    </motion.div>
  );
}
