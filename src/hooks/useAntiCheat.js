import { useState, useEffect } from 'react';

export function useAntiCheat(faseJuego, onTrampaDetectada) {
  const [trampasDetectadas, setTrampasDetectadas] = useState(0);
  const [alertaTrampa, setAlertaTrampa] = useState(false);

  useEffect(() => {
    if (faseJuego !== 'jugando') return;

    const manejarCambioVisibilidad = () => {
      if (document.hidden) {
        setTrampasDetectadas((prev) => {
          const nuevoTotal = prev + 1;
          setAlertaTrampa(true);
          if (onTrampaDetectada) onTrampaDetectada(nuevoTotal);
          return nuevoTotal;
        });
      }
    };

    const manejarBlur = () => {
      if (faseJuego === 'jugando' && !document.hidden) {
        setTrampasDetectadas((prev) => {
          const nuevoTotal = prev + 1;
          setAlertaTrampa(true);
          return nuevoTotal;
        });
      }
    };

    document.addEventListener('visibilitychange', manejarCambioVisibilidad);
    window.addEventListener('blur', manejarBlur);

    return () => {
      document.removeEventListener('visibilitychange', manejarCambioVisibilidad);
      window.removeEventListener('blur', manejarBlur);
    };
  }, [faseJuego, onTrampaDetectada]);

  const limpiarTrampas = () => {
    setTrampasDetectadas(0);
    setAlertaTrampa(false);
  };

  return { trampasDetectadas, alertaTrampa, limpiarTrampas };
}