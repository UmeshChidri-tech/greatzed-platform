import { useState, useEffect } from "react";

/* ================================================================
   GREATZED LLP — Insurance Aggregator Platform
   Design: GoDigit-inspired — Bold, Fresh, Human, Trustworthy
   Font:   Plus Jakarta Sans + DM Sans
   Colors: Deep Teal #0B4D4A · Lime #C8F04C · Coral #FF6B5B
   ================================================================ */

const API = import.meta.env.VITE_API_URL || "http://localhost:3001";
const RZP_KEY = import.meta.env.VITE_RAZORPAY_KEY_ID || "";

// ── DESIGN TOKENS ────────────────────────────────────────────────
const T = {
  teal:"#0B4D4A", tealMid:"#0F6B66", tealLt:"#E8F5F4",
  lime:"#C8F04C", limeDk:"#A8CC35",
  coral:"#FF6B5B", amber:"#FFB830",
  ink:"#0D1B1A", slate:"#4A5E5C", mist:"#97AFAD",
  paper:"#F5FAF9", white:"#FFFFFF", border:"#DCE9E8",
};

// ── DATA ─────────────────────────────────────────────────────────
const PRODUCTS = [
  { key:"car",    emoji:"🚗", label:"Car Insurance",
    color:"#4FC3F7", bg:"#E8F7FF", dark:"#1565C0",
    tag:"Renew in 2 min", from:"₹2,094/yr",
    blurb:"Comprehensive cover with zero dep & engine protect",
    stats:["6,500+ Garages","Instant Claims","Zero Dep"] },
  { key:"health", emoji:"🏥", label:"Health Insurance",
    color:"#56C58A", bg:"#EDFBF3", dark:"#1B6B3A",
    tag:"1 Cr cover available", from:"₹12,800/yr",
    blurb:"Cashless treatment at 13,000+ hospitals",
    stats:["13,000+ Hospitals","No Room Rent Cap","Day 1 Cover"] },
  { key:"life",   emoji:"🛡️", label:"Term Life",
    color:"#B17EF5", bg:"#F3EDFF", dark:"#4527A0",
    tag:"₹1Cr @ ₹740/mo", from:"₹8,900/yr",
    blurb:"Secure your family's future with India's best term plans",
    stats:["99.1% Claim Ratio","Till Age 85","Tax Benefit 80C"] },
  { key:"travel", emoji:"✈️", label:"Travel Insurance",
    color:"#FFB830", bg:"#FFF8E6", dark:"#7B5B00",
    tag:"150+ countries", from:"₹1,200/trip",
    blurb:"Medical emergencies, trip cancellations covered",
    stats:["$2L Medical","Trip Cancel","24×7 Support"] },
];

const INSURERS = {
  hdfc: { name:"HDFC Ergo",     abbr:"HE", claimR:"98.5%", color:"#003087" },
  icici:{ name:"ICICI Lombard", abbr:"IL", claimR:"97.9%", color:"#E67300" },
  bajaj:{ name:"Bajaj Allianz", abbr:"BA", claimR:"96.8%", color:"#003DA5" },
  tata: { name:"Tata AIG",      abbr:"TA", claimR:"99.1%", color:"#C8102E" },
  star: { name:"Star Health",   abbr:"SH", claimR:"95.4%", color:"#00843D" },
  niva: { name:"Niva Bupa",     abbr:"NB", claimR:"97.2%", color:"#7B2D8B" },
};

const PLANS = {
  car:[
    {id:"c1",insurer:"hdfc", name:"Comprehensive Plus", type:"Comprehensive",premium:8499, orig:10200,
     features:["Zero Depreciation","Engine Protection","Roadside Assistance","PA Cover ₹15L"],
     idv:"₹6,50,000",network:"6,500+ Garages",rating:4.5,popular:true},
    {id:"c2",insurer:"icici",name:"Motor Shield",       type:"Comprehensive",premium:7899, orig:9500,
     features:["Zero Depreciation","24×7 Assistance","PA Cover ₹15L","Towing Cover"],
     idv:"₹6,50,000",network:"7,200+ Garages",rating:4.4,popular:false},
    {id:"c3",insurer:"tata", name:"AutoSecure Elite",   type:"Comprehensive",premium:9299, orig:11000,
     features:["Zero Depreciation","Engine Protect","Consumables","Return to Invoice"],
     idv:"₹6,60,000",network:"5,800+ Garages",rating:4.6,popular:false},
    {id:"c4",insurer:"bajaj",name:"Drive Smart TP",     type:"Third Party",  premium:2094, orig:2094,
     features:["Third Party Liability","PA Cover ₹15L","Legal Liability","Compliance"],
     idv:"N/A",network:"Nationwide",rating:4.2,popular:false},
  ],
  health:[
    {id:"h1",insurer:"star", name:"Family Health Optima",type:"Family Floater",premium:18500,orig:22000,
     features:["Sum Insured ₹10L","No Room Rent Limit","Daycare Procedures","Pre-Post Hosp."],
     coverage:"₹10 Lakhs",network:"12,000+ Hospitals",rating:4.5,popular:true},
    {id:"h2",insurer:"niva", name:"ReAssure 2.0",        type:"Individual",   premium:12800,orig:15000,
     features:["Sum Insured ₹5L","Unlimited Restore","No Sub-Limits","AYUSH Cover"],
     coverage:"₹5 Lakhs", network:"10,000+ Hospitals",rating:4.4,popular:false},
    {id:"h3",insurer:"hdfc", name:"Optima Secure",       type:"Family Floater",premium:24500,orig:28000,
     features:["Sum Insured ₹15L","Secure Benefit 2×","Mental Health","Home Care"],
     coverage:"₹15 Lakhs",network:"13,000+ Hospitals",rating:4.7,popular:false},
  ],
  life:[
    {id:"l1",insurer:"hdfc", name:"Click 2 Protect Super",type:"Term Life",premium:9800, orig:11500,
     features:["Cover ₹1 Crore","Till Age 85","Terminal Illness","Tax Benefit 80C"],
     sum:"₹1 Crore",term:"30 Years",rating:4.5,popular:true},
    {id:"l2",insurer:"icici",name:"iProtect Smart",       type:"Term Life",premium:8900, orig:10800,
     features:["Cover ₹1 Crore","Till Age 85","Life Stage Benefit","Survival Payout"],
     sum:"₹1 Crore",term:"30 Years",rating:4.4,popular:false},
    {id:"l3",insurer:"tata", name:"Sampoorna Raksha",     type:"Term Life",premium:10200,orig:12000,
     features:["Cover ₹1 Crore","Till Age 85","Return of Premium","Joint Life"],
     sum:"₹1 Crore",term:"30 Years",rating:4.6,popular:false},
  ],
  travel:[
    {id:"t1",insurer:"bajaj",name:"Travel Companion",  type:"International",premium:1800,orig:2200,
     features:["Medical $1,00,000","Trip Cancellation","Baggage Loss","Passport Loss"],
     coverage:"$1,00,000",days:"15 Days",rating:4.3,popular:true},
    {id:"t2",insurer:"tata", name:"Travel Guard Elite",type:"International",premium:2100,orig:2500,
     features:["Medical $2,00,000","Emergency Evacuation","Personal Liability","24×7 Help"],
     coverage:"$2,00,000",days:"15 Days",rating:4.6,popular:false},
    {id:"t3",insurer:"icici",name:"Travel Shield",     type:"Asia Pacific", premium:1200,orig:1500,
     features:["Medical $50,000","Trip Delay","Baggage Delay","Flight Cancel"],
     coverage:"$50,000",  days:"15 Days",rating:4.2,popular:false},
  ],
};

const TESTIMONIALS = [
  {name:"Rahul Mehta",  city:"Mumbai",   product:"Car",    rating:5,av:"RM",
   text:"Claim settled in 3 hours flat. Zero Depreciation was worth every rupee. Greatzed made it effortless."},
  {name:"Priya Sharma", city:"Bengaluru",product:"Health", rating:5,av:"PS",
   text:"Saved ₹4,500 on my family floater. Cashless admission was seamless. Best platform in India."},
  {name:"Aditya Kumar", city:"Delhi",    product:"Life",   rating:5,av:"AK",
   text:"Policy issued in 15 minutes, no medical tests. The advisor walked me through every detail patiently."},
  {name:"Neha Joshi",   city:"Pune",     product:"Travel", rating:4,av:"NJ",
   text:"Medical emergency in Paris — claim approved remotely in 4 hours. Truly life-saving coverage."},
];

const FAQ_DATA = [
  {q:"Is Greatzed IRDAI registered?",
   a:"Yes. Greatzed LLP is a licensed insurance web aggregator registered with IRDAI (Reg. WBA-XXXX). We only partner with IRDAI-approved insurers."},
  {q:"How does free comparison work?",
   a:"We aggregate real-time quotes from 30+ insurer APIs, rank them by value, claim ratio, and network — no bias, no hidden promotions."},
  {q:"Is Razorpay payment safe?",
   a:"All payments go through Razorpay's PCI-DSS compliant gateway with 256-bit SSL. We never store card data. Policies are issued directly by the insurer."},
  {q:"What is the free-look period?",
   a:"All plans include a 15-day free-look period per IRDAI rules. Cancel within 15 days for a prorated refund."},
  {q:"How does Greatzed earn?",
   a:"We earn a referral commission from insurers — this never changes the premium you see. Our comparison is always 100% neutral."},
];

// ── GLOBAL STYLES ────────────────────────────────────────────────
const STYLES = `
  @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800;900&family=DM+Sans:wght@400;500;600&display=swap');
  *,*::before,*::after{margin:0;padding:0;box-sizing:border-box}
  html{scroll-behavior:smooth}
  body{font-family:'DM Sans',sans-serif;background:#F5FAF9;color:#0D1B1A;-webkit-font-smoothing:antialiased}
  button,input,select,textarea{font-family:inherit}
  ::-webkit-scrollbar{width:5px}
  ::-webkit-scrollbar-thumb{background:#ccc;border-radius:3px}
  @keyframes fadeUp{from{opacity:0;transform:translateY(24px)}to{opacity:1;transform:translateY(0)}}
  @keyframes fadeIn{from{opacity:0}to{opacity:1}}
  @keyframes spin{to{transform:rotate(360deg)}}
  @keyframes float{0%,100%{transform:translateY(0)}50%{transform:translateY(-8px)}}
  @keyframes ticker{0%{transform:translateX(0)}100%{transform:translateX(-50%)}}
  @keyframes gradShift{0%,100%{background-position:0% 50%}50%{background-position:100% 50%}}
  @keyframes pulse{0%,100%{opacity:1}50%{opacity:.5}}
  .fadeUp{animation:fadeUp .5s cubic-bezier(.22,1,.36,1) both}
  .fadeUp2{animation:fadeUp .5s cubic-bezier(.22,1,.36,1) .1s both}
  .fadeUp3{animation:fadeUp .5s cubic-bezier(.22,1,.36,1) .2s both}
  .fadeUp4{animation:fadeUp .5s cubic-bezier(.22,1,.36,1) .3s both}
  .hover-lift{transition:transform .2s ease,box-shadow .2s ease;cursor:pointer}
  .hover-lift:hover{transform:translateY(-4px);box-shadow:0 16px 48px rgba(11,77,74,.12)!important}
  .btn-press{transition:transform .12s ease}
  .btn-press:hover{transform:scale(1.02)}
  .btn-press:active{transform:scale(.97)}
  input:focus,select:focus{outline:none;border-color:#0B4D4A!important;box-shadow:0 0 0 3px rgba(11,77,74,.12)!important}
  .ticker-wrap{overflow:hidden;white-space:nowrap}
  .ticker-inner{display:inline-flex;animation:ticker 30s linear infinite}
`;

