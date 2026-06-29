import { WillowMark } from "@/components/WillowMark";
import { useAccount } from "@/lib/hooks/useAccount";
import { Link } from "react-router";
import "./landing.css";

// ─── colour tokens (landing-only, not in the design system) ─────────────────
const C = {
   forest:    "#0c2016",
   forestMid: "#0f2a1c",
   forestTop: "#0a1a10",
   sage:      "#2d6e45",
   green:     "#6aad82",
   cream:     "#f4ede0",
   creamDark: "#ede4d3",
   tan:       "#d0c4b0",
   text:      "#1a130a",
   textMid:   "#6a5040",
   terra:     "#b8614e",
   creamFg:   "#f0e8d8",
   creamSub:  "rgba(232,218,196,0.72)",
} as const;


// ─── feature data ─────────────────────────────────────────────────────────────
const features = [
   {
      num: "01",
      title: "Daily check-ins",
      description:
         "Log mood, pain, fatigue, and nausea in under a minute. Small habits build a clear picture over weeks and months.",
   },
   {
      num: "02",
      title: "Spot your trends",
      description:
         "Simple charts show how your symptoms shift over time — so you can see patterns you'd otherwise miss.",
   },
   {
      num: "03",
      title: "Question list",
      description:
         "Capture questions as they come to you between appointments. Never blank out in the exam room again.",
   },
   {
      num: "04",
      title: "Visit summary",
      description:
         "Export a clean snapshot of your recent symptoms and questions to share with your care team before each visit.",
   },
   {
      num: "05",
      title: "Medication tracker",
      description:
         "Log your treatment schedule and get reminders on check-in days so nothing slips through the cracks.",
   },
   {
      num: "06",
      title: "Caregiver sharing",
      description:
         "Generate a private link so family or your care team can see your data — no account needed on their end.",
   },
];

