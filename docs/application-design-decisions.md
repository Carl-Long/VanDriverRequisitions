# Van Driver Requisitions — Design Decisions and Data Flow

This document explains the main technical design choices in the Van Driver Requisitions application. It is intended for developers reviewing or extending the codebase, not as a setup/run guide.

The application has two requisition flows:

- **FE requisitions**
- **STD requisitions**

Both flows follow the same broad architecture, but they are kept separate where their rules and row types differ.

---

## 1. Design goals

The main design goals are:

1. **Correctness over convenience**  
   Requisition status transitions, child row ownership, inactive lookup rules, concurrency, and submit rules are enforced by the backend/domain, not only by the frontend.

2. **Clear boundaries between UI state and API contracts**  
   The frontend intentionally has separate types for API detail responses, local drafts, drawer forms, and save requests. These are similar, but they are not interchangeable.

3. **Domain-first backend**  
   The backend uses rich aggregates and child entities rather than treating requisitions as passive DTOs. Application services orchestrate work, but the aggregate owns important business rules.

4. **FE and STD stay parallel, not forcibly generic**  
   FE and STD share concepts, but their child row types, charging rules, and lookup rules differ. Shared helpers are used where the rule is genuinely common; otherwise each flow stays explicit.

5. **Submission history is immutable**  
   A submission captures a snapshot JSON payload at the point of submit. Later edits or lookup-name changes should not rewrite historical submissions.

---

## 2. Backend architecture summary

The backend follows Clean Architecture / DDD principles.

### Domain layer

Key aggregate roots:

- `FeRequisition`
- `StdRequisition`

These aggregates own:

- root details such as requisition date, driver snapshot, shop snapshot, and status
- child collections
- subtotal calculation
- submit / approve / reject status transitions
- whether draft/rejected requisitions can be edited or submitted
- child row sync ownership rules
- submission history

The child row collections are updated through aggregate methods, not directly from the application service.

Examples of domain responsibilities:

- A submitted requisition cannot be edited through normal save.
- An approved requisition cannot be submitted, approved, or rejected again.
- A rejected requisition can be edited and resubmitted.
- A requisition cannot be submitted unless its subtotal is greater than zero.
- Existing child rows cannot be updated using unknown or foreign child row IDs.

### Application layer

Application services such as `FeRequisitionService` and `StdRequisitionService` orchestrate use cases:

- validate incoming DTOs
- load existing aggregates
- set required row-version concurrency values
- use builders to resolve lookup data
- call aggregate methods
- run limit validation
- create submission snapshots
- save changes
- map the aggregate back to a detail DTO

The services should not contain core workflow rules if those rules belong to the aggregate.

### Builders

Save-data builders convert API DTOs into domain update models.

Examples:

- `FeRequisitionSaveDataBuilder`
- `StdRequisitionSaveDataBuilder`

Builders are responsible for work that requires application-layer dependencies, such as:

- loading van driver/shop snapshots
- resolving task types, cost reasons, collection types, locations, and transfer shops
- checking inactive lookup behaviour
- building domain update models

This keeps lookup/database concerns out of the domain model.

### Validators

DTO validators protect the API boundary. They check request shape and cross-field consistency before the request reaches the domain.

Examples:

- required root fields
- required child row fields
- charge-type cross-field rules
- positive money and quantity rules
- approve/reject `RowVersion` and rejection notes

Validators do not replace domain rules. They provide early, user-friendly API errors.

### Mappers

Mappers keep conversion explicit:

- save DTO -> domain update model
- aggregate -> detail DTO
- aggregate -> snapshot DTO
- projection -> summary DTO

The mapper layer avoids scattering conversion logic through services or entities.

---

## 3. Backend request flow

### Create draft

```text
Frontend save request
  -> API DTO validator
  -> service CreateAsync
  -> save-data builder resolves lookup snapshots
  -> aggregate Create / Update
  -> limit validator
  -> SaveChanges
  -> detail DTO returned
```

Create does not require a `RowVersion` because the requisition does not exist yet.

### Update existing draft/rejected requisition

```text
Frontend save request with rowVersion
  -> API DTO validator
  -> service UpdateAsync
  -> load aggregate with children/submissions
  -> SetRequiredOriginalRowVersion
  -> save-data builder resolves lookup snapshots
  -> aggregate Update
  -> limit validator
  -> SaveChangesWithConcurrencyHandling
  -> detail DTO returned
```

Existing update requires `RowVersion` to prevent stale clients from overwriting newer changes.

### Submit new requisition

```text
Frontend save request
  -> API DTO validator
  -> submit-window guard
  -> create aggregate
  -> limit validator
  -> snapshot factory creates submission JSON
  -> aggregate Submit
  -> SaveChangesWithConcurrencyHandling
  -> detail DTO returned
```

New submit does not require `RowVersion` because the aggregate is being created and submitted in one operation.

### Submit existing requisition

