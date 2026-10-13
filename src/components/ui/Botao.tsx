import type { ButtonHTMLAttributes, ReactNode } from "react";
import { LoaderCircle } from "lucide-react";

type Variante = "primaria" | "secundaria" | "perigo" | "fantasma";
type Tamanho = "sm" | "md" | "lg";

const VARIANTES: Record<Variante, string> = {
  primaria:
    "bg-marca-600 text-white hover:bg-marca-700 active:bg-marca-800 shadow-sm",
  secundaria:
    "bg-white text-slate-700 ring-1 ring-slate-200 hover:bg-slate-50 active:bg-slate-100",
  perigo:
    "bg-rose-600 text-white hover:bg-rose-700 active:bg-rose-800 shadow-sm",
  fantasma: "text-slate-600 hover:bg-slate-100 active:bg-slate-200",
};

const TAMANHOS: Record<Tamanho, string> = {
  sm: "h-9 px-3 text-sm gap-1.5",
  md: "h-11 px-5 text-sm gap-2",
  lg: "h-13 px-6 text-base gap-2",
};

interface Props extends ButtonHTMLAttributes<HTMLButtonElement> {
  variante?: Variante;
  tamanho?: Tamanho;
  carregando?: boolean;
  children: ReactNode;
}

export default function Botao({
  variante = "primaria",
  tamanho = "md",
  carregando = false,
  className = "",
  disabled,
  children,
  ...resto
}: Props) {
  return (
    <button
      {...resto}
      disabled={disabled || carregando}
      className={`inline-flex items-center justify-center rounded-xl font-semibold transition-colors duration-150 disabled:cursor-not-allowed disabled:opacity-50 ${VARIANTES[variante]} ${TAMANHOS[tamanho]} ${className}`}
    >
      {carregando && <LoaderCircle className="size-4 animate-spin" />}
      {children}
    </button>
  );
}
