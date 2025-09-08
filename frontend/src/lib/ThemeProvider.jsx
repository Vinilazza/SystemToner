import { useEffect, useState } from "react";

export default function ThemeProvider({
  children,
  defaultTheme = "system",
  storageKey = "ui-theme",
}) {
  const [theme, setTheme] = useState(
    () => localStorage.getItem(storageKey) || defaultTheme
  );

  useEffect(() => {
    let resolved = theme;
    if (theme === "system") {
      const mq = window.matchMedia("(prefers-color-scheme: dark)");
      resolved = mq.matches ? "dark" : "light";
    }
    const root = document.documentElement;
    root.classList.toggle("dark", resolved === "dark");
    localStorage.setItem(storageKey, theme);
  }, [theme, storageKey]);

  // opcional: expor um setter via window para testes rápidos
  useEffect(() => {
    window.__setTheme = setTheme;
  }, []);

  return children;
}
