import { apiBaseUrl } from "./baseUrl";
import type { NovoPaciente, Paciente, StatusFila, StatusPaciente } from "./types";

const BASE_URL = apiBaseUrl();

export class ApiError extends Error {
  status: number;

  constructor(mensagem: string, status: number) {
    super(mensagem);
    this.name = "ApiError";
    this.status = status;
  }
}

async function request<T>(caminho: string, init?: RequestInit): Promise<T> {
  let resposta: Response;

  try {
    resposta = await fetch(`${BASE_URL}${caminho}`, {
      ...init,
      headers: {
        "Content-Type": "application/json",
        ...init?.headers,
      },
    });
  } catch {
    throw new ApiError(
      "Não foi possível conectar ao servidor.",
      0,
    );
  }

  const texto = await resposta.text();
  const corpo = texto ? safeJson(texto) : null;

  if (!resposta.ok) {
    const mensagem =
      (corpo as { error?: string } | null)?.error ??
      `Erro ${resposta.status} ao falar com a API.`;
    throw new ApiError(mensagem, resposta.status);
  }

  return corpo as T;
}

function safeJson(texto: string): unknown {
  try {
    return JSON.parse(texto);
  } catch {
    return null;
  }
}

export const api = {
  health: () => request<{ status: string }>("/health"),

  criarSenha: (dados: NovoPaciente) =>
    request<Paciente>("/api/fila", {
      method: "POST",
      body: JSON.stringify(dados),
    }),

  listarFila: () => request<Paciente[]>("/api/fila"),

  buscarPorCpf: async (cpf: string): Promise<Paciente | null> => {
    try {
      return await request<Paciente>(`/api/fila/cpf/${cpf}`);
    } catch (erro) {
      if (erro instanceof ApiError && erro.status === 404) return null;
      throw erro;
    }
  },

  consultarStatus: (id: number) =>
    request<StatusPaciente>(`/api/fila/${id}/status`),

  alterarStatus: (id: number, status: StatusFila) =>
    request<Paciente>(`/api/fila/${id}/status`, {
      method: "PUT",
      body: JSON.stringify({ status }),
    }),
};
