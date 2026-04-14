# Bugfix Requirements Document

## Introduction

The BloodConnect frontend (React + Vite + Tailwind CSS) renders correctly on desktop but breaks or fails to adapt on mobile and tablet viewports. The fix must add responsive behavior — breakpoints, flexible layouts, fluid typography — without altering any visual design, colors, spacing, or UI elements as they appear on desktop (≥ 1024 px).

The affected areas are:
- `client/src/components/homepage/` — Navbar, Hero, Features, Process, WhyChooseUs, Testimonials, Contact, Footer
- `client/src/components/` — Layout (user portal sidebar/topbar)
- `client/src/admin/` — AdminLayout, AdminDashboard, AdminDonors, and other admin pages
- `client/src/pages/` — all user-facing pages (Login, Register, Dashboard, Profile, FindDonor, etc.)
- `client/src/components/dashboard/` — HeroSection, DonorStatsSection, ChartsSection, etc.

---

## Bug Analysis

### Current Behavior (Defect)

1.1 WHEN a user views the homepage Hero section on a mobile viewport (< 768 px) THEN the system renders oversized headings (`text-6xl`/`text-7xl`) that overflow or crowd the screen without scaling down

1.2 WHEN a user views the homepage Features, Process, WhyChooseUs, or Testimonials sections on a mobile viewport THEN the system renders section headings at `text-5xl` with no smaller mobile size, causing text to overflow or appear disproportionately large

1.3 WHEN a user views the homepage Footer on a mobile viewport THEN the system renders the link-column grid (`md:grid-cols-5`) with no explicit single-column mobile fallback, causing columns to be too narrow or overflow

1.4 WHEN a user views the Contact section form on a mobile viewport THEN the system renders the first-name / last-name row as a fixed `grid-cols-2` with no single-column fallback, causing inputs to be too narrow to use comfortably

1.5 WHEN a user views the Profile page hero header on a mobile viewport THEN the system renders the heading at `text-5xl md:text-7xl` with no smaller base size, causing it to overflow on small screens

1.6 WHEN a user views any page that contains large fixed-pixel or large Tailwind text utilities without a mobile-first smaller size THEN the system does not scale typography down for small viewports, breaking the visual hierarchy

1.7 WHEN a user views the AdminDashboard on a mobile viewport THEN the system renders the header action row and chart grids without adequate stacking, causing elements to overflow or be unusable on small screens

1.8 WHEN a user views the AdminDonors page on a mobile viewport THEN the system renders the action bar search input at `md:min-w-[400px]` with no mobile-friendly width constraint, causing horizontal overflow

### Expected Behavior (Correct)

2.1 WHEN a user views the homepage Hero section on a mobile viewport THEN the system SHALL render the heading at a smaller base size (e.g., `text-4xl`) that scales up to `md:text-6xl lg:text-7xl`, fitting within the viewport without overflow

2.2 WHEN a user views the homepage Features, Process, WhyChooseUs, or Testimonials sections on a mobile viewport THEN the system SHALL render section headings at a smaller base size (e.g., `text-3xl`) that scales up to `md:text-5xl`, maintaining readable proportions

2.3 WHEN a user views the homepage Footer on a mobile viewport THEN the system SHALL render the link-column grid as `grid-cols-2 md:grid-cols-3 lg:grid-cols-5` (or equivalent), keeping columns readable and preventing overflow

2.4 WHEN a user views the Contact section form on a mobile viewport THEN the system SHALL render the first-name / last-name row as `grid-cols-1 sm:grid-cols-2`, stacking the inputs on the smallest screens

2.5 WHEN a user views the Profile page hero header on a mobile viewport THEN the system SHALL render the heading at a smaller base size (e.g., `text-4xl`) that scales up to `md:text-5xl lg:text-7xl`

2.6 WHEN a user views any page on a mobile viewport THEN the system SHALL apply mobile-first responsive typography so that all large headings scale down gracefully without overflowing their containers

2.7 WHEN a user views the AdminDashboard on a mobile viewport THEN the system SHALL stack the header action row vertically and render chart grids as single-column, keeping all content accessible without horizontal scroll

2.8 WHEN a user views the AdminDonors page on a mobile viewport THEN the system SHALL render the search input with `w-full` and no fixed minimum width that causes overflow, while the table remains horizontally scrollable via its existing `overflow-x-auto` wrapper

### Unchanged Behavior (Regression Prevention)

3.1 WHEN a user views any page on a desktop viewport (≥ 1024 px) THEN the system SHALL CONTINUE TO render all layouts, colors, spacing, typography, and UI elements exactly as they appear today

3.2 WHEN a user views the homepage Navbar on any viewport THEN the system SHALL CONTINUE TO show the desktop link row on `md:` and above, and the hamburger + mobile drawer on smaller screens, with no change to styling

3.3 WHEN a user views the Login or Register pages on any viewport THEN the system SHALL CONTINUE TO show the left decorative panel only on `lg:` and above, and the mobile logo only below `lg:`, with no change to form layout or styling

3.4 WHEN a user views the user portal (Layout.jsx) on any viewport THEN the system SHALL CONTINUE TO show the full sidebar on `lg:` and above and the mobile drawer on smaller screens, with no change to sidebar styling or navigation items

3.5 WHEN a user views the AdminLayout on any viewport THEN the system SHALL CONTINUE TO show the collapsible sidebar on desktop and the mobile drawer on smaller screens, with no change to the crimson topbar or sidebar styling

3.6 WHEN a user interacts with any form, button, chart, table, or modal on desktop THEN the system SHALL CONTINUE TO behave identically to the pre-fix behavior, with no functional regressions

3.7 WHEN a user views the AdminDashboard stat cards on a mobile viewport THEN the system SHALL CONTINUE TO render them in a 2-column grid (`grid-cols-2`) as already implemented, with no change

3.8 WHEN a user views the AdminDonors table on any viewport THEN the system SHALL CONTINUE TO allow horizontal scrolling via the existing `overflow-x-auto` wrapper, with no change to table structure or column definitions
