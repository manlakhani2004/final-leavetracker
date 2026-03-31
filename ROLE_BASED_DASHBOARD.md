# Role-Based Dashboard Features

## Overview
The Leave Tracker System now provides **customized dashboards** for each role with unique UI, features, and statistics.

---

## 🎯 Role-Specific Dashboards

### 1️⃣ **ORG_ADMIN (Organization Administrator)**

**Dashboard Theme**: Full administrative control with purple/indigo gradient

#### Features:
✅ **Quick Actions:**
- 👥 Manage Users - Create and manage all users
- 🏖️ Leave Types - Configure organization policies
- ✅ Approvals - View pending approvals (with badge counter)
- 📅 Holidays - Manage holiday calendar

✅ **Organization Statistics:**
- 🏢 Total Employees - Active team members count
- 📋 Pending Leaves - Awaiting approval across org
- ✅ On Leave Today - Currently absent employees
- 📊 Leave Types - Configured policies

✅ **Full Access:**
- All organization management features
- User CRUD operations
- Policy configuration
- Analytics and reporting

---

### 2️⃣ **HR_MANAGER (Human Resources Manager)**

**Dashboard Theme**: HR oversight with purple accents

#### Features:
✅ **Quick Actions:**
- ✅ Pending Approvals - Priority action items (with badge)
- 👥 All Users - View entire organization
- 📊 Reports - Analytics and insights

✅ **HR Statistics:**
- ⏳ Pending Approval - Requires immediate action
- 👥 Total Team - Organization size
- 🏖️ On Leave - Absent employees today

✅ **Responsibilities:**
- Approve/reject leave requests
- Monitor organization-wide leave patterns
- Generate reports
- Policy enforcement

---

### 3️⃣ **MANAGER (Team Lead/Manager)**

**Dashboard Theme**: Team-focused with blue/green accents

#### Features:
✅ **Quick Actions:**
- ✅ Team Approvals - Pending team requests (with badge)
- 👥 My Team - View direct reports
- 📅 Team Calendar - Leave schedule visibility

✅ **Team Statistics:**
- ⏳ Pending - Team's awaiting approvals
- 👤 Team Size - Direct reports count
- 🏖️ Team On Leave - Absent team members

✅ **Responsibilities:**
- Approve team member leaves
- Monitor team attendance
- Track team leave balance
- Ensure adequate coverage

---

### 4️⃣ **EMPLOYEE (Staff Member)**

**Dashboard Theme**: Personal management with emerald/teal gradient

#### Features:
✅ **Personal Stats Cards:**
- 💰 Available Balance - Total remaining days
- ⏳ Pending Requests - Awaiting approval count

✅ **Quick Actions:**
- ✈️ Apply for Leave - Submit new requests
- 📋 My Leave History - View all applications

✅ **Capabilities:**
- Apply for leaves
- View personal leave balance
- Track application status
- View upcoming approved leaves

❌ **Restricted From:**
- No approval workflow access
- Cannot view other employees' data
- No management features

---

## 🎨 UI/UX Differences

### Visual Distinctions:

| Role | Header Gradient | Accent Colors | Special Elements |
|------|----------------|---------------|------------------|
| **Org Admin** | Indigo → Purple | Blue, Green, Purple, Orange | 4 Quick Actions, 4 Org Stats |
| **HR Manager** | Standard White | Purple, Blue, Green | 3 HR Actions, 3 HR Stats |
| **Manager** | Standard White | Blue, Green, Purple | 3 Team Actions, 3 Team Stats |
| **Employee** | Emerald → Teal | Blue, Purple, Green | 2 Stat Cards, 2 Action Cards |

### Feature Matrix:

| Feature | Org Admin | HR Manager | Manager | Employee |
|---------|-----------|------------|---------|----------|
| **Approve Leaves** | ✅ | ✅ | ✅ (own team) | ❌ |
| **Manage Users** | ✅ | ✅ | ❌ | ❌ |
| **Configure Policies** | ✅ | ✅ | ❌ | ❌ |
| **View Org Stats** | ✅ | ✅ | ❌ | ❌ |
| **View Team Stats** | ✅ | ✅ | ✅ | ❌ |
| **Apply for Leave** | ✅ | ✅ | ✅ | ✅ |
| **View Personal Balance** | ✅ | ✅ | ✅ | ✅ |
| **Manage Holidays** | ✅ | ✅ | ❌ | ❌ |

---

## 🔐 Permission Levels

### Super Admin (System-wide)
- Manages multiple organizations
- Creates/deactivates organizations
- Not shown in regular dashboard

### Org Admin (Organization-wide)
- **Scope**: Entire organization
- **Power Level**: Maximum within org
- **Can**: Do anything except delete org

### HR Manager (Organization-wide)
- **Scope**: Entire organization
- **Power Level**: High
- **Can**: Manage policies, approve all leaves

### Manager (Team-level)
- **Scope**: Direct reports only
- **Power Level**: Medium
- **Can**: Approve team leaves, view team data

### Employee (Individual)
- **Scope**: Self only
- **Power Level**: Basic
- **Can**: Apply for leaves, view own data

---

## 🚀 How It Works

### Dynamic Rendering:
```typescript
{user?.role === 'org_admin' && <OrgAdminDashboard />}
{user?.role === 'hr_manager' && <HRManagerDashboard />}
{user?.role === 'manager' && <ManagerDashboard />}
{user?.role === 'employee' && <EmployeeDashboard />}
```

### Data Filtering:
- Backend returns role-specific data
- Frontend conditionally renders components
- API guards enforce access control

---

## 📊 Statistics Displayed

### Org Admin Sees:
- Organization-wide metrics
- All departments combined
- High-level analytics

### HR Manager Sees:
- HR-focused metrics
- Approval queue status
- Compliance data

### Manager Sees:
- Team-specific metrics
- Direct reports only
- Team availability

### Employee Sees:
- Personal metrics only
- Own leave balance
- Individual stats

---

## 🎯 Benefits

1. **Relevant Information**: Each role sees only what matters to them
2. **Reduced Clutter**: No overwhelming irrelevant features
3. **Faster Workflows**: Quick actions tailored to responsibilities
4. **Better UX**: Clean, focused interface per role
5. **Security**: Natural information barrier between roles

---

## 🔄 Real-Time Updates

All dashboards update automatically when:
- New leave applications submitted
- Approvals/rejections completed
- Leave balances change
- Team composition changes

---

## 📱 Responsive Design

All role-specific dashboards are:
- ✅ Mobile-friendly
- ✅ Tablet-optimized
- ✅ Desktop-responsive
- ✅ Touch-compatible

---

**Your Leave Tracker System now provides personalized experiences for every user role!** 🎉
