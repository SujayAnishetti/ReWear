# Environment Variables Setup for ReWear

## Required Environment Variables

Your ReWear app needs these environment variables to work properly:

### For Vercel Deployment:

1. **VITE_SUPABASE_URL**
   - Get this from your Supabase Dashboard → Settings → API → Project URL
   - Format: `https://your-project-id.supabase.co`

2. **VITE_SUPABASE_ANON_KEY**
   - Get this from your Supabase Dashboard → Settings → API → anon public
   - Format: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`

## How to Add Environment Variables to Vercel:

1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Select your ReWear project
3. Click **Settings** tab
4. Go to **Environment Variables** section
5. Add both variables with the exact names above
6. Click **Save**
7. Redeploy your project

## For Local Development:

Create a `.env` file in your project root:

```env
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-public-key-here
```

## Troubleshooting White Screen:

If you still see a white screen after adding environment variables:

1. Check the browser console for errors
2. Make sure the environment variable names are exactly as shown
3. Redeploy the project after adding variables
4. Clear browser cache and try again

## Test Credentials:

Once deployed, you can test with these credentials:

- **Demo User**: `demo@rewear.com` / `password123`
- **Admin User**: `admin@rewear.com` / `admin123` 