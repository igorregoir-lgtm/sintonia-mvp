# Dívida Técnica — MVP

Toda dívida marcada com `// DÍVIDA[mvp]: <descrição>` no código aparece aqui.
Antes de qualquer release público, revisar e priorizar.

| # | Arquivo | Descrição | Impacto | Quando pagar |
|---|---|---|---|---|
| D001 | `src/lib/db/types.ts` | ~~`extractedData` é `Record<string, unknown>`~~ | ~~Baixo~~ | **Resolvido 2026-05-09** — union `ExtractedExamData` discriminada por tipo |
| D002 | `src/lib/db/repositories.ts` | ~~Sem paginação nas queries de listagem~~ | ~~Baixo~~ | **Resolvido 2026-05-09** — `limit?: number` via `count` nativo do IndexedDB; paginação por cursor é v1.0 |
| D003 | `src/lib/llm/exam-extractor.ts` + `route.ts` | Texto extraído do exame sai do dispositivo para Claude | **Alto** — viola promessa de privacidade; aceitável para MVP de demonstração | v1.0: substituir por Qwen2.5-VL local (B011) |
| D004 | `src/lib/llm/exam-extractor.ts` | Workers de PDF.js e Tesseract.js carregados de CDN (unpkg) | Médio — falha se CDN offline; latência no primeiro uso | v1.0: auto-hospedar workers |
| D005 | `src/app/api/exams/analyze/route.ts` | API Route sem rate limiting nem autenticação | Alto — qualquer origem pode chamar e consumir quota da API | v1.0: adicionar auth + rate limiting |
