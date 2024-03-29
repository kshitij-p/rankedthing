import { type Config } from "tailwindcss";
import tailwindCssRadix from "tailwindcss-radix";

export default {
  content: ["./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      backgroundImage: {
        "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
      },
      colors: {
        neutral: {
          1000: "#0d0d0d",
        },
        "dark-teal": "#0c0d0d",
      },
      animation: {
        fadeIn: "fadeIn 0.25s ease-in-out forwards",
        fadeOut: "fadeOut 0.2s ease-in-out forwards",
        appearIn: "appearIn 0.25s ease-in-out forwards",
        appearOut: "appearOut 0.2s ease-in-out forwards",
        slideLeftIn: "slideLeftIn 0.25s ease-in-out forwards",
        slideLeftOut: "slideLeftOut 0.2s ease-in-out forwards",
        blurIn: "blurIn 0.25s ease-in-out forwards",
        blurOut: "blurOut 0.2s ease-in-out forwards",
      },
      keyframes: {
        fadeIn: {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        fadeOut: {
          "0%": { opacity: "1" },
          "100%": { opacity: "0" },
        },
        appearIn: {
          "0%": { opacity: "0", scale: "0.85" },
          "100%": { opacity: "1", scale: "1" },
        },
        appearOut: {
          "100%": { opacity: "0", scale: "0.85" },
          "0%": { opacity: "1", scale: "1" },
        },
        slideLeftIn: {
          "0%": { transform: "translateX(-100%)" },
          "100%": { transform: "translateX(0%)" },
        },
        slideLeftOut: {
          "0%": { transform: "translateX(0%)" },
          "100%": { transform: "translateX(-100%)" },
        },
        blurIn: {
          "0%": { "backdrop-filter": "blur(0px)" },
          "100%": { "backdrop-filter": "var(--tw-backdrop-blur)" },
        },
        blurOut: {
          "0%": { "backdrop-filter": "var(--tw-backdrop-blur)" },
          "100%": { "backdrop-filter": "blur(0px)" },
        },
      },
    },
  },
  darkMode: "class",
  plugins: [tailwindCssRadix],
} satisfies Config;
