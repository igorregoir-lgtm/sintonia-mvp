# Dívida Técnica — MVP

Toda dívida marcada com `// DÍVIDA[mvp]: <descrição>` no código aparece aqui.
Antes de qualquer release público, revisar e priorizar.

| # | Arquivo | Descrição | Impacto | Quando pagar |
|---|---|---|---|---|
| D001 | `src/lib/db/types.ts` | `extractedData` em `ExamRecord` é `Record<string, unknown>` — tipar quando parser de exames (M3) estiver definido | Baixo — só afeta autocompletar do TS | v1.0 / ao implementar M3 |
| D002 | `src/lib/db/repositories.ts` | Sem paginação nas queries de listagem — `getAll()` carrega tudo na memória | Baixo para MVP com poucos registros; crítico com histórico longo | v1.0 |
