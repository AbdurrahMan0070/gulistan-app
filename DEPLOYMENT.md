# Deployment Guide

## ✅ GitHub Repository
Your code is now live at: **https://github.com/AbdurrahMan0070/gulistan-app**

## 🚀 Render Deployment

### Option 1: Auto-Deploy (Recommended)
If you haven't connected Render to GitHub yet:

1. Go to [Render Dashboard](https://dashboard.render.com/)
2. Click on your existing **gulistan-app** service
3. Go to **Settings** → **Git**
4. Click **Configure** or **Connect Repository**
5. Select: `AbdurrahMan0070/gulistan-app`
6. Branch: `main`
7. Enable **Auto-Deploy** 
8. Save changes

Now every time you run `deploy.bat`, Render will automatically rebuild and deploy!

### Option 2: Manual Deploy
If your repository is already connected:

1. Go to [Render Dashboard](https://dashboard.render.com/)
2. Click on **gulistan-app** service
3. Click **Manual Deploy** → **Deploy latest commit**
4. Wait for build to complete

### Build Settings
Make sure these are set in Render:
- **Build Command**: `npm install && npm run build`
- **Publish Directory**: `dist`
- **Environment**: Static Site

## 📝 Future Updates

To update your app:
1. Make your code changes
2. Run `deploy.bat` from the project folder
3. If auto-deploy is enabled, Render will automatically update
4. If not, manually deploy from Render dashboard

## 🔗 Live URLs
- **Production**: https://gulistan-app.onrender.com/
- **GitHub**: https://github.com/AbdurrahMan0070/gulistan-app

## 📦 Project Structure
```
gulistan-app-v3/
├── src/
│   ├── components/     # React components
│   ├── screens/        # App screens
│   ├── utils/          # Utilities (db, crypto, translate)
│   ├── App.jsx         # Main app component
│   └── main.jsx        # Entry point
├── public/             # Static assets
├── dist/               # Build output (generated)
├── vite.config.js      # Vite configuration
├── render.yaml         # Render deployment config
└── deploy.bat          # Quick deploy script
```
