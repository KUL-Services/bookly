# Bookly Staff Management - Database Schema

**Version:** 1.0  
**Date:** December 2025  
**Database Type:** PostgreSQL (recommended) or MySQL

---

## Table of Contents

1. [Entity Relationship Diagram](#entity-relationship-diagram)
2. [Core Tables](#core-tables)
3. [Staff Management Tables](#staff-management-tables)
4. [Scheduling Tables](#scheduling-tables)
5. [Resource Management Tables](#resource-management-tables)
6. [Commission Tables](#commission-tables)
7. [Indexes](#indexes)
8. [Constraints](#constraints)
9. [Sample Queries](#sample-queries)

---

## Entity Relationship Diagram

```
┌─────────────┐       ┌──────────────┐       ┌─────────────┐
│  businesses │──────<│   branches   │>──────│   staff     │
└─────────────┘       └──────────────┘       └─────────────┘
                              │                      │
                              │                      │
                              ▼                      ▼
                      ┌──────────────┐       ┌─────────────────────┐
                      │   services   │       │ staff_working_hours │
                      └──────────────┘       └─────────────────────┘
                              │                      │
                              │                      │
                              ▼                      ▼
                   ┌───────────────────┐    ┌──────────────────┐
                   │ staff_services    │    │ shift_overrides  │
                   └───────────────────┘    └──────────────────┘

┌─────────────┐       ┌──────────────┐       ┌─────────────┐
│   rooms     │──────<│ room_schedule│>──────│room_services│
└─────────────┘       └──────────────┘       └─────────────┘
      │
      ▼
┌──────────────────┐
│room_shift_overrides│
└──────────────────┘

┌─────────────────┐       ┌──────────────────┐
│ time_off_requests│      │ time_reservations│
└─────────────────┘       └──────────────────┘

┌─────────────────┐       ┌──────────────┐
│ commission_policies│     │  resources   │
└─────────────────┘       └──────────────┘
```

---

## Core Tables

### 1. businesses

```sql
CREATE TABLE businesses (
    id VARCHAR(36) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255),
    phone VARCHAR(20),
    timezone VARCHAR(50) DEFAULT 'UTC',
    scheduling_mode ENUM('dynamic', 'static') DEFAULT 'dynamic',
    currency VARCHAR(3) DEFAULT 'USD',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP NULL,

    INDEX idx_scheduling_mode (scheduling_mode),
    INDEX idx_deleted_at (deleted_at)
);
```

### 2. branches

```sql
CREATE TABLE branches (
    id VARCHAR(36) PRIMARY KEY,
    business_id VARCHAR(36) NOT NULL,
    name VARCHAR(255) NOT NULL,
    address TEXT,
    city VARCHAR(100),
    state VARCHAR(100),
    country VARCHAR(100),
    postal_code VARCHAR(20),
    phone VARCHAR(20),
    email VARCHAR(255),
    active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP NULL,

    FOREIGN KEY (business_id) REFERENCES businesses(id) ON DELETE CASCADE,
    INDEX idx_business_id (business_id),
    INDEX idx_active (active),
    INDEX idx_deleted_at (deleted_at)
);
```

### 3. business_hours

```sql
CREATE TABLE business_hours (
    id VARCHAR(36) PRIMARY KEY,
    business_id VARCHAR(36) NOT NULL,
    day_of_week ENUM('Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat') NOT NULL,
    is_open BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    FOREIGN KEY (business_id) REFERENCES businesses(id) ON DELETE CASCADE,
    UNIQUE KEY unique_business_day (business_id, day_of_week),
    INDEX idx_business_id (business_id)
);
```

### 4. business_hours_shifts

```sql
CREATE TABLE business_hours_shifts (
    id VARCHAR(36) PRIMARY KEY,
    business_hours_id VARCHAR(36) NOT NULL,
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    sort_order INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    FOREIGN KEY (business_hours_id) REFERENCES business_hours(id) ON DELETE CASCADE,
    INDEX idx_business_hours_id (business_hours_id),
    CHECK (end_time > start_time)
);
```

---

## Staff Management Tables

### 5. staff

```sql
CREATE TABLE staff (
    id VARCHAR(36) PRIMARY KEY,
    business_id VARCHAR(36) NOT NULL,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255),
    phone VARCHAR(20),
    role ENUM('owner', 'manager', 'staff') DEFAULT 'staff',
    title VARCHAR(255),
    photo_url TEXT,
    color VARCHAR(7),
    active BOOLEAN DEFAULT TRUE,
    type ENUM('dynamic', 'static') DEFAULT 'dynamic',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP NULL,

    FOREIGN KEY (business_id) REFERENCES businesses(id) ON DELETE CASCADE,
    INDEX idx_business_id (business_id),
    INDEX idx_email (email),
    INDEX idx_active (active),
    INDEX idx_type (type),
    INDEX idx_deleted_at (deleted_at)
);
```

### 6. staff_branches

```sql
CREATE TABLE staff_branches (
    id VARCHAR(36) PRIMARY KEY,
    staff_id VARCHAR(36) NOT NULL,
    branch_id VARCHAR(36) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (staff_id) REFERENCES staff(id) ON DELETE CASCADE,
    FOREIGN KEY (branch_id) REFERENCES branches(id) ON DELETE CASCADE,
    UNIQUE KEY unique_staff_branch (staff_id, branch_id),
    INDEX idx_staff_id (staff_id),
    INDEX idx_branch_id (branch_id)
);
```

### 7. staff_working_hours

```sql
CREATE TABLE staff_working_hours (
    id VARCHAR(36) PRIMARY KEY,
    staff_id VARCHAR(36) NOT NULL,
    day_of_week ENUM('Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat') NOT NULL,
    is_working BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    FOREIGN KEY (staff_id) REFERENCES staff(id) ON DELETE CASCADE,
    UNIQUE KEY unique_staff_day (staff_id, day_of_week),
    INDEX idx_staff_id (staff_id),
    INDEX idx_day_of_week (day_of_week)
);
```

### 8. staff_shifts

```sql
CREATE TABLE staff_shifts (
    id VARCHAR(36) PRIMARY KEY,
    staff_working_hours_id VARCHAR(36) NOT NULL,
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    sort_order INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    FOREIGN KEY (staff_working_hours_id) REFERENCES staff_working_hours(id) ON DELETE CASCADE,
    INDEX idx_staff_working_hours_id (staff_working_hours_id),
    CHECK (end_time > start_time)
);
```

### 9. staff_shift_breaks

```sql
CREATE TABLE staff_shift_breaks (
    id VARCHAR(36) PRIMARY KEY,
    staff_shift_id VARCHAR(36) NOT NULL,
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    FOREIGN KEY (staff_shift_id) REFERENCES staff_shifts(id) ON DELETE CASCADE,
    INDEX idx_staff_shift_id (staff_shift_id),
    CHECK (end_time > start_time)
);
```

### 10. staff_shift_overrides

```sql
CREATE TABLE staff_shift_overrides (
    id VARCHAR(36) PRIMARY KEY,
    staff_id VARCHAR(36) NOT NULL,
    date DATE NOT NULL,
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    reason ENUM('manual', 'business_hours_change', 'copy') DEFAULT 'manual',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    FOREIGN KEY (staff_id) REFERENCES staff(id) ON DELETE CASCADE,
    INDEX idx_staff_id (staff_id),
    INDEX idx_date (date),
    INDEX idx_staff_date (staff_id, date),
    CHECK (end_time > start_time)
);
```

### 11. staff_shift_override_breaks

```sql
CREATE TABLE staff_shift_override_breaks (
    id VARCHAR(36) PRIMARY KEY,
    staff_shift_override_id VARCHAR(36) NOT NULL,
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (staff_shift_override_id) REFERENCES staff_shift_overrides(id) ON DELETE CASCADE,
    INDEX idx_staff_shift_override_id (staff_shift_override_id),
    CHECK (end_time > start_time)
);
```

---

## Scheduling Tables

### 12. time_off_requests

```sql
CREATE TABLE time_off_requests (
    id VARCHAR(36) PRIMARY KEY,
    staff_id VARCHAR(36) NOT NULL,
    start_date DATETIME NOT NULL,
    end_date DATETIME NOT NULL,
    all_day BOOLEAN DEFAULT TRUE,
    reason ENUM('Personal', 'Sick', 'Vacation', 'Training', 'No-Show', 'Late', 'Other') NOT NULL,
    approved BOOLEAN DEFAULT FALSE,
    note TEXT,
    repeat_until DATE NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP NULL,

    FOREIGN KEY (staff_id) REFERENCES staff(id) ON DELETE CASCADE,
    INDEX idx_staff_id (staff_id),
    INDEX idx_start_date (start_date),
    INDEX idx_end_date (end_date),
    INDEX idx_approved (approved),
    INDEX idx_deleted_at (deleted_at),
    CHECK (end_date >= start_date)
);
```

### 13. time_reservations

```sql
CREATE TABLE time_reservations (
    id VARCHAR(36) PRIMARY KEY,
    staff_id VARCHAR(36) NOT NULL,
    start_datetime DATETIME NOT NULL,
    end_datetime DATETIME NOT NULL,
    reason VARCHAR(255) NOT NULL,
    note TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP NULL,

    FOREIGN KEY (staff_id) REFERENCES staff(id) ON DELETE CASCADE,
    INDEX idx_staff_id (staff_id),
    INDEX idx_start_datetime (start_datetime),
    INDEX idx_end_datetime (end_datetime),
    INDEX idx_deleted_at (deleted_at),
    CHECK (end_datetime > start_datetime)
);
```

---

## Resource Management Tables

### 14. resources

```sql
CREATE TABLE resources (
    id VARCHAR(36) PRIMARY KEY,
    business_id VARCHAR(36) NOT NULL,
    branch_id VARCHAR(36) NOT NULL,
    name VARCHAR(255) NOT NULL,
    capacity INT DEFAULT 1,
    floor VARCHAR(100),
    color VARCHAR(7),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP NULL,

    FOREIGN KEY (business_id) REFERENCES businesses(id) ON DELETE CASCADE,
    FOREIGN KEY (branch_id) REFERENCES branches(id) ON DELETE CASCADE,
    INDEX idx_business_id (business_id),
    INDEX idx_branch_id (branch_id),
    INDEX idx_deleted_at (deleted_at)
);
```

### 15. resource_amenities

```sql
CREATE TABLE resource_amenities (
    id VARCHAR(36) PRIMARY KEY,
    resource_id VARCHAR(36) NOT NULL,
    amenity VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (resource_id) REFERENCES resources(id) ON DELETE CASCADE,
    INDEX idx_resource_id (resource_id)
);
```

### 16. resource_services

```sql
CREATE TABLE resource_services (
    id VARCHAR(36) PRIMARY KEY,
    resource_id VARCHAR(36) NOT NULL,
    service_id VARCHAR(36) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (resource_id) REFERENCES resources(id) ON DELETE CASCADE,
    UNIQUE KEY unique_resource_service (resource_id, service_id),
    INDEX idx_resource_id (resource_id),
    INDEX idx_service_id (service_id)
);
```

### 17. rooms (managed resources with scheduling)

```sql
CREATE TABLE rooms (
    id VARCHAR(36) PRIMARY KEY,
    business_id VARCHAR(36) NOT NULL,
    branch_id VARCHAR(36) NOT NULL,
    name VARCHAR(255) NOT NULL,
    capacity INT DEFAULT 1,
    floor VARCHAR(100),
    color VARCHAR(7),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP NULL,

    FOREIGN KEY (business_id) REFERENCES businesses(id) ON DELETE CASCADE,
    FOREIGN KEY (branch_id) REFERENCES branches(id) ON DELETE CASCADE,
    INDEX idx_business_id (business_id),
    INDEX idx_branch_id (branch_id),
    INDEX idx_deleted_at (deleted_at)
);
```

### 18. room_amenities

```sql
CREATE TABLE room_amenities (
    id VARCHAR(36) PRIMARY KEY,
    room_id VARCHAR(36) NOT NULL,
    amenity VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (room_id) REFERENCES rooms(id) ON DELETE CASCADE,
    INDEX idx_room_id (room_id)
);
```

### 19. room_weekly_schedule

```sql
CREATE TABLE room_weekly_schedule (
    id VARCHAR(36) PRIMARY KEY,
    room_id VARCHAR(36) NOT NULL,
    day_of_week ENUM('Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat') NOT NULL,
    is_available BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    FOREIGN KEY (room_id) REFERENCES rooms(id) ON DELETE CASCADE,
    UNIQUE KEY unique_room_day (room_id, day_of_week),
    INDEX idx_room_id (room_id)
);
```

### 20. room_shifts

```sql
CREATE TABLE room_shifts (
    id VARCHAR(36) PRIMARY KEY,
    room_weekly_schedule_id VARCHAR(36) NOT NULL,
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    sort_order INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    FOREIGN KEY (room_weekly_schedule_id) REFERENCES room_weekly_schedule(id) ON DELETE CASCADE,
    INDEX idx_room_weekly_schedule_id (room_weekly_schedule_id),
    CHECK (end_time > start_time)
);
```

### 21. room_shift_services

```sql
CREATE TABLE room_shift_services (
    id VARCHAR(36) PRIMARY KEY,
    room_shift_id VARCHAR(36) NOT NULL,
    service_id VARCHAR(36) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (room_shift_id) REFERENCES room_shifts(id) ON DELETE CASCADE,
    UNIQUE KEY unique_room_shift_service (room_shift_id, service_id),
    INDEX idx_room_shift_id (room_shift_id),
    INDEX idx_service_id (service_id)
);
```

### 22. room_shift_overrides

```sql
CREATE TABLE room_shift_overrides (
    id VARCHAR(36) PRIMARY KEY,
    room_id VARCHAR(36) NOT NULL,
    date DATE NOT NULL,
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    reason ENUM('manual', 'copy') DEFAULT 'manual',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    FOREIGN KEY (room_id) REFERENCES rooms(id) ON DELETE CASCADE,
    INDEX idx_room_id (room_id),
    INDEX idx_date (date),
    INDEX idx_room_date (room_id, date),
    CHECK (end_time > start_time)
);
```

### 23. room_shift_override_services

```sql
CREATE TABLE room_shift_override_services (
    id VARCHAR(36) PRIMARY KEY,
    room_shift_override_id VARCHAR(36) NOT NULL,
    service_id VARCHAR(36) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (room_shift_override_id) REFERENCES room_shift_overrides(id) ON DELETE CASCADE,
    UNIQUE KEY unique_override_service (room_shift_override_id, service_id),
    INDEX idx_room_shift_override_id (room_shift_override_id),
    INDEX idx_service_id (service_id)
);
```

---

## Commission Tables

### 24. commission_policies

```sql
CREATE TABLE commission_policies (
    id VARCHAR(36) PRIMARY KEY,
    business_id VARCHAR(36) NOT NULL,
    scope ENUM('serviceCategory', 'service', 'product', 'giftCard', 'membership', 'package') NOT NULL,
    scope_ref_id VARCHAR(36),
    type ENUM('percent', 'fixed') NOT NULL,
    value DECIMAL(10, 2) NOT NULL,
    applies_to ENUM('serviceProvider', 'seller') NOT NULL,
    staff_scope_all BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP NULL,

    FOREIGN KEY (business_id) REFERENCES businesses(id) ON DELETE CASCADE,
    INDEX idx_business_id (business_id),
    INDEX idx_scope (scope),
    INDEX idx_scope_ref_id (scope_ref_id),
    INDEX idx_deleted_at (deleted_at)
);
```

### 25. commission_policy_staff

```sql
CREATE TABLE commission_policy_staff (
    id VARCHAR(36) PRIMARY KEY,
    commission_policy_id VARCHAR(36) NOT NULL,
    staff_id VARCHAR(36) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (commission_policy_id) REFERENCES commission_policies(id) ON DELETE CASCADE,
    FOREIGN KEY (staff_id) REFERENCES staff(id) ON DELETE CASCADE,
    UNIQUE KEY unique_policy_staff (commission_policy_id, staff_id),
    INDEX idx_commission_policy_id (commission_policy_id),
    INDEX idx_staff_id (staff_id)
);
```

---

## Service Assignment Tables

### 26. staff_services

```sql
CREATE TABLE staff_services (
    id VARCHAR(36) PRIMARY KEY,
    staff_id VARCHAR(36) NOT NULL,
    service_id VARCHAR(36) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (staff_id) REFERENCES staff(id) ON DELETE CASCADE,
    UNIQUE KEY unique_staff_service (staff_id, service_id),
    INDEX idx_staff_id (staff_id),
    INDEX idx_service_id (service_id)
);
```

---

## Indexes

Additional composite indexes for performance:

```sql
-- Staff working hours with date range queries
CREATE INDEX idx_staff_working_hours_composite
ON staff_working_hours(staff_id, day_of_week, is_working);

-- Time off date range queries
CREATE INDEX idx_time_off_date_range
ON time_off_requests(staff_id, start_date, end_date, approved);

-- Time reservations date range queries
CREATE INDEX idx_time_reservations_range
ON time_reservations(staff_id, start_datetime, end_datetime);

-- Room schedule availability
CREATE INDEX idx_room_schedule_composite
ON room_weekly_schedule(room_id, day_of_week, is_available);

-- Commission policy lookups
CREATE INDEX idx_commission_scope_composite
ON commission_policies(business_id, scope, scope_ref_id);
```

---

## Constraints

### Business Rules Enforced at Database Level

```sql
-- Ensure business hours shifts don't overlap
CREATE TRIGGER prevent_business_hours_overlap
BEFORE INSERT ON business_hours_shifts
FOR EACH ROW
BEGIN
    IF EXISTS (
        SELECT 1 FROM business_hours_shifts
        WHERE business_hours_id = NEW.business_hours_id
        AND (
            (NEW.start_time >= start_time AND NEW.start_time < end_time)
            OR (NEW.end_time > start_time AND NEW.end_time <= end_time)
            OR (NEW.start_time <= start_time AND NEW.end_time >= end_time)
        )
    ) THEN
        SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = 'Business hours shifts cannot overlap';
    END IF;
END;

-- Similar triggers for staff shifts and room shifts
```

---

## Sample Queries

### Get Staff Complete Schedule

```sql
SELECT
    s.id,
    s.name,
    swh.day_of_week,
    swh.is_working,
    ss.start_time,
    ss.end_time,
    GROUP_CONCAT(CONCAT(ssb.start_time, '-', ssb.end_time)) AS breaks
FROM staff s
LEFT JOIN staff_working_hours swh ON s.id = swh.staff_id
LEFT JOIN staff_shifts ss ON swh.id = ss.staff_working_hours_id
LEFT JOIN staff_shift_breaks ssb ON ss.id = ssb.staff_shift_id
WHERE s.business_id = 'biz-123'
AND s.active = TRUE
GROUP BY s.id, s.name, swh.day_of_week, ss.id
ORDER BY s.name,
    FIELD(swh.day_of_week, 'Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'),
    ss.sort_order;
```

### Get Staff Availability for Date

```sql
SELECT
    s.id,
    s.name,
    COALESCE(sso.start_time, ss.start_time) AS start_time,
    COALESCE(sso.end_time, ss.end_time) AS end_time,
    CASE
        WHEN tor.id IS NOT NULL THEN 'time_off'
        WHEN tr.id IS NOT NULL THEN 'reservation'
        ELSE 'available'
    END AS status
FROM staff s
LEFT JOIN staff_working_hours swh ON s.id = swh.staff_id
    AND swh.day_of_week = DAYNAME('2025-12-01')
LEFT JOIN staff_shifts ss ON swh.id = ss.staff_working_hours_id
LEFT JOIN staff_shift_overrides sso ON s.id = sso.staff_id
    AND sso.date = '2025-12-01'
LEFT JOIN time_off_requests tor ON s.id = tor.staff_id
    AND '2025-12-01' BETWEEN DATE(tor.start_date) AND DATE(tor.end_date)
    AND tor.approved = TRUE
LEFT JOIN time_reservations tr ON s.id = tr.staff_id
    AND DATE(tr.start_datetime) = '2025-12-01'
WHERE s.business_id = 'biz-123'
AND s.active = TRUE;
```

### Get Room Schedule with Services

```sql
SELECT
    r.id AS room_id,
    r.name AS room_name,
    rws.day_of_week,
    rs.start_time,
    rs.end_time,
    GROUP_CONCAT(DISTINCT s.name) AS available_services
FROM rooms r
JOIN room_weekly_schedule rws ON r.id = rws.room_id
JOIN room_shifts rs ON rws.id = rs.room_weekly_schedule_id
JOIN room_shift_services rss ON rs.id = rss.room_shift_id
JOIN services s ON rss.service_id = s.id
WHERE r.branch_id = 'branch-1'
AND rws.is_available = TRUE
GROUP BY r.id, rws.day_of_week, rs.id
ORDER BY r.name,
    FIELD(rws.day_of_week, 'Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'),
    rs.sort_order;
```

---

## Migration Scripts

### Initial Setup

```sql
-- Create all tables in order (respecting foreign key dependencies)
-- 1. Core tables (businesses, branches)
-- 2. Staff tables
-- 3. Scheduling tables
-- 4. Resource tables
-- 5. Commission tables

-- Insert default business hours for new business
INSERT INTO business_hours (id, business_id, day_of_week, is_open)
SELECT
    UUID(),
    'new-business-id',
    day,
    CASE day WHEN 'Sun' THEN FALSE ELSE TRUE END
FROM (
    SELECT 'Sun' AS day UNION SELECT 'Mon' UNION SELECT 'Tue' UNION
    SELECT 'Wed' UNION SELECT 'Thu' UNION SELECT 'Fri' UNION SELECT 'Sat'
) AS days;
```

---

## Notes for Backend Implementation

1. **UUID Generation**: Use database-native UUID functions or application-level generation
2. **Soft Deletes**: Use `deleted_at` timestamp for soft deletes across all main tables
3. **Timestamps**: Auto-update `updated_at` on row modifications
4. **Cascading Deletes**: Properly configured for data integrity
5. **Transactions**: Wrap multi-table operations in transactions
6. **Validation**: Implement application-level validation before database operations
7. **Caching**: Cache frequently accessed data (business hours, staff schedules)
8. **Archiving**: Implement data archiving strategy for old time off/reservation records
9. **Backup**: Regular backups with point-in-time recovery
10. **Performance**: Monitor slow queries and optimize indexes as needed

---

**End of Database Schema**
