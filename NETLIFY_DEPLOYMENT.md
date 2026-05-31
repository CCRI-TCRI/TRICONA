# Netlify Deployment Guide

## Quick Start

Your Lubiri Secondary School Election System is now configured for Netlify deployment.

### Prerequisites
- Netlify account (https://netlify.com)
- GitHub account with this repository
- Supabase account (optional, for database)

## Deployment Steps

### Option 1: Connect via Netlify UI (Recommended)

1. **Go to Netlify Dashboard**
   - Visit https://app.netlify.com
   - Click "Add new site" → "Import an existing project"

2. **Connect GitHub**
   - Select GitHub as your repository provider
   - Authorize Netlify to access your GitHub account
   - Select the TRICONA repository

3. **Configure Build Settings**
   - **Build command:** `npm run build`
   - **Publish directory:** `.next`
   - Click "Deploy site"

4. **Set Environment Variables**
   - After deployment, go to Site Settings → Environment
   - Add the following variables:
     ```
     NEXT_PUBLIC_SUPABASE_URL=<your-supabase-url>
     NEXT_PUBLIC_SUPABASE_ANON_KEY=<your-supabase-key>
     NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=<your-supabase-publishable-key>
     ```

### Option 2: Deploy via Netlify CLI

1. **Install Netlify CLI**
   ```bash
   npm install -g netlify-cli
   ```

2. **Login to Netlify**
   ```bash
   netlify login
   ```

3. **Deploy**
   ```bash
   netlify deploy --prod
   ```

4. **Set Environment Variables**
   ```bash
   netlify env:set NEXT_PUBLIC_SUPABASE_URL your-url
   netlify env:set NEXT_PUBLIC_SUPABASE_ANON_KEY your-key
   netlify env:set NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY your-key
   ```

## Environment Variables Needed

### Required for Full Functionality
- `NEXT_PUBLIC_SUPABASE_URL` - Your Supabase project URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` - Your Supabase anonymous key
- `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` - Your Supabase publishable key

### Without Supabase
The app works in **demo mode** using localStorage if Supabase variables aren't set.

## Features After Deployment

✅ **Student Voting**
- Students can access the ballot using voting codes
- Vote using their registered credentials

✅ **Admin Dashboard**
- Manage voters with voting code generation
- Track election participation in real-time
- View live results (participation data only)

✅ **Live Results Broadcast**
- CNN-style live coverage view
- Shows participation metrics, not actual results
- Animated progress tracking

## Troubleshooting

### Build Fails
- Check Node.js version (14+ required)
- Ensure `npm install` works locally
- Check for TypeScript errors: `npm run build`

### Pages Not Loading
- Check Netlify deploy log for errors
- Verify environment variables are set
- Clear browser cache and reload

### localStorage Not Working
- Netlify uses localStorage fine for demo mode
- For production, connect Supabase database

## Testing Locally Before Deploy

```bash
npm install
npm run build
npm start
```

Visit http://localhost:3000

## Support

- **Netlify Docs:** https://docs.netlify.com/
- **Next.js Netlify Guide:** https://docs.netlify.com/integrations/frameworks/next-js/
- **Your Repository:** CCRI-TCRI/TRICONA on GitHub

## Custom Domain

1. In Netlify Site Settings → Domain Management
2. Click "Add custom domain"
3. Follow domain configuration steps
4. Update your school's DNS records

---

**Your app is ready to deploy!** 🚀
