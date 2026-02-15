# Frontend Architecture & Code Standards

This document describes the structure, conventions, and patterns used in the inventory management system frontend. Follow it when adding or changing code.

---

## 1. Overview

The app separates **data/API**, **validation**, **state/hooks**, and **UI** into clear layers:

- **API** (`api/`) – HTTP calls and request/response types
- **Types** (`types/`) – Shared TypeScript types (e.g. pagination)
- **Schemas** (`schemas/`) – Zod schemas for runtime validation
- **Hooks** (`hooks/`) – React Query (queries/mutations) and reusable logic
- **Stores** (`stores/`) – Zustand for shared client state (e.g. auth, filters)
- **Pages & Components** – UI only; they call hooks and schemas, not API directly

**Rule of thumb:** Pages and components do **not** import from `api/` or `services/api` for business logic; they use **hooks** and **schemas** only.

---

## 2. Folder Structure

```
src/
├── api/                    # API layer (domain-based)
│   ├── client.ts           # Shared HTTP helpers (list, get, post, put, del)
│   ├── products.ts
│   ├── requisitions.ts
│   └── libraries.ts
├── types/                  # Shared types (e.g. API responses)
│   └── api.ts              # Meta, ListResponse, SingleResponse, PaginatedParams
├── schemas/                # Zod validation (one per domain or form)
│   ├── product.ts
│   ├── requisition.ts
│   └── library.ts
├── hooks/
│   ├── queries/            # React Query “get” hooks
│   │   ├── products/
│   │   ├── requisitions/
│   │   └── libraries/
│   └── mutations/          # React Query “create/update/delete” hooks
│       ├── products/
│       ├── requisitions/
│       └── libraries/
├── stores/                 # Zustand stores (auth, filters, etc.)
│   ├── useAuthStore.ts
│   └── useProductFiltersStore.ts
├── components/             # Reusable UI
├── pages/                  # Route-level UI (use hooks + schemas only)
├── config/
├── constants/
├── utils/
├── routes/
└── services/               # Legacy API barrel; prefer api/ for new code
```

---

## 3. Path Aliases

Use these in imports (see `vite.config.ts` and `tsconfig.app.json`):

| Alias         | Path        | Use for                          |
|---------------|-------------|-----------------------------------|
| `@api`        | `src/api`   | API modules and client            |
| `@app-types`  | `src/types` | Shared types                      |
| `@schemas`    | `src/schemas` | Zod schemas                    |
| `@hooks`      | `src/hooks` | All hooks                         |
| `@components` | `src/components` | UI components              |
| `@pages`      | `src/pages` | Page components                   |
| `@config`     | `src/config`| App config                        |
| `@constants`  | `src/constants` | Constants                     |
| `@utils`      | `src/utils` | Utilities (e.g. axios, hasPermission) |
| `@stores`     | `src/stores`| Zustand stores                    |

**Example:**

```ts
import { productsApi, type Product } from "@api/products";
import type { Meta } from "@app-types/api";
import { productPayloadSchema } from "@schemas/product";
import { useProductsQuery } from "@hooks/queries/products/useProductsQuery";
import { useProductMutation } from "@hooks/mutations/products/useProductMutation";
```

---

## 4. Layer Rules

### 4.1 API (`api/`)

- **One file per domain** (e.g. `products.ts`, `requisitions.ts`, `libraries.ts`).
- **`client.ts`** exposes: `list`, `get`, `post`, `put`, `del` (use `API_V1` and `@utils/axios`).
- Each domain file exports:
  - **Types:** request/response interfaces (e.g. `Product`, `ProductPayload`, `Requisition`).
  - **API object:** e.g. `productsApi` with methods `list`, `get`, `create`, `update`, `delete`.
- No React, no hooks, no Zod; only axios and types.

**Example (excerpt):**

```ts
// api/products.ts
import { list, get, post, put, del } from "@api/client";

export interface ProductPayload { ... }
export interface Product { ... }

export const productsApi = {
  list: (params?) => list<Product>("products", params),
  get: (id) => get<Product>(`products/${id}`),
  create: (data: ProductPayload) => post<Product>("products", data),
  update: (id, data) => put<Product>(`products/${id}`, data),
  delete: (id) => del(`products/${id}`),
};
```

### 4.2 Types (`types/`)

- Shared, non-domain-specific types (e.g. `Meta`, `ListResponse<T>`, `SingleResponse<T>`, `PaginatedParams`).
- Prefer `interface` for object shapes. Export from `@app-types/*`.

### 4.3 Schemas (`schemas/`)

- **Zod** only; one file per domain or form (e.g. `product.ts`, `requisition.ts`, `library.ts`).
- Use for **form/input validation** before calling API (e.g. `productPayloadSchema`, `requisitionPayloadSchema`, `libraryNameSchema`).
- Export both the schema and inferred types if needed:

```ts
// schemas/product.ts
import { z } from "zod";

export const productPayloadSchema = z.object({
  name: z.string().min(1, "Name is required"),
  unit_id: z.number().int().positive("Unit is required"),
  // ...
});

export type ProductPayloadSafe = z.infer<typeof productPayloadSchema>;
```

- In pages/components: validate with `schema.safeParse(...)` and show `error.issues[0]?.message` on failure.

