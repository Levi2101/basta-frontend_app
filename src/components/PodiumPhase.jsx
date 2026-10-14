import React from 'react';
import { Award, RefreshCw } from 'lucide-react';

export function PodiumPhase({ jugadores, onSiguienteRonda }) {
  const ranking = [...jugadores].sort((a, b) => b.puntos - a.puntos);

  return (
    <div className="bg-slate-800/80 border border-slate-700 rounded-2xl p-6 text-center space-y-6">
      <Award className="mx-auto text-amber-400" size={48} />
      <h2 className="text-3xl font-extrabold">Tabla de Posiciones</h2>

      <div className="space-y-3">
        {ranking.map((j, idx) => (
          <div key={j.id} className="bg-slate-900 border border-slate-700 p-4 rounded-xl flex justify-between items-center">
            <div className="flex items-center gap-3">
              <span className="font-bold text-lg text-slate-500">#{idx + 1}</span>
              <span className="font-semibold text-white">{j.nombre}</span>
            </div>
            <span className="font-mono text-xl text-amber-400 font-bold">{j.puntos} pts</span>
          </div>
        ))}
      </div>

      <button 
        onClick={onSiguienteRonda}
        className="bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold px-6 py-3 rounded-xl transition flex items-center justify-center gap-2 mx-auto"
      >
        <RefreshCw size={18} /> Siguiente Ronda
      </button>
    </div>
  );
}