import axios from 'axios';

// API configuration
const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor
api.interceptors.request.use(
  (config) => {
    console.log(
      `Making ${config.method?.toUpperCase()} request to ${config.url}`,
    );
    return config;
  },
  (error) => {
    console.error('Request error:', error);
    return Promise.reject(error);
  },
);

// Response interceptor
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    console.error('Response error:', error);

    if (error.response) {
      // Server responded with error status
      const { status, data } = error.response;
      throw new Error(data?.error || `HTTP ${status}: ${error.message}`);
    } else if (error.request) {
      // Network error
      throw new Error(
        'Unable to connect to TFL service. Please check your connection.',
      );
    } else {
      // Other error
      throw new Error(error.message || 'An unexpected error occurred');
    }
  },
);

// API service functions
export const apiService = {
  // Health check
  async checkHealth() {
    try {
      const response = await api.get('/api/health');
      return response.data;
    } catch (error) {
      console.error('Health check failed:', error);
      throw error;
    }
  },

  // Application info
  async getAppInfo() {
    try {
      const response = await api.get('/api/info');
      return response.data;
    } catch (error) {
      console.error('Failed to get app info:', error);
      throw error;
    }
  },
  // Send chat message
  async sendMessage(message, threadId = null) {
    try {
      const response = await api.post('/api/chat', {
        query: message, // Changed from 'message' to 'query' to match backend expectations
        threadId,
      });
      return response.data;
    } catch (error) {
      console.error('Failed to send message:', error);
      throw error;
    }
  },

  // Send chat message with confirmation
  async sendMessageWithConfirmation(message, threadId, userConfirmation, userContext = {}) {
    try {
      const response = await api.post('/api/chat/confirm', {
        query: message,
        threadId,
        userConfirmation,
        userContext,
      });
      return response.data;
    } catch (error) {
      console.error('Failed to send message with confirmation:', error);
      throw error;
    }
  },

  // Stream chat messages (Server-Sent Events)
  async streamMessage(message, threadId = null, userContext = {}) {
    try {
      const params = new URLSearchParams({
        query: message,
        userContext: JSON.stringify(userContext)
      });
      
      const url = `/api/chat/stream/${threadId || 'new'}?${params}`;
      return new EventSource(`${API_BASE_URL}${url}`);
    } catch (error) {
      console.error('Failed to create stream connection:', error);
      throw error;
    }
  },

  // Get conversation history
  async getConversation(threadId) {
    try {
      const response = await api.get(`/api/conversations/${threadId}`);
      return response.data;
    } catch (error) {
      console.error('Failed to get conversation:', error);
      throw error;
    }
  },

  // TFL-specific endpoints (if we add them later)
  tfl: {
    async getLineStatus(line) {
      try {
        const response = await api.get(`/api/tfl/status/${line}`);
        return response.data;
      } catch (error) {
        console.error(`Failed to get ${line} line status:`, error);
        throw error;
      }
    },

    async getDisruptions(line) {
      try {
        const response = await api.get(`/api/tfl/disruptions/${line}`);
        return response.data;
      } catch (error) {
        console.error(`Failed to get ${line} line disruptions:`, error);
        throw error;
      }
    },

    async getStations(line) {
      try {
        const response = await api.get(`/api/tfl/stations/${line}`);
        return response.data;
      } catch (error) {
        console.error(`Failed to get ${line} line stations:`, error);
        throw error;
      }
    },

    async planJourney(from, to, options = {}) {
      try {
        const response = await api.post('/api/tfl/journey', {
          from,
          to,
          ...options,
        });
        return response.data;
      } catch (error) {
        console.error('Failed to plan journey:', error);
        throw error;
      }
    },
  },
};

// Export default
export default apiService;
