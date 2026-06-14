# Security Policy · Política de Segurança

> 🇺🇸 English first · 🇧🇷 Português abaixo

---

## 🇺🇸 English

Security is a **P0 design requirement** in RobbIA. We take it seriously and appreciate the community's help in keeping the project and its users safe.

### Reporting a vulnerability

**Please do not open a public issue for security vulnerabilities.**

Instead, report privately through one of:

- **GitHub Security Advisories** — [open a private advisory](https://github.com/marcioluiskroth/RobbIA/security/advisories/new) (preferred)
- **Email** — `marcio@kroth.com.br` with the subject `[SECURITY] RobbIA`

Please include: a description of the issue, steps to reproduce (PoC if possible), affected component/version, and the potential impact. We aim to acknowledge reports within **72 hours** and will keep you updated on remediation. Responsible disclosure is credited unless you prefer to remain anonymous.

### Supported versions

RobbIA is **pre-release (MVP in active development)**. Security fixes target the `main` branch. There is no production release line yet; once one exists, this table will be updated.

| Version | Supported |
|---------|-----------|
| `main` (pre-release) | ✅ |

### Security posture (by design)

- **Credential isolation (CES).** Secrets are stored with envelope encryption (AES-GCM), master key kept outside the database, and injected only into execution workers at runtime — never into prompts, logs, or LLM responses.
- **Secret-redacting structured logs.** The shared logger redacts sensitive keys and safely serializes any value; it never throws and never emits credentials.
- **Human-in-the-loop for irreversible actions.** Mass/external sends, financial postings, and deletions require confirmation (Trust Engine) with a configurable timeout.
- **Sandboxed RPA.** Isolated, ephemeral Docker for web; isolated Windows environment for desktop. Screenshots are captured post-auth or masked before reaching an LLM.
- **Self-hosted & no telemetry.** Data stays on your infrastructure; a 100% local path is available via Ollama.

### Operator responsibilities

- **Never commit secrets.** `.env` is git-ignored; use `.env.example` as a template. Rotate any credential you suspect was exposed.
- Keep your master key (`CES_MASTER_KEY`) outside version control and backups that are world-readable.
- ⚠️ The MVP's unofficial WhatsApp channel (Evolution API) violates WhatsApp's ToS and risks number bans — use a dedicated/disposable test number.

---

## 🇧🇷 Português

Segurança é um **requisito de design P0** na RobbIA. Levamos isso a sério e agradecemos a ajuda da comunidade para manter o projeto e seus usuários seguros.

### Como reportar uma vulnerabilidade

**Por favor, não abra uma issue pública para vulnerabilidades de segurança.**

Em vez disso, reporte de forma privada por um dos canais:

- **GitHub Security Advisories** — [abra um advisory privado](https://github.com/marcioluiskroth/RobbIA/security/advisories/new) (preferido)
- **E-mail** — `marcio@kroth.com.br` com o assunto `[SECURITY] RobbIA`

Inclua: descrição do problema, passos para reproduzir (PoC se possível), componente/versão afetada e o impacto potencial. Buscamos confirmar o recebimento em até **72 horas** e manteremos você informado sobre a correção. A divulgação responsável é creditada, salvo se você preferir permanecer anônimo.

### Versões suportadas

A RobbIA está em **pré-lançamento (MVP em desenvolvimento ativo)**. As correções de segurança miram o branch `main`. Ainda não há linha de release em produção; quando houver, esta tabela será atualizada.

| Versão | Suportada |
|--------|-----------|
| `main` (pré-lançamento) | ✅ |

### Postura de segurança (por design)

- **Isolamento de credenciais (CES).** Segredos com envelope encryption (AES-GCM), chave mestra fora do banco, injetados apenas nos workers de execução em runtime — nunca em prompts, logs ou respostas do LLM.
- **Logs estruturados com redação de segredos.** O logger compartilhado redige chaves sensíveis e serializa qualquer valor com segurança; nunca lança exceção nem emite credenciais.
- **Humano no circuito para Ações Irreversíveis.** Envios em massa/externos, lançamentos financeiros e deleções exigem confirmação (Trust Engine) com timeout configurável.
- **RPA em sandbox.** Docker isolado e efêmero para web; ambiente Windows isolado para desktop. Screenshots são capturados pós-autenticação ou mascarados antes de chegar a um LLM.
- **Self-hosted e sem telemetria.** Os dados ficam na sua infraestrutura; há um caminho 100% local via Ollama.

### Responsabilidades do operador

- **Nunca versione segredos.** O `.env` é ignorado pelo git; use o `.env.example` como modelo. Rotacione qualquer credencial que suspeite ter sido exposta.
- Mantenha sua chave mestra (`CES_MASTER_KEY`) fora do controle de versão e de backups legíveis por terceiros.
- ⚠️ O canal não-oficial de WhatsApp do MVP (Evolution API) viola os ToS do WhatsApp e arrisca banimento de número — use um número dedicado/descartável de teste.
