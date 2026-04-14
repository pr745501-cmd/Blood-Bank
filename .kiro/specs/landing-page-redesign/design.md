# Design Document: Landing Page Redesign (Blood Buddy)

## Overview

This design replaces the existing `client/src/pages/Home.jsx` and all files in `client/src/components/homepage/` with a faithful React + Tailwind CSS recreation of the [Blood Buddy](https://github.com/2024-SANDHYA/Blood-Buddy) landing page design.

The result is a single-page marketing experience with seven ordered sections: Hero, About, Volunteers, Testimonials, Donate, Contact, and Footer. It is built entirely with React (JSX) and Tailwind CSS utility classes, uses React Router for navigation, and relies on Google Fonts loaded via `@import` in `index.css`. A floating scroll-to-top button and smooth scroll behavior are included.

### Key Design Decisions

- **No new CSS files**: All styling is done with Tailwind utility classes. The existing `index.css` already has `scroll-behavior: smooth` and the font imports will be added there.
- **Component-per-section architecture**: Each section maps 1:1 to a file in `client/src/components/homepage/`. `Home.jsx` composes them in order.
- **Inline scroll targets**: Navbar links use `href="#section-id"` anchors; React Router `<Link>` is used only for `/register` navigation.
- **Static donor data**: The Volunteers leaderboard uses hardcoded data matching the original Blood Buddy HTML exactly.
- **Font Awesome via CDN**: Icons in the original design use Font Awesome 5. We use the CDN `<link>` in `index.html` to avoid an npm dependency, and reference class names directly in JSX.
- **Video source**: The hero video is served from `/video/homevideo1.mp4` (already present at `client/public/video/homevideo1.mp4`).

---

## Architecture

The landing page is a pure client-side React SPA route. No new API endpoints are required beyond the existing `/contact` POST endpoint used by the Contact form.

```
client/src/pages/Home.jsx          ← root route component, composes all sections
client/src/components/homepage/
  Navbar.jsx                       ← fixed overlay nav inside Hero
  Hero.jsx                         ← fullscreen video hero
  Features.jsx                     ← "What is this all about?" 6-card grid (About section)
  Volunteers.jsx  (was WhyChooseUs) ← salmon leaderboard
  Testimonials.jsx                 ← dark parallax review cards
  Process.jsx                      ← dotted-bg numbered steps (Donate section)
  Contact.jsx                      ← split illustration + form
  Footer.jsx                       ← dark footer with social icons
client/index.html                  ← Font Awesome CDN link added here
client/src/index.css               ← Google Fonts @import added here
```

### Data Flow

```
Home.jsx
  ├── Navbar (no props — reads scroll position internally)
  ├── Hero (no props)
  ├── Features (no props — static card data)
  ├── Volunteers (no props — static donor data)
  ├── Testimonials (no props — static review data)
  ├── Process (no props — static step data)
  ├── Contact (no props — manages own form state, calls /contact API)
  └── Footer (no props)

ScrollToTopButton (rendered in Home.jsx, reads window.scrollY)
```

---

## Components and Interfaces

### `Home.jsx`

Composes all section components in order. Also renders the `ScrollToTopButton`. No props.

```jsx
const Home = () => (
  <>
    <Hero />        {/* includes Navbar internally */}
    <Features />
    <Volunteers />
    <Testimonials />
    <Process />
    <Contact />
    <Footer />
    <ScrollToTopButton />
  </>
);
```

### `Navbar` (inside `Hero.jsx` or as a sub-component)

Positioned absolutely within the Hero section overlay. Props: none.

| Element | Detail |
|---|---|
| Logo | Left-aligned, links to `#home` |
| Nav links | Right-aligned: About Us → `#about`, Volunteer → `#volunteers`, Donate → `#donate`, Get Help → `#contact` |
| Mobile | Hamburger icon (Font Awesome `fa-bars`), slide-in panel from right with salmon (`#fa8072`) background |
| Font | Fredoka One for nav link text |

### `Hero.jsx`

| Element | Detail |
|---|---|
| Container | `section#home`, `h-screen`, `relative`, `overflow-hidden` |
| Video | `<video autoPlay loop muted playsInline>`, `src="/video/homevideo1.mp4"`, `object-cover w-full h-full absolute inset-0` |
| Overlay | `absolute inset-0 bg-black/40` |
| Headline | "Start Saving Lives", Neuton font, large white text |
| Subtitle | "Become a donor or request for blood And help save lives" |
| CTA button | "Register", `<Link to="/register">`, border style matching Blood Buddy (`border-2 border-black hover:bg-[#cd5c5c]`), Patrick Hand SC font |
| Navbar | Rendered inside Hero as an absolutely-positioned overlay element |

### `Features.jsx` (About section)

| Element | Detail |
|---|---|
| Section id | `about` |
| Heading | "What is this all about?" — Alegreya Sans SC font |
| Grid | `grid grid-cols-1 md:grid-cols-3 gap-6` (3×2 on desktop) |
| Cards | 6 cards: What we do, Innovative, Network, Get notified, Totally Free, Save Life |
| Card content | Icon image (emoji or SVG), `<h3>` title (Alegreya Sans SC), `<p>` description (NTR font) |
| Hover | `hover:scale-105 transition-transform` |

Feature card data:

| # | Title | Icon | Description |
|---|---|---|---|
| 1 | What we do? | 🩸 | Connect blood donors with recipients without intermediary |
| 2 | Innovative | 💡 | Innovative approach to address global health with immediate access |
| 3 | Network | 🌐 | Community organizations working together as a network |
| 4 | Get notified | 🔔 | Automated SMS service and mobile app notifications |
| 5 | Totally Free | 💰 | Easy-to-use, fast, efficient, and reliable — free of cost |
| 6 | Save Life | ❤️ | Non-profit foundation protecting vulnerable persons |

### `Volunteers.jsx`

| Element | Detail |
|---|---|
| Section id | `volunteers` |
| Background | `bg-[#f08080]` (salmon) |
| Heading | "Our Super Heroes" — Alegreya Sans SC font |
| Description | Paragraph about volunteer workforce |
| Table | `<ul>` of 10 `<li>` rows, each with rank, name, location, blood type |
| Top 3 rows | Higher `bg-white/60`, `bg-white/40`, `bg-white/20` opacity |
| Rows 4–10 | `bg-white/10` |
| Hover | `hover:scale-105 hover:bg-pink-200 transition-transform` |
| Mobile | Wrapper has `overflow-x-auto` |

Donor data (exact from Blood Buddy source):

| Rank | Name | Location | Blood Type |
|---|---|---|---|
| 1 | Garvit | Delhi, India | O+ |
| 2 | Mehere kaur | Ghaziabad, Uttar Pradesh | B+ |
| 3 | Kenny | Kerala, India | AB+ |
| 4 | Sarah | Tamil Nadu, India | A+ |
| 5 | Kenneth | Ayodhya, Uttar Pradesh | O+ |
| 6 | Ritika | Ramnagar, Uttarakhand | O+ |
| 7 | Krish Maurya | Surat, Gujarat | O- |
| 8 | Tushkar | Bengaluru, Karnataka | AB+ |
| 9 | Nitin | Lucknow | AB- |
| 10 | Riya | Delhi, India | B+ |

### `Testimonials.jsx`

| Element | Detail |
|---|---|
| Section id | `testimonials` |
| Background | Dark overlay on background image: `bg-[linear-gradient(rgba(0,0,0,0.8),rgba(0,0,0,0.8))]`, `bg-fixed bg-cover bg-center` |
| Heading | "Testimonials — See what our users have to say" — Alegreya Sans SC |
| Cards | 3 review cards in a row (`grid grid-cols-1 md:grid-cols-3`) |
| Card content | Quote text (italic), avatar `<img>` or circular placeholder, donor name |
| Quote mark | Large decorative `"` character before quote text |

Review data (exact from Blood Buddy source):

| Name | Quote |
|---|---|
| Esha Puri | "Blood Buddy is just awesome! I just donated for the first time and it could not have been easier..." |
| Amit Mangal | "I found Blood Buddy at a time that my mother was in urgent need of blood..." |
| Dr. Kabir Khatri | "I have been a part of this organization for quite some time and each time I'm amazed..." |

### `Process.jsx` (Donate section)

| Element | Detail |
|---|---|
| Section id | `donate` |
| Background | Dotted pattern via CSS: `bg-[radial-gradient(#ccc_1px,transparent_1px)] bg-[size:20px_20px]` |
| Heading | "How to Donate?" or similar |
| Steps | 6 numbered items in a list |
| Step content | Number badge, emoji, title text |
| CTA | "Register" `<Link to="/register">` button, salmon hover color |

Step data:

| # | Emoji | Title |
|---|---|---|
| 1 | 📝 | Register |
| 2 | 🩸 | Post a Blood Request |
| 3 | 🤝 | Respond |
| 4 | 🔔 | Get Notified |
| 5 | 🆓 | Forever Free |
| 6 | ❤️ | Save a Life |

### `Contact.jsx`

| Element | Detail |
|---|---|
| Section id | `contact` |
| Layout | `grid grid-cols-1 md:grid-cols-2 gap-8` |
| Left | Illustration image (SVG or placeholder) |
| Right | Contact form |
| Form fields | Email (`type="email"`), Phone (`type="tel"`), Message (`<textarea>`) |
| Submit | "Send" button, salmon accent |
| Validation | HTML5 `required` + React state validation; error messages per empty field |
| Success | Confirmation message replaces form on successful submit |
| API | `POST /contact` via existing `API` service |

### `Footer.jsx`

| Element | Detail |
|---|---|
| Section id | `footer` |
| Background | `bg-[#111]` |
| Heading | "JOIN OUR CAUSE" — Raleway font |
| Description | Mission paragraph |
| Social icons | Font Awesome: `fab fa-facebook`, `fab fa-instagram`, `fas fa-globe` |
| Social links | Facebook → `https://www.facebook.com/givebloodnhs/`, Instagram → `https://www.instagram.com/indiablooddonation/`, Globe → `http://nbtc.naco.gov.in/` |
| Copyright | "2021 © All rights reserved." |

### `ScrollToTopButton`

Rendered in `Home.jsx`. Manages its own visibility state via `window.scroll` event listener.

| Element | Detail |
|---|---|
| Position | `fixed bottom-5 right-8 z-50` |
| Visibility | Hidden when `scrollY <= 300`, visible when `scrollY > 300` |
| Style | `bg-red-500 text-white rounded-full p-4`, Font Awesome `fa fa-arrow-up` icon |
| Click | `window.scrollTo({ top: 0, behavior: 'smooth' })` |

---

## Data Models

All data in this feature is static (no API reads for display data). The only runtime data interaction is the contact form POST.

### Feature Card

```ts
interface FeatureCard {
  emoji: string;      // Unicode emoji used as icon
  title: string;      // Card heading
  description: string; // Card body text
}
```

### Donor (Leaderboard row)

```ts
interface Donor {
  rank: number;       // 1–10
  name: string;
  location: string;
  bloodType: string;  // e.g. "O+", "AB-"
}
```

### Testimonial

```ts
interface Testimonial {
  quote: string;
  avatarSrc: string;  // image path or placeholder
  name: string;
}
```

### Step

```ts
interface Step {
  number: number;     // 1–6
  emoji: string;
  title: string;
}
```

### Contact Form State

```ts
interface ContactFormState {
  email: string;
  phone: string;
  message: string;
}

interface ContactFormErrors {
  email?: string;
  phone?: string;
  message?: string;
}
```

---

## Correctness Properties

*A property is a characteristic or behavior that should hold true across all valid executions of a system — essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.*

This feature is primarily a UI rendering and layout feature. Most acceptance criteria are specific structural/content checks (EXAMPLE or SMOKE) rather than universal properties across a wide input space. However, several criteria describe invariants that must hold across all items in a collection (all 6 feature cards, all 10 donor rows, all 3 review cards, all 6 steps), and the contact form validation has a universal property across all combinations of empty fields.

**PBT applicability assessment**: The feature involves React component rendering with static data and a contact form. The collection-completeness criteria (cards, rows, steps) and the form validation criterion are suitable for property-based testing because they describe invariants that must hold for every element in a set, and input variation (which fields are empty, which card index) reveals correctness issues. Pure UI layout criteria are not suitable for PBT.

### Property 1: Every feature card contains all required elements

*For any* feature card rendered in the About section, it SHALL contain a non-empty icon element, a non-empty title string, and a non-empty description string.

**Validates: Requirements 3.3**

### Property 2: Every leaderboard row contains all required data fields

*For any* donor row rendered in the Volunteers leaderboard, it SHALL display a rank number, a non-empty donor name, a non-empty location string, and a non-empty blood type string.

**Validates: Requirements 4.3**

### Property 3: Every review card contains all required elements

*For any* review card rendered in the Testimonials section, it SHALL contain a non-empty quote text, an avatar image or placeholder element, and a non-empty donor name.

**Validates: Requirements 5.2**

### Property 4: Every step item contains all required elements

*For any* step item rendered in the Donate section, it SHALL contain a step number, a non-empty title from the expected step list, and an emoji character.

**Validates: Requirements 6.2**

### Property 5: Contact form validation covers all empty field combinations

*For any* non-empty subset of required contact form fields (email, phone, message) that are left empty on submission, the form SHALL display a validation error message for each and every empty field in that subset.

**Validates: Requirements 7.4**

### Property 6: Scroll-to-top button visibility follows the 300px threshold

*For any* scroll position value, the ScrollToTop button SHALL be visible if and only if the scroll position is strictly greater than 300px.

**Validates: Requirements 9.2, 9.3**

---

## Error Handling

### Contact Form

- **Empty field submission**: Client-side validation runs before API call. Each empty required field gets an inline error message. The API is not called until all fields are valid.
- **API failure**: If `POST /contact` fails, the form displays a generic error message ("Something went wrong. Please try again.") and does not clear the form fields.
- **API success**: Form is replaced with a confirmation message.

### Video Background

- If the video file is missing or fails to load, the `<video>` element falls back gracefully — the dark overlay and text remain visible against whatever background the browser renders.

### Scroll Event Listener

- The `useEffect` in `ScrollToTopButton` cleans up the event listener on unmount to prevent memory leaks.

---

## Testing Strategy

### Unit Tests (Example-Based)

Focus on specific structural and content checks:

- **Hero**: Renders with `h-screen`, video has correct `src` and attributes, headline text present, Register button links to `/register`.
- **Navbar**: Logo present, all 4 nav links present with correct `href` targets, hamburger button visible on mobile, clicking hamburger toggles menu.
- **Features (About)**: Section has `id="about"`, exactly 6 cards rendered, heading text correct.
- **Volunteers**: Section has `id="volunteers"`, salmon background class present, exactly 10 rows rendered.
- **Testimonials**: Section has `id="testimonials"`, exactly 3 review cards rendered.
- **Process (Donate)**: Section has `id="donate"`, exactly 6 steps rendered, Register button links to `/register`.
- **Contact**: Section has `id="contact"`, all form fields present (email, phone, message, send button), successful submit shows confirmation.
- **Footer**: Section has `id="footer"`, "JOIN OUR CAUSE" heading present, 3 social links present, copyright text present.
- **ScrollToTopButton**: Hidden at scroll 0, visible at scroll 301, clicking calls `window.scrollTo`.

### Property-Based Tests

Using [fast-check](https://github.com/dubzzz/fast-check) (JavaScript PBT library). Each test runs a minimum of 100 iterations.

**Property 1 — Feature card completeness**
```
// Feature: landing-page-redesign, Property 1: Every feature card contains all required elements
fc.assert(fc.property(fc.integer({ min: 0, max: 5 }), (index) => {
  const card = FEATURE_CARDS[index];
  return card.emoji.length > 0 && card.title.length > 0 && card.description.length > 0;
}), { numRuns: 100 });
```

**Property 2 — Leaderboard row completeness**
```
// Feature: landing-page-redesign, Property 2: Every leaderboard row contains all required data fields
fc.assert(fc.property(fc.integer({ min: 0, max: 9 }), (index) => {
  const donor = DONORS[index];
  return donor.rank > 0 && donor.name.length > 0 && donor.location.length > 0 && donor.bloodType.length > 0;
}), { numRuns: 100 });
```

**Property 3 — Review card completeness**
```
// Feature: landing-page-redesign, Property 3: Every review card contains all required elements
fc.assert(fc.property(fc.integer({ min: 0, max: 2 }), (index) => {
  const review = TESTIMONIALS[index];
  return review.quote.length > 0 && review.name.length > 0;
}), { numRuns: 100 });
```

**Property 4 — Step item completeness**
```
// Feature: landing-page-redesign, Property 4: Every step item contains all required elements
fc.assert(fc.property(fc.integer({ min: 0, max: 5 }), (index) => {
  const step = STEPS[index];
  return step.number > 0 && step.title.length > 0 && step.emoji.length > 0;
}), { numRuns: 100 });
```

**Property 5 — Contact form validation**
```
// Feature: landing-page-redesign, Property 5: Contact form validation covers all empty field combinations
fc.assert(fc.property(
  fc.subarray(['email', 'phone', 'message'], { minLength: 1 }),
  (emptyFields) => {
    const formData = {
      email: emptyFields.includes('email') ? '' : 'test@example.com',
      phone: emptyFields.includes('phone') ? '' : '1234567890',
      message: emptyFields.includes('message') ? '' : 'Hello',
    };
    const errors = validateContactForm(formData);
    return emptyFields.every(field => errors[field] && errors[field].length > 0);
  }
), { numRuns: 100 });
```

**Property 6 — Scroll-to-top visibility threshold**
```
// Feature: landing-page-redesign, Property 6: Scroll-to-top button visibility follows the 300px threshold
fc.assert(fc.property(fc.integer({ min: 0, max: 10000 }), (scrollY) => {
  const visible = isScrollToTopVisible(scrollY);
  return visible === (scrollY > 300);
}), { numRuns: 100 });
```

### Integration Tests

- Contact form POST to `/contact` endpoint with valid data returns success response.
- Contact form POST to `/contact` endpoint with network error shows error state.

### Smoke Tests / Visual

- Google Fonts import strings present in `index.css`.
- `scroll-behavior: smooth` present in global CSS.
- Video element renders without console errors in browser.
- Parallax background-attachment: fixed applied to Testimonials section.
- Responsive layout at 375px viewport (single column, hamburger menu visible, table scrollable).
