import { useEffect, useState } from "react";
import { conectarSocket } from "../lib/socket";

export function useConexaoSocket(): boolean {
  const [conectado, setConectado] = useState(false);

  useEffect(() => {
    const socket = conectarSocket();

    const aoConectar = () => setConectado(true);
    const aoDesconectar = () => setConectado(false);

    setConectado(socket.connected);
    socket.on("connect", aoConectar);
    socket.on("disconnect", aoDesconectar);

    return () => {
      socket.off("connect", aoConectar);
      socket.off("disconnect", aoDesconectar);
    };
  }, []);

  return conectado;
}
