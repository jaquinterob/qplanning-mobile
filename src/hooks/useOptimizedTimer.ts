import { useState, useEffect, useCallback, useRef } from 'react';
import { Task } from '../types/Task';

interface UseOptimizedTimerProps {
  task: Task;
  onOverdue?: () => void;
}

export const useOptimizedTimer = ({ task, onOverdue }: UseOptimizedTimerProps) => {
  const [timeRemaining, setTimeRemaining] = useState<number>(0);
  const [isTimerActive, setIsTimerActive] = useState(false);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const lastUpdateRef = useRef<number>(0);

  const calculateTimeRemaining = useCallback(() => {
    if (!task.timerStarted || !task.estimatedCompletionTime) {
      return { remaining: 0, isActive: false };
    }

    if (task.timerPaused) {
      const estimatedMs = task.estimatedCompletionTime * 60 * 1000;
      const remaining = estimatedMs - (task.elapsedTime || 0);
      return { remaining, isActive: remaining > 0 };
    }

    if (task.timerStartTime) {
      const currentTime = Date.now();
      const sessionElapsed = currentTime - task.timerStartTime;
      const totalElapsed = (task.elapsedTime || 0) + sessionElapsed;
      const estimatedMs = task.estimatedCompletionTime * 60 * 1000;
      const remaining = estimatedMs - totalElapsed;
      return { remaining, isActive: remaining > 0 };
    }

    return { remaining: 0, isActive: false };
  }, [task.timerStarted, task.timerPaused, task.timerStartTime, task.elapsedTime, task.estimatedCompletionTime]);

  const updateTimer = useCallback(() => {
    const { remaining, isActive } = calculateTimeRemaining();
    
    setTimeRemaining(remaining);
    setIsTimerActive(isActive);
    
    // Solo llamar onOverdue cuando cambia de positivo a negativo
    if (remaining < 0 && isActive && onOverdue) {
      onOverdue();
    }
  }, [calculateTimeRemaining, onOverdue]);

  useEffect(() => {
    // Limpiar intervalo anterior
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }

    if (task.timerStarted && !task.timerPaused && task.estimatedCompletionTime) {
      // Actualizar inmediatamente
      updateTimer();
      
      // Configurar intervalo optimizado
      intervalRef.current = setInterval(() => {
        const now = Date.now();
        // Solo actualizar si han pasado al menos 1.5 segundos
        if (now - lastUpdateRef.current >= 1500) {
          updateTimer();
          lastUpdateRef.current = now;
        }
      }, 1000); // Verificar cada segundo pero actualizar solo cuando sea necesario
    } else {
      // Para tareas pausadas o sin timer, calcular una sola vez
      updateTimer();
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [task.timerStarted, task.timerPaused, task.estimatedCompletionTime, updateTimer]);

  return {
    timeRemaining,
    isTimerActive,
  };
};
