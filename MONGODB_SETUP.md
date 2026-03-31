# MongoDB Setup Guide

Your backend is trying to connect to MongoDB but the connection is being refused. Here's how to fix it:

## ✅ Using MongoDB Compass

Since you're using MongoDB Compass, MongoDB is already installed on your machine!

### Quick Fix:

1. **Open MongoDB Compass**
   - Launch MongoDB Compass from your Start menu
   - You should see a connection screen

2. **Verify Connection**
   - Connection string should be: `mongodb://localhost:27017`
   - Click "Connect"
   - If it connects successfully, MongoDB is running! ✅

3. **Check if Database Exists**
   - In Compass, click on the databases list
   - Look for `leave-tracker` database
   - It will be created automatically when the backend starts

4. **Update .env (Already Done!)**
   ```bash
   MONGODB_URI=mongodb://localhost:27017/leave-tracker
   ```

5. **Restart Backend**
   ```bash
   # Stop current server (Ctrl+C)
   npm run start:dev
   ```

---

## 🔧 If MongoDB Compass Won't Connect

### Error: "connect ECONNREFUSED"

**MongoDB service is not running.**

#### Solution 1: Start MongoDB Service

```bash
# Check if MongoDB service exists
net start MongoDB

# If service doesn't exist, start manually:
mongod --dbpath "C:\data\db"
```

#### Solution 2: Create Data Directory (if needed)

```bash
# Create directory for MongoDB data
mkdir C:\data\db

# Then start MongoDB
mongod --dbpath "C:\data\db"
```

#### Solution 3: Use MongoDB Compass GUI

1. Open MongoDB Compass
2. Click "New Connection"
3. Enter: `mongodb://localhost:27017`
4. Click "Connect"
5. If successful, MongoDB is running!

---

## 🎯 Other Options (For Reference)

### Option 1: MongoDB Atlas (Cloud - FREE)

**No installation required! Alternative if local MongoDB has issues.**

#### Step-by-Step Setup:

1. **Create Account**
   - Go to: https://www.mongodb.com/cloud/atlas/register
   - Sign up for free (no credit card required)

2. **Create Free Cluster**
   - Click "Build a Database"
   - Choose **FREE** tier (M0 Sandbox)
   - Select a region close to you
   - Click "Create Cluster"

3. **Setup Database User**
   - Click "Database Access" in left sidebar
   - Click "Add New Database User"
   - Create username and password (save these!)
   - Grant "Read and write to any database" permission
   - Click "Add User"

4. **Whitelist Your IP**
   - Click "Network Access" in left sidebar
   - Click "Add IP Address"
   - Click "Allow Access from Anywhere" (for development)
   - Click "Confirm"

5. **Get Connection String**
   - Click "Database" in left sidebar
   - Click "Connect" on your cluster
   - Choose "Connect your application"
   - Copy the connection string
   - It looks like: `mongodb+srv://myuser:<password>@cluster0.xxxxx.mongodb.net/`

6. **Update .env file**
   ```bash
   MONGODB_URI=mongodb+srv://myuser:MyPassword123@cluster0.xxxxx.mongodb.net/leave-tracker?retryWrites=true&w=majority
   ```
   - Replace `<password>` with your actual password
   - Replace `cluster0.xxxxx` with your actual cluster URL

7. **Restart Backend**
   ```bash
   # Stop the current server (Ctrl+C)
   npm run start:dev
   ```

✅ **Done!** Your backend should now connect successfully.

---

### Option 2: Local MongoDB Installation

**Requires installation on your machine.**

#### For Windows:

1. **Download MongoDB Community Server**
   - Go to: https://www.mongodb.com/try/download/community
   - Download Windows version
   - Run the installer (choose "Complete" installation)

2. **Start MongoDB Service**
   ```bash
   # Check if service exists
   net start MongoDB
   
   # If not found, start manually:
   mongod --dbpath "C:\data\db"
   ```

3. **Create Data Directory** (if needed)
   ```bash
   mkdir C:\data\db
   ```

4. **Verify Connection**
   Your `.env` should have:
   ```bash
   MONGODB_URI=mongodb://localhost:27017/leave-tracker
   ```

5. **Restart Backend**
   ```bash
   npm run start:dev
   ```

---

## 🔍 Troubleshooting

### Error: "connect ECONNREFUSED ::1:27017"

**Cause**: MongoDB is not running or not installed.

**Solution**: Use MongoDB Atlas (Option 1) or install/start MongoDB locally.

### Error: "Authentication failed"

**Cause**: Wrong username/password in connection string.

**Solution**: 
- Double-check credentials in MongoDB Atlas
- Make sure password doesn't contain special characters without encoding
- Try resetting the database user password

### Error: "IP whitelist"

**Cause**: Your IP address is not whitelisted in MongoDB Atlas.

**Solution**:
- Go to Network Access in Atlas
- Add `0.0.0.0/0` (allow from anywhere) for development
- Or add your specific IP address

---

## ✅ Verify Connection

After setup, you should see:
```
[Nest] XXXXX  - [timestamp]     LOG [NestFactory] Starting Nest application...
[Nest] XXXXX  - [timestamp]     LOG [InstanceLoader] MongooseModule dependencies initialized
[Nest] XXXXX  - [timestamp]     LOG [RoutesResolver] AuthController {/auth}:
```

No more "Unable to connect to the database" errors! 🎉

---

## 📝 Current Configuration

Your current `.env` file has both options documented. Uncomment the one you want to use:

```bash
# For Atlas (cloud):
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/leave-tracker

# OR for local:
# MONGODB_URI=mongodb://localhost:27017/leave-tracker
```

---

## 🚀 Next Steps After MongoDB Setup

Once MongoDB is connected:

1. **Register an Organization**
   ```bash
   POST http://localhost:3000/auth/register-org
   {
     "name": "My Company",
     "email": "admin@company.com",
     "password": "admin123"
   }
   ```

2. **Login and test the API**

3. **Start using the frontend** at http://localhost:3001

---

**Need help?** Check the main README.md for complete API documentation!
