# Requirements Document

## Introduction

The Smart Donor Matching feature for BloodConnect automatically identifies eligible blood donors when a blood request is created, and notifies them via in-app notifications. Compatibility is determined by standard blood group compatibility rules. Only donors in the same city as the request, who are available, and who have not donated within the last 90 days are considered. The user who created the request is excluded from matching. Admins can also manually trigger matching for any existing request.

## Glossary

- **Matching_Engine**: The server-side service responsible for finding compatible donors for a given blood request.
- **BloodRequest**: A record in the system representing a patient's need for a specific blood group, created by a logged-in user.
- **Donor**: A registered donor record in the system with fields including `bloodGroup`, `city`, `availability`, `lastDonationDate`, and a reference to a `User`.
- **Compatible_Blood_Group**: A blood group that can safely donate to the requested blood group, per standard transfusion compatibility rules (e.g., O- can donate to all groups; AB+ can receive from all groups).
- **Eligible_Donor**: A Donor who is available (`availability: true`), has not donated within the last 90 days (or has never donated), and is not the user who created the request.
- **In_App_Notification**: A notification delivered to a logged-in user's session via the existing `NotificationContext` and Socket.IO infrastructure.
- **Notification_Record**: A persisted document storing the notification details, target donor user, associated request, and read status.
- **Admin**: A user with `role: "admin"` in the system.
- **Requester**: The authenticated user (`req.user`) who created the BloodRequest.

---

## Requirements

### Requirement 1: Automatic Donor Matching on Request Creation

**User Story:** As a user who submits a blood request, I want the system to automatically find compatible donors in my city, so that eligible donors are notified immediately without manual intervention.

#### Acceptance Criteria

1. WHEN a BloodRequest is successfully created, THE Matching_Engine SHALL query all Donor records where the city matches the request's city (case-insensitive).
2. WHEN the Matching_Engine queries donors, THE Matching_Engine SHALL include only donors whose `bloodGroup` is compatible with the requested blood group according to standard transfusion compatibility rules.
3. WHEN the Matching_Engine filters donors, THE Matching_Engine SHALL exclude any Donor whose `availability` field is `false`.
4. WHEN the Matching_Engine filters donors, THE Matching_Engine SHALL exclude any Donor whose `lastDonationDate` is within 90 days of the current date.
5. WHEN the Matching_Engine filters donors, THE Matching_Engine SHALL exclude the Donor record whose `user` field matches the Requester's user ID.
6. WHEN the Matching_Engine produces a non-empty list of Eligible_Donors, THE Matching_Engine SHALL create one Notification_Record per Eligible_Donor referencing the BloodRequest.
7. WHEN a Notification_Record is created, THE Matching_Engine SHALL emit a Socket.IO event to the target donor's connected session so the In_App_Notification appears in real time.
8. IF no Eligible_Donors are found for a BloodRequest, THEN THE Matching_Engine SHALL complete without error and return a result indicating zero donors were matched.

---

### Requirement 2: Blood Group Compatibility Rules

**User Story:** As a system, I want to apply correct blood group compatibility rules during matching, so that donors are only notified when their blood can actually be used for the patient.

#### Acceptance Criteria

1. THE Matching_Engine SHALL use the following donor-to-recipient compatibility map:
   - `O-` can donate to: `O-`, `O+`, `A-`, `A+`, `B-`, `B+`, `AB-`, `AB+`
   - `O+` can donate to: `O+`, `A+`, `B+`, `AB+`
   - `A-` can donate to: `A-`, `A+`, `AB-`, `AB+`
   - `A+` can donate to: `A+`, `AB+`
   - `B-` can donate to: `B-`, `B+`, `AB-`, `AB+`
   - `B+` can donate to: `B+`, `AB+`
   - `AB-` can donate to: `AB-`, `AB+`
   - `AB+` can donate to: `AB+`
