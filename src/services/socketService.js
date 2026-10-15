import { io } from 'socket.io-client';

// Cambia esta URL por la IP local de tu PC o dominio desplegado
const SERVER_URL = 'http://localhost:4000';

export const socket = io(SERVER_URL, {
  autoConnect: true
});