import { useState, useRef, useEffect } from 'react';
import { Send, Loader2, Lightbulb, X } from 'lucide-react';
import { useConversation } from '../../contexts/ConversationContext';
import { apiService } from '../../services/api';

export default function ChatInput() {
  const [message, setMessage] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [showExamples, setShowExamples] = useState(false);
  const inputRef = useRef(null);
  const {
    addMessage,
    setLoading,
    setError,
    setActiveAgent,
    setTypingIndicator,
    threadId,
    isLoading,
  } = useConversation();
  // Focus input on mount
  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  // Listen for custom events to set input message
  useEffect(() => {
    const handleSetInputMessage = (event) => {
      setMessage(event.detail.message);
      inputRef.current?.focus();
    };

    window.addEventListener('setInputMessage', handleSetInputMessage);
    return () => window.removeEventListener('setInputMessage', handleSetInputMessage);
  }, []);

  // Example suggestions organized by category
  const exampleSuggestions = {
    'Line Status': [
      "What's the current status of the Circle line?",
      'Is the District line running normally?',
      'Any service updates for Bakerloo line?',
      'Central line service status',
    ],
    Disruptions: [
      'Are there any disruptions on Bakerloo line?',
      'Current delays on Circle line?',
      'District line closures this weekend',
      'Planned engineering works',
    ],
    'Journey Planning': [
      'Plan a journey from Paddington to Westminster',
      "Best route from King's Cross to Victoria",
      'How to get from Baker Street to Liverpool Street',
      'Journey time from Edgware Road to Monument',
    ],
    'Station Information': [
      'District line station information',
      'Tell me about Notting Hill Gate station',
      'Platform information for Baker Street',
      'Accessibility at Westminster station',
    ],
  };

  const handleExampleClick = (example) => {
    setMessage(example);
    setShowExamples(false);
    inputRef.current?.focus();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!message.trim() || isSending || isLoading) {
      return;
    }

    const userMessage = message.trim();
    setMessage('');
    setIsSending(true);
    setError(null);

    try {
      // Add user message to conversation
      addMessage({
        role: 'user',
        content: userMessage,
        timestamp: new Date().toISOString(),
      });

      // Show typing indicator
      setTypingIndicator(true);
      setLoading(true); // Send message to API
      const response = await apiService.sendMessage(userMessage, threadId);

      // Debug: Log the full response to see what we're getting
      console.log('=== API RESPONSE DEBUG ===');
      console.log('Full response object:', response);
      console.log('response.response (the content):', response.response);
      console.log('response.response type:', typeof response.response);
      console.log(
        'response.response length:',
        response.response ? response.response.length : 'undefined',
      );
      console.log('response.success:', response.success);
      console.log('response.agent:', response.agent);

      // Update active agent if specified in response
      if (response.agent) {
        setActiveAgent(response.agent);
      }

      // Prepare message object - being very explicit
      const assistantContent = response.response; // Extract this explicitly
      console.log('Extracted assistantContent:', assistantContent);
      console.log('assistantContent type:', typeof assistantContent);

      const messageToAdd = {
        role: 'assistant',
        content: assistantContent, // Use the explicitly extracted content
        agent: response.agent,
        metadata: response.metadata,
        tflData: response.tflData,
        lineColor: response.lineColor,
        timestamp: response.timestamp || new Date().toISOString(),
      };

      // Debug: Log the message object being added
      console.log('=== MESSAGE OBJECT DEBUG ===');
      console.log('Message object being added:', messageToAdd);
      console.log('messageToAdd.content:', messageToAdd.content);
      console.log('messageToAdd.content type:', typeof messageToAdd.content);

      // Add assistant response to conversation
      console.log('Adding message to conversation...');
      addMessage(messageToAdd);
    } catch (error) {
      console.error('Failed to send message:', error);
      setError(error.message || 'Failed to send message. Please try again.');

      // Add error message to conversation
      addMessage({
        role: 'assistant',
        content:
          'I apologize, but I encountered an error processing your message. Please try again.',
        isError: true,
        timestamp: new Date().toISOString(),
      });
    } finally {
      setIsSending(false);
      setLoading(false);
      setTypingIndicator(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };
  const isDisabled = isSending || isLoading;
  return (
    <>
      {' '}
      {/* Examples Modal */}
      {showExamples && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-start sm:items-center justify-center z-50 p-3 pt-12 sm:p-6">
          <div className="bg-gray-800  w-full sm:max-w-3xl max-h-[85vh] sm:max-h-[90vh] overflow-hidden shadow-2xl">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-4 sm:p-5 border-b border-gray-600 bg-gray-700">
              <h3 className="text-lg sm:text-xl font-semibold text-gray-100">
                Example Questions
              </h3>
              <button
                onClick={() => setShowExamples(false)}
                className="p-1.5 hover:bg-gray-600 rounded-md transition-colors"
              >
                <X className="w-5 h-5 text-gray-300" />
              </button>
            </div>

            {/* Modal Content */}
            <div
              className="p-4 sm:p-5 overflow-y-auto"
              style={{ maxHeight: 'calc(85vh - 80px)' }}
            >
              {Object.entries(exampleSuggestions).map(
                ([category, suggestions]) => (
                  <div key={category} className="mb-6 last:mb-2">
                    <h4 className="text-sm font-medium text-gray-300 mb-3 px-1 uppercase tracking-wide">
                      {category}
                    </h4>
                    <div className="space-y-2">
                      {suggestions.map((suggestion, index) => (
                        <button
                          key={index}
                          onClick={() => handleExampleClick(suggestion)}
                          className="w-full text-left p-4 text-sm sm:text-base bg-gray-700 hover:bg-gray-600 rounded-md transition-colors border border-gray-600 hover:border-gray-500 hover:shadow-sm text-gray-100"
                        >
                          {suggestion}
                        </button>
                      ))}
                    </div>
                  </div>
                ),
              )}
            </div>
          </div>
        </div>
      )}
      {/* Compact Input Area */}
      <div className="bg-gray-800 border-t border-gray-700 p-3 sm:p-4 flex-shrink-0">
        <form onSubmit={handleSubmit} className="max-w-4xl mx-auto">
          <div className="flex gap-2 sm:gap-3">
            {' '}
            {/* Examples Button */}
            <button
              type="button"
              onClick={() => setShowExamples(true)}
              disabled={isDisabled}
              className="flex-shrink-0 p-2 sm:p-3 text-gray-400 hover:text-gray-200 hover:bg-gray-700 rounded-md transition-colors disabled:opacity-50 border border-gray-600 hover:border-gray-500"
              title="Show example questions"
            >
              <Lightbulb className="w-4 h-4 sm:w-5 sm:h-5" />
            </button>
            {/* Input Field */}
            <div className="flex-1">
              <textarea
                ref={inputRef}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Ask about any TFL line, station, journey planning, or service updates..."
                className="textarea-field min-h-[64px] sm:min-h-[72px] max-h-[120px] resize-none text-sm sm:text-base bg-gray-700 border-gray-600 text-gray-100 placeholder-gray-400 flex items-center justify-center text-center"
                disabled={isDisabled}
                rows={2}
                style={{
                  height: 'auto',
                  minHeight: window.innerWidth < 640 ? '64px' : '72px',
                }}
                onInput={(e) => {
                  e.target.style.height = 'auto';
                  e.target.style.height =
                    Math.min(e.target.scrollHeight, 120) + 'px';
                }}
              />
            </div>
            {/* Send Button */}
            <button
              type="submit"
              disabled={isDisabled || !message.trim()}
              className={`
                flex-shrink-0 px-3 sm:px-4 py-2 sm:py-3 rounded-md font-medium transition-all duration-200
                flex items-center justify-center min-w-[50px] sm:min-w-[60px]
                ${
                  isDisabled || !message.trim()
                    ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    : 'bg-primary-600 hover:bg-primary-700 text-white hover:shadow-lg'
                }
              `}
            >
              {isSending ? (
                <Loader2 className="w-4 h-4 sm:w-5 sm:h-5 animate-spin" />
              ) : (
                <Send className="w-4 h-4 sm:w-5 sm:h-5" />
              )}
            </button>
          </div>
        </form>
      </div>
    </>
  );
}
