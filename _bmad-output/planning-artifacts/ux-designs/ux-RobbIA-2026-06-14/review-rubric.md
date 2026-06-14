---
status: review
type: ux-quality-rubric
reviewer: senior UX reviewer
date: 2026-06-14
targets:
  - DESIGN.md (visual identity spine)
  - EXPERIENCE.md (experience/behavior spine)
grounding:
  - prds/prd-RobbIA-2026-06-14/prd.md (PRD v2, 21 FRs)
  - docs/brand-book.md
---

# RobbIA UX Spines — Rubric Review

**Overall verdict:** Strong, launch-credible pair of spines. DESIGN.md is faithful to the brand book (every hex, the 60/30/10 hierarchy, the cyan rule, no-faces mascot, and the two themes all match exactly). EXPERIENCE.md covers the great majority of UI-touching FRs with concrete surfaces, states, and two end-to-end journeys plus a confirmation flow. The gaps are real but bounded: a handful of FRs lack an explicit surface, a few patterns are under-specified for a building agent, and several launch-grade sections (responsive/breakpoints, error taxonomy, empty/onboarding, Harnesses-list and Workspace detail) are thin or absent. None of these are brand-contradictions.

Severity legend: [CRITICAL] blocks build / risks shipping wrong · [HIGH] forces guessing on a core flow · [MEDIUM] notable gap, workable · [LOW] polish.

---

## 1. Coverage — PRD FRs that touch the UI

Mapping of every UI-touching FR to its treatment in EXPERIENCE.md:

| FR | UI surface present? | Where | Verdict |
|---|---|---|---|
| FR-1 Decompose request → Harness | Yes | Builder › Conversa; UJ-1.1 | OK |
| FR-2 Present Harness block-by-block | Yes | Builder › Cards; BlockCard | OK |
| FR-3 Decide per block (approve/swap/rethink) | Yes | Interaction Primitives; BlockCard; State Patterns | OK |
| FR-4 Select AI model per block | Yes | ModelSelector; UJ-1.3 | OK |
| FR-5 Run Harness in sequence w/ state & error handling | Partial | State Patterns (execução); Real-time | Surface for *build-time sequence run* is implicit (folded into Test Mode); OK-ish |
| FR-6 Test Mode w/ simulated data | Yes | Test Mode overlay; UJ-1.6, UJ-2.2 | OK |
| FR-7 RPA web isolated | Yes | RPA Modality Cues; UJ-2; handoff for 2FA/captcha | OK |
| FR-8 Visual verification by LLM | Yes | RPA Modality Cues; UJ-2.3 | OK |
| FR-12 Publish & operate 24/7 | Yes | Operação; Interaction Primitives (Publicar/Pausar) | OK |
| FR-13 Human confirmation for irreversible actions | Yes | Trust & Confirmation; Confirmation flow | OK |
| FR-14 Build/review via chat + cards | Yes | Foundation mental model; ChatComposer | OK |
| FR-16 Ordering & concurrency per conversation | Partial | Real-time (burst serialization) | UI cue stated but thin |
| FR-17 Provider resilience (failover) | Partial | State Patterns (retry n/3); Voice (timeout copy) | Failover *to another Provider* not surfaced as a distinct UI signal |
| FR-18 Channel resilience | Partial | Real-time (reconnecting banner) | Banner covers WS reconnect; channel-level failover/degraded-channel state not surfaced |
| FR-19 Robust irreversible confirmation | Yes | Trust & Confirmation (24h timeout, resilient channel) | OK — strong |
| FR-20 Visual identity & expressive states in UI | Yes | State Patterns (6 states); MascotCore; Accessibility | OK |
| FR-21 RPA native Windows desktop | Yes | RPA Modality Cues; UJ-2.1 badge | OK |

Non-UI-primary FRs (FR-9 providers, FR-10 channels, FR-11 credentials, FR-15 memory) — see findings below; some have material UI surface that is under-served.

### Findings

- **[HIGH] FR-9 (multiple Providers via single interface) has no first-class surface.** *EXPERIENCE.md › Information Architecture* lists "Providers (chaves)" only as a Workspace bullet; there is no flow, empty state, add-provider interaction, or "Provider connected/failed" status surface. ModelSelector is "grouped by Provider" but the provider-management surface itself is undefined. **Fix:** add a Workspace › Providers surface row to the Surface-closure table with a flow (add key → validate → status), and a state set (configured/invalid/unreachable).

