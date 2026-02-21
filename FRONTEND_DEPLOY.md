# Production Environment Variables for Frontend

## Required Environment Variables for Netlify

Copy these to Netlify → Site Settings → Environment Variables:

```bash
# Backend API URL
NEXT_PUBLIC_API_URL=https://lms-backend-kc25.onrender.com

# Chatbot API URL  
NEXT_PUBLIC_CHATBOT_API_URL=https://lms-chatbot-xxxx.onrender.com

# Stripe (if using payments)
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=your-stripe-key-if-needed

# Site URL (update after deployment)
NEXT_PUBLIC_SITE_URL=https://your-app.netlify.app
```

## Deployment Steps

### 1. Update Backend CORS
After getting Netlify URL, add it to backend's `ALLOWED_ORIGINS` in Render:
- Go to Render → lms-backend → Environment
- Update `ALLOWED_ORIGINS` to include: `https://your-app.netlify.app`

### 2. Update Chatbot CORS
- Go to Render → lms-chatbot → Environment  
- Update `ALLOWED_HOSTS` to include: `your-app.netlify.app`
- Update `FRONTEND_URL` to: `https://your-app.netlify.app`

### 3. Deploy to Netlify
1. Go to https://app.netlify.com/
2. Click "Add new site" → "Import an existing project"
3. Connect GitHub: `engrAntor/adv-web-tech-project`
4. Configure:
   - **Base directory**: `frontend`
   - **Build command**: `npm run build`
   - **Publish directory**: `frontend/out`
5. Add environment variables (from above)
6. Deploy!

## Post-Deployment Checklist
- [ ] Test login/signup
- [ ] Test course browsing
- [ ] Test chatbot
- [ ] Test all major features
- [ ] Update backend CORS settings
