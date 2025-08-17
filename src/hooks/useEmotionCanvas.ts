import { useState, useCallback, useRef } from 'react';
import type { StyleProfile } from '@/hooks/useAnalyzeStyle';

interface UseEmotionCanvasOptions {
  enableCache?: boolean;
  enableOptimization?: boolean;
  debounceMs?: number;
}

export function useEmotionCanvas(options: UseEmotionCanvasOptions = {}) {
  const {
    enableCache = true,
    enableOptimization = true,
    debounceMs = 100
  } = options;

  const [isRendering, setIsRendering] = useState(false);
  const [renderError, setRenderError] = useState<Error | null>(null);
  const [lastRenderTime, setLastRenderTime] = useState<number>(0);
  const renderCountRef = useRef(0);

  const handleRenderComplete = useCallback((canvas: HTMLCanvasElement) => {
    setIsRendering(false);
    setRenderError(null);
    const currentTime = Date.now();
    setLastRenderTime(currentTime);
    renderCountRef.current++;
    
    console.log(`✅ Render #${renderCountRef.current} completed in ${currentTime - lastRenderTime}ms`);
  }, [lastRenderTime]);

  const handleRenderError = useCallback((error: Error) => {
    setIsRendering(false);
    setRenderError(error);
    console.error('❌ Render error:', error);
  }, []);

  const resetError = useCallback(() => {
    setRenderError(null);
  }, []);

  const startRendering = useCallback(() => {
    setIsRendering(true);
    setRenderError(null);
  }, []);

  return {
    isRendering,
    renderError,
    lastRenderTime,
    renderCount: renderCountRef.current,
    handleRenderComplete,
    handleRenderError,
    resetError,
    startRendering
  };
}