```text
Frontend save request with rowVersion
  -> API DTO validator
  -> submit-window guard
  -> load aggregate
  -> SetRequiredOriginalRowVersion
  -> update aggregate with latest request data
  -> limit validator
  -> snapshot factory creates submission JSON
  -> aggregate Submit
  -> SaveChangesWithConcurrencyHandling
  -> detail DTO returned
```

Existing submit requires `RowVersion` because it updates an existing aggregate before submitting it.

### Approve / reject

```text
Approve/reject request with rowVersion
  -> API DTO validator
  -> load aggregate with pending submission
  -> SetRequiredOriginalRowVersion
  -> aggregate ApproveSubmission / RejectSubmission
  -> SaveChangesWithConcurrencyHandling
  -> detail DTO returned
```

Approve and reject are status transitions and must use concurrency checking.

---

## 4. Frontend type model

The frontend intentionally uses several similar-looking types. This is not accidental duplication; each type represents a different boundary.

### API detail types

Examples:

- `FeRequisitionDetail`
- `StdRequisitionDetail`

These represent the server's current saved state. They include server-owned or display-oriented values such as:

- database IDs
- `rowVersion`
- requisition number
- status
- lookup display names/codes
- active/inactive lookup flags
- totals calculated by the backend
- submission history

These should be treated as API response contracts, not editable form state.

### Draft types

Examples:

- `FeRequisitionDraft`
- `StdRequisitionDraft`

Drafts are the frontend's working copy of a requisition. They are designed for the page/workspace experience.

Drafts include UI-friendly state such as:

- `Date` objects instead of date-only strings
- lookup labels for comboboxes
- active/inactive lookup flags for warnings
- `clientId` values for stable React keys before a row has a database ID
- calculated row totals for immediate feedback
- editable child row arrays

Drafts are not sent directly to the API.

### Drawer form types

Examples:

- `FeGeneralTaskForm`
- `FeAdditionalCostForm`
- `StdTransferForm`
- `StdCollectionVanPackForm`

Drawer forms are temporary editing state for one row. They support field-level validation, local form calculations, and controlled inputs.

The user edits a drawer form, and when the drawer is saved the form is converted into a draft row.

### Save request types

Examples:

- `SaveFeRequisition`
- `SaveStdRequisition`

Save request types represent exactly what the backend expects for create/update/submit.

They intentionally exclude UI-only data such as:

- labels
- active flags
- display codes/names where the backend resolves them
- frontend-only `clientId`
- local totals that the backend can recalculate

They include important API data such as:

- database row IDs for existing rows
- selected lookup IDs
- normalized date strings
- charge fields relevant to the selected charge type
- `rowVersion` for existing requisitions

---

## 5. Frontend requisition data flow

### Loading an existing requisition

```text
GET detail DTO from API
  -> map detail DTO to draft
  -> page uses draft as editable working state
```

The mapping step is important because API data and UI editing state are different shapes.

For example, the backend returns date strings. The UI prefers `Date` objects for date inputs. The backend returns lookup code/name fields. The UI needs combobox labels and active/inactive flags.

### Editing rows

```text
User opens drawer
  -> draft row maps to drawer form
  -> Zod validates drawer form
  -> local calculation helpers update row totals
  -> save drawer maps form back to draft row
```

This keeps row editing isolated and avoids saving partially edited drawer state to the main draft before the row passes validation.

### Saving or submitting

```text
Draft
  -> Zod root validation
  -> map draft to save request
  -> API create/update/submit
  -> API returns latest detail DTO
  -> map returned detail DTO back to draft
```

The returned detail DTO should replace or refresh the draft because the server may update:

- row IDs
- `rowVersion`
- status
- submission metadata
- totals
- lookup active states
- submission history

---

## 6. Why the frontend has detail, draft, form, and save types

The apparent duplication exists because each type answers a different question.

| Type | Main question | Owned by |
|---|---|---|
| Detail DTO | What does the server currently know? | Backend/API |
| Draft | What is the user currently editing on the page? | Frontend page state |
| Drawer form | What is being edited in this one row drawer? | Frontend form |
| Save request | What does the backend need to process a save/submit? | API contract |

Using one shared type for all of these would reduce boilerplate, but it would also mix concerns. For example:

- UI-only labels could accidentally be posted to the API.
- Backend-only fields could become editable by mistake.
- Dates could be inconsistently handled as strings or `Date` objects.
- Charge-type fields could be sent in invalid combinations.
- React key management would be harder for unsaved rows.

The explicit mapping functions are the cost paid to keep these boundaries clear.

---

## 7. `id` versus `clientId`

Child rows use two identifiers on the frontend:

- `id` is the backend database ID. Existing rows have it. New unsaved rows do not.
- `clientId` is generated by the frontend and is used as a stable React key while editing.

This distinction is important because new rows need a stable UI identity before the backend has created a database ID.

Only backend `id` values are sent in save requests. `clientId` is frontend-only.

