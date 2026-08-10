"use client";

import { useState, type FormEvent } from "react";

export default function Contact() {
  const [submitted, setSubmitted] = useState(false);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitted(true);
  }

  return (
    <section id="contact" className="section-pad bg-white">
      <div className="mx-auto grid max-w-6xl gap-12 lg:grid-cols-[1fr_1.1fr] lg:gap-16">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-unn-green-mid">
            Contact
          </p>
          <h2 className="section-title mt-3">Write to the secretariat</h2>
          <p className="section-lead">
            Membership questions, chapter updates, partnership ideas — we would
            love to hear from you.
          </p>

          <dl className="mt-10 space-y-6 text-sm">
            <div>
              <dt className="font-semibold text-unn-ink">Alumni Office</dt>
              <dd className="mt-1 leading-relaxed text-unn-muted">
                University of Nigeria, Nsukka
                <br />
                Enugu State, Nigeria
              </dd>
            </div>
            <div>
              <dt className="font-semibold text-unn-ink">Email</dt>
              <dd className="mt-1 text-unn-muted">
                <a
                  href="mailto:alumni@unn.edu.ng"
                  className="transition hover:text-unn-green"
                >
                  alumni@unn.edu.ng
                </a>
              </dd>
            </div>
            <div>
              <dt className="font-semibold text-unn-ink">Phone</dt>
              <dd className="mt-1 text-unn-muted">+234 (0) 803 000 0000</dd>
            </div>
          </dl>
        </div>

        <form
          onSubmit={handleSubmit}
          className="border border-unn-line bg-unn-mist/70 p-6 md:p-8"
        >
          {submitted ? (
            <div className="flex min-h-[20rem] flex-col justify-center">
              <p className="font-display text-3xl text-unn-green">
                Message received.
              </p>
              <p className="mt-3 max-w-md text-sm leading-relaxed text-unn-muted">
                Thank you for reaching out. The alumni secretariat will respond
                shortly.
              </p>
            </div>
          ) : (
            <div className="grid gap-5">
              <label className="grid gap-2 text-sm">
                <span className="font-medium text-unn-ink">Full name</span>
                <input
                  required
                  name="name"
                  type="text"
                  className="h-11 border border-unn-line bg-white px-3 outline-none transition focus:border-unn-green"
                />
              </label>
              <label className="grid gap-2 text-sm">
                <span className="font-medium text-unn-ink">Email</span>
                <input
                  required
                  name="email"
                  type="email"
                  className="h-11 border border-unn-line bg-white px-3 outline-none transition focus:border-unn-green"
                />
              </label>
              <label className="grid gap-2 text-sm">
                <span className="font-medium text-unn-ink">Faculty / Year</span>
                <input
                  name="faculty"
                  type="text"
                  placeholder="e.g. Engineering, Class of 2014"
                  className="h-11 border border-unn-line bg-white px-3 outline-none transition focus:border-unn-green"
                />
              </label>
              <label className="grid gap-2 text-sm">
                <span className="font-medium text-unn-ink">Message</span>
                <textarea
                  required
                  name="message"
                  rows={5}
                  className="resize-y border border-unn-line bg-white px-3 py-2 outline-none transition focus:border-unn-green"
                />
              </label>
              <button
                type="submit"
                className="mt-1 inline-flex h-12 items-center justify-center rounded-sm bg-unn-green px-6 text-sm font-semibold text-white transition hover:bg-unn-green-mid"
              >
                Send Message
              </button>
            </div>
          )}
        </form>
      </div>
    </section>
  );
}
