# Render Setup (New Project)

## 1) Create a new GitHub repo
Create a new repo named: `account-lead-insights`

## 2) Push this folder to that repo

```bash
cd "/Users/chijokenwuzi/Documents/Account Lead Insights"
git init
git add .
git commit -m "Initial Account Lead Insights"
git branch -M main
git remote add origin https://github.com/<your-username>/account-lead-insights.git
git push -u origin main
```

## 3) Create a new Render Web Service
- Render Dashboard -> New + -> Web Service
- Connect the new `account-lead-insights` GitHub repo
- Name: `account-lead-insights`
- Environment: `Node`
- Build Command: `npm install`
- Start Command: `npm start`

## 4) Environment variables in Render
Set these if needed:
- `PORT` (Render injects this automatically)
- `HOST=0.0.0.0`
- `FOUNDER_BACKEND_URL` (optional, for founder backend button)

## 5) Deploy and test
Open:
- `https://<your-render-service>.onrender.com/marketing`
- `https://<your-render-service>.onrender.com/account-lead-insights`