// ── TINY COMPONENTS ──────────────────────────────────────────────
const Stars = ({n=5})=>(
  <span style={{display:"flex",gap:2}}>
    {[1,2,3,4,5].map(i=>(
      <svg key={i} width="13" height="13" viewBox="0 0 24 24">
        <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"
          fill={i<=Math.round(n)?"#FFB830":"#DDE"} stroke="none"/>
      </svg>
    ))}
  </span>
);

const Chip = ({children,color=T.teal,bg})=>(
  <span style={{display:"inline-flex",alignItems:"center",background:bg||color+"18",color,
    fontSize:11,fontWeight:700,padding:"3px 10px",borderRadius:99,
    letterSpacing:".05em",textTransform:"uppercase",fontFamily:"'Plus Jakarta Sans',sans-serif"}}>
    {children}
  </span>
);

const Btn = ({children,onClick,variant="primary",size="md",full,disabled,style:sx={}})=>{
  const sz={sm:{fontSize:13,padding:"9px 18px",borderRadius:10},
             md:{fontSize:15,padding:"13px 26px",borderRadius:12},
             lg:{fontSize:16,padding:"15px 34px",borderRadius:14}};
  const vr={
    primary:{background:`linear-gradient(135deg,${T.teal},${T.tealMid})`,color:"#fff",border:"none",boxShadow:`0 4px 16px ${T.teal}40`},
    lime:   {background:T.lime,color:T.teal,border:"none",boxShadow:`0 4px 16px ${T.lime}60`},
    outline:{background:"transparent",color:T.teal,border:`2px solid ${T.teal}`},
    ghost:  {background:"transparent",color:T.slate,border:`1.5px solid ${T.border}`},
    white:  {background:"#fff",color:T.teal,border:"none",boxShadow:"0 4px 20px rgba(0,0,0,.1)"},
  };
  return(
    <button className="btn-press" onClick={onClick} disabled={disabled}
      style={{display:"inline-flex",alignItems:"center",justifyContent:"center",gap:8,
        fontWeight:700,cursor:disabled?"not-allowed":"pointer",opacity:disabled?.6:1,
        ...(full?{width:"100%"}:{}), ...sz[size], ...vr[variant], ...sx}}>
      {children}
    </button>
  );
};

const InsurerBadge = ({id,size=46})=>{
  const ins=INSURERS[id]; if(!ins) return null;
  return(
    <div style={{width:size,height:size,borderRadius:12,background:`${ins.color}14`,
      border:`1.5px solid ${ins.color}28`,display:"flex",alignItems:"center",
      justifyContent:"center",fontSize:size*.28,fontWeight:800,color:ins.color,
      fontFamily:"monospace",flexShrink:0,letterSpacing:"-.5px"}}>
      {ins.abbr}
    </div>
  );
};

