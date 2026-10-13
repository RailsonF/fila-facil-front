import { useMemo, useState } from "react";
import {
  Activity,
  CircleSlash,
  Megaphone,
  RefreshCw,
  TriangleAlert,
  UserCheck,
  Users,
} from "lucide-react";
import ListaFila from "../components/ListaFila";
import PainelWhatsApp from "../components/PainelWhatsApp";
import { useToast } from "../components/Toast";
import BadgeStatus from "../components/ui/BadgeStatus";
import Botao from "../components/ui/Botao";
import CartaoMetrica from "../components/ui/CartaoMetrica";
import { Card, CardCabecalho } from "../components/ui/Card";
import { useConexaoSocket } from "../hooks/useConexaoSocket";
import { useFila } from "../hooks/useFila";
import { formatarSenha, formatarHorario } from "../lib/mask";
import { ROTULO_STATUS, type StatusFila } from "../lib/types";
import { useRelogio } from "../lib/tempo";

export default function Recepcao() {
  const { fila, carregando, erro, recarregar, alterarStatus } = useFila();
  const conectado = useConexaoSocket();
  const { avisar } = useToast();
  const relogio = useRelogio();
  const [idEmAcao, setIdEmAcao] = useState<number | null>(null);

  const metricas = useMemo(() => {
    const aguardando = fila.filter((p) => p.status === "em_espera");
    const emAtendimento = fila.filter((p) => p.status === "em_atendimento");
    const finalizados = fila.filter((p) => p.status === "finalizado");
    const ausentes = fila.filter((p) => p.status === "ausente");

    return {
      aguardando,
      emAtendimento,
      finalizados,
      ausentes,
      proximo: aguardando[0] ?? null,
    };
  }, [fila]);

  async function executar(id: number, status: StatusFila) {
    setIdEmAcao(id);
    try {
      const paciente = await alterarStatus(id, status);
      if (status === "em_atendimento") {
        avisar(`Chamando ${paciente.nome} — senha ${formatarSenha(paciente.senha)}.`, "sucesso");
      } else if (status === "finalizado") {
        avisar(`Atendimento de ${paciente.nome} finalizado.`, "sucesso");
      } else {
        avisar(`${paciente.nome} foi marcado como ausente.`, "info");
      }
    } catch (falha) {
      avisar(
        falha instanceof Error ? falha.message : "Não foi possível alterar o status.",
        "erro",
      );
    } finally {
      setIdEmAcao(null);
    }
  }

  async function chamarProximo() {
    const proximo = metricas.proximo;
    if (!proximo) return;
    await executar(proximo.id, "em_atendimento");
  }

  async function finalizarAtual() {
    const atual = metricas.emAtendimento[0];
    if (!atual) return;
    await executar(atual.id, "finalizado");
  }

  const semFila = metricas.aguardando.length === 0;

  return (
    <section className="mx-auto max-w-7xl px-4 py-8">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight text-slate-900 sm:text-3xl">
            Painel da recepção
          </h1>
          <p className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-slate-500">
            <span className="font-mono tabular-nums">{relogio}</span>
            <span
              className={`inline-flex items-center gap-1.5 font-semibold ${
                conectado ? "text-emerald-600" : "text-amber-600"
              }`}
            >
              <span
                className={`size-2 rounded-full ${
                  conectado ? "bg-emerald-500" : "animate-senhas-pulse bg-amber-500"
                }`}
              />
              {conectado ? "Tempo real ativo" : "Reconectando..."}
            </span>
          </p>
        </div>

        <div className="flex gap-2">
          <Botao
            variante="secundaria"
            onClick={() => void recarregar()}
            carregando={carregando}
          >
            {!carregando && <RefreshCw className="size-4" />}
            Atualizar
          </Botao>
          <Botao
            onClick={() => void chamarProximo()}
            disabled={semFila || idEmAcao !== null}
            tamanho="lg"
            className="px-6"
          >
            <Megaphone className="size-4" />
            Chamar próximo
          </Botao>
        </div>
      </div>

      {erro && (
        <div className="mt-5 flex items-start gap-3 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-medium text-rose-800">
          <TriangleAlert className="mt-0.5 size-4 shrink-0" />
          <span>{erro}</span>
        </div>
      )}

      <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <CartaoMetrica
          rotulo="Aguardando"
          valor={metricas.aguardando.length}
          detalhe={`${formatarSenha(fila.length)} senhas hoje`}
          icone={<Users className="size-5" />}
          tom="ambar"
        />
        <CartaoMetrica
          rotulo="Em atendimento"
          valor={metricas.emAtendimento.length}
          detalhe={
            metricas.emAtendimento[0]
              ? `Senha ${formatarSenha(metricas.emAtendimento[0].senha)}`
              : "Ninguém em atendimento"
          }
          icone={<Activity className="size-5" />}
          tom="marca"
        />
        <CartaoMetrica
          rotulo="Atendidos"
          valor={metricas.finalizados.length}
          detalhe="Atendimentos concluídos"
          icone={<UserCheck className="size-5" />}
          tom="esmeralda"
        />
        <CartaoMetrica
          rotulo="Ausentes"
          valor={metricas.ausentes.length}
          detalhe="Não compareceram"
          icone={<CircleSlash className="size-5" />}
          tom="cinza"
        />
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-[1.6fr_1fr]">
        <div className="min-w-0">
          <Card className="mb-6 overflow-hidden">
            <CardCabecalho
              titulo="Painel do dia"
              descricao="Atualiza sozinho a cada nova senha ou mudança de status."
              acao={
                metricas.emAtendimento[0] ? (
                  <Botao
                    tamanho="sm"
                    onClick={() => void finalizarAtual()}
                    disabled={idEmAcao !== null}
                    className="bg-emerald-600 hover:bg-emerald-700"
                  >
                    <UserCheck className="size-4" />
                    Finalizar atendimento atual
                  </Botao>
                ) : undefined
              }
            />

            <div className="grid gap-4 p-5 md:grid-cols-2">
              <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50/60 p-4">
                <p className="text-xs font-semibold tracking-wide text-slate-500 uppercase">
                  Chamando agora
                </p>
                {metricas.emAtendimento[0] ? (
                  <div className="mt-2 flex items-center gap-3">
                    <span className="flex size-12 items-center justify-center rounded-xl bg-marca-600 text-base font-extrabold text-white tabular-nums">
                      {formatarSenha(metricas.emAtendimento[0].senha)}
                    </span>
                    <div className="min-w-0">
                      <p className="truncate font-bold text-slate-900">
                        {metricas.emAtendimento[0].nome}
                      </p>
                      <p className="truncate text-xs text-slate-500">
                        {metricas.emAtendimento[0].tipoAtendimento} · desde{" "}
                        {formatarHorario(metricas.emAtendimento[0].criadoEm)}
                      </p>
                    </div>
                  </div>
                ) : (
                  <p className="mt-2 text-sm text-slate-500">
                    Nenhum paciente em atendimento.
                  </p>
                )}
              </div>

              <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50/60 p-4">
                <p className="text-xs font-semibold tracking-wide text-slate-500 uppercase">
                  Próximo da fila
                </p>
                {metricas.proximo ? (
                  <div className="mt-2 flex items-center gap-3">
                    <span className="flex size-12 items-center justify-center rounded-xl bg-slate-900 text-base font-extrabold text-white tabular-nums">
                      {formatarSenha(metricas.proximo.senha)}
                    </span>
                    <div className="min-w-0">
                      <p className="truncate font-bold text-slate-900">
                        {metricas.proximo.nome}
                      </p>
                      <p className="truncate text-xs text-slate-500">
                        {metricas.proximo.tipoAtendimento} ·{" "}
                        {metricas.aguardando.length - 1} pessoa
                        {metricas.aguardando.length - 1 === 1 ? "" : "s"} depois
                      </p>
                    </div>
                  </div>
                ) : (
                  <p className="mt-2 text-sm text-slate-500">
                    Fila vazia. Aguardando novas senhas.
                  </p>
                )}
              </div>
            </div>

            {metricas.emAtendimento[0] && (
              <div className="border-t border-slate-100 px-5 py-4">
                <p className="text-sm text-slate-600">
                  <strong className="text-slate-900">
                    {metricas.emAtendimento[0].nome}
                  </strong>{" "}
                  · {metricas.emAtendimento[0].motivo}
                </p>
                <div className="mt-2">
                  <BadgeStatus status={metricas.emAtendimento[0].status} tamanho="md" />
                </div>
              </div>
            )}
          </Card>

          <ListaFila
            fila={fila}
            aoAlterar={(id, status) => void executar(id, status)}
            idEmAcao={idEmAcao}
          />
        </div>

        <div className="space-y-6">
          <PainelWhatsApp />

          <Card className="p-5">
            <h3 className="text-sm font-bold text-slate-900">Como a fila avança</h3>
            <ul className="mt-3 space-y-3 text-sm text-slate-600">
              <li className="flex gap-2.5">
                <span className="mt-1.5 size-1.5 shrink-0 rounded-full bg-marca-500" />
                <span>
                  <strong className="text-slate-900">Chamar próximo</strong> chama o
                  primeiro da fila e dispara o gatilho de notificação.
                </span>
              </li>
              <li className="flex gap-2.5">
                <span className="mt-1.5 size-1.5 shrink-0 rounded-full bg-amber-500" />
                <span>
                  A cada chamada, o sistema avisa no WhatsApp quem está com{" "}
                  <strong className="text-slate-900">3 pessoas na frente</strong>.
                </span>
              </li>
              <li className="flex gap-2.5">
                <span className="mt-1.5 size-1.5 shrink-0 rounded-full bg-slate-400" />
                <span>
                  Pacientes marcados como <strong className="text-slate-900">ausentes</strong>{" "}
                  saem da fila e não recebem mais avisos.
                </span>
              </li>
            </ul>
            <p className="mt-4 rounded-lg bg-slate-50 px-3 py-2 text-xs text-slate-500">
              Status registrados hoje:{" "}
              {fila.length === 0
                ? "nenhum"
                : Object.entries(
                    fila.reduce<Record<string, number>>((acc, paciente) => {
                      acc[paciente.status] = (acc[paciente.status] ?? 0) + 1;
                      return acc;
                    }, {}),
                  )
                  .map(([status, total]) => `${ROTULO_STATUS[status as StatusFila]}: ${total}`)
                  .join(" · ")}
            </p>
          </Card>
        </div>
      </div>
    </section>
  );
}
