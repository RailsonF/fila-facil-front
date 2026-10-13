import type { Paciente } from "./types";

const CHAVE = "fila-facil:senha";

export function salvarSenhaLocal(paciente: Paciente) {
  try {
    localStorage.setItem(
      CHAVE,
      JSON.stringify({ paciente, salvoEm: Date.now() }),
    );
  } catch {
    /* armazenamento indisponível */
  }
}

export function lerSenhaLocal(): Paciente | null {
  try {
    const bruto = localStorage.getItem(CHAVE);
    if (!bruto) return null;

    const dados = JSON.parse(bruto) as { paciente?: Paciente };
    return dados?.paciente ?? null;
  } catch {
    return null;
  }
}

export function limparSenhaLocal() {
  try {
    localStorage.removeItem(CHAVE);
  } catch {
    /* armazenamento indisponível */
  }
}
