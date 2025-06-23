export default function Footer() {
  return (
    <footer className="bg-gray-800 border-t border-gray-700 px-6 py-2 flex-shrink-0">
      <div className="flex items-center justify-center text-center text-xs text-gray-400">
        <div className="flex items-center gap-4">
          <span>© 2025 TFL Underground AI Assistant</span>
          <span className="text-gray-400">|</span>
          <span>Powered by LangGraph.js & OpenAI</span>
          <span className="text-gray-400">|</span>
          <span className="text-xs">Real-time data from TFL API</span>
        </div>
      </div>
    </footer>
  );
}
