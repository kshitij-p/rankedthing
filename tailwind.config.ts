import { type Config } from "tailwindcss";

export default {
  content: ["./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        neutral: {
          1000: "#0d0d0d",
        },
        "dark-teal": "#0c0d0d",
      },
    },
  },
  darkMode: "class",
  plugins: [],
} satisfies Config;
