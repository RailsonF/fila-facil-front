import type { ReactNode } from "react";
import { Card } from "./Card";

interface Props {
  rotulo: string;
  valor: string | number;
  detalhe?: string;
  icone: ReactNode;
  tom?: "marca" | "ambar" | "esmeralda" | "cinza";
}

const TONS = {
  marca: "bg-marca-50 text-marca-600",
  ambar: "bg-amber-50 text-amber-600",
  esmeralda: "bg-emerald-50 text-emerald-600",
  cinza: "bg-slate-100 text-slate-500",
};

export default function CartaoMetrica({
  rotulo,
  valor,
  detalhe,
  icone,
  tom = "marca",
}: Props) {
  return (
    <Card className="flex items-center gap-4 p-4">
      <span
        className={`flex size-11 shrink-0 items-center justify-center rounded-xl ${TONS[tom]}`}
      >
        {icone}
      </span>
      <div className="min-w-0">
        <p className="truncate text-xs font-semibold tracking-wide text-slate-500 uppercase">
          {rotulo}
        </p>
        <p className="text-2xl leading-tight font-extrabold text-slate-900 tabular-nums">
          {valor}
        </p>
        {detalhe && <p className="truncate text-xs text-slate-500">{detalhe}</p>}
      </div>
    </Card>
  );
}
