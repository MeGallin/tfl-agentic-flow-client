import { useTFL } from '../../contexts/TFLContext';

export default function AgentIndicator({ agent, className = '' }) {
  const { getLineColor, getLineInfo } = useTFL();

  if (!agent) return null;

  const lineInfo = getLineInfo(agent);
  const lineColor = getLineColor(agent);

  return (
    <div
      className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium ${lineColor.bg} ${lineColor.text} ${className}`}
    >
      <span>{lineInfo.icon}</span>
      <span>{lineInfo.name} Assistant</span>
    </div>
  );
}
