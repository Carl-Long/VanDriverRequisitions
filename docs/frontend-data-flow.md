# Frontend Data Flow and Type Boundaries

This document explains how requisition data moves through the frontend and why the application uses several similar-looking TypeScript types rather than one shared object everywhere.

The goal is to make the FE and STD requisition forms predictable, safe to edit, and aligned with the backend API without leaking UI-only concerns into the API contract.

---

## 1. High-level flow

Both requisition flows follow the same broad frontend data flow:

```text
Backend detail DTO
    ↓ API fetch
Frontend detail type
    ↓ map detail to editable state
Requisition draft
    ↓ open drawer / edit row
Drawer form values
    ↓ validate with Zod / React Hook Form
Updated draft row
    ↓ save or submit
Save request DTO
    ↓ API call
Backend save DTO
    ↓ application service / domain aggregate
Domain update model
    ↓ aggregate sync/update
Persisted requisition
```

The important point is that each type has a different responsibility. The overlap is intentional.

---

## 2. Why there are multiple types

### Detail type

Examples:

```text
frontend/src/features/fe-requisitions/types/fe-requisition.types.ts
frontend/src/features/std-requisitions/types/std-requisition.types.ts
```

The detail type represents the API response for a saved requisition.

It includes server-owned values such as:

- requisition ID
- requisition number
- row version
- status
- saved child row IDs
- lookup display snapshots
- active/inactive lookup flags
- totals calculated by the backend
- submission history
- approval/rejection metadata

The detail type should be treated as a representation of server state, not as editable UI state.

### Draft type

Examples:

```text
frontend/src/features/fe-requisitions/form/types/fe-requisition-draft.ts
frontend/src/features/std-requisitions/form/types/std-requisition-draft.ts
```

The draft type is the working copy the user edits in the form.

It includes UI-friendly fields such as:

- `clientId` for stable unsaved row identity
- selected lookup labels
- active/inactive lookup state
- `Date` objects for date inputs
- calculated row totals for immediate display
- row arrays that can be edited before saving

The draft exists because a user can add, edit, and remove rows locally before the API is called.

### Drawer form type

Examples:

```text
frontend/src/features/fe-requisitions/form/types/fe-general-task-form.ts
frontend/src/features/std-requisitions/form/types/std-transfer-form.ts
```

The form type represents the temporary state inside a drawer/modal form.

It exists because drawer forms have concerns that the saved requisition does not have:

- field-level validation
- nullable/empty input state
- currently selected lookup labels
- values that may be incomplete while the drawer is open
- charge-type-specific fields shown/hidden in the UI

A drawer form should not directly mutate the backend save request. It should produce or update a draft row.

### Save request type

Examples:

```text
frontend/src/features/fe-requisitions/types/fe-requisition-save.types.ts
frontend/src/features/std-requisitions/types/std-requisition-save.types.ts
```

The save request type is the API write contract.

It should contain only what the backend needs to recreate the intended requisition state:

- root IDs and values
- child row IDs for existing rows
- child row input values
- row version for existing saves/submits

It should not contain UI-only fields such as:

- `clientId`
- display labels
- active warning state
- calculated totals used only for display
- drawer-specific helper fields

The backend recalculates totals and revalidates rules, so frontend totals are display feedback, not the source of truth.

---

## 3. Why this is not bad duplication

The types look similar because they describe the same business object at different boundaries.

| Type | Boundary | Owns |
|---|---|---|
| Detail type | API read boundary | persisted server state |
| Draft type | page editing boundary | local editable working state |
| Form type | drawer/form boundary | field validation and temporary inputs |
| Save request type | API write boundary | minimal payload sent to backend |
| Snapshot type | submission history boundary | immutable historical view |

Using one type everywhere would reduce boilerplate, but it would also mix concerns.

For example, a single type would likely need to contain both:

- `clientId`, which is frontend-only
- `id`, which is backend-owned
- `Date`, which is useful for UI controls
- `DateOnly` string, which is useful for API payloads
- lookup display labels, which are useful for UI
- lookup IDs, which are needed by the backend

That creates accidental coupling and makes it easier to send UI-only data back to the API.

---

## 4. `id` vs `clientId`

Child rows usually have two identities in the frontend:

```text
id       = backend persisted row ID
clientId = frontend-only stable row key
```

### `id`

`id` is present only for rows that already exist in the database.

It is included in save requests so the backend can decide whether to:

- update an existing child row
- remove an omitted existing child row
- create a new child row

The backend validates that incoming existing child IDs belong to the aggregate. Unknown row IDs are rejected.

### `clientId`

`clientId` is generated in the frontend, often with `crypto.randomUUID()`.

It allows the UI to:

- render stable table rows
- edit unsaved rows
- remove rows before they exist in the database
- avoid using empty GUIDs or fake backend IDs

`clientId` must never be sent to the backend.

---

## 5. Detail-to-draft mapping

Examples:

```text
map-fe-requisition-detail-to-draft.ts
map-std-requisition-detail-to-draft.ts
```

These mappers convert server detail responses into editable frontend state.

Typical responsibilities:

- convert date strings into `Date` objects
- create `clientId` values for each child row
- preserve persisted child row `id` values
- build lookup labels for comboboxes
- copy active/inactive lookup flags
- copy submission history into draft state for display
- preserve `rowVersion` for concurrency

This is where read-model data becomes editable UI data.

---

## 6. Draft-to-save-request mapping

Examples:

