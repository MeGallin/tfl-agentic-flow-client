export default function LineStatusBlock({ 
  lineId, 
  lineName, 
  backgroundColor, 
  getLineStatus, 
  getStatusStyling 
}) {
  return (
    <div 
      className="flex flex-col items-center p-2 sm:p-3 border border-gray-600" 
      style={{ backgroundColor }}
    >
      <span className="inline-flex items-center gap-1 sm:gap-2 px-2 sm:px-3 py-1 text-base sm:text-lg font-medium text-white">
        <span>{lineName}</span>
      </span>
      <span 
        className={`text-xs mt-1 text-center px-2 py-1 bg-gray-100 border border-gray-200 ${getStatusStyling(lineId)}`}
      >
        {getLineStatus(lineId)}
      </span>
    </div>
  );
}