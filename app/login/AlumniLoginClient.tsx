"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useEffect, useState } from "react";

const fieldClass =
  "h-11 w-full border border-unn-line bg-white px-3 text-sm text-unn-ink outline-none transition placeholder:text-unn-muted focus:border-unn-green";
const labelClass = "grid gap-2 text-sm";
const buttonClass =
  "inline-flex h-11 items-center justify-center rounded-sm px-5 text-sm font-semibold transition";

export default function AlumniLoginClient() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    const html = document.documentElement;
    const previousHtmlOverflow = html.style.overflow;
    const previousBodyOverflow = document.body.style.overflow;
    html.style.overflow = "hidden";
    document.body.style.overflow = "hidden";
    return () => {
      html.style.overflow = previousHtmlOverflow;
      document.body.style.overflow = previousBodyOverflow;
    };
  }, []);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    let message = "";
    if (params.get("updated") === "1") {
      message =
        "Your record was updated. Sign in with your email and password.";
    } else if (params.get("registered") === "1") {
      message =
        "Your record was submitted. Sign in with your email and password.";
    }
    if (!message) return;

    setSuccess(message);
    const timer = window.setTimeout(() => {
      setSuccess("");
      window.history.replaceState({}, "", "/login");
    }, 5000);

    return () => window.clearTimeout(timer);
  }, []);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setSubmitting(true);

    try {
      const response = await fetch("/api/alumni/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await response.json();

      if (!response.ok) {
        setError(data.error ?? "Could not sign in.");
        return;
      }

      router.push("/alumni");
      router.refresh();
    } catch {
      setError("Login failed. Check your connection and try again.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="animate-hero-section relative flex h-svh max-h-svh flex-col overflow-hidden bg-unn-green-deep text-white">
      <div
        aria-hidden
        className="animate-orb-pulse pointer-events-none absolute -left-20 bottom-10 h-72 w-72 rounded-full bg-white/5 blur-3xl"
      />
      <div
        aria-hidden
        className="animate-orb-pulse pointer-events-none absolute left-[28%] top-0 h-80 w-80 rounded-full bg-unn-green-mid/20 blur-3xl [animation-delay:2.5s]"
      />

      <header className="animate-fade-up relative z-10 shrink-0 border-b border-white/10">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-5 md:h-[4.25rem] md:px-8">
          <Link href="/" scroll={false} className="flex items-center gap-3">
            <Image
              src="/images/logo.png"
              alt="University of Nigeria crest"
              width={44}
              height={44}
              className="h-9 w-9 object-contain md:h-10 md:w-10"
              priority
            />
            <span className="leading-tight">
              <span className="block font-display text-xl tracking-wide md:text-[1.35rem]">
                UNN Alumni
              </span>
              <span className="hidden text-[0.68rem] uppercase tracking-[0.18em] text-white/70 sm:block">
                University of Nigeria
              </span>
            </span>
          </Link>
          <Link
            href="/"
            scroll={false}
            className="text-sm font-medium text-white/85 transition hover:text-white"
          >
            Back to home
          </Link>
        </div>
      </header>

      <main className="relative z-10 mx-auto flex min-h-0 w-full max-w-md flex-1 flex-col justify-center px-5 py-6 md:px-8 md:py-8">
        <div className="animate-slide-in-left">
          <div className="animate-fade-up inline-flex items-center gap-3 text-xs font-semibold uppercase tracking-[0.22em] text-white/65">
            <span
              className="animate-rule-grow h-px origin-left bg-white/35"
              aria-hidden
            />
            Alumni portal
          </div>
          <h1 className="animate-fade-up delay-1 mt-3 font-display text-[clamp(2rem,5.5vw,2.85rem)] leading-none tracking-[-0.02em] text-white">
            UNN Alumni
          </h1>
          <p className="animate-fade-up delay-2 mt-2 max-w-sm text-sm text-white/72">
            Sign in with your alumni email and password to continue.
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="animate-fade-up delay-3 mt-6 border border-white/15 bg-white p-5 shadow-sm md:mt-8 md:p-7"
        >
          <h2 className="font-display text-2xl text-unn-ink">Sign in</h2>
          <p className="mt-1.5 text-sm text-unn-muted">
            Use the email on your alumni record.
          </p>

          {success ? (
            <p
              role="status"
              className="mt-4 rounded-sm border border-unn-green/30 bg-unn-green-soft px-3 py-2 text-sm text-unn-green"
            >
              {success}
            </p>
          ) : null}

          <div className="mt-5 grid gap-3.5">
            <label className={labelClass}>
              <span className="font-medium text-unn-ink">
                Email <span className="text-rose-600">*</span>
              </span>
              <input
                type="email"
                required
                autoComplete="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                placeholder="email@example.com"
                className={fieldClass}
              />
            </label>

            <label className={labelClass}>
              <span className="font-medium text-unn-ink">
                Password <span className="text-rose-600">*</span>
              </span>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  autoComplete="current-password"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  placeholder="Enter your password"
                  className={`${fieldClass} pr-16`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((current) => !current)}
                  className="absolute inset-y-0 right-0 px-3 text-xs font-semibold text-unn-green hover:text-unn-green-mid"
                >
                  {showPassword ? "Hide" : "Show"}
                </button>
              </div>
            </label>
          </div>

          {error ? (
            <p role="alert" className="mt-3 text-sm text-rose-700">
              {error}
            </p>
          ) : null}

          <button
            type="submit"
            disabled={submitting || !email.trim() || !password.trim()}
            className={`${buttonClass} mt-5 w-full bg-unn-green text-white hover:bg-unn-green-mid disabled:opacity-60`}
          >
            {submitting ? "Signing in…" : "Sign in"}
          </button>

          <p className="mt-4 text-center text-sm text-unn-muted">
            Need to update your details first?{" "}
            <Link
              href="/verify"
              className="font-semibold text-unn-green hover:text-unn-green-mid"
            >
              Find your record
            </Link>
          </p>
        </form>
      </main>
    </div>
  );
}
