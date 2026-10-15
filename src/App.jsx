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
  const [nombreJugador, setNombreJugador] = useState('');
  const [codigoSala, setCodigoSala] = useState('');
  const [sala, setSala] = useState(null);

  const [conteoBasta, setConteoBasta] = useState(null);
  const [iniciadorBasta, setIniciadorBasta] = useState('');

  const nombreRef = useRef(nombreJugador);
  useEffect(() => {
    nombreRef.current = nombreJugador;
  }, [nombreJugador]);

  const [categorias, setCategorias] = useState(CATEGORIAS_DEFECTO);
  const [duracionRonda, setDuracionRonda] = useState(60);
  const [faseJuego, setFaseJuego] = useState('lobby');
  const [letraActual, setLetraActual] = useState('');
  const [tiempoRestante, setTiempoRestante] = useState(60);
  const [respuestas, setRespuestas] = useState({});
  const [mostrarBlueprint, setMostrarBlueprint] = useState(false);
  const [palabrasInvalidas, setPalabrasInvalidas] = useState({});
  const [confirmadosRevision, setConfirmadosRevision] = useState([]);

  // Referencia mutable para capturar las respuestas al instante
  const respuestasRef = useRef(respuestas);
  useEffect(() => {
    respuestasRef.current = respuestas;
  }, [respuestas]);

  // Guardar respuestas locales en localStorage
  useEffect(() => {
    if (sala && faseJuego === 'jugando') {
      localStorage.setItem('basta_respuestas_locales', JSON.stringify(respuestas));
    }
  }, [respuestas, sala, faseJuego]);

  // Manejador de Trampa instantáneo conectado con el hook
  const manejarTrampa = useCallback(() => {
    if (sala && faseJuego === 'jugando') {
      console.log('🚨 TRAMPA ENVIADA AL SERVIDOR. Respuestas actuales:', respuestasRef.current);
      socket.emit('registrar_trampa', { 
        codigo: sala.codigo, 
        respuestas: respuestasRef.current 
      });
    }
  }, [sala, faseJuego]);

  const { trampasDetectadas, alertaTrampa, limpiarTrampas } = useAntiCheat(faseJuego, manejarTrampa);

  const guardarSesionLocal = (codigo, nombre) => {
    if (!nombre) return;
    localStorage.setItem('basta_sesion', JSON.stringify({
      codigo,
      nombre,
      socketId: socket.id
    }));
  };

  const cerrarSesion = () => {
    localStorage.removeItem('basta_sesion');
    localStorage.removeItem('basta_respuestas_locales');

    if (sala) {
      socket.emit('salir_sala', { codigo: sala.codigo });
    }

    socket.disconnect();
    window.location.reload();
  };

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

    const onSalaCreada = ({ codigo, sala }) => {
      setCodigoSala(codigo);
      setSala(sala);
      guardarSesionLocal(codigo, nombreRef.current);
    };

    const onActualizarSala = (nuevaSala) => {
      setSala(nuevaSala);
      if (nuevaSala.estado) {
        setFaseJuego(nuevaSala.estado);
      }
    };

    const onRondaIniciada = ({ letraActual, duracionRonda, sala }) => {
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
    };

    const onTiempoRondaTick = ({ tiempoRestante }) => {
      setTiempoRestante(tiempoRestante);
    };

    const onBastaGritado = ({ iniciador, conteoBasta, sala }) => {
      setSala(sala);
      setIniciadorBasta(iniciador);
      setConteoBasta(conteoBasta);
    };

    const onConteoBastaTick = ({ tiempoRestante }) => {
      setConteoBasta(tiempoRestante);
    };

    const onIrARevision = ({ sala }) => {
      const respLocales = localStorage.getItem('basta_respuestas_locales');
      let respuestasAFirmar = respuestasRef.current;

      if (respLocales) {
        try {
          respuestasAFirmar = JSON.parse(respLocales);
        } catch (e) {
          console.error('Error recuperando respuestas locales:', e);
        }
      }

      socket.emit('guardar_respuestas_finales', { 
        codigo: sala.codigo, 
        respuestas: respuestasAFirmar 
      });

      setSala(sala);
      setConteoBasta(null);
      setIniciadorBasta('');
      setFaseJuego('revision');
    };

    const onRevisionActualizada = ({ palabrasInvalidas, confirmadosRevision }) => {
      setPalabrasInvalidas({ ...(palabrasInvalidas || {}) });
      setConfirmadosRevision([...(confirmadosRevision || [])]);
    };

    const onResultadosCalculados = (salaActualizada) => {
      setSala(salaActualizada);
      setFaseJuego('podio');
    };

    const onReconexionExitosa = ({ codigo, sala }) => {
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
    };

    const onErrorReconexion = () => {
      localStorage.removeItem('basta_sesion');
      localStorage.removeItem('basta_respuestas_locales');
      setFaseJuego('lobby');
      setSala(null);
    };

    const onErrorSala = (msg) => alert(msg);

    socket.on('sala_creada', onSalaCreada);
    socket.on('actualizar_sala', onActualizarSala);
    socket.on('ronda_iniciada', onRondaIniciada);
    socket.on('tiempo_ronda_tick', onTiempoRondaTick);
    socket.on('basta_gritado', onBastaGritado);
    socket.on('conteo_basta_tick', onConteoBastaTick);
    socket.on('ir_a_revision', onIrARevision);
    socket.on('revision_actualizada', onRevisionActualizada);
    socket.on('resultados_calculados', onResultadosCalculados);
    socket.on('reconexion_exitosa', onReconexionExitosa);
    socket.on('error_reconexion', onErrorReconexion);
    socket.on('error_sala', onErrorSala);

    return () => {
      socket.off('sala_creada', onSalaCreada);
      socket.off('actualizar_sala', onActualizarSala);
      socket.off('ronda_iniciada', onRondaIniciada);
      socket.off('tiempo_ronda_tick', onTiempoRondaTick);
      socket.off('basta_gritado', onBastaGritado);
      socket.off('conteo_basta_tick', onConteoBastaTick);
      socket.off('ir_a_revision', onIrARevision);
      socket.off('revision_actualizada', onRevisionActualizada);
      socket.off('resultados_calculados', onResultadosCalculados);
      socket.off('reconexion_exitosa', onReconexionExitosa);
      socket.off('error_reconexion', onErrorReconexion);
      socket.off('error_sala', onErrorSala);
    };
  }, []);

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
    if (sala) socket.emit('gritar_basta', { codigo: sala.codigo, respuestas: respuestasRef.current });
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