# Dívida Técnica — MVP

Toda dívida marcada com `// DÍVIDA[mvp]: <descrição>` no código aparece aqui.
Antes de qualquer release público, revisar e priorizar.

| # | Arquivo | Descrição | Impacto | Quando pagar |
|---|---|---|---|---|
| D001 | `src/lib/db/types.ts` | ~~`extractedData` é `Record<string, unknown>`~~ | ~~Baixo~~ | **Resolvido 2026-05-09** — union `ExtractedExamData` discriminada por tipo |
| D002 | `src/lib/db/repositories.ts` | ~~Sem paginação nas queries de listagem~~ | ~~Baixo~~ | **Resolvido 2026-05-09** — `limit?: number` via `count` nativo do IndexedDB; paginação por cursor é v1.0 |
