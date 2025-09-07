import { useEffect, useRef } from 'react';
import { Vibration } from 'react-native';

export const useOverdueAlert = () => {
  const hasPlayedRef = useRef<boolean>(false);

  const playOverdueAlert = () => {
    if (!hasPlayedRef.current) {
      // Patrón de vibración que simula un pitido de alerta
      // Vibración más intensa y rápida para llamar la atención
      // Patrón: 6 vibraciones cortas y rápidas
      Vibration.vibrate([0, 100, 50, 100, 50, 100, 50, 100, 50, 100, 50, 100]);
      
      console.log('🔔 Alerta de atraso: Tarea se ha vuelto negativa!');
      hasPlayedRef.current = true;
    }
  };

  const resetAlert = () => {
    hasPlayedRef.current = false;
  };

  return { playOverdueAlert, resetAlert };
};
