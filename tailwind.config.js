/** TorqueTitles — ENTERPRISE-DESIGN-STANDARD §4 tokens with the brand's
 *  documented override: a dark asphalt/iron world (the buyer's world is
 *  machines, desert light, and paperwork that has to survive it), one
 *  accent — signal orange #e85d1f — and machined Archivo display type.
 *  Type scale, spacing, radii, and neutrals follow the standard. */
/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,jsx}",
    "./components/**/*.{js,jsx}",
    "./lib/**/*.{js,jsx}",
  ],
  theme: {
    extend: {
      colors: {
        accent: "#e85d1f", // signal orange — the single brand accent
        accentdeep: "#bc4510", // accent on light surfaces (links, eyebrow)
        asphalt: "#0d0d0f", // page dark
        iron: "#141518", // raised dark surface
        panel: "#101014", // §5.3 module panel
        steel: "#e9e6e0", // on-dark primary text
        steel2: "#b9b5ac", // on-dark secondary
        steel3: "#8a877f", // on-dark tertiary
        linedark: "#26272c",
        paper: "#f4f1ea", // light surface (warm paper)
        paper2: "#ece8df", // alt light section
        ink: "#161513",
        ink2: "#45423c",
        ink3: "#74706a",
        line: "#d9d4c8",
        linesoft: "#e4dfd2",
      },
      fontFamily: {
        display: [
          "Archivo",
          "Inter",
          "-apple-system",
          "BlinkMacSystemFont",
          '"SF Pro Display"',
          '"Helvetica Neue"',
          "Helvetica",
          "Arial",
          "sans-serif",
        ],
        sans: [
          "Inter",
          "-apple-system",
          "BlinkMacSystemFont",
          '"SF Pro Display"',
          '"SF Pro Text"',
          '"Helvetica Neue"',
          "Helvetica",
          "Arial",
          "sans-serif",
        ],
      },
      maxWidth: { wrap: "1120px", wrapw: "1340px" },
      borderRadius: { card: "18px", panel: "22px", pill: "980px", sm2: "12px" },
      boxShadow: {
        soft: "0 16px 40px rgba(0,0,0,.07)",
        lift: "0 30px 70px rgba(0,0,0,.45)",
      },
      spacing: { section: "92px", sectionm: "64px" },
    },
  },
  plugins: [],
};
