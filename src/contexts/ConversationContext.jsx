import { createContext, useContext, useReducer, useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid';

// Conversation state types
const CONVERSATION_ACTIONS = {
  SET_MESSAGES: 'SET_MESSAGES',
  ADD_MESSAGE: 'ADD_MESSAGE',
  UPDATE_MESSAGE: 'UPDATE_MESSAGE',
  SET_LOADING: 'SET_LOADING',
  SET_ERROR: 'SET_ERROR',
  SET_ACTIVE_AGENT: 'SET_ACTIVE_AGENT',
  SET_THREAD_ID: 'SET_THREAD_ID',
  CLEAR_CONVERSATION: 'CLEAR_CONVERSATION',
  SET_TYPING_INDICATOR: 'SET_TYPING_INDICATOR',
};

// Initial state
const initialState = {
  messages: [],
  isLoading: false,
  error: null,
  activeAgent: null, // 'circle', 'bakerloo', 'district', or null
  threadId: null,
  isTyping: false,
};

// Reducer function
function conversationReducer(state, action) {
  switch (action.type) {
    case CONVERSATION_ACTIONS.SET_MESSAGES:
      return {
        ...state,
        messages: action.payload,
        error: null,
      };

    case CONVERSATION_ACTIONS.ADD_MESSAGE:
      return {
        ...state,
        messages: [
          ...state.messages,
          {
            ...action.payload,
            id: action.payload.id || uuidv4(),
            timestamp: action.payload.timestamp || new Date().toISOString(),
          },
        ],
        error: null,
      };

    case CONVERSATION_ACTIONS.UPDATE_MESSAGE:
      return {
        ...state,
        messages: state.messages.map((msg) =>
          msg.id === action.payload.id ? { ...msg, ...action.payload } : msg,
        ),
      };

    case CONVERSATION_ACTIONS.SET_LOADING:
      return {
        ...state,
        isLoading: action.payload,
      };

    case CONVERSATION_ACTIONS.SET_ERROR:
      return {
        ...state,
        error: action.payload,
        isLoading: false,
      };

    case CONVERSATION_ACTIONS.SET_ACTIVE_AGENT:
      return {
        ...state,
        activeAgent: action.payload,
      };

    case CONVERSATION_ACTIONS.SET_THREAD_ID:
      return {
        ...state,
        threadId: action.payload,
      };

    case CONVERSATION_ACTIONS.CLEAR_CONVERSATION:
      return {
        ...initialState,
        threadId: uuidv4(), // Generate new thread ID
      };

    case CONVERSATION_ACTIONS.SET_TYPING_INDICATOR:
      return {
        ...state,
        isTyping: action.payload,
      };

    default:
      return state;
  }
}

// Create context
const ConversationContext = createContext();

// Provider component
export function ConversationProvider({ children }) {
  const [state, dispatch] = useReducer(conversationReducer, {
    ...initialState,
    threadId: uuidv4(),
  });

  // Actions
  const actions = {
    setMessages: (messages) => {
      dispatch({ type: CONVERSATION_ACTIONS.SET_MESSAGES, payload: messages });
    },

    addMessage: (message) => {
      dispatch({ type: CONVERSATION_ACTIONS.ADD_MESSAGE, payload: message });
    },

    updateMessage: (messageUpdate) => {
      dispatch({
        type: CONVERSATION_ACTIONS.UPDATE_MESSAGE,
        payload: messageUpdate,
      });
    },

    setLoading: (loading) => {
      dispatch({ type: CONVERSATION_ACTIONS.SET_LOADING, payload: loading });
    },

    setError: (error) => {
      dispatch({ type: CONVERSATION_ACTIONS.SET_ERROR, payload: error });
    },

    setActiveAgent: (agent) => {
      dispatch({ type: CONVERSATION_ACTIONS.SET_ACTIVE_AGENT, payload: agent });
    },

    setThreadId: (threadId) => {
      dispatch({ type: CONVERSATION_ACTIONS.SET_THREAD_ID, payload: threadId });
    },
    clearConversation: () => {
      dispatch({ type: CONVERSATION_ACTIONS.CLEAR_CONVERSATION });
    }, // Clear all saved conversations from localStorage
    clearAllConversations: () => {
      console.log('Clearing all conversations from localStorage');
      const keys = Object.keys(localStorage).filter((key) =>
        key.startsWith('conversation_'),
      );
      console.log('Found', keys.length, 'conversation keys to remove');
      keys.forEach((key) => {
        console.log('Removing:', key);
        localStorage.removeItem(key);
      });
      dispatch({ type: CONVERSATION_ACTIONS.CLEAR_CONVERSATION });
    },

    setTypingIndicator: (typing) => {
      dispatch({
        type: CONVERSATION_ACTIONS.SET_TYPING_INDICATOR,
        payload: typing,
      });
    },
  };

  // Auto-save conversation to localStorage
  useEffect(() => {
    if (state.messages.length > 0) {
      const conversationData = {
        threadId: state.threadId,
        messages: state.messages,
        activeAgent: state.activeAgent,
        timestamp: new Date().toISOString(),
      };
      localStorage.setItem(
        `conversation_${state.threadId}`,
        JSON.stringify(conversationData),
      );
    }
  }, [state.messages, state.threadId, state.activeAgent]); // Load conversation from localStorage on mount (only if no messages exist)
  useEffect(() => {
    // TEMPORARY: Clear localStorage for debugging
    console.log('DEBUGGING: Clearing all localStorage conversations');
    Object.keys(localStorage)
      .filter((key) => key.startsWith('conversation_'))
      .forEach((key) => {
        console.log('Removing localStorage key:', key);
        localStorage.removeItem(key);
      });

    // Only load saved conversation if we don't already have messages
    if (state.messages.length === 0) {
      console.log('ConversationContext: Loading saved conversations...');
      const savedConversations = Object.keys(localStorage)
        .filter((key) => key.startsWith('conversation_'))
        .map((key) => {
          try {
            return JSON.parse(localStorage.getItem(key));
          } catch (e) {
            console.warn('Failed to parse saved conversation:', key);
            return null;
          }
        })
        .filter(Boolean)
        .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

      console.log('Found saved conversations:', savedConversations.length);

      if (savedConversations.length > 0) {
        const latest = savedConversations[0];
        // Only load if the conversation is recent (within 1 hour)
        const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
        console.log('Latest conversation timestamp:', latest.timestamp);
        console.log('One hour ago:', oneHourAgo.toISOString());

        if (new Date(latest.timestamp) > oneHourAgo) {
          console.log(
            'Loading recent conversation with',
            latest.messages.length,
            'messages',
          );
          console.log(
            'Sample message:',
            latest.messages[latest.messages.length - 1],
          );
          actions.setMessages(latest.messages);
          actions.setActiveAgent(latest.activeAgent);
          actions.setThreadId(latest.threadId);
        } else {
          console.log('Conversation too old, not loading');
        }
      }
    }
  }, []); // Only run once on mount

  return (
    <ConversationContext.Provider value={{ ...state, ...actions }}>
      {children}
    </ConversationContext.Provider>
  );
}

// Hook to use conversation context
export function useConversation() {
  const context = useContext(ConversationContext);
  if (!context) {
    throw new Error(
      'useConversation must be used within a ConversationProvider',
    );
  }
  return context;
}

export { CONVERSATION_ACTIONS };
