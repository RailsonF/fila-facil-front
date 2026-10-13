import { createContext, useCallback, useContext, useMemo, useState } from "react";
import { CheckCircle2, Info, TriangleAlert, X } from "lucide-react";

type Tom = "sucesso" | "erro" | "info";

interface Aviso {
  id: number;
  texto: string;
  tom: Tom;
}

interface ContextoToast {
  avisar: (texto: string, tom?: Tom) => void;
}

const ToastContext = createContext<ContextoToast | null>(null);

const ESTILO: Record<Tom, { classe: string; Icone: typeof Info }> = {
  sucesso: {
    classe: "border-emerald-200 bg-emerald-50 text-emerald-800",
    Icone: CheckCircle2,
  },
  erro: { classe: "border-rose-200 bg-rose-50 text-rose-800", Icone: TriangleAlert },
  info: { classe: "border-slate-200 bg-white text-slate-800", Icone: Info },
};

let sequencia = 0;

export function ProvedorToast({ children }: { children: React.ReactNode }) {
  const [avisos, setAvisos] = useState<Aviso[]>([]);

  const remover = useCallback((id: number) => {
    setAvisos((atuais) => atuais.filter((aviso) => aviso.id !== id));
  }, []);

  const avisar = useCallback(
    (texto: string, tom: Tom = "info") => {
      sequencia += 1;
      const id = sequencia;
      setAvisos((atuais) => [...atuais.slice(-2), { id, texto, tom }]);
      window.setTimeout(() => remover(id), 4200);
    },
    [remover],
  );

  const valor = useMemo(() => ({ avisar }), [avisar]);

  return (
    <ToastContext.Provider value={valor}>
      {children}
      <div className="pointer-events-none fixed inset-x-0 bottom-4 z-50 flex flex-col items-center gap-2 px-4">
        {avisos.map((aviso) => {
          const { classe, Icone } = ESTILO[aviso.tom];
          return (
            <div
              key={aviso.id}
              role="status"
              className={`flex w-full max-w-md animate-toast items-start gap-3 rounded-xl border px-4 py-3 text-sm font-medium shadow-alta ${classe}`}
            >
              <Icone className="mt-0.5 size-4 shrink-0" />
              <span className="flex-1">{aviso.texto}</span>
              <button
                type="button"
                onClick={() => remover(aviso.id)}
                className="shrink-0 rounded-md p-0.5 opacity-60 transition hover:opacity-100"
                aria-label="Fechar aviso"
              >
                <X className="size-4" />
              </button>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast(): ContextoToast {
  const contexto = useContext(ToastContext);
  if (!contexto) throw new Error("useToast precisa estar dentro de ProvedorToast");
  return contexto;
}
