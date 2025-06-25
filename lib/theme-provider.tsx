"use client";

import { createContext, useContext, useEffect, useState } from "react";

type Theme = "green" | "red" | "purple" | "blue";

type ThemeProviderProps = {
  children: React.ReactNode;
};

type ThemeProviderState = {
  theme: Theme;
  setTheme: (theme: Theme) => void;
};

const themeMap = {
  green: { variable: "142 77% 36%", hex: "#16A249" },
  red: { variable: "359 99% 65%", hex: "#FE4D50" },
  purple: { variable: "264 99% 65%", hex: "#8C4DFE" },
  blue: { variable: "209 99% 65%", hex: "#4DAEFE" },
};

const ThemeProviderContext = createContext<ThemeProviderState | undefined>(
  undefined
);

export function ThemeProvider({ children }: ThemeProviderProps) {
  const [theme, setTheme] = useState<Theme>("green");

  useEffect(() => {
    const savedTheme = (localStorage.getItem("app-theme") || "green") as Theme;
    setTheme(savedTheme);
    updateThemeVariables(savedTheme);
  }, []);

  const updateThemeVariables = (newTheme: Theme) => {
    // Set data-theme attribute on html element
    document.documentElement.setAttribute("data-theme", newTheme);

    // Also update CSS variables directly for immediate effect
    document.documentElement.style.setProperty(
      "--primary",
      themeMap[newTheme].variable
    );
    document.documentElement.style.setProperty(
      "--primary-foreground",
      "0 0% 100%"
    );
  };

  const handleSetTheme = async (newTheme: Theme) => {
    setTheme(newTheme);
    updateThemeVariables(newTheme);
    localStorage.setItem("app-theme", newTheme);

    try {
      await fetch("/api/settings/theme", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ theme: newTheme }),
      });
    } catch (error) {
      console.error("Failed to save theme to server", error);
    }
  };

  return (
    <ThemeProviderContext.Provider value={{ theme, setTheme: handleSetTheme }}>
      {children}
    </ThemeProviderContext.Provider>
  );
}

export const useTheme = () => {
  const context = useContext(ThemeProviderContext);

  if (context === undefined) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }

  return context;
};
