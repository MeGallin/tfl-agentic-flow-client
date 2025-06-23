import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ConversationProvider } from './contexts/ConversationContext';
import { TFLProvider } from './contexts/TFLContext';
import Header from './components/layout/Header';
import Footer from './components/layout/Footer';
import ChatMessages from './components/chat/ChatMessages';
import ChatInput from './components/chat/ChatInput';
import AboutPage from './components/pages/AboutPage';
import './App.css';

// Main Chat Interface Component
function ChatInterface() {
  return (
    <main className="flex-1 flex flex-col overflow-auto">
      <div className="flex-1 overflow-auto">
        <ChatMessages />
      </div>
      <ChatInput />
    </main>
  );
}

function App() {
  return (
    <ConversationProvider>
      <TFLProvider>
        <Router>
          <div
            className="h-screen overflow-auto flex flex-col"
            style={{ background: 'black' }}
          >
            <Header />
            <Routes>
              <Route path="/" element={<ChatInterface />} />
              <Route path="/about" element={<AboutPage />} />
            </Routes>
            <Footer />
          </div>
        </Router>
      </TFLProvider>
    </ConversationProvider>
  );
}

export default App;
