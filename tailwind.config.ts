import type { Config } from "tailwindcss"

const config: Config = {
  darkMode: ["class"],
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(142, 76%, 36%)", // Green primary
          foreground: "hsl(0, 0%, 100%)", // White text on green
        },
        secondary: {
          DEFAULT: "hsl(210, 40%, 96%)", // Light gray
          foreground: "hsl(142, 76%, 36%)", // Green text on gray
        },
        destructive: {
          DEFAULT: "hsl(0, 84%, 60%)",
          foreground: "hsl(0, 0%, 100%)",
        },
        muted: {
          DEFAULT: "hsl(210, 40%, 96%)", // Light gray
          foreground: "hsl(142, 76%, 36%)", // Green text
        },
        accent: {
          DEFAULT: "hsl(210, 40%, 96%)", // Light gray
          foreground: "hsl(142, 76%, 36%)", // Green text
        },
        popover: {
          DEFAULT: "hsl(0, 0%, 100%)", // White
          foreground: "hsl(142, 76%, 36%)", // Green text
        },
        card: {
          DEFAULT: "hsl(0, 0%, 100%)", // White
          foreground: "hsl(142, 76%, 36%)", // Green text
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
}

export default config
