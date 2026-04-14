# Bugfix Requirements Document

## Introduction

When an admin attempts to add a donor via the admin panel (POST /api/admin/add-donor), the server responds with a 500 Internal Server Error. The root cause is that the `Donor` model requires a `user` field (a reference to a registered User document), but the admin add-donor form only submits donor profile fields (name, mobile, email, age, gender, bloodGroup, address) — no `user` reference. Mongoose validation fails on save, crashing the request. Additionally, the `unique: true` constraint on `user` without `sparse: true` would prevent multiple admin-created donors (all with no `user`) from coexisting in the database.

## Bug Analysis

### Current Behavior (Defect)

1.1 WHEN an admin submits the add-donor form without a linked user account THEN the system fails Mongoose validation because `user` is `required: true` and returns a 500 Internal Server Error.

1.2 WHEN multiple admin-created donors exist with no linked user account THEN the system rejects subsequent inserts because the `unique` index on `user` does not allow more than one `null` value.

### Expected Behavior (Correct)

2.1 WHEN an admin submits the add-donor form without a linked user account THEN the system SHALL save the donor document successfully and return 201 with the created donor.

2.2 WHEN multiple admin-created donors exist with no linked user account THEN the system SHALL allow all of them to coexist by treating the absent `user` field as a sparse unique index (multiple `null` values permitted).

### Unchanged Behavior (Regression Prevention)

3.1 WHEN a registered user registers as a donor through the normal user flow (with a valid `user` ObjectId) THEN the system SHALL CONTINUE TO save the donor document linked to that user.

3.2 WHEN two different registered users attempt to register as donors THEN the system SHALL CONTINUE TO enforce uniqueness so that each user can only have one donor record.

3.3 WHEN an admin successfully adds a donor THEN the system SHALL CONTINUE TO emit the `newDonor` real-time socket event to connected clients.

3.4 WHEN the admin donor form is submitted with valid data THEN the system SHALL CONTINUE TO persist all provided fields (name, mobile, email, age, gender, bloodGroup, address) correctly.
