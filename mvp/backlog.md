# Backlog — fora do MVP

Funcionalidades adiadas explicitamente para v1.0+.
Cada linha: o que é, por que adiado, em qual versão entra.

| # | Funcionalidade | Por que fora do MVP | Versão alvo |
|---|---|---|---|
| B001 | Sincronização entre dispositivos (E2E) | MVP opera sem sync; usuário exporta manualmente | v1.0 |
| B002 | Backup encriptado na nuvem | Depende de infraestrutura de chaves — complexidade alta | v1.0 |
| B003 | Exames DICOM / HL7 / FHIR | Parsers especializados; MVP cobre só PDF | v1.0 |
| B004 | ML local de padrões longitudinais | Requer massa de dados que MVP ainda não tem | v1.0 |
| B005 | ML federado opt-in | Infraestrutura de agregação; não tem dado para treinar | v2.0 |
| B006 | Painel administrativo de modelos | Admin do MVP configura via env; painel é v1.0+ | v1.0 |
| B007 | Suporte a múltiplos modelos cloud com fallback | MVP usa Claude fixo; roteamento dinâmico é v1.0 | v1.0 |
| B008 | Apps mobile nativas (iOS/Android) | MVP é web; mobile é v1.0+ | v1.0 |
| B009 | Internacionalização (EN, ES) | MVP só PT-BR | v2.0 |
| B010 | Programa para profissionais de saúde | Requer fluxo B2B2C diferente | v3.0 |
| B011 | Modelo local de visão para OCR de exames (**Qwen2.5-VL candidato preferencial**) | MVP usa Tesseract.js (OCR) + Claude API (análise); modelo local entra quando demo for em ambiente controlado e 1.2GB de download for aceitável. Candidatos por tier: **2B** para browser/mobile premium, **7B** para desktop via Ollama/MLX. Supera Gemma 3 em PT-BR e tem licença Apache 2.0. | v1.0 |
