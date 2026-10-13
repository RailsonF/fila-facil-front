import { io, type Socket } from "socket.io-client";
import { apiBaseUrl } from "./baseUrl";

const BASE_URL = apiBaseUrl();

let socket: Socket | null = null;

export function conectarSocket(): Socket {
  if (!socket) {
    socket = io(BASE_URL, {
      transports: ["websocket", "polling"],
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
    });
  }

  return socket;
}

export function estaConectado(): boolean {
  return socket?.connected ?? false;
}
