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
      className="flex flex-col items-center p-3 sm:p-4 border border-gray-600 rounded-lg shadow-sm hover:shadow-md transition-all duration-200 min-h-[88px] sm:min-h-[96px] cursor-pointer hover:scale-105 mobile-press tap-highlight-none touch-manipulation mobile-high-contrast"
      style={{ backgroundColor }}
      role="gridcell"
      tabIndex={0}
      aria-label={`${lineName} line status: ${statusText}`}
      title={`${lineName} line - ${statusText}`}
    >
      <span className="inline-flex items-center gap-1 sm:gap-2 px-3 sm:px-4 py-2 text-lg sm:text-xl font-semibold text-white" role="heading" aria-level="3">
        <span>{lineName.toUpperCase()}</span>
      </span>
      <span
        className={`text-xs mt-2 text-center px-3 py-1.5 rounded-md font-medium min-h-[24px] flex items-center justify-center ${getStatusStyling(
          lineId,
        )}`}
        role="status"
        aria-live={isGoodService ? "polite" : "assertive"}
        aria-label={`Service status: ${statusText}`}
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
