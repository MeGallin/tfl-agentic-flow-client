import { format } from 'date-fns';
import { User, Bot, Clock, AlertTriangle } from 'lucide-react';
import { useTFL } from '../../contexts/TFLContext';

export default function ChatMessage({ message }) {
  const { getLineColor, getLineInfo } = useTFL();

  // Debug: Log what message object we're receiving
  console.log('ChatMessage received message:', message);
  console.log('Message content:', message.content);
  console.log('Message content type:', typeof message.content);

  const isUser = message.role === 'user';
  const isError = message.isError;
  const agent = message.agent;

  // Get line-specific styling if agent is specified
  const lineColor = agent ? getLineColor(agent) : null;
  const lineInfo = agent ? getLineInfo(agent) : null;

  const formatTime = (timestamp) => {
    try {
      return format(new Date(timestamp), 'HH:mm');
    } catch {
      return '';
    }
  };

  const getMessageClasses = () => {
    if (isUser) {
      return 'chat-message user';
    }

    if (isError) {
      return 'chat-message assistant bg-red-50 border-red-200';
    }

    if (agent) {
      return `chat-message assistant ${agent}`;
    }

    return 'chat-message assistant';
  };

  const getIcon = () => {
    if (isUser) {
      return <User className="w-5 h-5" />;
    }

    if (isError) {
      return <AlertTriangle className="w-5 h-5 text-red-600" />;
    }

    return <Bot className="w-5 h-5" />;
  };

  const getAgentInfo = () => {
    if (!agent || isUser) return null;

    return (
      <div className="flex items-center gap-2 mb-2">
        <span className="text-lg">{lineInfo.icon}</span>
        <span className="text-sm font-medium opacity-75">
          {lineInfo.name} Assistant
        </span>
      </div>
    );
  };

  return (
    <div className={`flex gap-3 ${isUser ? 'justify-end' : 'justify-start'}`}>
      {!isUser && (
        <div
          className={`
          flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center
          ${agent ? lineColor.bg : 'bg-gray-200'}
          ${agent ? lineColor.text : 'text-gray-600'}
        `}
        >
          {getIcon()}
        </div>
      )}

      <div className={getMessageClasses()}>
        {getAgentInfo()}{' '}
        <div className="prose prose-sm max-w-none">
          {/* Debug: Show exactly what we're working with */}
          <div className="bg-blue-50 text-blue-800 p-2 rounded mb-2 text-xs">
            DEBUG: Content type: {typeof message.content} | Content length:{' '}
            {message.content ? message.content.length : 'undefined'} | Content
            preview: "
            {message.content ? message.content.substring(0, 50) : 'UNDEFINED'}
            "...
          </div>

          {/* Main content rendering */}
          {message.content ? (
            <div className="bg-green-50 p-2 rounded">
              {message.content.split('\n').map((line, index) => (
                <p key={index} className="mb-2 last:mb-0">
                  {line}
                </p>
              ))}
            </div>
          ) : (
            <div className="bg-red-50 p-2 rounded">
              <p className="text-red-600">
                ERROR: No content available - message.content is:{' '}
                {String(message.content)}
              </p>
            </div>
          )}
        </div>
        {/* Metadata display - temporarily hidden for debugging */}
        {false && message.metadata && (
          <div className="mt-3 p-3 bg-gray-50 rounded-lg border">
            <div className="text-xs font-medium text-gray-700 mb-2">
              Additional Information:
            </div>
            <pre className="text-xs text-gray-600 whitespace-pre-wrap">
              {JSON.stringify(message.metadata, null, 2)}
            </pre>
          </div>
        )}
        {/* Timestamp */}
        <div className="flex items-center gap-1 mt-2 text-xs text-gray-500">
          <Clock className="w-3 h-3" />
          <span>{formatTime(message.timestamp)}</span>
        </div>
      </div>

      {isUser && (
        <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary-600 text-white flex items-center justify-center">
          {getIcon()}
        </div>
      )}
    </div>
  );
}
