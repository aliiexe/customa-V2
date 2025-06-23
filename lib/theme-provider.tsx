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

const ThemeProviderContext = createContext<ThemeProviderState | undefined>(undefined);

export function ThemeProvider({ children }: ThemeProviderProps) {
  const [theme, setTheme] = useState<Theme>("green");

  // Apply theme function
  const applyTheme = (newTheme: Theme) => {
    // Remove any existing theme attributes
    document.documentElement.removeAttribute('data-theme');
    
    // For non-default theme, set the data-theme attribute
    if (newTheme !== "green") {
      document.documentElement.setAttribute('data-theme', newTheme);
    }
    
    // Force a CSS variable recomputation by toggling a class
    document.documentElement.classList.add('theme-updated');
    setTimeout(() => {
      document.documentElement.classList.remove('theme-updated');
    }, 10);
  };

  useEffect(() => {
    // On initial load, get theme from localStorage
    const savedTheme = (localStorage.getItem("app-theme") || "green") as Theme;
    setTheme(savedTheme);
    applyTheme(savedTheme);
  }, []);

  const handleSetTheme = (newTheme: Theme) => {
    setTheme(newTheme);
    localStorage.setItem("app-theme", newTheme);
    applyTheme(newTheme);
    
    // Save to server - this is optional if your server-side persistence isn't working
    fetch("/api/settings/theme", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ theme: newTheme }),
    }).catch(error => {
      console.error("Failed to save theme to server", error);
    });
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