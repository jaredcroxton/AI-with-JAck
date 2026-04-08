"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";

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

    // Always check the profile to route correctly
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
    <div className="min-h-screen bg-[var(--navy)] flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-2 mb-6">
            <div className="w-8 h-8 rounded-lg gradient-bg" />
            <span className="text-xl font-semibold text-white tracking-tight">
              Pulse Check<span className="gradient-text">360</span>
            </span>
          </div>
          <h1 className="text-2xl font-bold text-white">
            {isSignUp ? "Create your account" : "Welcome back"}
          </h1>
          <p className="text-sm text-white/50 mt-1">
            {isSignUp
              ? "Set up your Pulse Check360 account"
              : "Sign in to Pulse Check360"}
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="bg-white rounded-2xl p-8 shadow-xl"
        >
          {isSignUp && (
            <>
              <div className="mb-4">
                <label className="block text-sm font-medium text-[var(--text-on-light)] mb-1.5">
                  Full name
                </label>
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  required
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 text-[var(--text-on-light)] focus:outline-none focus:ring-2 focus:ring-[var(--accent-teal)] focus:border-transparent transition"
                  placeholder="Your full name"
                />
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium text-[var(--text-on-light)] mb-1.5">
                  I am a
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setRole("team_member")}
                    className={`py-3 rounded-xl text-sm font-semibold transition-all ${
                      role === "team_member"
                        ? "gradient-bg text-white shadow-lg"
                        : "bg-gray-100 text-[var(--text-secondary)] hover:bg-gray-200"
                    }`}
                  >
                    Team Member
                  </button>
                  <button
                    type="button"
                    onClick={() => setRole("manager")}
                    className={`py-3 rounded-xl text-sm font-semibold transition-all ${
                      role === "manager"
                        ? "gradient-bg text-white shadow-lg"
                        : "bg-gray-100 text-[var(--text-secondary)] hover:bg-gray-200"
                    }`}
                  >
                    Manager
                  </button>
                </div>
              </div>
            </>
          )}

          <div className="mb-4">
            <label className="block text-sm font-medium text-[var(--text-on-light)] mb-1.5">
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full px-4 py-3 rounded-xl border border-gray-200 text-[var(--text-on-light)] focus:outline-none focus:ring-2 focus:ring-[var(--accent-teal)] focus:border-transparent transition"
              placeholder="you@company.com"
            />
          </div>

          <div className="mb-6">
            <label className="block text-sm font-medium text-[var(--text-on-light)] mb-1.5">
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={6}
              className="w-full px-4 py-3 rounded-xl border border-gray-200 text-[var(--text-on-light)] focus:outline-none focus:ring-2 focus:ring-[var(--accent-teal)] focus:border-transparent transition"
              placeholder="At least six characters"
            />
          </div>

          {error && (
            <div className="mb-4 p-3 rounded-xl bg-red-50 text-[var(--soft-red)] text-sm">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-xl font-semibold text-white gradient-bg hover:opacity-90 transition disabled:opacity-50"
          >
            {loading
              ? "Please wait..."
              : isSignUp
                ? "Create account"
                : "Sign in"}
          </button>

          <p className="mt-4 text-center text-sm text-[var(--text-secondary)]">
            {isSignUp ? "Already have an account?" : "Need an account?"}{" "}
            <button
              type="button"
              onClick={() => {
                setIsSignUp(!isSignUp);
                setError("");
              }}
              className="text-[var(--accent-teal)] font-medium hover:underline"
            >
              {isSignUp ? "Sign in" : "Sign up"}
            </button>
          </p>
        </form>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return <LoginForm />;
}
