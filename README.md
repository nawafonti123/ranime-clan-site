# RANIME Clan Site - Supabase Ready

## Supabase
1. SQL Editor: شغل ملف `supabase.sql`.
2. Storage: أنشئ Bucket باسم `application-videos` واجعله Public.

## Backend Environment Variables
أضفها في Render أو Vercel:

```env
SUPABASE_URL=https://rzrjpypzamssmggekkws.supabase.co
SUPABASE_SERVICE_ROLE_KEY=YOUR_SECRET_KEY
SUPABASE_BUCKET=application-videos
```

## Frontend Environment Variables
أضفها في Vercel للفرونت:

```env
VITE_API_URL=https://YOUR_BACKEND_URL
```

## Local Run
Backend:
```bash
cd backend
pip install -r requirements.txt
uvicorn main:app --reload
```

Frontend:
```bash
cd frontend
npm install
npm run dev
```
