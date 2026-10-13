import { Link } from "react-router-dom";
import {
  BellRing,
  CheckCircle2,
  Clock,
  RefreshCw,
  Smartphone,
  Users,
  XCircle,
} from "lucide-react";
import { useStatusPaciente } from "../hooks/useStatusPaciente";
import { formatarSenha } from "../lib/mask";
import { lerSenhaLocal, limparSenhaLocal } from "../lib/storage";
import { ROTULO_STATUS, type Paciente } from "../lib/types";
import { useToast } from "./Toast";
import BadgeStatus from "./ui/BadgeStatus";
import Botao from "./ui/Botao";
import { Card } from "./ui/Card";

const MINUTOS_POR_ATENDIMENTO = 15;

export default function PainelSenha({ paciente }: { paciente: Paciente }) {
  const { dados, carregando, erro, consultar } = useStatusPaciente(paciente.id);
  const { avisar } = useToast();

  const status = dados?.status ?? paciente.status;
  const posicao = dados?.posicao ?? null;
  const naFrente = posicao !== null ? Math.max(0, posicao - 1) : null;
  const estimativa = naFrente !== null ? naFrente * MINUTOS_POR_ATENDIMENTO : null;

  function esquecer() {
    const salvo = lerSenhaLocal();
    if (salvo && salvo.id !== paciente.id) return;
    limparSenhaLocal();
    avisar("Acompanhamento encerrado neste dispositivo.", "info");
    window.location.assign("/");
  }

  return (
    <div className="space-y-5">
      <Card className="overflow-hidden">
        <div className="relative bg-gradient-to-br from-marca-600 to-marca-800 px-6 py-8 text-center text-white">
          <div className="grid-fundo absolute inset-0 opacity-40" />
          <div className="relative">
            <p className="text-xs font-semibold tracking-[0.2em] text-marca-100 uppercase">
              Sua senha
            </p>
            <p className="mt-2 text-6xl font-extrabold tracking-tight tabular-nums sm:text-7xl">
              {formatarSenha(paciente.senha)}
            </p>
            <div className="mt-4 flex justify-center">
              <span className="rounded-full bg-white/15 px-3 py-1 text-sm font-semibold backdrop-blur-sm">
                {ROTULO_STATUS[status]}
              </span>
            </div>
          </div>
        </div>

        <div className="p-6">
          <p className="text-sm text-slate-500">
            Olá, <span className="font-semibold text-slate-900">{paciente.nome.split(" ")[0]}</span> ·
            guarde este número. Ele é o que será chamado na recepção.
          </p>

          <div className="mt-5 grid gap-3 sm:grid-cols-3">
            <div className="rounded-xl bg-slate-50 p-4">
              <p className="flex items-center gap-1.5 text-xs font-semibold text-slate-500 uppercase">
                <Users className="size-3.5" /> Sua posição
              </p>
              <p className="mt-1 text-2xl font-extrabold text-slate-900 tabular-nums">
                {carregando && posicao === null ? "—" : posicao !== null ? `${posicao}º` : "—"}
              </p>
            </div>
            <div className="rounded-xl bg-slate-50 p-4">
              <p className="flex items-center gap-1.5 text-xs font-semibold text-slate-500 uppercase">
                <Clock className="size-3.5" /> Estimativa
              </p>
              <p className="mt-1 text-2xl font-extrabold text-slate-900 tabular-nums">
                {status === "finalizado"
                  ? "—"
                  : status === "em_atendimento"
                    ? "Agora"
                    : estimativa !== null
                      ? `~${estimativa} min`
                      : "—"}
              </p>
            </div>
            <div className="rounded-xl bg-slate-50 p-4">
              <p className="flex items-center gap-1.5 text-xs font-semibold text-slate-500 uppercase">
                <BellRing className="size-3.5" /> Aviso
              </p>
              <p className="mt-1 text-sm font-bold text-slate-900">
                {status === "finalizado" || status === "ausente"
                  ? "Encerrado"
                  : "Faltam 3"}
              </p>
            </div>
          </div>

          {status === "em_atendimento" && (
            <div className="mt-4 flex items-start gap-3 rounded-xl border border-marca-200 bg-marca-50 p-4">
              <Smartphone className="mt-0.5 size-5 shrink-0 text-marca-600" />
              <p className="text-sm font-medium text-marca-900">
                É a sua vez! A recepção já está chamando a senha{" "}
                <strong>{formatarSenha(paciente.senha)}</strong>. Dirijam-se à
                balcão de atendimento.
              </p>
            </div>
          )}

          {status === "finalizado" && (
            <div className="mt-4 flex items-start gap-3 rounded-xl border border-emerald-200 bg-emerald-50 p-4">
              <CheckCircle2 className="mt-0.5 size-5 shrink-0 text-emerald-600" />
              <p className="text-sm font-medium text-emerald-900">
                Atendimento concluído. Obrigado por usar o Fila Fácil!
              </p>
            </div>
          )}

          {status === "ausente" && (
            <div className="mt-4 flex items-start gap-3 rounded-xl border border-slate-200 bg-slate-50 p-4">
              <XCircle className="mt-0.5 size-5 shrink-0 text-slate-500" />
              <p className="text-sm font-medium text-slate-700">
                Sua senha foi marcada como ausente. Retire uma nova senha se ainda
                precisar de atendimento.
              </p>
            </div>
          )}

          {erro && (
            <p className="mt-4 rounded-lg bg-amber-50 px-3 py-2 text-xs font-medium text-amber-800">
              {erro}
            </p>
          )}

          <div className="mt-5 flex flex-col gap-2 sm:flex-row">
            <Botao
              variante="secundaria"
              onClick={() => void consultar()}
              carregando={carregando}
              className="flex-1"
            >
              {!carregando && <RefreshCw className="size-4" />}
              Atualizar agora
            </Botao>
            <Link
              to={`/acompanhar/${paciente.id}`}
              className="flex-1 rounded-xl px-5 py-3 text-center text-sm font-semibold text-marca-700 transition hover:bg-marca-50"
            >
              Gerar link para acompanhar de outro celular
            </Link>
          </div>

          <button
            type="button"
            onClick={esquecer}
            className="mt-2 w-full rounded-xl px-5 py-2 text-center text-sm font-semibold text-slate-500 transition hover:bg-slate-100 hover:text-slate-700"
          >
            Encerrar acompanhamento
          </button>
        </div>
      </Card>

      <Card className="p-5">
        <h3 className="text-sm font-bold text-slate-900">Resumo do atendimento</h3>
        <dl className="mt-3 grid gap-3 text-sm sm:grid-cols-2">
          <div>
            <dt className="text-slate-500">Nome</dt>
            <dd className="font-medium text-slate-900">{paciente.nome}</dd>
          </div>
          <div>
            <dt className="text-slate-500">Especialidade</dt>
            <dd className="font-medium text-slate-900">{paciente.tipoAtendimento}</dd>
          </div>
          <div className="sm:col-span-2">
            <dt className="text-slate-500">Motivo informado</dt>
            <dd className="font-medium text-slate-900">{paciente.motivo}</dd>
          </div>
        </dl>
        <div className="mt-4 border-t border-slate-100 pt-4">
          <BadgeStatus status={status} tamanho="md" />
        </div>
      </Card>
    </div>
  );
}
