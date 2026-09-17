/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        bone: "#F1EDE4",
        "bone-2": "#E8E2D4",
        ink: "#191714",
        wine: "#5C1A21",
        "wine-deep": "#420F14",
        gold: "#A6813C",
        sage: "#8B8A7D",
        good: "#5C7A52",
        line: "rgba(25, 23, 20, 0.14)",
      },
      fontFamily: {
        sans: ["Inter_400Regular"],
        display: ["Fraunces_500Medium"],
        mono: ["SpaceMono_400Regular"],
        "inter-medium": ["Inter_500Medium"],
        "inter-semibold": ["Inter_600SemiBold"],
        "fraunces-regular": ["Fraunces_400Regular"],
        "fraunces-italic": ["Fraunces_400Regular_Italic"],
        "fraunces-medium-italic": ["Fraunces_500Medium_Italic"],
        "fraunces-semibold": ["Fraunces_600SemiBold"],
        "space-mono-bold": ["SpaceMono_700Bold"],
      },
    },
  },
  plugins: [],
};