The backend validates child row ownership. Unknown non-empty child row IDs are rejected rather than silently treated as new rows.

---

## 8. Row version and concurrency

`rowVersion` is used for optimistic concurrency.

Rules:

- create draft: no `rowVersion` required
- submit new requisition: no `rowVersion` required
- update existing requisition: `rowVersion` required
- submit existing requisition: `rowVersion` required
- approve/reject: `rowVersion` required

This prevents stale clients from overwriting changes made by someone else.

The API detail response returns the latest `rowVersion`. After saving, submitting, approving, or rejecting, the frontend should use the returned detail response to refresh the draft.

---

## 9. Submission snapshots

When a requisition is submitted, the backend creates a snapshot JSON document.

The snapshot is used for submission history and print/review screens. It protects historical submissions from later changes to:

- lookup names
- rates
- child rows
- driver/shop details
- approval state

The editable detail view represents the current aggregate. The submission view represents the historical submitted snapshot.

This is why the codebase has separate detail types and submission/snapshot types.

---

## 10. Inactive lookup handling

The application allows historic rows to keep inactive lookup values, but blocks users from selecting inactive values as new or changed values.

This rule exists for root lookups and child lookups.

Examples:

- Existing requisition references a shop that has since been made inactive.
- Existing child row references a cost reason or location that has since been made inactive.

Expected behaviour:

- unchanged inactive lookup: allowed, with warning
- new inactive lookup: blocked
- changed-to-inactive lookup: blocked

The frontend displays inactive warnings. The backend enforces the rule so it cannot be bypassed by direct API calls.

---

## 11. Limit validation

Limit rules exist in both frontend and backend.

Frontend responsibility:

- give immediate feedback
- warn users while editing
- show tab/workspace warnings

Backend responsibility:

- enforce correctness
- reject invalid submissions or saves even if the frontend is bypassed

The frontend warning layer should not be treated as the source of truth.

---

## 12. FE and STD parallel design

FE and STD flows are deliberately parallel:

- each has its own API module
- each has its own detail/save/submission types
- each has its own draft hook
- each has its own row drawers/workspaces
- each maps detail -> draft -> save request explicitly

Shared code is used where the concept is genuinely the same:

- shared requisition layout components
- shared approval/rejection modals
- shared inactive lookup warning component
- shared field/actions components
- shared helper functions for common UI rules

The code does not force a generic abstraction over FE and STD rows because the row types and business rules differ enough that a generic abstraction would likely become harder to understand than the duplication it removes.

This is an intentional trade-off.

---

## 13. Trade-offs

### More types and mappers

**Benefit:** safer boundaries, clearer contracts, fewer accidental API leaks.  
**Cost:** more files and mapping code.

This is acceptable because requisitions are business-critical and have many rules.

### Manual frontend API types

**Benefit:** simple and readable without introducing code generation.  
**Cost:** frontend types can drift from backend DTOs.

If the API surface grows further, OpenAPI/client generation may become worth considering. For now, explicit hand-written types are manageable.

### FE and STD duplication

**Benefit:** each flow remains easy to reason about and can reflect its own business language.  
**Cost:** similar changes sometimes need to be made twice.

Shared helpers should be extracted when the same rule appears in both flows, but not simply because two files look similar.

### Frontend calculates totals and backend recalculates totals

**Benefit:** users get immediate feedback, while the backend remains authoritative.  
**Cost:** calculation logic must stay aligned.

Backend totals are the source of truth. Frontend totals are for user experience.

### Drafts allow incomplete state

**Benefit:** the UI can support natural editing before all required fields are complete.  
**Cost:** save/submit actions must validate and map carefully.

This is why drawer schemas, root schemas, API validators, and domain guards all exist at different layers.

---

## 14. Rules of thumb for future development

When adding a new requisition row type:

1. Add backend save DTO, validator, domain entity/update model, mapper, tests, and snapshot support.
2. Add frontend API save/detail types.
3. Add frontend draft and form types.
4. Add create-empty, form-to-draft, draft-to-form, detail-to-draft, and draft-to-save mapping helpers.
5. Add drawer validation schema.
6. Add workspace row display and warnings.
7. Add tab warning behaviour if the row can have inactive lookups or limit issues.
8. Ensure backend domain tests cover create/update/sync/submit behaviour.
9. Ensure application tests cover validator or builder rules where the rule depends on external lookups.

When changing a business rule:

1. Put the authoritative rule in the backend/domain when it affects correctness.
2. Add API validator rules where they improve request feedback.
3. Add frontend validation/warnings where they improve user experience.
4. Add tests at the lowest layer that owns the rule.

When changing frontend state:

1. Do not bind API detail DTOs directly to forms.
2. Do not post drafts directly to the API.
3. Keep `clientId` frontend-only.
4. Keep save request mappers responsible for stripping UI-only fields.
5. Refresh the draft from the returned detail DTO after successful saves/transitions.

---
