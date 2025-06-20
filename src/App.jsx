import { ConversationProvider } from './contexts/ConversationContext';
import { TFLProvider } from './contexts/TFLContext';
import Header from './components/layout/Header';
import Footer from './components/layout/Footer';
import ChatMessages from './components/chat/ChatMessages';
import ChatInput from './components/chat/ChatInput';
import './App.css';

function App() {
  return (
    <ConversationProvider>
      <TFLProvider>
        <div className="h-screen overflow-hidden flex flex-col" style={{background: 'rgba(51,51,51,1)'}}>
          <Header />

          <main className="flex-1 flex flex-col overflow-hidden">
            <div className="flex-1 overflow-hidden">
              <ChatMessages />
            </div>
            <ChatInput />
          </main>

          <Footer />
        </div>
      </TFLProvider>
    </ConversationProvider>
  );
}

export default App;
