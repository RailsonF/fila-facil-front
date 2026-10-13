# 🏥 Fila Fácil — Front-end

> Interface web do **Fila Fácil**, sistema de gestão de fila por senha virtual para UBS, clínicas e laboratórios. Projeto de extensão universitária (6º semestre de Sistemas de Informação).

Este front-end se conecta à API do back-end (`fila-facil-backend`) por HTTP e
Socket.io. Ele não substitui a API: todos os dados vêm dela.

---

## 🚀 Tecnologias

- **React 19 + TypeScript**
- **Vite 6** (build e dev server)
- **Tailwind CSS v4** (tema customizado via `@theme`)
- **Socket.io** (atualizações em tempo real, sem polling)
- **React Router 7**
- **Lucide React** (ícones)
- **qrcode** (renderização do QR Code do WhatsApp)

---

## ⚙️ Como rodar localmente

**1. Instale as dependências**
```bash
npm install
```

**2. Configure a URL da API**
```bash
cp .env.example .env
```
> `.env` → `VITE_API_URL=http://localhost:3000`
>
> É preciso reiniciar o dev server depois de alterar a variável.

**3. Suba a API do back-end** (em outro terminal, na pasta `fila-facil`)
```bash
npm run dev     # http://localhost:3000
npm run worker  # opcional, habilita os avisos de WhatsApp
```

**4. Rode o front-end**
```bash
npm run dev
```
Acesse **http://localhost:5173**.

### Scripts disponíveis

| Comando | O que faz |
|---|---|
| `npm run dev` | Sobe o dev server com HMR |
| `npm run build` | Checagem de tipos + build de produção em `dist/` |
| `npm run preview` | Serve o build de produção localmente |
| `npm run typecheck` | Apenas checagem de tipos (`tsc`) |

---

## 🗺️ Telas

| Rota | Público | Descrição |
|---|---|---|
| `/` | Paciente | Retirada de senha e acompanhamento da posição em tempo real |
| `/acompanhar/:id` | Paciente | Link compartilhável para acompanhar de outro celular |
| `/recepcao` | Equipe | Painel de gestão da fila do dia + pareamento do WhatsApp |

### `/` — Paciente
- Formulário de retirada de senha (nome, CPF, telefone, tipo de atendimento, motivo).
- Validação de CPF por dígitos verificadores e máscara de telefone **antes** de enviar
  (o back-end ainda higieniza e embute o DDI `55`).
- Após retirar, o painel exibe a senha em destaque, posição na fila, estimativa de
  espera e o estado atual (`Aguardando`, `Em atendimento`, `Atendido`, `Ausente`).
- A senha fica salva no `localStorage`, então recarregar a página não perde o acompanhamento.

### `/recepcao` — Recepção
- **Botão `Chamar próximo`**: chama o primeiro paciente em `em_espera`. É esta ação que
  dispara o gatilho de notificação (regra dos 3) no back-end.
- **Ações por linha**: `Chamar`, `Ausente` e `Finalizar`.
- **Métricas do dia**: aguardando, em atendimento, atendidos e ausentes.
- **Cartões "Chamando agora" e "Próximo da fila"** com a senha em destaque.
- **Busca e filtros**: por nome, senha ou especialidade; fila ativa / aguardando / encerrados / todos.
- **Painel do WhatsApp**: exibe o QR Code recebido via Socket.io e avisa quando a sessão
  fica conectada.

---

## 🔌 Integração com a API

### Endpoints consumidos

| Método | Endpoint | Uso no front |
|---|---|---|
| `POST` | `/api/fila` | Retirar senha |
| `GET` | `/api/fila` | Carregar a fila do painel |
| `GET` | `/api/fila/:id/status` | Posição e status do paciente |
| `PUT` | `/api/fila/:id/status` | Ações da recepção |
| `GET` | `/health` | Verificação de conectividade |

### Eventos do Socket.io

| Evento | Efeito na interface |
|---|---|
| `fila_atualizada` | Novo paciente entra na fila do painel |
| `status_alterado` | Linha do painel é atualizada sem recarregar |
| `qr_code_whatsapp` | QR Code do Baileys é desenhado no painel da recepção |
| `whatsapp_conectado` | Selo "Sessão ativa" no painel do WhatsApp |

Além dos eventos, o front também escuta `connect` / `disconnect` para exibir o indicador
de tempo real e recarregar a fila caso a conexão caia.

O `useStatusPaciente` combina os eventos com um *polling* leve (15 s) apenas como rede
de segurança, para o caso de o socket cair sem aviso.

---

## 📁 Estrutura de pastas

```text
src/
├── components/          # Componentes de interface
│   ├── ui/              # Primitivos reutilizáveis (Botao, Card, Campo, BadgeStatus…)
│   ├── FormularioSenha  # Formulário de retirada de senha
│   ├── PainelSenha      # Cartão de acompanhamento do paciente
│   ├── ListaFila        # Lista de pacientes com ações
│   ├── PainelWhatsApp   # QR Code e status da sessão
│   ├── Toast.tsx        # Notificações efêmeras
│   └── Layout.tsx       # Cabeçalho, navegação e rodapé
├── hooks/               # useFila, useStatusPaciente, useConexaoSocket
├── lib/                 # api.ts, socket.ts, types.ts, mask.ts, storage.ts, tempo.ts
├── pages/               # Paciente, Acompanhar, Recepcao
├── index.css            # Tema Tailwind v4 e utilitários
└── main.tsx
```

---

## ☁️ Deploy na Vercel

1. Importe o repositório na Vercel (framework detectado: Vite).
2. Defina a variável de ambiente `VITE_API_URL` com a URL pública da API.
3. Deploy. O build já usa `npm run build`, que gera `dist/`.

Como o front usa rotas do React Router, a Vercel precisa reescrever as rotas para o
`index.html`. Crie um `vercel.json` na raiz do projeto:

```json
{
  "rewrites": [{ "source": "/(.*)", "destination": "/index.html" }]
}
```

> Lembre-se de liberar a origem do front no CORS da API e do Socket.io
> (`cors: { origin: "*" }` no back-end).

---

## ⚠️ Pendências conhecidas

- **Autenticação da recepção:** o painel em `/recepcao` ainda **não** exige login. A
  documentação do projeto (`docs/01-visao-geral.md`) define JWT para a equipe, mas o
  back-end atual não expõe rota de autenticação. Quando ela existir, o front precisa de
  um guarda de rota e do envio do token no cabeçalho `Authorization`.
- **Pesquisa de satisfação:** o envio do link de avaliação junto da mensagem de
  finalização está previsto na documentação e ainda não tem tela no front.
