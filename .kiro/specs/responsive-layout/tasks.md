# Implementation Plan

- [x] 1. Write bug condition exploration test
  - **Property 1: Bug Condition** - Missing Mobile-First Base Classes
  - **CRITICAL**: This test MUST FAIL on unfixed code — failure confirms the bug exists
  - **DO NOT attempt to fix the test or the code when it fails**
  - **NOTE**: This test encodes the expected behavior — it will validate the fix when it passes after implementation
  - **GOAL**: Surface counterexamples that demonstrate the bug exists in each affected component
  - **Scoped PBT Approach**: Scope the property to the concrete failing className strings in each component
  - Test 1 — Hero heading: render `<Hero />`, find the `h1`, assert its className contains a base text size ≤ `text-4xl` (no breakpoint prefix). On unfixed code `text-6xl` is the base — FAILS.
  - Test 2 — Section headings: render `<Features />`, `<Process />`, `<WhyChooseUs />`, `<Testimonials />`, find each `h2`, assert base size ≤ `text-4xl`. On unfixed code `text-5xl` is the base — FAILS.
  - Test 3 — Contact name row: render `<Contact />`, find the `grid-cols-2` div wrapping First/Last name inputs, assert className contains `grid-cols-1`. On unfixed code only `grid-cols-2` is present — FAILS.
  - Test 4 — Footer link grid: render `<Footer />`, find the `grid md:grid-cols-5` container, assert className contains `grid-cols-2` or `grid-cols-1` as a base (no-prefix) class. On unfixed code no base grid class is present — FAILS.
  - Test 5 — Profile hero heading: render `<Profile />`, find the hero `h1`, assert base size ≤ `text-4xl`. On unfixed code `text-5xl` is the base — FAILS.
  - Test 6 — AdminDonors search wrapper: render `<AdminDonors />`, find the search input wrapper div, assert className does NOT contain `min-w-[400px]` without a breakpoint prefix. On unfixed code `md:min-w-[400px]` is present — FAILS (note: `md:` prefix makes this a borderline case; assert the class is absent entirely).
  - Run all tests on UNFIXED code
  - **EXPECTED OUTCOME**: Tests FAIL (this is correct — it proves the bug exists)
  - Document counterexamples found (e.g., "Hero h1 has className 'text-6xl md:text-7xl' — no base ≤ text-4xl")
  - Mark task complete when tests are written, run, and failures are documented
  - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5, 1.8_

- [x] 2. Write preservation property tests (BEFORE implementing fix)
  - **Property 2: Preservation** - Desktop Breakpoint Classes Unchanged
  - **IMPORTANT**: Follow observation-first methodology
  - Observe: on unfixed code, extract all `md:` and `lg:` Tailwind classes from each affected component's className strings
  - Observe Hero h1: `md:text-7xl` is present
  - Observe Features/Process/WhyChooseUs/Testimonials h2: `md:text-5xl` is absent (no md: variant yet) — record actual state
  - Observe Contact form: `grid-cols-2` is the base (record it); `lg:grid-cols-2` on the outer layout is present
  - Observe Footer: `md:grid-cols-5` is present; brand column has `md:col-span-1`
  - Observe Profile h1: `md:text-7xl` is present
  - Observe AdminDonors search wrapper: `flex-1` is present; `md:min-w-[400px]` is present (to be removed, not a preservation target)
  - Write property-based test: for all affected components, assert that every `md:` and `lg:` class present in the original is still present in the fixed version (no class removal)
  - Write property-based test: for components NOT in the affected set (AdminDashboard, Layout, AdminLayout, Navbar), assert className strings are byte-for-byte identical before and after
  - Verify tests PASS on UNFIXED code (they capture baseline behavior)
  - **EXPECTED OUTCOME**: Tests PASS (confirms baseline desktop behavior to preserve)
  - Mark task complete when tests are written, run, and passing on unfixed code
  - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5, 3.6, 3.7, 3.8_

