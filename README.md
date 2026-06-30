# Van Driver Requisitions

Van Driver Requisitions is a full-stack requisition management app for two parallel requisition flows:

- **FE requisitions**
- **STD requisitions**

Both flows support draft save/update, submit, approve/reject, submission history snapshots, print views, inactive lookup handling, limit validation, and optimistic concurrency via row versions.

This README is for developers setting up and working on the project locally. For design rationale and data-flow decisions, see:

```text
docs/requisition-design-decisions.md
```

## Live Demo (Azure)

### https://vdr-web-carl-demo.azurewebsites.net/

## Tech stack

### Backend

- .NET 10
- ASP.NET Core Web API
- Entity Framework Core with SQL Server
- Clean Architecture / DDD-style layering
- FluentValidation
- xUnit + Moq unit tests
- Development JWT auth with seeded test accounts

### Frontend

- Next.js
- React
- TypeScript
- React Hook Form
- Zod
- Tailwind CSS

### Infrastructure

- SQL Server 2022 via Docker Compose for local development

## Repository layout

```text
.
├── backend/
│   ├── src/
│   │   ├── VanDriverRequisitions.Api/
│   │   ├── VanDriverRequisitions.Application/
│   │   ├── VanDriverRequisitions.Domain/
│   │   └── VanDriverRequisitions.Infrastructure/
│   └── tests/
│       ├── VanDriverRequisitions.Application.UnitTests/
│       └── VanDriverRequisitions.Domain.UnitTests/
├── docker/
│   └── compose.yml
├── frontend/
│   └── src/
├── scripts/
│   ├── deploy-backend.ps1
│   └── deploy-frontend.ps1
└── VanDriverRequisitions.sln
```

## Prerequisites

Install these before running locally:

- .NET 10 SDK
- Node.js 20 or later
- npm
- Docker Desktop or another Docker-compatible runtime
- SQL Server tooling is optional, but useful for inspecting the local database

For HTTPS local development, trust the .NET development certificate:

```bash
dotnet dev-certs https --trust
```

## Local setup

### 1. Clone the repository

```bash
git clone <repo-url>
cd VanDriverRequisitions
```

### 2. Create the root environment file

Copy the root example file:

```bash
cp .env.example .env
```

Set a strong SQL Server password in `.env`:

```env
SQL_PASSWORD=YourStrong!Passw0rd
```

The Docker Compose file uses this value for the local SQL Server `sa` password.

### 3. Start SQL Server

From the repository root:

```bash
docker compose -f docker/compose.yml up -d
```

This starts SQL Server on port `1433`.

To stop it later:

```bash
docker compose -f docker/compose.yml down
```

To remove the local database volume as well:

```bash
docker compose -f docker/compose.yml down -v
```

## Backend setup

The API project is:

```text
backend/src/VanDriverRequisitions.Api
```

### 1. Configure the local connection string

The API reads the connection string from configuration key:

```text
ConnectionStrings:DefaultConnection
```

You can set this with an environment variable before running the API:

```bash
export ConnectionStrings__DefaultConnection='Server=localhost,1433;Database=VanDriverRequisitions;User Id=sa;Password=YourStrong!Passw0rd;TrustServerCertificate=True;Encrypt=True'
```

Use the same password you placed in `.env`.

Alternatively, use .NET user secrets from the API project directory:

```bash
cd backend/src/VanDriverRequisitions.Api

dotnet user-secrets init

dotnet user-secrets set "ConnectionStrings:DefaultConnection" "Server=localhost,1433;Database=VanDriverRequisitions;User Id=sa;Password=YourStrong!Passw0rd;TrustServerCertificate=True;Encrypt=True"
```

### 2. Restore and build

From the repository root:

```bash
dotnet restore VanDriverRequisitions.sln
dotnet build VanDriverRequisitions.sln
```

### 3. Run the API

From the API project directory:

```bash
cd backend/src/VanDriverRequisitions.Api
dotnet run
```

By default, the development launch profile uses:

```text
https://localhost:50815
http://localhost:50816
```

Useful URLs:

```text
https://localhost:50815/health
https://localhost:50815/swagger
```

### 4. Database migrations and seed data

In `Development`, the API applies database startup tasks automatically on launch:

- applies EF Core migrations
- seeds development data

This is controlled by configuration keys:

```text
Database:ApplyMigrations
Database:SeedData
```

Both default to `true` in development if not configured.

The seed data includes development users, shops, van drivers, lookup data, limit rules, FE requisitions, and STD requisitions.

## Frontend setup

The frontend project is:

```text
frontend
```

### 1. Create the frontend environment file

```bash
cd frontend
cp .env.example .env.local
```

The default API URL is:

```env
NEXT_PUBLIC_API_URL=https://localhost:50815
```

Change it only if your API is running on a different URL.

### 2. Install dependencies

```bash
npm install
```

### 3. Run the development server

```bash
npm run dev
```

Open:

```text
http://localhost:3000
```

