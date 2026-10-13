import { useMemo, useState } from "react";
import {
  CheckCircle2,
  CircleSlash,
  Megaphone,
  Search,
  UserRound,
  Users,
} from "lucide-react";
import { formatarSenha } from "../lib/mask";
import { tempoRelativo, useAgora } from "../lib/tempo";
import { ROTULO_STATUS, type Paciente, type StatusFila } from "../lib/types";
import BadgeStatus from "./ui/BadgeStatus";
import { Card } from "./ui/Card";

type Filtro = "ativos" | "em_espera" | "finalizados" | "todos";

const FILTROS: { chave: Filtro; rotulo: string }[] = [
  { chave: "ativos", rotulo: "Fila ativa" },
  { chave: "em_espera", rotulo: "Aguardando" },
  { chave: "finalizados", rotulo: "Encerrados" },
  { chave: "todos", rotulo: "Todos" },
];

interface Props {
  fila: Paciente[];
  aoAlterar: (id: number, status: StatusFila) => void;
  idEmAcao: number | null;
}

export default function ListaFila({ fila, aoAlterar, idEmAcao }: Props) {
  const [filtro, setFiltro] = useState<Filtro>("ativos");
  const [busca, setBusca] = useState("");
  const agora = useAgora();

  const visiveis = useMemo(() => {
    const termo = busca.trim().toLowerCase();

    return fila.filter((paciente) => {
      const encerra =
        filtro === "todos" ||
        (filtro === "ativos" && paciente.status !== "finalizado" && paciente.status !== "ausente") ||
        (filtro === "em_espera" && paciente.status === "em_espera") ||
        (filtro === "finalizados" && (paciente.status === "finalizado" || paciente.status === "ausente"));

      const bate =
        termo === "" ||
        paciente.nome.toLowerCase().includes(termo) ||
        String(paciente.senha).includes(termo) ||
        paciente.tipoAtendimento.toLowerCase().includes(termo);

      return encerra && bate;
    });
  }, [fila, filtro, busca]);

  return (
    <Card className="flex min-h-0 flex-col overflow-hidden">
      <div className="flex flex-wrap items-center gap-3 border-b border-slate-100 px-4 py-3.5 sm:px-5">
        <div className="relative flex-1 min-w-48">
          <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-slate-400" />
          <input
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
            placeholder="Buscar por nome ou senha"
            className="w-full rounded-lg border border-slate-200 bg-white py-2 pr-3 pl-9 text-sm transition placeholder:text-slate-400 focus:border-marca-500 focus:ring-3 focus:ring-marca-500/12 focus:outline-none"
          />
        </div>
        <div className="flex flex-wrap gap-1 rounded-lg bg-slate-100 p-1">
          {FILTROS.map((item) => (
            <button
              key={item.chave}
              type="button"
              onClick={() => setFiltro(item.chave)}
              className={`rounded-md px-3 py-1.5 text-xs font-semibold transition ${
                filtro === item.chave
                  ? "bg-white text-slate-900 shadow-sm"
                  : "text-slate-500 hover:text-slate-800"
              }`}
            >
              {item.rotulo}
            </button>
          ))}
        </div>
      </div>

      <div className="min-h-0 flex-1 divide-y divide-slate-100 overflow-y-auto">
        {visiveis.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-2 px-6 py-16 text-center">
            <Users className="size-8 text-slate-300" />
            <p className="text-sm font-semibold text-slate-700">
              {fila.length === 0
                ? "Nenhuma senha retirada hoje"
                : "Nenhum paciente com esse filtro"}
            </p>
            <p className="max-w-xs text-xs text-slate-500">
              {fila.length === 0
                ? "As senhas aparecerão aqui automaticamente assim que os pacientes se cadastrarem."
                : "Ajuste a busca ou escolha outro filtro."}
            </p>
          </div>
        ) : (
          visiveis.map((paciente) => (
            <LinhaFila
              key={paciente.id}
              paciente={paciente}
              agora={agora}
              ocupado={idEmAcao === paciente.id}
              aoAlterar={aoAlterar}
            />
          ))
        )}
      </div>
    </Card>
  );
}

function LinhaFila({
  paciente,
  agora,
  ocupado,
  aoAlterar,
}: {
  paciente: Paciente;
  agora: number;
  ocupado: boolean;
  aoAlterar: (id: number, status: StatusFila) => void;
}) {
  const emEspera = paciente.status === "em_espera";
  const emAtendimento = paciente.status === "em_atendimento";
  const encerrado = paciente.status === "finalizado" || paciente.status === "ausente";

  return (
    <div
      className={`flex flex-col gap-3 px-4 py-4 transition sm:px-5 lg:flex-row lg:items-center lg:gap-4 ${
        emAtendimento ? "bg-marca-50/60" : "hover:bg-slate-50/70"
      } ${encerrado ? "opacity-60" : ""}`}
    >
      <div className="flex min-w-0 flex-1 items-center gap-3">
        <span
          className={`flex size-11 shrink-0 items-center justify-center rounded-xl text-sm font-extrabold tabular-nums ${
            emAtendimento
              ? "bg-marca-600 text-white"
              : encerrado
                ? "bg-slate-100 text-slate-400"
                : "bg-slate-900 text-white"
          }`}
        >
          {formatarSenha(paciente.senha)}
        </span>

        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <p className="truncate text-sm font-bold text-slate-900">{paciente.nome}</p>
            <BadgeStatus status={paciente.status} />
          </div>
          <p className="mt-0.5 flex items-center gap-1.5 truncate text-xs text-slate-500">
            <UserRound className="size-3 shrink-0" />
            {paciente.tipoAtendimento}
            <span className="text-slate-300">·</span>
            {tempoRelativo(paciente.criadoEm, agora)}
          </p>
          <p className="mt-1 line-clamp-1 text-xs text-slate-600">{paciente.motivo}</p>
        </div>
      </div>

      <div className="flex shrink-0 items-center gap-2 pl-14 lg:pl-0">
        {emEspera && (
          <>
            <button
              type="button"
              disabled={ocupado}
              onClick={() => aoAlterar(paciente.id, "em_atendimento")}
              className="inline-flex h-9 items-center gap-1.5 rounded-lg bg-marca-600 px-3 text-xs font-bold text-white transition hover:bg-marca-700 disabled:opacity-50"
            >
              <Megaphone className="size-3.5" />
              Chamar
            </button>
            <button
              type="button"
              disabled={ocupado}
              onClick={() => aoAlterar(paciente.id, "ausente")}
              className="inline-flex h-9 items-center gap-1.5 rounded-lg px-3 text-xs font-bold text-slate-500 transition hover:bg-slate-100 hover:text-rose-600 disabled:opacity-50"
            >
              <CircleSlash className="size-3.5" />
              Ausente
            </button>
          </>
        )}

        {emAtendimento && (
          <button
            type="button"
            disabled={ocupado}
            onClick={() => aoAlterar(paciente.id, "finalizado")}
            className="inline-flex h-9 items-center gap-1.5 rounded-lg bg-emerald-600 px-3 text-xs font-bold text-white transition hover:bg-emerald-700 disabled:opacity-50"
          >
            <CheckCircle2 className="size-3.5" />
            Finalizar
          </button>
        )}

        {encerrado && (
          <span className="px-2 text-xs font-semibold text-slate-400">
            {ROTULO_STATUS[paciente.status]}
          </span>
        )}
      </div>
    </div>
  );
}