- **[HIGH] FR-17 failover is not visible as an experience.** *State Patterns* shows `retry n/3` and *Voice* shows a timeout-retry string, but the PRD's failover (switching to another Provider) is invisible in the UI. An operator watching Operação cannot tell "Claude failed → fell over to OpenRouter." **Fix:** add a log/state cue for provider failover (e.g., a LogLine "Provider X indisponível → failover para Y") and, optionally, a degraded-Provider badge.

- **[MEDIUM] FR-18 (Channel resilience) is only partially surfaced.** *Real-time & Streaming* covers the WebSocket "Reconectando…" banner (which is the UI↔backend link), but FR-18 is about the messaging Channel (Evolution/Telegram) being down. There is no Channel-health surface or degraded-channel state. **Fix:** add a Channel status indicator in Operação and Workspace › Canais (online/degraded/offline), and note interplay with the "resilient confirmation channel" already in Trust & Confirmation.

- **[MEDIUM] FR-15 (persist/recover memory per conversation) has no UI surface.** Nothing in EXPERIENCE.md addresses resuming a conversation, showing prior context, or a "conversation restored" cue. Given the build loop is "a single continuous conversation" (FR-14), recovery after reload is a real surface. **Fix:** add a state/cue for conversation restore (loading prior turns; "conversa recuperada") and define what persists across reload in the Builder.

- **[MEDIUM] FR-16 concurrency cue is asserted, not designed.** *Real-time › Rajada de mensagens* says the UI "reflects serialization … no duplicate/out-of-order responses visible" — this is a non-goal statement, not a surface. **Fix:** specify the actual cue (e.g., queued-message indicator, ordered append in LogLine) or explicitly mark it as "no dedicated UI; correctness is backend-guaranteed."

- **[MEDIUM] FR-10 (Channel as trigger + send) lacks a configuration flow.** Channels appear in the Workspace IA bullet and as a Surface-closure need (FR-11 only). Connecting a WhatsApp/Telegram channel (pairing, QR for Evolution, token entry) is a meaningful onboarding surface with no flow. **Fix:** add Workspace › Canais connect flow (and its states: pairing/connected/expired).

- **[LOW] FR-5 build-time sequence run is folded into Test Mode without being named.** Acceptable, but the spine never says "running the full sequence = Test Mode." **Fix:** one sentence linking FR-5 sequence execution to the Test Mode surface.

---

## 2. Decision-readiness — concrete enough to build without guessing?

### Findings

- **[HIGH] BlockCard "Tipo de Bloco" taxonomy and its color/icon map are undefined.** Both spines lean on "Tipo de Bloco" (left border colored by Type — DESIGN.md › Components; BlockCard) and UJ-1.2 enumerates types informally (Gatilho, Contexto, Decisão, Resposta, Ação). There is no canonical list of Block Types, nor the per-Type color map (DESIGN.md flags it `[ASSUMPTION: confirmar mapa de cores por Tipo]`). An agent cannot render BlockCard borders or FlowNode shapes deterministically. **Fix:** add a Block-Type registry (name, icon, border color from support palette, FlowNode shape) shared by BlockCard and FlowNode. This is the single biggest build-blocker.

- **[HIGH] FlowNode "shape per Block Type" is referenced but never specified.** *DESIGN.md › Components › FlowNode* says "forma por Tipo de Bloco" and *EXPERIENCE.md › FlowNode* says shapes vary, but no shape vocabulary exists. **Fix:** define the shape set alongside the Block-Type registry above.

- **[MEDIUM] RPA modality badge visuals are an open assumption.** *RPA Modality Cues* says "ícone/badge distinto … `[ASSUMPTION: ícones distintos por modalidade]`." Two modalities (web / desktop Windows) need concrete icons + labels. **Fix:** specify the two badges (icon + label text, e.g., "Web (Playwright)" / "Desktop Windows").

- **[MEDIUM] ModelSelector "cost/latency hint" is an unspecified assumption.** *Component Patterns › ModelSelector* mentions "dica de custo/latência relativa `[ASSUMPTION]`." Format unspecified (badges? tiers? numbers?). **Fix:** define the hint representation (e.g., relative tier chips $/$$/$$$ + latency dot) or drop it from MVP.

