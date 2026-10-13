import { useCallback, useEffect, useRef, useState } from "react";
import { api } from "../lib/api";
import { conectarSocket } from "../lib/socket";
import type { StatusPaciente } from "../lib/types";

const INTERVALO_MS = 15000;

export function useStatusPaciente(id: number | null) {
  const [dados, setDados] = useState<StatusPaciente | null>(null);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState<string | null>(null);
  const idAtual = useRef(id);
  idAtual.current = id;

  const consultar = useCallback(async (silencioso = false) => {
    const alvo = idAtual.current;
    if (alvo === null) return;

    if (!silencioso) setCarregando(true);
    try {
      const resposta = await api.consultarStatus(alvo);
      setDados(resposta);
      setErro(null);
    } catch (falha) {
      setErro(
        falha instanceof Error ? falha.message : "Erro ao consultar a posição",
      );
    } finally {
      setCarregando(false);
    }
  }, []);

  useEffect(() => {
    if (id === null) return;
    void consultar();
  }, [id, consultar]);

  useEffect(() => {
    if (id === null) return;

    const intervalo = window.setInterval(() => void consultar(true), INTERVALO_MS);

    const aoMudar = (paciente: { id: number }) => {
      if (paciente.id === idAtual.current) void consultar(true);
    };

    const aoConectar = () => void consultar(true);

    const socket = conectarSocket();
    socket.on("status_alterado", aoMudar);
    socket.on("fila_atualizada", aoMudar);
    socket.on("connect", aoConectar);

    return () => {
      window.clearInterval(intervalo);
      socket.off("status_alterado", aoMudar);
      socket.off("fila_atualizada", aoMudar);
      socket.off("connect", aoConectar);
    };
  }, [id, consultar]);

  return { dados, carregando, erro, consultar };
}
