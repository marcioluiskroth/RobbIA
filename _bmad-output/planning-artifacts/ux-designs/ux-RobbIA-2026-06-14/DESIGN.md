---
status: final
updated: 2026-06-14
project: RobbIA
sources:
  - docs/brand-book.md
  - _bmad-output/planning-artifacts/prds/prd-RobbIA-2026-06-14/prd.md
ui_system: shadcn/ui + Tailwind
colors:
  brand:
    graphite: '#334155'    # dominante 60% — estrutura
    charcoal: '#0F172A'    # profundidade 30% — telas/núcleos
    cyan: '#06B6D4'        # energia 10% — gatilho, núcleo IA, ação, "IA" do wordmark
  support:
    slate: '#475569'       # conectores, traços secundários
    steel: '#64748B'       # texto secundário, nós neutros
    cyanLight: '#22D3EE'   # realces, estados ativos
    mist: '#F1F5F9'        # fundos claros, superfícies
    white: '#FFFFFF'
  light:
    bg: '#FFFFFF'
    surface: '#F1F5F9'
    structure: '#334155'
    connectors: '#475569'
    energy: '#06B6D4'
    text: '#1E293B'
    textMuted: '#64748B'
  dark:
    bg: '#0B1220'          # nunca preto puro
    surface: '#0F172A'
    structure: '#475569'
    connectors: '#94A3B8'
    energy: '#22D3EE'
    text: '#F1F5F9'
    textMuted: '#94A3B8'
  state:                   # cores funcionais de status — NÃO são cores de marca
    idle: '#64748B'        # ocioso
    thinking: '#06B6D4'    # pensando (IA Arquiteta projetando)
    active: '#22D3EE'      # ativo (executando)
    waiting: '#F59E0B'     # aguardando aprovação (âmbar)
    done: '#22C55E'        # concluído (verde)
    error: '#EF4444'       # erro (coral)
  accessible:              # variantes AA para TEXTO/foco em tema claro — fills originais acima ficam para ícones/realces ≥24px
    cyanText: '#0E7490'    # cyan-700 — texto/link/foco em ciano sobre fundo claro (AA ~4.7:1); NÃO usar o ciano de marca como texto
    # Badges/rótulos de estado em tema claro usam fill nível-700 + texto branco (não a tonalidade clara como texto):
    waitingFill: '#B45309' # amber-700 (fill + texto branco)
    doneFill: '#15803D'    # green-700 (fill + texto branco)
    errorFill: '#B91C1C'   # red-700 (fill + texto branco)
    thinkingFill: '#0E7490' # cyan-700 (fill + texto branco)
    activeFill: '#0891B2'  # cyan-600/700 (fill + texto branco)
  focus:                   # token de anel de foco — ≥3:1 nos dois temas, nunca ciano puro em fundo claro
    light: '#0E7490'       # cyan-700
    dark: '#22D3EE'        # cyanLight (≥10:1 sobre darkBg)
    width: '2px'
    offset: '2px'
typography:
  sans: 'Inter'            # interface + wordmark (alt: Anthropic Sans)
  mono: 'JetBrains Mono'   # código, valores técnicos, IDs (alt: Fira Code)
  weights: [400, 500]      # Regular + Medium apenas; evitar Bold pesado
  scale:
    h1: { size: '24px', weight: 500, range: '22–28px' }
    h2: { size: '18px', weight: 500 }
    h3: { size: '16px', weight: 500 }
    body: { size: '16px', weight: 400 }
    caption: { size: '13px', weight: 400, range: '12–13px' }
rounded:                   # Confirmado (Marcio): radius moderado 8px (default shadcn)
  base: '8px'
  sm: '4px'
  md: '8px'
  lg: '12px'
  full: '9999px'           # badges/pills de estado
spacing:                   # [ASSUMPTION] — escala base-4 (Tailwind)
  unit: '4px'
  scale: [4, 8, 12, 16, 24, 32, 48, 64]
elevation:                 # [ASSUMPTION] — marca pede limpeza; sombras sutis, sem gradientes pesados
  flat: 'none'
  raised: '0 1px 2px rgba(15,23,42,0.06), 0 1px 3px rgba(15,23,42,0.10)'
  overlay: '0 8px 24px rgba(15,23,42,0.18)'   # modais/popovers
components: [BlockCard, ChatComposer, ModelSelector, StateBadge, FlowNode, LogLine, ConfirmDialog, CredentialPrompt, MascotCore]
---

# RobbIA — DESIGN.md

> Identidade visual da bancada do Arquiteto de Agentes de IA. Formaliza o [brand book](../../../../docs/brand-book.md) no formato DESIGN.md. **Este spine vence em conflito** com qualquer mock ou import. Itens marcados `[ASSUMPTION]` não estavam no brand book e precisam da sua confirmação.

