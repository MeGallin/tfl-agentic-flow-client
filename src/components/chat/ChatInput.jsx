import { useState, useRef, useEffect } from 'react';
import { Send, Loader2 } from 'lucide-react';
import { useConversation } from '../../contexts/ConversationContext';
import { apiService } from '../../services/api';

export default function ChatInput() {
  const [message, setMessage] = useState('');
  const [isSending, setIsSending] = useState(false);
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
    <div className="bg-white border-t border-gray-200 p-4 flex-shrink-0">
      <form onSubmit={handleSubmit} className="max-w-4xl mx-auto">
        <div className="flex gap-3">
          <div className="flex-1">
            <textarea
              ref={inputRef}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Ask about Circle, Bakerloo, or District line services..."
              className="textarea-field min-h-[50px] max-h-[120px] resize-none"
              disabled={isDisabled}
              rows={1}
              style={{
                height: 'auto',
                minHeight: '50px',
              }}
              onInput={(e) => {
                e.target.style.height = 'auto';
                e.target.style.height =
                  Math.min(e.target.scrollHeight, 120) + 'px';
              }}
            />
          </div>

          <button
            type="submit"
            disabled={isDisabled || !message.trim()}
            className={`
              px-4 py-3 rounded-lg font-medium transition-all duration-200
              flex items-center justify-center min-w-[60px]
              ${
                isDisabled || !message.trim()
                  ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  : 'bg-primary-600 hover:bg-primary-700 text-white hover:shadow-lg'
              }
            `}
          >
            {isSending ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <Send className="w-5 h-5" />
            )}
          </button>
        </div>

        {/* Quick suggestions */}
        <div className="mt-3 flex flex-wrap gap-2">
          {[
            "What's the current status of the Circle line?",
            'Are there any disruptions on Bakerloo line?',
            'Plan a journey from Paddington to Westminster',
            'District line station information',
          ].map((suggestion, index) => (
            <button
              key={index}
              type="button"
              onClick={() => setMessage(suggestion)}
              disabled={isDisabled}
              className="px-3 py-1 text-sm bg-gray-100 hover:bg-gray-200 text-gray-700 
                         rounded-full transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {suggestion}
            </button>
          ))}
        </div>
      </form>
    </div>
  );
}
