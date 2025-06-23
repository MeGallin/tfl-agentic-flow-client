import { useEffect, useRef, useState } from 'react';
import { Loader2, ArrowDown, RefreshCw } from 'lucide-react';
import { useConversation } from '../../contexts/ConversationContext';
import ChatMessage from './ChatMessage';
import LineStatusBlock from './LineStatusBlock';
import { tflService } from '../../services/tflService';
import './ChatMessages.css';

export default function ChatMessages() {
  const { messages, isLoading, isTyping, error } = useConversation();
  
  // Debug logging
  console.log('ChatMessages: Current messages:', messages);
  console.log('ChatMessages: isLoading:', isLoading);
  console.log('ChatMessages: isTyping:', isTyping);
  const messagesEndRef = useRef(null);
  const messagesContainerRef = useRef(null);
  const [showScrollButton, setShowScrollButton] = useState(false);
  const [lineStatuses, setLineStatuses] = useState([]);
  const [lastUpdated, setLastUpdated] = useState(null);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // TFL Line configuration data
  const tflLines = [
    { id: 'circle', name: 'Circle', backgroundColor: '#FFD300' },
    { id: 'bakerloo', name: 'Bakerloo', backgroundColor: '#B36305' },
    { id: 'district', name: 'District', backgroundColor: '#00782A' },
    { id: 'central', name: 'Central', backgroundColor: '#E32017' },
    { id: 'northern', name: 'Northern', backgroundColor: '#000000' },
    { id: 'piccadilly', name: 'Piccadilly', backgroundColor: '#003688' },
    { id: 'victoria', name: 'Victoria', backgroundColor: '#0098D4' },
    { id: 'jubilee', name: 'Jubilee', backgroundColor: '#A0A5A9' },
    { id: 'metropolitan', name: 'Metropolitan', backgroundColor: '#9B0056' },
    { id: 'hammersmith-city', name: 'H&C', backgroundColor: '#F3A9BB' },
    { id: 'waterloo-city', name: 'W&C', backgroundColor: '#95CDBA' },
    { id: 'elizabeth', name: 'Elizabeth', backgroundColor: '#7156A5' },
  ];

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({
        behavior: 'smooth',
        block: 'end',
      });
    }
  }, [messages, isTyping]);

  // Track scroll position
  useEffect(() => {
    const container = messagesContainerRef.current;
    if (!container) return;

    const handleScroll = () => {
      const { scrollTop, scrollHeight, clientHeight } = container;
      const isNearBottom = scrollHeight - scrollTop - clientHeight < 100;
      setShowScrollButton(!isNearBottom);
    };

    container.addEventListener('scroll', handleScroll);
    return () => container.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({
      behavior: 'smooth',
      block: 'end',
    });
  };

  const handleQuestionClick = (question) => {
    // Dispatch a custom event that the ChatInput component will listen for
    window.dispatchEvent(
      new CustomEvent('setInputMessage', {
        detail: { message: question },
      }),
    );
  };

  // Fetch TFL status data
  const fetchTflStatus = async () => {
    setIsRefreshing(true);
    try {
      const statuses = await tflService.getTubeStatus();
      setLineStatuses(statuses);
      setLastUpdated(new Date());
    } catch (error) {
      console.error('Failed to fetch TFL status:', error);
    } finally {
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    fetchTflStatus();
  }, []);

  const handleRefresh = () => {
    fetchTflStatus();
  };

  // Helper function to get status for a specific line
  const getLineStatus = (lineId) => {
    const status = lineStatuses.find((line) => line.id === lineId);
    return status?.status || 'Loading...';
  };

  // Helper function to get status styling - Refined and subtle
  const getStatusStyling = (lineId) => {
    const status = lineStatuses.find((line) => line.id === lineId);
    const statusText = status?.status?.toLowerCase() || '';

    if (statusText.includes('good service')) {
      return 'text-white font-normal bg-transparent border border-white/20 shadow-none opacity-70';
    } else if (
      statusText.includes('minor delays') ||
      statusText.includes('minor disruption')
    ) {
      return 'text-white font-medium bg-orange-600 border border-orange-500 shadow-sm';
    } else if (
      statusText.includes('severe delays') ||
      statusText.includes('severe disruption') ||
      statusText.includes('part closure') ||
      statusText.includes('part suspended')
    ) {
      return 'text-white font-medium bg-red-600 border border-red-500 shadow-sm';
    } else if (
      statusText.includes('suspended') ||
      statusText.includes('closed')
    ) {
      return 'text-white font-medium bg-red-700 border border-red-600 shadow-sm';
    } else if (statusText.includes('loading')) {
      return 'text-gray-600 font-normal bg-gray-200 border border-gray-300 animate-pulse';
    }

    return 'text-white font-normal bg-transparent border border-white/20 shadow-none opacity-70';
  };

  // Helper function to determine if card should be pulsating
  const getIsPulsating = (lineId) => {
    const status = lineStatuses.find((line) => line.id === lineId);
    const statusText = status?.status?.toLowerCase() || '';

    // Return true for any status that is NOT "good service"
    return (
      !statusText.includes('good service') && !statusText.includes('loading')
    );
  };

  // Show welcome message if no messages
  if (messages.length === 0 && !isLoading) {
    return (
      <div
        className="flex-1 overflow-y-auto overflow-x-hidden"
        style={{ background: 'rgba(51,51,51,1)' }}
      >
        <div className="min-h-full p-3 sm:p-4 lg:p-6 pb-6 sm:pb-8">
          <div className="max-w-6xl mx-auto">
            {/* Quick Help Section */}
            <div className="mb-6">
              <div
                className="bg-gradient-to-r from-gray-800 to-gray-900 border border-gray-700 p-4 sm:p-6 mb-6 sm:mb-8 shadow-xl"
                style={{
                  background:
                    'linear-gradient(to right, rgba(51,51,51,1), rgba(38,38,38,1))',
                }}
              >
                <div className="text-center mb-4 sm:mb-6">
                  <h3 className="text-lg sm:text-xl font-semibold text-white">
                    Quick Start
                  </h3>
                  <p className="text-gray-300 text-xs mt-2">
                    Try these examples:
                  </p>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5">
                  <button
                    onClick={() =>
                      handleQuestionClick("What's the status of all lines?")
                    }
                    className="bg-gray-700 hover:bg-gray-600 rounded-lg p-4 sm:p-5 text-left font-medium sm:font-semibold text-gray-100 shadow-md hover:shadow-lg transition-all duration-200 hover:-translate-y-0.5 cursor-pointer group border border-gray-600 touch-target mobile-press tap-highlight-none touch-manipulation"
                    aria-label="Ask about the status of all TFL lines"
                    role="button"
                    tabIndex={0}
                  >
                    <div className="flex items-center gap-2">
                      <span className="text-gray-300 group-hover:text-white text-sm sm:text-base">
                        📊
                      </span>
                      <span className="text-base sm:text-lg">
                        "What's the status of all lines?"
                      </span>
                    </div>
                  </button>
                  <button
                    onClick={() =>
                      handleQuestionClick('Next train at Oxford Circus')
                    }
                    className="bg-gray-700 hover:bg-gray-600 rounded-lg p-4 sm:p-5 text-left font-medium sm:font-semibold text-gray-100 shadow-md hover:shadow-lg transition-all duration-200 hover:-translate-y-0.5 cursor-pointer group border border-gray-600 touch-target mobile-press tap-highlight-none touch-manipulation"
                  >
                    <div className="flex items-center gap-2">
                      <span className="text-gray-300 group-hover:text-white text-sm sm:text-base">
                        🚇
                      </span>
                      <span className="text-base sm:text-lg">
                        "Next train at Oxford Circus"
                      </span>
                    </div>
                  </button>
                  <button
                    onClick={() =>
                      handleQuestionClick('Plan route to Heathrow')
                    }
                    className="bg-gray-700 hover:bg-gray-600 rounded-lg p-4 sm:p-5 text-left font-medium sm:font-semibold text-gray-100 shadow-md hover:shadow-lg transition-all duration-200 hover:-translate-y-0.5 cursor-pointer group border border-gray-600 touch-target mobile-press tap-highlight-none touch-manipulation"
                  >
                    <div className="flex items-center gap-2">
                      <span className="text-gray-300 group-hover:text-white text-sm sm:text-base">
                        ✈️
                      </span>
                      <span className="text-base sm:text-lg">
                        "Plan route to Heathrow"
                      </span>
                    </div>
                  </button>
                  <button
                    onClick={() =>
                      handleQuestionClick('Circle line disruptions')
                    }
                    className="bg-gray-700 hover:bg-gray-600 rounded-lg p-4 sm:p-5 text-left font-medium sm:font-semibold text-gray-100 shadow-md hover:shadow-lg transition-all duration-200 hover:-translate-y-0.5 cursor-pointer group border border-gray-600 touch-target mobile-press tap-highlight-none touch-manipulation"
                  >
                    <div className="flex items-center gap-2">
                      <span className="text-gray-300 group-hover:text-white text-sm sm:text-base">
                        ⚠️
                      </span>
                      <span className="text-base sm:text-lg">
                        "Circle line disruptions"
                      </span>
                    </div>
                  </button>
                  <button
                    onClick={() =>
                      handleQuestionClick('Station accessibility info')
                    }
                    className="bg-gray-700 hover:bg-gray-600 rounded-lg p-4 sm:p-5 text-left font-medium sm:font-semibold text-gray-100 shadow-md hover:shadow-lg transition-all duration-200 hover:-translate-y-0.5 cursor-pointer group border border-gray-600 touch-target mobile-press tap-highlight-none touch-manipulation"
                  >
                    <div className="flex items-center gap-2">
                      <span className="text-gray-300 group-hover:text-white text-sm sm:text-base">
                        ♿
                      </span>
                      <span className="text-base sm:text-lg">
                        "Station accessibility info"
                      </span>
                    </div>
                  </button>
                  <button
                    onClick={() =>
                      handleQuestionClick('Weekend service updates')
                    }
                    className="bg-gray-700 hover:bg-gray-600 rounded-lg p-4 sm:p-5 text-left font-medium sm:font-semibold text-gray-100 shadow-md hover:shadow-lg transition-all duration-200 hover:-translate-y-0.5 cursor-pointer group border border-gray-600 touch-target mobile-press tap-highlight-none touch-manipulation"
                  >
                    <div className="flex items-center gap-2">
                      <span className="text-gray-300 group-hover:text-white text-sm sm:text-base">
                        📅
                      </span>
                      <span className="text-base sm:text-lg">
                        "Weekend service updates"
                      </span>
                    </div>
                  </button>
                </div>
              </div>
            </div>

            {/* Live Network Status */}
            <div className="mb-6">
              <section
                className="bg-gradient-to-r from-gray-800 to-gray-900 border border-gray-700 p-4 sm:p-6 shadow-xl"
                style={{
                  background:
                    'linear-gradient(to right, rgba(51,51,51,1), rgba(38,38,38,1))',
                }}
                aria-labelledby="network-status-heading"
                role="region"
              >
                <div className="flex items-center justify-between mb-4 sm:mb-6">
                  <div className="text-center flex-1">
                    <h2 id="network-status-heading" className="text-lg sm:text-xl font-semibold text-gray-100">
                      Live Network Status
                    </h2>
                    {lastUpdated && (
                      <p className="text-xs text-gray-400 mt-1">
                        Last updated: {lastUpdated.toLocaleTimeString()}
                      </p>
                    )}
                  </div>
                  <button
                    onClick={handleRefresh}
                    disabled={isRefreshing}
                    className="ml-4 p-3 text-gray-400 hover:text-gray-200 hover:bg-gray-700 rounded-md transition-colors disabled:opacity-50 touch-target mobile-press"
                    title="Refresh status data"
                    aria-label={isRefreshing ? "Refreshing TFL status data" : "Refresh TFL status data"}
                    role="button"
                  >
                    <RefreshCw
                      className={`w-5 h-5 ${
                        isRefreshing ? 'animate-spin' : ''
                      }`}
                    />
                  </button>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-3 sm:gap-4 lg:gap-5" role="grid" aria-label="TFL line status overview">
                  {tflLines.map((line) => (
                    <LineStatusBlock
                      key={line.id}
                      lineId={line.id}
                      lineName={line.name}
                      backgroundColor={line.backgroundColor}
                      getLineStatus={getLineStatus}
                      getStatusStyling={getStatusStyling}
                      isPulsating={getIsPulsating(line.id)}
                    />
                  ))}
                </div>
              </section>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      ref={messagesContainerRef}
      className="chat-container space-y-4 sm:space-y-6 scrollbar-thin"
    >
      {/* Error display */}
      {error && (
        <div className="bg-red-900 border border-red-700 p-3 sm:p-4 mb-4">
          <div className="flex items-start gap-2 text-red-200">
            <span className="font-medium text-sm">Error:</span>
            <span className="text-sm break-words">{error}</span>
          </div>
        </div>
      )}

      {/* Messages */}
      {messages.map((message) => (
        <ChatMessage key={message.id} message={message} />
      ))}

      {/* Typing indicator */}
      {isTyping && (
        <div className="flex gap-2 sm:gap-3 justify-start">
          <div className="flex-shrink-0 w-7 h-7 sm:w-8 sm:h-8 bg-gray-600 text-gray-300 flex items-center justify-center">
            <Loader2 className="w-3 h-3 sm:w-4 sm:h-4 animate-spin" />
          </div>
          <div className="chat-message assistant">
            <div className="flex items-center gap-2">
              <span className="text-gray-400 text-sm">Assistant is typing</span>
              <div className="flex gap-1">
                <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-gray-400 animate-bounce"></div>
                <div
                  className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-gray-400 animate-bounce"
                  style={{ animationDelay: '0.1s' }}
                ></div>
                <div
                  className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-gray-400 animate-bounce"
                  style={{ animationDelay: '0.2s' }}
                ></div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Scroll to bottom button */}
      {showScrollButton && messages.length > 3 && (
        <button
          onClick={scrollToBottom}
          className="fixed bottom-20 sm:bottom-24 right-4 sm:right-8 bg-gray-700 text-white p-2 sm:p-3 rounded-md shadow-lg hover:bg-gray-600 transition-colors z-10"
          aria-label="Scroll to bottom"
        >
          <ArrowDown className="w-4 h-4 sm:w-5 sm:h-5" />
        </button>
      )}

      {/* This is the invisible element that we scroll to */}
      <div ref={messagesEndRef} />
    </div>
  );
}