// ── PLAN CARD ─────────────────────────────────────────────────────
const PlanCard = ({plan,product,onBuy,onCompare,isCompared})=>{
  const ins=INSURERS[plan.insurer];
  const prod=PRODUCTS.find(p=>p.key===product);
  const disc=plan.orig>plan.premium?Math.round((1-plan.premium/plan.orig)*100):0;
  return(
    <div className="hover-lift" style={{background:T.white,borderRadius:20,
      border:`1.5px solid ${isCompared?T.teal:T.border}`,overflow:"hidden",
      display:"flex",flexDirection:"column",
      boxShadow:plan.popular?`0 8px 32px ${prod.color}28`:"0 2px 12px rgba(0,0,0,.05)"}}>
      {plan.popular&&(
        <div style={{background:`linear-gradient(90deg,${prod.color},${prod.dark})`,color:"#fff",
          fontSize:11,fontWeight:800,textAlign:"center",padding:"6px",
          letterSpacing:".07em",textTransform:"uppercase",fontFamily:"'Plus Jakarta Sans',sans-serif"}}>
          ⭐ Most Popular Choice
        </div>
      )}
      <div style={{padding:"22px 22px 16px"}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:16}}>
          <div style={{display:"flex",gap:12,alignItems:"center"}}>
            <InsurerBadge id={plan.insurer}/>
            <div>
              <div style={{fontWeight:800,fontSize:15,color:T.ink,fontFamily:"'Plus Jakarta Sans',sans-serif"}}>{ins.name}</div>
              <div style={{fontSize:12,color:T.mist,marginTop:1}}>{plan.name}</div>
              <div style={{marginTop:4,display:"flex",alignItems:"center",gap:5}}>
                <Stars n={plan.rating}/>
                <span style={{fontSize:11,color:T.slate}}>({plan.rating})</span>
              </div>
            </div>
          </div>
          <Chip color={prod.dark} bg={prod.bg}>{plan.type}</Chip>
        </div>
        <div style={{background:`linear-gradient(135deg,${prod.bg},${prod.bg}88)`,
          borderRadius:14,padding:"16px 18px",marginBottom:16}}>
          <div style={{display:"flex",alignItems:"baseline",gap:6}}>
            <span style={{fontSize:30,fontWeight:900,color:T.ink,
              fontFamily:"'Plus Jakarta Sans',sans-serif",letterSpacing:"-1px"}}>
              ₹{plan.premium.toLocaleString()}
            </span>
            <span style={{fontSize:13,color:T.mist}}>/year</span>
            {disc>0&&<span style={{fontSize:12,background:"#E8FBF0",color:"#1B6B3A",
              fontWeight:700,padding:"2px 8px",borderRadius:99,marginLeft:4}}>{disc}% off</span>}
          </div>
          {disc>0&&<div style={{fontSize:12,color:T.mist,marginTop:2,textDecoration:"line-through"}}>
            MRP ₹{plan.orig.toLocaleString()}/year</div>}
          <div style={{marginTop:8,fontSize:12,color:T.slate}}>
            Claim Ratio: <strong style={{color:"#1B6B3A"}}>{ins.claimR}</strong>
            {plan.network&&plan.network!=="Nationwide"&&plan.network!=="N/A"&&<span> · {plan.network}</span>}
          </div>
        </div>
        <div style={{display:"flex",flexDirection:"column",gap:7,marginBottom:16}}>
          {plan.features.map((f,i)=>(
            <div key={i} style={{display:"flex",alignItems:"center",gap:9,fontSize:13,color:T.ink}}>
              <div style={{width:18,height:18,borderRadius:99,background:T.lime,
                display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>
                <svg width="10" height="10" viewBox="0 0 12 10">
                  <polyline points="1 5 4.5 8.5 11 1" stroke={T.teal} strokeWidth="2" fill="none" strokeLinecap="round"/>
                </svg>
              </div>
              {f}
            </div>
          ))}
        </div>
      </div>
      <div style={{padding:"0 22px 22px",marginTop:"auto",display:"flex",gap:10}}>
        <button className="btn-press" onClick={()=>onBuy(plan)} style={{flex:2,padding:"13px",
          borderRadius:12,border:"none",background:`linear-gradient(135deg,${T.teal},${T.tealMid})`,
          color:"#fff",fontWeight:700,fontSize:14,cursor:"pointer",
          boxShadow:`0 4px 16px ${T.teal}40`,fontFamily:"'Plus Jakarta Sans',sans-serif"}}>
          Buy Now →
        </button>
        <button className="btn-press" onClick={()=>onCompare(plan)} style={{flex:1,padding:"13px",
          borderRadius:12,cursor:"pointer",
          border:`1.5px solid ${isCompared?T.teal:T.border}`,
          background:isCompared?T.tealLt:"transparent",
          color:isCompared?T.teal:T.slate,fontWeight:600,fontSize:13,
          fontFamily:"'Plus Jakarta Sans',sans-serif"}}>
          {isCompared?"✓ Added":"Compare"}
        </button>
      </div>
    </div>
  );
};

// ── CHECKOUT MODAL ────────────────────────────────────────────────
const CheckoutModal = ({plan,product,onClose})=>{
  const ins=INSURERS[plan.insurer];
  const prod=PRODUCTS.find(p=>p.key===product);
  const [step,setStep]=useState(1);
  const [form,setForm]=useState({name:"",email:"",phone:"",dob:"",nominee:""});
  const [errors,setErrors]=useState({});
  const [policyNo,setPolicyNo]=useState("");
  const [payErr,setPayErr]=useState("");

  const validate=()=>{
    const e={};
    if(!form.name.trim()) e.name="Required";
    if(!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) e.email="Valid email needed";
    if(!/^[6-9]\d{9}$/.test(form.phone)) e.phone="Valid 10-digit mobile";
    if(!form.dob) e.dob="Required";
    setErrors(e); return !Object.keys(e).length;
  };

  const pay=async()=>{
    setStep(3); setPayErr("");
    try{
      // Step 1 — create Razorpay order via backend
      const orderRes=await fetch(`${API}/api/create-order`,{
        method:"POST",headers:{"Content-Type":"application/json"},
        body:JSON.stringify({amount:plan.premium,planId:plan.id}),
      });
      const {orderId,error:oErr}=await orderRes.json();
      if(oErr) throw new Error(oErr);

      // Step 2 — open Razorpay checkout (SDK loaded in index.html)
      const rzp=new window.Razorpay({
        key:RZP_KEY,
        amount:plan.premium*100,
        currency:"INR",
        name:"Greatzed LLP",
        description:`${ins.name} — ${plan.name}`,
        order_id:orderId,
        prefill:{name:form.name,email:form.email,contact:form.phone},
        theme:{color:T.teal},
        handler:async(response)=>{
          // Step 3 — verify payment + issue policy via backend
          const verifyRes=await fetch(`${API}/api/verify-payment`,{
            method:"POST",headers:{"Content-Type":"application/json"},
            body:JSON.stringify({
              razorpay_order_id:  response.razorpay_order_id,
              razorpay_payment_id:response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
              planId:plan.id,
              userDetails:form,
            }),
          });
          const {policyNumber,error:vErr}=await verifyRes.json();
          if(vErr) throw new Error(vErr);
          setPolicyNo(policyNumber);
          setStep(4);
        },
        modal:{ondismiss:()=>setStep(2)},
      });
      rzp.open();
    }catch(err){
      setPayErr(err.message||"Payment failed. Please try again.");
      setStep(2);
    }
  };

  const inp=(key,label,type="text",placeholder="")=>(
    <div style={{marginBottom:14}}>
      <label style={{fontSize:11,fontWeight:700,color:T.slate,display:"block",
        marginBottom:5,textTransform:"uppercase",letterSpacing:".05em",
        fontFamily:"'Plus Jakarta Sans',sans-serif"}}>{label}</label>
      <input type={type} placeholder={placeholder} value={form[key]}
        onChange={e=>setForm(p=>({...p,[key]:e.target.value}))}
        style={{width:"100%",padding:"12px 14px",borderRadius:11,fontSize:14,
          border:`1.5px solid ${errors[key]?"#FF6B5B":T.border}`,
          background:"#FAFCFB",color:T.ink,boxSizing:"border-box"}}/>
      {errors[key]&&<div style={{color:"#FF6B5B",fontSize:11,marginTop:3}}>{errors[key]}</div>}
    </div>
  );

  return(
    <div style={{position:"fixed",inset:0,zIndex:1000,background:"rgba(11,29,26,.72)",
      backdropFilter:"blur(6px)",display:"flex",alignItems:"center",justifyContent:"center",padding:16}}
      onClick={e=>e.target===e.currentTarget&&onClose()}>
      <div style={{background:T.white,borderRadius:24,width:"100%",maxWidth:500,
        maxHeight:"92vh",overflowY:"auto",boxShadow:"0 32px 100px rgba(0,0,0,.3)",
        animation:"fadeUp .3s ease"}}>
        {/* Header */}
        <div style={{background:`linear-gradient(135deg,${prod.bg},${prod.color}22)`,
          padding:"24px 28px",borderBottom:`1px solid ${T.border}`,
          display:"flex",justifyContent:"space-between",alignItems:"flex-start",
          borderRadius:"24px 24px 0 0"}}>
          <div>
            <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:6}}>
              <span style={{fontSize:24}}>{prod.emoji}</span>
              <span style={{fontWeight:900,fontSize:18,color:T.ink,
                fontFamily:"'Plus Jakarta Sans',sans-serif"}}>
                {step===4?"Policy Issued! 🎉":"Secure Checkout"}
              </span>
            </div>
            <div style={{fontSize:13,color:T.slate}}>{ins.name} · {plan.name}</div>
          </div>
          <button onClick={onClose} style={{background:"rgba(255,255,255,.8)",border:"none",
            borderRadius:99,width:34,height:34,cursor:"pointer",fontSize:18,
            display:"flex",alignItems:"center",justifyContent:"center",color:T.slate}}>×</button>
        </div>

        <div style={{padding:"24px 28px"}}>
          {/* Price pill */}
          <div style={{background:T.teal,borderRadius:14,padding:"16px 20px",
            display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:24}}>
            <div>
              <div style={{fontSize:11,color:"rgba(255,255,255,.65)",fontWeight:600,
                letterSpacing:".05em",textTransform:"uppercase"}}>Annual Premium</div>
              <div style={{fontSize:28,fontWeight:900,color:"#fff",
                fontFamily:"'Plus Jakarta Sans',sans-serif",letterSpacing:"-1px"}}>
                ₹{plan.premium.toLocaleString()}
              </div>
              <div style={{fontSize:11,color:"rgba(255,255,255,.55)"}}>Incl. GST · Renews annually</div>
            </div>
            <div style={{textAlign:"right"}}>
              <div style={{fontSize:11,color:"rgba(255,255,255,.65)",marginBottom:4}}>Claim Ratio</div>
              <div style={{fontSize:22,fontWeight:800,color:T.lime}}>{ins.claimR}</div>
              <div style={{background:T.lime,color:T.teal,fontSize:10,fontWeight:700,
                padding:"2px 8px",borderRadius:99,display:"inline-block",marginTop:4}}>IRDAI ✓</div>
            </div>
          </div>

          {/* Step indicator */}
          {step<4&&(
            <div style={{display:"flex",alignItems:"center",marginBottom:24}}>
              {["Details","Review","Payment"].map((s,i)=>(
                <div key={s} style={{display:"flex",alignItems:"center",flex:i<2?1:"auto"}}>
                  <div style={{display:"flex",flexDirection:"column",alignItems:"center",gap:4}}>
                    <div style={{width:28,height:28,borderRadius:99,
                      background:i+1<step?T.lime:i+1===step?T.teal:T.border,
                      color:i+1<step?T.teal:i+1===step?"#fff":T.mist,
                      display:"flex",alignItems:"center",justifyContent:"center",
                      fontSize:12,fontWeight:800,transition:"all .3s"}}>
                      {i+1<step?"✓":i+1}
                    </div>
                    <div style={{fontSize:10,color:i+1===step?T.teal:T.mist,fontWeight:600}}>{s}</div>
                  </div>
                  {i<2&&<div style={{flex:1,height:2,background:i+1<step?T.lime:T.border,
                    margin:"0 6px",marginBottom:18,transition:"all .3s"}}/>}
                </div>
              ))}
            </div>
          )}

          {/* Step 1 — Details */}
          {step===1&&(
            <div style={{animation:"fadeIn .3s ease"}}>
              {inp("name",   "Full Name",     "text", "As per Aadhaar")}
              {inp("email",  "Email Address", "email","you@example.com")}
              {inp("phone",  "Mobile Number", "tel",  "10-digit mobile")}
              {inp("dob",    "Date of Birth", "date", "")}
              {inp("nominee","Nominee Name",  "text", "Optional")}
              <Btn onClick={()=>{if(validate())setStep(2);}} variant="primary" size="md" full>
                Continue to Review →
              </Btn>
            </div>
          )}

          {/* Step 2 — Review */}
          {step===2&&(
            <div style={{animation:"fadeIn .3s ease"}}>
              <div style={{fontWeight:700,fontSize:15,color:T.ink,marginBottom:14,
                fontFamily:"'Plus Jakarta Sans',sans-serif"}}>Review Your Details</div>
              <div style={{background:T.paper,borderRadius:14,overflow:"hidden",marginBottom:20}}>
                {[["Name",form.name],["Email",form.email],["Phone",form.phone],
                  ["Date of Birth",form.dob],["Nominee",form.nominee||"—"],
                  ["Plan",plan.name],["Insurer",ins.name]].map(([k,v])=>(
                  <div key={k} style={{display:"flex",justifyContent:"space-between",
                    padding:"11px 16px",borderBottom:`1px solid ${T.border}`,fontSize:14}}>
                    <span style={{color:T.mist}}>{k}</span>
                    <span style={{fontWeight:600,color:T.ink}}>{v}</span>
                  </div>
                ))}
              </div>
              {payErr&&<div style={{background:"#FFF0F0",border:"1px solid #FFCCCC",
                borderRadius:10,padding:"10px 14px",fontSize:13,color:"#CC0000",
                marginBottom:16}}>⚠ {payErr}</div>}
              <div style={{fontSize:12,color:T.mist,lineHeight:1.7,marginBottom:20}}>
                By proceeding you authorise Greatzed LLP to share your details with {ins.name} for policy issuance per IRDAI guidelines.
              </div>
              <div style={{display:"flex",gap:10}}>
                <Btn onClick={()=>setStep(1)} variant="ghost" size="md" style={{flex:1}}>← Edit</Btn>
                <Btn onClick={pay} variant="lime" size="md" style={{flex:2}}>
                  Pay ₹{plan.premium.toLocaleString()} via Razorpay
                </Btn>
              </div>
            </div>
          )}

          {/* Step 3 — Processing */}
          {step===3&&(
            <div style={{textAlign:"center",padding:"40px 0",animation:"fadeIn .3s ease"}}>
              <div style={{fontSize:52,marginBottom:20}}>🔐</div>
              <div style={{fontWeight:800,fontSize:18,color:T.ink,marginBottom:8,
                fontFamily:"'Plus Jakarta Sans',sans-serif"}}>Processing Payment</div>
              <div style={{color:T.mist,fontSize:14,marginBottom:28}}>Connecting securely to Razorpay...</div>
              <div style={{display:"flex",justifyContent:"center"}}>
                <div style={{width:36,height:36,borderRadius:"50%",
                  border:`3px solid ${T.border}`,borderTopColor:T.teal,
                  animation:"spin .8s linear infinite"}}/>
              </div>
            </div>
          )}

          {/* Step 4 — Success */}
          {step===4&&(
            <div style={{textAlign:"center",padding:"8px 0",animation:"fadeUp .4s ease"}}>
              <div style={{width:72,height:72,borderRadius:"50%",
                background:`linear-gradient(135deg,${T.lime},${T.teal})`,
                display:"flex",alignItems:"center",justifyContent:"center",
                margin:"0 auto 20px",fontSize:32}}>✓</div>
              <div style={{fontWeight:900,fontSize:22,color:T.ink,marginBottom:8,
                fontFamily:"'Plus Jakarta Sans',sans-serif"}}>Policy Issued Successfully!</div>
              <div style={{color:T.slate,fontSize:14,lineHeight:1.7,marginBottom:22}}>
                Your <strong>{plan.name}</strong> from <strong>{ins.name}</strong> is active.
                Documents sent to <strong>{form.email}</strong>.
              </div>
              <div style={{background:`linear-gradient(135deg,${T.tealLt},${T.lime}40)`,
                borderRadius:14,padding:"16px 20px",marginBottom:24}}>
                <div style={{fontSize:11,color:T.mist,marginBottom:4,fontWeight:600,textTransform:"uppercase"}}>Policy Number</div>
                <div style={{fontSize:22,fontWeight:900,color:T.teal,fontFamily:"monospace"}}>{policyNo}</div>
              </div>
              <Btn onClick={onClose} variant="primary" size="md" full>Done</Btn>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// ── COMPARE DRAWER ────────────────────────────────────────────────
const CompareDrawer = ({plans,onRemove})=>{
  if(!plans.length) return null;
  return(
    <div style={{position:"fixed",bottom:0,left:0,right:0,zIndex:300,background:T.white,
      borderTop:`3px solid ${T.teal}`,boxShadow:"0 -8px 40px rgba(11,77,74,.15)"}}>
      <div style={{maxWidth:1140,margin:"0 auto",padding:"14px 24px",
        display:"flex",gap:16,alignItems:"center",flexWrap:"wrap"}}>
        <div style={{fontWeight:800,fontSize:13,color:T.teal,
          fontFamily:"'Plus Jakarta Sans',sans-serif",flexShrink:0}}>
          COMPARE ({plans.length}/3)
        </div>
        {plans.map(p=>{
          const ins=INSURERS[p.insurer];
          return(
            <div key={p.id} style={{display:"flex",alignItems:"center",gap:10,
              background:T.paper,borderRadius:12,padding:"10px 14px",
              border:`1px solid ${T.border}`,flexShrink:0}}>
              <InsurerBadge id={p.insurer} size={32}/>
              <div>
                <div style={{fontSize:12,fontWeight:700,color:T.ink}}>{ins.name}</div>
                <div style={{fontSize:12,color:T.teal,fontWeight:700}}>₹{p.premium.toLocaleString()}/yr</div>
              </div>
              <button onClick={()=>onRemove(p.id)} style={{background:"none",border:"none",
                cursor:"pointer",color:T.mist,fontSize:18,padding:2,lineHeight:1}}>×</button>
            </div>
          );
        })}
        {plans.length>=2&&(
          <Btn variant="primary" size="sm" onClick={()=>alert("Side-by-side comparison — coming soon!")}>
            Compare →
          </Btn>
        )}
      </div>
    </div>
  );
};

// ── NAVBAR ────────────────────────────────────────────────────────
const Navbar = ({page,setPage})=>{
  const [scrolled,setScrolled]=useState(false);
  useEffect(()=>{
    const fn=()=>setScrolled(window.scrollY>24);
    window.addEventListener("scroll",fn);
    return()=>window.removeEventListener("scroll",fn);
  },[]);
  const links=[
    {label:"Car",p:"car"},{label:"Health",p:"health"},
    {label:"Life",p:"life"},{label:"Travel",p:"travel"},
    {label:"Claims",p:"claims"},{label:"About",p:"about"},
  ];
  return(
    <nav style={{position:"sticky",top:0,zIndex:200,
      background:scrolled?"rgba(245,250,249,.97)":T.white,
      borderBottom:`1.5px solid ${T.border}`,backdropFilter:"blur(16px)",
      boxShadow:scrolled?"0 2px 24px rgba(11,77,74,.09)":"none",transition:"all .2s"}}>
      <div style={{maxWidth:1140,margin:"0 auto",padding:"0 28px",
        display:"flex",alignItems:"center",height:66,gap:20}}>
        <button onClick={()=>setPage("home")} style={{background:"none",border:"none",
          cursor:"pointer",display:"flex",alignItems:"center",gap:10,padding:0,flexShrink:0}}>
          <div style={{width:40,height:40,borderRadius:12,
            background:`linear-gradient(135deg,${T.teal},${T.tealMid})`,
            display:"flex",alignItems:"center",justifyContent:"center",
            boxShadow:`0 4px 14px ${T.teal}40`}}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" fill="#fff" fillOpacity=".9"/>
              <polyline points="9 12 11 14 15 10" stroke={T.lime} strokeWidth="2.2" strokeLinecap="round" fill="none"/>
            </svg>
          </div>
          <div style={{lineHeight:1}}>
            <div style={{fontWeight:900,fontSize:18,color:T.ink,letterSpacing:"-.5px",
              fontFamily:"'Plus Jakarta Sans',sans-serif"}}>Greatzed</div>
            <div style={{fontSize:9,color:T.mist,letterSpacing:".18em",textTransform:"uppercase",marginTop:1}}>Insurance · LLP</div>
          </div>
        </button>
        <div style={{display:"flex",gap:2,flex:1,justifyContent:"center",flexWrap:"wrap"}}>
          {links.map(l=>(
            <button key={l.p} onClick={()=>setPage(l.p)} style={{
              background:page===l.p?T.tealLt:"transparent",border:"none",cursor:"pointer",
              fontFamily:"'Plus Jakarta Sans',sans-serif",padding:"8px 14px",borderRadius:10,
              fontSize:13.5,fontWeight:600,color:page===l.p?T.teal:T.slate,transition:"all .15s"}}>
              {l.label}
            </button>
          ))}
        </div>
        <div style={{display:"flex",gap:10,alignItems:"center",flexShrink:0}}>
          <Btn onClick={()=>setPage("login")} variant="ghost" size="sm">Login</Btn>
          <Btn onClick={()=>setPage("home")} variant="lime" size="sm">Free Quote</Btn>
        </div>
      </div>
    </nav>
  );
};

// ── HOME PAGE ─────────────────────────────────────────────────────
const HomePage = ({setPage})=>{
  const [tIdx,setTIdx]=useState(0);
  const [faqOpen,setFaqOpen]=useState(null);
  useEffect(()=>{
    const t=setInterval(()=>setTIdx(i=>(i+1)%TESTIMONIALS.length),4500);
    return()=>clearInterval(t);
  },[]);
  return(
    <div>
      {/* HERO */}
      <section style={{background:`linear-gradient(160deg,#0B4D4A 0%,#0F6B66 55%,#0B4D4A 100%)`,
        backgroundSize:"200% 200%",animation:"gradShift 8s ease infinite",
        padding:"72px 28px 0",overflow:"hidden",position:"relative"}}>
        <div style={{position:"absolute",top:-80,right:-80,width:400,height:400,
          borderRadius:"50%",background:"rgba(200,240,76,.07)",pointerEvents:"none"}}/>
        <div style={{maxWidth:1140,margin:"0 auto",position:"relative"}}>
          <div className="fadeUp" style={{display:"inline-flex",alignItems:"center",gap:10,
            background:"rgba(200,240,76,.15)",border:"1px solid rgba(200,240,76,.3)",
            borderRadius:99,padding:"7px 18px",marginBottom:28}}>
            <span style={{fontSize:13,fontWeight:700,color:T.lime,letterSpacing:".04em"}}>
              🏛️ IRDAI Licensed Web Aggregator · Reg. No. WBA-XXXX
            </span>
          </div>
          <h1 className="fadeUp2" style={{fontFamily:"'Plus Jakarta Sans',sans-serif",
            fontSize:"clamp(36px,5.5vw,64px)",fontWeight:900,color:"#fff",
            lineHeight:1.1,letterSpacing:"-2px",maxWidth:680,marginBottom:22}}>
            Insurance that<br/>
            <span style={{background:`linear-gradient(90deg,${T.lime},#9EF060)`,
              WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent"}}>
              actually makes sense.
            </span>
          </h1>
          <p className="fadeUp3" style={{color:"rgba(255,255,255,.72)",fontSize:18,lineHeight:1.7,
            maxWidth:520,marginBottom:40,fontWeight:400}}>
            Compare 200+ plans from 30+ trusted insurers. Buy in 2 minutes.
            Trusted by <strong style={{color:"#fff"}}>50 Lakh+</strong> Indians.
          </p>
          <div className="fadeUp4" style={{display:"flex",gap:32,marginBottom:52,flexWrap:"wrap"}}>
            {[["50L+","Lives Insured"],["₹1200Cr+","Claims Settled"],["30+","Insurer Partners"],["4.8★","App Rating"]].map(([v,l])=>(
              <div key={l}>
                <div style={{fontFamily:"'Plus Jakarta Sans',sans-serif",fontSize:24,fontWeight:900,
                  color:T.lime,letterSpacing:"-.5px"}}>{v}</div>
                <div style={{fontSize:12,color:"rgba(255,255,255,.5)",marginTop:2}}>{l}</div>
              </div>
            ))}
          </div>
          {/* Product tiles */}
          <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(220px,1fr))",gap:16,paddingBottom:0}}>
            {PRODUCTS.map((p,i)=>(
              <button key={p.key} onClick={()=>setPage(p.key)} className="hover-lift"
                style={{background:p.key==="car"?"#fff":"rgba(255,255,255,.09)",
                  backdropFilter:"blur(12px)",
                  border:p.key==="car"?"none":"1.5px solid rgba(255,255,255,.15)",
                  borderRadius:20,padding:"24px 20px",cursor:"pointer",textAlign:"left",
                  fontFamily:"inherit",
                  boxShadow:p.key==="car"?"0 12px 40px rgba(0,0,0,.2)":"none",
                  transform:p.key==="car"?"translateY(-8px)":"none",
                  animation:`fadeUp .5s ease ${i*.08}s both`}}>
                <div style={{fontSize:36,marginBottom:12,animation:"float 3s ease-in-out infinite",
                  animationDelay:`${i*.4}s`}}>{p.emoji}</div>
                <div style={{fontFamily:"'Plus Jakarta Sans',sans-serif",fontWeight:800,fontSize:16,
                  color:p.key==="car"?T.ink:"#fff",marginBottom:4}}>{p.label}</div>
                <div style={{fontSize:12,color:p.key==="car"?T.mist:"rgba(255,255,255,.6)",
                  marginBottom:12,lineHeight:1.4}}>{p.blurb}</div>
                <div style={{display:"flex",gap:6,flexWrap:"wrap",marginBottom:12}}>
                  {p.stats.map(s=>(
                    <span key={s} style={{fontSize:10,fontWeight:600,padding:"3px 8px",borderRadius:99,
                      background:p.key==="car"?T.tealLt:"rgba(200,240,76,.15)",
                      color:p.key==="car"?T.teal:T.lime}}>{s}</span>
                  ))}
                </div>
                <div style={{fontFamily:"'Plus Jakarta Sans',sans-serif",fontSize:13,fontWeight:800,
                  color:p.key==="car"?T.teal:T.lime,display:"flex",alignItems:"center",gap:6}}>
                  From {p.from} →
                </div>
              </button>
            ))}
          </div>
        </div>
        <svg viewBox="0 0 1440 60" style={{display:"block",width:"100%",marginTop:32}}>
          <path d="M0,40 C360,70 1080,10 1440,40 L1440,60 L0,60 Z" fill={T.paper}/>
        </svg>
      </section>

      {/* TICKER */}
      <div style={{background:T.lime,padding:"10px 0",overflow:"hidden"}}>
        <div className="ticker-wrap">
          <div className="ticker-inner">
            {Array(8).fill(["🚗 Car Insurance from ₹2,094/yr","🏥 Health Plans from ₹12,800/yr",
              "🛡️ 1 Crore Term Cover from ₹740/mo","✈️ Travel Insurance from ₹1,200/trip",
              "⚡ Policy in 2 minutes","📞 24×7 Claims Support","✅ IRDAI Licensed & Regulated",
            ]).flat().map((t,i)=>(
              <span key={i} style={{fontSize:12,fontWeight:700,color:T.teal,
                padding:"0 28px",letterSpacing:".04em",fontFamily:"'Plus Jakarta Sans',sans-serif"}}>{t}</span>
            ))}
          </div>
        </div>
      </div>

      {/* HOW IT WORKS */}
      <section style={{padding:"80px 28px",background:T.white}}>
        <div style={{maxWidth:1140,margin:"0 auto"}}>
          <div style={{textAlign:"center",marginBottom:56}}>
            <Chip color={T.teal}>How It Works</Chip>
            <h2 style={{fontFamily:"'Plus Jakarta Sans',sans-serif",
              fontSize:"clamp(26px,3.5vw,40px)",fontWeight:900,
              color:T.ink,marginTop:12,letterSpacing:"-1px"}}>Insured in under 3 minutes</h2>
          </div>
          <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(220px,1fr))",gap:24}}>
            {[
              {n:"1",e:"📋",t:"Tell Us About You",d:"Share basic details about yourself, vehicle, or family. Takes 90 seconds."},
              {n:"2",e:"⚡",t:"Compare Live Quotes",d:"Real-time quotes from 30+ insurers, ranked by value and claim performance."},
              {n:"3",e:"💳",t:"Buy Securely Online",d:"Pick your plan and pay via Razorpay with 256-bit SSL encryption."},
              {n:"4",e:"📄",t:"Policy in Minutes",d:"Documents arrive on your email and WhatsApp instantly."},
            ].map(s=>(
              <div key={s.n} style={{background:T.paper,borderRadius:20,padding:28,
                border:`1.5px solid ${T.border}`,position:"relative",overflow:"hidden"}}>
                <div style={{position:"absolute",top:16,right:20,fontFamily:"'Plus Jakarta Sans',sans-serif",
                  fontSize:64,fontWeight:900,color:T.teal,opacity:.06,lineHeight:1}}>{s.n}</div>
                <div style={{width:52,height:52,borderRadius:14,
                  background:`linear-gradient(135deg,${T.tealLt},${T.lime}40)`,
                  display:"flex",alignItems:"center",justifyContent:"center",
                  fontSize:24,marginBottom:16,border:`1px solid ${T.lime}`}}>{s.e}</div>
                <div style={{fontFamily:"'Plus Jakarta Sans',sans-serif",fontWeight:800,
                  fontSize:16,color:T.ink,marginBottom:8}}>Step {s.n}: {s.t}</div>
                <div style={{fontSize:14,color:T.slate,lineHeight:1.6}}>{s.d}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* PRODUCTS */}
      <section style={{padding:"80px 28px",background:T.paper}}>
        <div style={{maxWidth:1140,margin:"0 auto"}}>
          <div style={{textAlign:"center",marginBottom:56}}>
            <Chip color={T.teal}>Our Products</Chip>
            <h2 style={{fontFamily:"'Plus Jakarta Sans',sans-serif",
              fontSize:"clamp(26px,3.5vw,40px)",fontWeight:900,
              color:T.ink,marginTop:12,letterSpacing:"-1px"}}>Protection for every chapter of life</h2>
          </div>
          <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(260px,1fr))",gap:20}}>
            {PRODUCTS.map(p=>(
              <div key={p.key} className="hover-lift" onClick={()=>setPage(p.key)}
                style={{background:T.white,borderRadius:22,overflow:"hidden",
                  border:`1.5px solid ${T.border}`}}>
                <div style={{background:`linear-gradient(135deg,${p.color}28,${p.bg})`,
                  padding:"28px 28px 20px",position:"relative"}}>
                  <div style={{fontSize:44,marginBottom:12}}>{p.emoji}</div>
                  <div style={{fontFamily:"'Plus Jakarta Sans',sans-serif",fontWeight:900,
                    fontSize:20,color:T.ink,marginBottom:4}}>{p.label}</div>
                  <div style={{fontSize:13,color:T.slate,lineHeight:1.4}}>{p.blurb}</div>
                  <div style={{position:"absolute",top:20,right:20}}>
                    <Chip color={p.dark} bg={p.bg}>{p.tag}</Chip>
                  </div>
                </div>
                <div style={{padding:"18px 28px 24px"}}>
                  <div style={{display:"flex",gap:8,marginBottom:16,flexWrap:"wrap"}}>
                    {p.stats.map(s=>(
                      <span key={s} style={{fontSize:11,fontWeight:600,padding:"4px 10px",
                        borderRadius:99,background:T.paper,color:T.slate,border:`1px solid ${T.border}`}}>{s}</span>
                    ))}
                  </div>
                  <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                    <div>
                      <div style={{fontSize:11,color:T.mist,marginBottom:2}}>Starting from</div>
                      <div style={{fontFamily:"'Plus Jakarta Sans',sans-serif",fontSize:20,
                        fontWeight:900,color:T.teal}}>{p.from}</div>
                    </div>
                    <div style={{width:40,height:40,borderRadius:12,
                      background:`linear-gradient(135deg,${T.teal},${T.tealMid})`,
                      display:"flex",alignItems:"center",justifyContent:"center",
                      color:"#fff",fontSize:18}}>→</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* TESTIMONIALS */}
      <section style={{padding:"80px 28px",background:T.teal,position:"relative",overflow:"hidden"}}>
        <div style={{position:"absolute",top:-100,right:-100,width:400,height:400,
          borderRadius:"50%",background:"rgba(200,240,76,.07)",pointerEvents:"none"}}/>
        <div style={{maxWidth:900,margin:"0 auto",position:"relative"}}>
          <div style={{textAlign:"center",marginBottom:48}}>
            <Chip color={T.lime} bg="rgba(200,240,76,.2)">Customer Stories</Chip>
            <h2 style={{fontFamily:"'Plus Jakarta Sans',sans-serif",
              fontSize:"clamp(26px,3.5vw,40px)",fontWeight:900,
              color:"#fff",marginTop:12,letterSpacing:"-1px"}}>Real people. Real claims.</h2>
          </div>
          <div style={{background:"rgba(255,255,255,.08)",backdropFilter:"blur(16px)",
            borderRadius:24,padding:"40px 44px",border:"1px solid rgba(255,255,255,.15)"}}>
            <div style={{fontSize:56,color:T.lime,lineHeight:1,marginBottom:20,
              fontFamily:"'Plus Jakarta Sans',sans-serif",fontWeight:900}}>"</div>
            <div style={{fontSize:19,color:"#fff",lineHeight:1.7,marginBottom:28,
              minHeight:80,fontWeight:500}}>
              {TESTIMONIALS[tIdx].text}
            </div>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
              <div style={{display:"flex",gap:14,alignItems:"center"}}>
                <div style={{width:50,height:50,borderRadius:"50%",
                  background:`linear-gradient(135deg,${T.lime},#9EF060)`,
                  display:"flex",alignItems:"center",justifyContent:"center",
                  fontWeight:900,fontSize:16,color:T.teal,
                  fontFamily:"'Plus Jakarta Sans',sans-serif"}}>{TESTIMONIALS[tIdx].av}</div>
                <div>
                  <div style={{fontWeight:700,color:"#fff",fontSize:15,
                    fontFamily:"'Plus Jakarta Sans',sans-serif"}}>{TESTIMONIALS[tIdx].name}</div>
                  <div style={{fontSize:12,color:"rgba(255,255,255,.55)"}}>
                    {TESTIMONIALS[tIdx].city} · {TESTIMONIALS[tIdx].product} Insurance
                  </div>
                </div>
              </div>
              <Stars n={TESTIMONIALS[tIdx].rating}/>
            </div>
            <div style={{display:"flex",gap:8,marginTop:28,justifyContent:"center"}}>
              {TESTIMONIALS.map((_,i)=>(
                <button key={i} onClick={()=>setTIdx(i)} style={{
                  width:tIdx===i?28:8,height:8,borderRadius:99,
                  background:tIdx===i?T.lime:"rgba(255,255,255,.3)",
                  border:"none",cursor:"pointer",transition:"all .3s",padding:0}}/>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* PARTNERS */}
      <section style={{padding:"64px 28px",background:T.white}}>
        <div style={{maxWidth:1140,margin:"0 auto",textAlign:"center"}}>
          <div style={{fontSize:11,fontWeight:700,color:T.mist,letterSpacing:".15em",
            textTransform:"uppercase",marginBottom:28}}>Trusted Insurer Partners</div>
          <div style={{display:"flex",flexWrap:"wrap",gap:14,justifyContent:"center"}}>
            {Object.entries(INSURERS).map(([id,ins])=>(
              <div key={id} style={{background:T.paper,border:`1.5px solid ${T.border}`,
                borderRadius:14,padding:"14px 20px",display:"flex",alignItems:"center",gap:12,
                transition:"all .2s"}}
                onMouseEnter={e=>{e.currentTarget.style.borderColor=ins.color;e.currentTarget.style.transform="translateY(-2px)"}}
                onMouseLeave={e=>{e.currentTarget.style.borderColor=T.border;e.currentTarget.style.transform="translateY(0)"}}>
                <div style={{width:38,height:38,borderRadius:10,background:`${ins.color}14`,
                  display:"flex",alignItems:"center",justifyContent:"center",
                  fontWeight:800,fontSize:12,color:ins.color,fontFamily:"monospace"}}>{ins.abbr}</div>
                <div>
                  <div style={{fontWeight:700,fontSize:13,color:T.ink}}>{ins.name}</div>
                  <div style={{fontSize:11,color:"#1B6B3A",fontWeight:600}}>Claim: {ins.claimR}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* WHY GREATZED */}
      <section style={{padding:"80px 28px",background:T.paper}}>
        <div style={{maxWidth:1140,margin:"0 auto"}}>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:56,alignItems:"center"}}>
            <div>
              <Chip color={T.teal}>Why Greatzed</Chip>
              <h2 style={{fontFamily:"'Plus Jakarta Sans',sans-serif",
                fontSize:"clamp(26px,3vw,40px)",fontWeight:900,
                color:T.ink,marginTop:12,marginBottom:20,letterSpacing:"-1px"}}>
                We put you first.<br/>Always.
              </h2>
              <div style={{color:T.slate,fontSize:16,lineHeight:1.7,marginBottom:32}}>
                Unlike agents who push high-commission plans, Greatzed ranks every option purely by coverage, claim ratio, and your budget.
              </div>
              <div style={{display:"flex",flexDirection:"column",gap:16}}>
                {[
                  ["🎯","100% Unbiased","Rankings are purely algorithmic — never commission-driven."],
                  ["🔒","Bank-Grade Security","256-bit SSL. PCI-DSS compliant via Razorpay."],
                  ["⚡","2-Minute Issuance","Most policies issued instantly. No paperwork."],
                  ["📞","Claims Concierge","Dedicated support from Day 1, not just at sale."],
                ].map(([icon,title,desc])=>(
                  <div key={title} style={{display:"flex",gap:14,alignItems:"flex-start"}}>
                    <div style={{width:44,height:44,borderRadius:12,
                      background:`linear-gradient(135deg,${T.tealLt},${T.lime}50)`,
                      display:"flex",alignItems:"center",justifyContent:"center",
                      fontSize:20,flexShrink:0}}>{icon}</div>
                    <div>
                      <div style={{fontWeight:700,color:T.ink,marginBottom:2,
                        fontFamily:"'Plus Jakarta Sans',sans-serif"}}>{title}</div>
                      <div style={{fontSize:14,color:T.slate}}>{desc}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div style={{background:`linear-gradient(135deg,${T.teal},${T.tealMid})`,
              borderRadius:24,padding:32,color:"#fff"}}>
              <div style={{fontSize:13,fontWeight:700,color:"rgba(255,255,255,.6)",
                marginBottom:20,letterSpacing:".05em",textTransform:"uppercase"}}>Live Savings Dashboard</div>
              {[
                {label:"Car Insurance",saving:"₹1,701",from:"₹10,200",to:"₹8,499"},
                {label:"Health Plan",  saving:"₹3,500",from:"₹22,000",to:"₹18,500"},
                {label:"Term Life",    saving:"₹1,700",from:"₹11,500",to:"₹9,800"},
              ].map(r=>(
                <div key={r.label} style={{display:"flex",justifyContent:"space-between",
                  alignItems:"center",padding:"14px 0",borderBottom:"1px solid rgba(255,255,255,.12)"}}>
                  <div>
                    <div style={{fontWeight:600,fontSize:14}}>{r.label}</div>
                    <div style={{fontSize:12,color:"rgba(255,255,255,.5)"}}>
                      <s>{r.from}</s> → {r.to}
                    </div>
                  </div>
                  <div style={{background:T.lime,color:T.teal,fontWeight:900,fontSize:14,
                    padding:"5px 12px",borderRadius:99,fontFamily:"'Plus Jakarta Sans',sans-serif"}}>
                    Save {r.saving}
                  </div>
                </div>
              ))}
              <div style={{marginTop:20,textAlign:"center",fontSize:13,color:"rgba(255,255,255,.6)"}}>
                Avg. savings per customer: <strong style={{color:T.lime,fontSize:18}}>₹6,900/yr</strong>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section style={{padding:"80px 28px",background:T.white}}>
        <div style={{maxWidth:720,margin:"0 auto"}}>
          <div style={{textAlign:"center",marginBottom:48}}>
            <Chip color={T.teal}>FAQ</Chip>
            <h2 style={{fontFamily:"'Plus Jakarta Sans',sans-serif",
              fontSize:"clamp(26px,3.5vw,40px)",fontWeight:900,
              color:T.ink,marginTop:12,letterSpacing:"-1px"}}>Common questions</h2>
          </div>
          {FAQ_DATA.map((f,i)=>(
            <div key={i} style={{marginBottom:10,borderRadius:14,overflow:"hidden",
              border:`1.5px solid ${faqOpen===i?T.teal:T.border}`,
              background:T.white,transition:"border-color .2s"}}>
              <button onClick={()=>setFaqOpen(faqOpen===i?null:i)} style={{width:"100%",
                display:"flex",justifyContent:"space-between",alignItems:"center",
                padding:"18px 22px",background:"none",border:"none",cursor:"pointer",
                fontFamily:"'Plus Jakarta Sans',sans-serif",textAlign:"left"}}>
                <span style={{fontWeight:700,fontSize:15,color:T.ink}}>{f.q}</span>
                <span style={{fontSize:22,color:T.teal,fontWeight:300,
                  transform:faqOpen===i?"rotate(45deg)":"none",transition:"transform .2s"}}>+</span>
              </button>
              {faqOpen===i&&(
                <div style={{padding:"0 22px 18px",fontSize:14,color:T.slate,
                  lineHeight:1.7,animation:"fadeIn .2s ease"}}>{f.a}</div>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section style={{padding:"64px 28px",background:T.paper}}>
        <div style={{maxWidth:860,margin:"0 auto",
          background:`linear-gradient(135deg,${T.teal},${T.tealMid})`,
          borderRadius:28,padding:"52px 48px",textAlign:"center",
          position:"relative",overflow:"hidden",boxShadow:`0 20px 60px ${T.teal}40`}}>
          <div style={{position:"absolute",top:-60,right:-60,width:300,height:300,
            borderRadius:"50%",background:"rgba(200,240,76,.1)",pointerEvents:"none"}}/>
          <div style={{position:"relative"}}>
            <div style={{fontFamily:"'Plus Jakarta Sans',sans-serif",
              fontSize:"clamp(24px,3.5vw,40px)",fontWeight:900,
              color:"#fff",marginBottom:12,letterSpacing:"-1px"}}>
              Start protecting what matters.
            </div>
            <div style={{color:"rgba(255,255,255,.7)",fontSize:16,marginBottom:32}}>
              Free quotes in 60 seconds. No spam calls. No hidden charges.
            </div>
            <div style={{display:"flex",gap:14,justifyContent:"center",flexWrap:"wrap"}}>
              <Btn variant="lime" size="lg" onClick={()=>setPage("car")}>🚗 Insure My Car</Btn>
              <Btn variant="white" size="lg" onClick={()=>setPage("health")}>🏥 Health Insurance</Btn>
            </div>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer style={{background:T.ink,color:"rgba(255,255,255,.55)",padding:"60px 28px 32px"}}>
        <div style={{maxWidth:1140,margin:"0 auto"}}>
          <div style={{display:"grid",gridTemplateColumns:"2fr 1fr 1fr 1fr 1fr",gap:40,marginBottom:48}}>
            <div>
              <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:18}}>
                <div style={{width:40,height:40,borderRadius:12,
                  background:`linear-gradient(135deg,${T.teal},${T.tealMid})`,
                  display:"flex",alignItems:"center",justifyContent:"center"}}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" fill="#fff" fillOpacity=".9"/>
                    <polyline points="9 12 11 14 15 10" stroke={T.lime} strokeWidth="2.2" strokeLinecap="round" fill="none"/>
                  </svg>
                </div>
                <div>
                  <div style={{fontFamily:"'Plus Jakarta Sans',sans-serif",fontWeight:900,
                    fontSize:18,color:"#fff"}}>Greatzed</div>
                  <div style={{fontSize:9,letterSpacing:".18em",textTransform:"uppercase"}}>Insurance · LLP</div>
                </div>
              </div>
              <div style={{fontSize:13,lineHeight:1.8,maxWidth:240}}>
                IRDAI Licensed Web Aggregator (Reg. WBA-XXXX).<br/>
                Making insurance simple for every Indian.
              </div>
            </div>
            {[
              {t:"Products", l:["Car Insurance","Health Plans","Term Life","Travel Cover"]},
              {t:"Company",  l:["About Us","Careers","Press Kit","Contact"]},
              {t:"Support",  l:["Claims Help","Track Policy","Grievance","Partner With Us"]},
              {t:"Legal",    l:["Privacy Policy","Terms","Disclaimer","IRDAI Info"]},
            ].map(col=>(
              <div key={col.t}>
                <div style={{fontFamily:"'Plus Jakarta Sans',sans-serif",fontWeight:700,
                  color:"#fff",marginBottom:14,fontSize:13,letterSpacing:".05em",
                  textTransform:"uppercase"}}>{col.t}</div>
                {col.l.map(l=>(
                  <div key={l} style={{fontSize:13,marginBottom:9,cursor:"pointer",transition:"color .15s"}}
                    onMouseEnter={e=>e.target.style.color="#fff"}
                    onMouseLeave={e=>e.target.style.color="rgba(255,255,255,.55)"}>{l}</div>
                ))}
              </div>
            ))}
          </div>
          <div style={{borderTop:"1px solid rgba(255,255,255,.08)",paddingTop:24,
            display:"flex",flexWrap:"wrap",gap:12,justifyContent:"space-between",
            alignItems:"center",fontSize:11}}>
            <div>© 2024 Greatzed LLP · IRDAI Reg. WBA-XXXX · CIN: UXXXXX2024LLP000000</div>
            <div style={{display:"flex",gap:4,alignItems:"center"}}>
              <div style={{width:8,height:8,borderRadius:"50%",background:"#22C55E",
                animation:"pulse 2s infinite"}}/>
              <span style={{color:"#22C55E",fontWeight:600}}>All systems operational</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

// ── PRODUCT PAGE ──────────────────────────────────────────────────
const ProductPage = ({type,setPage})=>{
  const prod=PRODUCTS.find(p=>p.key===type);
  const plans=PLANS[type]||[];
  const [filter,setFilter]=useState("All");
  const [sort,setSort]=useState("popular");
  const [compared,setCompared]=useState([]);
  const [buyPlan,setBuyPlan]=useState(null);

  const types=["All",...new Set(plans.map(p=>p.type))];
  const filtered=plans
    .filter(p=>filter==="All"||p.type===filter)
    .sort((a,b)=>sort==="price"?a.premium-b.premium:(b.popular?1:0)-(a.popular?1:0));

  const toggleCompare=plan=>setCompared(prev=>
    prev.find(p=>p.id===plan.id)?prev.filter(p=>p.id!==plan.id):
    prev.length<3?[...prev,plan]:prev);

  return(
    <div style={{background:T.paper,minHeight:"100vh"}}>
      <div style={{background:`linear-gradient(160deg,${T.teal},${T.tealMid})`,padding:"44px 28px 40px"}}>
        <div style={{maxWidth:1140,margin:"0 auto"}}>
          <button onClick={()=>setPage("home")} style={{background:"rgba(255,255,255,.12)",
            border:"1px solid rgba(255,255,255,.25)",borderRadius:99,padding:"6px 16px",
            color:"#fff",fontSize:13,fontWeight:600,cursor:"pointer",
            fontFamily:"'Plus Jakarta Sans',sans-serif",marginBottom:22,
            display:"inline-flex",alignItems:"center",gap:6}}>← Home</button>
          <div style={{display:"flex",gap:16,alignItems:"center"}}>
            <div style={{fontSize:48}}>{prod.emoji}</div>
            <div>
              <h1 style={{fontFamily:"'Plus Jakarta Sans',sans-serif",color:"#fff",
                fontSize:"clamp(24px,3vw,36px)",fontWeight:900,marginBottom:6,
                letterSpacing:"-.5px"}}>{prod.label}</h1>
              <p style={{color:"rgba(255,255,255,.7)",fontSize:15}}>
                {prod.blurb} · Compare {plans.length} plans
              </p>
            </div>
          </div>
        </div>
      </div>
      <div style={{maxWidth:1140,margin:"0 auto",padding:"32px 28px",
        paddingBottom:compared.length?120:32}}>
        {/* Filters */}
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",
          marginBottom:24,flexWrap:"wrap",gap:14}}>
          <div style={{display:"flex",gap:8,flexWrap:"wrap"}}>
            {types.map(t=>(
              <button key={t} onClick={()=>setFilter(t)} style={{padding:"8px 18px",
                borderRadius:99,border:`1.5px solid ${filter===t?T.teal:T.border}`,
                background:filter===t?T.teal:T.white,color:filter===t?"#fff":T.slate,
                fontWeight:600,fontSize:13,cursor:"pointer",transition:"all .15s",
                fontFamily:"'Plus Jakarta Sans',sans-serif"}}>{t}</button>
            ))}
          </div>
          <div style={{display:"flex",gap:8}}>
            {[["popular","⭐ Popular"],["price","💰 Lowest Price"]].map(([v,l])=>(
              <button key={v} onClick={()=>setSort(v)} style={{padding:"8px 16px",
                borderRadius:99,border:`1.5px solid ${sort===v?T.teal:T.border}`,
                background:sort===v?T.tealLt:T.white,color:sort===v?T.teal:T.slate,
                fontWeight:600,fontSize:12,cursor:"pointer",transition:"all .15s",
                fontFamily:"'Plus Jakarta Sans',sans-serif"}}>{l}</button>
            ))}
          </div>
        </div>
        {/* Cards */}
        <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(320px,1fr))",gap:20}}>
          {filtered.map(plan=>(
            <PlanCard key={plan.id} plan={plan} product={type}
              onBuy={setBuyPlan} onCompare={toggleCompare}
              isCompared={!!compared.find(p=>p.id===plan.id)}/>
          ))}
        </div>
        {/* Trust strip */}
        <div style={{marginTop:40,background:T.white,borderRadius:18,padding:"20px 28px",
          border:`1.5px solid ${T.border}`,display:"flex",flexWrap:"wrap",gap:20,
          justifyContent:"center",alignItems:"center"}}>
          {["🔒 256-bit SSL Payment","✅ IRDAI Approved","⚡ Instant Policy","📞 Claims Concierge","💯 Verified Reviews"].map(t=>(
            <span key={t} style={{fontSize:12,fontWeight:600,color:T.slate}}>{t}</span>
          ))}
        </div>
      </div>
      {buyPlan&&<CheckoutModal plan={buyPlan} product={type} onClose={()=>setBuyPlan(null)}/>}
      <CompareDrawer plans={compared} onRemove={id=>setCompared(p=>p.filter(x=>x.id!==id))}/>
    </div>
  );
};

// ── CLAIMS PAGE ───────────────────────────────────────────────────
const ClaimsPage = ()=>(
  <div style={{maxWidth:960,margin:"0 auto",padding:"56px 28px"}}>
    <Chip color={T.teal}>Claims</Chip>
    <h1 style={{fontFamily:"'Plus Jakarta Sans',sans-serif",
      fontSize:"clamp(28px,3.5vw,44px)",fontWeight:900,color:T.ink,
      marginTop:12,marginBottom:12,letterSpacing:"-1px"}}>Claims Assistance</h1>
    <p style={{color:T.slate,fontSize:16,marginBottom:48}}>
      Our claim settlement ratio across all partners is <strong style={{color:"#1B6B3A"}}>97.8%</strong>. We guide you at every step.
    </p>
    <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(200px,1fr))",gap:20,marginBottom:52}}>
      {[["📞","Notify Immediately","Call or WhatsApp within 24 hrs of any incident."],
        ["📋","Submit Form","Fill the online form with incident details & documents."],
        ["🔍","Verification","Reviewed and surveyed within 2 working days."],
        ["💰","Settlement","Paid to your bank or via cashless facility."],
      ].map(([e,t,d],i)=>(
        <div key={t} style={{background:T.white,borderRadius:20,padding:28,
          border:`1.5px solid ${T.border}`,textAlign:"center"}}>
          <div style={{fontSize:40,marginBottom:14}}>{e}</div>
          <div style={{fontSize:11,fontWeight:700,color:T.teal,marginBottom:6,
            letterSpacing:".05em",textTransform:"uppercase",
            fontFamily:"'Plus Jakarta Sans',sans-serif"}}>Step {i+1}</div>
          <div style={{fontWeight:800,fontSize:15,color:T.ink,marginBottom:8,
            fontFamily:"'Plus Jakarta Sans',sans-serif"}}>{t}</div>
          <div style={{fontSize:13,color:T.slate,lineHeight:1.6}}>{d}</div>
        </div>
      ))}
    </div>
    <div style={{background:`linear-gradient(135deg,${T.teal},${T.tealMid})`,
      borderRadius:24,padding:"44px 40px",textAlign:"center",
      boxShadow:`0 16px 50px ${T.teal}40`}}>
      <div style={{fontFamily:"'Plus Jakarta Sans',sans-serif",fontSize:28,
        fontWeight:900,color:"#fff",marginBottom:8}}>Need help with a claim?</div>
      <div style={{color:"rgba(255,255,255,.7)",marginBottom:28,fontSize:15}}>Our team is available 24×7</div>
      <div style={{display:"flex",gap:14,justifyContent:"center",flexWrap:"wrap"}}>
        <Btn variant="lime" size="lg">📞 Call 1800-XXX-XXXX</Btn>
        <Btn size="lg" style={{background:"rgba(255,255,255,.15)",color:"#fff",
          border:"1px solid rgba(255,255,255,.3)",borderRadius:14}}>💬 WhatsApp Us</Btn>
      </div>
    </div>
  </div>
);

// ── ABOUT PAGE ────────────────────────────────────────────────────
const AboutPage = ()=>(
  <div style={{maxWidth:960,margin:"0 auto",padding:"56px 28px"}}>
    <Chip color={T.teal}>About Us</Chip>
    <h1 style={{fontFamily:"'Plus Jakarta Sans',sans-serif",
      fontSize:"clamp(28px,3.5vw,44px)",fontWeight:900,color:T.ink,
      marginTop:12,marginBottom:16,letterSpacing:"-1px"}}>
      Insurance, simplified<br/>for every Indian.
    </h1>
    <div style={{color:T.slate,fontSize:16,lineHeight:1.8,maxWidth:640,marginBottom:48}}>
      Greatzed LLP is an IRDAI-licensed web aggregator on a mission to make insurance transparent, affordable, and simple. We compare 200+ plans from 30+ trusted insurers — with zero bias and zero hidden charges.
    </div>
    <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(180px,1fr))",gap:16,marginBottom:52}}>
      {[["50L+","Lives Insured"],["₹1200Cr+","Claims Settled"],["30+","Partners"],["4.8★","Rating"]].map(([v,l])=>(
        <div key={l} style={{background:T.white,borderRadius:18,padding:26,
          textAlign:"center",border:`1.5px solid ${T.border}`}}>
          <div style={{fontFamily:"'Plus Jakarta Sans',sans-serif",fontSize:36,
            fontWeight:900,color:T.teal,marginBottom:6}}>{v}</div>
          <div style={{fontSize:13,color:T.mist}}>{l}</div>
        </div>
      ))}
    </div>
    <div style={{background:T.white,borderRadius:20,padding:32,border:`1.5px solid ${T.border}`}}>
      <div style={{fontFamily:"'Plus Jakarta Sans',sans-serif",fontWeight:800,
        fontSize:18,color:T.ink,marginBottom:20}}>Our Commitments</div>
      {["100% unbiased recommendations — rankings are purely algorithmic",
        "Zero hidden charges — the price you see is exactly what you pay",
        "Dedicated post-purchase support and claims concierge from Day 1",
        "Your data is never sold to third parties, ever",
        "Fully regulated by IRDAI — compliant with all insurance laws",
      ].map((txt,i)=>(
        <div key={i} style={{display:"flex",gap:12,marginBottom:14,fontSize:14,color:T.slate}}>
          <div style={{width:22,height:22,borderRadius:99,background:T.lime,
            display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0,marginTop:1}}>
            <svg width="11" height="11" viewBox="0 0 12 10">
              <polyline points="1 5 4.5 8.5 11 1" stroke={T.teal} strokeWidth="2" fill="none" strokeLinecap="round"/>
            </svg>
          </div>
          {txt}
        </div>
      ))}
    </div>
  </div>
);

// ── LOGIN PAGE ────────────────────────────────────────────────────
const LoginPage = ({setPage})=>{
  const [tab,setTab]=useState("login");
  const [form,setForm]=useState({name:"",email:"",phone:"",otp:""});
  const [otpSent,setOtpSent]=useState(false);
  const [loading,setLoading]=useState(false);

  const sendOtp=async()=>{
    if(!/^[6-9]\d{9}$/.test(form.phone)){alert("Enter a valid 10-digit mobile number");return;}
    setLoading(true);
    // TODO: integrate Supabase Auth phone OTP
    // await supabase.auth.signInWithOtp({phone:"+91"+form.phone})
    setTimeout(()=>{setOtpSent(true);setLoading(false);},800);
  };

  const submit=async()=>{
    setLoading(true);
    // TODO: verify OTP with Supabase
    // await supabase.auth.verifyOtp({phone:"+91"+form.phone,token:form.otp,type:"sms"})
    setTimeout(()=>{setLoading(false);setPage("home");},800);
  };

  return(
    <div style={{minHeight:"80vh",display:"flex",alignItems:"center",justifyContent:"center",
      padding:24,background:`radial-gradient(ellipse at 60% 0%,${T.tealLt} 0%,${T.paper} 60%)`}}>
      <div style={{background:T.white,borderRadius:24,padding:44,width:"100%",maxWidth:420,
        boxShadow:"0 16px 60px rgba(11,77,74,.12)",border:`1.5px solid ${T.border}`}}>
        <div style={{textAlign:"center",marginBottom:32}}>
          <div style={{width:56,height:56,borderRadius:16,
            background:`linear-gradient(135deg,${T.teal},${T.tealMid})`,
            display:"flex",alignItems:"center",justifyContent:"center",
            margin:"0 auto 18px",boxShadow:`0 8px 24px ${T.teal}40`}}>
            <svg width="26" height="26" viewBox="0 0 24 24" fill="none">
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" fill="#fff" fillOpacity=".9"/>
              <polyline points="9 12 11 14 15 10" stroke={T.lime} strokeWidth="2.2" strokeLinecap="round" fill="none"/>
            </svg>
          </div>
          <div style={{fontFamily:"'Plus Jakarta Sans',sans-serif",fontWeight:900,
            fontSize:22,color:T.ink,letterSpacing:"-.5px"}}>Welcome to Greatzed</div>
          <div style={{fontSize:14,color:T.mist,marginTop:6}}>Login to manage your policies & claims</div>
        </div>
        <div style={{display:"flex",background:T.paper,borderRadius:12,padding:4,marginBottom:26,gap:4}}>
          {["login","signup"].map(t=>(
            <button key={t} onClick={()=>setTab(t)} style={{flex:1,padding:"10px",borderRadius:10,
              border:"none",cursor:"pointer",fontFamily:"'Plus Jakarta Sans',sans-serif",
              fontWeight:700,fontSize:14,background:tab===t?T.white:"transparent",
              color:tab===t?T.ink:T.mist,
              boxShadow:tab===t?"0 2px 10px rgba(0,0,0,.07)":"none",transition:"all .15s"}}>
              {t==="login"?"Login":"Sign Up"}
            </button>
          ))}
        </div>
        {tab==="signup"&&[["Full Name","text","name","As per Aadhaar"],["Email","email","email","you@email.com"]].map(([l,t,k,p])=>(
          <div key={k} style={{marginBottom:14}}>
            <label style={{fontSize:11,fontWeight:700,color:T.mist,display:"block",
              marginBottom:5,textTransform:"uppercase",letterSpacing:".06em"}}>{l}</label>
            <input type={t} placeholder={p} value={form[k]}
              onChange={e=>setForm(p=>({...p,[k]:e.target.value}))}
              style={{width:"100%",padding:"12px 14px",borderRadius:11,fontSize:14,
                border:`1.5px solid ${T.border}`,background:"#FAFCFB",boxSizing:"border-box"}}/>
          </div>
        ))}
        <div style={{marginBottom:14}}>
          <label style={{fontSize:11,fontWeight:700,color:T.mist,display:"block",
            marginBottom:5,textTransform:"uppercase",letterSpacing:".06em"}}>Mobile Number</label>
          <div style={{display:"flex",gap:8}}>
            <input placeholder="10-digit mobile" value={form.phone}
              onChange={e=>setForm(p=>({...p,phone:e.target.value}))}
              style={{flex:1,padding:"12px 14px",borderRadius:11,fontSize:14,
                border:`1.5px solid ${T.border}`,background:"#FAFCFB"}}/>
            <Btn onClick={sendOtp} variant={otpSent?"ghost":"outline"} size="sm" disabled={loading}>
              {loading?"…":otpSent?"Resend":"Get OTP"}
            </Btn>
          </div>
        </div>
        {otpSent&&(
          <div style={{marginBottom:22}}>
            <label style={{fontSize:11,fontWeight:700,color:T.mist,display:"block",
              marginBottom:5,textTransform:"uppercase",letterSpacing:".06em"}}>Enter OTP</label>
            <input placeholder="• • • • • •" maxLength={6} value={form.otp}
              onChange={e=>setForm(p=>({...p,otp:e.target.value.replace(/\D/g,"")}))}
              style={{width:"100%",padding:"14px",borderRadius:11,fontSize:24,
                border:`1.5px solid ${T.border}`,background:"#FAFCFB",
                textAlign:"center",letterSpacing:".4em",fontWeight:700,
                color:T.teal,boxSizing:"border-box"}}/>
          </div>
        )}
        <Btn onClick={submit} variant="primary" size="md" full disabled={loading} style={{marginBottom:16}}>
          {loading?"Processing…":tab==="login"?"Login →":"Create Account →"}
        </Btn>
        <div style={{fontSize:11,color:T.mist,textAlign:"center",lineHeight:1.7}}>
          By continuing, you agree to our{" "}
          <span style={{color:T.teal,cursor:"pointer",fontWeight:600}}>Terms</span> and{" "}
          <span style={{color:T.teal,cursor:"pointer",fontWeight:600}}>Privacy Policy</span>
        </div>
      </div>
    </div>
  );
};

// ── ADMIN PAGE ────────────────────────────────────────────────────
const AdminPage = ({setPage})=>{
  const [tab,setTab]=useState("leads");
  const [data,setData]=useState([]);
  const [loading,setLoading]=useState(true);
  const [adminKey,setAdminKey]=useState("");
  const [authed,setAuthed]=useState(false);

  const ADMIN_KEY=import.meta.env.VITE_ADMIN_KEY||"greatzed-admin-2024";

  const load=async(t)=>{
    setLoading(true);
    try{
      const r=await fetch(`${API}/api/admin/${t}`,{headers:{"x-admin-key":adminKey}});
      const j=await r.json();
      setData(j[t]||[]);
    }catch{setData([]);}
    setLoading(false);
  };

  useEffect(()=>{if(authed)load(tab);},[tab,authed]);

  if(!authed) return(
    <div style={{minHeight:"80vh",display:"flex",alignItems:"center",justifyContent:"center",padding:24}}>
      <div style={{background:T.white,borderRadius:24,padding:44,width:"100%",maxWidth:380,
        boxShadow:"0 16px 60px rgba(11,77,74,.12)",border:`1.5px solid ${T.border}`,textAlign:"center"}}>
        <div style={{fontSize:48,marginBottom:16}}>🔐</div>
        <div style={{fontFamily:"'Plus Jakarta Sans',sans-serif",fontWeight:900,fontSize:22,
          color:T.ink,marginBottom:8}}>Admin Access</div>
        <div style={{fontSize:14,color:T.mist,marginBottom:24}}>Enter your admin key to continue</div>
        <input type="password" placeholder="Admin key" value={adminKey}
          onChange={e=>setAdminKey(e.target.value)}
          onKeyDown={e=>e.key==="Enter"&&setAuthed(adminKey===ADMIN_KEY)}
          style={{width:"100%",padding:"13px 14px",borderRadius:11,fontSize:15,
            border:`1.5px solid ${T.border}`,background:"#FAFCFB",
            marginBottom:14,boxSizing:"border-box",textAlign:"center",letterSpacing:".2em"}}/>
        <Btn onClick={()=>setAuthed(adminKey===ADMIN_KEY)} variant="primary" size="md" full>
          Access Dashboard →
        </Btn>
      </div>
    </div>
  );

  const tabs=[
    {k:"leads",     label:"📋 Leads",     cols:["name","phone","email","product","status","created_at"]},
    {k:"policies",  label:"📄 Policies",  cols:["policy_number","holder_name","holder_email","holder_phone","plan_id","status","issued_at"]},
    {k:"transactions",label:"💳 Transactions",cols:["razorpay_order_id","plan_id","amount","status","created_at"]},
    {k:"claims",    label:"🩺 Claims",    cols:["claim_number","claim_type","amount_claimed","status","created_at"]},
  ];
  const activeTab=tabs.find(t=>t.k===tab);

  return(
    <div style={{background:T.paper,minHeight:"100vh"}}>
      <div style={{background:`linear-gradient(135deg,${T.teal},${T.tealMid})`,padding:"32px 28px"}}>
        <div style={{maxWidth:1300,margin:"0 auto",display:"flex",justifyContent:"space-between",alignItems:"center"}}>
          <div>
            <div style={{fontFamily:"'Plus Jakarta Sans',sans-serif",fontWeight:900,
              fontSize:24,color:"#fff",marginBottom:4}}>Greatzed Admin</div>
            <div style={{fontSize:13,color:"rgba(255,255,255,.65)"}}>Manage leads, policies, transactions & claims</div>
          </div>
          <div style={{display:"flex",gap:10}}>
            <Btn onClick={()=>load(tab)} variant="white" size="sm">🔄 Refresh</Btn>
            <Btn onClick={()=>setPage("home")} variant="ghost" size="sm"
              style={{color:"#fff",borderColor:"rgba(255,255,255,.4)"}}>← Site</Btn>
          </div>
        </div>
      </div>

      <div style={{maxWidth:1300,margin:"0 auto",padding:"28px 28px"}}>
        {/* Stats row */}
        <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(180px,1fr))",
          gap:16,marginBottom:28}}>
          {[["📋","Total Leads",data.length&&tab==="leads"?data.length:"—"],
            ["📄","Active Policies","—"],
            ["💳","Total Revenue","—"],
            ["🩺","Open Claims","—"],
          ].map(([e,l,v])=>(
            <div key={l} style={{background:T.white,borderRadius:16,padding:"20px 22px",
              border:`1.5px solid ${T.border}`}}>
              <div style={{fontSize:28,marginBottom:8}}>{e}</div>
              <div style={{fontSize:26,fontWeight:900,color:T.teal,
                fontFamily:"'Plus Jakarta Sans',sans-serif"}}>{v}</div>
              <div style={{fontSize:12,color:T.mist,marginTop:2}}>{l}</div>
            </div>
          ))}
        </div>

        {/* Tab bar */}
        <div style={{display:"flex",gap:8,marginBottom:20,flexWrap:"wrap"}}>
          {tabs.map(t=>(
            <button key={t.k} onClick={()=>setTab(t.k)} style={{padding:"10px 18px",
              borderRadius:10,border:`1.5px solid ${tab===t.k?T.teal:T.border}`,
              background:tab===t.k?T.teal:T.white,color:tab===t.k?"#fff":T.slate,
              fontWeight:600,fontSize:13,cursor:"pointer",transition:"all .15s",
              fontFamily:"'Plus Jakarta Sans',sans-serif"}}>{t.label}</button>
          ))}
        </div>

        {/* Table */}
        <div style={{background:T.white,borderRadius:16,border:`1.5px solid ${T.border}`,overflow:"hidden"}}>
          <div style={{padding:"16px 20px",borderBottom:`1px solid ${T.border}`,
            display:"flex",justifyContent:"space-between",alignItems:"center"}}>
            <div style={{fontFamily:"'Plus Jakarta Sans',sans-serif",fontWeight:700,
              fontSize:15,color:T.ink}}>{activeTab.label}</div>
            <div style={{fontSize:12,color:T.mist}}>{data.length} records</div>
          </div>
          {loading?(
            <div style={{padding:48,textAlign:"center"}}>
              <div style={{width:36,height:36,borderRadius:"50%",border:`3px solid ${T.border}`,
                borderTopColor:T.teal,animation:"spin .8s linear infinite",margin:"0 auto 12px"}}/>
              <div style={{color:T.mist,fontSize:14}}>Loading data from Supabase...</div>
            </div>
          ):(
            <div style={{overflowX:"auto"}}>
              <table style={{width:"100%",borderCollapse:"collapse",fontSize:13}}>
                <thead>
                  <tr style={{background:T.paper}}>
                    {activeTab.cols.map(c=>(
                      <th key={c} style={{padding:"12px 16px",textAlign:"left",fontWeight:700,
                        color:T.slate,fontSize:11,textTransform:"uppercase",letterSpacing:".05em",
                        borderBottom:`1px solid ${T.border}`,whiteSpace:"nowrap"}}>{c.replace(/_/g," ")}</th>
                    ))}
                    <th style={{padding:"12px 16px",borderBottom:`1px solid ${T.border}`}}></th>
                  </tr>
                </thead>
                <tbody>
                  {data.length===0?(
                    <tr><td colSpan={activeTab.cols.length+1} style={{padding:32,textAlign:"center",color:T.mist}}>
                      No records found. Data will appear here once users start transacting.
                    </td></tr>
                  ):data.map((row,i)=>(
                    <tr key={i} style={{borderBottom:`1px solid ${T.border}`,
                      transition:"background .15s"}}
                      onMouseEnter={e=>e.currentTarget.style.background="#F5FAF9"}
                      onMouseLeave={e=>e.currentTarget.style.background="transparent"}>
                      {activeTab.cols.map(c=>(
                        <td key={c} style={{padding:"13px 16px",color:T.ink,whiteSpace:"nowrap",maxWidth:200,overflow:"hidden",textOverflow:"ellipsis"}}>
                          {c==="status"?(
                            <span style={{padding:"3px 10px",borderRadius:99,fontSize:11,fontWeight:700,
                              background:row[c]==="active"||row[c]==="paid"||row[c]==="converted"?"#E8FBF0":
                                row[c]==="pending"||row[c]==="new"?"#FFF8E6":"#FFF0F0",
                              color:row[c]==="active"||row[c]==="paid"||row[c]==="converted"?"#1B6B3A":
                                row[c]==="pending"||row[c]==="new"?"#7B5B00":"#CC0000"}}>
                              {row[c]}
                            </span>
                          ):c.includes("_at")?(
                            row[c]?new Date(row[c]).toLocaleDateString("en-IN",{day:"2-digit",month:"short",year:"numeric"}):"-"
                          ):c==="amount"?(
                            row[c]?`₹${Number(row[c]).toLocaleString()}`:"-"
                          ):(row[c]||"-")}
                        </td>
                      ))}
                      <td style={{padding:"13px 16px"}}>
                        {tab==="leads"&&(
                          <button style={{fontSize:11,fontWeight:600,padding:"4px 10px",
                            borderRadius:6,border:`1px solid ${T.border}`,
                            background:"none",cursor:"pointer",color:T.teal}}
                            onClick={()=>alert(`Lead: ${row.name||""} — ${row.phone||""}`)}>
                            View
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// ── APP ROOT ──────────────────────────────────────────────────────
export default function App(){
  const [page,setPage]=useState("home");
  const render=()=>{
    if(page==="home")    return <HomePage setPage={setPage}/>;
    if(page==="claims")  return <ClaimsPage/>;
    if(page==="about")   return <AboutPage/>;
    if(page==="login")   return <LoginPage setPage={setPage}/>;
    if(page==="admin")   return <AdminPage setPage={setPage}/>;
    if(["car","health","life","travel"].includes(page))
      return <ProductPage type={page} setPage={setPage}/>;
    return <HomePage setPage={setPage}/>;
  };
  return(
    <>
      <style>{STYLES}</style>
      <div style={{minHeight:"100vh",background:T.paper}}>
        <Navbar page={page} setPage={setPage}/>
        {render()}
        {/* Hidden admin link - go to /#admin or click footer */}
        <div style={{position:"fixed",bottom:16,right:16,zIndex:999,opacity:0,
          transition:"opacity .2s"}}
          onMouseEnter={e=>e.currentTarget.style.opacity="1"}
          onMouseLeave={e=>e.currentTarget.style.opacity="0"}>
          <button onClick={()=>setPage("admin")} style={{background:T.teal,color:"#fff",
            border:"none",borderRadius:10,padding:"8px 14px",fontSize:12,
            cursor:"pointer",fontWeight:600,boxShadow:`0 4px 14px ${T.teal}50`}}>
            Admin ⚙
          </button>
        </div>
      </div>
    </>
  );
}
