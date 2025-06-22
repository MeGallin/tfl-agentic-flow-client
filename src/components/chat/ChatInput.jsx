import { useState, useRef, useEffect } from 'react';
import { Send, Loader2, Lightbulb, X, Mic, MicOff, Zap } from 'lucide-react';
import useSpeechRecognition from '../../hooks/useSpeechRecognition';
import { useConversation } from '../../contexts/ConversationContext';
import { apiService } from '../../services/api';
import ConfirmationDialog from './ConfirmationDialog';
import StreamingIndicator from './StreamingIndicator';

export default function ChatInput() {
  const [message, setMessage] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [showExamples, setShowExamples] = useState(false);
  const [pendingConfirmation, setPendingConfirmation] = useState(null);
  const [isStreaming, setIsStreaming] = useState(false);
  const [streamingData, setStreamingData] = useState(null);
  const [useStreamingMode, setUseStreamingMode] = useState(false);
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

  // Speech recognition hook - using Web Speech API for better reliability
  const {
    transcript,
    listening,
    isLoading: speechLoading,
    error: speechError,
    browserSupportsSpeechRecognition,
    isMicrophoneAvailable,
    startListening: speechStart,
    stopListening: speechStop,
    resetTranscript,
  } = useSpeechRecognition();

  // Handle speech recognition errors - only log, don't set error to prevent loops
  useEffect(() => {
    if (speechError) {
      console.error('Speech recognition error:', speechError);
      // Don't set global error state to prevent error loops
    }
  }, [speechError]);
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
    return () =>
      window.removeEventListener('setInputMessage', handleSetInputMessage);
  }, []);

  // Update message when transcript changes
  useEffect(() => {
    if (transcript && listening) {
      setMessage(transcript);
    }
  }, [transcript, listening]);

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

  // Speech recognition handlers
  const startListening = async () => {
    if (!browserSupportsSpeechRecognition) {
      // Show a temporary notification instead of setting global error
      console.warn('Speech recognition is not supported in this browser');
      return;
    }
    if (!isMicrophoneAvailable) {
      // Show a temporary notification instead of setting global error
      console.warn(
        'Microphone access is not available. Please check your permissions.',
      );
      return;
    }
    resetTranscript();
    await speechStart({ continuous: true });
  };

  const stopListening = () => {
    speechStop();
  };

  // Helper to determine if query should use streaming
  const shouldUseStreamingForQuery = (query) => {
    const streamingKeywords = [
      'journey from',
      'travel from',
      'route from',
      'plan journey',
      'multiple lines',
      'network status',
      'compare',
      'alternative'
    ];
    
    const queryLower = query.toLowerCase();
    return streamingKeywords.some(keyword => queryLower.includes(keyword));
  };

  // Handle streaming submission
  const handleStreamingSubmit = async (userMessage) => {
    try {
      // User message already added in handleSubmit
      setIsStreaming(true);
      setStreamingData({ currentStep: 'input_validation', agent: null });
      setTypingIndicator(true);
      setLoading(true);

      // Create streaming connection
      const eventSource = await apiService.streamMessage(userMessage, threadId);
      
      eventSource.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          
          if (data.done) {
            // Streaming complete
            setIsStreaming(false);
            setStreamingData(null);
            eventSource.close();
            return;
          }

          if (data.error) {
            throw new Error(data.message);
          }

          // Update streaming indicator
          setStreamingData({
            currentStep: data.step,
            agent: data.agent,
            partialResponse: data.partialResponse
          });

          // If we have a partial response, show it
          if (data.partialResponse && data.step === 'finalize_response') {
            addMessage({
              role: 'assistant',
              content: data.partialResponse,
              agent: data.agent,
              streaming: true,
              timestamp: data.metadata?.timestamp || new Date().toISOString(),
            });
          }
        } catch (parseError) {
          console.error('Error parsing streaming data:', parseError);
        }
      };

      eventSource.onerror = (error) => {
        console.error('Streaming error:', error);
        setError('Streaming connection failed. Falling back to standard mode...');
        
        // Fallback to regular request
        handleRegularSubmit(userMessage);
        
        setIsStreaming(false);
        setStreamingData(null);
        eventSource.close();
      };

    } catch (error) {
      console.error('Failed to start streaming:', error);
      setError('Failed to start streaming. Using standard mode...');
      
      // Fallback to regular request
      handleRegularSubmit(userMessage);
    } finally {
      setIsSending(false);
      setLoading(false);
      setTypingIndicator(false);
      // Ensure transcript is fully cleared after response
      resetTranscript();
    }
  };

  // Handle regular (non-streaming) submission
  const handleRegularSubmit = async (userMessage) => {
    try {
      // Set loading and typing indicators
      setLoading(true);
      setTypingIndicator(true);
      
      // Send message to API
      const response = await apiService.sendMessage(userMessage, threadId);

      // Debug: Log the full response to see what we're getting
      console.log('=== API RESPONSE DEBUG ===');
      console.log('Full response object:', response);
      console.log('requiresConfirmation:', response.requiresConfirmation);
      console.log('awaitingConfirmation:', response.awaitingConfirmation);

      // Update active agent if specified in response
      if (response.agent) {
        setActiveAgent(response.agent);
      }

      // Check if response requires confirmation
      if (response.requiresConfirmation || response.awaitingConfirmation) {
        // Store the pending confirmation data
        setPendingConfirmation({
          originalMessage: userMessage,
          response: response.response,
          threadId: response.threadId,
          metadata: {
            agent: response.agent,
            confidence: response.confidence,
            timestamp: response.timestamp
          }
        });

        // Add the confirmation message to conversation
        addMessage({
          role: 'assistant',
          content: response.response,
          agent: response.agent,
          metadata: response.metadata,
          tflData: response.tflData,
          lineColor: response.lineColor,
          requiresConfirmation: true,
          timestamp: response.timestamp || new Date().toISOString(),
        });
      } else {
        // Normal response - add directly to conversation
        const messageToAdd = {
          role: 'assistant',
          content: response.response,
          agent: response.agent,
          metadata: response.metadata,
          tflData: response.tflData,
          lineColor: response.lineColor,
          collaborative: response.collaborative,
          agentsUsed: response.agentsUsed,
          timestamp: response.timestamp || new Date().toISOString(),
        };

        addMessage(messageToAdd);
      }
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
      // Ensure transcript is fully cleared after response
      resetTranscript();
    }
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
    
    // Clear transcript and stop listening if voice recognition was used
    if (listening) {
      stopListening();
    }
    resetTranscript();

    // Add user message to conversation first
    addMessage({
      role: 'user',
      content: userMessage,
      timestamp: new Date().toISOString(),
    });

    // Check if we should use streaming mode for this query
    const shouldStream = useStreamingMode || shouldUseStreamingForQuery(userMessage);

    if (shouldStream) {
      return handleStreamingSubmit(userMessage);
    } else {
      return handleRegularSubmit(userMessage);
    }
  };

  // Handle confirmation response
  const handleConfirmation = async (confirmed) => {
    if (!pendingConfirmation) return;

    setIsSending(true);
    setError(null);

    try {
      setTypingIndicator(true);
      setLoading(true);

      // Send confirmation to API
      const response = await apiService.sendMessageWithConfirmation(
        pendingConfirmation.originalMessage,
        pendingConfirmation.threadId,
        confirmed,
        {}
      );

      // Update active agent
      if (response.agent) {
        setActiveAgent(response.agent);
      }

      // Add the final response to conversation
      addMessage({
        role: 'assistant',
        content: response.response,
        agent: response.agent,
        metadata: {
          ...response.metadata,
          confirmedBy: 'user',
          userConfirmation: confirmed
        },
        tflData: response.tflData,
        lineColor: response.lineColor,
        timestamp: response.timestamp || new Date().toISOString(),
      });

      // Clear pending confirmation
      setPendingConfirmation(null);

    } catch (error) {
      console.error('Failed to send confirmation:', error);
      setError(error.message || 'Failed to process confirmation. Please try again.');

      addMessage({
        role: 'assistant',
        content: 'I apologize, but I encountered an error processing your confirmation. Please try again.',
        isError: true,
        timestamp: new Date().toISOString(),
      });
    } finally {
      setIsSending(false);
      setLoading(false);
      setTypingIndicator(false);
      // Ensure transcript is fully cleared after response
      resetTranscript();
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };
  const isDisabled = isSending || isLoading;
  return (
    <>
      {/* Streaming Indicator */}
      {isStreaming && (
        <StreamingIndicator
          isStreaming={isStreaming}
          currentStep={streamingData?.currentStep}
          agentName={streamingData?.agent}
          onComplete={() => setIsStreaming(false)}
        />
      )}

      {/* Confirmation Dialog */}
      <ConfirmationDialog
        message={pendingConfirmation?.response || ''}
        onConfirm={() => handleConfirmation(true)}
        onReject={() => handleConfirmation(false)}
        isVisible={!!pendingConfirmation}
        metadata={pendingConfirmation?.metadata || {}}
      />

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
            {/* Speech Recognition Button */}
            {browserSupportsSpeechRecognition && (
              <button
                type="button"
                onClick={listening ? stopListening : startListening}
                disabled={isDisabled || speechLoading}
                className={`flex-shrink-0 p-2 sm:p-3 rounded-md transition-colors disabled:opacity-50 border ${
                  listening
                    ? 'text-red-400 bg-red-900 border-red-600 hover:bg-red-800 animate-pulse'
                    : speechLoading
                    ? 'text-blue-400 bg-blue-900 border-blue-600'
                    : 'text-gray-400 hover:text-gray-200 hover:bg-gray-700 border-gray-600 hover:border-gray-500'
                }`}
                title={
                  speechLoading
                    ? 'Loading speech recognition...'
                    : listening
                    ? 'Stop listening'
                    : 'Start voice input'
                }
              >
                {speechLoading ? (
                  <Loader2 className="w-4 h-4 sm:w-5 sm:h-5 animate-spin" />
                ) : listening ? (
                  <MicOff className="w-4 h-4 sm:w-5 sm:h-5" />
                ) : (
                  <Mic className="w-4 h-4 sm:w-5 sm:h-5" />
                )}
              </button>
            )}

            {/* Streaming Toggle Button */}
            <button
              type="button"
              onClick={() => setUseStreamingMode(!useStreamingMode)}
              disabled={isDisabled}
              className={`flex-shrink-0 p-2 sm:p-3 rounded-md transition-colors disabled:opacity-50 border ${
                useStreamingMode
                  ? 'text-blue-400 bg-blue-900 border-blue-600 hover:bg-blue-800'
                  : 'text-gray-400 hover:text-gray-200 hover:bg-gray-700 border-gray-600 hover:border-gray-500'
              }`}
              title={useStreamingMode ? 'Disable streaming mode' : 'Enable streaming mode'}
            >
              <Zap className="w-4 h-4 sm:w-5 sm:h-5" />
            </button>
            {/* Input Field */}
            <div className="flex-1">
              <textarea
                ref={inputRef}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                onKeyDown={handleKeyDown}
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
