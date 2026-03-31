# 🎨 Visual Design Guide - Modern Leave Tracker UI

## Color Schemes by Role

### 👔 Organization Admin (Dark Premium Theme)
```
Sidebar Header:  bg-gradient-to-r from-indigo-500 to-purple-600
Background:      bg-gradient-to-br from-slate-900 via-indigo-900 to-purple-900
Accent Colors:   Indigo, Purple, Slate
Text:            White on dark backgrounds
Vibe:            Professional, Premium, Powerful
```

**Use Case:** Perfect for administrators who need full system access and control.

---

### 💼 HR Manager (Soft Professional Theme)
```
Sidebar Header:  bg-gradient-to-r from-pink-500 to-rose-500
Background:      bg-gradient-to-br from-rose-50 via-pink-50 to-purple-50
Accent Colors:   Pink, Rose, Purple
Text:            Gray-900 on light backgrounds
Vibe:            Clean, Approachable, Organized
```

**Use Case:** Ideal for HR professionals managing employee requests and policies.

---

### 👥 Team Manager (Calm Blue Theme)
```
Sidebar Header:  bg-gradient-to-r from-blue-500 to-teal-500
Background:      bg-gradient-to-br from-blue-50 via-teal-50 to-cyan-50
Accent Colors:   Blue, Teal, Cyan
Text:            Gray-900 on light backgrounds
Vibe:            Trustworthy, Calm, Leadership
```

**Use Case:** Designed for team leads managing department leaves and approvals.

---

### 🌟 Employee (Fresh Green Theme)
```
Sidebar Header:  bg-gradient-to-r from-emerald-500 to-green-500
Background:      bg-gradient-to-br from-emerald-50 via-green-50 to-teal-50
Accent Colors:   Emerald, Green, Teal
Text:            Gray-900 on light backgrounds
Vibe:            Fresh, Simple, User-Friendly
```

**Use Case:** Tailored for regular employees to easily manage their leaves.

---

## Component Previews

### 1. **Modern Sidebar (Expanded)**
```
┌─────────────────────────────────┐
│  🏢 Admin Panel        [−]      │ ← Collapsible toggle button
├─────────────────────────────────┤
│  📊 Dashboard          ← Active │ ← Gradient background when active
│  📅 My Leaves                   │
│  📝 Apply Leave                 │
│  ✅ Approvals            (3)    │ ← Badge notification
│  👥 Team                        │
│  📋 Leave Types                 │
│  📅 Holidays                    │
│  ⚙️ Settings                   │
├─────────────────────────────────┤
│  [JD] John Doe                  │ ← User profile section
│     org_admin                   │
└─────────────────────────────────┘
```

### 2. **Modern Sidebar (Collapsed)**
```
┌──────────┐
│  🏢      │ ← Icon only
├──────────┤
│  📊      │
│  📅      │
│  📝      │
│  ✅      │
│  👥      │
│  📋      │
│  📅      │
│  ⚙️      │
├──────────┤
│  [JD]    │ ← Avatar only
└──────────┘
```

**Tooltip on Hover:**
```
When hovering over collapsed items:
┌──────────┐ ┌─────────────┐
│  📊      │◄│ Dashboard   │ ← Tooltip appears
└──────────┘ └─────────────┘
```

---

### 3. **Enhanced Topbar**
```
┌────────────────────────────────────────────────────────────────────┐
│ ☰  [Acme Corp]           🔍 Search...    🔔   [JD] John Doe ▼    │
│                          (Notification)   (Profile Dropdown)       │
└────────────────────────────────────────────────────────────────────┘
```

**Profile Dropdown (when clicked):**
```
┌─────────────────────────────┐
│ John Doe                    │
│ john@acme.com               │
├─────────────────────────────┤
│ 👤 My Dashboard             │
│ ⚙️ Settings                │
├─────────────────────────────┤
│ 🚪 Sign out                 │
└─────────────────────────────┘
```

---

### 4. **Stat Card Components**