// ─── component ────────────────────────────────────────────────────────────────
export default function LandingPage() {
   // Render logged-out CTAs immediately — never gate the landing page on the
   // /api/account rehydrate call (which can be slow on a cold API). If a user
   // turns out to be signed in, the CTAs upgrade to "Open app" once it resolves.
   const { currentUser } = useAccount();

   return (
      <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column", fontFamily: "'Figtree Variable', sans-serif" }}>

         {/* ── nav ── */}
         <header style={{
            position: "sticky", top: 0, zIndex: 50,
            background: C.forest,
            borderBottom: `1px solid rgba(106,173,130,0.14)`,
         }}>
            <div style={{
               maxWidth: 1100, margin: "0 auto", padding: "0 24px",
               height: 60, display: "flex", alignItems: "center", justifyContent: "space-between",
            }}>
               <Link to="/" style={{ display: "flex", alignItems: "center", gap: 9, textDecoration: "none" }}>
                  <span style={{ color: C.green }}>
                     <WillowMark size={20} variant="small" />
                  </span>
                  <span style={{ fontFamily: "'Lora', Georgia, serif", fontSize: 17, fontWeight: 600, color: C.creamFg, letterSpacing: "-0.01em" }}>
                     Willow
                  </span>
               </Link>

               <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                  {currentUser ? (
                     <Link to="/checkin" style={navBtnPrimary}>
                        Open app →
                     </Link>
                  ) : (
                     <>
                        <Link to="/login" style={navBtnGhost}>Log in</Link>
                        <Link to="/register" style={navBtnPrimary}>Get started →</Link>
                     </>
                  )}
               </div>
            </div>
         </header>

         {/* ── hero ── */}
         <section style={{
            background: `linear-gradient(155deg, ${C.forest} 0%, ${C.forestMid} 55%, #112b1d 100%)`,
            padding: "clamp(72px, 12vw, 120px) 24px clamp(80px, 14vw, 130px)",
            textAlign: "center",
            position: "relative",
            overflow: "hidden",
         }}>
            {/* ambient glow */}
            <div style={{
               position: "absolute", top: "45%", left: "50%",
               transform: "translate(-50%, -50%)",
               width: 640, height: 480,
               background: "radial-gradient(ellipse, rgba(35,90,58,0.45) 0%, transparent 68%)",
               pointerEvents: "none",
            }} />

            <div style={{ position: "relative", maxWidth: 680, margin: "0 auto" }}>
               {/* willow mark */}
               <div className="wl-mark" style={{ display: "flex", justifyContent: "center", marginBottom: 24, color: C.green }}>
                  <WillowMark size={72} />
               </div>

               {/* tag line */}
               <div className="wl-tag" style={{
                  display: "inline-flex", alignItems: "center", gap: 10,
                  fontSize: 11, fontWeight: 600, letterSpacing: "0.14em", textTransform: "uppercase",
                  color: C.green, marginBottom: 26,
               }}>
                  <span style={{ width: 28, height: 1, background: C.green, display: "inline-block", opacity: 0.7 }} />
                  Built for people in cancer treatment
                  <span style={{ width: 28, height: 1, background: C.green, display: "inline-block", opacity: 0.7 }} />
               </div>

               {/* headline */}
               <h1 className="wl-title" style={{
                  fontFamily: "'Lora', Georgia, serif",
                  fontSize: "clamp(38px, 6.5vw, 70px)",
                  fontWeight: 600,
                  lineHeight: 1.13,
                  color: C.creamFg,
                  marginBottom: 22,
                  letterSpacing: "-0.025em",
               }}>
                  Your companion<br />through treatment.
               </h1>

               {/* subtitle */}
               <p className="wl-sub" style={{
                  fontSize: "clamp(15px, 2vw, 18px)",
                  lineHeight: 1.75,
                  color: C.creamSub,
                  maxWidth: 500,
                  margin: "0 auto 40px",
               }}>
                  Track daily symptoms, build a list of questions for your care team, and see how you're doing over time — so you feel more prepared and less alone.
               </p>

               {/* CTA buttons */}
               <div className="wl-cta" style={{ display: "flex", gap: 10, justifyContent: "center", flexWrap: "wrap" }}>
                  {currentUser ? (
                     <Link to="/checkin" style={heroBtnPrimary}>Open app →</Link>
                  ) : (
                     <>
                        <Link to="/register" style={heroBtnPrimary}>Get started free</Link>
                        <Link to="/login" style={heroBtnGhost}>Log in</Link>
                     </>
                  )}
               </div>
            </div>
         </section>

         {/* ── features ── */}
         <section style={{ background: C.cream, padding: "clamp(72px, 10vw, 110px) 24px" }}>
            <div style={{ maxWidth: 1100, margin: "0 auto" }}>
               {/* section label */}
               <div style={{ textAlign: "center", marginBottom: 64 }}>
                  <p style={{
                     fontSize: 10.5, fontWeight: 700, letterSpacing: "0.18em", textTransform: "uppercase",
                     color: C.terra, marginBottom: 14,
                  }}>
                     What's inside
                  </p>
                  <h2 style={{
                     fontFamily: "'Lora', Georgia, serif",
                     fontSize: "clamp(26px, 4vw, 42px)",
                     fontWeight: 600,
                     color: C.text,
                     letterSpacing: "-0.02em",
                     lineHeight: 1.22,
                  }}>
                     Everything you need<br />between appointments
                  </h2>
               </div>

               {/* mosaic grid — gap acts as divider lines */}
               <div style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
                  gap: 2,
                  background: C.tan,
                  border: `2px solid ${C.tan}`,
                  borderRadius: 4,
                  overflow: "hidden",
               }}>
                  {features.map(({ num, title, description }) => (
                     <div
                        key={num}
                        className="wl-feature"
                        style={{
                           background: C.cream,
                           padding: "36px 32px 40px",
                           transition: "background-color 0.18s ease",
                        }}
                     >
                        <span style={{
                           display: "block",
                           fontSize: 10.5, fontWeight: 700, letterSpacing: "0.18em",
                           color: C.terra, marginBottom: 14,
                        }}>
                           {num}
                        </span>
                        <h3 style={{
                           fontFamily: "'Lora', Georgia, serif",
                           fontSize: 19, fontWeight: 600,
                           color: C.text,
                           marginBottom: 10,
                           letterSpacing: "-0.015em",
                           lineHeight: 1.3,
                        }}>
                           {title}
                        </h3>
                        <p style={{
                           fontSize: 14.5, lineHeight: 1.68,
                           color: C.textMid,
                        }}>
                           {description}
                        </p>
                     </div>
                  ))}
               </div>
            </div>
         </section>

         {/* ── bottom CTA ── */}
         {!currentUser && (
            <section style={{
               background: `linear-gradient(155deg, ${C.forest} 0%, ${C.forestMid} 100%)`,
               padding: "clamp(80px, 12vw, 120px) 24px",
               textAlign: "center",
            }}>
               <div style={{ maxWidth: 520, margin: "0 auto" }}>
                  <div style={{ display: "flex", justifyContent: "center", marginBottom: 28, color: C.green }}>
                     <WillowMark size={60} />
                  </div>
                  <h2 style={{
                     fontFamily: "'Lora', Georgia, serif",
                     fontSize: "clamp(28px, 4vw, 46px)",
                     fontWeight: 600,
                     color: C.creamFg,
                     marginBottom: 14,
                     letterSpacing: "-0.025em",
                     lineHeight: 1.2,
                  }}>
                     Start your journal today.
                  </h2>
                  <p style={{
                     fontSize: 15, color: C.creamSub,
                     marginBottom: 36, lineHeight: 1.6,
                  }}>
                     Free. Takes less than a minute to set up.
                  </p>
                  <Link to="/register" style={heroBtnPrimary}>
                     Get started free
                  </Link>
               </div>
            </section>
         )}

         {/* ── footer ── */}
         <footer style={{
            background: C.forestTop,
            borderTop: `1px solid rgba(106,173,130,0.10)`,
            padding: "20px 24px",
            marginTop: "auto",
         }}>
            <div style={{
               maxWidth: 1100, margin: "0 auto",
               display: "flex", alignItems: "center", justifyContent: "space-between",
               fontSize: 12.5,
               color: "rgba(196,180,158,0.45)",
            }}>
               <span>© {new Date().getFullYear()} Willow</span>
               <Link
                  to="/privacy"
                  style={{ color: "rgba(196,180,158,0.45)", textDecoration: "underline", textUnderlineOffset: 3 }}
               >
                  Privacy Policy
               </Link>
            </div>
         </footer>
      </div>
   );
}

