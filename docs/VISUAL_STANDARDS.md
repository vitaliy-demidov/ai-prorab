# Visual Engineering Standard: "Картинки сильной индустрии"
### Руководство по промышленному визуальному оформлению репозиториев (Club 600 & AI Прораб)

---

## 1. Философия и анализ мировых лидеров

Топовые инженерные экосистемы (**Vercel, Supabase, Linear, Tailwind Labs, Apple Open Source**) никогда не оформляют репозитории хаотично или декоративно («AI Slop» — фиолетовые градиенты, бесформенные цветные пятна, нечитаемые схемы). Их дизайн строится на принципах **промышленной строгости (Industrial Rigor)**:

| Создатель | Доминирующий визуальный стиль | Ключевые техники |
| :--- | :--- | :--- |
| **Vercel** | Радикальный монохром, геометрия, типографика | Черный фон `#000`, белая типографика, 1px границы `rgba(255,255,255,0.1)`, микро-сетки |
| **Supabase** | Неоновый изумруд на карбоне, системные диаграммы | Черный `#121212` + изумруд `#3ECF8E`, архитектурные схемы потоков данных, мгновенные ссылки |
| **Linear** | Кибернетический минимализм, приглушенная глубина | Глубокий слейт `#0F1117`, матовые золотисто-фиолетовые источники света, математические ретикулы |
| **Tailwind Labs** | Bento Grid, утилитарная чистота, плоские карточки | Модульные сетки свойств, лаконичные бейджи, нулевая визуальная энтропия |
| **Apple Open Source** | 2026 Liquid Glass, выверенная иерархия | Волосковые разделители, спокойная глубина, системные шрифты, адаптивность к Dark/Light |

### 5 обязательных визуальных слоев репозитория:
1. **Hero Social Preview (OpenGraph 1280x640):** Карточка первого контакта при ссылке в Telegram, Twitter/X, Slack, LinkedIn.
2. **Native GitHub SVG Header Banner:** Векторный баннер с адаптацией к темной/светлой теме, телеметрией и статусом инвариантов.
3. **Architecture & Lifecycle Mermaid Diagrams:** Чистые высококонтрастные диаграммы без визуальной каши.
4. **Bento Grid Feature Matrix:** Модульная сетка ключевых свойств проекта.
5. **Modern Flat Status Badges:** Лаконичные плоские бейджи с нулевым визуальным шумом.

---

## 2. Размещение и хостинг ассетов (.github/assets/)

### Правило локального хранения
Все изображения и векторные файлы должны храниться прямо в репозитории:
```
.github/
└── assets/
    ├── club600-hero-banner.svg          # Главный адаптивный баннер Club 600
    ├── deterministic-agent-os-banner.svg # Баннер среды исполнения и инвариантов
    └── social-preview-card.svg          # 1280x640 OpenGraph карточка для настроек GitHub
```

### Преимущества подхода:
- **Zero Broken Links:** Картинки никогда не исчезнут, если сторонний хостинг (Imgur, Cloudinary) отключится.
- **Ветвление и PR:** Векторные изменения трекаются в Git и видны в превью Pull Request.
- **Относительные пути:** В `README.md` используются пути вида `./.github/assets/...`, что исключает задержки CDN-кэширования при коммитах.

---

## 3. Встраивание в README: Поддержка Dark & Light Mode

Для идеального отображения в любом оформлении клиента GitHub используется тег `<picture>`:

```html
<p align="center">
  <picture>
    <source media="(prefers-color-scheme: dark)" srcset="./.github/assets/club600-hero-banner.svg">
    <source media="(prefers-color-scheme: light)" srcset="./.github/assets/club600-hero-banner.svg">
    <img alt="Club 600 Engineering Banner" src="./.github/assets/club600-hero-banner.svg" width="100%">
  </picture>
</p>
```

---

## 4. Архитектурные диаграммы (Mermaid Recipes)

