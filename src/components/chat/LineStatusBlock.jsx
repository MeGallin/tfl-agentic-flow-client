export default function LineStatusBlock({
  lineId,
  lineName,
  backgroundColor,
  getLineStatus,
  getStatusStyling,
  isPulsating = false,
}) {
  return (
    <div
      className={`flex flex-col items-center p-2 sm:p-3 border border-gray-600 ${
        isPulsating ? 'animate-pulse' : ''
      }`}
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
        {getLineStatus(lineId)}
      </span>
    </div>
  );
}
