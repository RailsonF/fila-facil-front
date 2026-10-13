import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  BellRing,
  Clock3,
  MapPin,
  MessageCircle,
  ShieldCheck,
  Smartphone,
  Wifi,
} from "lucide-react";
import FormularioSenha from "../components/FormularioSenha";
import PainelSenha from "../components/PainelSenha";
import { Card } from "../components/ui/Card";
import { useConexaoSocket } from "../hooks/useConexaoSocket";
import { lerSenhaLocal } from "../lib/storage";
import type { Paciente } from "../lib/types";
import { dataDeHoje } from "../lib/tempo";

const DIFERENCIAIS = [
  {
    Icone: Clock3,
    titulo: "Não fique na fila",
    texto:
      "Retire a senha em segundos e volte só quando for a sua hora de ser atendido.",
  },
  {
    Icone: MessageCircle,
    titulo: "Aviso no WhatsApp",
    texto:
      "Enviamos uma mensagem automática no seu celular quando faltar 3 pessoas para a sua vez.",
  },
  {
    Icone: ShieldCheck,
    titulo: "Sem cadastro e sem app",
    texto:
      "Tudo acontece no navegador do celular. Você não precisa criar login nem baixar aplicativo.",
  },
];

export default function Paciente() {
  const navegar = useNavigate();
  const conectado = useConexaoSocket();
  const [senha, setSenha] = useState<Paciente | null>(() => lerSenhaLocal());

  useEffect(() => {
    document.title = "Fila Fácil · Retire sua senha virtual";
  }, []);

  return (
    <>
      <section className="relative overflow-hidden border-b border-slate-200 bg-gradient-to-b from-marca-50 to-slate-50">
        <div className="grid-fundo absolute inset-0 opacity-60" />
        <div className="relative mx-auto max-w-6xl px-4 py-14 sm:py-20">
          <span className="inline-flex items-center gap-2 rounded-full border border-marca-200 bg-white px-3 py-1 text-xs font-semibold text-marca-700">
            <MapPin className="size-3.5" />
            {dataDeHoje()}
          </span>
          <h1 className="mt-4 max-w-2xl text-4xl font-extrabold tracking-tight text-slate-900 sm:text-5xl">
            Sua consulta, sem horas <span className="text-marca-600">na sala de espera</span>.
          </h1>
          <p className="mt-4 max-w-xl text-lg text-slate-600">
            Retire sua senha virtual, acompanhe sua posição em tempo real e receba
            o aviso no WhatsApp. Volte para a unidade apenas na hora do atendimento.
          </p>

          <div className="mt-6 flex flex-wrap items-center gap-3">
            <span
              className={`inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-xs font-semibold ${
                conectado
                  ? "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200 ring-inset"
                  : "bg-amber-50 text-amber-700 ring-1 ring-amber-200 ring-inset"
              }`}
            >
              <span
                className={`size-2 rounded-full ${conectado ? "bg-emerald-500" : "animate-senhas-pulse bg-amber-500"}`}
              />
              {conectado ? "Atualizações em tempo real ativas" : "Conectando ao servidor..."}
            </span>
            <span className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-500">
              <Wifi className="size-3.5" />
              Sem polling, sem recarregar a página
            </span>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-10 sm:py-14">
        <div className="grid gap-8 lg:grid-cols-[1.15fr_0.85fr]">
          <Card className="p-6 sm:p-8">
            <div className="mb-6">
              <h2 className="text-xl font-bold text-slate-900">
                {senha ? "Preencha para retirar outra senha" : "Retirar minha senha"}
              </h2>
              <p className="mt-1 text-sm text-slate-500">
                Leva menos de um minuto. Os dados são usados apenas para organizar o
                atendimento.
              </p>
            </div>
            <FormularioSenha
              aoRetirar={(paciente) => {
                setSenha(paciente);
                navegar(`/acompanhar/${paciente.id}`);
              }}
            />
          </Card>

          <div className="space-y-6">
            {senha ? (
              <>
                <div className="flex items-center gap-2 text-sm font-semibold text-marca-700">
                  <Smartphone className="size-4" />
                  Acompanhe sua senha
                </div>
                <PainelSenha paciente={senha} />
              </>
            ) : (
              <Card className="overflow-hidden">
                <div className="flex items-center gap-2 border-b border-slate-100 bg-marca-50 px-6 py-4 text-sm font-bold text-marca-800">
                  <BellRing className="size-4" />
                  Como funciona
                </div>
                <ol className="divide-y divide-slate-100">
                  {DIFERENCIAIS.map((item, indice) => (
                    <li key={item.titulo} className="flex gap-4 p-5">
                      <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-sm font-bold text-slate-600">
                        {indice + 1}
                      </span>
                      <div>
                        <p className="flex items-center gap-2 text-sm font-bold text-slate-900">
                          <item.Icone className="size-4 text-marca-600" />
                          {item.titulo}
                        </p>
                        <p className="mt-1 text-sm text-slate-600">{item.texto}</p>
                      </div>
                    </li>
                  ))}
                </ol>
              </Card>
            )}
          </div>
        </div>
      </section>
    </>
  );
}
