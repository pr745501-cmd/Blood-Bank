# Bugfix Requirements Document

## Introduction

The hospital system is an unwanted feature that needs to be completely removed from the project. This includes all hospital-specific UI components, routes, server-side routes, models, and middleware logic. The removal must be clean — no dead imports, no orphaned routes, and no broken references — while leaving all non-hospital functionality (admin, donor, user, camps, alerts, etc.) fully intact.

## Bug Analysis

### Current Behavior (Defect)

1.1 WHEN the application is running THEN the system exposes hospital registration, login, and dashboard routes (`/hospital/*`) that are no longer desired

1.2 WHEN `App.jsx` is loaded THEN the system imports and registers 10 hospital page components (`HospitalLayout`, `HospitalDashboard`, `HospitalInventory`, `HospitalRequests`, `HospitalAlerts`, `HospitalDonors`, `HospitalProfile`, `HospitalRegister`, `HospitalAppointments`, `HospitalMarketplace`) that should not exist

1.3 WHEN `ProtectedRoute` is evaluated THEN the system contains a `hospitalOnly` prop and role check for `"hospital"` that should not exist

1.4 WHEN the server starts THEN the system registers `/api/hospital` routes backed by `hospitalRoutes.js` that should not be served

1.5 WHEN the server starts THEN the system loads `Hospital.js`, `Patient.js`, `DonorAppointment.js`, and `BloodMarketplace.js` models that are exclusively used by the hospital system

1.6 WHEN `authMiddleware.js` is loaded THEN the system exports an `isHospital` middleware function that should not exist

1.7 WHEN the client `src/hospital/` directory exists THEN the system contains 11 hospital-specific component files that should not be present in the codebase

### Expected Behavior (Correct)

2.1 WHEN the application is running THEN the system SHALL NOT expose any `/hospital/*` routes, and navigating to them SHALL redirect to the home page

2.2 WHEN `App.jsx` is loaded THEN the system SHALL NOT import or reference any hospital page components, and the file SHALL compile without errors

2.3 WHEN `ProtectedRoute` is evaluated THEN the system SHALL NOT contain `hospitalOnly` prop or any `"hospital"` role check

2.4 WHEN the server starts THEN the system SHALL NOT register `/api/hospital` routes, and requests to those endpoints SHALL return 404

2.5 WHEN the server starts THEN the system SHALL NOT import or reference `Hospital.js`, `Patient.js`, `DonorAppointment.js`, or `BloodMarketplace.js` models

2.6 WHEN `authMiddleware.js` is loaded THEN the system SHALL NOT export `isHospital`, and the file SHALL compile without errors

2.7 WHEN the `client/src/hospital/` directory is checked THEN the system SHALL have no such directory or files

### Unchanged Behavior (Regression Prevention)

3.1 WHEN a user navigates to admin routes (`/admin/*`) THEN the system SHALL CONTINUE TO serve all admin pages correctly

3.2 WHEN a user navigates to donor/user routes (`/dashboard`, `/donor`, `/request`, `/alerts`, etc.) THEN the system SHALL CONTINUE TO serve all user pages correctly

3.3 WHEN the server handles `/api/auth`, `/api/donor`, `/api/request`, `/api/admin`, `/api/blood`, `/api/camps`, `/api/donations`, and other non-hospital routes THEN the system SHALL CONTINUE TO respond correctly

3.4 WHEN `authMiddleware.js` is used THEN the system SHALL CONTINUE TO export `verifyToken` and `isAdmin` without any change in behavior

3.5 WHEN `ProtectedRoute` is used with `adminOnly` prop THEN the system SHALL CONTINUE TO enforce admin-only access correctly

3.6 WHEN the `Alert` model is used by admin or blood controller routes THEN the system SHALL CONTINUE TO function correctly, as the `hospital` field on alerts is a plain string (not a reference) and is unaffected

3.7 WHEN the `BloodRequest` model is used THEN the system SHALL CONTINUE TO function correctly, as its `hospital` field is a plain string unrelated to the `Hospital` model
