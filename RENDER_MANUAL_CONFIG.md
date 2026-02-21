# URGENT: Render Dashboard Configuration Required

Render is **NOT** using the `render.yaml` file. You need to manually configure the build settings in the Render dashboard.

## Steps to Fix in Render Dashboard:

### 1. Go to Your Service Settings
1. Open [Render Dashboard](https://dashboard.render.com)
2. Click on your **lms-backend** service
3. Click **"Settings"** in the left sidebar

### 2. Update Build Command
Scroll to **"Build & Deploy"** section and update:

**Build Command:**
```bash
cd backend && npm install --production=false && npm run build
```

**Start Command:**
```bash
cd backend && node dist/main
```

### 3. Save Changes
1. Click **"Save Changes"** at the bottom
2. Render will ask if you want to deploy - click **"Yes, deploy"**

---

## Why This is Needed

Render is auto-detecting your build settings and ignoring `render.yaml`. The auto-detected command uses `npm install` which skips devDependencies when `NODE_ENV=production` is set.

The `--production=false` flag forces npm to install ALL dependencies including `@nestjs/cli`, which is required for the build.

---

## Alternative: Delete and Recreate Service

If the above doesn't work, you may need to:
1. Delete the current service in Render
2. Create a new service
3. When creating, select **"Use render.yaml"** option
4. This will ensure Render uses the configuration from the file

---

## Expected Result

After updating the build command, you should see:
- More packages installed (~600+ instead of 300)
- Build succeeds
- Service starts successfully
