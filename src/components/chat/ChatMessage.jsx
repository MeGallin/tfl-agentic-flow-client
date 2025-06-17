import { format } from 'date-fns';
import { User, Bot, Clock, AlertTriangle } from 'lucide-react';
import { useTFL } from '../../contexts/TFLContext';

// Utility function to strip any HTML tags and render clean markdown
const stripHtmlTags = (str) => {
  return str.replace(/<[^>]*>/g, '');
};

// Utility function to render markdown-like formatting
const renderFormattedContent = (content, lineColor) => {
  if (!content || typeof content !== 'string') {
    return <span className="text-red-500">No content available</span>;
  }

  // Strip any HTML tags first for security and cleanliness
  const cleanContent = stripHtmlTags(content);

  // Split content into lines and process each line
  const lines = cleanContent.split('\n');

  return lines.map((line, index) => {
    // Skip empty lines
    if (!line.trim()) {
      return <div key={index} className="h-2" />;
    }

    // Handle headers with **text**
    if (line.includes('**') && line.indexOf('**') !== line.lastIndexOf('**')) {
      const parts = line.split('**');
      return (
        <div key={index} className="mb-2 sm:mb-3">
          {parts.map((part, partIndex) => {
            if (partIndex % 2 === 1) {
              // This is bold text - check if it's a line name for special styling
              const isLineName = part.includes('Line');

              if (isLineName) {
                return (
                  <h3
                    key={partIndex}
                    className="font-bold text-xl sm:text-2xl mb-1 break-words"
                    style={{ color: lineColor?.primary || '#333' }}
                  >
                    {part}
                  </h3>
                );
              }

              return (
                <strong
                  key={partIndex}
                  className="font-semibold text-base sm:text-lg break-words"
                >
                  {part}
                </strong>
              );
            }
            return <span key={partIndex}>{part}</span>;
          })}
        </div>
      );
    }

    // Handle special formatted fields (like "Platform Name:", "Direction:", etc.)
    if (line.includes(':')) {
      const [label, ...valueParts] = line.split(':');
      const value = valueParts.join(':').trim();

      return (
        <div
          key={index}
          className="mb-2 flex flex-col sm:flex-row sm:flex-wrap gap-1"
        >
          <span className="font-semibold text-gray-700 text-sm">{label}:</span>
          <span className="text-gray-900 text-sm break-words">{value}</span>
        </div>
      );
    }

    // Handle bullet points
    if (line.trim().startsWith('- ')) {
      return (
        <div key={index} className="flex items-start gap-2 mb-2 ml-2 sm:ml-4">
          <span
            className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full mt-2 flex-shrink-0"
            style={{ backgroundColor: lineColor?.primary || '#6b7280' }}
          ></span>
          <span className="text-sm leading-relaxed break-words">
            {line.trim().substring(2)}
          </span>
        </div>
      );
    }

    // Handle numbered lists
    if (/^\d+\./.test(line.trim())) {
      return (
        <div key={index} className="mb-2 ml-2 sm:ml-4 flex items-start gap-2">
          <span
            className="font-semibold text-sm flex-shrink-0"
            style={{ color: lineColor?.primary || '#374151' }}
          >
            {line.trim().match(/^\d+\./)[0]}
          </span>
          <span className="text-sm leading-relaxed break-words">
            {line.trim().replace(/^\d+\.\s*/, '')}
          </span>
        </div>
      );
    }

    // Regular paragraphs
    return (
      <p
        key={index}
        className="mb-2 text-sm leading-relaxed text-gray-800 break-words"
      >
        {line}
      </p>
    );
  });
};

export default function ChatMessage({ message }) {
  const { getLineColor, getLineInfo, normalizeAgentName } = useTFL();

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
      const normalizedAgent = normalizeAgentName(agent);
      return `chat-message assistant ${normalizedAgent}`;
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
        <span className="text-base sm:text-lg">{lineInfo.icon}</span>
        <span className="text-xs sm:text-sm font-medium opacity-75 break-words">
          {lineInfo.name} Assistant
        </span>
      </div>
    );
  };

  return (
    <div
      className={`flex gap-2 sm:gap-3 ${
        isUser ? 'justify-end' : 'justify-start'
      }`}
    >
      {!isUser && (
        <div
          className={`
          flex-shrink-0 w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center
          ${agent ? lineColor.bg : 'bg-gray-200'}
          ${agent ? lineColor.text : 'text-gray-600'}
        `}
        >
          {getIcon()}
        </div>
      )}

      <div className={getMessageClasses()}>
        {getAgentInfo()}
        <div className="message-content">
          {renderFormattedContent(message.content, lineColor)}
        </div>
        {/* TFL Data display */}
        {message.tflData && (
          <div className="mt-3 p-2 sm:p-3 bg-gray-50 rounded-lg border">
            <div className="text-xs font-medium text-gray-700 mb-2">
              TFL Data:
            </div>
            <div className="text-xs text-gray-600 space-y-1">
              {message.tflData.line && (
                <div className="break-words">
                  Line: {message.tflData.line.name}
                </div>
              )}
              {message.tflData.status && (
                <div className="break-words">
                  Status: {message.tflData.status[0]?.statusSeverityDescription}
                </div>
              )}
              {message.tflData.lastUpdated && (
                <div className="break-words">
                  Updated:{' '}
                  {new Date(message.tflData.lastUpdated).toLocaleTimeString()}
                </div>
              )}
            </div>
          </div>
        )}
        {/* Timestamp */}
        <div className="flex items-center gap-1 mt-2 text-xs text-gray-500">
          <Clock className="w-3 h-3 flex-shrink-0" />
          <span>{formatTime(message.timestamp)}</span>
        </div>
      </div>

      {isUser && (
        <div className="flex-shrink-0 w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-primary-600 text-white flex items-center justify-center">
          {getIcon()}
        </div>
      )}
    </div>
  );
}