## Development sign-in accounts

In local development, the app uses a mock sign-in flow that calls:

```text
POST /dev/auth/token
```

Available accounts:

| Account | Email | Roles |
|---|---|---|
| Super User | `superuser@test.com` | Admin, User, Approver |
| Standard User | `user@test.com` | User |
| Approver User | `approver@test.com` | Approver |
| Admin User | `admin@test.com` | Admin |

The frontend login screen also exposes these accounts as quick-login options.

## Common development workflow

Run SQL Server:

```bash
docker compose -f docker/compose.yml up -d
```

Run the API:

```bash
cd backend/src/VanDriverRequisitions.Api
dotnet run
```

Run the frontend:

```bash
cd frontend
npm run dev
```

Then open:

```text
http://localhost:3000
```

## Tests and quality checks

### Backend tests

From the repository root:

```bash
dotnet test
```

Or run individual test projects:

```bash
dotnet test backend/tests/VanDriverRequisitions.Domain.UnitTests/VanDriverRequisitions.Domain.UnitTests.csproj

dotnet test backend/tests/VanDriverRequisitions.Application.UnitTests/VanDriverRequisitions.Application.UnitTests.csproj
```

### Frontend checks

From `frontend`:

```bash
npm run lint
npm run format:check
npm run build
```

Use formatting when needed:

```bash
npm run format
```

## Backend architecture overview

The backend follows a Clean Architecture / DDD style split:

| Layer | Responsibility |
|---|---|
| API | HTTP controllers, auth, CORS, rate limiting, exception handling |
| Application | services, validators, DTOs, builders, mappers, orchestration |
| Domain | aggregates, entities, value objects, domain rules, calculations |
| Infrastructure | EF Core DbContext, configurations, migrations, seed data, number generators |

Important conventions:

- Aggregates own lifecycle/status rules.
- Application services orchestrate loading, validation, building update models, applying aggregate methods, and saving.
- Builders resolve lookup data and protect inactive lookup behaviour.
- Validators protect API contract rules.
- Domain methods protect invariant rules even if a caller bypasses the frontend/API validator path.
- Row versions are required for existing update, existing submit, approve, and reject operations.

## Frontend architecture overview

The frontend intentionally separates several similar-looking types because they serve different boundaries:

| Type category | Purpose |
|---|---|
| Detail/API response types | Exact shape returned by the backend detail endpoints |
| Draft types | Editable client-side working state for a requisition |
| Drawer/form types | Short-lived form state for a single row editor |
| Save request types | Exact API payload shape sent back to the backend |
| Snapshot/print types | Readonly submitted historical view |

This means some fields appear in more than one type, but the duplication is deliberate:

- API responses can remain stable and readonly.
- Draft state can support unsaved rows, `clientId`s, inactive lookup warnings, and UI-only editing flags.
- Form state can stay focused on one drawer without leaking UI details into API payloads.
- Save requests can be normalised before hitting the backend.
- Submission snapshots can represent historical data without changing when lookup names or active states change later.

For deeper design rationale, trade-offs, and data-flow diagrams, see:

```text
docs/requisition-design-decisions.md
```

## Database notes

Local development uses SQL Server, not SQLite, because the EF model uses SQL Server-specific behaviour such as sequences.

The application uses database-generated IDs and row-version concurrency checks. Avoid manually assigning IDs in production code unless a specific entity explicitly requires it.

## Troubleshooting

### API cannot connect to SQL Server

Check that SQL Server is running:

```bash
docker ps
```

Check that the password in `.env` matches the connection string password.

If the database is in a bad local state, reset the SQL volume:

```bash
docker compose -f docker/compose.yml down -v
docker compose -f docker/compose.yml up -d
```

Then restart the API so migrations and seed data run again.

### Frontend cannot reach API

Check:

- API is running on `https://localhost:50815`
- `frontend/.env.local` has the correct `NEXT_PUBLIC_API_URL`
- .NET development certificate is trusted
- browser has accepted the local HTTPS certificate

### Login fails in development

Use one of the seeded development accounts listed above. The mock auth endpoint only accepts those emails.

### Swagger loads but authorised endpoints return 401

Use the frontend login flow to test authenticated flows, or manually call `POST /dev/auth/token` and include the returned token as a bearer token.

## Documentation to keep updated

Keep these docs aligned as the project evolves:

| Document | Purpose |
|---|---|
| `README.md` | setup, run, test, project map, common development workflow |
| `docs/requisition-design-decisions.md` | design rationale, frontend/backend data flow, trade-offs |
| feature-specific docs, if added later | deeper notes for complex areas such as approval flow, limits, or deployment |

## Contribution notes

Before opening a pull request or merging a branch, run:

```bash
dotnet test
```

And from `frontend`:

```bash
npm run lint
npm run format:check
npm run build
```

Prefer small, focused changes. Keep FE and STD parallel where it improves readability, but do not force a generic abstraction when the two flows have different business rules.
