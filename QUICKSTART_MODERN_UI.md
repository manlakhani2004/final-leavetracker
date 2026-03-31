# 🚀 Quick Start Guide - Modern Leave Tracker UI

## Prerequisites

Make sure you have installed:
- Node.js (v16 or higher)
- npm or yarn
- MongoDB (local or Atlas connection)

---

## Installation & Setup

### 1. Backend Setup

```bash
cd backend

# Install dependencies
npm install

# Copy environment file
cp .env.example .env

# Edit .env with your MongoDB connection string
# MONGODB_URI=mongodb://localhost:27017/leave-tracker
# Or use MongoDB Atlas connection

# Start backend in development mode
npm run start:dev

# Backend will run on http://localhost:3000
```

### 2. Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Copy environment file
cp .env.example .env

# Edit .env with your backend URL
# NEXT_PUBLIC_API_URL=http://localhost:3000/api

# Start frontend in development mode
npm run dev

# Frontend will run on http://localhost:3001
```

---

## Testing Different Roles

### Create Test Users

You can register different users using the API or through the UI registration page.

#### Option 1: Using Registration Page
1. Go to `http://localhost:3001/register`
2. Fill in organization details
3. This creates an **org_admin** user automatically

#### Option 2: Using API (Postman/curl)

**Register Organization (creates org_admin):**
```bash
curl -X POST http://localhost:3000/api/auth/register-org \
  -H "Content-Type: application/json" \
  -d '{
    "organizationName": "Acme Corp",
    "adminName": "John Admin",
    "adminEmail": "admin@acme.com",
    "adminPassword": "password123",
    "domain": "acme.com"
  }'
```

**Create HR Manager:**
```bash
curl -X POST http://localhost:3000/api/users \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Sarah HR",
    "email": "hr@acme.com",
    "role": "hr_manager",
    "department": "Human Resources"
  }'
```

**Create Manager:**
```bash
curl -X POST http://localhost:3000/api/users \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Mike Manager",
    "email": "manager@acme.com",
    "role": "manager",
    "department": "Engineering"
  }'
```

**Create Employee:**
```bash
curl -X POST http://localhost:3000/api/users \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Emma Employee",
    "email": "employee@acme.com",
    "role": "employee",
    "department": "Engineering",
    "managerId": "MANAGER_USER_ID"
  }'
```

---

## Login Credentials (Example)

After setup, you can login with:

| Role | Email | Password | Theme |
|------|-------|----------|-------|
| **Org Admin** | admin@acme.com | password123 | Dark Purple |
| **HR Manager** | hr@acme.com | password123 | Pink/Rose |
| **Manager** | manager@acme.com | password123 | Blue/Teal |
| **Employee** | employee@acme.com | password123 | Green/Emerald |

---

## What to Test

### 1. Layout System
- [ ] Login as different roles
- [ ] Check if sidebar color changes per role
- [ ] Verify topbar theme matches role
- [ ] Test background gradients

### 2. Sidebar Features
- [ ] Click toggle button to collapse/expand
- [ ] Check tooltips in collapsed mode
- [ ] Verify navigation items are role-filtered
- [ ] Test hover animations on menu items
- [ ] Check active state highlighting
- [ ] See user profile section at bottom

### 3. Topbar Features
- [ ] Click hamburger menu on mobile
- [ ] Try search functionality
- [ ] Click notification bell
- [ ] Click profile avatar for dropdown
- [ ] Test dropdown menu items
- [ ] Logout functionality

### 4. Dashboard Widgets
- [ ] View stat cards with gradients
- [ ] Check hover effects on cards
- [ ] Test quick action cards
- [ ] Verify badge notifications
- [ ] Check progress bars in leave balances
- [ ] Test responsive layout

### 5. Responsive Design
- [ ] Open DevTools (F12)
- [ ] Toggle device mode
- [ ] Test mobile view (< 640px)
- [ ] Test tablet view (640px - 1024px)
- [ ] Test desktop view (> 1024px)
- [ ] Check sidebar overlay on mobile

### 6. Animations
- [ ] Smooth sidebar collapse
- [ ] Card hover scale effects
- [ ] Menu item transitions
- [ ] Dropdown fade/zoom animation
- [ ] Badge pulse effect

---

## Visual Checklist

When everything is working correctly, you should see:

### Admin Dashboard (Dark Theme)
```
✓ Dark purple/indigo gradient background
✓ White text in sidebar header
✓ Professional, premium look
✓ All admin features accessible
```

### HR Manager Dashboard (Light Pink Theme)
```
✓ Light pink/rose gradient background
✓ Clean, approachable design
✓ Gray text on light background
✓ HR-specific features visible
```

