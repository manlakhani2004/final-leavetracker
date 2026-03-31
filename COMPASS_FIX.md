# MongoDB Compass Connection Fix

## 🚀 Quick Steps to Fix Connection Error

### Step 1: Check MongoDB Service Status

Open PowerShell or Command Prompt as Administrator and run:

```bash
net start MongoDB
```

**If you see:** "The MongoDB service is starting..." → ✅ Good! Wait a few seconds.

**If you see:** "The MongoDB service was not found" → MongoDB isn't installed as a service. Go to Step 2.

---

### Step 2: Start MongoDB Manually

```bash
# Create data directory if it doesn't exist
mkdir C:\data\db

# Start MongoDB manually
mongod --dbpath "C:\data\db"
```

Keep this terminal window open while developing!

---

### Step 3: Verify with MongoDB Compass

1. **Open MongoDB Compass**
2. **Connection String**: `mongodb://localhost:27017`
3. **Click "Connect"**

✅ **Success!** If you can connect in Compass, the backend will work too.

❌ **Still failing?** Try these:

#### Fix #1: Check Port

Make sure no other application is using port 27017:
```bash
netstat -ano | findstr :27017
```

#### Fix #2: Use IPv4 instead of IPv6

Update `.env` to use `127.0.0.1` instead of `localhost`:
```bash
MONGODB_URI=mongodb://127.0.0.1:27017/leave-tracker
```

This avoids IPv6 resolution issues on Windows.

#### Fix #3: Check MongoDB Installation

Find where MongoDB is installed:
```bash
where mongod
```

Typical location: `C:\Program Files\MongoDB\Server\X.X\bin\mongod.exe`

---

### Step 4: Restart Backend

After MongoDB is running:

```bash
# Stop current server (Ctrl+C)
# Then restart:
npm run start:dev
```

You should now see:
```
[Nest] XXXXX  - [timestamp]     LOG MongooseModule dependencies initialized
[Nest] XXXXX  - [timestamp]     LOG Nest application successfully started
```

---

## 🔍 Verify Database Creation

Once the backend starts successfully:

1. **Open MongoDB Compass**
2. **Refresh databases list**
3. **Look for `leave-tracker` database**
4. **Click on it** - you'll see collections being created:
   - organizations
   - users
   - leave_types
   - leave_balances
   - leave_applications
   - holidays

---

## 💡 Common Issues & Solutions

### Issue: "Cannot connect to localhost"

**Solution**: Use IP address instead
```bash
MONGODB_URI=mongodb://127.0.0.1:27017/leave-tracker
```

### Issue: "MongoDB service won't start"

**Solution**: Run as Administrator
```bash
# In Administrator PowerShell
Start-Service MongoDB
```

### Issue: "Port already in use"

**Solution**: Find and kill the process using port 27017
```bash
# Find process ID
netstat -ano | findstr :27017

# Kill process (replace PID with actual number)
taskkill /PID <PID> /F
```

### Issue: "Data directory not found"

**Solution**: Create the directory
```bash
mkdir C:\data\db
```

---

## ✅ Success Checklist

- [ ] MongoDB Compass connects to `mongodb://localhost:27017`
- [ ] Backend starts without "Unable to connect" errors
- [ ] `leave-tracker` database appears in Compass
- [ ] Collections are created automatically
- [ ] You can access http://localhost:3000/api endpoints

---

## 🎯 Next: Test Your Application

Once connected successfully:

1. **Register Organization**
   ```bash
   POST http://localhost:3000/auth/register-org
   {
     "name": "My Company",
     "email": "admin@company.com",
     "password": "admin123"
   }
   ```

2. **Check in Compass** - You should see the organization document created!

3. **Login**
   ```bash
   POST http://localhost:3000/auth/login
   {
     "email": "admin@company.com",
     "password": "admin123"
   }
   ```

4. **Start using the frontend** at http://localhost:3001

---

**Need more help?** Check `MONGODB_SETUP.md` for detailed instructions!