2. WHEN a requested blood group is provided, THE Matching_Engine SHALL derive the set of compatible donor blood groups from the map in criterion 1 and use that set as the filter.
3. IF a blood group value not present in the compatibility map is provided to the Matching_Engine, THEN THE Matching_Engine SHALL return an error indicating the blood group is invalid.

---

### Requirement 3: Notification Persistence and Delivery

**User Story:** As an eligible donor, I want to receive an in-app notification when a blood request matches my profile, so that I can respond promptly.

#### Acceptance Criteria

1. THE Matching_Engine SHALL persist each Notification_Record to the database with the following fields: target donor user ID, associated BloodRequest ID, notification type (`"donorMatch"`), message text, and read status (default `false`).
2. WHEN a donor's Socket.IO session is active at the time of matching, THE Matching_Engine SHALL emit a `donorMatchNotification` event containing the blood group, hospital name, city, urgency level, and request ID.
3. WHEN a donor is not connected via Socket.IO at the time of matching, THE Matching_Engine SHALL store the Notification_Record so it is retrievable when the donor next loads the application.
4. THE Notification_Service SHALL expose a GET endpoint that returns all Notification_Records for the authenticated user, ordered by creation date descending.
5. WHEN a donor marks a notification as read, THE Notification_Service SHALL update the Notification_Record's read status to `true`.
6. THE Notification_Service SHALL expose a GET endpoint that returns the count of unread Notification_Records for the authenticated user.

---

### Requirement 4: Admin Manual Trigger

**User Story:** As an admin, I want to manually trigger donor matching for any existing blood request, so that I can re-run matching after donor data changes or for requests that were created before this feature existed.

#### Acceptance Criteria

1. THE Matching_Engine SHALL expose a POST endpoint accessible only to users with `role: "admin"` that accepts a BloodRequest ID and triggers the matching process for that request.
2. WHEN the admin triggers matching for a BloodRequest, THE Matching_Engine SHALL apply the same eligibility filters defined in Requirement 1 (city, blood group compatibility, availability, 90-day rule, self-exclusion).
3. WHEN the admin triggers matching for a BloodRequest, THE Matching_Engine SHALL avoid creating duplicate Notification_Records for donors who were already notified for the same request.
4. IF the BloodRequest ID provided to the admin endpoint does not exist, THEN THE Matching_Engine SHALL return a 404 error with a descriptive message.
5. WHEN matching completes via the admin trigger, THE Matching_Engine SHALL return the count of newly notified donors in the response.

---

### Requirement 5: Self-Exclusion of Requester

**User Story:** As a user who submits a blood request, I want to ensure I am never matched as a donor for my own request, so that the system does not send me irrelevant notifications.

#### Acceptance Criteria

1. WHEN the Matching_Engine evaluates donors for a BloodRequest, THE Matching_Engine SHALL retrieve the `user` field of the BloodRequest and exclude any Donor whose `user` field equals that value.
2. WHEN a Donor record has no linked `user` (admin-created donor), THE Matching_Engine SHALL include that Donor in eligibility evaluation based on all other criteria.
3. THE Matching_Engine SHALL apply self-exclusion before creating any Notification_Records, ensuring the Requester receives zero `donorMatch` notifications for their own request.

---

### Requirement 6: Frontend Notification Display

**User Story:** As a donor, I want to see donor match notifications in the existing notification panel, so that I have a single place to view all my alerts.

#### Acceptance Criteria

1. WHEN the frontend receives a `donorMatchNotification` Socket.IO event, THE NotificationContext SHALL add a new notification entry with type `"donorMatch"`, a title indicating a blood request match, and a body containing the blood group, hospital, and city.
2. THE NotificationContext SHALL include a link in the donor match notification entry that navigates the donor to a page where they can view active blood requests.
3. WHEN the application loads and the user is authenticated, THE NotificationContext SHALL fetch persisted unread Notification_Records from the server and merge them with locally stored notifications, avoiding duplicates by notification ID.
4. WHERE the browser supports the Notifications API and the user has granted permission, THE NotificationContext SHALL display a browser push notification for each received `donorMatchNotification` event.
