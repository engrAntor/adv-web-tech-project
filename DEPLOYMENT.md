# Deployment Quick Start

Follow these steps in order to deploy your LMS platform to production.

## Step 1: Create Supabase Database

1. Go to [supabase.com](https://supabase.com) and create a new project
2. Save your database password
3. Go to Settings → Database → Connection String
4. Copy the **Connection pooling** URI (port 6543)
5. Replace `[YOUR-PASSWORD]` with your password

## Step 2: Deploy Backend to Render

1. Go to [render.com](https://render.com)
2. Click "New +" → "Web Service"
3. Connect your GitHub repository
4. Render will auto-detect `render.yaml` configuration
5. Add environment variables in Render dashboard:
   - `DATABASE_URL` = Your Supabase connection string
   - `FRONTEND_URL` = (leave empty for now, add after deploying frontend)
   - `GEMINI_API_KEY` = Your Gemini API key
6. Click "Create Web Service"
7. Wait for deployment (~5-10 minutes)
8. Copy your Render URL (e.g., `https://lms-backend.onrender.com`)

## Step 3: Run Database Migrations

1. In Render dashboard, go to your service
2. Click "Shell" tab
3. Run: `cd backend && npm run typeorm migration:run`

## Step 4: Deploy Frontend to Netlify

1. Go to [netlify.com](https://netlify.com)
2. Click "Add new site" → "Import an existing project"
3. Connect to GitHub and select your repository
4. Netlify will auto-detect `netlify.toml` configuration
5. Add environment variable:
   - `NEXT_PUBLIC_API_URL` = Your Render backend URL
6. Click "Deploy site"
7. Copy your Netlify URL (e.g., `https://your-app.netlify.app`)

## Step 5: Update Backend CORS

1. Go back to Render dashboard
2. Add environment variable:
   - `FRONTEND_URL` = Your Netlify URL
3. Trigger manual deploy to apply changes

## Step 6: Test Your Deployment

Visit your Netlify URL and test:
- [ ] Homepage loads
- [ ] User registration works
- [ ] Login works
- [ ] Browse courses
- [ ] Enroll in a course

## Troubleshooting

- **Backend won't start**: Check Render logs for errors
- **Database connection fails**: Verify DATABASE_URL is correct
- **Frontend can't connect**: Check CORS and NEXT_PUBLIC_API_URL
- **Cold starts**: Free tier services sleep after 15min inactivity

For detailed instructions, see [deployment_guide.md](file:///C:/Users/Antor%20Chandra%20Das/.gemini/antigravity/brain/b1d5639f-882a-4508-97f1-2be5bfd2d4c1/deployment_guide.md)
