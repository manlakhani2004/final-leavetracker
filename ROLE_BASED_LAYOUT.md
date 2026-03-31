# Role-Based Layout System

## 🎨 Complete UI Differentiation by Role

Your Leave Tracker System now has **completely different layouts** for each role with unique themes, colors, and branding!

---

## 🏢 1. ORG_ADMIN Layout

### Theme: **Dark Purple/Indigo Executive**

**Visual Design:**
- Background: Gradient from Slate-900 → Indigo-900 → Purple-900
- Sidebar: Dark gradient with glass-morphism effect
- Header: "🏢 Admin Panel" in bold white text
- Width: 72px wider sidebar (288px total)
- Borders: Indigo-700/30 translucent
- Shadows: Extra large (shadow-2xl)

**Spacing:**
- Main padding: p-8 (32px)
- Max width: 7xl (1280px)

**Feel:** Powerful, executive, premium dashboard

---

## 👔 2. HR_MANAGER Layout

### Theme: **Pink/Rose Professional**

**Visual Design:**
- Background: Gradient from Rose-50 → Pink-50 → Purple-50 (light & airy)
- Sidebar: White with pink borders
- Header: "👔 HR Portal" with pink-purple gradient text
- Width: Standard 64px sidebar (256px)
- Borders: Pink-200 soft color
- Shadows: Large (shadow-lg)

**Spacing:**
- Main padding: p-6 (24px)
- Max width: 6xl (1152px)
- Sidebar padding: p-4 internal

**Feel:** Professional, approachable, HR-focused

---

## 👥 3. MANAGER Layout

### Theme: **Blue/Teal Team-Focused**

**Visual Design:**
- Background: Gradient from Blue-50 → Teal-50 → Cyan-50
- Sidebar: White with blue borders
- Header: "👥 Team Manager" with blue-teal gradient text
- Width: Standard 64px sidebar
- Borders: Blue-200 calm color
- Shadows: Large (shadow-lg)

**Spacing:**
- Main padding: p-6 (24px)
- Max width: 6xl (1152px)

**Feel:** Collaborative, team-oriented, balanced

---

## 🌟 4. EMPLOYEE Layout

### Theme: **Green/Emerald Clean & Simple**

**Visual Design:**
- Background: Gradient from Emerald-50 → Green-50 → Teal-50
- Sidebar: White with green borders
- Header: "🌟 Employee Hub" with green-emerald gradient text
- Width: Standard 64px sidebar
- Borders: Green-200 friendly color
- Shadows: Large (shadow-lg)

**Spacing:**
- Main padding: p-6 (24px)
- Max width: 5xl (960px) - More compact for individual use

**Feel:** Simple, friendly, personal workspace

---

## 🎯 Key Differences Summary

| Feature | Admin | HR Manager | Manager | Employee |
|---------|-------|------------|---------|----------|
| **Background** | Dark Purple | Light Pink | Light Blue | Light Green |
| **Sidebar Width** | 288px | 256px | 256px | 256px |
| **Header Text** | Admin Panel | HR Portal | Team Manager | Employee Hub |
| **Header Emoji** | 🏢 | 👔 | 👥 | 🌟 |
| **Main Padding** | 32px | 24px | 24px | 24px |
| **Max Width** | 1280px | 1152px | 1152px | 960px |
| **Border Color** | Indigo-700/30 | Pink-200 | Blue-200 | Green-200 |
| **Shadow Level** | shadow-2xl | shadow-lg | shadow-lg | shadow-lg |
| **Text Effect** | Solid white | Gradient text | Gradient text | Gradient text |

---

## 🔐 Implementation Details

### How It Works:

```typescript
// layout.tsx checks user role and renders appropriate theme
if (user?.role === 'org_admin') {
  return <AdminLayout>{children}</AdminLayout>;
}
if (user?.role === 'hr_manager') {
  return <HRLayout>{children}</HRLayout>;
}
if (user?.role === 'manager') {
  return <ManagerLayout>{children}</ManagerLayout>;
}
return <EmployeeLayout>{children}</EmployeeLayout>;
```

### Features Per Layout:

✅ **All layouts include:**
- Responsive mobile sidebar
- AuthProvider context
- Toaster notifications
- Topbar navigation
- Sidebar menu
- Role-appropriate styling

✅ **Unique per role:**
- Color schemes
- Branding (emoji + text)
- Spacing and widths
- Background gradients
- Border colors
- Shadow intensities

---

## 📱 Responsive Design

All layouts are fully responsive:

- **Desktop**: Full sidebar visible (256px or 288px)
- **Mobile**: Collapsible sidebar with overlay
- **Tablet**: Adaptive layouts
- **Touch-friendly**: All interactive elements

---

## 🎨 Color Psychology

### Admin (Dark Purple):
- Power, authority, sophistication
- Premium feel
- Executive presence

### HR (Pink/Rose):
- Approachability, professionalism
- Balance of warmth and authority
- People-focused

### Manager (Blue/Teal):
- Trust, reliability, teamwork
- Calm and balanced
- Leadership without intimidation

### Employee (Green/Emerald):
- Growth, harmony, personal space
- Friendly and accessible
- Individual empowerment

---

## 🚀 User Experience Benefits

1. **Instant Role Recognition**: Users immediately know their access level
2. **Psychological Comfort**: Each role feels appropriate for responsibilities
3. **Reduced Cognitive Load**: Familiar environment reduces stress
4. **Professional Identity**: Layout reinforces professional role
5. **Intuitive Navigation**: Visual hierarchy matches responsibilities

---

## 💡 Technical Highlights

- ✅ Single layout file handles all roles
- ✅ Dynamic rendering based on user context
- ✅ No page reloads when switching roles
- ✅ Consistent component structure
- ✅ Easy to customize per-role styling
- ✅ Mobile-first responsive design
- ✅ Accessibility maintained across themes

---

## 🎯 Next Steps (Optional Enhancements)

You could add:
- Custom icons per role in sidebar
- Different font weights/sizes
- Role-specific animations
- Custom scrollbar styling
- Different navigation patterns
- Unique card styles per role

---

**Your Leave Tracker System now provides truly personalized experiences for every user role!** 🎨✨

Each user will feel like they're in their own dedicated workspace designed specifically for their needs!
