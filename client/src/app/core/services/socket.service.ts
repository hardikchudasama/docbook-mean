import { Injectable } from '@angular/core';
import { io, Socket } from 'socket.io-client';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class SocketService {
  private socket: Socket;

  constructor() {
    const baseUrl = environment.apiUrl.replace('/api', '');
    this.socket = io(baseUrl);
  }

  getSocketId(): string {
    return this.socket.id || '';
  }

  onSlotBooked(callback: (data: any) => void) {
    this.socket.on('slotBooked', callback);
  }

  onSlotCancelled(callback: (data: any) => void) {
    this.socket.on('slotCancelled', callback);
  }
}