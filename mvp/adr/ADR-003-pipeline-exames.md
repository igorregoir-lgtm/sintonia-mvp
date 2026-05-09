# ADR-003 — Pipeline de processamento de exames (MVP)

**Data:** 2026-05-09  
**Status:** Aceito  
**Contexto:** Implementação do Módulo 3 do MVP — upload, extração e análise de exames em PDF.

---

## Contexto e problema

O Sintonia precisa extrair dados estruturados de laudos médicos brasileiros (laboratoriais, imagens, polissonografia) enviados pelo usuário como PDF. A restrição central é que dados clínicos detalhados não devem sair do dispositivo — mas no MVP isso é relaxado conforme ADR-001 (placeholder de modelo local).

## Decisão

**Pipeline em dois estágios:**

**Estágio 1 — Extração de texto (100% local, browser):**
1. PDF.js extrai texto de PDFs digitais (laudos gerados por sistemas — 90%+ dos casos no Brasil)
2. Se texto extraído < 100 caracteres → PDF é escaneado → Tesseract.js faz OCR com idiomas `por + eng`
3. Resultado: string de texto bruto

**Estágio 2 — Análise estruturada (Claude via API Route):**
1. Texto enviado para `/api/exams/analyze` — rota server-side do Next.js
2. API Route chama Claude com prompt estruturado para extrair `ExtractedExamData`
3. Claude detecta tipo de exame automaticamente e retorna JSON tipado
4. Em caso de parse failure → fallback para `ExtractedOtherData` com texto bruto
5. Resultado salvo no IndexedDB via repositório `exams`

**Modelo Claude:** `claude-sonnet-4-6` — melhor custo/qualidade para extração estruturada

**Por que API Route e não chamada direta do browser:**
- Mantém `ANTHROPIC_API_KEY` no servidor — nunca exposta no bundle do client
- Permite adicionar rate limiting, autenticação e logging server-side em v1.0

## Fronteira de privacidade neste MVP

**O texto extraído do PDF sai do dispositivo** ao ser enviado para `/api/exams/analyze`. Esta é a dívida de privacidade mais relevante do MVP, documentada em D003. Em v1.0 o Estágio 2 roda em modelo local (Qwen2.5-VL — B011 no backlog).

## Alternativas consideradas

| Alternativa | Por que descartada |
|---|---|
| Tesseract.js para todos os PDFs | PDF.js é mais rápido e preciso para PDFs digitais; Tesseract é fallback |
| Claude Vision (enviar imagem do PDF) | Mais caro, exige renderizar PDF como imagem, sem vantagem sobre texto extraído |
| Qwen2.5-VL no browser (WebGPU) | 1.2GB mínimo; inaceitável para MVP de demonstração |
| Processamento server-side (upload do PDF) | PDF clínico bruto subindo para servidor viola o princípio central |

## Consequências

**Positivas:**
- API Route garante que a chave Anthropic nunca vaza para o frontend
- Fallback robusto: sempre retorna algo (mesmo que `ExtractedOtherData`)
- PDF.js cobre os casos mais comuns sem latência de OCR

**Negativas / trade-offs:**
- Texto do exame sai do dispositivo em direção ao Claude — dívida de privacidade explícita
- Dependência de CDN para workers de PDF.js e Tesseract.js no primeiro carregamento

## Dívidas introduzidas

- `DÍVIDA[mvp]`: texto extraído do exame sai do dispositivo para análise Claude (D003)
- `DÍVIDA[mvp]`: workers de PDF.js e Tesseract carregados de CDN (D004)
- `DÍVIDA[mvp]`: API Route sem rate limiting nem autenticação (D005)

---

*Este ADR é histórico. Não editar após aceito — criar ADR novo para revisões.*