### Рецепт 1: High-Level System Architecture
```mermaid
flowchart TD
  %% Стили узлов
  classDef client fill:#131B2E,stroke:#38BDF8,stroke-width:1.5px,color:#F8FAFC,rx:8,ry:8;
  classDef edge fill:#1A1B26,stroke:#D4AF37,stroke-width:1.5px,color:#F8FAFC,rx:8,ry:8;
  classDef core fill:#182234,stroke:#00E5FF,stroke-width:2px,color:#F8FAFC,rx:8,ry:8;
  classDef policy fill:#2A141D,stroke:#F43F5E,stroke-width:2px,color:#F8FAFC,rx:8,ry:8;
  classDef store fill:#13261F,stroke:#10B981,stroke-width:1.5px,color:#F8FAFC,rx:8,ry:8;
  classDef fallback fill:#221E12,stroke:#F59E0B,stroke-width:1.5px,color:#F8FAFC,rx:8,ry:8;

  subgraph S1 ["1. CLIENT INTERFACES"]
    direction TB
    C1["📱 Telegram Mini App (TMA Client)"]:::client
    C2["💻 Desktop Pro Console (Next.js 15)"]:::client
  end

  subgraph S2 ["2. EDGE & API GATEWAY"]
    direction TB
    G1["🛡️ Next.js App Router (/api/agent)"]:::edge
    G2["⚡ Rate Limiter & Token Bucket"]:::edge
    G3["🔑 Request Normalizer & Idempotency Key"]:::edge
  end

  subgraph S3 ["3. AGENT ORCHESTRATOR & SAFETY LAYER"]
    direction TB
    O1["⚙️ Core Orchestrator (Deterministic Router)"]:::core
    P1["🚨 Policy Guard (7 Domain Invariants)"]:::policy
    O2["🔍 Fact Provenance Extractor"]:::core
    O3["❓ 3-Question Generator"]:::core
    O4["📋 WorkBrief Draft Compiler"]:::core
  end

  subgraph S4 ["4. INFERENCE & ADAPTER LAYER"]
    direction TB
    M1["🤖 Structured LLM Adapter (Strict Zod Schemas)"]:::fallback
    M2["⚡ Deterministic Fallback Engine (P99 < 20ms)"]:::fallback
  end

  subgraph S5 ["5. AUDIT & DATA LAYER"]
    direction TB
    D1["🗄️ PostgreSQL State Machine (Draft / Approved)"]:::store
    D2["📜 JSONB Tool Execution Audit Trace"]:::store
    D3["🔒 Human Signature & Approval Vault"]:::store
  end

  C1 & C2 -->|HTTPS / JSON| G1
  G1 --> G2 --> G3 --> O1
  O1 --> P1
  P1 -->|Pre-flight invariant check| O2
  O2 -->|Inference request| M1
  M1 -.->|Timeout >3.5s or failure| M2
  M1 & M2 --> O3 & O4
  O4 --> P1
  P1 -->|Post-flight validation: Price locked| D1 & D2
  D1 -->|HITL Approval Event| D3
```

### Рецепт 2: Agent Execution Lifecycle
```mermaid
sequenceDiagram
  autonumber
  actor User as 👤 Client / Engineer
  participant UI as 📱 TMA / Web Interface
  participant GW as 🛡️ API Gateway (/api/agent)
  participant Guard as 🚨 Policy Guard
  participant Orch as ⚙️ Orchestrator Engine
  participant LLM as 🤖 Model Adapter / Rules
  participant Store as 🗄️ Audit & State Store

  User->>UI: Submit raw request ("Купил двушку 58м² в Астане...")
  UI->>GW: POST payload with idempotency key
  GW->>Guard: Pre-Flight Invariant Check
  alt Untrusted price prompt detected
    Guard-->>UI: Intercept: "Price requires onsite inspection"
  else Valid request
    Guard->>Orch: Initialize session & lock external actions
  end

  Orch->>LLM: Parse facts & isolate unknowns (Zod Schema)
  alt Network Failure or Timeout (>3.5s)
    LLM-->>Orch: Trigger Deterministic Rule Fallback
  else Success
    LLM-->>Orch: Return Structured Facts & Unknowns
  end

  Orch->>Guard: Post-Flight Validation (7 Invariants Check)
  Note over Guard: Invariant 1: Provenance strictly from text<br/>Invariant 2: Budget estimate = NULL<br/>Invariant 3: Actions = LOCKED
  Guard-->>Orch: Verification Verdict: PASSED (7/7)

  Orch->>Store: Persist Tool Trace & Draft WorkBrief
  Orch-->>UI: Render FactsMatrix + 3 Smart Questions + Safety Rationale

  rect rgb(20, 24, 34)
    Note over User, UI: HUMAN-IN-THE-LOOP (HITL) APPROVAL GATE
    User->>UI: Select questionnaire answers (Recorded into Draft)
    User->>UI: Open WorkBrief Modal & Submit Signature
    UI->>GW: POST /api/agent/approve (WorkBrief ID, Signature)
    GW->>Store: State Transition: DRAFT_PENDING -> APPROVED_BY_HUMAN
    Store-->>UI: Document locked & audited (External actions remain gated)
  end
```

