# Tasks: Admin Add Donor Fix

## Task List

- [x] 1. Fix Donor model — make user field optional with sparse index
  - [x] 1.1 Remove `required: true` from the `user` field in `server/models/Donor.js`
  - [x] 1.2 Add `sparse: true` to the `user` field so multiple null values are permitted by the unique index

- [x] 2. Fix AdminAddDonor.jsx — error feedback and form reset
  - [x] 2.1 Replace `console.log(error)` in the catch block with `alert(error.response?.data?.message || "Failed to add donor")`
  - [x] 2.2 Reset `formData` to the initial empty state after a successful submission

- [x] 3. Write tests
  - [x] 3.1 Write a fix-checking test: POST to `/api/admin/add-donor` without a `user` field returns 201 and persists the donor
  - [x] 3.2 Write a fix-checking test: two admin-created donors (no `user` field) can both be saved without a unique-index collision
  - [x] 3.3 Write a preservation test: donor with a valid `user` ObjectId still saves and links correctly
  - [x] 3.4 Write a preservation test: two donors with the same `user` ObjectId — second insert is rejected
  - [x] 3.5 Write a preservation test: all submitted fields (name, mobile, email, age, gender, bloodGroup, address) are persisted correctly
