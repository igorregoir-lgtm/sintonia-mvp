# Sintonia

App web de preparação clínica longitudinal — repositório canônico.

Anteriormente publicado como `sintonia-mvp`. Os pitches estáticos que viviam em `Sintonia-Pitch` e `Sintonia-Pitch-2` foram consolidados em [`docs/pitch/`](./docs/pitch/).

## Stack

- Next.js (App Router) + TypeScript + Tailwind
- IndexedDB (`idb`) para dados clínicos no dispositivo
- Claude API para extração estruturada de exames no MVP (fallback; OCR/VL local no backlog)

## Desenvolvimento

```bash
npm install
cp .env.example .env.local   # ANTHROPIC_API_KEY
npm run dev
```

## Documentação do MVP

- ADRs: [`mvp/adr/`](./mvp/adr/)
- Backlog: [`mvp/backlog.md`](./mvp/backlog.md)
- Dívida técnica: [`mvp/divida-tecnica.md`](./mvp/divida-tecnica.md)
- Pitches: [`docs/pitch/`](./docs/pitch/)

## Origem dos pitches

| Conteúdo local | Repo de origem (arquivado) |
|---|---|
| `docs/pitch/produto/` | `igorregoir-lgtm/Sintonia-Pitch` |
| `docs/pitch/tese-mercado/` | `igorregoir-lgtm/Sintonia-Pitch-2` |

Históricos Git dos pitches **não** foram mesclados neste repo (stacks diferentes). Os repos antigos ficam arquivados no GitHub para consulta.
