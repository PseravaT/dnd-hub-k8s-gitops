# Design Brief — DnD Hub (Versão 3.0 Command Center)

- **Produto/tema:** DnD Hub — Plataforma Cloud-Native de Fichas, Campanhas e Rolagens para Dungeons & Dragons 5e / 5.5e (`dndmanager :8080` + `APIdados :8081`).
- **Público e dispositivo principal:** Jogadores e mestres de RPG de mesa em desktop (1024px–1440px) durante criação/preparação de fichas e mobile/tablet (360px–768px) como companheiro interativo na mesa.
- **Personalidade visual:** Épico, Tátil, Preciso (Digital Skeuomorphism encontra Command Center moderno).
- **Paleta:**
  - Primária: Ouro Imperial (`#d4af37` escuro / `#946917` claro)
  - Secundária: Carmesim de Batalha (`#9e2a2b`)
  - Acento Arcano: Ciano Místico (`#48bfe3` escuro / `#0c6a8f` claro)
  - Neutros: Obsidiana Noturna (`#0c0f17`, `#141923`) e modo claro Pergaminho Solar (`#f8f6f0`, `#ffffff`)
  - Feedback: Sucesso (`#2e8b57`), Erro (`#ef4444`), Aviso (`#f59e0b`)
- **Tipografia:** Títulos em `Cinzel` / `Cinzel Decorative` com escala fluida `clamp()`, corpo e métricas densas em `Inter`, modificadores e rolagens em `monospace`.
- **Forma:** Bordas ornamentadas sutis (`1px solid var(--border)`), raios `6px`–`14px`, superfícies translúcidas (`backdrop-filter: blur(16px)`) e sombras profundas.
- **Densidade e layout:** Equilibrado nas telas de autenticação; Command Center estruturado em métricas, filtros, barra de status dos microsserviços e grade responsiva no Dashboard e Ficha.
- **Motion:** Sutil, tátil e com propósito (`power3.out`, `0.25s–0.6s`, deslocamento `16px`, stagger `0.06s`), animando apenas `transform` e `opacity`/`autoAlpha` com cleanup via `useGSAP` e respeito a `prefers-reduced-motion`. Movimento assinatura: **Rolagem Tátil de Dados (4d6 / d20)** com destaque crítico/falha e contador animado em GSAP.
- **Referências:**
  - *D&D Beyond:* Hierarquia modular de atributos e perícias, cálculo automático de modificadores e bônus de proficiência, busca e filtros rápidos.
  - *Alchemy RPG:* Atmosfera imersiva de alta fantasia, painéis flutuantes translúcidos sobre fundo temático escuro e foco narrativo.
  - *Baldur's Gate 3:* Molduras metálicas douradas discretas, agrupamento orientado a ação (testes rápidos de d20 clicáveis nas perícias/atributos) e feedback visual de acerto crítico (20 natural) ou falha crítica (1 natural).

