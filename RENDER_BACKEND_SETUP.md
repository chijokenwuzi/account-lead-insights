# Render Setup: Separate Account Lead Insights Backend

This creates a second Render service with its own domain for the Team Ad Ops backend UI/API.

## Service target
- URL format: `https://<service-name>.onrender.com`
- Suggested service name: `account-lead-insights-backend`

## 1) Create backend service in Render
1. Open Render Dashboard.
2. Click **New +** -> **Web Service**.
3. Select repo: `account-lead-insights`.
4. Set **Root Directory** to:
   `account-lead-insights-backend`
5. Build Command:
   `npm install`
6. Start Command:
   `npm start`
7. Create service.

## 2) Environment variables (backend service)
Add these in Render -> backend service -> Environment:
- `HOST=0.0.0.0`
- `OPENAI_API_KEY=<your key>`
- `FRONTEND_LANDING_URL=https://account-lead-insights.onrender.com/marketing`
- Optional: `OPENAI_MODEL=gpt-5-mini`

Render provides `PORT` automatically.

## 3) Point frontend Founder Access to new backend domain
In your **frontend** service (`account-lead-insights`), set:
- `FOUNDER_BACKEND_URL=https://account-lead-insights-backend.onrender.com/index.html`

Then redeploy frontend.

## 4) Verify
- Frontend: `https://account-lead-insights.onrender.com/marketing`
- Click **Founder Access Backend**
- Should open: `https://account-lead-insights-backend.onrender.com/index.html`
