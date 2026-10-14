import React, { useState } from 'react';
import { Play, Plus, Trash2, Users, Tag } from 'lucide-react';

export function LobbyPhase({ 
  nombreJugador, setNombreJugador, 
  duracionRonda, setDuracionRonda, 
  categorias, setCategorias, 
  onCrearSala, onUnirseSala, 
  codigoSala, setCodigoSala, sala 
}) {
  const [modo, setModo] = useState('crear');
  const [nuevaCategoria, setNuevaCategoria] = useState('');

  const agregarCategoria = (e) => {
    e.preventDefault();
    const catLimpia = nuevaCategoria.trim();
    if (catLimpia && !categorias.includes(catLimpia)) {
      setCategorias([...categorias, catLimpia]);
      setNuevaCategoria('');
    }
  };

  const eliminarCategoria = (catAEliminar) => {
    if (categorias.length <= 1) {
      alert('Debe haber al menos una categoría para jugar.');
      return;
    }
    setCategorias(categorias.filter(cat => cat !== catAEliminar));
  };

  return (
    <div className="bg-slate-800/60 border border-slate-700 rounded-2xl p-6 md:p-8 backdrop-blur shadow-2xl space-y-6">
      {/* Pestañas Crear / Unirse */}
      <div className="flex gap-4 justify-center border-b border-slate-700 pb-4">
        <button 
          type="button"
          onClick={() => setModo('crear')}
          className={`px-4 py-2 rounded-xl text-sm font-bold transition cursor-pointer ${
            modo === 'crear' ? 'bg-amber-500 text-slate-950' : 'bg-slate-900 text-slate-400 hover:text-slate-200'
          }`}
        >
          Crear Sala
        </button>
        <button 
          type="button"
          onClick={() => setModo('unirse')}
          className={`px-4 py-2 rounded-xl text-sm font-bold transition cursor-pointer ${
            modo === 'unirse' ? 'bg-amber-500 text-slate-950' : 'bg-slate-900 text-slate-400 hover:text-slate-200'
          }`}
        >
          Unirse con Código
        </button>
      </div>

      <div className="space-y-5">
        {/* Input Nombre */}
        <div>
          <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
            Tu Apodo
          </label>
          <input 
            type="text" 
            value={nombreJugador}
            onChange={e => setNombreJugador(e.target.value)}
            placeholder="Escribe tu nombre..."
            className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-amber-500"
          />
        </div>

        {modo === 'unirse' ? (
          <div>
            <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
              Código de Sala (4 Letras)
            </label>
            <input 
              type="text" 
              maxLength={4}
              value={codigoSala}
              onChange={e => setCodigoSala(e.target.value.toUpperCase())}
              placeholder="Ej. BAST"
              className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 text-white text-center text-2xl font-mono tracking-widest focus:outline-none focus:border-amber-500"
            />
            <button 
              type="button"
              onClick={onUnirseSala}
              className="w-full mt-4 bg-amber-500 hover:bg-amber-600 text-slate-950 font-extrabold py-3.5 rounded-xl transition cursor-pointer"
            >
              Entrar a la Sala
            </button>
          </div>
        ) : (
          <div className="space-y-5">
            {/* Tiempo por ronda */}
            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                Tiempo por Ronda
              </label>
              <select 
                value={duracionRonda}
                onChange={e => setDuracionRonda(Number(e.target.value))}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-amber-500"
              >
                <option value={45}>45 Segundos</option>
                <option value={60}>60 Segundos</option>
                <option value={90}>90 Segundos</option>
              </select>
            </div>

            {/* Gestión de Categorías */}
            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <Tag size={14} className="text-amber-500" /> Categorías de la Partida ({categorias.length})
              </label>

              {/* Formulario para agregar nueva categoría */}
              <form onSubmit={agregarCategoria} className="flex gap-2 mb-3">
                <input 
                  type="text"
                  value={nuevaCategoria}
                  onChange={e => setNuevaCategoria(e.target.value)}
                  placeholder="Agregar categoría extra (ej. MARCA)..."
                  className="flex-1 bg-slate-900 border border-slate-700 rounded-xl px-4 py-2 text-sm text-white focus:outline-none focus:border-amber-500"
                />
                <button 
                  type="submit"
                  className="bg-amber-500 hover:bg-amber-600 text-slate-950 px-4 py-2 rounded-xl font-bold flex items-center gap-1 text-sm transition cursor-pointer"
                >
                  <Plus size={16} /> Agregar
                </button>
              </form>

              {/* Chips de Categorías */}
              <div className="flex flex-wrap gap-2 max-h-36 overflow-y-auto p-1 border border-slate-700/50 rounded-xl bg-slate-900/40">
                {categorias.map((cat, index) => (
                  <span 
                    key={index} 
                    className="inline-flex items-center gap-1.5 bg-slate-900 text-amber-300 border border-amber-500/30 px-3 py-1 rounded-lg text-xs font-semibold shadow-sm"
                  >
                    {cat}
                    <button 
                      type="button"
                      onClick={() => eliminarCategoria(cat)}
                      className="text-slate-400 hover:text-red-400 transition cursor-pointer p-0.5 rounded"
                      title="Eliminar categoría"
                    >
                      ✕
                    </button>
                  </span>
                ))}
              </div>
            </div>

            {/* Botón Crear Sala */}
            <button 
              type="button"
              onClick={() => {
                console.log('Botón presionado');
                onCrearSala();
              }}
              className="w-full bg-gradient-to-r from-amber-500 to-orange-500 text-slate-950 font-extrabold py-4 rounded-xl shadow-lg transition flex items-center justify-center gap-2 text-lg cursor-pointer hover:brightness-110"
            >
              <Play size={22} fill="currentColor" /> Crear Sala Multijugador
            </button>
          </div>
        )}
      </div>

      {/* Información de Sala Activa */}
      {sala && (
        <div className="bg-slate-900 p-4 rounded-xl border border-slate-700 space-y-3">
          <div className="flex justify-between items-center">
            <span className="text-xs text-slate-400 uppercase font-semibold">Código de la Sala:</span>
            <span className="text-2xl font-mono font-bold text-amber-400 tracking-widest">{sala.codigo}</span>
          </div>
          <div className="space-y-1">
            <span className="text-xs text-slate-400 block mb-1">Jugadores listos ({sala.jugadores.length}):</span>
            {sala.jugadores.map(j => (
              <div key={j.id} className="text-sm font-semibold text-slate-200 flex items-center gap-2">
                <Users size={14} className="text-amber-500" /> {j.nombre}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}