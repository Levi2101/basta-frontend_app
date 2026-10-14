import React from 'react';
import { LogOut, Code, Gamepad2 } from 'lucide-react';

export function Header({ onOpenBlueprint, onCerrarSesion, enPartida, nombreJugador }) {
  return (
    <header className="bg-slate-900/80 border-b border-slate-800 backdrop-blur sticky top-0 z-40 px-4 py-3">
      <div className="max-w-4xl mx-auto flex items-center justify-between">
        {/* LOGO */}
        <div className="flex items-center gap-2">
          <div className="bg-gradient-to-tr from-amber-500 to-orange-500 p-2 rounded-xl text-slate-950 font-black flex items-center justify-center">
            <Gamepad2 size={22} />
          </div>
          <span className="font-extrabold text-lg text-white tracking-tight">¡Basta! </span>
        </div>

        {/* BOTONES DE ACCIÓN */}
        <div className="flex items-center gap-3">
          

          {enPartida && (
            <button
              type="button"
              onClick={(e) => {
                e.preventDefault();
                if (window.confirm('¿Estás seguro de que deseas salir de la partida?')) {
                  onCerrarSesion();
                }
              }}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-red-950/60 hover:bg-red-900/80 text-red-300 text-xs font-semibold border border-red-800/80 transition cursor-pointer"
              title={`Cerrar sesión de ${nombreJugador}`}
            >
              <LogOut size={14} />
              <span>Salir</span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
}