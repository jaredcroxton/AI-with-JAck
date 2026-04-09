"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { AccorLogo } from "../accor-logo";

function AnimatedPanel() {
  return (
    <div className="hidden lg:flex relative w-full h-full overflow-hidden">
      {/* Deep blue to teal gradient base */}
      <div
        className="absolute inset-0"
        style={{
          background: "linear-gradient(160deg, #050033 0%, #0A1647 25%, #0E2B5A 50%, #0B3D5E 75%, #083B4A 100%)",
        }}
      />

      {/* Flowing light */}
      <div
        className="absolute inset-0 animate-float-slow"
        style={{
          background: "radial-gradient(ellipse at 65% 25%, rgba(79,110,247,0.2) 0%, transparent 55%)",
        }}
      />
      <div
        className="absolute inset-0 animate-float-medium"
        style={{
          background: "radial-gradient(ellipse at 25% 75%, rgba(6,214,160,0.12) 0%, transparent 50%)",
        }}
      />

      {/* Floating orbs */}
      <div className="absolute top-[10%] right-[5%] w-96 h-96 rounded-full bg-[#4F6EF7]/15 blur-3xl animate-pulse-glow" />
      <div className="absolute bottom-[15%] left-[5%] w-80 h-80 rounded-full bg-[#06D6A0]/10 blur-3xl animate-float-slow" />
      <div className="absolute top-[45%] left-[35%] w-64 h-64 rounded-full bg-[#818CF8]/10 blur-3xl animate-float-medium" />

      {/* Soft vignette */}
      <div className="absolute inset-0" style={{
        background: "radial-gradient(ellipse at center, transparent 30%, rgba(5,0,51,0.5) 100%)",
      }} />

      {/* Content overlay */}
      <div className="relative z-10 flex flex-col items-center justify-center w-full px-12">
        {/* Logo */}
        <div className="animate-float-slow">
          <AccorLogo className="h-20 text-white drop-shadow-[0_4px_12px_rgba(0,0,0,0.3)]" />
        </div>

        {/* Explorer text */}
        <div className="mt-4 animate-float-medium" style={{ animationDelay: "0.5s" }}>
          <div
            className="text-6xl font-bold italic"
            style={{
              color: "#FBBF24",
              fontFamily: "Georgia, serif",
              textShadow: "0 4px 20px rgba(251,191,36,0.5), 0 2px 6px rgba(0,0,0,0.3)",
            }}
          >
            Explorer
          </div>
        </div>

        {/* Shimmer line */}
        <div className="w-32 h-px mt-8 mb-8" style={{
          background: "linear-gradient(90deg, transparent, rgba(79,110,247,0.4), rgba(6,214,160,0.4), transparent)",
        }} />

        {/* Powered by */}
        <div className="text-center">
          <p className="text-white/40 text-xs uppercase tracking-[0.2em] mb-2">
            Powered by
          </p>
          <p className="text-white text-xl font-bold tracking-tight">
            Perform<span className="gradient-text">OS</span>
          </p>
        </div>
      </div>
    </div>
  );
}

function LoginForm() {
  const router = useRouter();

  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [role, setRole] = useState<"manager" | "team_member">("team_member");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    const supabase = createClient();

    if (isSignUp) {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: { full_name: fullName, role },
        },
      });
      if (error) {
        setError(error.message);
        setLoading(false);
        return;
      }
    } else {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (error) {
        setError(error.message);
        setLoading(false);
        return;
      }
    }

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (user) {
      const { data: profile } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", user.id)
        .single();

      if (profile?.role === "executive") {
        router.push("/executive");
      } else if (profile?.role === "manager") {
        router.push("/dashboard");
      } else {
        router.push("/my-sessions");
      }
    } else {
      router.push("/my-sessions");
    }
  }

  return (
    <div className="min-h-screen flex">
      {/* Left: Animated visual panel */}
      <div className="hidden lg:block lg:w-[50%]">
        <AnimatedPanel />
      </div>

      {/* Right: Sign in form */}
      <div className="flex-1 flex items-center justify-center bg-white px-6">
        <div className="w-full max-w-md animate-slide-up">
          {/* Mobile logo */}
          <div className="lg:hidden flex items-center justify-center gap-2 mb-8">
            <AccorLogo className="h-8 text-[var(--primary)]" />
          </div>

          {/* Desktop logo */}
          <div className="hidden lg:flex items-center gap-3 mb-10">
            <AccorLogo className="h-7 text-[var(--primary)]" />
          </div>

          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-[var(--text-primary)]">
              {isSignUp ? "Create your account" : "Sign in"}
            </h1>
            <p className="text-sm text-[var(--text-secondary)] mt-2">
              {isSignUp
                ? "Set up your Pulse Check360 account"
                : "Welcome back to Pulse Check360"}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {isSignUp && (
              <>
                <div>
                  <label className="block text-sm font-medium text-[var(--text-primary)] mb-1.5">
                    Full name
                  </label>
                  <input
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    required
                    className="w-full px-4 py-3.5 rounded-xl border border-[var(--border)] bg-white text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--accent-blue)]/30 focus:border-[var(--accent-blue)] transition text-sm"
                    placeholder="Your full name"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-[var(--text-primary)] mb-1.5">
                    I am a
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={() => setRole("team_member")}
                      className={`py-3.5 rounded-xl text-sm font-semibold transition-all ${
                        role === "team_member"
                          ? "btn-primary"
                          : "bg-[var(--surface)] border border-[var(--border)] text-[var(--text-secondary)] hover:border-gray-300"
                      }`}
                    >
                      Team Member
                    </button>
                    <button
                      type="button"
                      onClick={() => setRole("manager")}
                      className={`py-3.5 rounded-xl text-sm font-semibold transition-all ${
                        role === "manager"
                          ? "btn-primary"
                          : "bg-[var(--surface)] border border-[var(--border)] text-[var(--text-secondary)] hover:border-gray-300"
                      }`}
                    >
                      Manager
                    </button>
                  </div>
                </div>
              </>
            )}

            <div>
              <label className="block text-sm font-medium text-[var(--text-primary)] mb-1.5">
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full px-4 py-3.5 rounded-xl border border-[var(--border)] bg-white text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--accent-blue)]/30 focus:border-[var(--accent-blue)] transition text-sm"
                placeholder="you@company.com"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-[var(--text-primary)] mb-1.5">
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
                className="w-full px-4 py-3.5 rounded-xl border border-[var(--border)] bg-white text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--accent-blue)]/30 focus:border-[var(--accent-blue)] transition text-sm"
                placeholder="At least six characters"
              />
            </div>

            {error && (
              <div className="p-3 rounded-xl bg-red-50 text-[var(--soft-red)] text-sm border border-red-100">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 btn-primary text-sm disabled:opacity-50"
            >
              {loading
                ? "Please wait..."
                : isSignUp
                  ? "Create account"
                  : "Sign in"}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-[var(--text-secondary)]">
            {isSignUp ? "Already have an account?" : "Need an account?"}{" "}
            <button
              type="button"
              onClick={() => {
                setIsSignUp(!isSignUp);
                setError("");
              }}
              className="text-[var(--accent-blue)] font-semibold hover:underline"
            >
              {isSignUp ? "Sign in" : "Sign up"}
            </button>
          </p>

          <div className="mt-12 pt-6 border-t border-[var(--border)] flex items-center justify-center gap-2">
            <span className="text-xs text-[var(--text-secondary)]">Powered by</span>
            <span className="text-xs font-bold text-[var(--text-primary)]">
              Perform<span className="gradient-text">OS</span>
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return <LoginForm />;
}
