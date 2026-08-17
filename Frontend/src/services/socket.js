import { io } from "socket.io-client";

let socket;

export const getSocket = () => {
  if (!socket) {
    socket = io(import.meta.env.VITE_SERVER_API_BASE, {
      autoConnect: false,
      withCredentials: true,
    });
  }

  return socket;
};