```text
map-fe-requisition-draft-to-save-request.ts
map-std-requisition-draft-to-save-request.ts
```

These mappers convert editable draft state into the backend write contract.

Typical responsibilities:

- convert `Date` values to API date strings
- include row IDs for persisted child rows
- omit frontend-only `clientId`
- send only fields required by the selected charge type
- include `rowVersion` for existing requisitions
- send IDs rather than display labels where the backend expects IDs

This keeps the API payload deliberate and small.

---

## 7. Draft hooks

Examples:

```text
use-fe-requisition-draft.ts
use-std-requisition-draft.ts
```

The draft hooks are the local state managers for the requisition page.

They provide methods such as:

- set root details
- add child row
- update child row
- remove child row
- replace draft after loading detail data
- set row version after save

They also calculate the live subtotal so the user sees immediate feedback.

The hooks do not replace backend validation. They only keep the UI responsive and coherent while editing.

---

## 8. Form validation vs backend validation

The frontend uses schemas to catch common input mistakes before sending data to the API.

Examples:

```text
create-fe-additional-cost-form-schema.ts
create-std-transfer-form-schema.ts
std-requisition-schema.ts
fe-requisition-schema.ts
```

Frontend validation improves user experience, but the backend remains authoritative.

The backend still enforces:

- required root lookups
- inactive lookup rules
- child row ownership
- charge-type cross-field rules
- positive-money rules
- status transitions
- submit rules
- limit rules
- row-version concurrency

This duplication is intentional. Frontend validation is for usability; backend validation is for correctness and safety.

---

## 9. FE and STD stay parallel, not generic

FE and STD share a broad shape, but they are not identical.

FE has:

- general tasks
- mileage
- transfers
- additional costs
- weekly quantities

STD has:

- pickups
- transfers
- banks/bins collection charges
- van pack collections
- additional costs
- STD charge types

The codebase uses shared helpers where the rule is genuinely common, for example:

- inactive lookup warning components
- submit/approve modal components
- common drawer form actions
- shared charge field components where appropriate
- safe return URL handling

But FE and STD keep separate draft types, mappers, schemas, and row components. This avoids forcing a generic abstraction over business rules that are similar but not the same.

---

## 10. Inactive lookup handling

Inactive lookup handling is a good example of why the draft layer matters.

The UI needs to show existing inactive selections so historical or in-progress requisitions remain understandable. But users should not be able to select a new inactive lookup.

The frontend preserves active state in draft rows so it can:

- show inactive warnings
- keep an unchanged inactive lookup visible
- clear active state when the user changes selection
- prevent confusing hidden invalid data

The backend independently validates the same rule through builder/application logic:

- new inactive lookup is blocked
- unchanged existing inactive lookup is allowed
- changed-to-inactive lookup is blocked

---

## 11. Row version and concurrency

The detail response contains a `rowVersion`.

The draft preserves that value. The save mapper sends it back for existing update/submit paths.

The backend requires row version for existing writes so stale clients cannot overwrite newer changes.

Create/new-submit does not require row version because no persisted row exists yet.

---

## 12. Submission snapshots

Submission snapshots are immutable historical records.

When a requisition is submitted, the backend creates a snapshot JSON payload representing the submitted state at that time.

The frontend has submission-history views and snapshot table components because historical submissions are not the same as the current editable draft.

This is why snapshot display types and current edit types should remain separate.

---

## 13. Trade-offs

### Benefits

- Clear separation between server state, UI state, forms, and API write payloads.
- Safer API contracts because frontend-only data is not sent back accidentally.
- Easier to support unsaved rows through `clientId`.
- Better UX through immediate draft totals and form validation.
- Backend remains authoritative for business rules.
- Easier to reason about FE and STD differences.

### Costs

- More files and mapper code.
- Similar-looking fields appear in multiple places.
- Type changes sometimes require updates in several layers.
- Without documentation, the pattern can look like accidental duplication.

The trade-off is worthwhile for this app because requisitions have complex child rows, status transitions, inactive lookup behaviour, snapshots, and concurrency requirements.

---

## 14. Adding a new child row type

When adding a new requisition child row, follow this checklist.

Frontend:

1. Add API detail/save types.
2. Add draft type with `id` and `clientId`.
3. Add drawer form type.
4. Add Zod schema for drawer validation.
5. Add create-empty-form helper.
6. Add form-to-draft helper.
7. Add draft-to-form helper for editing existing rows.
8. Add draft update helper if the update logic is non-trivial.
9. Add total calculation helper if the row contributes to subtotal.
10. Update detail-to-draft mapper.
11. Update draft-to-save-request mapper.
12. Update draft hook add/update/remove methods.
13. Update tab warnings and inactive lookup warnings if needed.

Backend:

1. Add save DTO and validator.
2. Add update model.
3. Add domain child entity.
4. Add aggregate sync method using child ownership hardening.
5. Add mapper/builder support.
6. Add subtotal calculation.
7. Add snapshot support.
8. Add domain tests.
9. Add validator/builder tests.

---

## 15. Rule of thumb

When deciding where a field belongs:

| Question | Place it in |
|---|---|
| Is this returned by the backend as saved state? | detail type |
| Is this needed only while editing on the page? | draft type |
| Is this needed only inside a drawer form? | form type |
| Is this required by the backend write endpoint? | save request type |
| Is this historical submitted state? | snapshot/submission type |

Do not remove a type just because it looks similar to another type. Remove it only if it crosses the same boundary and has the same responsibility.
