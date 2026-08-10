"use client";

import Image from "next/image";
import { useEffect, useState } from "react";

const slides = [
  {
    src: "/images/hero.jpg",
    title: "Nsukka Main Gate",
    caption: "Where every lion's journey begins",
  },
  {
    src: "/images/hero2.jpg",
    title: "Campus Entrance",
    caption: "Home of the Lions and Lionesses",
  },
  {
    src: "/images/about.jpg",
    title: "Graduation Day",
    caption: "Celebrating excellence across generations",
  },
  {
    src: "/images/news-1.jpg",
    title: "Alumni Gatherings",
    caption: "Reunions that keep the network alive",
  },
  {
    src: "/images/news-2.jpg",
    title: "Mentorship in Motion",
    caption: "Guiding the next class of leaders",
  },
];

const INTERVAL_MS = 5500;

export default function HeroCarousel() {
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    if (paused) return;
    const id = window.setInterval(() => {
      setIndex((current) => (current + 1) % slides.length);
    }, INTERVAL_MS);
    return () => window.clearInterval(id);
  }, [paused]);

  function goTo(next: number) {
    setIndex((next + slides.length) % slides.length);
  }

  const active = slides[index];

  return (
    <div
      className="relative h-[70vh] w-full overflow-hidden rounded-[20px]"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocusCapture={() => setPaused(true)}
      onBlurCapture={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget)) {
          setPaused(false);
        }
      }}
    >
      {slides.map((slide, i) => (
        <div
          key={slide.src}
          className={`absolute inset-0 transition-opacity duration-1000 ease-out ${
            i === index ? "opacity-100" : "opacity-0"
          }`}
          aria-hidden={i !== index}
        >
          <Image
            src={slide.src}
            alt={slide.title}
            fill
            priority={i === 0}
            unoptimized
            className={`object-cover object-center transition-transform duration-[8000ms] ease-out ${
              i === index ? "scale-105" : "scale-100"
            }`}
            sizes="(max-width: 768px) 100vw, 50vw"
          />
        </div>
      ))}

      <div
        aria-hidden
        className="absolute inset-0 bg-[linear-gradient(to_top,rgba(15,51,32,0.72)_0%,transparent_45%)]"
      />

      <div className="absolute inset-x-0 bottom-0 z-10 p-5 md:p-7">
        <div className="flex items-end justify-between gap-4">
          <div className="min-w-0">
            <p className="text-[0.65rem] font-semibold uppercase tracking-[0.2em] text-white/60">
              {String(index + 1).padStart(2, "0")} /{" "}
              {String(slides.length).padStart(2, "0")}
            </p>
            <p className="mt-1 truncate font-display text-xl text-white md:text-2xl">
              {active.title}
            </p>
            <p className="mt-1 truncate text-sm text-white/70">{active.caption}</p>
          </div>

          <div className="flex shrink-0 items-center gap-2">
            <button
              type="button"
              aria-label="Previous slide"
              onClick={() => goTo(index - 1)}
              className="inline-flex h-10 w-10 items-center justify-center border border-white/30 text-white transition hover:border-white hover:bg-white/10"
            >
              <span aria-hidden className="text-lg leading-none">
                ←
              </span>
            </button>
            <button
              type="button"
              aria-label="Next slide"
              onClick={() => goTo(index + 1)}
              className="inline-flex h-10 w-10 items-center justify-center border border-white/30 text-white transition hover:border-white hover:bg-white/10"
            >
              <span aria-hidden className="text-lg leading-none">
                →
              </span>
            </button>
          </div>
        </div>

        <div className="mt-4 flex gap-2" role="tablist" aria-label="Carousel slides">
          {slides.map((slide, i) => (
            <button
              key={slide.src}
              type="button"
              role="tab"
              aria-selected={i === index}
              aria-label={`Show slide ${i + 1}: ${slide.title}`}
              onClick={() => goTo(i)}
              className={`h-0.5 flex-1 transition-all duration-500 ${
                i === index ? "bg-white" : "bg-white/30 hover:bg-white/50"
              }`}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
