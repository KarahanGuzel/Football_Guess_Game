"use client";

import { useEffect, useState } from "react";

export type ThemeMode = "dark" | "light";

const STORAGE_KEY = "tahmin-ligi-theme";

function applyTheme(theme: ThemeMode) {
  document.documentElement.dataset.theme = theme;
  document.documentElement.style.colorScheme = theme;
}

function SunIcon() {
  return (
    <svg
      className="theme-icon"
      viewBox="0 0 24 24"
      width="14"
      height="14"
      aria-hidden="true"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="12" cy="12" r="4" />
      <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41" />
    </svg>
  );
}

function MoonIcon() {
  return (
    <svg
      className="theme-icon"
      viewBox="0 0 24 24"
      width="14"
      height="14"
      aria-hidden="true"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M21 14.5A8.5 8.5 0 0 1 9.5 3a7 7 0 1 0 11.5 11.5Z" />
    </svg>
  );
}

export function ThemeToggle() {
  const [theme, setTheme] = useState<ThemeMode>("dark");

  useEffect(() => {
    const stored = window.localStorage.getItem(STORAGE_KEY);
    const initial: ThemeMode = stored === "light" ? "light" : "dark";
    setTheme(initial);
    applyTheme(initial);
  }, []);

  function toggle() {
    const next: ThemeMode = theme === "dark" ? "light" : "dark";
    setTheme(next);
    window.localStorage.setItem(STORAGE_KEY, next);
    applyTheme(next);
  }

  const isDark = theme === "dark";

  return (
    <button
      type="button"
      className={`theme-switch${isDark ? " theme-switch-dark" : " theme-switch-light"}`}
      onClick={toggle}
      role="switch"
      aria-checked={isDark}
      aria-label={isDark ? "Açık temaya geç" : "Koyu temaya geç"}
      title={isDark ? "Açık tema" : "Koyu tema"}
    >
      <span className="theme-switch-track">
        <span className="theme-switch-icon theme-switch-sun" aria-hidden="true">
          <SunIcon />
        </span>
        <span className="theme-switch-icon theme-switch-moon" aria-hidden="true">
          <MoonIcon />
        </span>
        <span className="theme-switch-thumb" aria-hidden="true">
          {isDark ? <MoonIcon /> : <SunIcon />}
        </span>
      </span>
    </button>
  );
}

/** Inline script to avoid theme flash before hydration. */
export const themeInitScript = `
(function(){
  try {
    var t = localStorage.getItem('${STORAGE_KEY}');
    if (t !== 'light' && t !== 'dark') t = 'dark';
    document.documentElement.dataset.theme = t;
    document.documentElement.style.colorScheme = t;
  } catch (e) {}
})();
`;
