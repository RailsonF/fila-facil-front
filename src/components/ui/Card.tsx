import type { HTMLAttributes } from "react";

export function Card({ className = "", ...resto }: HTMLAttributes<HTMLDivElement>) {
  return <div {...resto} className={`card ${className}`} />;
}

export function CardCabecalho({
  titulo,
  descricao,
  acao,
  className = "",
}: {
  titulo: string;
  descricao?: string;
  acao?: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={`flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 px-5 py-4 ${className}`}
    >
      <div>
        <h2 className="text-base font-bold text-slate-900">{titulo}</h2>
        {descricao && <p className="mt-0.5 text-sm text-slate-500">{descricao}</p>}
      </div>
      {acao}
    </div>
  );
}
