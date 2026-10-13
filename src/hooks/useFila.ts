import { useCallback, useEffect, useState } from "react";
import { api } from "../lib/api";
import { conectarSocket } from "../lib/socket";
import type { Paciente, StatusFila } from "../lib/types";

export function useFila() {
  const [fila, setFila] = useState<Paciente[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState<string | null>(null);

  const recarregar = useCallback(async () => {
    try {
      const dados = await api.listarFila();
      setFila(dados);
      setErro(null);
    } catch (falha) {
      setErro(falha instanceof Error ? falha.message : "Erro ao carregar a fila");
    } finally {
      setCarregando(false);
    }
  }, []);

  useEffect(() => {
    void recarregar();
  }, [recarregar]);

  useEffect(() => {
    const socket = conectarSocket();

    const aoCriar = (paciente: Paciente) => {
      setFila((atual) =>
        atual.some((item) => item.id === paciente.id)
          ? atual.map((item) => (item.id === paciente.id ? paciente : item))
          : [...atual, paciente],
      );
    };

    const aoMudarStatus = (paciente: Paciente) => {
      setFila((atual) =>
        atual.map((item) => (item.id === paciente.id ? paciente : item)),
      );
    };

    const aoReconectar = () => void recarregar();

    socket.on("fila_atualizada", aoCriar);
    socket.on("status_alterado", aoMudarStatus);
    socket.on("connect", aoReconectar);

    return () => {
      socket.off("fila_atualizada", aoCriar);
      socket.off("status_alterado", aoMudarStatus);
      socket.off("connect", aoReconectar);
    };
  }, [recarregar]);

  const alterarStatus = useCallback(
    async (id: number, status: StatusFila): Promise<Paciente> => {
      const atualizado = await api.alterarStatus(id, status);
      setFila((atual) =>
        atual.map((item) => (item.id === atualizado.id ? atualizado : item)),
      );
      return atualizado;
    },
    [],
  );

  return { fila, carregando, erro, recarregar, alterarStatus };
}