#### Standard Stat Card
```
┌──────────────────────────────┐
│  📊                    ↑ 12% │ ← Optional trend indicator
│                              │
│  1,256                       │ ← Large bold value
│  Total Employees             │ ← Title
│  Active team members         │ ← Subtitle (optional)
│                              │
│              (Decorative ○)  │ ← Background circle
└──────────────────────────────┘
```

#### Quick Action Card
```
┌──────────────────────────────┐
│                         (3)  │ ← Badge (top-right corner)
│  👥                          │
│  Manage Users                │
│  Create & manage team        │
└──────────────────────────────┘
```

**Hover Effect:**
```
┌──────────────────────────────┐
│                         (3)  │
│  👥     ✨ Scale + Shadow    │ ← Grows 5% and lifts up
│  Manage Users                │
│  Create & manage team        │
└──────────────────────────────┘
```

---

### 5. **Dashboard Layout Examples**

#### Admin Dashboard (Top Section)
```
┌─────────────────────────────────────────────────────────────────┐
│                                                                 │
│  Welcome back, John! 👋                                         │
│  org_admin • Acme Corp                                          │
│                                      ┌─────────────────────┐   │
│                                      │ Today               │   │
│                                      │ Friday, Mar 27      │   │
│                                      └─────────────────────┘   │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│ ⚡ Admin Quick Actions                                           │
├──────────────┬──────────────┬──────────────┬──────────────┐
│ │ 👥        │ │ 🏖️        │ │ ✅        │ │ 📅        │
│ │ Manage    │ │ Leave     │ │ Approvals │ │ Holidays    │
│ │ Users     │ │ Types     │ │ (3 pending)│ │             │
│ └───────────┘ └───────────┘ └───────────┘ └───────────┘
└─────────────────────────────────────────────────────────────────┘

┌──────────────┬──────────────┬──────────────┬──────────────┐
│ │ 🏢        │ │ 📋        │ │ ✅        │ │ 📊        │
│ │ 256       │ │ 12        │ │ 5         │ │ 8         │
│ │ Total     │ │ Pending   │ │ On Leave  │ │ Leave     │
│ │ Employees │ │ Leaves    │ │ Today     │ │ Types     │
│ └───────────┘ └───────────┘ └───────────┘ └───────────┘
└─────────────────────────────────────────────────────────────────┘
```

#### Employee Dashboard (Simplified)
```
┌─────────────────────────────────────────────────────────────────┐
│  Employee Dashboard                                              │
│  Manage your leaves and track your balance                       │
└─────────────────────────────────────────────────────────────────┘

┌──────────────────┬──────────────────┐
│ │ ➕            │ │ ⏰            │
│ │ Available     │ │ Pending       │
│ │ Balance       │ │ Requests      │
│ │ 15 days       │ │ 2             │
│ └────────────────┘ └────────────────┘
└──────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│ Quick Actions                                                   │
├──────────────────────┬──────────────────────┐
│ │ ✈️ Apply for Leave │ │ 📋 My History     │
│ │ Submit new request │ │ View all requests │
│ └────────────────────┘ └────────────────────┘
└─────────────────────────────────────────────────────────────────┘
```

---

### 6. **Leave Balance Card with Progress Bar**
```
┌──────────────────────────────────────────┐
│ Annual Leave                      8 left │
│ 8 of 15 days remaining                   │
│ ████████████░░░░░░░░░░ 53%               │ ← Progress bar
└──────────────────────────────────────────┘
```

**Low Balance Warning (red progress bar):**
```
┌──────────────────────────────────────────┐
│ Sick Leave                        2 left │
│ 2 of 10 days remaining                   │
│ ████░░░░░░░░░░░░░░░░░░ 20%               │ ← Red gradient
└──────────────────────────────────────────┘
```

---

