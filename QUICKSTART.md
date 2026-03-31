# Quick Start Guide

## Prerequisites
- Node.js 18+ installed
- MongoDB running locally on port 27017

## Step-by-Step Setup

### 1. Install Backend Dependencies & Start Server

```bash
cd backend
npm install
cp .env.example .env
# Edit .env with your MongoDB URI and JWT secrets
npm run start:dev
```

Backend runs on http://localhost:3000

### 2. Install Frontend Dependencies & Start Dev Server

Open a new terminal:

```bash
cd frontend
npm install
cp .env.example .env
npm run dev
```

Frontend runs on http://localhost:3001

### 3. Access the Application

1. Open browser: http://localhost:3001
2. Click "Register new organization"
3. Fill in organization details:
   - Organization Name: Your Company
   - Admin Name: Your Name
   - Admin Email: admin@company.com
   - Admin Password: password123
4. Click Register
5. You'll be logged in automatically as Org Admin

### 4. First Steps After Login

1. **Create Leave Types** (optional - pre-configured types may exist)
   - Go to Leave Types
   - Add: Sick Leave, Casual Leave, Earned Leave

2. **Allocate Leave Balances**
   - Go to Users
   - Create an employee user
   - Allocate leave balances for the employee

3. **Apply for Leave** (as employee)
   - Go to Apply Leave
   - Select leave type
   - Choose dates
   - Enter reason
   - Submit

4. **Approve Leave** (as manager/admin)
   - Go to Approvals
   - See pending requests
   - Click Approve or Reject

## Default Test Credentials

After registration:
- Email: The admin email you provided
- Password: The password you set

## Troubleshooting

### Backend won't start
```bash
# Check MongoDB is running
mongod --version

# Start MongoDB (Windows - run as admin)
net start MongoDB
```

### Frontend shows "API Error"
- Ensure backend is running on port 3000
- Check API_URL in frontend/.env matches backend URL

### Can't login
- Verify you registered an organization first
- Check JWT secrets in backend/.env are unique strings
- Clear browser localStorage and try again

## Next Steps

1. Explore all menu items
2. Create different user roles to test permissions
3. Configure holidays for your organization
4. Test approval workflow with manager role
5. View dashboard analytics

---

For detailed documentation, see README.md
