# Design Document: Admin Add Donor Fix

## Overview

The admin add-donor flow fails because the `Donor` model requires a `user` field (MongoDB ObjectId reference), but the admin form submits no `user` value. The fix has two parts:

1. Make `user` optional in the `Donor` model (remove `required: true`, add `sparse: true` to the unique index so multiple null values are allowed).
2. Reset the form fields after a successful submission in `AdminAddDonor.jsx` and surface errors to the user instead of silently swallowing them.

---

## Technical Context

### Donor Model (`server/models/Donor.js`)

The `user` field is currently:
```js
user: {
  type: mongoose.Schema.Types.ObjectId,
  ref: "User",
  required: true,   // ← causes validation failure for admin-created donors
  unique: true      // ← without sparse:true, only one null allowed
}
```

### Admin Route (`server/routes/adminRoutes.js`)

`POST /api/admin/add-donor` creates a `new Donor(req.body)` and calls `donor.save()`. No `user` field is injected server-side, so Mongoose validation throws before the document is persisted.

### AdminAddDonor.jsx (`client/src/admin/AdminAddDonor.jsx`)

- The form collects: `name`, `mobile`, `email`, `age`, `gender`, `bloodGroup`, `address`.
- On error, only `console.log(error)` is called — no user-facing feedback.
- On success, the form state is not reset.

---

## Solution Design

### Change 1 — `server/models/Donor.js`

Remove `required: true` from the `user` field and add `sparse: true` to allow multiple documents without a `user` value while still enforcing uniqueness among documents that do have one.

```js
user: {
  type: mongoose.Schema.Types.ObjectId,
  ref: "User",
  // required removed — admin-created donors have no linked user
  unique: true,
  sparse: true   // allows multiple null/absent values
}
```

### Change 2 — `client/src/admin/AdminAddDonor.jsx`

- After a successful POST, reset `formData` to the initial empty state.
- In the catch block, display an `alert` with the server error message so the admin knows what went wrong.

```js
// on success
setFormData({ name:"", mobile:"", email:"", age:"", gender:"", bloodGroup:"", address:"" });

// on error
alert(error.response?.data?.message || "Failed to add donor");
```

---

## Bug Condition Pseudocode

```pascal
FUNCTION isBugCondition(X)
  INPUT: X of type DonorPayload
  OUTPUT: boolean

  // Bug triggers when no user reference is provided (admin-created donor)
  RETURN X.user IS NULL OR X.user IS UNDEFINED
END FUNCTION
```

```pascal
// Property: Fix Checking
FOR ALL X WHERE isBugCondition(X) DO
  result ← addDonor'(X)
  ASSERT result.status = 201
  ASSERT result.body.donor EXISTS
  ASSERT no_crash(result)
END FOR
```

```pascal
// Property: Preservation Checking
FOR ALL X WHERE NOT isBugCondition(X) DO
  ASSERT addDonor(X) = addDonor'(X)
END FOR
```

---

## Correctness Properties

### Fix Checking

**Property 1.1** — Admin-created donor saves successfully (no user field)
- Given: a valid donor payload with no `user` field
- When: `POST /api/admin/add-donor` is called
- Then: response status is 201 and the donor document exists in the database

**Property 1.2** — Multiple admin-created donors can coexist
- Given: N donor payloads (N ≥ 2), none with a `user` field
- When: each is posted to `POST /api/admin/add-donor`
- Then: all N donors are saved successfully (no unique-index collision)

### Preservation Checking

**Property 2.1** — User-linked donor still saves correctly
- Given: a donor payload with a valid `user` ObjectId
- When: `POST /api/admin/add-donor` is called
- Then: response status is 201 and the donor is linked to the correct user

**Property 2.2** — Uniqueness per user is still enforced
- Given: two donor payloads with the same `user` ObjectId
- When: both are posted
- Then: the second insert is rejected with a duplicate-key error

**Property 2.3** — All submitted fields are persisted
- Given: a payload with all fields (name, mobile, email, age, gender, bloodGroup, address)
- When: the donor is saved
- Then: all field values match what was submitted

**Property 2.4** — newDonor socket event is still emitted
- Given: a successful donor creation
- When: the route handler completes
- Then: `io.emit("newDonor", donor)` is called with the saved donor document
