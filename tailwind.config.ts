import { type Config } from "tailwindcss";
import { fontFamily } from "tailwindcss/defaultTheme";

export default {
  content: ["./src/**/*.tsx"],
  theme: {
    extend: {
      fontFamily: {
        sans: ["var(--font-geist-sans)", ...fontFamily.sans],
      },
      colors: {
        background: " #202124",
        surface: "rgb(255 255 255 / 0.1)",
        text: " #ffffff",
        primary: "#2176ff",
        secondary: "#33a1fd",
        tertiary: "#fdca40",
        warning: "#f79824",
        error: "#dd1c1a",
        success: "#0f9d58",
      },
    },
  },
  plugins: [],
} satisfies Config;
