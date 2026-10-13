import { useEffect, useState } from "react";

export function useAgora(intervaloMs = 30000): number {
  const [agora, setAgora] = useState(() => Date.now());

  useEffect(() => {
    const intervalo = window.setInterval(() => setAgora(Date.now()), intervaloMs);
    return () => window.clearInterval(intervalo);
  }, [intervaloMs]);

  return agora;
}

export function tempoRelativo(iso: string, agora: number): string {
  const minutos = Math.max(0, Math.round((agora - new Date(iso).getTime()) / 60000));

  if (minutos < 1) return "agora";
  if (minutos === 1) return "há 1 min";
  if (minutos < 60) return `há ${minutos} min`;

  const horas = Math.floor(minutos / 60);
  return horas === 1 ? "há 1h" : `há ${horas}h`;
}

export function dataDeHoje(): string {
  return new Date().toLocaleDateString("pt-BR", {
    weekday: "long",
    day: "2-digit",
    month: "long",
  });
}

export function useRelogio(): string {
  const [agora, setAgora] = useState(() => new Date());

  useEffect(() => {
    const intervalo = window.setInterval(() => setAgora(new Date()), 1000);
    return () => window.clearInterval(intervalo);
  }, []);

  return agora.toLocaleTimeString("pt-BR", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
}
