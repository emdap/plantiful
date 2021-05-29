const plugin = require("tailwindcss/plugin")
// const colors = require("tailwindcss/colors")
// const spacing = require("tailwindcss/spacing")

module.exports = {
  purge: {
    content: ["./src/**/*.css", "./src/**/*.vue"],
    options: {
      safelist: {
        standard: [
          "bg-black",
          /^bg-yellow/,
          /^bg-green/,
          /^bg-blue/,
          /^bg-pink/,
          /^text-pink/,
          /^dark/,
          /^text-green/,
          /^text-yellow/,
        ],
      },
    },
  },
  darkMode: "class", // or 'media' or 'class'
  options: {
    important: true,
  },
  theme: {
    extend: {
      transitionProperty: {
        size: "height, width",
        text: "letter-spacing",
      },
      width: {
        half: "50vw",
      },
      minWidth: {
        "2": "8px",
      },
      borderWidth: {
        "1": "1px",
      },
      outline: theme => ({
        green: `2px solid ${theme("colors.green.300")}`,
        yellow: `2px solid ${theme("colors.yellow.600")}`,
        "black-solid": "2px solid black",
      }),
      margin: theme => ({
        "-1/2": "-50%",
        "-full": "-100%",
        "border-1": `calc(${theme("spacing.1")} - 1px)`,
      }),
    },
  },
  variants: {
    extend: {
      letterSpacing: ["hover"],
      outline: ["dark"],
      opacity: ["dark"],
      borderWidth: ["hover"],
    },
    scrollbar: ["rounded"],
  },
  plugins: [
    require("tailwind-scrollbar"),
    require("@tailwindcss/forms"),
    plugin(function({ addBase, addUtilities, theme }) {
      addBase({
        "input, select": {
          "border-color": `${theme("colors.gray.300")} !important`,
        },
        h1: {
          fontSize: theme("fontSize.2xl"),
          fontWeight: theme("fontWeight.extrabold"),
        },
        h2: {
          fontSize: theme("fontSize.xl"),
          fontWeight: theme("fontWeight.bold"),
        },
        h3: {
          fontSize: theme("fontSize.lg"),
          fontWeight: theme("fontWeight.semibold"),
        },
        h4: {
          fontSize: theme("fontSize.base"),
          fontWeight: theme("fontWeight.normal"),
        },
        h5: {
          fontSize: theme("fontSize.base"),
          fontWeight: theme("fontWeight.light"),
          fontStyle: "italic",
        },
        button: {
          padding: theme("spacing[2]"),
          fontWeight: theme("fontWeight.semibold"),
          borderRadius: theme("borderRadius.sm"),
        },
        "button:focus": {
          outline: "none",
        },
        "button:disabled": {
          color: theme("colors.gray.200"),
          cursor: theme("cursor[not-allowed]"),
        },
        "button:disabled:hover": {
          color: theme("colors.gray.200"),
          letterSpacing: "normal",
        },
      })
      addUtilities(
        {
          ".btn-red": {
            color: theme("colors.gray.50"),
            background: theme("colors.red.700"),
          },
          ".btn-red:hover": {
            background: theme("colors.red.500"),
          },
          ".btn-light": {
            background: theme("colors.green.600"),
            color: "white",
          },
          ".btn-light:hover:not(:disabled)": {
            background: theme("colors.green.400"),
          },
          ".btn-light:active": {
            background: theme("colors.green.800"),
          },
          ".btn-light:disabled": {
            color: theme("colors.green.300"),
            background: theme("colors.green.100"),
          },
          ".btn-light:disabled:hover": {
            color: theme("colors.green.300"),
          },
          ".btn-dark": {
            background: theme("colors.green.700"),
            color: theme("colors.gray.50"),
          },
          ".btn-dark:hover:not(:disabled)": {
            background: theme("colors.green.600"),
          },
          ".btn-dark:active": {
            outline: theme("outline.none"),
            background: theme("colors.green.600"),
          },
          ".btn-dark:disabled": {
            color: theme("colors.gray.800"),
            background: theme("colors.gray.600"),
          },
          ".btn-dark:disabled:hover": {
            color: theme("colors.gray.800"),
            background: theme("colors.gray.600"),
          },
          ".btn-dark-transparent:disabled:hover": {
            color: theme("colors.gray.800"),
          },
          ".btn-dark-transparent:disabled": {
            color: theme("colors.gray.800"),
          },
        },
        { variants: ["dark"] }
      )
    }),
  ],
}
