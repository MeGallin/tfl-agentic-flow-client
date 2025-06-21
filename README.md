# TFL Underground AI Assistant - Client

A React frontend for the TFL Underground AI Assistant that provides real-time London Underground information through a conversational interface.

## Features

- **Real-time Chat Interface** - Interactive conversation with specialized Underground line agents
- **Voice Input** - Browser-based speech recognition using OpenAI Whisper
- **Responsive Design** - Mobile-first design with Tailwind CSS
- **Agent Routing** - Automatic routing to specialized line agents based on user queries
- **Live TFL Data** - Real-time service status, disruptions, and arrival information
- **Message History** - Persistent conversation storage with threading
- **Error Handling** - Graceful fallbacks and user-friendly error messages

## Technology Stack

- **Framework**: React 19 with Vite
- **Styling**: Tailwind CSS with custom TFL line colors
- **Speech Recognition**: OpenAI Whisper via @xenova/transformers
- **HTTP Client**: Axios
- **Icons**: Lucide React
- **Date Handling**: date-fns
- **Build Tool**: Vite with ES modules

## Speech Recognition

The application uses **OpenAI Whisper** running entirely in the browser for speech-to-text conversion:

- **Cross-browser compatibility** - Works in all modern browsers supporting WebAssembly
- **Offline processing** - No server-side speech recognition required
- **High accuracy** - OpenAI Whisper model for superior transcription
- **Graceful degradation** - Automatically disables if model fails to load
- **Privacy-focused** - Audio processing happens locally in the browser

### Speech Recognition Requirements

- Modern browser with WebAssembly support
- Microphone access permissions
- Stable internet connection (first load only for model download)
- HTTPS in production (automatic with most hosting platforms)

## Project Structure

```
src/
├── components/
│   ├── chat/
│   │   ├── ChatInput.jsx          # Main input with speech recognition
│   │   ├── ChatInterface.jsx      # Chat container and message display
│   │   └── MessageBubble.jsx      # Individual message rendering
│   ├── layout/
│   │   ├── Header.jsx             # App header with branding
│   │   └── LoadingScreen.jsx      # Initial loading state
│   └── ui/                        # Reusable UI components
├── contexts/
│   ├── ConversationContext.jsx    # Chat state and message management
│   └── TFLContext.jsx            # TFL data and line information
├── hooks/
│   └── useWhisperSpeechRecognition.js  # Custom Whisper speech hook
├── services/
│   └── api.js                     # API communication layer
├── styles/
│   └── globals.css               # Global styles and Tailwind config
└── utils/                        # Utility functions and helpers
```

## Development Setup

1. **Install dependencies**:
   ```bash
   npm install
   ```

2. **Environment setup**:
   ```bash
   cp .env.example .env
   # Configure your environment variables
   ```

3. **Start development server**:
   ```bash
   npm run dev
   ```

4. **Build for production**:
   ```bash
   npm run build
   ```

## Environment Variables

```bash
# API Configuration
VITE_API_BASE_URL=http://localhost:3000

# Optional: Analytics and monitoring
VITE_ANALYTICS_ID=your_analytics_id
```

## Available Scripts

- `npm run dev` - Start development server with hot reload
- `npm run build` - Build for production
- `npm run build:dev` - Build in development mode
- `npm run preview` - Preview production build locally
- `npm run preview:prod` - Preview production build in production mode
- `npm run lint` - Run ESLint code quality checks

## Speech Recognition Implementation

The app uses a custom `useWhisperSpeechRecognition` hook that provides:

```javascript
const {
  transcript,           // Current speech-to-text result
  listening,           // Recording state
  isLoading,          // Model loading state
  error,              // Error messages
  browserSupportsSpeechRecognition, // Browser compatibility
  isMicrophoneAvailable,            // Microphone permissions
  startListening,     // Begin voice input
  stopListening,      // End voice input
  resetTranscript     // Clear current transcript
} = useWhisperSpeechRecognition();
```

### Speech Recognition Features

- **Continuous listening** - Records audio in chunks for real-time processing
- **Automatic initialization** - Lazy loads Whisper model on first use
- **Error recovery** - Graceful handling of model loading failures
- **Browser detection** - Automatic feature detection and fallbacks
- **Memory management** - Proper cleanup of audio streams and resources

## Deployment

### Production Deployment

1. **Build the application**:
   ```bash
   npm run build
   ```

2. **Deploy to hosting platform** (Vercel, Netlify, etc.):
   - Automatic HTTPS ensures speech recognition works
   - Environment variables configured in platform settings
   - Build output from `dist/` directory

### Docker Deployment

```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
RUN npm run build
EXPOSE 5173
CMD ["npm", "run", "preview"]
```

## Browser Compatibility

### Supported Browsers

- **Chrome/Chromium** 88+ ✅
- **Firefox** 79+ ✅  
- **Safari** 14.1+ ✅
- **Edge** 88+ ✅

### Speech Recognition Support

- **Desktop browsers** - Full support with WebAssembly
- **Mobile browsers** - Full support on modern devices
- **Older browsers** - Graceful degradation (chat works, no speech)

## Performance Considerations

### Speech Recognition

- **Model size**: ~39MB download on first use
- **Loading time**: 5-15 seconds for initial model download
- **Memory usage**: ~200MB for model in browser memory
- **Processing**: Real-time transcription with minimal latency

### Optimization Features

- **Lazy loading** - Whisper model loads only when speech recognition is used
- **Caching** - Model cached in browser for subsequent sessions
- **Code splitting** - Dynamic imports for non-critical features
- **Bundle optimization** - Tree shaking and minification

## Troubleshooting

### Speech Recognition Issues

1. **Model fails to load**:
   - Check internet connection
   - Verify browser WebAssembly support
   - Check browser console for specific errors

2. **Microphone not accessible**:
   - Grant microphone permissions in browser
   - Ensure HTTPS in production
   - Check browser security settings

3. **Poor transcription accuracy**:
   - Speak clearly and avoid background noise
   - Check microphone quality and positioning
   - Ensure stable internet for model download

### Development Issues

1. **Build failures**:
   ```bash
   rm -rf node_modules package-lock.json
   npm install
   npm run build
   ```

2. **Hot reload not working**:
   - Check Vite configuration
   - Restart development server
   - Clear browser cache

## API Integration

The client communicates with the TFL Underground AI Assistant API:

- **Base URL**: Configured via `VITE_API_BASE_URL`
- **Authentication**: Session-based with thread IDs
- **Error handling**: Automatic retry with exponential backoff
- **Real-time updates**: WebSocket connections for live data

### API Endpoints Used

- `GET /api/health` - Health check and connectivity
- `GET /api/info` - Application information and version
- `POST /api/chat` - Send messages and receive responses
- `GET /api/conversation/:threadId` - Retrieve conversation history

## Contributing

1. Follow the existing code style and patterns
2. Use the established component structure
3. Add proper error handling for new features
4. Test speech recognition on multiple browsers
5. Update documentation for new features

## License

This project is part of the TFL Underground AI Assistant system.