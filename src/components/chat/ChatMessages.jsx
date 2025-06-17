import { useEffect, useRef, useState } from 'react';
import { Loader2, ArrowDown } from 'lucide-react';
import { useConversation } from '../../contexts/ConversationContext';
import ChatMessage from './ChatMessage';
import './ChatMessages.css';

export default function ChatMessages() {
  const { messages, isLoading, isTyping, error } = useConversation();
  const messagesEndRef = useRef(null);
  const messagesContainerRef = useRef(null);
  const [showScrollButton, setShowScrollButton] = useState(false);

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

  // Show welcome message if no messages
  if (messages.length === 0 && !isLoading) {
    return (
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="text-center max-w-2xl">
          <div className="w-16 h-16 bg-tfl-blue rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-2xl text-white">🚇</span>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Welcome to TFL Underground AI Assistant
          </h2>
          <p className="text-gray-600 mb-6">
            Get real-time information about Circle, Bakerloo, District, and
            Central lines. Ask about service status, disruptions, station
            information, or plan your journey.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-left">
            <div className="p-4 border border-circle/20 bg-circle/5 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-lg">⭕</span>
                <span className="font-medium">Circle Line</span>
              </div>
              <p className="text-sm text-gray-600">
                Central London loop service through Zone 1
              </p>
            </div>

            <div className="p-4 border border-bakerloo/20 bg-bakerloo/5 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-lg">🟤</span>
                <span className="font-medium">Bakerloo Line</span>
              </div>
              <p className="text-sm text-gray-600">
                North-South service with rich heritage
              </p>
            </div>

            <div className="p-4 border border-district/20 bg-district/5 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-lg">🟢</span>
                <span className="font-medium">District Line</span>
              </div>
              <p className="text-sm text-gray-600">
                Multiple branches serving West London
              </p>
            </div>

            <div className="p-4 border border-central/20 bg-central/5 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-lg">🔴</span>
                <span className="font-medium">Central Line</span>
              </div>
              <p className="text-sm text-gray-600">
                East-west across London, busiest line
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }
  return (
    <div
      ref={messagesContainerRef}
      className="chat-container space-y-6 scrollbar-thin"
    >
      {/* Error display */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
          <div className="flex items-center gap-2 text-red-800">
            <span className="font-medium">Error:</span>
            <span>{error}</span>
          </div>
        </div>
      )}

      {/* Messages */}
      {messages.map((message) => (
        <ChatMessage key={message.id} message={message} />
      ))}

      {/* Typing indicator */}
      {isTyping && (
        <div className="flex gap-3 justify-start">
          <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gray-200 text-gray-600 flex items-center justify-center">
            <Loader2 className="w-4 h-4 animate-spin" />
          </div>
          <div className="chat-message assistant">
            <div className="flex items-center gap-2">
              <span className="text-gray-600">Assistant is typing</span>
              <div className="flex gap-1">
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                <div
                  className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                  style={{ animationDelay: '0.1s' }}
                ></div>
                <div
                  className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
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
          className="fixed bottom-24 right-8 bg-gray-800 text-white p-2 rounded-full shadow-lg hover:bg-gray-700 transition-colors z-10"
          aria-label="Scroll to bottom"
        >
          <ArrowDown className="w-5 h-5" />
        </button>
      )}

      {/* This is the invisible element that we scroll to */}
      <div ref={messagesEndRef} />
    </div>
  );
}
