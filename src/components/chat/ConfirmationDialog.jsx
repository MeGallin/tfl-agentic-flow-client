import { useState } from 'react';
import { Check, X, AlertCircle, Clock } from 'lucide-react';

export default function ConfirmationDialog({ 
  message, 
  onConfirm, 
  onReject, 
  isVisible,
  metadata = {} 
}) {
  const [isProcessing, setIsProcessing] = useState(false);

  const handleConfirm = async () => {
    setIsProcessing(true);
    try {
      await onConfirm(true);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleReject = async () => {
    setIsProcessing(true);
    try {
      await onReject(false);
    } finally {
      setIsProcessing(false);
    }
  };

  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-gray-800 rounded-lg shadow-2xl max-w-md w-full border border-gray-600">
        {/* Header */}
        <div className="flex items-center gap-3 p-4 border-b border-gray-600">
          <div className="w-8 h-8 bg-yellow-500 rounded-full flex items-center justify-center">
            <AlertCircle className="w-5 h-5 text-yellow-900" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-100">
              Confirmation Required
            </h3>
            <p className="text-sm text-gray-400">
              Please review the recommendation below
            </p>
          </div>
        </div>

        {/* Content */}
        <div className="p-4">
          <div className="mb-4">
            <div className="bg-gray-700 rounded-lg p-4 border border-gray-600">
              <p className="text-gray-100 text-sm leading-relaxed">
                {message}
              </p>
            </div>
          </div>

          {/* Metadata Display */}
          {metadata.agent && (
            <div className="mb-4 text-xs text-gray-400">
              <div className="flex items-center gap-2">
                <Clock className="w-3 h-3" />
                <span>Recommended by {metadata.agent} agent</span>
                {metadata.confidence && (
                  <span>• Confidence: {Math.round(metadata.confidence * 100)}%</span>
                )}
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-3">
            <button
              onClick={handleConfirm}
              disabled={isProcessing}
              className="flex-1 bg-green-600 hover:bg-green-700 disabled:bg-green-800 text-white font-medium py-2.5 px-4 rounded-md transition-colors flex items-center justify-center gap-2"
            >
              <Check className="w-4 h-4" />
              {isProcessing ? 'Processing...' : 'Yes, proceed'}
            </button>
            
            <button
              onClick={handleReject}
              disabled={isProcessing}
              className="flex-1 bg-red-600 hover:bg-red-700 disabled:bg-red-800 text-white font-medium py-2.5 px-4 rounded-md transition-colors flex items-center justify-center gap-2"
            >
              <X className="w-4 h-4" />
              {isProcessing ? 'Processing...' : 'No, show alternatives'}
            </button>
          </div>

          {/* Help Text */}
          <div className="mt-3 text-xs text-gray-500 text-center">
            Selecting "No" will show alternative recommendations
          </div>
        </div>
      </div>
    </div>
  );
}