import { io, Socket } from 'socket.io-client';
import { store } from '../store/store';
import {
  setPollState,
  setNewPoll,
  updatePollResults,
  endPoll,
  setUsers,
  addMessage,
  setError,
  clearError,
} from '../store/store';

class SocketService {
  private socket: Socket | null = null;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;

  connect() {
    if (this.socket?.connected) {
      return this.socket;
    }

    // For Vercel deployment, use the API path for Socket.io
    const socketURL = process.env.REACT_APP_BACKEND_URL || window.location.origin;
    
    this.socket = io(socketURL, {
      path: '/api/socket',
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionAttempts: this.maxReconnectAttempts,
    });

    this.setupEventHandlers();
    return this.socket;
  }

  private setupEventHandlers() {
    if (!this.socket) return;

    // Connection events
    this.socket.on('connect', () => {
      console.log('Connected to server');
      this.reconnectAttempts = 0;
      store.dispatch(clearError());
    });

    this.socket.on('disconnect', (reason) => {
      console.log('Disconnected from server:', reason);
      if (reason === 'io server disconnect') {
        // Server initiated disconnect, try to reconnect
        this.socket?.connect();
      }
    });

    this.socket.on('connect_error', (error) => {
      console.error('Connection error:', error);
      this.reconnectAttempts++;
      if (this.reconnectAttempts >= this.maxReconnectAttempts) {
        store.dispatch(setError('Failed to connect to server. Please check your internet connection and try again.'));
      }
    });

    // Poll events
    this.socket.on('poll-state', (data) => {
      store.dispatch(setPollState({
        activePoll: data.activePoll,
        results: data.results,
        hasAnswered: data.hasAnswered,
      }));
    });

    this.socket.on('new-poll', (data) => {
      store.dispatch(setNewPoll(data));
    });

    this.socket.on('poll-results-updated', (data) => {
      store.dispatch(updatePollResults(data));
    });

    this.socket.on('poll-ended', (data) => {
      store.dispatch(endPoll(data));
    });

    // User events
    this.socket.on('users-updated', (users) => {
      store.dispatch(setUsers(users));
    });

    // Chat events
    this.socket.on('new-message', (message) => {
      store.dispatch(addMessage(message));
    });

    // Error events
    this.socket.on('error', (data) => {
      store.dispatch(setError(data.message));
    });

    this.socket.on('removed-by-teacher', () => {
      store.dispatch(setError('You have been removed from the session by the teacher.'));
      this.disconnect();
      // Redirect to landing page
      window.location.href = '/';
    });
  }

  // Emit events
  joinSession(name: string, role: 'teacher' | 'student') {
    this.socket?.emit('join', { name, role });
  }

  createPoll(pollData: { question: string; options: string[]; timeLimit: number }) {
    this.socket?.emit('create-poll', pollData);
  }

  submitAnswer(selectedOption: string) {
    this.socket?.emit('submit-answer', { selectedOption });
  }

  sendMessage(message: string) {
    this.socket?.emit('send-message', { message });
  }

  removeStudent(studentName: string) {
    this.socket?.emit('remove-student', { studentName });
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }

  isConnected() {
    return this.socket?.connected || false;
  }

  getSocket() {
    return this.socket;
  }
}

export const socketService = new SocketService();