### Manager Dashboard (Blue Theme)
```
✓ Blue/teal gradient accents
✓ Calm, professional appearance
✓ Team management features
✓ Direct reports information
```

### Employee Dashboard (Green Theme)
```
✓ Emerald/green gradient accents
✓ Fresh, simple interface
✓ Easy-to-use navigation
✓ Personal leave info prominent
```

---

## Common Issues & Solutions

### Issue: Sidebar not collapsing
**Solution:** Check if `collapsed` state is being passed correctly to Sidebar component

### Issue: Profile dropdown not showing
**Solution:** Ensure `showProfileMenu` state toggles and z-index is correct

### Issue: Colors not showing
**Solution:** Verify Tailwind CSS is properly configured and building

### Issue: Navigation not filtering by role
**Solution:** Check AuthContext is providing correct user.role value

### Issue: Mobile menu not opening
**Solution:** Verify `sidebarOpen` state and overlay z-index

### Issue: Gradients look pixelated
**Solution:** Add `bg-gradient-to-r` class, ensure proper direction

---

## Browser Compatibility

Tested on:
- ✅ Chrome/Edge (latest)
- ✅ Firefox (latest)
- ✅ Safari (latest)

Minimum versions:
- Chrome 80+
- Firefox 75+
- Safari 13+

---

## Performance Tips

### Development Mode
```bash
# Frontend runs on webpack dev server
# Hot reload enabled by default
npm run dev

# Access at http://localhost:3001
```

### Production Build
```bash
# Build optimized production bundle
npm run build

# Start production server
npm run start

# Runs on http://localhost:3001
```

### Analyze Bundle Size
```bash
# Install analyzer
npm install --save-dev @next/bundle-analyzer

# Run build analysis
ANALYZE=true npm run build
```

---

## Debugging Tools

### React DevTools
Install browser extension:
- [Chrome Web Store](https://chrome.google.com/webstore/detail/react-developer-tools/fmkadmapgofadopljbjfkapdkoienihi)
- [Firefox Add-ons](https://addons.mozilla.org/en-US/firefox/addon/react-devtools/)

### Useful Commands
```javascript
// In browser console, check auth state
localStorage.getItem('accessToken')

// Check current user
JSON.parse(localStorage.getItem('user'))

// Force re-render (if needed)
window.location.reload()
```

---

## Code Quality

### Linting
```bash
cd frontend
npm run lint
```

### Type Checking
```bash
cd frontend
npx tsc --noEmit
```

### Format Code
```bash
cd frontend
npx prettier --write "src/**/*.{ts,tsx}"
```

---

## Additional Resources

### Documentation Files
- `MODERN_UI_DASHBOARD.md` - Complete feature documentation
- `VISUAL_DESIGN_GUIDE.md` - Visual design specifications
- `REVIEW_AND_MODERNIZATION_SUMMARY.md` - Full review summary

### Component Location
```
frontend/src/
├── app/(dashboard)/
│   └── layout.tsx         # Main layout system
├── components/
│   ├── layout/
│   │   ├── Sidebar.tsx    # Collapsible sidebar
│   │   └── Topbar.tsx     # Enhanced topbar
│   └── ui/
│       └── StatCard.tsx   # Reusable components
└── types/
    └── index.ts           # TypeScript definitions
```

---

## Success Criteria

Your UI is working correctly if:

✅ Sidebar collapses smoothly when clicking toggle  
✅ Different roles show different themes  
✅ Profile dropdown opens with user info  
✅ Cards have hover animations (scale + shadow)  
✅ Navigation filters based on user role  
✅ Mobile menu works with overlay  
✅ Gradients render smoothly  
✅ All transitions feel smooth (300ms)  
✅ No console errors in browser  
✅ TypeScript shows no errors  

---

## Next Steps After Testing

1. **Customize Colors** - Adjust gradients in roleConfigs
2. **Add More Features** - Extend dashboard widgets
3. **Enhance Animations** - Add more micro-interactions
4. **Improve Accessibility** - Add ARIA labels
5. **Add Dark Mode** - Implement theme toggle
6. **Real-time Updates** - WebSocket integration
7. **Advanced Features** - Charts, exports, etc.

---

## Support

If you encounter issues:

1. Check browser console for errors
2. Verify all dependencies are installed
3. Ensure MongoDB is running
4. Check .env files are configured
5. Review documentation files
6. Clear browser cache
7. Restart dev servers

---

## 🎉 You're Ready!

Start the servers and enjoy your modern, role-based leave tracker UI!

```bash
# Terminal 1
cd backend && npm run start:dev

# Terminal 2
cd frontend && npm run dev
```

Open `http://localhost:3001` and experience the transformation! 🚀✨
