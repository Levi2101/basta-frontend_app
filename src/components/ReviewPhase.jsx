import React from 'react';
import { Check, X, ShieldAlert, CheckCircle2 } from 'lucide-react';

export function ReviewPhase({
  letraActual = '',
  categorias = [],
  jugadores = [],
  palabrasInvalidas = {},
  confirmados = [],
  socketId = '',
  onTogglePalabra = () => { },
  onConfirmar = () => { }
}) {
  const listaConfirmados = Array.isArray(confirmados) ? confirmados : [];
  const yaConfirmo = listaConfirmados.includes(socketId);

  const safeJugadores = Array.isArray(jugadores) ? jugadores : [];
  const safeCategorias = Array.isArray(categorias) ? categorias : [];
  const safeInvalidas = palabrasInvalidas || {};

  return (
    <div className="space-y-6">
      {/* Encabezado */}
      <div className="bg-slate-800/80 border border-slate-700 rounded-2xl p-6 text-center shadow-xl space-y-2">
        <h2 className="text-2xl md:text-3xl font-extrabold text-white">
          Revisión de la Ronda (Letra <span className="text-amber-400">{letraActual}</span>)
        </h2>
        <p className="text-xs md:text-sm text-slate-400">
          Revisa las palabras de los demás. Haz clic en el botón para anular/validar.{' '}
          <strong className="text-slate-200">No puedes modificar tus propias respuestas.</strong>
        </p>
      </div>

      {/* Tabla de Palabras */}
      <div className="bg-slate-800/50 border border-slate-700 rounded-2xl p-4 shadow-xl overflow-x-auto">
        <table className="w-full text-left border-collapse min-w-[650px]">
          <thead>
            <tr className="border-b border-slate-700 text-xs font-bold text-slate-400 uppercase tracking-wider">
              <th className="pb-3 px-2">Jugador</th>
              {safeCategorias.map((cat, idx) => (
                <th key={idx} className="pb-3 px-2 text-center">{cat}</th>
              ))}
              <th className="pb-3 px-2 text-center">Strikes</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-700/50 text-sm">
            {safeJugadores.map((jugador) => {
              if (!jugador) return null;
              const esMiFila = jugador.id === socketId;
              const nombreJugador = jugador.nombre || 'Jugador';
              const totalStrikes = Number(jugador.strikes) || 0;

              return (
                <tr key={jugador.id || Math.random()} className={esMiFila ? 'bg-amber-500/5 font-medium' : ''}>
                  {/* Nombre Jugador */}
                  <td className="py-4 px-2 font-bold text-amber-400 whitespace-nowrap">
                    {nombreJugador} {esMiFila && <span className="text-xs text-amber-300/80 font-normal">(Tú)</span>}
                  </td>

                  {/* Respuestas por categoría */}
                  {safeCategorias.map((cat, idx) => {
                    const respuestasObj = jugador.respuestas || {};
                    const respuesta = respuestasObj[cat] || '';

                    const nombreClean = nombreJugador.trim().toLowerCase();
                    const keyNombre = `${nombreClean}-${cat}`;
                    const keyId = `${jugador.id}-${cat}`;

                    // Condición blindada: Si el jugador tiene strikes > 0, SE ANULA AUTOMÁTICAMENTE EN ROJO
                    const estaInvalida = Boolean(
                      safeInvalidas[keyNombre] ||
                      safeInvalidas[keyId]
                    );
                    const estaVacia = !String(respuesta).trim();

                    return (
                      <td key={idx} className="py-3 px-2 text-center">
                        <div className="inline-flex items-center justify-center">
                          {estaVacia ? (
                            <span className="text-slate-600 italic text-xs px-3 py-1 bg-slate-900/60 rounded-lg border border-slate-800">
                              vacío
                            </span>
                          ) : (
                            <button
                              type="button"
                              onClick={() => {
                                if (!esMiFila) {
                                  onTogglePalabra(jugador.id, cat);
                                }
                              }}
                              className={`flex items-center gap-2 px-3 py-1.5 rounded-xl border text-xs font-mono font-bold transition shadow-sm ${esMiFila
                                  ? 'cursor-not-allowed opacity-80'
                                  : 'cursor-pointer hover:scale-105 active:scale-95'
                                } ${estaInvalida
                                  ? 'bg-red-950/80 border-red-600 text-red-200'
                                  : 'bg-slate-900 border-slate-700 text-slate-200 hover:border-amber-500'
                                }`}
                              title={esMiFila ? "No puedes votar tus propias palabras" : "Haz clic para cambiar estado"}
                            >
                              <span className="capitalize">{respuesta}</span>
                              {estaInvalida ? (
                                <X size={14} className="text-red-400 shrink-0" />
                              ) : (
                                <Check size={14} className="text-emerald-400 shrink-0" />
                              )}
                            </button>
                          )}
                        </div>
                      </td>
                    );
                  })}

                  {/* Strikes */}
                  <td className="py-3 px-2 text-center">
                    <span className={`inline-flex items-center gap-1 text-xs font-bold px-2.5 py-1 rounded-lg ${totalStrikes > 0 ? 'bg-red-500/10 text-red-400 border border-red-500/20' : 'text-slate-500'
                      }`}>
                      {totalStrikes > 0 && <ShieldAlert size={12} />}
                      {totalStrikes}
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Banner de Conformidad */}
      <div className="bg-slate-800/80 border border-slate-700 rounded-2xl p-4 flex flex-col md:flex-row items-center justify-between gap-4 shadow-xl">
        <div className="text-sm font-semibold text-slate-300 flex items-center gap-2">
          <CheckCircle2 className="text-amber-400" size={18} />
          <span>
            Conformidad de la sala:{' '}
            <strong className="text-amber-400">{listaConfirmados.length}</strong> de{' '}
            <strong className="text-white">{safeJugadores.length}</strong> jugadores listos.
          </span>
        </div>

        <button
          type="button"
          disabled={yaConfirmo}
          onClick={onConfirmar}
          className={`w-full md:w-auto px-6 py-3.5 rounded-xl font-extrabold text-sm transition shadow-lg flex items-center justify-center gap-2 ${yaConfirmo
              ? 'bg-emerald-600/30 text-emerald-300 border border-emerald-500/40 cursor-default'
              : 'bg-amber-500 hover:bg-amber-600 text-slate-950 cursor-pointer hover:scale-105 active:scale-95'
            }`}
        >
          {yaConfirmo ? '✓ Esperando a los demás...' : 'Estoy de acuerdo con los puntos'}
        </button>
      </div>
    </div>
  );
}