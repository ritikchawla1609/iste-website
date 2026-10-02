"use client";

import { useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import Alert from "@/components/ui/Alert";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { login, isAuthenticated, isLoading } = useAuth();

  const [uid, setUid] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const redirectTarget = searchParams?.get("redirect") || "/dashboard";

  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      router.replace(redirectTarget);
    }
  }, [isAuthenticated, isLoading, router, redirectTarget]);

  async function handleSubmit(e) {
    e.preventDefault();
    if (!uid.trim() || !password) {
      setError("Please enter both UID and Password.");
      return;
    }

    setIsSubmitting(true);
    setError("");

    try {
      await login({ uid: uid.trim(), password });
      router.push(redirectTarget);
    } catch (err) {
      setError(err.message || "Invalid administrative credentials.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "radial-gradient(ellipse at top, #1e293b 0%, #0f172a 100%)",
        padding: "24px"
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: "440px",
          background: "#ffffff",
          borderRadius: "20px",
          boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.4)",
          overflow: "hidden",
          border: "1px solid rgba(255, 255, 255, 0.1)"
        }}
      >
        {/* Header accent strip */}
        <div
          style={{
            height: "6px",
            background: "linear-gradient(90deg, var(--brand-red), var(--navy-900))"
          }}
        />

        <div style={{ padding: "40px 32px" }}>
          <div style={{ textAlign: "center", marginBottom: "32px" }}>
            <div
              style={{
                width: "72px",
                height: "72px",
                borderRadius: "18px",
                margin: "0 auto 16px",
                background: "#ffffff",
                boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.15)",
                border: "2px solid #f1f5f9",
                overflow: "hidden",
                display: "flex",
                alignItems: "center",
                justifyContent: "center"
              }}
            >
              <img
                src="/brand/iste-logo.jpg"
                alt="ISTE Logo"
                style={{ width: "100%", height: "100%", objectFit: "cover" }}
              />
            </div>

            <h1
              style={{
                fontSize: "1.6rem",
                fontWeight: 800,
                color: "var(--navy-900)",
                letterSpacing: "-0.025em"
              }}
            >
              Admin Portal
            </h1>
            <p style={{ fontSize: "0.88rem", color: "var(--text-soft)", marginTop: "4px" }}>
              Official administrative console for ISTE Student Chapter
            </p>
          </div>

          <Alert type="error" message={error} onClose={() => setError("")} />

          <form onSubmit={handleSubmit} className="admin-form">
            <div className="form-group">
              <label className="form-label" htmlFor="uid">
                Author UID <span className="required">*</span>
              </label>
              <input
                id="uid"
                type="text"
                className="form-input"
                placeholder="e.g. 24BCS10191"
                value={uid}
                onChange={(e) => setUid(e.target.value)}
                autoComplete="username"
                required
                autoFocus
              />
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="password">
                Password <span className="required">*</span>
              </label>
              <div style={{ position: "relative" }}>
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  className="form-input"
                  placeholder="Enter administrator password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  autoComplete="current-password"
                  required
                  style={{ paddingRight: "44px" }}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  style={{
                    position: "absolute",
                    right: "12px",
                    top: "50%",
                    transform: "translateY(-50%)",
                    background: "none",
                    border: "none",
                    cursor: "pointer",
                    fontSize: "1.1rem",
                    color: "var(--text-soft)"
                  }}
                  title={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? "🙈" : "👁️"}
                </button>
              </div>
            </div>

            <button
              type="submit"
              className="btn-primary btn-accent"
              disabled={isSubmitting}
              style={{ width: "100%", padding: "14px", marginTop: "8px" }}
            >
              {isSubmitting ? (
                <>
                  <span className="spinner" style={{ display: "inline-block" }}>
                    ⏳
                  </span>{" "}
                  Authenticating...
                </>
              ) : (
                "Sign In to Admin Portal"
              )}
            </button>
          </form>

          <div
            style={{
              marginTop: "24px",
              padding: "12px 16px",
              background: "#f8fafc",
              borderRadius: "8px",
              border: "1px dashed var(--line)",
              fontSize: "0.78rem",
              color: "var(--text-soft)",
              textAlign: "center"
            }}
          >
            <strong>Default bootstrap access:</strong> UID: <code>24BCS10191</code> &bull; Password:{" "}
            <code>ISTE@1609</code>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div
          style={{
            minHeight: "100vh",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            background: "#0f172a"
          }}
        >
          <div style={{ color: "white" }}>Loading...</div>
        </div>
      }
    >
      <LoginForm />
    </Suspense>
  );
}
