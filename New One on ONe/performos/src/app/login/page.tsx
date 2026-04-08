"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense } from "react";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const roleParam = searchParams.get("role") || "team_member";

  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
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
          data: { full_name: fullName, role: roleParam },
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

    if (roleParam === "manager") {
      router.push("/dashboard");
    } else {
      router.push("/my-sessions");
    }
  }

  const roleLabel = roleParam === "manager" ? "Manager" : "Team Member";

  return (
    <div className="min-h-screen bg-[var(--navy)] flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-2 mb-6">
            <div className="w-8 h-8 rounded-lg gradient-bg" />
            <span className="text-xl font-semibold text-[var(--text-on-dark)] tracking-tight">
              Perform<span className="gradient-text">OS</span>
            </span>
          </div>
          <div className="inline-block px-3 py-1 rounded-full bg-white/10 text-sm text-[var(--accent-teal)] font-medium mb-4">
            {roleLabel}
          </div>
          <h1 className="text-2xl font-bold text-[var(--text-on-dark)]">
            {isSignUp ? "Create your account" : "Welcome back"}
          </h1>
        </div>

        <form
          onSubmit={handleSubmit}
          className="bg-white rounded-2xl p-8 shadow-xl"
        >
          {isSignUp && (
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
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[var(--navy)] flex items-center justify-center">
          <div className="w-8 h-8 rounded-lg gradient-bg animate-pulse" />
        </div>
      }
    >
      <LoginForm />
    </Suspense>
  );
}
