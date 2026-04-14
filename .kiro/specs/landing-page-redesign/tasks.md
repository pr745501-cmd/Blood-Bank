# Implementation Plan: Landing Page Redesign (Blood Buddy)

## Overview

Replace `client/src/pages/Home.jsx` and all files in `client/src/components/homepage/` with a faithful React + Tailwind CSS recreation of the Blood Buddy design. Each section is implemented as an isolated component, wired together in `Home.jsx`. Static data arrays are exported from each component file so property-based tests can import and validate them directly.

## Tasks

- [x] 1. Global setup — fonts, CDN, and CSS baseline
  - Add Font Awesome 5 CDN `<link>` to `client/index.html` (before `</head>`)
  - Add `@import` rules for Google Fonts (Fredoka One, Neuton, Patrick Hand SC, Alegreya Sans SC, NTR, Raleway) to `client/src/index.css`
  - Confirm `scroll-behavior: smooth` is present on `html` in `client/src/index.css` (already exists — verify and leave intact)
  - _Requirements: 1.1, 1.2_

- [x] 2. Navbar component
  - [x] 2.1 Rewrite `client/src/components/homepage/Navbar.jsx`
    - Absolutely-positioned overlay nav (no fixed top bar — lives inside Hero)
    - Logo left-aligned linking to `#home`, Fredoka One font
    - Right-aligned anchor links: About Us → `#about`, Volunteer → `#volunteers`, Donate → `#donate`, Get Help → `#contact`
    - Hamburger (`fa-bars`) toggles a slide-in panel with salmon (`#fa8072`) background on mobile
    - _Requirements: 2.4, 2.5, 10.2_

  - [ ]* 2.2 Write unit tests for Navbar
    - Logo present and links to `#home`
    - All 4 nav links present with correct `href` values
    - Hamburger button visible at mobile viewport; clicking it toggles the mobile menu
    - _Requirements: 2.4, 2.5, 10.2_

- [x] 3. Hero section
  - [x] 3.1 Rewrite `client/src/components/homepage/Hero.jsx`
    - `section#home`, `h-screen relative overflow-hidden`
    - `<video autoPlay loop muted playsInline src="/video/homevideo1.mp4">` absolutely positioned, `object-cover w-full h-full`
    - Semi-transparent dark overlay (`bg-black/40`)
    - Render `<Navbar />` as an absolutely-positioned child inside the section
    - Headline "Start Saving Lives" (Neuton font, large white text)
    - Subtitle "Become a donor or request for blood And help save lives"
    - "Register" `<Link to="/register">` button with `border-2 border-black hover:bg-[#cd5c5c]` and Patrick Hand SC font
    - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.6, 2.7, 2.8_

  - [ ]* 3.2 Write unit tests for Hero
    - Section has `id="home"` and `h-screen` class
    - Video has correct `src`, `autoPlay`, `loop`, `muted`, `playsInline`
    - Headline text "Start Saving Lives" present
    - Register button links to `/register`
    - _Requirements: 2.1, 2.2, 2.6, 2.7_

- [x] 4. Features (About) section
  - [x] 4.1 Rewrite `client/src/components/homepage/Features.jsx`
    - Export `FEATURE_CARDS` array (6 items) at module level for testability
    - `section#about`, heading "What is this all about?" (Alegreya Sans SC font)
    - `grid grid-cols-1 md:grid-cols-3 gap-6` (3×2 on desktop)
    - 6 cards: What we do, Innovative, Network, Get notified, Totally Free, Save Life — each with emoji icon, title (Alegreya Sans SC), description (NTR font)
    - `hover:scale-105 transition-transform` on each card
    - _Requirements: 3.1, 3.2, 3.3, 3.4_

  - [ ]* 4.2 Write property test for feature card completeness
    - **Property 1: Every feature card contains all required elements**
    - For any index 0–5, `FEATURE_CARDS[index]` must have non-empty `emoji`, `title`, and `description`
    - **Validates: Requirements 3.3**

  - [ ]* 4.3 Write unit tests for Features
    - Section has `id="about"`
    - Heading "What is this all about?" present
    - Exactly 6 cards rendered
    - _Requirements: 3.1, 3.2_

