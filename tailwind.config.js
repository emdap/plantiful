const plugin = require("tailwindcss/plugin")

module.exports = {
  purge: [],
  darkMode: false, // or 'media' or 'class'
  theme: {
    extend: {}
  },
  variants: {
    extend: {}
  },
  plugins: [
    plugin(function({ addBase, addUtilities, theme }) {
      addBase({
        h1: {
          fontSize: theme("fontSize.2xl"),
          fontWeight: theme("fontWeight.extrabold")
        },
        h2: {
          fontSize: theme("fontSize.xl"),
          fontWeight: theme("fontWeight.bold")
        },
        h3: {
          fontSize: theme("fontSize.lg"),
          fontWeight: theme("fontWeight.semibold")
        },
        h4: {
          fontSize: theme("fontSize.base"),
          fontWeight: theme("fontWeight.normal")
        },
        h5: {
          fontSize: theme("fontSize.base"),
          fontWeight: theme("fontWeight.light"),
          fontStyle: "italic"
        },
        button: { padding: theme("spacing[2]") },
        "button:disabled": {
          color: theme("colors.gray.200"),
          cursor: theme("cursor[not-allowed]")
        }
      })
      addUtilities({
        ".btn-primary": {
          background: theme("colors.green.600"),
          color: "white",
          fontWeight: theme("fontWeight.semibold"),
          borderRadius: theme("borderRadius.sm")
        },
        ".btn-primary:hover:not(:disabled)": {
          background: theme("colors.green.400")
        },
        ".btn-primary:focus": { outlineColor: theme("colors.green.300") },
        ".btn-primary:active": {
          outline: theme("outline.none"),
          background: theme("colors.green.800")
        },
        ".btn-primary:disabled": {
          color: theme("colors.green.300"),
          background: theme("colors.green.100")
        }
      })
    })
  ]
}
