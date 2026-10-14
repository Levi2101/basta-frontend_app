import React, { useState, useEffect, useCallback, useRef } from 'react';
import { CATEGORIAS_DEFECTO } from './constants/gameDefaults';
import { socket } from './services/socketService';
import { useAntiCheat } from './hooks/useAntiCheat';
import { Header } from './components/Header';
import { AntiCheatAlert } from './components/AntiCheatAlert';
import { LobbyPhase } from './components/LobbyPhase';
import { PlayingPhase } from './components/PlayingPhase';
import { ReviewPhase } from './components/ReviewPhase';
import { PodiumPhase } from './components/PodiumPhase';
import { BlueprintModal } from './components/BlueprintModal';

export default function App() {
  // Configuración de Jugador y Sala
  const [nombreJugador, setNombreJugador] = useState('');
  const [codigoSala, setCodigoSala] = useState('');
  const [sala, setSala] = useState(null);

  // Estados para el conteo regresivo de ¡BASTA! (10s)
  const [conteoBasta, setConteoBasta] = useState(null);
  const [iniciadorBasta, setIniciadorBasta] = useState('');

  // Referencia mutable para el nombre del jugador
  const nombreRef = useRef(nombreJugador);
  useEffect(() => {
    nombreRef.current = nombreJugador;
  }, [nombreJugador]);

  // Ajustes de Partida
  const [categorias, setCategorias] = useState(CATEGORIAS_DEFECTO);
  const [duracionRonda, setDuracionRonda] = useState(60);
  const [faseJuego, setFaseJuego] = useState('lobby'); // 'lobby' | 'jugando' | 'revision' | 'podio'
  const [letraActual, setLetraActual] = useState('');
  const [tiempoRestante, setTiempoRestante] = useState(60);
  const [respuestas, setRespuestas] = useState({});
  const [mostrarBlueprint, setMostrarBlueprint] = useState(false);
  const [palabrasInvalidas, setPalabrasInvalidas] = useState({});
  const [confirmadosRevision, setConfirmadosRevision] = useState([]);

  // Guardar respuestas locales en tiempo real
  useEffect(() => {
    if (sala && faseJuego === 'jugando') {
      localStorage.setItem('basta_respuestas_locales', JSON.stringify(respuestas));
    }
  }, [respuestas, sala, faseJuego]);

  // Manejador de Trampa (Tab-Switching)
  const manejarTrampa = useCallback(() => {
    if (sala && faseJuego === 'jugando') {
      socket.emit('registrar_trampa', { codigo: sala.codigo, respuestas });
    }
  }, [sala, faseJuego, respuestas]);

  const { trampasDetectadas, alertaTrampa, limpiarTrampas } = useAntiCheat(faseJuego, manejarTrampa);

  // Guardar sesión en localStorage
  const guardarSesionLocal = (codigo, nombre) => {
    if (!nombre) return;
    localStorage.setItem('basta_sesion', JSON.stringify({
      codigo,
      nombre,
      socketId: socket.id
    }));
  };

  // Cerrar sesión
  const cerrarSesion = () => {
    localStorage.removeItem('basta_sesion');
    localStorage.removeItem('basta_respuestas_locales');

    if (sala) {
      socket.emit('salir_sala', { codigo: sala.codigo });
    }

    socket.disconnect();
    window.location.reload();
  };

  // Escuchadores de Socket.io y Reconexión Automática
  useEffect(() => {
    const sesionGuardada = localStorage.getItem('basta_sesion');
    if (sesionGuardada) {
      try {
        const { codigo, nombre, socketId } = JSON.parse(sesionGuardada);
        if (codigo && nombre) {
          setNombreJugador(nombre);
          setCodigoSala(codigo);
          
          if (!socket.connected) {
            socket.connect();
          }
          socket.emit('reconectar_jugador', { codigo, nombre, socketIdAnterior: socketId });
        }
      } catch (err) {
        console.error('Error al parsear sesión local:', err);
      }
    }

    socket.on('sala_creada', ({ codigo, sala }) => {
      setCodigoSala(codigo);
      setSala(sala);
      guardarSesionLocal(codigo, nombreRef.current);
    });

    socket.on('actualizar_sala', (nuevaSala) => {
      setSala(nuevaSala);
      if (nuevaSala.estado) {
        setFaseJuego(nuevaSala.estado);
      }
    });

    socket.on('ronda_iniciada', ({ letraActual, duracionRonda, sala }) => {
      setLetraActual(letraActual);
      setTiempoRestante(duracionRonda);
      setSala(sala);
      setRespuestas({});
      setPalabrasInvalidas({});
      setConfirmadosRevision([]);
      setConteoBasta(null);
      setIniciadorBasta('');
      localStorage.removeItem('basta_respuestas_locales');
      limpiarTrampas();
      setFaseJuego('jugando');
    });

    // Escuchar el tiempo de la ronda principal emitido por el servidor
    socket.on('tiempo_ronda_tick', ({ tiempoRestante }) => {
      setTiempoRestante(tiempoRestante);
    });

    socket.on('basta_gritado', ({ iniciador, conteoBasta, sala }) => {
      setSala(sala);
      setIniciadorBasta(iniciador);
      setConteoBasta(conteoBasta);
    });

    socket.on('conteo_basta_tick', ({ tiempoRestante }) => {
      setConteoBasta(tiempoRestante);
    });

    socket.on('ir_a_revision', ({ sala }) => {
      setSala(sala);
      setConteoBasta(null);
      setIniciadorBasta('');
      setFaseJuego('revision');
    });

    socket.on('revision_actualizada', ({ palabrasInvalidas, confirmadosRevision }) => {
      // Clona el objeto para forzar la actualización de React
      setPalabrasInvalidas({ ...(palabrasInvalidas || {}) });
      setConfirmadosRevision([...(confirmadosRevision || [])]);
    });

    socket.on('resultados_calculados', (salaActualizada) => {
      setSala(salaActualizada);
      setFaseJuego('podio');
    });

    socket.on('reconexion_exitosa', ({ codigo, sala }) => {
      setSala(sala);
      setCodigoSala(codigo);

      setFaseJuego(sala.estado || 'lobby');
      setLetraActual(sala.letraActual || '');

      const respGuardadas = localStorage.getItem('basta_respuestas_locales');
      if (respGuardadas) {
        try {
          setRespuestas(JSON.parse(respGuardadas));
        } catch (e) {
          console.error('Error recuperando respuestas guardadas', e);
        }
      }

      const miJugador = sala.jugadores.find(j => j.id === socket.id);
      const nombreFinal = miJugador ? miJugador.nombre : nombreRef.current;
      guardarSesionLocal(codigo, nombreFinal);
    });

    socket.on('error_reconexion', (msg) => {
      localStorage.removeItem('basta_sesion');
      localStorage.removeItem('basta_respuestas_locales');
      setFaseJuego('lobby');
      setSala(null);
    });

    

    socket.on('error_sala', (msg) => alert(msg));

    return () => {
      socket.off('sala_creada');
      socket.off('actualizar_sala');
      socket.off('ronda_iniciada');
      socket.off('tiempo_ronda_tick');
      socket.off('basta_gritado');
      socket.off('conteo_basta_tick');
      socket.off('ir_a_revision');
      socket.off('revision_actualizada');
      socket.off('resultados_calculados');
      socket.off('reconexion_exitosa');
      socket.off('error_reconexion');
      socket.off('error_sala');
    };
  }, [limpiarTrampas]);

  const crearSala = () => {
    if (!nombreJugador.trim()) {
      alert('Ingresa tu nombre');
      return;
    }
    socket.emit('crear_sala', { nombre: nombreJugador, categorias, duracionRonda });
  };

  const unirseSala = () => {
    if (!nombreJugador.trim() || !codigoSala.trim()) {
      alert('Ingresa tu nombre y el código de sala');
      return;
    }
    guardarSesionLocal(codigoSala.toUpperCase(), nombreJugador);
    socket.emit('unirse_sala', { codigo: codigoSala, nombre: nombreJugador });
  };

  const iniciarRonda = () => {
    if (sala) socket.emit('iniciar_ronda', { codigo: sala.codigo });
  };

  const gritarBasta = () => {
    if (sala) socket.emit('gritar_basta', { codigo: sala.codigo, respuestas });
  };

  const togglePalabra = (jugadorId, categoria) => {
    if (sala) {
      socket.emit('toggle_palabra_invalida', {
        codigo: sala.codigo,
        jugadorId,
        categoria
      });
    }
  };

  const confirmarRevision = () => {
    if (sala) {
      socket.emit('confirmar_revision', { codigo: sala.codigo });
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 flex flex-col font-sans">
      <Header 
        onOpenBlueprint={() => setMostrarBlueprint(true)} 
        onCerrarSesion={cerrarSesion}
        enPartida={Boolean(sala)}
        nombreJugador={nombreJugador}
      />
      <AntiCheatAlert visible={alertaTrampa} strikes={trampasDetectadas} />

      <main className="flex-1 max-w-4xl w-full mx-auto p-4 md:p-6 flex flex-col justify-center">
        {faseJuego === 'lobby' && (
          <div className="space-y-4">
            <LobbyPhase
              nombreJugador={nombreJugador} setNombreJugador={setNombreJugador}
              duracionRonda={duracionRonda} setDuracionRonda={setDuracionRonda}
              categorias={categorias} setCategorias={setCategorias}
              onCrearSala={crearSala} onUnirseSala={unirseSala}
              codigoSala={codigoSala} setCodigoSala={setCodigoSala}
              sala={sala}
            />

            {sala && sala.anfitrion === socket.id && (
              <button
                type="button"
                onClick={iniciarRonda}
                className="w-full bg-amber-500 hover:bg-amber-600 text-slate-950 font-extrabold py-4 rounded-xl text-lg shadow-xl transition cursor-pointer"
              >
                ¡Iniciar Partida para Todos!
              </button>
            )}
          </div>
        )}

        {faseJuego === 'jugando' && (
          <PlayingPhase
            letraActual={letraActual}
            tiempoRestante={tiempoRestante}
            setTiempoRestante={setTiempoRestante}
            categorias={sala ? sala.categorias : categorias}
            respuestas={respuestas}
            setRespuestas={setRespuestas}
            onFinalizarRonda={gritarBasta}
            conteoBasta={conteoBasta}
            iniciadorBasta={iniciadorBasta}
          />
        )}

        {(faseJuego === 'revision' || faseJuego === 'revisión') && (
          <ReviewPhase
            letraActual={letraActual}
            categorias={sala ? sala.categorias : categorias}
            jugadores={sala ? sala.jugadores : []}
            palabrasInvalidas={palabrasInvalidas}
            confirmados={confirmadosRevision}
            socketId={socket.id}
            onTogglePalabra={togglePalabra}
            onConfirmar={confirmarRevision}
          />
        )}

        {faseJuego === 'podio' && (
          <PodiumPhase
            jugadores={sala ? sala.jugadores : []}
            onSiguienteRonda={iniciarRonda}
          />
        )}
      </main>

      <BlueprintModal visible={mostrarBlueprint} onClose={() => setMostrarBlueprint(false)} />
    </div>
  );
}