import { useState, useEffect } from 'react';
import { Loader2, Zap, CheckCircle, AlertCircle } from 'lucide-react';

export default function StreamingIndicator({ 
  isStreaming, 
  currentStep, 
  stepProgress, 
  agentName,
  onComplete 
}) {
  const [dots, setDots] = useState('');

  useEffect(() => {
    if (!isStreaming) return;

    const interval = setInterval(() => {
      setDots(prev => prev.length >= 3 ? '' : prev + '.');
    }, 500);

    return () => clearInterval(interval);
  }, [isStreaming]);

  if (!isStreaming) return null;

  const getStepIcon = (step) => {
    switch (step) {
      case 'input_validation':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'route_query':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'process_agent':
        return <Loader2 className="w-4 h-4 text-blue-500 animate-spin" />;
      case 'check_confirmation':
        return <AlertCircle className="w-4 h-4 text-yellow-500" />;
      case 'save_memory':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      default:
        return <Loader2 className="w-4 h-4 text-gray-400 animate-spin" />;
    }
  };

  const getStepLabel = (step) => {
    const labels = {
      input_validation: 'Validating input',
      route_query: 'Routing to agent',
      process_agent: `Processing with ${agentName || 'agent'}`,
      check_confirmation: 'Checking if confirmation needed',
      await_confirmation: 'Awaiting user confirmation',
      save_memory: 'Saving conversation',
      finalize_response: 'Finalizing response'
    };
    return labels[step] || 'Processing';
  };

  const getStepDescription = (step) => {
    const descriptions = {
      input_validation: 'Checking your query format and content',
      route_query: 'Determining the best agent for your request',
      process_agent: 'Fetching live TFL data and generating response',
      check_confirmation: 'Analyzing if your request needs confirmation',
      await_confirmation: 'Waiting for your approval to proceed',
      save_memory: 'Storing conversation for future reference',
      finalize_response: 'Preparing your final response'
    };
    return descriptions[step] || 'Working on your request';
  };

  return (
    <div className="bg-gray-800 border border-gray-600 rounded-lg p-4 mb-4">
      <div className="flex items-center gap-3 mb-3">
        <Zap className="w-5 h-5 text-blue-400" />
        <h3 className="text-gray-100 font-medium">
          Processing your request{dots}
        </h3>
      </div>

      <div className="space-y-2">
        <div className="flex items-center gap-3">
          {getStepIcon(currentStep)}
          <div className="flex-1">
            <div className="text-sm text-gray-100 font-medium">
              {getStepLabel(currentStep)}
            </div>
            <div className="text-xs text-gray-400">
              {getStepDescription(currentStep)}
            </div>
          </div>
        </div>

        {stepProgress && stepProgress.length > 0 && (
          <div className="mt-3 pt-3 border-t border-gray-600">
            <div className="text-xs text-gray-400 mb-2">Processing steps:</div>
            <div className="space-y-1">
              {stepProgress.map((step, index) => (
                <div key={index} className="flex items-center gap-2 text-xs">
                  <div className={`w-2 h-2 rounded-full ${
                    step.completed ? 'bg-green-500' : 
                    step.current ? 'bg-blue-500' : 'bg-gray-600'
                  }`} />
                  <span className={
                    step.completed ? 'text-green-400' :
                    step.current ? 'text-blue-400' : 'text-gray-500'
                  }>
                    {step.name}
                  </span>
                  {step.current && (
                    <Loader2 className="w-3 h-3 animate-spin text-blue-400" />
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {agentName && (
          <div className="mt-3 pt-3 border-t border-gray-600">
            <div className="text-xs text-gray-400">
              Current agent: <span className="text-gray-200 font-medium">{agentName}</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}