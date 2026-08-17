"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";

const fieldClass =
  "h-11 w-full border border-unn-line bg-white px-3 text-sm text-unn-ink outline-none transition placeholder:text-unn-muted focus:border-unn-green";
const labelClass = "grid gap-2 text-sm";
const buttonClass =
  "inline-flex h-11 items-center justify-center rounded-sm px-5 text-sm font-semibold transition";

export default function StaffLoginClient() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setSubmitting(true);

    try {
      const response = await fetch("/api/staff/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await response.json();

      if (!response.ok) {
        setError(data.error ?? "Could not sign in.");
        return;
      }

      router.push(typeof data.redirectTo === "string" ? data.redirectTo : "/");
      router.refresh();
    } catch {
      setError("Login failed. Check your connection and try again.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="relative flex min-h-svh items-center justify-center overflow-hidden bg-unn-green-deep px-4 py-10 text-white">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-40"
        style={{
          backgroundImage:
            "radial-gradient(circle at 20% 20%, rgba(255,255,255,0.18), transparent 42%), radial-gradient(circle at 80% 0%, rgba(255,255,255,0.12), transparent 36%)",
        }}
      />

      <div className="relative w-full max-w-md border border-white/15 bg-white/95 p-6 text-unn-ink shadow-xl backdrop-blur md:p-8">
        <div className="flex items-center gap-3">
          <Image
            src="/images/logo.png"
            alt="UNN crest"
            width={44}
            height={44}
            className="h-11 w-11 object-contain"
          />
          <div>
            <p className="font-display text-2xl leading-none text-unn-ink">
              Staff login
            </p>
            <p className="mt-1 text-[0.65rem] uppercase tracking-[0.16em] text-unn-muted">
              UNN Alumni dashboard
            </p>
          </div>
        </div>      

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <label className={labelClass}>
            <span className="font-medium">Email</span>
            <input
              required
              type="email"
              autoComplete="username"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              className={fieldClass}
              placeholder="you@unn-alumni.org"
            />
          </label>

          <label className={labelClass}>
            <span className="font-medium">Password</span>
            <div className="relative">
              <input
                required
                type={showPassword ? "text" : "password"}
                autoComplete="current-password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                className={`${fieldClass} pr-16`}
                placeholder="Your password"
              />
              <button
                type="button"
                onClick={() => setShowPassword((value) => !value)}
                className="absolute inset-y-0 right-0 px-3 text-xs font-semibold text-unn-muted transition hover:text-unn-green"
              >
                {showPassword ? "Hide" : "Show"}
              </button>
            </div>
          </label>

          {error ? <p className="text-sm text-rose-700">{error}</p> : null}

          <button
            type="submit"
            disabled={submitting}
            className={`${buttonClass} w-full bg-unn-green text-white hover:bg-unn-green-mid disabled:opacity-60`}
          >
            {submitting ? "Signing in…" : "Sign in"}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-unn-muted">
          <Link href="/" className="font-semibold text-unn-green hover:underline">
            Back to public site
          </Link>
        </p>
      </div>
    </div>
  );
}
