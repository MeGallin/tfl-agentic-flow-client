import TypewriterText from '../UI/TypewriterText';

export default function LineStatusBlock({
  lineId,
  lineName,
  backgroundColor,
  getLineStatus,
  getStatusStyling,
  isPulsating = false,
}) {
  const statusText = getLineStatus(lineId);
  const isGoodService =
    statusText.toLowerCase().includes('good service') ||
    statusText.toLowerCase().includes('loading');

  return (
    <div
      className="flex flex-col items-center p-2 sm:p-3 border border-gray-600"
      style={{ backgroundColor }}
    >
      <span className="inline-flex items-center gap-1 sm:gap-2 px-2 sm:px-3 py-1 text-lg sm:text-xl font-medium text-white">
        <span>{lineName}</span>
      </span>
      <span
        className={`text-xs mt-1 text-center px-2 py-1 ${getStatusStyling(
          lineId,
        )}`}
      >
        {isGoodService ? (
          statusText
        ) : (
          <TypewriterText
            text={statusText}
            speed={80}
            delay={Math.random() * 500 + 200}
            showCursor={false}
            loop={true}
            pauseBetweenLoops={10000}
          />
        )}
      </span>
    </div>
  );
}
