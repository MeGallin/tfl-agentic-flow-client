import { useState, useEffect, useRef, useCallback } from 'react';

const useSpeechRecognition = ({ 
  pauseDelay = 2500, // Configurable pause delay in milliseconds
  enablePauseDetection = true // Allow disabling pause detection if needed
} = {}) => {
  const [transcript, setTranscript] = useState('');
  const [listening, setListening] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [browserSupportsRecognition, setBrowserSupportsRecognition] =
    useState(false);
  const [isMicrophoneAvailable, setIsMicrophoneAvailable] = useState(false);

  const recognitionRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const audioStreamRef = useRef(null);
  const pauseTimeoutRef = useRef(null);
  const lastSpeechTimeRef = useRef(null);

  const checkBrowserSupport = useCallback(async () => {
    // Check for Web Speech API support
    const hasWebSpeechAPI =
      'webkitSpeechRecognition' in window || 'SpeechRecognition' in window;
    const hasMediaDevices = !!(
      navigator.mediaDevices && navigator.mediaDevices.getUserMedia
    );

    setBrowserSupportsRecognition(hasWebSpeechAPI && hasMediaDevices);

    if (hasMediaDevices) {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          audio: true,
        });
        stream.getTracks().forEach((track) => track.stop()); // Immediately stop
        setIsMicrophoneAvailable(true);
      } catch {
        setIsMicrophoneAvailable(false);
        setBrowserSupportsRecognition(false);
      }
    } else {
      setBrowserSupportsRecognition(false);
    }
  }, []);

  useEffect(() => {
    checkBrowserSupport();
  }, [checkBrowserSupport]);

  const initializeRecognition = useCallback(() => {
    if (recognitionRef.current) return recognitionRef.current;

    try {
      const SpeechRecognition =
        window.SpeechRecognition || window.webkitSpeechRecognition;
      const recognition = new SpeechRecognition();

      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = 'en-US';
      recognition.maxAlternatives = 1;

      recognition.onstart = () => {
        console.log('Speech recognition started');
        setListening(true);
        setError(null);
      };

      recognition.onresult = (event) => {
        let finalTranscript = '';
        let interimTranscript = '';

        for (let i = event.resultIndex; i < event.results.length; i++) {
          const result = event.results[i];
          if (result.isFinal) {
            finalTranscript += result[0].transcript;
          } else {
            interimTranscript += result[0].transcript;
          }
        }

        // Update last speech time when we detect any speech activity
        if (finalTranscript || interimTranscript) {
          lastSpeechTimeRef.current = Date.now();
          
          // Clear any existing pause timeout when user continues speaking
          if (pauseTimeoutRef.current) {
            clearTimeout(pauseTimeoutRef.current);
            pauseTimeoutRef.current = null;
          }
        }

        if (finalTranscript) {
          setTranscript(finalTranscript.trim());
          
          // Instead of immediately stopping, set a pause timeout
          // This gives users time to continue speaking after natural pauses
          if (enablePauseDetection) {
            pauseTimeoutRef.current = setTimeout(() => {
              if (recognitionRef.current && listening) {
                console.log(`Auto-stopping after ${pauseDelay}ms pause delay`);
                recognitionRef.current.stop();
              }
            }, pauseDelay);
          } else {
            // If pause detection is disabled, stop immediately (original behavior)
            if (recognitionRef.current) {
              recognitionRef.current.stop();
            }
          }
        }
      };

      recognition.onerror = (event) => {
        console.error('Speech recognition error:', event.error);
        setError(`Speech recognition error: ${event.error}`);
        setListening(false);
      };

      recognition.onend = () => {
        console.log('Speech recognition ended');
        setListening(false);
      };

      recognitionRef.current = recognition;
      return recognition;
    } catch (err) {
      console.error('Failed to initialize speech recognition:', err);
      setError('Failed to initialize speech recognition');
      return null;
    }
  }, []);

  const startListening = useCallback(
    async ({ continuous = true } = {}) => {
      if (!browserSupportsRecognition) {
        setError('Speech recognition not supported in this browser');
        return;
      }

      if (!isMicrophoneAvailable) {
        setError('Microphone access not available');
        return;
      }

      try {
        const recognition = recognitionRef.current || initializeRecognition();
        if (!recognition) {
          setError('Failed to initialize speech recognition');
          return;
        }

        recognition.start();
      } catch (err) {
        console.error('Failed to start speech recognition:', err);
        setError('Failed to start speech recognition: ' + err.message);
      }
    },
    [browserSupportsRecognition, isMicrophoneAvailable, initializeRecognition],
  );

  const stopListening = useCallback(() => {
    // Clear any pending pause timeout when manually stopping
    if (pauseTimeoutRef.current) {
      clearTimeout(pauseTimeoutRef.current);
      pauseTimeoutRef.current = null;
    }
    
    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }
    setListening(false);
  }, []);

  const resetTranscript = useCallback(() => {
    setTranscript('');
    setError(null);
  }, []);

  useEffect(() => {
    return () => {
      // Cleanup: clear any pending timeouts and stop listening
      if (pauseTimeoutRef.current) {
        clearTimeout(pauseTimeoutRef.current);
      }
      stopListening();
    };
  }, [stopListening]);

  return {
    transcript,
    listening,
    isLoading,
    error,
    browserSupportsSpeechRecognition: browserSupportsRecognition,
    isMicrophoneAvailable,
    startListening,
    stopListening,
    resetTranscript,
  };
};

export default useSpeechRecognition;
