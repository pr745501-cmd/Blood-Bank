# Requirements Document

## Introduction

This feature rebuilds the existing `client/src/pages/Home.jsx` landing page and its associated homepage components to faithfully recreate the Blood Buddy design (https://github.com/2024-SANDHYA/Blood-Buddy). The redesigned page is a single-page marketing/landing experience composed of seven ordered sections: Hero, About, Volunteers, Testimonials, Donate, Contact/Help, and Footer. It is built with React (JSX), Tailwind CSS, and Vite, uses React Router for navigation, and relies on Google Fonts (Fredoka One, Neuton, Patrick Hand SC, Alegreya Sans SC, NTR, Raleway). A floating scroll-to-top button and smooth scroll behavior are also required.

---

## Glossary

- **Landing_Page**: The root route (`/`) rendered by `client/src/pages/Home.jsx`.
- **Hero_Section**: The fullscreen video-background section at the top of the Landing_Page.
- **About_Section**: The six-card feature grid section titled "What is this all about?".
- **Volunteers_Section**: The salmon-background leaderboard section titled "Our Super Heroes".
- **Testimonials_Section**: The dark-background parallax section with three customer review cards.
- **Donate_Section**: The dotted/particle-background numbered-steps section.
- **Contact_Section**: The split-layout section with an illustration and a contact form.
- **Footer**: The dark-background section at the bottom of the Landing_Page.
- **ScrollToTop_Button**: The floating red button with an up-arrow icon that scrolls the page to the top.
- **Navbar**: The fixed top navigation bar rendered inside the Hero_Section overlay.
- **Video_Background**: The looping, muted, autoplay `<video>` element at `client/public/video/homevideo1.mp4`.
- **Feature_Card**: One of the six cards in the About_Section grid.
- **Leaderboard_Table**: The ranked donor table inside the Volunteers_Section.
- **Review_Card**: One of the three testimonial cards in the Testimonials_Section.
- **Step_Item**: One numbered entry in the Donate_Section steps list.
- **Contact_Form**: The form with Email, Phone, Message fields and a Send button in the Contact_Section.

---

## Requirements

### Requirement 1: Global Font and Style Setup

**User Story:** As a developer, I want the Blood Buddy fonts and color palette applied globally, so that every section renders with the correct visual identity.

#### Acceptance Criteria

1. THE Landing_Page SHALL import the Google Fonts families Fredoka One, Neuton, Patrick Hand SC, Alegreya Sans SC, NTR, and Raleway via a `<link>` in `client/index.html` or via `@import` in `client/src/index.css`.
2. THE Landing_Page SHALL apply `scroll-behavior: smooth` to the `html` element.
3. THE Landing_Page SHALL use the salmon/coral color palette (`#f08080`, `#cd5c5c`) as the primary accent color for buttons, highlights, and section backgrounds where specified.

---

### Requirement 2: Hero Section

**User Story:** As a visitor, I want to see a fullscreen video hero with navigation and a call-to-action, so that I immediately understand the platform's purpose and can register.

#### Acceptance Criteria

1. THE Hero_Section SHALL occupy 100% of the viewport height (`100vh`) and display the Video_Background as a fullscreen background.
2. THE Video_Background SHALL have `autoPlay`, `loop`, `muted`, and `playsInline` attributes set, and SHALL source from `/video/homevideo1.mp4`.
3. THE Hero_Section SHALL render a semi-transparent dark overlay on top of the Video_Background so that text remains legible.
4. THE Navbar SHALL be positioned absolutely at the top of the Hero_Section and SHALL display the Blood Buddy logo on the left and navigation links (About Us, Volunteer, Donate, Get Help) on the right.
5. WHEN a Navbar navigation link is clicked, THE Navbar SHALL scroll smoothly to the corresponding section on the Landing_Page.
6. THE Hero_Section SHALL display the headline "Start Saving Lives" and the subtitle "Become a donor or request for blood And help save lives".
7. THE Hero_Section SHALL display a "Register" button that navigates to `/register` using React Router.
8. WHEN the user hovers over the "Register" button, THE Hero_Section SHALL apply a visible hover effect (e.g., background color change or scale transform).

---

### Requirement 3: About Section

**User Story:** As a visitor, I want to read about the platform's key features in a card grid, so that I understand what Blood Buddy offers.

#### Acceptance Criteria

1. THE About_Section SHALL display the heading "What is this all about?" and be identifiable by the section id `about`.
2. THE About_Section SHALL render exactly six Feature_Cards arranged in a 3-column × 2-row grid on desktop and a responsive layout on smaller screens.
3. EACH Feature_Card SHALL display an icon, a title, and a description corresponding to one of: What we do, Innovative, Network, Get notified, Totally Free, Save Life.
4. WHEN the user hovers over a Feature_Card, THE Feature_Card SHALL apply a scale-up transform effect.

---

### Requirement 4: Volunteers Section

**User Story:** As a visitor, I want to see a leaderboard of top donors, so that I feel motivated to participate and recognize community heroes.

#### Acceptance Criteria

1. THE Volunteers_Section SHALL display the heading "Our Super Heroes" and be identifiable by the section id `volunteers`.
2. THE Volunteers_Section SHALL use a salmon/coral background color (`#f08080` or equivalent Tailwind class).
3. THE Volunteers_Section SHALL render a Leaderboard_Table with exactly 10 rows, each showing rank, donor name, location, and blood type.
4. THE Leaderboard_Table SHALL visually distinguish the top 3 rows from the remaining rows using different opacity or highlight styling.

---

### Requirement 5: Testimonials Section

**User Story:** As a visitor, I want to read customer reviews, so that I trust the platform before registering.

#### Acceptance Criteria

1. THE Testimonials_Section SHALL use a dark background and be identifiable by the section id `testimonials`.
2. THE Testimonials_Section SHALL render exactly three Review_Cards, each containing a quote, a donor photo (or avatar placeholder), and the donor's name.
3. WHERE the browser supports CSS `background-attachment: fixed`, THE Testimonials_Section SHALL apply a parallax background effect.

---

### Requirement 6: Donate Section

**User Story:** As a visitor, I want to see a clear step-by-step guide to donating, so that I know exactly what to do to get started.

#### Acceptance Criteria

1. THE Donate_Section SHALL be identifiable by the section id `donate` and SHALL use a dotted or particle-style background pattern.
2. THE Donate_Section SHALL render exactly six Step_Items in a numbered list: Register, Post a Blood Request, Respond, Get Notified, Forever Free, Save a Life — each accompanied by an emoji.
3. THE Donate_Section SHALL display a "Register" button that navigates to `/register` using React Router.

---

### Requirement 7: Contact / Help Section

**User Story:** As a visitor, I want to send a message to the Blood Buddy team, so that I can get help or ask questions.

#### Acceptance Criteria

1. THE Contact_Section SHALL be identifiable by the section id `contact` and SHALL use a two-column layout: an illustration image on the left and the Contact_Form on the right.
2. THE Contact_Form SHALL contain input fields for Email and Phone, a textarea for Message, and a Send button.
3. WHEN the user submits the Contact_Form with all fields filled, THE Contact_Form SHALL prevent the default browser form submission and display a confirmation message or call the existing contact API endpoint.
4. IF the user submits the Contact_Form with any required field empty, THEN THE Contact_Form SHALL display a validation error message for each empty field.

---

### Requirement 8: Footer

**User Story:** As a visitor, I want to see the footer with social links and copyright, so that I can find the platform's social channels and know the site is maintained.

#### Acceptance Criteria

1. THE Footer SHALL use a dark background (`#111` or equivalent) and be identifiable by the section id `footer`.
2. THE Footer SHALL display the heading "JOIN OUR CAUSE" and a short description of the platform's mission.
3. THE Footer SHALL render social icon links for Facebook, Instagram, and Globe (website).
4. THE Footer SHALL display the copyright text "2021 © All rights reserved."

---

### Requirement 9: Scroll-to-Top Button

**User Story:** As a visitor, I want a floating button to scroll back to the top of the page, so that I can quickly return to the hero section from any point.

#### Acceptance Criteria

1. THE ScrollToTop_Button SHALL be fixed to the bottom-right corner of the viewport and SHALL display a red background with an upward-arrow icon.
2. WHEN the user has scrolled more than 300px from the top of the page, THE ScrollToTop_Button SHALL become visible.
3. WHILE the user is within the top 300px of the page, THE ScrollToTop_Button SHALL be hidden.
4. WHEN the user clicks the ScrollToTop_Button, THE Landing_Page SHALL scroll smoothly to the top.

---

### Requirement 10: Responsive Layout

**User Story:** As a visitor on a mobile device, I want the landing page to be usable and readable, so that I can access the platform from any device.

#### Acceptance Criteria

1. THE Landing_Page SHALL render all sections in a single-column layout on viewports narrower than 768px.
2. THE Navbar SHALL collapse navigation links into a mobile-friendly menu (hamburger or equivalent) on viewports narrower than 768px.
3. THE Leaderboard_Table SHALL be horizontally scrollable on viewports narrower than 768px to prevent content overflow.
