# 🛡️ Greatzed LLP — Insurance Aggregator Platform

**Stack:** React + Vite → Netlify | Node.js → Railway | PostgreSQL → Supabase | Payments → Razorpay

---

## 📁 Repository Structure

```
greatzed-platform/
├── frontend/               ← Deploy to Netlify
│   ├── src/
│   │   ├── App.jsx         ← Complete frontend (homepage, 4 products, checkout, admin)
│   │   └── main.jsx        ← React entry point
│   ├── index.html          ← Includes Razorpay SDK script
│   ├── vite.config.js
│   ├── package.json
│   └── netlify.toml        ← Netlify build config
├── backend/                ← Deploy to Railway
│   ├── server.js           ← Express API (Razorpay + Supabase)
│   └── package.json
├── database.sql            ← Run once in Supabase SQL Editor
└── README.md
```

---

## 🚀 DEPLOYMENT — 4 Steps

### STEP 1 — Supabase (Database)

1. Create account at **supabase.com** → New Project → name it `greatzed`
2. Go to **SQL Editor** → New Query → paste entire `database.sql` → click **Run**
3. Go to **Settings → API** and save these 3 values:
   - `SUPABASE_URL`
   - `SUPABASE_ANON_KEY` (for frontend)
   - `SUPABASE_SERVICE_ROLE_KEY` (for backend — keep secret)

---

### STEP 2 — Razorpay (Payments)

1. Create account at **razorpay.com**
2. **Settings → API Keys** → Generate Test Keys → save:
   - `RAZORPAY_KEY_ID` (starts with `rzp_test_`)
   - `RAZORPAY_KEY_SECRET`
3. **Settings → Webhooks** → Add Webhook:
   - URL: `https://YOUR-APP.railway.app/api/razorpay-webhook`
   - Events: ✅ payment.captured ✅ payment.failed
   - Save the webhook secret as `RAZORPAY_WEBHOOK_SECRET`

---

### STEP 3 — Railway (Backend)

1. Go to **railway.app** → New Project → Deploy from GitHub
2. Select this repo, set **Root Directory** to `/backend`
3. Add these **Environment Variables**:

```
PORT=3001
FRONTEND_URL=https://your-site.netlify.app
RAZORPAY_KEY_ID=rzp_test_XXXXXXXXXX
RAZORPAY_KEY_SECRET=your_secret_here
RAZORPAY_WEBHOOK_SECRET=your_webhook_secret_here
SUPABASE_URL=https://xxxx.supabase.co
SUPABASE_SERVICE_ROLE_KEY=eyJhb...
ADMIN_KEY=choose-a-strong-admin-password
```

4. Deploy → copy the generated URL (e.g. `https://greatzed-api.railway.app`)
5. Go back to Razorpay and update the webhook URL with this Railway URL

---

### STEP 4 — Netlify (Frontend)

1. Go to **netlify.com** → Add New Site → Import from GitHub
2. Build settings (auto-detected from `netlify.toml`):
   - Base directory: `frontend`
   - Build command: `npm run build`
   - Publish directory: `dist`
3. Add these **Environment Variables**:

```
VITE_API_URL=https://greatzed-api.railway.app
VITE_RAZORPAY_KEY_ID=rzp_test_XXXXXXXXXX
VITE_SUPABASE_URL=https://xxxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhb...
VITE_ADMIN_KEY=same-strong-admin-password-as-above
```

4. Deploy → your site is live! 🎉

---

## 🔐 Admin Panel

Navigate to your site and hover over the **bottom-right corner** — an "Admin ⚙" button appears.

Or add `/admin` as your page state (the button is intentionally hidden).

- Enter the `ADMIN_KEY` you set in both Railway and Netlify env vars
- View and manage: Leads · Policies · Transactions · Claims

---

## 💳 Test Payments

Use Razorpay test card:
- Card: `4111 1111 1111 1111`
- Expiry: any future date
- CVV: any 3 digits
- OTP: `1234`

---

## ✅ Go-Live Checklist

- [ ] Replace Razorpay **test keys** with **live keys** in Railway + Netlify
- [ ] Complete Razorpay KYC (IRDAI license, GST, bank account)
- [ ] Add custom domain in Netlify → Domain Settings
- [ ] Set up email notifications via [Resend](https://resend.com) (3000 emails/month free)
- [ ] Enable Supabase daily backups (Pro plan)
- [ ] Add Google Analytics 4 in `frontend/index.html`

---

## 💰 Monthly Cost at Scale

| Service | Free Tier | ~10k users/month |
|---------|-----------|-----------------|
| Netlify | 100GB bandwidth | $19/mo |
| Railway | $5 credit | ~$15/mo |
| Supabase | 500MB, 50k MAU | $25/mo |
| Razorpay | — | 2% per transaction |
| **Total** | **₹0** | **~₹5,000/mo** |
