# ADR-001 — Stack inicial do MVP Sintonia

**Data:** 2026-05-09  
**Status:** Aceito  
**Contexto:** Setup do repositório para MVP a ser demonstrado a parceiro técnico, médico ou investidor.

---

## Contexto e problema

O Sintonia precisa de um MVP web funcional que:
1. Rode no dispositivo do usuário (dados clínicos não saem do device)
2. Possa ser demonstrado em reunião sem instalação de app nativo
3. Permita iteração rápida de produto em janela de 6 meses
4. Suporte futura extração para app mobile (React Native) sem reescrever lógica de negócio

## Decisão

**Framework:** Next.js 15 (App Router) com TypeScript  
**Estilo:** Tailwind CSS 4  
**Storage local:** IndexedDB via `idb` (wrapper tipado sobre a API nativa do browser)  
**LLM cloud:** `@anthropic-ai/sdk` (Claude como modelo cloud padrão do admin no MVP)  
**LLM local (MVP):** placeholder — chamada real a modelo local é v1.0; no MVP, tarefas que exigem modelo local são processadas com aviso de privacidade e fallback para Claude com dados anonimizados quando possível  
**Lint:** ESLint com config Next.js  
**Sem ORM:** IndexedDB direto para dados clínicos; sem banco relacional no browser  
**Sem autenticação no MVP:** usuário único, sem login — dados ficam no dispositivo do próprio usuário

## Alternativas consideradas

| Alternativa | Por que descartada |
|---|---|
| Vite + React puro | Sem SSR, sem facilidade de API routes para proxy de LLM |
| Remix | Menor ecossistema, sem vantagem material para este escopo |
| SQLite (WASM) no browser | Mais complexo que IndexedDB para MVP; considerar para v1.0 |
| Prisma + PostgreSQL local | Overkill para MVP; dados clínicos ficam no device, não em servidor |
| Supabase desde MVP | Introduz risco de dados clínicos em nuvem por acidente; adiado |
| React Native desde MVP | Ciclo de build mais lento; web permite iterar mais rápido |

## Consequências

**Positivas:**
- Stack conhecida, vasto ecossistema, fácil de demonstrar via browser
- App Router do Next.js 15 permite API routes (proxy seguro para Claude) sem servidor separado
- `idb` garante que dados clínicos ficam no IndexedDB do browser, nunca em servidor
- TypeScript desde o início previne bugs de fronteira de privacidade

**Negativas / trade-offs:**
- IndexedDB não tem SQL — queries complexas de histórico longitudinal exigem lógica JS manual
- Modelo local real (Llama, Gemma) não roda no browser padrão; MVP tem limitação aqui
- Sem auth no MVP: demonstrações são com dados de teste, não dados reais de usuário

## Dívidas introduzidas pelo MVP

- `DÍVIDA[mvp]`: modelo local é placeholder — tarefas que exigem LLM local no MVP usam fallback com aviso
- `DÍVIDA[mvp]`: sem autenticação — primeiro usuário é o próprio founder em demonstração

---

*Este ADR é histórico. Não editar após aceito — criar ADR novo para revisões.*