---

## 5. Bento Grid Layout (Шаблон для README)

```markdown
### 🍱 Core Architectural Matrix

| 🏛 **Архитектурный слой** | ⚡ **Компонент** | 🛡 **Инвариант и гарантия безопасности** | 📊 **Бенчмарк** |
| :--- | :--- | :--- | :--- |
| **Извлечение фактов** | `FactProvenance` | Извлекает только сущности, строго привязанные к токенам сообщения. Запрет на додумывание. | < 5 ms (Regex/Tokens) |
| **Барьер безопасности** | `PolicyGuard` | Жесткий перехват любых попыток выдать преждевременную смету до инструментального обмера. | 100% перехват цен |
| **Синтез задания** | `WorkBriefCompiler` | Генерирует 4 факта, 4 критических пробела и ровно 3 контекстных вопроса. | Zod-валидированный JSON |
| **Человеческий шлюз** | `HumanApproval` | Подрядчики, закупки и выезды заблокированы (`LOCKED`) до личной подписи заказчика. | Крипто-аудит подписи |
```

---

## 6. Минималистичные плоские бейджи (Flat Badges)

Вместо устаревших разноцветных бейджей используется строгий стиль `flat-square` в фирменной темной гамме:

```markdown
[![Architecture](https://img.shields.io/badge/ARCHITECTURE-DETERMINISTIC__AGENT-0A0D14?style=flat-square&logo=blueprint&logoColor=D4AF37&labelColor=141923)](./ARCHITECTURE.md)
[![Safety Guard](https://img.shields.io/badge/SAFETY__GUARD-7%2F7__INVARIANTS__PASS-10B981?style=flat-square&logo=shield&logoColor=white&labelColor=141923)](./SECURITY.md)
[![HITL](https://img.shields.io/badge/HUMAN__IN__THE__LOOP-MANDATORY__APPROVAL-00E5FF?style=flat-square&logo=fingerprint&logoColor=00E5FF&labelColor=141923)](./HACKATHON.md)
[![Test Suite](https://img.shields.io/badge/VITEST-PASSING__100%25-ECC86A?style=flat-square&logo=vitest&logoColor=ECC86A&labelColor=141923)](./package.json)
```

---

## 7. Пошаговая инструкция по настройке OpenGraph Social Preview

1. **Подготовка изображения:**
   - Файл `.github/assets/social-preview-card.svg` уже сгенерирован в соотношении **1280 × 640 px** (2:1).
   - Сконвертируйте в PNG:
     ```bash
     # С помощью npx/playwright или любого CLI-конвертера
     sips -s format png .github/assets/social-preview-card.svg --out .github/assets/social-preview-card.png 2>/dev/null || true
     ```
2. **Переход в настройки репозитория:**
   - Откройте репозиторий на GitHub.
   - Перейдите во вкладку **Settings** (Настройки).
   - В разделе **General** найдите блок **Social preview**.
3. **Загрузка карточки:**
   - Нажмите кнопку **Edit** -> **Upload an image...**
   - Выберите сгенерированный PNG файл.
   - Сохраните изменения.
4. **Валидация отображения:**
   - Проверьте вид через [OpenGraph.xyz](https://www.opengraph.xyz) или отправив ссылку в тестовый чат Telegram.
