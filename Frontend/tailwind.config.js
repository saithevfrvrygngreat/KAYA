/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx,ts,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        "emerald": {
          50: "#faf9f5", 100: "#f3f1e9", 200: "#e7e3d6", 300: "#d5cdbc",
          400: "#bdae95", 450: "#a9987f", 500: "#c5a880", 600: "#a3875f",
          700: "#816843", 800: "#18181b", 900: "#09090b", 950: "#020202"
        },
        "stone": {
          50: "#fafaf9", 100: "#f5f5f4", 200: "#e7e5e4", 300: "#d6d3d1",
          400: "#a8a29e", 450: "#8c857f", 500: "#78716c", 600: "#57534e",
          650: "#4d4944", 700: "#44403c", 800: "#292524", 850: "#1c1917",
          855: "#151312", 900: "#1c1917", 950: "#0c0a09"
        },
        "rose": {
          50: "#fff1f2", 100: "#ffe4e6", 200: "#fecdd3", 300: "#fda4af",
          400: "#fb7185", 450: "#f43f5e", 500: "#f43f5e", 600: "#e11d48",
          700: "#be123c", 800: "#9f1239", 900: "#881337", 955: "#4c0519"
        },
        "amber": {
          50: "#fffbeb", 100: "#fef3c7", 200: "#fde68a", 300: "#fcd34d",
          400: "#fbbf24", 450: "#f59e0b", 500: "#f59e0b", 600: "#d97706",
          700: "#b45309", 800: "#92400e", 850: "#853a0c", 900: "#78350f", 950: "#451a03"
        },
        "primary-fixed": "#e7e3d6",
        "outline": "#71717a",
        "inverse-surface": "#18181b",
        "error-container": "#ffdad6",
        "on-tertiary": "#ffffff",
        "on-surface": "#09090b",
        "primary": "#09090b",
        "on-primary": "#ffffff",
        "tertiary": "#c5a880",
        "on-secondary-fixed": "#09090b",
        "surface-container-low": "#faf9f5",
        "background": "#fbfbfa",
        "surface-container-highest": "#e7e3d6",
        "on-tertiary-fixed-variant": "#816843",
        "surface-variant": "#e7e3d6",
        "surface-container-lowest": "#ffffff",
        "on-error-container": "#93000a",
        "on-surface-variant": "#27272a",
        "surface-container": "#f3f1e9",
        "on-secondary-container": "#71717a",
        "on-primary-container": "#ffffff",
        "on-tertiary-container": "#ffffff",
        "surface": "#fbfbfa",
        "on-primary-fixed-variant": "#27272a",
        "secondary-fixed-dim": "#d5cdbc",
        "surface-tint": "#18181b",
        "on-secondary": "#ffffff",
        "inverse-primary": "#d5cdbc",
        "outline-variant": "#e7e3d6",
        "surface-container-high": "#e7e3d6",
        "error": "#ba1a1a",
        "on-tertiary-fixed": "#331200",
        "tertiary-fixed": "#ffdbca",
        "on-secondary-fixed-variant": "#27272a",
        "on-background": "#09090b",
        "primary-container": "#09090b",
        "on-primary-fixed": "#000000",
        "secondary-fixed": "#e7e3d6",
        "secondary-container": "#e7e3d6",
        "primary-fixed-dim": "#e7e3d6",
        "surface-dim": "#e7e3d6",
        "inverse-on-surface": "#faf9f5",
        "secondary": "#71717a",
        "surface-bright": "#fbfbfa",
        "on-error": "#ffffff",
        "tertiary-container": "#c5a880",
        "tertiary-fixed-dim": "#d5cdbc"
      },
      borderRadius: {
        DEFAULT: "0.25rem", lg: "0.5rem", xl: "0.75rem", full: "9999px"
      },
      spacing: {
        "margin-desktop": "4.5rem", "margin-mobile": "1.25rem",
        "section-gap": "6.75rem", unit: "0.5rem", gutter: "1.5rem",
        "container-max": "81rem"
      },
      fontFamily: {
        "display-xl": ["Plus Jakarta Sans"],
        "label-sm": ["Inter"],
        "headline-lg": ["Plus Jakarta Sans"],
        "headline-md": ["Plus Jakarta Sans"],
        "body-lg": ["Inter"],
        "body-md": ["Inter"]
      },
      fontSize: {
        "display-xl": ["3.375rem", { lineHeight: "1.1", letterSpacing: "-0.02em", fontWeight: "700" }],
        "label-sm": ["0.6875rem", { lineHeight: "1", letterSpacing: "0.08em", fontWeight: "600" }],
        "headline-lg": ["2.25rem", { lineHeight: "1.2", letterSpacing: "-0.01em", fontWeight: "600" }],
        "headline-md": ["1.575rem", { lineHeight: "1.3", letterSpacing: "0em", fontWeight: "600" }],
        "body-lg": ["1rem", { lineHeight: "1.6", letterSpacing: "0em", fontWeight: "400" }],
        "body-md": ["0.9rem", { lineHeight: "1.6", letterSpacing: "0em", fontWeight: "400" }]
      }
    },
  },
  plugins: [],
}