- [x] 5. Volunteers (leaderboard) section
  - [x] 5.1 Rewrite `client/src/components/homepage/WhyChooseUs.jsx` → rename file to `Volunteers.jsx` and update the import in `Home.jsx`
    - Export `DONORS` array (10 items) at module level for testability
    - `section#volunteers`, `bg-[#f08080]` salmon background
    - Heading "Our Super Heroes" (Alegreya Sans SC font)
    - Description paragraph about volunteer workforce
    - `<ul>` of 10 `<li>` rows: rank, name, location, blood type
    - Top 3 rows: `bg-white/60`, `bg-white/40`, `bg-white/20`; rows 4–10: `bg-white/10`
    - `hover:scale-105 hover:bg-pink-200 transition-transform` on each row
    - Wrapper has `overflow-x-auto` for mobile
    - _Requirements: 4.1, 4.2, 4.3, 4.4, 10.3_

  - [ ]* 5.2 Write property test for leaderboard row completeness
    - **Property 2: Every leaderboard row contains all required data fields**
    - For any index 0–9, `DONORS[index]` must have `rank > 0`, non-empty `name`, `location`, and `bloodType`
    - **Validates: Requirements 4.3**

  - [ ]* 5.3 Write unit tests for Volunteers
    - Section has `id="volunteers"` and salmon background class
    - Exactly 10 rows rendered
    - _Requirements: 4.1, 4.2, 4.3_

- [x] 6. Testimonials section
  - [x] 6.1 Rewrite `client/src/components/homepage/Testimonials.jsx`
    - Export `TESTIMONIALS` array (3 items) at module level for testability
    - `section#testimonials`, dark overlay background with `bg-fixed bg-cover bg-center` parallax
    - Heading "Testimonials — See what our users have to say" (Alegreya Sans SC font)
    - `grid grid-cols-1 md:grid-cols-3` of 3 review cards
    - Each card: large decorative `"` quote mark, italic quote text, avatar placeholder, donor name
    - Data: Esha Puri, Amit Mangal, Dr. Kabir Khatri (exact quotes from design)
    - _Requirements: 5.1, 5.2, 5.3_

  - [ ]* 6.2 Write property test for review card completeness
    - **Property 3: Every review card contains all required elements**
    - For any index 0–2, `TESTIMONIALS[index]` must have non-empty `quote` and `name`
    - **Validates: Requirements 5.2**

  - [ ]* 6.3 Write unit tests for Testimonials
    - Section has `id="testimonials"`
    - Exactly 3 review cards rendered
    - _Requirements: 5.1, 5.2_

- [x] 7. Checkpoint — verify sections so far
  - Ensure all tests pass, ask the user if questions arise.

- [x] 8. Process (Donate) section
  - [x] 8.1 Rewrite `client/src/components/homepage/Process.jsx`
    - Export `STEPS` array (6 items) at module level for testability
    - `section#donate`, dotted background: `bg-[radial-gradient(#ccc_1px,transparent_1px)] bg-[size:20px_20px]`
    - Heading "How to Donate?" (Alegreya Sans SC font)
    - 6 numbered step items: Register 📝, Post a Blood Request 🩸, Respond 🤝, Get Notified 🔔, Forever Free 🆓, Save a Life ❤️
    - Each step: number badge, emoji, title text
    - "Register" `<Link to="/register">` CTA button with salmon hover color
    - _Requirements: 6.1, 6.2, 6.3_

  - [ ]* 8.2 Write property test for step item completeness
    - **Property 4: Every step item contains all required elements**
    - For any index 0–5, `STEPS[index]` must have `number > 0`, non-empty `title`, and non-empty `emoji`
    - **Validates: Requirements 6.2**

  - [ ]* 8.3 Write unit tests for Process
    - Section has `id="donate"`
    - Exactly 6 steps rendered
    - Register button links to `/register`
    - _Requirements: 6.1, 6.2, 6.3_

- [x] 9. Contact section
  - [x] 9.1 Rewrite `client/src/components/homepage/Contact.jsx`
    - Export `validateContactForm(formData)` function at module level for testability
    - `section#contact`, `grid grid-cols-1 md:grid-cols-2 gap-8`
    - Left column: illustration image (SVG or `<img>` placeholder)
    - Right column: Contact_Form with Email (`type="email"`), Phone (`type="tel"`), Message (`<textarea>`), Send button
    - Client-side validation: each empty required field gets an inline error message; API not called until all fields valid
    - On success: confirmation message replaces form
    - On API failure: generic error message, form fields preserved
    - Calls `POST /contact` via existing `API` service
    - _Requirements: 7.1, 7.2, 7.3, 7.4_

  - [ ]* 9.2 Write property test for contact form validation
    - **Property 5: Contact form validation covers all empty field combinations**
    - For any non-empty subset of `['email', 'phone', 'message']` left empty, `validateContactForm` must return an error for each empty field
    - **Validates: Requirements 7.4**

  - [ ]* 9.3 Write unit tests for Contact
    - Section has `id="contact"`
    - All form fields present (email, phone, message, send button)
    - Submitting with empty fields shows per-field error messages
    - Successful submit shows confirmation message
    - _Requirements: 7.1, 7.2, 7.3, 7.4_

