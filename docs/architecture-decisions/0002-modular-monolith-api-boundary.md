# ADR 0002: Modular Monolith API and Service Architecture

* **Status**: Accepted
* **Date**: 2025-03-30
* **Deciders**: Kārigar Engineering Architecture Board

## Context and Problem Statement

The Kārigar marketplace requires backend capabilities for product catalogue queries, search indexing, bag/cart synchronization, multi-seller checkout, payment webhooks, inventory management, seller order fulfillment, and content publishing.

Given the small team size and need for high engineering velocity, we must choose between a microservices architecture, serverless functions, or a structured Modular Monolith backend.

## Decision Drivers

1. **Solo / Small Team Efficiency**: Microservices introduce distributed tracing, inter-service networking, deploy orchestration, and transactional complexity (sagas) that slow small teams down.
2. **Domain Boundaries**: The marketplace contracts (`docs/domain-model.md`, `docs/marketplace-contract.md`) define strict domain contexts (Catalogue, Seller, Order, Inventory, Financial Settlement). These can be cleanly represented as isolated modules inside a single codebase.
3. **End-to-End Type Safety**: A Node.js/TypeScript backend allows sharing domain types (`src/types/catalog.ts`) and API route contracts directly between frontend and backend.
4. **Data Consistency**: Multi-seller order generation and inventory allocations require transactional ACID guarantees across table boundaries.

## Decision Outcome

**Chosen Option**: Modular Monolith Node.js/TypeScript backend using REST HTTP/JSON endpoints.

### Core Architectural Boundaries

The backend system is organized into decoupled internal modules:
1. `modules/catalogue`: Crafts, Regions, Artisans, Products, Variants.
2. `modules/search`: Provider-agnostic search contract implementation (in-memory, PostgreSQL FTS, or external indexer).
3. `modules/inventory`: Mutable stock counts, reservations, lead times, allocation checks.
4. `modules/order`: Top-level customer order, multi-seller `SellerOrder` decomposition, fulfillment state machines.
5. `modules/seller`: Seller profiles, verification, bank details, isolated seller dashboard endpoints.
6. `modules/payment`: Payment intent creation, gateway webhooks, escrow state, refund processing.
7. `modules/identity`: Authentication (JWT / HTTP-only session cookies), RBAC authorization, and seller data isolation.

### Positive Consequences

* **Single Deployment Unit**: Deploys as a unified service (e.g. Docker on AWS ECS / Render / Fly.io) with zero network overhead for internal module calls.
* **ACID Transactions**: Direct database transactions for payment capture, multi-seller order splitting, and stock allocation.
* **Type Safety**: Shared contract definitions with zero runtime overhead or code generation bloat.
* **Refactoring Ease**: Refactoring domain interfaces is checked directly by TypeScript compilation (`tsc`).

### Rules & Invariants

1. Modules MUST communicate through exported service interfaces, NOT by reaching directly into another module's database tables or internal utilities.
2. Cross-module operations requiring asynchronous side-effects (e.g. order placed -> search index update) use internal event emitters or in-memory job queues rather than tight synchronous coupling.
