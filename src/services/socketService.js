import { io } from 'socket.io-client';

// Cambia esta URL por la IP local de tu PC o dominio desplegado
const SERVER_URL = 'https://basta-back.onrender.com';

export const socket = io(SERVER_URL, {
  autoConnect: true
});