- **[MEDIUM] Test Mode is "overlay no fluxo" but its layout/interaction is undefined.** *Surface-closure* row says Test Mode is an overlay on the flow zone; no spec of how simulated input is entered, how per-block streaming displays, or how the user advances/stops. UJ-1.6 describes the happy path narratively only. **Fix:** add a Test Mode pattern entry (input affordance, per-block live output, stop/step controls, where the verdict/screenshot appears).

- **[MEDIUM] "Repensar" scope is clear in copy but undefined in state.** State Patterns shows `proposto → repensando` but not what the user sees during rethink (the rest of the cards frozen? the single card in a loading state?) nor how the alternative is presented (replace vs. compare). **Fix:** define the rethink interaction (single-card loading state; replace-in-place vs. accept/reject alternative).

- **[LOW] Several base assumptions remain unconfirmed** (spacing base-4, density "média-alta", Lucide icons, WCAG 2.1 AA target, light/dark contrast pass). All are reasonable defaults and clearly tagged `[ASSUMPTION]`, but they should be confirmed before build to avoid rework. **Fix:** resolve the `[ASSUMPTION]` tags with the brand owner; especially confirm the cyan-on-white contrast note (already flagged — cyan `#06B6D4` likely fails AA for small text).

---

## 3. Internal coherence — token cross-references & brand alignment

**Token cross-reference audit (EXPERIENCE.md `{...}` → DESIGN.md frontmatter):** All referenced tokens resolve.
- `{components.BlockCard|FlowNode|MascotCore|CredentialPrompt|ModelSelector|ConfirmDialog}` → all present in DESIGN.md `components:`.
- `{colors.state.idle|thinking|active|waiting|done|error}` → all present.
- `{colors.light}` / `{colors.dark}`, `{spacing.scale}`, `{elevation}`, `{rounded.*}`, `{typography.scale.*}` → all present.
- No dangling token found.

**Brand book alignment audit (DESIGN.md vs docs/brand-book.md):** Faithful. 60/30/10 hierarchy, the cyan golden rule, all brand hex (graphite `#334155`, charcoal `#0F172A`, cyan `#06B6D4`), support palette, the two-theme tone-shift (graphite→ardósia, `#06B6D4`→`#22D3EE`, bg never pure black `#0B1220`), the six functional state colors, the no-faces mascot rule, and the Do/Don't list all match the brand book exactly. No contradiction detected.

### Findings

- **[MEDIUM] `MascotCore` and `StateBadge` are conflated in EXPERIENCE.md.** *Component Patterns* writes "**MascotCore (StateBadge)** — indicador de estado." DESIGN.md defines them as two distinct components (MascotCore = animated AI core indicator; StateBadge = pill with state color + label). Treating them as one risks an engineer shipping a single component and dropping the textual-label accessibility requirement (which lives on StateBadge). **Fix:** separate them in Component Patterns; clarify MascotCore = mascot core animation, StateBadge = labeled pill, and that the accessibility "color is not the only signal" rule is carried by StateBadge.

- **[LOW] `StateBadge` is in DESIGN.md `components:` but never gets a behavior entry in EXPERIENCE.md** (only appears merged into the MascotCore line). **Fix:** give StateBadge its own one-line behavior spec (where it appears: Block, execution, agent).

- **[LOW] Active state color naming is internally consistent but worth a sanity check.** Both spines use cyan `#06B6D4` for "Pensando/thinking" and cyan-light `#22D3EE` for "Ativo/active" and for dark-theme energy. This means in dark theme the base energy color equals the "Ativo" state color — a potential ambiguity between "this is the energy accent" and "this block is actively running." **Fix:** confirm dark-theme disambiguation (e.g., Ativo uses pulse/animation, not just hue) — the MascotCore pulse may already cover this; state it explicitly.

---

## 4. Surface closure — every need has a surface; every surface lands via a flow

The explicit Surface-closure table (EXPERIENCE.md › Information Architecture) is a strong artifact and covers the build loop, test, publish, operate, confirm, credential, and model-swap needs with flows. Gaps:

- **[HIGH] Workspace surfaces (Providers, Canais, Credenciais, tema) are listed in IA nav but absent from the Surface-closure table and have no flows.** Nav item #4 "Workspace" enumerates four sub-areas; none appear as rows with a landing flow. **Fix:** add Workspace rows (Providers / Canais / Credenciais / Tema) each with a flow, even if brief.

