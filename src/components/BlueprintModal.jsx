import React from 'react';

export function BlueprintModal({ visible, onClose }) {
  if (!visible) return null;

  return (
    <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4 z-50">
      <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-2xl w-full p-6 space-y-4 max-h-[85vh] overflow-y-auto">
        <div className="flex justify-between items-center border-b border-slate-800 pb-3">
          <h3 className="text-lg font-bold text-amber-400 font-mono">Backend Architecture (Node.js + Socket.io)</h3>
          <button onClick={onClose} className="text-slate-400 hover:text-white">✕</button>
        </div>
        
        <p className="text-xs text-slate-300">
          Eventos Socket.io sugeridos para sincronización multi-dispositivo en tiempo real:
        </p>

        <pre className="bg-slate-950 p-4 rounded-xl text-xs font-mono text-green-400 border border-slate-800 overflow-x-auto">
{`io.on('connection', (socket) => {
  socket.on('unirse_sala', ({ roomCode, user }) => { ... });

  socket.on('alerta_trampa', ({ roomCode }) => {
    io.to(roomCode).emit('jugador_hizo_trampa', { socketId: socket.id });
  });

  socket.on('gritar_basta', ({ roomCode }) => {
    io.to(roomCode).emit('basta_activado', { iniciador: socket.id });
  });
});`}
        </pre>
      </div>
    </div>
  );
}