import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { AlertTriangle, ArrowLeft, Link2 } from "lucide-react";
import PainelSenha from "../components/PainelSenha";
import Botao from "../components/ui/Botao";
import { Card } from "../components/ui/Card";
import { api } from "../lib/api";
import { lerSenhaLocal } from "../lib/storage";
import type { Paciente } from "../lib/types";

export default function Acompanhar() {
  const { id } = useParams();
  const pacienteId = Number(id);
  const valido = Number.isInteger(pacienteId) && pacienteId > 0;

  const [paciente, setPaciente] = useState<Paciente | null>(null);
  const [copiado, setCopiado] = useState(false);

  useEffect(() => {
    if (!valido) return;
    const local = lerSenhaLocal();
    if (local?.id === pacienteId) {
      setPaciente(local);
      return;
    }
    api
      .consultarStatus(pacienteId)
      .then(() => setPaciente({ id: pacienteId } as Paciente))
      .catch(() => setPaciente(null));
  }, [pacienteId, valido]);

  useEffect(() => {
    document.title = "Acompanhamento · Fila Fácil";
  }, []);

  async function copiarLink() {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setCopiado(true);
      window.setTimeout(() => setCopiado(false), 2200);
    } catch {
      setCopiado(false);
    }
  }

  if (!valido) {
    return (
      <div className="mx-auto max-w-lg px-4 py-20 text-center">
        <AlertTriangle className="mx-auto size-10 text-amber-500" />
        <h1 className="mt-4 text-xl font-bold text-slate-900">Link inválido</h1>
        <p className="mt-2 text-sm text-slate-600">
          A senha virtual não foi informada corretamente. Volte ao início para
          retirar uma nova senha.
        </p>
        <Link
          to="/"
          className="mt-6 inline-flex items-center gap-2 rounded-xl bg-marca-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-marca-700"
        >
          <ArrowLeft className="size-4" />
          Ir para o início
        </Link>
      </div>
    );
  }

  return (
    <section className="mx-auto max-w-xl px-4 py-10 sm:py-14">
      <Link
        to="/"
        className="inline-flex items-center gap-1.5 text-sm font-semibold text-slate-500 transition hover:text-slate-900"
      >
        <ArrowLeft className="size-4" />
        Retirar nova senha
      </Link>

      <h1 className="mt-4 text-2xl font-extrabold tracking-tight text-slate-900">
        Acompanhamento da senha
      </h1>
      <p className="mt-1 text-sm text-slate-600">
        Esta tela se atualiza sozinha a cada alteração na fila.
      </p>

      <div className="mt-6">
        {paciente && paciente.senha !== undefined ? (
          <PainelSenha paciente={paciente} />
        ) : (
          <Card className="p-6 text-sm text-slate-600">
            <p className="font-semibold text-slate-900">
              Recarregando seus dados…
            </p>
            <p className="mt-1">
              Se o link foi aberto em outro dispositivo, abra a senha neste mesmo
              celular para ver os detalhes completos.
            </p>
            <Botao
              variante="secundaria"
              onClick={() => window.location.reload()}
              className="mt-4"
            >
              Recarregar
            </Botao>
          </Card>
        )}
      </div>

      <Card className="mt-6 flex flex-wrap items-center justify-between gap-3 p-4">
        <p className="flex items-center gap-2 text-sm text-slate-600">
          <Link2 className="size-4 text-marca-600" />
          Compartilhe o link para acompanhar de outro celular.
        </p>
        <Botao variante="secundaria" tamanho="sm" onClick={copiarLink}>
          {copiado ? "Link copiado!" : "Copiar link"}
        </Botao>
      </Card>
    </section>
  );
}
