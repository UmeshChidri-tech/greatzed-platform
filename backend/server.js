// ============================================================
// GREATZED LLP — Backend API
// Runtime: Node.js 20  |  Deploy: Railway
// ============================================================
import express from "express";
import cors from "cors";
import crypto from "crypto";
import Razorpay from "razorpay";
import { createClient } from "@supabase/supabase-js";

const app = express();

// ── CORS ─────────────────────────────────────────────────────────
const allowed = [
  process.env.FRONTEND_URL || "https://greatzed.netlify.app",
  "http://localhost:5173",
  "http://localhost:3000",
];
app.use(cors({
  origin: (origin, cb) => (!origin || allowed.includes(origin)) ? cb(null, true) : cb(new Error("CORS: " + origin)),
  credentials: true,
}));

// ── Body parsing (raw for webhook, json for everything else) ─────
app.use((req, _, next) => {
  if (req.path === "/api/razorpay-webhook") return next();
  express.json()(req, _, next);
});

// ── Clients ───────────────────────────────────────────────────────
const razorpay = new Razorpay({
  key_id:     process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

// SERVICE_ROLE bypasses RLS — required for all server-side DB writes
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

// ── Admin auth middleware ─────────────────────────────────────────
const adminAuth = (req, res, next) => {
  const key = req.headers["x-admin-key"];
  if (key !== process.env.ADMIN_KEY) return res.status(401).json({ error: "Unauthorized" });
  next();
};

// ─────────────────────────────────────────────────────────────────
// HEALTH CHECK
// ─────────────────────────────────────────────────────────────────
app.get("/", (_, res) =>
  res.json({ status: "Greatzed API running ✅", version: "1.0.0" })
);

// ─────────────────────────────────────────────────────────────────
// 1. CREATE RAZORPAY ORDER
// ─────────────────────────────────────────────────────────────────
app.post("/api/create-order", async (req, res) => {
  try {
    const { amount, planId, userId } = req.body;
    if (!amount || !planId) return res.status(400).json({ error: "amount and planId required" });

    const order = await razorpay.orders.create({
      amount:   Math.round(Number(amount) * 100), // paise
      currency: "INR",
      receipt:  `gz_${Date.now()}`,
      notes:    { planId, userId: userId || "guest" },
    });

    await supabase.from("transactions").insert({
      razorpay_order_id: order.id,
      plan_id:           planId,
      amount:            Number(amount),
      currency:          "INR",
      status:            "pending",
      user_id:           userId || null,
    });

    res.json({ orderId: order.id, amount: order.amount, currency: order.currency });
  } catch (err) {
    console.error("create-order:", err.message);
    res.status(500).json({ error: err.message });
  }
});

// ─────────────────────────────────────────────────────────────────
// 2. VERIFY PAYMENT + ISSUE POLICY
// ─────────────────────────────────────────────────────────────────
app.post("/api/verify-payment", async (req, res) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, planId, userDetails } = req.body;

    // Verify Razorpay HMAC signature
    const expected = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest("hex");

    if (expected !== razorpay_signature)
      return res.status(400).json({ error: "Payment signature verification failed" });

    const policyNo = `GZ-${Date.now().toString().slice(-8)}`;

    // Save policy
    const { data: policy, error: pErr } = await supabase.from("policies").insert({
      policy_number:       policyNo,
      plan_id:             planId,
      razorpay_order_id,
      razorpay_payment_id,
      status:              "active",
      holder_name:         userDetails.name,
      holder_email:        userDetails.email,
      holder_phone:        userDetails.phone,
      holder_dob:          userDetails.dob || null,
      nominee:             userDetails.nominee || null,
      issued_at:           new Date().toISOString(),
      expires_at:          new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(),
    }).select().single();

    if (pErr) throw pErr;

    // Mark transaction paid
    await supabase.from("transactions")
      .update({ status: "paid", razorpay_payment_id, updated_at: new Date().toISOString() })
      .eq("razorpay_order_id", razorpay_order_id);

    // Upsert user
    await supabase.from("users").upsert(
      { email: userDetails.email, phone: userDetails.phone, full_name: userDetails.name, updated_at: new Date().toISOString() },
      { onConflict: "email" }
    );

    // TODO: send email via Resend — npm install resend
    // import { Resend } from 'resend';
    // const resend = new Resend(process.env.RESEND_API_KEY);
    // await resend.emails.send({ from:"policies@greatzed.com", to:userDetails.email,
    //   subject:`Policy ${policyNo} Issued — Greatzed`,
    //   html:`<p>Your policy <b>${policyNo}</b> is now active.</p>` });

    res.json({ success: true, policyNumber: policyNo, policyId: policy.id });
  } catch (err) {
    console.error("verify-payment:", err.message);
    res.status(500).json({ error: err.message });
  }
});

