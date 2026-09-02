import type { Config } from "tailwindcss";

/**
 * DESIGN TOKENS
 * -------------
 * Every value here is a thin alias over a CSS variable defined in
 * `app/globals.css`. To rebrand the site, edit the variables there — this file
 * should almost never need to change.
 */
const config: Config = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./lib/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        bg: "var(--bg)",
        surface: "var(--surface)",
        "surface-sunk": "var(--surface-sunk)",
        ink: {
          DEFAULT: "var(--ink)",
          muted: "var(--ink-muted)",
          subtle: "var(--ink-subtle)",
          inverse: "var(--ink-inverse)",
        },
        line: {
          DEFAULT: "var(--line)",
          strong: "var(--line-strong)",
        },
        primary: {
          DEFAULT: "var(--primary)",
          hover: "var(--primary-hover)",
          soft: "var(--primary-soft)",
        },
        gold: {
          DEFAULT: "var(--gold)",
          soft: "var(--gold-soft)",
        },
        leaf: "var(--leaf)",
        whatsapp: "var(--whatsapp)",
      },
      fontFamily: {
        display: ["var(--font-display)", "Georgia", "serif"],
        sans: ["var(--font-sans)", "system-ui", "sans-serif"],
      },
      fontSize: {
        label: ["var(--text-label)", { lineHeight: "1.4", letterSpacing: "0.08em" }],
        // secondary copy: 16px on mobile, 14px from md up — see --text-small
        small: ["var(--text-small)", { lineHeight: "var(--text-small-lh)" }],
        // annotations that sit *beside* a value (struck-through totals, the
        // "Starting from" prefix, the copyright line) and must stay subordinate
        meta: ["0.875rem", { lineHeight: "1.5" }],
        body: ["1rem", { lineHeight: "1.65" }],
        lead: ["1.0625rem", { lineHeight: "1.6" }],
        h3: ["1.25rem", { lineHeight: "1.3", letterSpacing: "-0.01em" }],
        price: ["1.5rem", { lineHeight: "1.2", letterSpacing: "-0.01em" }],
        h2: ["clamp(1.75rem, 5.5vw, 2.5rem)", { lineHeight: "1.15", letterSpacing: "-0.02em" }],
        // Used by exactly one element, the hero h1. The mobile floor is 30px
        // rather than 34px because the hero now guarantees both CTAs above the
        // fold on a 375px screen, and this headline is the largest single claim
        // on that budget — 4px a line buys ~16px back for the video without
        // costing the headline any of its authority. Desktop is unchanged.
        display: ["clamp(1.875rem, 6.8vw, 3.5rem)", { lineHeight: "1.08", letterSpacing: "-0.022em" }],
      },
      borderRadius: {
        sm: "var(--radius-sm)",
        DEFAULT: "var(--radius-md)",
        md: "var(--radius-md)",
        lg: "var(--radius-lg)",
        xl: "var(--radius-xl)",
      },
      boxShadow: {
        card: "var(--shadow-card)",
        raised: "var(--shadow-raised)",
        bar: "var(--shadow-bar)",
        header: "var(--shadow-header)",
      },
      spacing: {
        gutter: "var(--gutter)",
        "section-y": "var(--section-y)",
        "bar-h": "var(--bar-h)",
        "header-h": "var(--header-h)",
        safe: "env(safe-area-inset-bottom)",
        tap: "3rem", // 48px minimum tap target
      },
      maxWidth: {
        container: "var(--container)",
        prose: "62ch",
      },
      transitionTimingFunction: {
        soft: "var(--ease)",
      },
      transitionDuration: {
        press: "var(--dur-press)",
        reveal: "var(--dur-reveal)",
      },
    },
  },
  plugins: [],
};

export default config;
