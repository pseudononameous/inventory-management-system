# Inventory Management System (IMS)

Revamped version of **brhmc_msmis_v2**, built with **Laravel** (API) and **React** (frontend), following the code practices from **fitan**.

## Structure

- **`api/`** – Laravel API (Sanctum auth, Service layer, ApiResponse, Form Requests)
- **`frontend/`** – React + TypeScript + Vite (Mantine, React Query, Zustand)

## API (Laravel)

- **Practices (from fitan):** `App\Support\ApiResponse`, thin controllers, Service classes with interfaces, Form Request validation, route files per domain.
- **Auth:** `/api/v1/auth/login`, `/api/v1/auth/logout`, `/api/v1/auth/user`, `/api/v1/auth/change-password` (Bearer token via Sanctum).
- **Libraries:** `/api/v1/libraries/units` (CRUD). More libraries (categories, brands, suppliers, etc.) can be added following the same pattern.
- **Other modules:** Products, Purchase Orders, Purchase Requests, Inspections, Requisitions, Dispenses, Reports, Settings – routes are stubbed and ready to be implemented.

### Setup

```bash
cd api
cp .env.example .env
# Edit .env: DB_*, SANCTUM_STATEFUL_DOMAINS (e.g. localhost:5173)
composer install
php artisan key:generate
php artisan migrate
php artisan db:seed
php artisan serve
```

Default user: **admin@example.com** / **password**

## Frontend (React)

- **Practices (from fitan):** Central API config (`src/config/api.ts`), axios instance with interceptors and error toasts, path aliases, AuthGuard, AppShell layout, Zustand auth store.
- **Pages:** Login, Dashboard, Libraries → Units (list, create, edit, delete).

### Setup

```bash
cd frontend
cp .env.example .env
# Optional: VITE_API_HOST=/api if using Vite proxy to API
npm install
npm run dev
```

Open http://localhost:5173. Proxy forwards `/api` to `http://127.0.0.1:8000`.

## Features (from brhmc_msmis_v2)

Planned / to be ported:

- **Libraries:** Units ✅, Categories, Brands, Suppliers, Departments, Divisions, Generic names
- **Products:** CRUD, Stock card, Bin card, On-hand stock
- **Purchase orders & requests**
- **Inspections:** For issuances, for warehouse, delivery items, receives
- **Requisitions:** Pending, for dispensing, dispensed, items, receives
- **Dispenses**
- **Reports:** Physical inventories, RSMI
- **Settings:** Users, Roles, System logs

The codebase is structured so you can add each feature following the same patterns (Service + Controller + Form Requests on API; page + API service + React Query on frontend).