// ─── shared button styles ─────────────────────────────────────────────────────
const navBtnGhost: React.CSSProperties = {
   color: "rgba(228,212,188,0.65)",
   fontSize: 13.5, fontWeight: 400,
   padding: "7px 14px", borderRadius: 7,
   textDecoration: "none",
   border: "1px solid rgba(255,255,255,0.08)",
   transition: "color 0.15s",
};

const navBtnPrimary: React.CSSProperties = {
   background: "#2d6e45",
   color: "#f0e8d8",
   fontSize: 13.5, fontWeight: 500,
   padding: "7px 16px", borderRadius: 7,
   textDecoration: "none",
   border: "1px solid rgba(106,173,130,0.25)",
};

const heroBtnPrimary: React.CSSProperties = {
   display: "inline-flex", alignItems: "center",
   background: "#2d6e45",
   color: "#f0e8d8",
   fontSize: 15, fontWeight: 500,
   padding: "13px 32px", borderRadius: 8,
   textDecoration: "none",
   border: "1px solid rgba(106,173,130,0.28)",
   letterSpacing: "-0.01em",
};

const heroBtnGhost: React.CSSProperties = {
   display: "inline-flex", alignItems: "center",
   color: "rgba(224,210,186,0.65)",
   fontSize: 15, fontWeight: 400,
   padding: "13px 28px", borderRadius: 8,
   textDecoration: "none",
   border: "1px solid rgba(255,255,255,0.10)",
};
