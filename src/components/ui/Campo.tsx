import type { InputHTMLAttributes, ReactNode, SelectHTMLAttributes } from "react";
import { useId } from "react";
import { ChevronDown } from "lucide-react";

const BASE =
  "w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 shadow-sm transition placeholder:text-slate-400 focus:border-marca-500 focus:ring-4 focus:ring-marca-500/12 focus:outline-none disabled:bg-slate-50 disabled:text-slate-500";

interface CampoProps extends InputHTMLAttributes<HTMLInputElement> {
  rotulo: string;
  erro?: string;
  dica?: string;
  icone?: ReactNode;
  sufixo?: ReactNode;
}

export function Campo({
  rotulo,
  erro,
  dica,
  icone,
  sufixo,
  className = "",
  id,
  ...resto
}: CampoProps) {
  const gerado = useId();
  const campoId = id ?? gerado;

  return (
    <label htmlFor={campoId} className="block">
      <span className="mb-1.5 block text-sm font-semibold text-slate-700">
        {rotulo}
      </span>
      <div className="relative">
        {icone && (
          <span className="pointer-events-none absolute top-1/2 left-3.5 -translate-y-1/2 text-slate-400">
            {icone}
          </span>
        )}
        <input
          id={campoId}
          aria-invalid={Boolean(erro)}
          className={`${BASE} ${icone ? "pl-11" : ""} ${sufixo ? "pr-24" : ""} ${
            erro ? "border-rose-300 focus:border-rose-500 focus:ring-rose-500/12" : ""
          } ${className}`}
          {...resto}
        />
        {sufixo && (
          <span className="absolute top-1/2 right-3.5 -translate-y-1/2 text-xs font-medium text-slate-500">
            {sufixo}
          </span>
        )}
      </div>
      {erro ? (
        <span className="mt-1.5 block text-xs font-medium text-rose-600">{erro}</span>
      ) : dica ? (
        <span className="mt-1.5 block text-xs text-slate-500">{dica}</span>
      ) : null}
    </label>
  );
}

interface SelecaoProps extends SelectHTMLAttributes<HTMLSelectElement> {
  rotulo: string;
  erro?: string;
  children: ReactNode;
}

export function Selecao({ rotulo, erro, children, id, ...resto }: SelecaoProps) {
  const gerado = useId();
  const campoId = id ?? gerado;

  return (
    <label htmlFor={campoId} className="block">
      <span className="mb-1.5 block text-sm font-semibold text-slate-700">
        {rotulo}
      </span>
      <div className="relative">
        <select
          id={campoId}
          aria-invalid={Boolean(erro)}
          className={`${BASE} cursor-pointer appearance-none pr-11 ${
            erro ? "border-rose-300" : ""
          }`}
          {...resto}
        >
          {children}
        </select>
        <ChevronDown className="pointer-events-none absolute top-1/2 right-3.5 size-4 -translate-y-1/2 text-slate-500" />
      </div>
      {erro && (
        <span className="mt-1.5 block text-xs font-medium text-rose-600">{erro}</span>
      )}
    </label>
  );
}
