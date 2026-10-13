export type StatusFila = "em_espera" | "em_atendimento" | "ausente" | "finalizado";

export interface Paciente {
  id: number;
  nome: string;
  cpf: string;
  telefone: string;
  tipoAtendimento: string;
  motivo: string;
  senha: number;
  status: StatusFila;
  criadoEm: string;
  atendidoEm: string | null;
}

export interface StatusPaciente {
  posicao: number;
  status: StatusFila;
}

export interface NovoPaciente {
  nome: string;
  cpf: string;
  telefone: string;
  tipoAtendimento: string;
  motivo: string;
}

export const STATUS_VALIDOS: StatusFila[] = [
  "em_atendimento",
  "ausente",
  "finalizado",
];

export const ROTULO_STATUS: Record<StatusFila, string> = {
  em_espera: "Aguardando",
  em_atendimento: "Em atendimento",
  ausente: "Ausente",
  finalizado: "Atendido",
};