- **[MEDIUM] Harnesses list (nav item #1) has no surface/flow row.** The first thing a user sees ("lista dos agentes … criar, abrir, status") is undefined beyond the nav bullet — no empty state defined here (the generic empty-state example lives in State Patterns but isn't tied to this surface), no create/open/status flow. **Fix:** add a Harnesses-list surface row with its create/open flow and its empty/loading/list states.

- **[MEDIUM] Operação confirmation queue exists, but the broader Operação dashboard (running executions, agent status board) has no layout/flow.** It's referenced (logs, queue) but the operate-and-monitor surface itself isn't laid out the way the Builder 3-zone layout is. **Fix:** add an Operação layout sketch (executions list, live logs, confirmation queue, agent state board).

- **[LOW] Test Mode is mapped as a surface but, per §2, lacks an internal flow.** Cross-referenced above. **Fix:** as in §2.

---

## 5. Gaps / missing sections — launch-grade completeness

- **[HIGH] No responsive / breakpoint / minimum-viewport guidance.** Foundation says "desktop-first, mobile out of MVP," which is fine, but there is zero guidance on minimum supported width, how the 3-zone Builder collapses on smaller desktop/laptop screens, or what happens below the minimum. A bench with "much live information" at base-4 density needs a stated minimum. **Fix:** add a Responsive/Viewport note (min width, zone-collapse behavior, scroll vs. reflow).

- **[MEDIUM] No consolidated error/empty-state taxonomy.** Errors appear scattered (Voice example, State Patterns `erro-escalado`, retry). There is no single catalog of error categories (provider down, channel down, credential missing/expired, RPA layout-change failure, test failure, publish failure) mapped to surface + copy pattern + recovery action. **Fix:** add an Error & Empty States section that enumerates categories → surface → microcopy pattern → recovery action.

- **[MEDIUM] No onboarding / first-run experience.** First-time arrival (no Providers, no Channels, no Harnesses) is the most fragile moment and is uncovered beyond a one-line empty-state example. **Fix:** add a First-Run section (connect first Provider/Channel → create first Harness), reusing the empty states.

- **[MEDIUM] Notifications / alerting are referenced but not designed.** UJ-2 edge case says the system "notifica Marina" on persistent RPA failure, and Trust relies on the operator seeing the confirmation queue, but there is no notification surface (in-app toast? email? channel message?) or rules for when the architect is not actively watching the bench (a 24/7 agent runs unattended). **Fix:** add a Notifications section (channels, triggers: irreversible-action-pending, escalated-error, provider/channel-down; relationship to the 24h confirmation timeout).

- **[LOW] No explicit copy/i18n note beyond PT-BR voice.** Voice section is PT-BR; no statement on whether UI strings are localizable or PT-BR-only for MVP. **Fix:** one line on i18n scope for MVP.

- **[LOW] No loading-skeleton / performance-perception guidance** for the live bench (streaming start, card generation latency while "Pensando"). The thinking state exists, but skeletons/optimistic UI aren't specified. **Fix:** brief note on loading affordances during Pensando/card generation.

- **[LOW] Accessibility floor is solid but tagged `[ASSUMPTION]` at the target level.** WCAG 2.1 AA is the right call; confirm it's a committed target, and resolve the flagged cyan-text contrast risk into an enforced rule (cyan never for small body text). **Fix:** promote from assumption to committed requirement; encode the cyan-text rule.

---

## Top fixes to unblock build (priority order)

1. **[HIGH §2/§4]** Define the **Block-Type registry** (Type list → icon, border color, FlowNode shape, RPA modality badge). Unblocks BlockCard + FlowNode rendering.
2. **[HIGH §1]** Surface **Provider management + failover visibility** (FR-9, FR-17).
3. **[HIGH §4/§5]** Add **Workspace, Harnesses-list, and Operação dashboard** surfaces/flows + a **responsive/min-viewport** note.
4. **[MEDIUM §2]** Specify **Test Mode internal flow** and **Repensar interaction**.
5. **[MEDIUM §5]** Add **Error/empty taxonomy, First-Run, and Notifications** sections.
6. **[MEDIUM §3]** **De-conflate MascotCore vs StateBadge**; give StateBadge its own behavior + accessibility ownership.
