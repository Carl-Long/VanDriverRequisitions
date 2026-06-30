# Requisition Lifecycle

This document explains the lifecycle rules for FE and STD requisitions.

The lifecycle is enforced by the backend domain aggregates, not only by the frontend. The frontend should guide the user, but the domain is the source of truth.

---

## 1. Statuses

A requisition can be in one of these statuses:

| Status | Meaning |
|---|---|
| Draft | The requisition is being prepared and can be edited. |
| Submitted | The requisition has been submitted for approval and cannot be edited through normal save. |
| Approved | The requisition has been approved and is terminal. |
| Rejected | The requisition was rejected and can be edited/resubmitted. |

The same broad lifecycle applies to both FE and STD requisitions.

---

## 2. Lifecycle diagram

```text
Draft
  │
  │ Submit
  ▼
Submitted
  │
  ├── Approve ──► Approved
  │               terminal
  │
  └── Reject ───► Rejected
                  │
                  │ Edit
                  │ Resubmit
                  ▼
                Submitted
```

Approved requisitions are terminal. Rejected requisitions are intentionally editable and can be resubmitted.

---

## 3. Allowed actions by status

| Current status | Update/save | Submit | Approve | Reject |
|---|---:|---:|---:|---:|
| Draft | Yes | Yes | No | No |
| Submitted | No | No | Yes | Yes |
| Approved | No | No | No | No |
| Rejected | Yes | Yes | No | No |

The frontend should hide or disable invalid actions, but the backend must still reject invalid transitions.

---

## 4. Draft

Draft is the initial status.

A draft requisition can be:

- updated
- saved repeatedly
- submitted once it is valid

Draft saves can tolerate incomplete working state where appropriate. Submit is stricter.

---

## 5. Submitted

Submitted means the requisition is waiting for approval/rejection.

A submitted requisition cannot be edited through the normal save endpoint. This prevents users from changing the submitted content while an approver is reviewing it.

A submitted requisition can be:

- approved
- rejected

It cannot be submitted again while a pending submission exists.

---

## 6. Approved

Approved is terminal.

An approved requisition cannot be:

- updated
- submitted again
- approved again
- rejected afterwards

Approval records:

- approver ID
- approver name snapshot
- approved timestamp
- PO number

Approval also clears previous rejection metadata.

---

## 7. Rejected

Rejected is not terminal.

A rejected requisition can be edited and resubmitted. This is intentional because rejection usually means the user needs to correct data and try again.

Rejection records:

- rejecter ID
- rejecter name snapshot
- rejected timestamp
- rejection notes

Rejection also clears approval metadata.

When a rejected requisition is resubmitted:

- root rejection metadata is cleared
- a new pending submission is created
- the previous rejected submission remains in submission history
- the submission number increments

---

## 8. Submission history

Each submit creates a submission record.

Submission records preserve the historical workflow:

```text
Submission 1: Rejected
Submission 2: Pending
Submission 2: Approved
```

This allows the system to show what happened over time instead of only showing the current root status.

The current pending submission is the submission with `Pending` status.

---

## 9. Submission snapshots

On submit, the backend creates a JSON snapshot of the requisition.

The snapshot captures what was submitted at that moment. Later changes to the current requisition or lookup names should not rewrite historical submissions.

This supports:

- submission history views
- print views
- auditability
- approval/rejection review

Snapshots are intentionally separate from the current editable detail model.

---

## 10. Positive subtotal rule

A requisition must have a subtotal greater than zero before it can be submitted.

This prevents API callers from submitting a requisition that technically contains rows but has no meaningful value.

Draft save can remain more permissive so users can work progressively, but submit is a business action and must be complete.

This rule is enforced in the domain aggregate for both FE and STD requisitions.

---

## 11. Row version and concurrency

Existing update, existing submit, approve, and reject operations require a row version.

The row version protects against stale writes. For example:

1. User A opens a requisition.
2. User B updates or submits the same requisition.
3. User A attempts to save stale data.
4. The backend detects the stale row version and rejects the write.

Create/new-submit does not require a row version because there is no existing persisted row yet.

---

## 12. Child row ownership

When updating a requisition, incoming child row IDs must belong to the aggregate being updated.

The backend should reject:

- unknown existing child row IDs
- child row IDs from another requisition
- duplicate incoming child row IDs

The backend should allow:

- null/empty child row IDs for new rows
- known existing child row IDs for updates
- omission of an existing child row to remove it

This prevents malicious or buggy callers from moving child rows between requisitions.

---

## 13. Inactive lookup behaviour

Inactive lookups are handled carefully so existing requisitions remain editable without allowing new invalid selections.

The intended rule is:

| Scenario | Behaviour |
|---|---|
| Existing inactive lookup unchanged | Allowed |
| New inactive lookup selected | Blocked |
| Existing active lookup changed to inactive lookup | Blocked |

This applies to root lookups and child lookups where relevant.

---

## 14. Where lifecycle rules live

Lifecycle rules belong in the domain aggregate:

```text
FeRequisition
StdRequisition
```

Application services orchestrate loading, validation, row-version setup, builders, snapshots, and persistence, but the aggregate owns whether a status transition is valid.

The frontend mirrors these rules for user experience, but it is not the source of truth.

---

## 15. Test checklist for lifecycle changes

When changing lifecycle behaviour, check or add tests for:

- draft can update
- draft can submit
- submitted cannot update
- submitted cannot submit again
- submitted can approve
- submitted can reject
- approved cannot update
- approved cannot submit
- approved cannot approve/reject again
- rejected can update
- rejected can resubmit
- rejected cannot approve/reject without resubmission
- submit requires positive subtotal
- resubmit creates the next submission number
- rejection clears approval metadata
- approval clears rejection metadata