### 7. **Upcoming Leaves Section**
```
┌─────────────────────────────────────────────────────────────────┐
│ Your Upcoming Leaves                           View All →        │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ┌────────────────────────────────────────────────────────┐    │
│  │ 📅  Annual Leave                                       │    │
│  │     Mar 15 - Mar 17 • 3 days                          │    │
│  └────────────────────────────────────────────────────────┘    │
│                                                                 │
│  ┌────────────────────────────────────────────────────────┐    │
│  │ 📅  Sick Leave                                         │    │
│  │     Apr 2 - Apr 4 • 3 days                            │    │
│  └────────────────────────────────────────────────────────┘    │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

**Empty State:**
```
┌─────────────────────────────────────────────────────────────────┐
│ Your Upcoming Leaves                           View All →        │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│                      🌴                                         │
│         No upcoming leaves scheduled                            │
│         Apply for leave →                                       │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

---

## Animation Specifications

### Hover Animations
```css
/* Card hover effect */
.card {
  transition: all 0.2s ease-in-out;
}

.card:hover {
  transform: scale(1.05);        /* Grow 5% */
  box-shadow: 0 10px 15px -3px;  /* Lift shadow */
}

/* Menu item hover */
.menu-item {
  transition: all 0.2s;
}

.menu-item:hover {
  background: linear-gradient(to right, #f3f4f6, #e5e7eb);
  transform: scale(1.02);
}

/* Active menu item */
.menu-item.active {
  background: linear-gradient(to right, #6366f1, #9333ea);
  color: white;
  box-shadow: 0 10px 15px -3px rgba(99, 102, 241, 0.3);
}
```

### Sidebar Collapse Animation
```css
.sidebar {
  transition: width 0.3s ease-in-out;
}

.sidebar.collapsed {
  width: 5rem; /* 80px */
}

.sidebar.expanded {
  width: 18rem; /* 288px */
}
```

### Dropdown Animation
```css
.dropdown {
  animation: fadeIn 0.2s ease-in-out;
  animation: zoomIn 0.2s ease-in-out;
}

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

@keyframes zoomIn {
  from { transform: scale(0.95); }
  to { transform: scale(1); }
}
```

---

## Responsive Breakpoints

### Mobile View (< 1024px)
```
┌─────────────────────────┐
│ ☰  [Logo]      🔔 [👤] │ ← Compact topbar
└─────────────────────────┘
│                         │
│  [Full-width cards]     │
│                         │
│  ┌───────────────────┐  │
│  │ Stat Card         │  │
│  └───────────────────┘  │
│                         │
│  ┌───────────────────┐  │
│  │ Quick Actions     │  │
│  │ (Stacked 2x2)     │  │
│  └───────────────────┘  │
│                         │
└─────────────────────────┘
```

### Desktop View (≥ 1024px)
```
┌────────────┬──────────────────────────────────────────┐
│  Sidebar   │  Topbar                                  │
│  (Fixed)   ├──────────────────────────────────────────┤
│            │                                          │
│  - Logo    │  [Dashboard Content]                     │
│  - Nav     │                                          │
│  - Profile │  ┌────┬────┬────┬────┐                  │
│            │  │Card│Card│Card│Card│                  │
│            │  └────┴────┴────┴────┘                  │
│            │                                          │
│            │  ┌────────────┬────────────┐             │
│            │  │ Widget 1   │ Widget 2   │             │
│            │  └────────────┴────────────┘             │
│            │                                          │
└────────────┴──────────────────────────────────────────┘
```

---

## Typography Hierarchy

```
H1 (Page Title):     text-3xl font-bold    (30px)
H2 (Section Header): text-2xl font-bold    (24px)
H3 (Card Title):     text-lg font-bold     (18px)
Body Large:          text-base             (16px)
Body:                text-sm               (14px)
Caption:             text-xs               (12px)
```

---

## Icon Usage

**Size Guidelines:**
- Small icons (inline): `h-4 w-4` (16px)
- Medium icons (buttons): `h-5 w-5` (20px)
- Large icons (cards): `h-6 w-6` (24px)
- Hero icons (stats): `text-3xl` to `text-5xl` (30-48px)
- Emoji icons: `text-3xl` to `text-4xl` (30-36px)

---

This design system creates a cohesive, modern, and professional UI that adapts beautifully to different user roles while maintaining consistency throughout the application! 🎨✨
