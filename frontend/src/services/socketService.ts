// src/services/socketService.ts
import { io } from 'socket.io-client';
import { SOCKET_URL } from '../config';
import { getToken } from '../utils/auth';

// Создаем экземпляр сокета
const socket = io(SOCKET_URL, {
  autoConnect: false,
  auth: {
    token: getToken()
  }
});

// Добавим обработчики событий подключения/отключения
socket.on('connect', () => {
  console.log('Socket connected successfully');
});

socket.on('connect_error', (error) => {
  console.error('Socket connection error:', error);
});

socket.on('disconnect', (reason) => {
  console.log('Socket disconnected:', reason);
});

export default socket;