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
        className={`flex items-center gap-1 px-2 py-0.5  text-xs sm:text-sm font-medium ${lineColor.bg} ${lineColor.text}`}
      >
        <span className="text-xs sm:text-sm">{lineInfo.icon}</span>
        <span>{lineInfo.name}</span>
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
      className={`bg-gray-800 border-b border-gray-700 shadow-sm px-3 sm:px-4 py-2 sm:py-3 sticky top-0 z-50 ${className}`}
    >
      <div className="flex items-center justify-between">
        {/* Left side - Compact logo and title */}
        <div className="flex items-center gap-2 sm:gap-3">
          <div className="p-1.5 sm:p-2 bg-tfl-blue ">
            <Train className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
          </div>
          <div className="flex items-center gap-1 sm:gap-2">
            <h1 className="text-lg sm:text-xl font-bold text-gray-100">
              TFL AI Assistant
            </h1>
            {/* Active agent indicator - Mobile optimized */}
            {getAgentDisplay()}
          </div>
        </div>

        {/* Right side - Compact controls */}
        <div className="flex items-center gap-1 sm:gap-2">
          {/* New Chat Button - Mobile optimized */}
          <button
            onClick={clearAllConversations}
            className="flex items-center gap-1 px-2 sm:px-3 py-1 text-xs sm:text-sm font-medium text-gray-300 hover:text-gray-100 hover:bg-gray-700 rounded-md transition-colors"
            title="Start new conversation"
          >
            <Plus className="w-3 h-3 sm:w-4 sm:h-4" />
            <span className="hidden sm:inline">New Chat</span>
          </button>

          {/* Connection status - Compact */}
          <div className="flex items-center gap-1">
            {getConnectionIcon()}
            <span className="hidden sm:inline text-xs font-medium text-gray-400">
              {getConnectionText()}
            </span>
          </div>
        </div>
      </div>
    </header>
  );
}
