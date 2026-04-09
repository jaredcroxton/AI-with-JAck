"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";

function AnimatedPanel() {
  return (
    <div className="hidden lg:flex relative w-full h-full overflow-hidden bg-gradient-to-br from-[#1a1a2e] via-[#16213e] to-[#0f3460]">
      {/* Animated gradient background */}
      <div className="absolute inset-0 bg-gradient-to-br from-[var(--accent-blue)]/20 via-[var(--accent-teal)]/10 to-[var(--accent-green)]/20 animate-gradient-shift" />

      {/* Floating orbs */}
      <div className="absolute top-[15%] left-[10%] w-72 h-72 rounded-full bg-[var(--accent-blue)]/20 blur-3xl animate-float-slow" />
      <div className="absolute bottom-[20%] right-[5%] w-96 h-96 rounded-full bg-[var(--accent-teal)]/15 blur-3xl animate-float-medium" />
      <div className="absolute top-[50%] left-[50%] w-64 h-64 rounded-full bg-[var(--accent-green)]/15 blur-3xl animate-pulse-glow" />

      {/* Floating glass cards */}
      <div className="absolute top-[12%] left-[8%] w-48 h-32 rounded-2xl bg-white/5 backdrop-blur-sm border border-white/10 animate-float-slow p-4">
        <div className="flex items-center gap-2 mb-3">
          <div className="w-8 h-8 rounded-lg bg-emerald-500/20 flex items-center justify-center">
            <svg className="w-4 h-4 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 15.75 7.5-7.5 7.5 7.5" />
            </svg>
          </div>
          <span className="text-xs text-white/60">Team health</span>
        </div>
        <div className="text-3xl font-extrabold text-white">8.4</div>
        <div className="text-xs text-emerald-400 mt-1">+12% this week</div>
      </div>

      <div className="absolute top-[55%] right-[8%] w-52 h-36 rounded-2xl bg-white/5 backdrop-blur-sm border border-white/10 animate-float-medium p-4" style={{ animationDelay: "1s" }}>
        <div className="flex items-center gap-2 mb-3">
          <div className="w-8 h-8 rounded-lg bg-[var(--accent-blue)]/20 flex items-center justify-center">
            <svg className="w-4 h-4 text-[var(--accent-blue)]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
            </svg>
          </div>
          <span className="text-xs text-white/60">Completion</span>
        </div>
        <div className="text-3xl font-extrabold text-white">94%</div>
        <div className="mt-2 h-1.5 rounded-full bg-white/10 overflow-hidden">
          <div className="h-full w-[94%] rounded-full gradient-bg" />
        </div>
      </div>

      <div className="absolute bottom-[15%] left-[15%] w-56 h-28 rounded-2xl bg-white/5 backdrop-blur-sm border border-white/10 animate-float-fast p-4" style={{ animationDelay: "2s" }}>
        <div className="flex items-center gap-2 mb-2">
          <div className="w-6 h-6 rounded-full gradient-bg flex items-center justify-center text-white text-xs font-bold">A</div>
          <div className="w-6 h-6 rounded-full bg-purple-500/30 flex items-center justify-center text-white text-xs font-bold">T</div>
          <div className="w-6 h-6 rounded-full bg-[var(--accent-teal)]/30 flex items-center justify-center text-white text-xs font-bold">M</div>
          <span className="text-xs text-white/40 ml-1">+5 more</span>
        </div>
        <div className="text-sm font-semibold text-white/80">All reflections in</div>
        <div className="text-xs text-[var(--accent-teal)] mt-0.5">Zero flags this week</div>
      </div>

      {/* Decorative rings */}
      <div className="absolute top-[30%] right-[25%] w-40 h-40 rounded-full border border-white/5 animate-float-slow" style={{ animationDelay: "3s" }} />
      <div className="absolute bottom-[35%] left-[35%] w-24 h-24 rounded-full border border-white/5 animate-float-medium" style={{ animationDelay: "1.5s" }} />

      {/* Center content */}
      <div className="relative z-10 flex flex-col items-center justify-center w-full px-12">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-12 h-12 rounded-2xl gradient-bg shadow-lg shadow-[var(--accent-blue)]/30 flex items-center justify-center">
            <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 3v11.25A2.25 2.25 0 0 0 6 16.5h2.25M3.75 3h-1.5m1.5 0h16.5m0 0h1.5m-1.5 0v11.25A2.25 2.25 0 0 1 18 16.5h-2.25m-7.5 0h7.5m-7.5 0-1 3m8.5-3 1 3m0 0 .5 1.5m-.5-1.5h-9.5m0 0-.5 1.5M9 11.25v1.5M12 9v3.75m3-6v6" />
            </svg>
          </div>
          <div>
            <h2 className="text-2xl font-bold text-white tracking-tight">
              Pulse Check<span className="gradient-text">360</span>
            </h2>
          </div>
        </div>
        <p className="text-lg text-white/70 text-center max-w-sm leading-relaxed">
          Structured one-on-ones. Safer teams. Surface what matters before it escalates.
        </p>

        {/* Feature pills */}
        <div className="flex flex-wrap gap-2 mt-8 justify-center max-w-md">
          {[
            "Weekly reflections",
            "AI risk detection",
            "Team health pulse",
            "Audit trail",
            "Action items",
            "Executive view",
          ].map((feature) => (
            <span
              key={feature}
              className="px-3 py-1.5 rounded-full bg-white/5 border border-white/10 text-xs text-white/60 backdrop-blur-sm"
            >
              {feature}
            </span>
          ))}
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
      <div className="hidden lg:block lg:w-[55%]">
        <AnimatedPanel />
      </div>

      {/* Right: Sign in form */}
      <div className="flex-1 flex items-center justify-center bg-[#F8FAFC] px-6">
        <div className="w-full max-w-md animate-slide-up">
          {/* Mobile logo */}
          <div className="lg:hidden flex items-center justify-center gap-2 mb-8">
            <div className="w-10 h-10 rounded-xl gradient-bg shadow-lg shadow-[var(--accent-blue)]/20" />
            <span className="text-xl font-bold text-[var(--text-on-light)] tracking-tight">
              Pulse Check<span className="gradient-text">360</span>
            </span>
          </div>

          {/* Header */}
          <div className="mb-8">
            <p className="text-sm font-medium text-[var(--text-secondary)] mb-1">
              {isSignUp ? "Get started" : "Welcome back"}
            </p>
            <h1 className="text-3xl font-bold text-[var(--text-on-light)]">
              {isSignUp ? "Create your account" : "Sign in"}
            </h1>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {isSignUp && (
              <>
                <div>
                  <label className="block text-sm font-medium text-[var(--text-on-light)] mb-1.5">
                    Full name
                  </label>
                  <input
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    required
                    className="w-full px-4 py-3.5 rounded-xl border border-gray-200 bg-white text-[var(--text-on-light)] focus:outline-none focus:ring-2 focus:ring-[var(--accent-teal)] focus:border-transparent transition text-sm"
                    placeholder="Your full name"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-[var(--text-on-light)] mb-1.5">
                    I am a
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={() => setRole("team_member")}
                      className={`py-3.5 rounded-xl text-sm font-semibold transition-all ${
                        role === "team_member"
                          ? "gradient-bg text-white shadow-lg shadow-[var(--accent-blue)]/20"
                          : "bg-white border border-gray-200 text-[var(--text-secondary)] hover:border-gray-300"
                      }`}
                    >
                      Team Member
                    </button>
                    <button
                      type="button"
                      onClick={() => setRole("manager")}
                      className={`py-3.5 rounded-xl text-sm font-semibold transition-all ${
                        role === "manager"
                          ? "gradient-bg text-white shadow-lg shadow-[var(--accent-blue)]/20"
                          : "bg-white border border-gray-200 text-[var(--text-secondary)] hover:border-gray-300"
                      }`}
                    >
                      Manager
                    </button>
                  </div>
                </div>
              </>
            )}

            <div>
              <label className="block text-sm font-medium text-[var(--text-on-light)] mb-1.5">
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full px-4 py-3.5 rounded-xl border border-gray-200 bg-white text-[var(--text-on-light)] focus:outline-none focus:ring-2 focus:ring-[var(--accent-teal)] focus:border-transparent transition text-sm"
                placeholder="you@company.com"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-[var(--text-on-light)] mb-1.5">
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
                className="w-full px-4 py-3.5 rounded-xl border border-gray-200 bg-white text-[var(--text-on-light)] focus:outline-none focus:ring-2 focus:ring-[var(--accent-teal)] focus:border-transparent transition text-sm"
                placeholder="At least six characters"
              />
            </div>

            {error && (
              <div className="p-3 rounded-xl bg-red-50 text-[var(--soft-red)] text-sm">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 rounded-xl font-semibold text-white gradient-bg hover:opacity-90 transition disabled:opacity-50 shadow-lg shadow-[var(--accent-blue)]/20 text-sm"
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
              className="text-[var(--accent-teal)] font-semibold hover:underline"
            >
              {isSignUp ? "Sign in" : "Sign up"}
            </button>
          </p>

          <div className="mt-12 pt-6 border-t border-gray-200 text-center">
            <p className="text-xs text-[var(--text-secondary)]">
              Built for teams that value their people.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return <LoginForm />;
}