### 4.4 Hooks

**Queries** (`hooks/queries/<domain>/`):

- One hook per “list” or “get” use case (e.g. `useProductsQuery`, `useRequisitionsQuery`, `useLibraryListQuery`).
- Use `@tanstack/react-query` `useQuery`; call functions from `api/` inside `queryFn`.
- Return `UseQueryResult<...>`; keep mapping (e.g. `res.data.data`, `meta`) inside the hook.

**Mutations** (`hooks/mutations/<domain>/`):

- One hook per domain (e.g. `useProductMutation`, `useRequisitionMutation`, `useLibraryMutation`).
- Use `useMutation`; `mutationFn` calls `api/` methods.
- In `onSuccess`: invalidate relevant query keys and show notifications (e.g. Mantine `notifications`).
- Return `{ create, update, remove }` (or the mutations you need).

**Rule:** Hooks import from `@api/*`, `@app-types/*`, and optionally `@schemas/*`; they do not import from `@pages` or `@components`.

### 4.5 Stores (`stores/`)

- Use **Zustand** for shared client state (e.g. auth, filter state).
- Keep stores small and focused (e.g. `useAuthStore`, `useProductFiltersStore`).
- Use `create` from `zustand`; use `persist` from `zustand/middleware` when persistence is needed (e.g. auth).

### 4.6 Pages & Components

- **No direct API calls.** Use hooks (queries/mutations) and, for forms, schemas.
- **Validation:** Before submit, run `schema.safeParse(formData)`. On failure, show `parsed.error.issues[0]?.message` (or similar); on success, pass parsed data to the mutation.
- Keep UI and layout in the page; extract reusable pieces into `components/`.

---

## 5. Naming Conventions

| Kind            | Convention        | Example                          |
|-----------------|-------------------|----------------------------------|
| API file        | `camelCase` domain| `products.ts`, `requisitions.ts` |
| API object      | `domainApi`       | `productsApi`, `requisitionsApi` |
| Query hook      | `useXxxQuery`      | `useProductsQuery`                |
| Mutation hook   | `useXxxMutation`  | `useProductMutation`             |
| Zod schema      | `xxxSchema`       | `productPayloadSchema`           |
| Zustand store   | `useXxxStore`     | `useAuthStore`                    |
| React component | PascalCase        | `ProductsPage`, `LibraryCrudPage`|
| Query key       | String array      | `["products"]`, `["products", params]` |

---

## 6. Adding a New Feature (Checklist)

When adding a new domain (e.g. “Items”):

1. **Types & API**
   - Add `api/items.ts`: types (e.g. `Item`, `ItemPayload`) and `itemsApi` (list, get, create, update, delete) using `@api/client`.
   - Add shared types in `types/` only if they’re generic (e.g. new pagination shape).

2. **Validation**
   - Add `schemas/item.ts` with Zod schema(s) for create/update payloads.
   - Export inferred types if needed.

3. **Hooks**
   - Add `hooks/queries/items/useItemsQuery.ts` (and optionally `useItemQuery.ts` for single item).
   - Add `hooks/mutations/items/useItemMutation.ts` (create, update, remove; invalidate `["items"]` and show notifications).

4. **UI**
   - Add page(s) under `pages/` that use only the new hooks and schemas; validate forms with `schema.safeParse` before calling mutations.

5. **Optional**
   - If the feature needs shared client state (e.g. filters), add a store in `stores/` (Zustand).

6. **Routes**
   - Register the new page(s) in `routes/Router.tsx`.

---

## 7. Code Style

- **TypeScript:** Prefer explicit types for function parameters and return types where it helps. Use `type` for unions/aliases, `interface` for object shapes.
- **Imports:** Use path aliases (`@api`, `@hooks`, etc.). Group: external libs → aliased modules → relative.
- **React Query:** Use consistent query keys (e.g. `["products"]`, `["products", params]`) so invalidation is predictable.
- **Errors:** In mutations, handle errors via axios interceptors or mutation `onError`; in forms, show Zod validation errors from `safeParse`.
- **Verbatim module syntax:** Use type-only imports where required (e.g. `import type { X } from "..."` or `import { type X } from "..."`).

---

## 8. Summary Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│  Pages / Components (UI only)                                    │
│  - Use hooks + schemas                                           │
│  - No direct api/ or services/api for business logic             │
└────────────────────────────┬────────────────────────────────────┘
                             │
┌────────────────────────────▼────────────────────────────────────┐
│  Hooks (queries + mutations)                                     │
│  - Call api/*, invalidate queries, show notifications            │
└────────────────────────────┬────────────────────────────────────┘
                             │
┌────────────────────────────▼────────────────────────────────────┐
│  Schemas (Zod)          │  API (api/*)                          │
│  - Validate form input  │  - HTTP via client + axios             │
│  - safeParse in UI      │  - Types + domainApi per domain         │
└────────────────────────────┴────────────────────────────────────┘
                             │
┌────────────────────────────▼────────────────────────────────────┐
│  Types (app-types), Utils (axios, config)                        │
└─────────────────────────────────────────────────────────────────┘
```

This layout keeps the codebase consistent, testable, and easy to extend. When in doubt, add new logic in the correct layer (api → hooks → schemas → UI) and use the path aliases and naming conventions above.
