import { useRef, useState } from "react";
import { ClipboardList, Hash, IdCard, Phone, Send, Stethoscope } from "lucide-react";
import { api, ApiError } from "../lib/api";
import { mascararCPF, mascararNome, mascararTelefone, soDigitos, validarCPF } from "../lib/mask";
import { salvarSenhaLocal } from "../lib/storage";
import type { NovoPaciente, Paciente } from "../lib/types";
import { useToast } from "./Toast";
import Botao from "./ui/Botao";
import { Campo, Selecao } from "./ui/Campo";

const TIPOS = [
  "Clínico Geral",
  "Odontologia",
  "Enfermagem",
  "Pediatria",
  "Vacinação",
  "Ginecologia",
  "Ultra-sonografia",
  "Rastreio de mama",
  "Fisioterapia",
  "Outro",
];

interface Erros {
  nome?: string;
  cpf?: string;
  telefone?: string;
  tipoAtendimento?: string;
  motivo?: string;
}

const CAMPO_TEXTO =
  "w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 shadow-sm transition placeholder:text-slate-400 focus:border-marca-500 focus:ring-4 focus:ring-marca-500/12 focus:outline-none";

export default function FormularioSenha({
  aoRetirar,
}: {
  aoRetirar: (paciente: Paciente) => void;
}) {
  const { avisar } = useToast();
  const [enviando, setEnviando] = useState(false);
  const [erros, setErros] = useState<Erros>({});
  const [form, setForm] = useState<NovoPaciente>({
    nome: "",
    cpf: "",
    telefone: "",
    tipoAtendimento: "Clínico Geral",
    motivo: "",
  });

  const cpfBuscado = useRef("");

  function alterar(campo: keyof NovoPaciente, valor: string) {
    setForm((atual) => ({ ...atual, [campo]: valor }));
    setErros((atual) => ({ ...atual, [campo]: undefined }));
  }

  async function buscarCadastro(cpfMascarado: string) {
    const cpf = soDigitos(cpfMascarado);
    if (cpf.length !== 11 || !validarCPF(cpfMascarado)) return;
    if (cpfBuscado.current === cpf) return;
    cpfBuscado.current = cpf;

    try {
      const existente = await api.buscarPorCpf(cpf);
      if (!existente) return;

      setForm((atual) => ({
        ...atual,
        nome: mascararNome(existente.nome),
        telefone: mascararTelefone(existente.telefone.replace(/^55/, "")),
      }));
      avisar("Paciente já cadastrado — dados carregados.", "info");
    } catch {
      cpfBuscado.current = "";
    }
  }

  function validar(): Erros {
    const novos: Erros = {};
    if (form.nome.trim().length < 3) novos.nome = "Informe seu nome completo.";
    if (!validarCPF(form.cpf)) novos.cpf = "CPF inválido. Confira os 11 dígitos.";
    if (soDigitos(form.telefone).length < 10)
      novos.telefone = "Informe um telefone com DDD.";
    if (!form.tipoAtendimento) novos.tipoAtendimento = "Selecione o atendimento.";
    if (form.motivo.trim().length < 5)
      novos.motivo = "Descreva o motivo em pelo menos 5 caracteres.";
    return novos;
  }

  async function enviar(evento: React.FormEvent) {
    evento.preventDefault();

    const problemas = validar();
    setErros(problemas);
    if (Object.keys(problemas).length > 0) {
      avisar("Confira os campos destacados antes de continuar.", "erro");
      return;
    }

    setEnviando(true);
    try {
      const paciente = await api.criarSenha({
        nome: mascararNome(form.nome),
        cpf: soDigitos(form.cpf),
        telefone: soDigitos(form.telefone),
        tipoAtendimento: form.tipoAtendimento,
        motivo: form.motivo.trim(),
      });

      salvarSenhaLocal(paciente);
      setForm({
        nome: "",
        cpf: "",
        telefone: "",
        tipoAtendimento: "Clínico Geral",
        motivo: "",
      });
      aoRetirar(paciente);
    } catch (falha) {
      avisar(
        falha instanceof ApiError ? falha.message : "Não foi possível retirar a senha.",
        "erro",
      );
    } finally {
      setEnviando(false);
    }
  }

  return (
    <form onSubmit={enviar} className="space-y-5" noValidate>
      <Campo
        rotulo="Nome completo"
        placeholder="Maria de Souza"
        autoComplete="name"
        value={form.nome}
        erro={erros.nome}
        icone={<IdCard className="size-4" />}
        onChange={(e) => alterar("nome", e.target.value)}
      />

      <div className="grid gap-5 sm:grid-cols-2">
        <Campo
          rotulo="CPF"
          placeholder="000.000.000-00"
          inputMode="numeric"
          autoComplete="off"
          value={form.cpf}
          erro={erros.cpf}
          icone={<Hash className="size-4" />}
          onChange={(e) => {
            const valor = mascararCPF(e.target.value);
            alterar("cpf", valor);
            void buscarCadastro(valor);
          }}
        />
        <Campo
          rotulo="Telefone / WhatsApp"
          placeholder="(11) 98888-7777"
          inputMode="tel"
          autoComplete="tel"
          value={form.telefone}
          erro={erros.telefone}
          icone={<Phone className="size-4" />}
          sufixo="com DDD"
          onChange={(e) => alterar("telefone", mascararTelefone(e.target.value))}
        />
      </div>

      <Selecao
        rotulo="Tipo de atendimento"
        value={form.tipoAtendimento}
        erro={erros.tipoAtendimento}
        onChange={(e) => alterar("tipoAtendimento", e.target.value)}
      >
        {TIPOS.map((tipo) => (
          <option key={tipo} value={tipo}>
            {tipo}
          </option>
        ))}
      </Selecao>

      <label className="block">
        <span className="mb-1.5 block text-sm font-semibold text-slate-700">
          Motivo da consulta
        </span>
        <div className="relative">
          <ClipboardList className="pointer-events-none absolute top-3.5 left-3.5 size-4 text-slate-400" />
          <textarea
            rows={3}
            placeholder="Conte rapidamente o que você precisa."
            value={form.motivo}
            maxLength={240}
            aria-invalid={Boolean(erros.motivo)}
            className={`${CAMPO_TEXTO} resize-none pl-11 ${
              erros.motivo ? "border-rose-300" : ""
            }`}
            onChange={(e) => alterar("motivo", e.target.value)}
          />
        </div>
        <span className="mt-1.5 flex justify-between text-xs">
          {erros.motivo ? (
            <span className="font-medium text-rose-600">{erros.motivo}</span>
          ) : (
            <span className="text-slate-500">
              Usamos apenas para organizar o atendimento.
            </span>
          )}
          <span className="tabular-nums text-slate-400">{form.motivo.length}/240</span>
        </span>
      </label>

      <Botao
        type="submit"
        tamanho="lg"
        carregando={enviando}
        className="w-full"
      >
        {!enviando && <Send className="size-4" />}
        {enviando ? "Gerando sua senha..." : "Retirar senha virtual"}
      </Botao>

      <p className="flex items-start gap-2 text-xs text-slate-500">
        <Stethoscope className="mt-0.5 size-3.5 shrink-0 text-marca-500" />
        Você receberá um aviso no WhatsApp quando faltar 3 pessoas para a sua vez —
        e poderá aguardar onde preferir.
      </p>
    </form>
  );
}
