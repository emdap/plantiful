const plugin = require("tailwindcss/plugin")
const colors = require("tailwindcss/colors")

module.exports = {
  purge: [],
  darkMode: "class", // or 'media' or 'class'
  options: {
    important: true
  },
  theme: {
    extend: {
      transitionProperty: {
        size: "height, width",
        text: "letter-spacing"
      },
      width: {
        half: "50vw"
      },
      borderWidth: {
        "1": "1px"
      },
      outline: {
        green: "2px solid " + colors.green["300"],
        yellow: "2px solid " + colors.yellow["600"],
        "black-solid": "2px solid black"
      },
      margin: {
        "-1/2": "-50%",
        "-full": "-100%"
      }
    }
  },
  variants: {
    extend: {
      letterSpacing: ["hover"],
      outline: ["dark"],
      opacity: ["dark"]
    }
  },
  plugins: [
    require("tailwind-scrollbar"),
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
        },
        "button:disabled:hover": {
          color: theme("colors.gray.200"),
          letterSpacing: "normal"
        }
      })
      addUtilities(
        {
          ".btn-light": {
            background: theme("colors.green.600"),
            color: "white",
            fontWeight: theme("fontWeight.semibold"),
            borderRadius: theme("borderRadius.sm")
          },
          ".btn-light:hover:not(:disabled)": {
            background: theme("colors.green.400")
          },
          ".btn-light:focus": { outlineColor: theme("colors.green.300") },
          ".btn-light:active": {
            outline: theme("outline.none"),
            background: theme("colors.green.800")
          },
          ".btn-light:disabled": {
            color: theme("colors.green.300"),
            background: theme("colors.green.100")
          },
          ".btn-light:disabled:hover": {
            color: theme("colors.green.300")
          },
          ".btn-dark": {
            background: theme("colors.green.700"),
            color: theme("colors.gray.50"),
            fontWeight: theme("fontWeight.semibold"),
            borderRadius: theme("borderRadius.sm")
          },
          ".btn-dark:hover:not(:disabled)": {
            background: theme("colors.green.600")
          },
          ".btn-dark:focus": { outlineColor: theme("colors.green.500") },
          ".btn-dark:active": {
            outline: theme("outline.none"),
            background: theme("colors.green.600")
          },
          ".btn-dark:disabled": {
            color: theme("colors.gray.800"),
            background: theme("colors.gray.600")
          },
          ".btn-dark:disabled:hover": {
            color: theme("colors.gray.800"),
            background: theme("colors.gray.600")
          },
          ".btn-dark-transparent:disabled:hover": {
            color: theme("colors.gray.800")
          },
          ".btn-dark-transparent:disabled": {
            color: theme("colors.gray.800")
          }
        },
        { variants: ["dark"] }
      )
    })
  ]
}
