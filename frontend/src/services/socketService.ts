// src/services/socketService.ts
import { io, Socket } from 'socket.io-client';
import { SOCKET_URL } from '../config';
import { getToken } from '../utils/auth';

class SocketService {
  private socket: Socket | null = null;
  private reconnectTimer: NodeJS.Timeout | null = null;
  private reconnectAttempts = 0;
  private readonly maxReconnectAttempts = 5;
  private readonly reconnectDelay = 3000; // 3 seconds
  
  // Get the singleton socket instance, creating it if needed
  public getSocket(): Socket {
    if (!this.socket) {
      this.initializeSocket();
    }
    return this.socket as Socket;
  }
  
  // Initialize the socket connection
  private initializeSocket(): void {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
    
    const token = getToken();
    
    this.socket = io(SOCKET_URL, {
      autoConnect: false,
      reconnection: true,
      reconnectionAttempts: 3,
      reconnectionDelay: 1000,
      auth: {
        token
      },
      extraHeaders: {
        Authorization: token ? `Bearer ${token}` : ''
      }
    });
    
    // Set up event handlers
    this.setupEventHandlers();
    
    // Connect the socket
    this.connect();
  }
  
  // Connect to the socket server
  public connect(): void {
    if (!this.socket) {
      this.initializeSocket();
      return;
    }
    
    if (!this.socket.connected) {
      this.socket.connect();
    }
  }
  
  // Disconnect from the socket server
  public disconnect(): void {
    if (this.socket) {
      this.socket.disconnect();
    }
    
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }
    
    this.reconnectAttempts = 0;
  }
  
  // Update authentication token (after login/refresh)
  public updateToken(): void {
    const token = getToken();
    
    if (this.socket) {
      // Update auth options
      this.socket.auth = { token };
      
      // If connected, reconnect to use new token
      if (this.socket.connected) {
        this.socket.disconnect().connect();
      }
    }
  }
  
  // Set up event handlers for the socket
  private setupEventHandlers(): void {
    if (!this.socket) return;
    
    this.socket.on('connect', () => {
      console.log('Socket connected successfully');
      // Reset reconnect attempts on successful connection
      this.reconnectAttempts = 0;
    });
    
    this.socket.on('connect_error', (error) => {
      console.error('Socket connection error:', error.message);
      
      // Retry token if authentication failed
      if (error.message.includes('Authentication')) {
        this.handleAuthError();
      } else {
        this.handleReconnect();
      }
    });
    
    this.socket.on('disconnect', (reason) => {
      console.log('Socket disconnected:', reason);
      
      // Handle various disconnect reasons
      if (reason === 'io server disconnect') {
        // Server disconnected us, need to reconnect manually
        this.handleReconnect();
      }
      // For transport close, the socket will automatically try to reconnect
    });
    
    this.socket.on('auth_error', (error) => {
      console.error('Socket authentication error:', error.message);
      this.handleAuthError();
    });
  }
  
  // Handle authentication errors
  private handleAuthError(): void {
    // Potentially trigger token refresh through auth service
    // For now, just log user out if too many auth failures
    this.reconnectAttempts++;
    
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      console.error('Too many authentication failures, logging out');
      // TODO: Dispatch logout action
      // store.dispatch(logout());
    }
  }
  
  // Handle reconnection
  private handleReconnect(): void {
    this.reconnectAttempts++;
    
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      console.log(`Attempting to reconnect (${this.reconnectAttempts}/${this.maxReconnectAttempts})...`);
      
      if (this.reconnectTimer) {
        clearTimeout(this.reconnectTimer);
      }
      
      this.reconnectTimer = setTimeout(() => {
        this.connect();
      }, this.reconnectDelay);
    } else {
      console.error('Maximum reconnection attempts reached');
    }
  }
  
  // Emit an event to the server
  public emit(event: string, data: any, callback?: (response: any) => void): void {
    if (!this.socket) {
      this.initializeSocket();
    }
    
    if (!this.socket?.connected) {
      console.warn('Socket not connected, connecting now...');
      this.connect();
      
      // Store the event to emit after connection
      this.socket?.once('connect', () => {
        this.socket?.emit(event, data, callback);
      });
      return;
    }
    
    this.socket.emit(event, data, callback);
  }
  
  // Subscribe to an event
  public on(event: string, callback: (data: any) => void): () => void {
    if (!this.socket) {
      this.initializeSocket();
    }
    
    this.socket?.on(event, callback);
    
    // Return a function to unsubscribe
    return () => {
      this.socket?.off(event, callback);
    };
  }
  
  // Subscribe to an event once
  public once(event: string, callback: (data: any) => void): void {
    if (!this.socket) {
      this.initializeSocket();
    }
    
    this.socket?.once(event, callback);
  }
  
  // Unsubscribe from an event
  public off(event: string, callback?: (data: any) => void): void {
    if (!this.socket) return;
    
    if (callback) {
      this.socket.off(event, callback);
    } else {
      this.socket.off(event);
    }
  }
}

// Export a singleton instance
const socketService = new SocketService();
export default socketService;