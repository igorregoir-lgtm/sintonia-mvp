# ADR-002 — Schema IndexedDB (armazenamento clínico local)

**Data:** 2026-05-09  
**Status:** Aceito  
**Contexto:** Definição do schema de dados local para o MVP — todas as entidades clínicas que ficam no dispositivo do usuário.

---

## Contexto e problema

O princípio central do Sintonia é que dados clínicos detalhados nunca saem do dispositivo. No MVP web, o mecanismo de storage local disponível no browser é IndexedDB. Precisamos definir o schema das entidades clínicas e a API de acesso a elas.

## Decisão

**6 object stores no IndexedDB:**

| Store | Chave primária | Índices | Justificativa |
|---|---|---|---|
| `sessions` | `id` | `by-status`, `by-createdAt` | Listar sessões ativas / ordenar por data |
| `scales` | `id` | `by-sessionId`, `by-scaleType` | Buscar escalas de uma sessão; histórico por tipo |
| `medications` | `id` | `by-sessionId` | Histórico farmacológico vinculado à sessão |
| `exams` | `id` | `by-sessionId`, `by-status` | Exames de uma sessão; fila de processamento |
| `tracker` | `id` | `by-date` | Busca por período (range query) |
| `reports` | `id` | `by-sessionId` | Relatórios gerados por sessão |

**Exames guardam o `Blob` do arquivo original** dentro do IndexedDB — decisão consciente. Mantém o arquivo no dispositivo sem custo de infraestrutura; IndexedDB suporta Blobs nativamente.

**Timestamps como `number` (ms desde epoch)**, não `Date` — IndexedDB serializa `Date` mas a representação como número é mais simples para serialização/desserialização e queries de range.

**UUID via `crypto.randomUUID()`** — nativo no browser, sem dependência extra.

## Alternativas consideradas

| Alternativa | Por que descartada |
|---|---|
| SQLite WASM (wa-sqlite, sql.js) | Mais poderoso para queries complexas, mas dependência pesada (~3MB+); IndexedDB é suficiente para o MVP |
| localStorage | Limitado a ~5MB, sem suporte a Blob, sem índices — inadequado para dados clínicos |
| OPFS (Origin Private File System) | Excelente para arquivos grandes, mas API mais baixo nível e suporte ainda parcial em browsers |
| Armazenamento em servidor | Viola o princípio central do produto |

## Consequências

**Positivas:**
- Zero rede para dados clínicos — privacidade garantida por design
- `idb` fornece API tipada e Promise-based sobre a API nativa (que é orientada a eventos)
- Schema versioned — migração futura é controlada via `upgrade()` callback

**Negativas / trade-offs:**
- IndexedDB não tem SQL — joins entre stores exigem lógica JS manual
- Blobs de exames podem crescer — sem limite explícito no MVP (quotas do browser valem)
- IndexedDB só existe no browser — módulo não pode ser importado em Server Components

## Dívidas introduzidas

- `DÍVIDA[mvp]`: `extractedData` em `ExamRecord` é `Record<string, unknown>` — tipar quando o parser de exames (Módulo 3) estiver definido
- `DÍVIDA[mvp]`: sem paginação nas queries de listagem — para MVP com poucos registros é ok; escalar para cursor-based em v1.0

---

*Este ADR é histórico. Não editar após aceito — criar ADR novo para revisões.*