- [ ] 3. Fix responsive layout — add mobile-first base classes

  - [x] 3.1 Fix Hero heading (`client/src/components/homepage/Hero.jsx`)
    - Change `text-6xl md:text-7xl` → `text-4xl md:text-6xl lg:text-7xl` on the `h1` element
    - _Bug_Condition: isBugCondition(className) where className contains 'text-6xl' as base with no smaller base_
    - _Expected_Behavior: base text size ≤ text-4xl, md: and lg: variants scale up_
    - _Preservation: md:text-7xl becomes lg:text-7xl; md:text-6xl is the new md: class — desktop (lg:) renders identically_
    - _Requirements: 2.1, 3.1_

  - [x] 3.2 Fix section headings in Features, Process, WhyChooseUs, Testimonials
    - `client/src/components/homepage/Features.jsx` — h2: `text-5xl` → `text-3xl md:text-5xl`
    - `client/src/components/homepage/Process.jsx` — h2: `text-5xl` → `text-3xl md:text-5xl`
    - `client/src/components/homepage/WhyChooseUs.jsx` — h2: `text-5xl` → `text-3xl md:text-5xl`
    - `client/src/components/homepage/Testimonials.jsx` — h2: `text-5xl` → `text-3xl md:text-5xl`
    - _Bug_Condition: isBugCondition(className) where className contains 'text-5xl' as base with no smaller base_
    - _Expected_Behavior: base text size = text-3xl, md:text-5xl scales up for tablet/desktop_
    - _Preservation: md:text-5xl class is preserved; all other classes, colors, and spacing unchanged_
    - _Requirements: 2.2, 3.1_

  - [x] 3.3 Fix Contact form name row (`client/src/components/homepage/Contact.jsx`)
    - Name row grid: `grid-cols-2` → `grid-cols-1 sm:grid-cols-2`
    - Section h2: `text-5xl` → `text-3xl md:text-5xl`
    - _Bug_Condition: isBugCondition(className) where className contains 'grid-cols-2' as base on a form input row_
    - _Expected_Behavior: single-column stack on mobile (< 640 px), two-column from sm: upward_
    - _Preservation: sm:grid-cols-2 preserves two-column layout at tablet and desktop; h2 md:text-5xl preserved_
    - _Requirements: 2.2, 2.4, 3.1_

  - [x] 3.4 Fix Footer link grid and brand column (`client/src/components/homepage/Footer.jsx`)
    - Link grid: `grid md:grid-cols-5` → `grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5`
    - Brand column: add `col-span-2 md:col-span-1` (was `md:col-span-1` only)
    - _Bug_Condition: isBugCondition(className) where className contains 'md:grid-cols-5' with no base grid-cols class_
    - _Expected_Behavior: grid-cols-2 base on mobile, md:grid-cols-3 on tablet, lg:grid-cols-5 on desktop_
    - _Preservation: md:grid-cols-5 becomes lg:grid-cols-5; desktop (lg:) renders identically_
    - _Requirements: 2.3, 3.1_

  - [ ] 3.5 Fix Profile hero heading (`client/src/pages/Profile.jsx`)
    - Hero h1: `text-5xl md:text-7xl` → `text-3xl md:text-5xl lg:text-7xl`
    - _Bug_Condition: isBugCondition(className) where className contains 'text-5xl' as base with no smaller base_
    - _Expected_Behavior: base text-3xl on mobile, md:text-5xl on tablet, lg:text-7xl on desktop_
    - _Preservation: lg:text-7xl preserves desktop heading size; all other profile styles unchanged_
    - _Requirements: 2.5, 3.1_

  - [ ] 3.6 Fix AdminDonors search input wrapper (`client/src/admin/AdminDonors.jsx`)
    - Remove `md:min-w-[400px]` from the search input wrapper div; keep `flex-1`
    - _Bug_Condition: isBugCondition(className) where className contains 'md:min-w-[400px]' on a search input_
    - _Expected_Behavior: input uses flex-1 and w-full only, no fixed minimum width_
    - _Preservation: flex-1 and all other wrapper classes unchanged; table overflow-x-auto wrapper unchanged_
    - _Requirements: 2.8, 3.8_

  - [ ] 3.7 Verify bug condition exploration test now passes
    - **Property 1: Expected Behavior** - Mobile-First Base Classes Present
    - **IMPORTANT**: Re-run the SAME tests from task 1 — do NOT write new tests
    - The tests from task 1 encode the expected behavior (base size ≤ text-4xl, grid-cols-1 base, no bare min-w)
    - When these tests pass, it confirms the expected behavior is satisfied for all affected components
    - Run all six bug condition tests from step 1 on the FIXED code
    - **EXPECTED OUTCOME**: All tests PASS (confirms bug is fixed)
    - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5, 2.8_

  - [ ] 3.8 Verify preservation tests still pass
    - **Property 2: Preservation** - Desktop Breakpoint Classes Unchanged
    - **IMPORTANT**: Re-run the SAME tests from task 2 — do NOT write new tests
    - Run all preservation property tests from step 2 on the FIXED code
    - **EXPECTED OUTCOME**: Tests PASS (confirms no regressions in desktop layout or unaffected components)
    - Confirm all `md:` and `lg:` classes observed in step 2 are still present after the fix
    - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5, 3.6, 3.7, 3.8_

- [ ] 4. Checkpoint — Ensure all tests pass
  - Re-run the full test suite; all tests from tasks 1 and 2 must pass
  - Manually verify at 375 px viewport: no horizontal overflow on homepage, Profile page, and AdminDonors page
  - Manually verify at 1440 px viewport: desktop layouts are pixel-identical to pre-fix state
  - Ask the user if any questions arise before closing the spec