- [x] 10. Footer section
  - [x] 10.1 Rewrite `client/src/components/homepage/Footer.jsx`
    - `footer#footer`, `bg-[#111]` dark background
    - Heading "JOIN OUR CAUSE" (Raleway font)
    - Mission description paragraph
    - Social icon links using Font Awesome: `fab fa-facebook` → Facebook, `fab fa-instagram` → Instagram, `fas fa-globe` → NBTC
    - Copyright "2021 © All rights reserved."
    - _Requirements: 8.1, 8.2, 8.3, 8.4_

  - [ ]* 10.2 Write unit tests for Footer
    - Section has `id="footer"` and dark background class
    - "JOIN OUR CAUSE" heading present
    - 3 social links present
    - Copyright text "2021 © All rights reserved." present
    - _Requirements: 8.1, 8.2, 8.3, 8.4_

- [x] 11. ScrollToTopButton component
  - [x] 11.1 Create `client/src/components/homepage/ScrollToTopButton.jsx`
    - Export `isScrollToTopVisible(scrollY)` pure function at module level for testability
    - `fixed bottom-5 right-8 z-50`
    - Hidden when `scrollY <= 300`, visible when `scrollY > 300` (managed via `useState` + `useEffect` scroll listener)
    - Cleanup scroll listener on unmount
    - `bg-red-500 text-white rounded-full p-4`, Font Awesome `fa fa-arrow-up` icon
    - On click: `window.scrollTo({ top: 0, behavior: 'smooth' })`
    - _Requirements: 9.1, 9.2, 9.3, 9.4_

  - [ ]* 11.2 Write property test for scroll-to-top visibility threshold
    - **Property 6: Scroll-to-top button visibility follows the 300px threshold**
    - For any integer `scrollY` 0–10000, `isScrollToTopVisible(scrollY)` must equal `scrollY > 300`
    - **Validates: Requirements 9.2, 9.3**

  - [ ]* 11.3 Write unit tests for ScrollToTopButton
    - Hidden at scroll position 0
    - Visible at scroll position 301
    - Clicking calls `window.scrollTo`
    - _Requirements: 9.1, 9.2, 9.3, 9.4_

- [x] 12. Wire everything together in Home.jsx
  - [x] 12.1 Rewrite `client/src/pages/Home.jsx`
    - Import and compose in order: `Hero` (contains Navbar), `Features`, `Volunteers`, `Testimonials`, `Process`, `Contact`, `Footer`, `ScrollToTopButton`
    - Remove old `WhyChooseUs` import
    - No props passed to any section component
    - _Requirements: 2.1–2.8, 3.1–3.4, 4.1–4.4, 5.1–5.3, 6.1–6.3, 7.1–7.4, 8.1–8.4, 9.1–9.4, 10.1–10.3_

- [ ] 13. Set up fast-check and property-based test file
  - [x] 13.1 Install fast-check dev dependency
    - Run `npm install --save-dev fast-check` in `client/`
    - _Requirements: (testing infrastructure)_

  - [ ]* 13.2 Write all 6 property-based tests in `client/src/components/homepage/__tests__/homepage.pbt.test.js`
    - Import `FEATURE_CARDS`, `DONORS`, `TESTIMONIALS`, `STEPS` from their respective component files
    - Import `validateContactForm` from `Contact.jsx`
    - Import `isScrollToTopVisible` from `ScrollToTopButton.jsx`
    - Implement Properties 1–6 as described in the design document, each with `numRuns: 100`
    - _Requirements: 3.3, 4.3, 5.2, 6.2, 7.4, 9.2, 9.3_

- [ ] 14. Final checkpoint — ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

## Notes

- Tasks marked with `*` are optional and can be skipped for a faster MVP
- `WhyChooseUs.jsx` is replaced by `Volunteers.jsx`; update the import in `Home.jsx` accordingly (task 12.1)
- All static data arrays (`FEATURE_CARDS`, `DONORS`, `TESTIMONIALS`, `STEPS`) and pure functions (`validateContactForm`, `isScrollToTopVisible`) must be exported from their component files so property tests can import them without rendering
- Font Awesome classes are used directly as JSX `className` strings (e.g., `"fab fa-facebook"`) — no npm package needed
- The video file is expected at `client/public/video/homevideo1.mp4`; if absent, the dark overlay keeps text legible
- Each task references specific requirements for traceability