## Brand & Style
A RobbIA é uma **ferramenta de trabalho técnica** — não um app de consumo lúdico. Três qualidades guiam toda decisão visual: **competência técnica, inteligência e ofício profissional**. Visualmente: paleta grafite com energia ciano pontual, formas geométricas precisas, acabamento limpo, alto contraste, estabilidade.

**Voz da marca (aplica-se ao texto de interface):** técnica, inteligente, profissional, confiável. Direta e sem hype. *(A voz dos agentes gerados é configurada por Harness — não governada por este spine; ver EXPERIENCE.md › Voice and Tone.)*

**Mascote robô-fluxo:** robô cuja anatomia inteira é um fluxograma, **sem rosto** (linhas de processo, nunca olhos/boca). Não é decoração: o **núcleo de IA** no centro do losango é um **indicador vivo de estado** (ver Colors › Estados). Elementos podem animar — o fluxo "roda" de cima a baixo.

## Colors
Hierarquia disciplinada **60/30/10**: **Grafite domina (60%)**, **Carvão aprofunda (30%)**, **Ciano energiza (10%)**.

> **Regra de ouro do ciano:** é a cor mais valiosa — usar só nos pontos de energia (gatilho, núcleo de IA, ação final, "IA" do wordmark). Se tudo é ciano, nada se destaca. **O grafite manda; o ciano pontua.**

- **Marca:** Grafite `{colors.brand.graphite}` · Carvão `{colors.brand.charcoal}` · Ciano `{colors.brand.cyan}`.
- **Apoio:** Ardósia `{colors.support.slate}` · Aço `{colors.support.steel}` · Ciano claro `{colors.support.cyanLight}` · Névoa `{colors.support.mist}` · Branco `{colors.support.white}`.
- **Temas claro/escuro nativos** (ambos no MVP): no escuro, cores estruturais sobem um tom (grafite→ardósia) e o ciano fica mais brilhante (`#06B6D4`→`#22D3EE`); fundo nunca é preto puro (`#0B1220`). Tokens em `{colors.light}` / `{colors.dark}`.
- **Estados (funcionais, não-marca):** Ocioso `{colors.state.idle}` · Pensando `{colors.state.thinking}` · Ativo `{colors.state.active}` · Aguardando `{colors.state.waiting}` · Concluído `{colors.state.done}` · Erro `{colors.state.error}`. Usados só como sinalização de status.

### Contraste & uso de cor (AA)
- **Ciano** (`{colors.brand.cyan}` `#06B6D4` / `{colors.support.cyanLight}` `#22D3EE`) é para **ícones/fills ≥24px com texto branco** e para **acentos do tema escuro** (≥7:1 no escuro) — **NÃO** para texto de corpo nem texto pequeno em fundo claro (reprova AA: 2.43:1 / 1.81:1 sobre branco). Para **texto/links/foco em fundo claro** usar `{colors.accessible.cyanText}` (`#0E7490`).
- O **"IA" do wordmark em ciano** é permitido apenas em **tamanho display grande**; em tamanho pequeno sobre fundo claro usar `{colors.accessible.cyanText}` (ou colocar o wordmark sobre superfície escura).
- **Cores de estado como texto/badge no tema claro** devem usar um **fill nível-700 + texto branco** (`{colors.accessible.waitingFill|doneFill|errorFill|thinkingFill|activeFill}`), nunca a tonalidade clara como texto. As tonalidades claras originais ficam reservadas a glifo/indicador grande (≥24px, ≥3:1) e ao tema escuro.
- **Verificar ≥4.5:1 sobre AMBOS** `{colors.light.bg}` (white) **e** `{colors.light.surface}` (`#F1F5F9` névoa): `idle`/`steel`/`error` reprovam como texto sobre névoa — para texto secundário em cards usar `{colors.support.slate}` (`#475569`), não `steel`/`idle`.

## Typography
- **Inter** — interface e wordmark. Apenas **dois pesos**: Regular (400) corpo, Medium (500) títulos/labels/botões. Evitar Bold pesado.
- **JetBrains Mono** — código, nomes de variáveis, hex, IDs, payloads de Bloco.
- **Hierarquia:** H1 `{typography.scale.h1}` · H2 `{typography.scale.h2}` · H3 `{typography.scale.h3}` · Corpo `{typography.scale.body}` · Legenda `{typography.scale.caption}`.

