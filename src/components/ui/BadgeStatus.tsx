import type { StatusFila } from "../../lib/types";
import { ROTULO_STATUS } from "../../lib/types";

const ESTILOS: Record<StatusFila, string> = {
  em_espera: "bg-amber-50 text-amber-700 ring-amber-200",
  em_atendimento: "bg-marca-50 text-marca-700 ring-marca-200",
  ausente: "bg-slate-100 text-slate-500 ring-slate-200",
  finalizado: "bg-emerald-50 text-emerald-700 ring-emerald-200",
};

interface Props {
  status: StatusFila;
  tamanho?: "sm" | "md";
}

export default function BadgeStatus({ status, tamanho = "sm" }: Props) {
  return (
    <span
      className={`inline-flex shrink-0 items-center gap-1.5 rounded-full font-semibold ring-1 ring-inset ${ESTILOS[status]} ${
        tamanho === "sm" ? "px-2.5 py-0.5 text-[11px]" : "px-3 py-1 text-xs"
      }`}
    >
      <span
        className={`size-1.5 rounded-full ${
          status === "em_espera"
            ? "animate-senhas-pulse bg-amber-500"
            : status === "em_atendimento"
              ? "bg-marca-500"
              : status === "finalizado"
                ? "bg-emerald-500"
                : "bg-slate-400"
        }`}
      />
      {ROTULO_STATUS[status]}
    </span>
  );
}
