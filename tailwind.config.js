/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        tesla: {
          dark: "#121212",
          gray: "#1e1e1e",
          accent: "#3e6ae1", // Tesla Blue
          green: "#21c25e",
          text: "#f5f5f5",
          danger: "#e82127",
        },
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
      },
    },
  },
  plugins: [],
};
