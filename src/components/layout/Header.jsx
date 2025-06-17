import { useState, useEffect } from 'react';
import { Train, Wifi, WifiOff, AlertCircle, Plus } from 'lucide-react';
import { useConversation } from '../../contexts/ConversationContext';
import { useTFL } from '../../contexts/TFLContext';
import { apiService } from '../../services/api';

export default function Header({ className = '' }) {
  const { activeAgent, threadId, clearAllConversations } = useConversation();
  const { getLineColor, getLineInfo } = useTFL();
  const [connectionStatus, setConnectionStatus] = useState('checking');
  const [appInfo, setAppInfo] = useState(null);

  // Check connection status
  useEffect(() => {
    const checkConnection = async () => {
      try {
        await apiService.checkHealth();
        setConnectionStatus('connected');
      } catch (error) {
        setConnectionStatus('disconnected');
      }
    };

    checkConnection();
    const interval = setInterval(checkConnection, 30000); // Check every 30s

    return () => clearInterval(interval);
  }, []);

  // Get app info
  useEffect(() => {
    const getAppInfo = async () => {
      try {
        const info = await apiService.getAppInfo();
        setAppInfo(info);
      } catch (error) {
        console.error('Failed to get app info:', error);
      }
    };

    getAppInfo();
  }, []);

  const getAgentDisplay = () => {
    if (!activeAgent) return null;

    const lineInfo = getLineInfo(activeAgent);
    const lineColor = getLineColor(activeAgent);

    return (
      <div
        className={`flex items-center gap-2 px-3 py-1 rounded-full ${lineColor.bg} ${lineColor.text}`}
      >
        <span className="text-sm font-medium">{lineInfo.icon}</span>
        <span className="text-sm font-medium">{lineInfo.name} Assistant</span>
      </div>
    );
  };

  const getConnectionIcon = () => {
    switch (connectionStatus) {
      case 'connected':
        return <Wifi className="w-4 h-4 text-green-600" />;
      case 'disconnected':
        return <WifiOff className="w-4 h-4 text-red-600" />;
      default:
        return (
          <AlertCircle className="w-4 h-4 text-yellow-600 animate-pulse" />
        );
    }
  };

  const getConnectionText = () => {
    switch (connectionStatus) {
      case 'connected':
        return 'Connected';
      case 'disconnected':
        return 'Offline';
      default:
        return 'Connecting...';
    }
  };
  return (
    <header
      className={`bg-white border-b border-gray-200 shadow-sm px-6 py-4 sticky top-0 z-50 ${className}`}
    >
      <div className="flex items-center justify-between">
        {/* Left side - Logo and title */}
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-tfl-blue rounded-lg">
              <Train className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900">
                TFL Underground AI Assistant
              </h1>
              <p className="text-sm text-gray-600">
                Circle, Bakerloo, District & Central Lines
              </p>
            </div>
          </div>

          {/* Active agent indicator */}
          {getAgentDisplay()}
        </div>{' '}
        {/* Right side - Status and info */}
        <div className="flex items-center gap-4">
          {/* New Conversation Button */}
          <button
            onClick={clearAllConversations}
            className="flex items-center gap-2 px-3 py-1 text-sm font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
            title="Start new conversation"
          >
            <Plus className="w-4 h-4" />
            New Chat
          </button>

          {/* Connection status */}
          <div className="flex items-center gap-2">
            {getConnectionIcon()}
            <span
              className={`text-sm font-medium ${
                connectionStatus === 'connected'
                  ? 'text-green-600'
                  : connectionStatus === 'disconnected'
                  ? 'text-red-600'
                  : 'text-yellow-600'
              }`}
            >
              {getConnectionText()}
            </span>
          </div>

          {/* Thread ID indicator */}
          {threadId && (
            <div className="text-xs text-gray-500 font-mono">
              ID: {threadId.slice(-8)}
            </div>
          )}

          {/* App version */}
          {appInfo && (
            <div className="text-xs text-gray-500">v{appInfo.version}</div>
          )}
        </div>
      </div>
    </header>
  );
}