// ─────────────────────────────────────────────────────────────────
// 3. RAZORPAY WEBHOOK (async events — must use raw body)
// ─────────────────────────────────────────────────────────────────
app.post("/api/razorpay-webhook",
  express.raw({ type: "application/json" }),
  async (req, res) => {
    const sig  = req.headers["x-razorpay-signature"];
    const hash = crypto.createHmac("sha256", process.env.RAZORPAY_WEBHOOK_SECRET)
      .update(req.body.toString()).digest("hex");
    if (hash !== sig) return res.status(400).send("Invalid signature");

    const event = JSON.parse(req.body.toString());
    const entity = event.payload?.payment?.entity || {};

    if (event.event === "payment.captured") {
      await supabase.from("transactions")
        .update({ status: "paid", razorpay_payment_id: entity.id, updated_at: new Date().toISOString() })
        .eq("razorpay_order_id", entity.order_id);
    }
    if (event.event === "payment.failed") {
      await supabase.from("transactions")
        .update({ status: "failed", updated_at: new Date().toISOString() })
        .eq("razorpay_order_id", entity.order_id);
    }
    res.json({ received: true });
  }
);

// ─────────────────────────────────────────────────────────────────
// 4. USER POLICIES
// ─────────────────────────────────────────────────────────────────
app.get("/api/policies/:email", async (req, res) => {
  const { data, error } = await supabase.from("policies")
    .select("*").eq("holder_email", decodeURIComponent(req.params.email))
    .order("issued_at", { ascending: false });
  if (error) return res.status(500).json({ error: error.message });
  res.json({ policies: data });
});

// ─────────────────────────────────────────────────────────────────
// 5. LEAD / CALLBACK
// ─────────────────────────────────────────────────────────────────
app.post("/api/lead", async (req, res) => {
  const { name, phone, email, product, details } = req.body;
  if (!phone) return res.status(400).json({ error: "phone required" });
  const { error } = await supabase.from("leads")
    .insert({ name, phone, email, product, details: details || {}, status: "new" });
  if (error) return res.status(500).json({ error: error.message });
  res.json({ success: true, message: "We'll call you back within 30 minutes!" });
});

// ─────────────────────────────────────────────────────────────────
// 6. FILE A CLAIM
// ─────────────────────────────────────────────────────────────────
app.post("/api/claims", async (req, res) => {
  const { policyNumber, incidentDate, claimType, description, amountClaimed } = req.body;
  if (!policyNumber) return res.status(400).json({ error: "policyNumber required" });

  const { data: pol } = await supabase.from("policies")
    .select("id").eq("policy_number", policyNumber).single();
  if (!pol) return res.status(404).json({ error: "Policy not found" });

  const claimNo = `CLM-${Date.now().toString().slice(-8)}`;
  const { data, error } = await supabase.from("claims").insert({
    policy_id: pol.id, claim_number: claimNo,
    incident_date: incidentDate, claim_type: claimType,
    description, amount_claimed: amountClaimed || null, status: "submitted",
  }).select().single();

  if (error) return res.status(500).json({ error: error.message });
  res.json({ success: true, claimNumber: claimNo, claim: data });
});

// ─────────────────────────────────────────────────────────────────
// 7. ADMIN ENDPOINTS (protected by x-admin-key header)
// ─────────────────────────────────────────────────────────────────
app.get("/api/admin/leads",        adminAuth, async (_, res) => {
  const { data } = await supabase.from("leads").select("*").order("created_at", { ascending: false }).limit(200);
  res.json({ leads: data || [] });
});

app.get("/api/admin/policies",     adminAuth, async (_, res) => {
  const { data } = await supabase.from("policies").select("*").order("issued_at", { ascending: false }).limit(200);
  res.json({ policies: data || [] });
});

app.get("/api/admin/transactions", adminAuth, async (_, res) => {
  const { data } = await supabase.from("transactions").select("*").order("created_at", { ascending: false }).limit(200);
  res.json({ transactions: data || [] });
});

app.get("/api/admin/claims",       adminAuth, async (_, res) => {
  const { data } = await supabase.from("claims").select("*").order("created_at", { ascending: false }).limit(200);
  res.json({ claims: data || [] });
});

// Update lead status
app.patch("/api/admin/leads/:id",  adminAuth, async (req, res) => {
  const { status } = req.body;
  const { data, error } = await supabase.from("leads").update({ status }).eq("id", req.params.id).select().single();
  if (error) return res.status(500).json({ error: error.message });
  res.json({ lead: data });
});

// Update claim status
app.patch("/api/admin/claims/:id", adminAuth, async (req, res) => {
  const { status, amount_settled } = req.body;
  const { data, error } = await supabase.from("claims")
    .update({ status, amount_settled, updated_at: new Date().toISOString() })
    .eq("id", req.params.id).select().single();
  if (error) return res.status(500).json({ error: error.message });
  res.json({ claim: data });
});

// ── Start ─────────────────────────────────────────────────────────
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => console.log(`✅ Greatzed API on port ${PORT}`));
