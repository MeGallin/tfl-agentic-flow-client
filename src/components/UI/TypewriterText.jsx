import { useState, useEffect, useRef, useCallback } from 'react';

export default function TypewriterText({
  text,
  speed = 100,
  delay = 0,
  className = '',
  showCursor = true,
  onComplete = null,
  loop = false,
  pauseBetweenLoops = 2000,
}) {
  const [displayedText, setDisplayedText] = useState('');
  const timeoutRef = useRef(null);

  const startTyping = useCallback(() => {
    if (!text) return;

    setDisplayedText('');

    const typeCharacter = (index = 0) => {
      if (index >= text.length) {
        // Completed typing
        if (onComplete) onComplete();

        // If looping, restart after pause
        if (loop) {
          timeoutRef.current = setTimeout(() => {
            startTyping();
          }, pauseBetweenLoops);
        }
        return;
      }

      // Type next character
      setDisplayedText(text.substring(0, index + 1));

      timeoutRef.current = setTimeout(
        () => {
          typeCharacter(index + 1);
        },
        index === 0 ? delay : speed,
      );
    };

    typeCharacter();
  }, [text, speed, delay, onComplete, loop, pauseBetweenLoops]);
  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  // Start typing when text changes
  useEffect(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    startTyping();
  }, [text, startTyping]);

  return (
    <span className={className}>
      {displayedText}
      {showCursor && <span>|</span>}
    </span>
  );
}
