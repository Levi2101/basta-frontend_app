import React from 'react';
import { Timer, Volume2, AlertTriangle, ShieldAlert } from 'lucide-react';

export function PlayingPhase({ 
  letraActual, 
  tiempoRestante, 
  categorias, 
  respuestas, 
  setRespuestas, 
  onFinalizarRonda,
  conteoBasta,
  iniciadorBasta,
  bloqueadoPorTrampa = false
}) {
  const categoriasCompletas = categorias.every(
    cat => respuestas[cat] && respuestas[cat].trim().length > 0
  );

  return (
    <div className="space-y-6">
      {/* Banner informativo de trampa detectada (sin bloquear la escritura) */}
      {bloqueadoPorTrampa && (
        <div className="bg-red-950/90 text-red-200 font-bold text-center py-3 px-4 rounded-xl shadow-lg border border-red-600 flex items-center justify-center gap-2 text-sm md:text-base animate-pulse">
          <ShieldAlert size={20} className="text-red-400 shrink-0" />
          <span>⚠️ Detectamos que saliste de la pantalla. Tus respuestas se marcarán automáticamente en ROJO en la revisión. ⚠️</span>
        </div>
      )}

      {/* Banner de Advertencia de ¡BASTA! */}
      {conteoBasta !== null && conteoBasta !== undefined && (
        <div className="bg-amber-500 text-slate-950 font-extrabold text-center py-3 px-4 rounded-xl shadow-lg border border-amber-300 animate-pulse flex items-center justify-center gap-2 text-sm md:text-base">
          <AlertTriangle size={22} className="shrink-0" />
          <span>⚠️ ¡{iniciadorBasta || 'Alguien'} dijo BASTA! Tienes {conteoBasta} segundos para terminar tus palabras ⚠️</span>
        </div>
      )}

      {/* Encabezado */}
      <div className="bg-slate-800 border border-slate-700 rounded-2xl p-4 flex justify-between items-center shadow-xl">
        <div className="flex items-center gap-4">
          <div className="bg-amber-500/10 border border-amber-500/30 px-4 py-2 rounded-xl text-center">
            <span className="text-xs text-amber-400 block font-semibold uppercase">Letra</span>
            <span className="text-3xl font-black text-amber-400">{letraActual}</span>
          </div>
        </div>

        <div className="flex items-center gap-2 text-slate-300 font-mono text-xl bg-slate-900 px-4 py-2 rounded-xl border border-slate-700">
          <Timer className={conteoBasta !== null ? "text-red-400 animate-bounce" : "text-amber-400"} size={20} />
          <span className={conteoBasta !== null ? "text-red-400 font-bold" : ""}>
            {conteoBasta !== null ? `${conteoBasta}s` : `${tiempoRestante}s`}
          </span>
        </div>
      </div>

      {/* Inputs de Categorías (Permiten seguir escribiendo libremente) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {categorias.map((cat, idx) => (
          <div key={idx} className="bg-slate-800/40 border border-slate-700/80 rounded-xl p-3 space-y-1 focus-within:border-amber-500/80 transition">
            <label className="text-xs text-amber-400/90 font-medium">{cat}</label>
            <input 
              type="text"
              value={respuestas[cat] || ''}
              onChange={e => setRespuestas({ ...respuestas, [cat]: e.target.value })}
              placeholder={`Escribe ${cat.toLowerCase()} con ${letraActual}...`}
              disabled={conteoBasta === 0}
              className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-amber-500 transition capitalize disabled:opacity-50"
            />
          </div>
        ))}
      </div>

      {/* Botón Principal ¡BASTA! */}
      <button 
        type="button"
        disabled={!categoriasCompletas || conteoBasta !== null}
        onClick={onFinalizarRonda}
        className={`w-full font-black py-5 rounded-2xl shadow-xl transition text-2xl tracking-widest uppercase flex items-center justify-center gap-3 ${
          !categoriasCompletas || conteoBasta !== null
            ? 'bg-slate-800 text-slate-500 border border-slate-700 cursor-not-allowed opacity-60 shadow-none'
            : 'bg-red-600 hover:bg-red-500 text-white shadow-red-950/40 border-b-4 border-red-800 active:border-b-0 active:translate-y-1 cursor-pointer'
        }`}
      >
        <Volume2 size={28} /> {conteoBasta !== null ? `¡CONTEO EN MARCHA (${conteoBasta}s)!` : '¡BASTA!'}
      </button>
    </div>
  );
}