import { useState, useEffect, useRef, useCallback } from 'react';

const useSpeechRecognition = () => {
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

        for (let i = event.resultIndex; i < event.results.length; i++) {
          const result = event.results[i];
          if (result.isFinal) {
            finalTranscript += result[0].transcript;
          }
        }

        if (finalTranscript) {
          setTranscript(finalTranscript.trim());
          // Auto-stop listening after receiving final result
          if (recognitionRef.current) {
            recognitionRef.current.stop();
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
