# Leave Tracker System - Data Dictionary

This document provides a detailed overview of the data models (Mongoose Schemas) used in the Leave Tracker System.

## Table of Contents
1. [User Entity](#user-entity)
2. [Organization Entity](#organization-entity)
3. [Department Entity](#department-entity)
4. [Leave Application Entity](#leave-application-entity)
5. [Leave Type Entity](#leave-type-entity)
6. [Leave Balance Entity](#leave-balance-entity)
7. [Holiday Entity](#holiday-entity)

---

## 1. User Entity
The User entity represents all users of the system across all organizations.

| Field Name | Type | Constraints | Description |
| :--- | :--- | :--- | :--- |
| `name` | String | Required, Trimmed | Full name of the user. |
| `email` | String | Required, Unique, Lowercase, Trimmed | User's login email address. |
| `passwordHash` | String | Required | Encrypted password string. |
| `role` | String (Enum) | Default: 'employee' | User privilege level (super_admin, org_admin, hr_manager, manager, employee). |
| `managerId` | ObjectId (Ref: User) | Optional | Links to this user's reporting manager. |
| `department` | String | Trimmed | Legacy/fallback department name (string profile). |
| `departmentId` | ObjectId (Ref: Department) | Optional | Linked department reference. |
| `designation` | String | Trimmed | Employee's job title. |
| `joiningDate` | Date | Optional | Date when the user joined the organization. |
| `organizationId` | ObjectId (Ref: Organization) | Required | Company/Organization the user belongs to. |
| `isActive` | Boolean | Default: true | Status indicating if the user is currently active. |
| `refreshToken` | String | Optional | JWT Token for session refresh. |
| `createdAt` | Date | Automatic | Timestamp of record creation. |
| `updatedAt` | Date | Automatic | Timestamp of last record update. |

---

## 2. Organization Entity
Contains configuration and primary details about companies using the system.

### Organization Schema
| Field Name | Type | Constraints | Description |
| :--- | :--- | :--- | :--- |
| `name` | String | Required, Trimmed | Name of the organization. |
| `domain` | String | Optional, Trimmed | Organization's domain (e.g., example.com). |
| `logo` | String | Optional, Trimmed | URL/Path to the organization's logo. |
| `address` | String | Optional, Trimmed | Physical address of the organization. |
| `settings` | Object (OrganizationSettings) | Default: {} | Configuration settings for various modules. |
| `isActive` | Boolean | Default: true | Flag to enable/disable the organization. |

### OrganizationSettings Sub-Schema
| Field Name | Type | Default | Description |
| :--- | :--- | :--- | :--- |
| `workingDays` | String[] | Mon-Fri | List of active working days in a week. |
| `holidays` | Array | [] | Custom holidays for the organization. |
| `timezone` | String | 'UTC' | Timezone for organization-wide calculations. |
| `leaveYearStart` | Number (1-12) | 1 (January) | Month number representing the start of leave year. |

---

## 3. Department Entity
Represents organizational units within a company.

| Field Name | Type | Constraints | Description |
| :--- | :--- | :--- | :--- |
| `name` | String | Required, Trimmed | Name of the department. |
| `organizationId` | ObjectId (Ref: Organization) | Required | Reference to the organization. |
| `headId` | ObjectId (Ref: User) | Optional | Reference to the Department Head (HOD). |
| `isActive` | Boolean | Default: true | Whether the department is still operational. |

---

## 4. Leave Application Entity
Tracks leave requests submitted by employees.

| Field Name | Type | Constraints | Description |
| :--- | :--- | :--- | :--- |
| `userId` | ObjectId (Ref: User) | Required | User who applied for leave. |
| `organizationId` | ObjectId (Ref: Organization) | Required | Organization context for the request. |
| `leaveTypeId` | ObjectId (Ref: LeaveType) | Required | Type of leave (Casual, Sick, etc.). |
| `fromDate` | Date | Required | Start date of the leave. |
| `toDate` | Date | Required | End date of the leave. |
| `totalDays` | Number | Required, Min: 0 | Total number of days requested. |
| `reason` | String | Required, Trimmed | Reason provided by the employee. |
| `status` | String (Enum) | Default: 'pending' | Status: pending, approved, rejected, cancelled. |
| `attachmentUrl`| String | Optional, Trimmed | Proof or medical certificates if any. |
| `approvedBy` | ObjectId (Ref: User) | Optional | User (Manager/HR) who approved/rejected request. |
| `approvedAt` | Date | Optional | Timestamp of approval/rejection decision. |
| `rejectionReason`| String | Optional, Trimmed | Message provided during rejection. |

---

## 5. Leave Type Entity
Defines types of leaves available (e.g., Annual Leave, Sick Leave).

| Field Name | Type | Constraints | Description |
| :--- | :--- | :--- | :--- |
| `name` | String | Required, Trimmed | Name of the leave category. |
| `organizationId` | ObjectId (Ref: Organization) | Required | Organization this leave type belongs to. |
| `totalDaysAllowed`| Number | Required, Min: 0 | Annual quota for this leave type. |
| `carryForwardAllowed`| Boolean | Default: false | If unused leaves can carry over to next year. |
| `carryForwardLimit`| Number | Default: 0 | Max days permitted to carry forward. |
| `isActive` | Boolean | Default: true | Enable/Disable leave type availability. |
| `isPaid` | Boolean | Default: true | Defines if this leave type is paid or unpaid. |
| `applicableGender`| String (Enum) | Default: 'all' | Applicable for: 'all', 'male', 'female'. |

---

## 6. Leave Balance Entity
Maintains the current leave quota and usage for each user per year.

| Field Name | Type | Constraints | Description |
| :--- | :--- | :--- | :--- |
| `userId` | ObjectId (Ref: User) | Required | Employee whom this balance belongs to. |
| `organizationId` | ObjectId (Ref: Organization) | Required | Organization context. |
| `leaveTypeId` | ObjectId (Ref: LeaveType) | Required | Type of leave being tracked. |
| `year` | Number | Required | Financial/Calendar year for this record. |
| `totalAllocated`| Number | Required, Min: 0 | Total quota for the year plus carries. |
| `used` | Number | Required, Default: 0 | Total days already utilized. |
| `remaining` | Number | Required, Min: 0 | Days left to use (calculated as allocated - used). |
| `carryForward`| Number | Default: 0 | Days brought over from previous period. |

---

## 7. Holiday Entity
Static list of holidays applicable to an organization.

| Field Name | Type | Constraints | Description |
| :--- | :--- | :--- | :--- |
| `organizationId` | ObjectId (Ref: Organization) | Required | Organization reference. |
| `name` | String | Required, Trimmed | Name/Description of the holiday. |
| `date` | Date | Required | Calendar date of the holiday. |
| `type` | String (Enum) | Default: 'national'| Type: 'national' or 'optional'. |
