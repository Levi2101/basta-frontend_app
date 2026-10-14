import React from 'react';
import { ShieldAlert } from 'lucide-react';

export function AntiCheatAlert({ visible, strikes }) {
  if (!visible) return null;

  return (
    <div className="bg-red-500/20 border-b border-red-500/50 px-4 py-2 text-red-200 text-sm flex items-center justify-center gap-2 animate-pulse">
      <ShieldAlert size={16} />
      <span>
        <b>¡Advertencia Anti-Trampas!</b> Saliste de la pantalla ({strikes} strike/s). Tu respuesta se congelará al salir.
      </span>
    </div>
  );
}