## Layout & Spacing
- **Escala base-4** `{spacing.scale}` (px). `[ASSUMPTION]` — coerente com Tailwind; confirmar.
- **Densidade:** interface profissional, densidade **média-alta** (é uma bancada com muita informação ao vivo), sem sufocar. `[ASSUMPTION]`
- **Grid do builder:** layout de 3 zonas — conversa (esquerda), cards/inspetor do Bloco (centro), fluxo/contexto (direita). Detalhe comportamental em EXPERIENCE.md › Information Architecture. `[ASSUMPTION]`

## Elevation & Depth
A marca pede **limpeza geométrica**: sem sombras pesadas, sem gradientes chamativos. Profundidade vem de **superfícies em camadas** (`bg` → `surface`) e bordas sutis. `[ASSUMPTION]`
- `flat` para a maioria das superfícies; `raised` para cards de Bloco; `overlay` só para modais/popovers (confirmações, seletor de modelo). Tokens em `{elevation}`.

## Shapes
- Formas **geométricas precisas** (herança do mascote-fluxograma). **Decidido:** raio de borda moderado `{rounded.base}` (8px) para cards/inputs; badges de estado em pill `{rounded.full}`.
- Ícones: traço, geométricos, peso consistente (família única; `[ASSUMPTION: Lucide, default do shadcn]`).

## Components
Herdam os defaults do **shadcn/ui**; estendem com os tokens acima. Specs visuais aqui; comportamento em EXPERIENCE.md › Component Patterns.
- **BlockCard** — card de um Bloco proposto: ícone do Tipo, título, modelo de IA sugerido (badge mono), justificativa de 1 linha, ações. Borda esquerda colorida pelo Tipo de Bloco. `[ASSUMPTION: cor por Tipo derivada da paleta de apoio; confirmar mapa de cores por Tipo de Bloco.]`
- **StateBadge** — pill com a cor de `{colors.state}` + rótulo; usado em Bloco/execução/agente.
- **MascotCore** — o núcleo de IA como indicador: cor por estado, animação de pulso (Pensando/Ativo). Respeita `prefers-reduced-motion` (ver EXPERIENCE.md › Accessibility).
- **ChatComposer** — entrada de linguagem natural; envia descrição/refino.
- **ModelSelector** — popover de seleção de Modelo de IA por Bloco (agrupado por Provider).
- **FlowNode** — nó da vista ReactFlow: forma por Tipo de Bloco, conector ciano, núcleo de estado.
- **LogLine** — linha de log em tempo real (mono para dados; cor por nível/estado).
- **ConfirmDialog** — modal de Ação Irreversível (ênfase âmbar/erro, ação destrutiva clara).
- **CredentialPrompt** — pedido de credencial faltante (encaminha ao CES; nunca exibe segredo em claro).

## Block Types (taxonomia visual)
Mapa **autoritativo de render** dos 7 Tipos de Bloco do PRD (§4.3) — `{components.BlockCard}` (borda/realce) e `{components.FlowNode}` (forma do nó) devem renderizar deterministicamente a partir desta tabela. Disciplina do ciano mantida: só **Gatilho** e **Ação** (os endpoints de energia) recebem ciano. `[ASSUMPTION]` — ícones (Lucide) e formas foram inferidos; confirmar.

| Tipo de Bloco | Cor de borda/realce | Ícone (Lucide) | Forma do nó (FlowNode) |
|---|---|---|---|
| **Gatilho** | ciano `{colors.brand.cyan}` (energia/start) | `zap` / `play` | estádio (start) |
| **Contexto** | ardósia `{colors.support.slate}` | `database` | retângulo arredondado |
| **Decisão** | grafite `{colors.brand.graphite}` (coração lógico) | `git-branch` | losango |
| **Resposta** | aço `{colors.support.steel}` | `message-square` | retângulo arredondado |
| **RPA** | ardósia escura (`{colors.support.slate}` + badge de modalidade) | `monitor` (web) / `app-window` (desktop Windows) | retângulo com cantos retos |
| **Ação** | ciano `{colors.brand.cyan}` (ação final = energia) | `send` | estádio (end) |
| **Verificação** | aço `{colors.support.steel}` | `check-circle` | hexágono |

## Do's and Don'ts
**Faça:** grafite dominante, ciano só nos pontos de energia · "IA" do wordmark sempre ciano quando houver cor · escolher tema certo conforme fundo · preservar área de proteção/tamanho mínimo do logo · manter proporções do robô · usar mono para conteúdo técnico.
**Não faça:** ciano como fundo dominante · distorcer/inclinar/esticar o mascote ou logo · adicionar olhos/boca ao robô · cores fora do sistema · sombras/gradientes pesados ou efeitos que tirem a limpeza · logo abaixo do tamanho mínimo · usar âmbar/verde/coral como cor de marca (só status).
