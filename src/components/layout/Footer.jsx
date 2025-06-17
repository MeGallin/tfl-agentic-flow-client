export default function Footer() {
  return (
    <footer className="bg-gray-50 border-t border-gray-200 px-6 py-2 flex-shrink-0">
      <div className="flex items-center justify-between text-xs text-gray-600">
        <div className="flex items-center gap-4">
          <span>© 2025 TFL Underground AI Assistant</span>
          <span className="text-gray-400">|</span>
          <span>Powered by LangGraph.js & OpenAI</span>
        </div>

        <div className="flex items-center gap-4">
          <a
            href="https://tfl.gov.uk"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-tfl-blue transition-colors"
          >
            Official TFL Website
          </a>
          <span className="text-gray-400">|</span>
          <span className="text-xs">Real-time data from TFL API</span>
        </div>
      </div>
    </footer>
  );
}
