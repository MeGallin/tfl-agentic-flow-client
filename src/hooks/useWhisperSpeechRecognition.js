import { useState, useEffect, useRef, useCallback } from 'react';

// Gracefully handle transformers dependency
let pipeline = null;

const loadTransformers = async () => {
  if (typeof window === 'undefined') return null; // Server-side rendering check
  
  if (!pipeline) {
    try {
      console.log('Attempting to load transformers...');
      const transformers = await import('@xenova/transformers');
      pipeline = transformers.pipeline;
      console.log('Transformers loaded successfully');
    } catch (error) {
      console.warn('Transformers library not available or failed to load:', error.message);
      return null;
    }
  }
  return pipeline;
};

const useWhisperSpeechRecognition = () => {
  const [transcript, setTranscript] = useState('');
  const [listening, setListening] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [browserSupportsRecognition, setBrowserSupportsRecognition] = useState(false);
  const [isMicrophoneAvailable, setIsMicrophoneAvailable] = useState(false);
  const [isWhisperAvailable, setIsWhisperAvailable] = useState(false);
  
  const mediaRecorderRef = useRef(null);
  const audioStreamRef = useRef(null);
  const audioChunksRef = useRef([]);
  const transcribeRef = useRef(null);
  const isInitializedRef = useRef(false);

  // Check if Whisper is available on component mount
  useEffect(() => {
    const checkWhisperAvailability = async () => {
      const transformersPipeline = await loadTransformers();
      setIsWhisperAvailable(!!transformersPipeline);
      if (!transformersPipeline) {
        setError('Advanced speech recognition (Whisper) not available. Consider using basic speech recognition.');
      }
    };
    
    checkWhisperAvailability();
  }, []);

  const initializeTranscriber = useCallback(async () => {
    if (isInitializedRef.current || transcribeRef.current) return transcribeRef.current;
    
    if (!isWhisperAvailable) {
      console.warn('Whisper not available, skipping initialization');
      return null;
    }
    
    try {
      setIsLoading(true);
      setError(null);
      
      console.log('Loading Whisper model... This may take a moment on first use.');
      
      // Try to load transformers
      const pipelineFunc = await loadTransformers();
      if (!pipelineFunc) {
        throw new Error('Transformers library not available');
      }
      
      // Add timeout for model loading
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Model loading timeout after 45 seconds')), 45000)
      );
      
      const modelPromise = pipelineFunc(
        'automatic-speech-recognition',
        'Xenova/whisper-tiny.en',
        {
          chunk_length_s: 30,
          stride_length_s: 5,
          // Use the Hugging Face Hub directly instead of local models
          local_files_only: false,
          cache_dir: null,
        }
      );
      
      const pipe = await Promise.race([modelPromise, timeoutPromise]);
      
      transcribeRef.current = pipe;
      isInitializedRef.current = true;
      console.log('Whisper model initialized successfully');
      return pipe;
    } catch (err) {
      console.error('Failed to initialize Whisper:', err);
      // Don't completely disable speech recognition, just mark as unavailable for now
      setError('Advanced speech recognition unavailable. Consider using basic speech input.');
      transcribeRef.current = null;
      isInitializedRef.current = false;
      setIsWhisperAvailable(false);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [isWhisperAvailable]);

  const checkBrowserSupport = useCallback(async () => {
    const hasMediaDevices = !!(navigator.mediaDevices && navigator.mediaDevices.getUserMedia);
    const hasWebAssembly = typeof WebAssembly === 'object';
    
    // Set support based on basic requirements and Whisper availability
    setBrowserSupportsRecognition(hasMediaDevices && hasWebAssembly && isWhisperAvailable);
    
    if (hasMediaDevices) {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        stream.getTracks().forEach(track => track.stop()); // Immediately stop
        setIsMicrophoneAvailable(true);
      } catch {
        setIsMicrophoneAvailable(false);
        setBrowserSupportsRecognition(false);
      }
    } else {
      setBrowserSupportsRecognition(false);
    }
  }, [isWhisperAvailable]);

  useEffect(() => {
    checkBrowserSupport();
  }, [checkBrowserSupport]);

  const processAudioData = useCallback(async (audioBlob) => {
    try {
      // Ensure transcriber is initialized
      const transcriber = transcribeRef.current || await initializeTranscriber();
      
      if (!transcriber) {
        console.error('Transcriber not available');
        setError('Speech recognition not available');
        return;
      }

      // Convert audio blob to the format expected by Whisper
      const audioUrl = URL.createObjectURL(audioBlob);
      
      console.log('Processing audio with Whisper...');
      const result = await transcriber(audioUrl);
      const newTranscript = result.text?.trim() || '';
      
      console.log('Transcription result:', newTranscript);
      
      // Clean up the URL object
      URL.revokeObjectURL(audioUrl);
      
      if (newTranscript && newTranscript.length > 0) {
        setTranscript(prev => prev + (prev ? ' ' : '') + newTranscript);
      }
    } catch (err) {
      console.error('Transcription error:', err);
      setError('Failed to process audio: ' + err.message);
    }
  }, [initializeTranscriber]);

  const startListening = useCallback(async ({ continuous = true } = {}) => {
    if (!browserSupportsRecognition || !isWhisperAvailable) {
      setError('Advanced speech recognition not available. Please type your message.');
      return;
    }

    if (!isMicrophoneAvailable) {
      setError('Microphone access not available');
      return;
    }

    try {
      // Try to initialize transcriber before starting
      if (!transcribeRef.current) {
        console.log('Initializing Whisper model...');
        setIsLoading(true);
        const transcriber = await initializeTranscriber();
        if (!transcriber) {
          // If Whisper fails to load, show a more user-friendly message
          setError('Advanced speech recognition temporarily unavailable. Please type your message.');
          setIsLoading(false);
          return;
        }
        setIsLoading(false);
      }

      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          sampleRate: 16000,
          channelCount: 1,
          echoCancellation: true,
          noiseSuppression: true,
        }
      });
      
      audioStreamRef.current = stream;
      audioChunksRef.current = [];

      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: 'audio/webm;codecs=opus'
      });

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = async () => {
        if (audioChunksRef.current.length > 0) {
          const audioBlob = new Blob(audioChunksRef.current, { 
            type: 'audio/webm;codecs=opus' 
          });
          await processAudioData(audioBlob);
        }
      };

      mediaRecorderRef.current = mediaRecorder;
      
      if (continuous) {
        mediaRecorder.start(1000);
      } else {
        mediaRecorder.start();
      }
      
      setListening(true);
      setError(null);

    } catch (err) {
      console.error('Failed to start recording:', err);
      setError('Failed to access microphone: ' + err.message);
      setIsLoading(false);
    }
  }, [browserSupportsRecognition, isMicrophoneAvailable, processAudioData, initializeTranscriber, isWhisperAvailable]);

  const stopListening = useCallback(() => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop();
    }
    
    if (audioStreamRef.current) {
      audioStreamRef.current.getTracks().forEach(track => track.stop());
      audioStreamRef.current = null;
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

export default useWhisperSpeechRecognition;