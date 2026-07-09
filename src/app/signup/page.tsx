"use client";

import { useState } from "react";
import { SiteHeader } from "@/components/site-header";
import { createClient } from "@/lib/supabase/client";

// FR-AUTH-001: registration creates an unverified account and sends a
// verification email (handled by Supabase Auth).
export default function SignupPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    const supabase = createClient();
    const { error } = await supabase.auth.signUp({ email, password });
    if (error) {
      setError(error.message);
      return;
    }
    setSubmitted(true);
  }

  if (submitted) {
    return (
      <div className="flex flex-1 flex-col">
        <SiteHeader />
        <div className="mx-auto flex w-full max-w-sm flex-1 flex-col justify-center gap-3 px-6 py-24 text-center">
          <h1 className="text-2xl font-semibold text-neutral-50">Check your email</h1>
          <p className="text-neutral-400">We sent a verification link to {email}.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-1 flex-col">
      <SiteHeader />
      <div className="mx-auto flex w-full max-w-sm flex-1 flex-col justify-center gap-6 px-6 py-24">
        <h1 className="text-2xl font-semibold text-neutral-50">Create an account</h1>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <input
            type="email"
            required
            aria-label="Email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="rounded-md border border-neutral-700 bg-neutral-900 px-3 py-2 text-neutral-100 placeholder:text-neutral-500 focus:border-emerald-500/50 focus:outline-none"
          />
          <input
            type="password"
            required
            minLength={8}
            aria-label="Password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="rounded-md border border-neutral-700 bg-neutral-900 px-3 py-2 text-neutral-100 placeholder:text-neutral-500 focus:border-emerald-500/50 focus:outline-none"
          />
          {error && <p className="text-sm text-red-400">{error}</p>}
          <button
            type="submit"
            className="h-11 rounded-full bg-emerald-500 font-medium text-neutral-950 transition-colors hover:bg-emerald-400"
          >
            Sign up
          </button>
        </form>
        <p className="text-sm text-neutral-400">
          Already have an account?{" "}
          <a href="/login" className="text-emerald-400 underline hover:text-emerald-300">
            Log in
          </a>
        </p>
      </div>
    </div>
  );
}
