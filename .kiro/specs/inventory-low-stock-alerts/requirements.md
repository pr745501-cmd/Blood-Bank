# Requirements Document

## Introduction

The Inventory Low-Stock Alerts feature extends BloodConnect's blood bank management system to proactively notify administrators when any blood group's inventory falls below a configurable threshold. Currently, the system recalculates a status field ("Critical" / "Low" / "Adequate") on every stock change but does not send targeted in-app notifications, does not surface a visual warning badge on the inventory page, and does not show a summary banner on the admin dashboard. This feature closes those gaps while ensuring duplicate alerts are suppressed — admins are notified once per low-stock event, not on every inventory check.

## Glossary

- **Alert_Service**: The backend service responsible for evaluating inventory thresholds and emitting low-stock notifications.
- **Threshold_Config**: A per-blood-group configurable minimum unit count below which a low-stock alert is triggered. Defaults to 10 units.
- **Low_Stock_Event**: The transition of a blood group's total unit count from at-or-above the threshold to below the threshold.
- **In_App_Notification**: A real-time notification delivered via Socket.IO and stored in the frontend NotificationContext, visible to all authenticated admin users.
- **Low_Stock_Badge**: A visual indicator (warning icon + unit count) rendered on the blood group card in the AdminBloodInventory page when that blood group is below its threshold.
- **Critical_Banner**: A summary banner displayed at the top of the AdminDashboard page listing all blood groups currently below their threshold.
- **BloodInventory**: The existing MongoDB model tracking units per blood group (wholeBlood, plasma, platelets, rbc).
- **Threshold_Model**: A new MongoDB model storing the configured threshold value per blood group.
- **Admin_User**: A user with `role: "admin"` in the User model.

---

## Requirements

### Requirement 1: Threshold Configuration

**User Story:** As an admin, I want to configure a minimum stock threshold per blood group, so that I can define what "low stock" means for each blood type in my blood bank.

#### Acceptance Criteria

1. THE Threshold_Config SHALL default to 10 units for every blood group when no explicit configuration has been saved.
2. WHEN an admin submits a threshold update for a blood group with a non-negative integer value, THE Alert_Service SHALL persist the new threshold to the Threshold_Model.
3. IF an admin submits a threshold value that is not a non-negative integer, THEN THE Alert_Service SHALL return a 400 error with a descriptive validation message.
4. WHEN an admin requests the current threshold configuration, THE Alert_Service SHALL return the threshold value for each of the 8 standard blood groups (A+, A-, B+, B-, O+, O-, AB+, AB-).
5. THE Threshold_Config SHALL be independent per blood group, allowing different thresholds for each blood type.

---

### Requirement 2: Low-Stock Detection

**User Story:** As an admin, I want the system to automatically detect when a blood group's inventory drops below the configured threshold, so that I am alerted without having to manually monitor stock levels.

#### Acceptance Criteria

1. WHEN a stock-modifying operation (add or dispense) completes, THE Alert_Service SHALL compute the total units for the affected blood group as the sum of wholeBlood, plasma, platelets, and rbc fields.
2. WHEN the computed total units for a blood group is less than that blood group's Threshold_Config, THE Alert_Service SHALL classify that blood group as low-stock.
3. WHILE a blood group's total units remain below its Threshold_Config, THE Alert_Service SHALL NOT generate a new low-stock notification for that blood group.
4. WHEN a blood group's total units rise to at-or-above its Threshold_Config after previously being below it, THE Alert_Service SHALL reset the low-stock state for that blood group, enabling a future low-stock notification if the units drop below the threshold again.
5. THE Alert_Service SHALL evaluate the threshold condition only after a stock-modifying operation completes, not on a polling schedule.

---

### Requirement 3: In-App Notification Delivery

**User Story:** As an admin, I want to receive an in-app notification when any blood group goes low, so that I can take immediate action without leaving the application.

#### Acceptance Criteria

1. WHEN a Low_Stock_Event is detected, THE Alert_Service SHALL emit a `lowStockAlert` Socket.IO event to all connected clients.
2. THE `lowStockAlert` event payload SHALL include: bloodGroup (string), currentUnits (number), threshold (number), and timestamp (ISO 8601 string).
3. WHEN the frontend NotificationContext receives a `lowStockAlert` event, THE NotificationContext SHALL add a new In_App_Notification with type `"low_stock"`, a descriptive title, and a body referencing the blood group and current unit count.
4. THE In_App_Notification SHALL include a link navigating the admin to the AdminBloodInventory page.
5. WHEN a `lowStockAlert` event is received and the browser Notification API permission is granted, THE NotificationContext SHALL display a browser push notification with the blood group and unit count.
6. THE Alert_Service SHALL emit the `lowStockAlert` event only once per Low_Stock_Event, not on every subsequent inventory check while stock remains low.

---

### Requirement 4: Visual Warning Badge on AdminBloodInventory

**User Story:** As an admin, I want to see a visual warning badge on each low-stock blood group card in the inventory page, so that I can identify at-risk blood groups at a glance.

#### Acceptance Criteria

1. WHEN the AdminBloodInventory page renders a blood group whose total units are below its Threshold_Config, THE AdminBloodInventory SHALL display a Low_Stock_Badge on that blood group's card.
2. THE Low_Stock_Badge SHALL include a warning icon and the current total unit count.
3. WHEN a blood group's total units are at-or-above its Threshold_Config, THE AdminBloodInventory SHALL NOT display a Low_Stock_Badge for that blood group.
4. THE AdminBloodInventory SHALL fetch the current Threshold_Config values from the backend on page load to determine which blood groups are low-stock.
5. WHEN inventory data is refreshed on the AdminBloodInventory page, THE AdminBloodInventory SHALL re-evaluate and update Low_Stock_Badge visibility based on the latest unit counts and thresholds.

---

### Requirement 5: Critical Summary Banner on AdminDashboard

**User Story:** As an admin, I want to see a summary banner on the AdminDashboard when any blood group is critically low, so that I am immediately aware of urgent stock issues when I open the dashboard.

#### Acceptance Criteria

1. WHEN the AdminDashboard loads and one or more blood groups have total units below their Threshold_Config, THE AdminDashboard SHALL display a Critical_Banner listing the affected blood groups.
2. THE Critical_Banner SHALL display the blood group name and current unit count for each low-stock blood group.
3. WHEN no blood groups are below their Threshold_Config, THE AdminDashboard SHALL NOT display the Critical_Banner.
4. THE AdminDashboard SHALL fetch current inventory and threshold data on page load to determine Critical_Banner visibility.
5. THE Critical_Banner SHALL include a navigation link to the AdminBloodInventory page.

---

### Requirement 6: Duplicate Alert Suppression

**User Story:** As an admin, I want to receive only one alert per low-stock event rather than repeated alerts on every inventory check, so that I am not overwhelmed by redundant notifications.

#### Acceptance Criteria

1. THE Alert_Service SHALL maintain a per-blood-group `alertedAt` timestamp in the Threshold_Model, recording when the most recent low-stock notification was sent.
2. WHEN a stock-modifying operation results in a blood group being below its threshold AND an `alertedAt` timestamp already exists for that blood group from the current low-stock period, THE Alert_Service SHALL NOT emit a new `lowStockAlert` event.
3. WHEN a blood group's total units rise to at-or-above its Threshold_Config, THE Alert_Service SHALL clear the `alertedAt` timestamp for that blood group.
4. FOR ALL sequences of stock-modifying operations that keep a blood group continuously below its threshold, THE Alert_Service SHALL emit exactly one `lowStockAlert` event per continuous low-stock period.
