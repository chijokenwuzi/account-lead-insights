# Account Lead Insights

Home-services lead generation product (HVAC, plumbing, roofing, electrical, solar) with:
- marketing landing + lead-gen setup flow
- owner lead tracker demo
- founder backend access link
- account insights workspace routes under `/account-lead-insights/*`

## Run locally

```bash
cd "/Users/chijokenwuzi/Documents/Account Lead Insights"
npm start
```

Then open:
- http://127.0.0.1:9091/marketing
- http://127.0.0.1:9091/account-lead-insights

## Route summary

- `/marketing` -> home services marketing landing
- `/marketing-lead-gen` -> lead generation flow
- `/marketing-lead-tracker` -> example owner dashboard
- `/account-lead-insights` -> Account Lead Insights main app
- `/account-lead-insights/workspace` -> workspace

Legacy routes (like `/login`, `/workspace`, `/features`) redirect to branded `/account-lead-insights/*` routes.

## Separate backend service

This repo now includes a standalone backend workspace at:
- `account-lead-insights-backend/`

Deploy that folder as a second Render Web Service to get a fully separate backend domain.
See:
- `RENDER_BACKEND_SETUP.md`
